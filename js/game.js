/* global Matter */
import {
  SUBSTANCES,
  INITIAL_SUBSTANCE_IDS,
  REACTIONS,
  isTerminalSubstance,
  isNeutron,
  isPassthrough,
  findFission,
  NEUTRON_ID,
} from "./elements.js";
import { createPhysics, CANVAS_WIDTH, CANVAS_HEIGHT, DANGER_LINE_Y } from "./physics.js";
import { radiusFor, pointsFor, pickRandom, drawFormula } from "./utils.js";

const { World, Bodies, Body, Events, Runner } = Matter;

const OVER_LINE_GRACE_MS = 1500;
const TERMINAL_LIFETIME_MS = 3000; // 終端物質が反応しないまま画面に残っていられる時間
const VANISH_FADE_MS = 500; // 消滅までのフェードアウト時間
// すり抜け粒子(中性子・核分裂の破片)が画面内で止まっても必ず消えるための寿命。
// 通常は無重力で直進して画面外に出るが、他の玉に阻まれるなどで画面内に漂い続けた
// 場合の保険として、生成から一定時間経ったら画面外に出ていなくても消す。
const PASSTHROUGH_LIFETIME_MS = 4000;

export class Game {
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.callbacks = callbacks; // { onScoreChange(delta, total), onReaction(a, b, product, enthalpyKJ, points), onNextChange(substanceId), onGameOver(score) }

    this.score = 0;
    this.gameOver = false;
    this.pendingMerge = new Set();
    this.dropCooldown = false;

    const { engine, world } = createPhysics();
    this.engine = engine;
    this.world = world;
    this.runner = Runner.create();

    this.aimX = CANVAS_WIDTH / 2;
    this.currentDropId = pickRandom(INITIAL_SUBSTANCE_IDS);
    this.nextDropId = pickRandom(INITIAL_SUBSTANCE_IDS);

    this._setupCanvasResolution();
    this._bindEvents();
    this._notifyNext();
  }

  // devicePixelRatioに合わせてCanvasの実ピクセル数を上げ、表示をシャープにする。
  // 論理座標系(CANVAS_WIDTH x CANVAS_HEIGHT)は変えず、ctxをスケールするだけなので
  // 物理演算やヒットテストの座標計算には影響しない。
  _setupCanvasResolution() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.ctx.scale(dpr, dpr);
  }

  _bindEvents() {
    Events.on(this.engine, "collisionStart", (event) => this._handleCollision(event));
    // 物理更新の直前に、すり抜け粒子へ重力とちょうど逆向きの力を加えて相殺する。
    // これで中性子や核分裂の破片が放たれた向きにまっすぐ飛び続ける(飛散を表現)。
    Events.on(this.engine, "beforeUpdate", () => this._cancelPassthroughGravity());
    Events.on(this.engine, "afterUpdate", () => {
      this._removeStrayPassthrough();
      this._checkVanish();
      this._checkGameOver();
    });

    this.canvas.addEventListener("pointermove", (e) => this._onPointerMove(e));
    this.canvas.addEventListener("pointerdown", (e) => this._onPointerDown(e));
  }

  _canvasX(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    return (e.clientX - rect.left) * scaleX;
  }

  _onPointerMove(e) {
    if (this.gameOver) return;
    this.aimX = this._clampAimX(this._canvasX(e));
  }

  _onPointerDown(e) {
    if (this.gameOver) return;
    this.aimX = this._clampAimX(this._canvasX(e));
    if (!this.dropCooldown) {
      this._dropCurrent();
    }
  }

  _clampAimX(x) {
    const r = radiusFor(SUBSTANCES[this.currentDropId].molarMass);
    return Math.min(CANVAS_WIDTH - r, Math.max(r, x));
  }

  _dropCurrent() {
    const substanceId = this.currentDropId;
    const r = radiusFor(SUBSTANCES[substanceId].molarMass);
    const body = this._spawnBody(substanceId, this.aimX, r + 2, { restitution: 0.15, friction: 0.4 });
    // 中性子は無重力ですり抜けるので、ドロップ時に下向きの初速を与えて発射する。
    if (isNeutron(substanceId)) {
      Body.setVelocity(body, { x: 0, y: 8 });
    }

    this.dropCooldown = true;
    setTimeout(() => {
      this.dropCooldown = false;
    }, 400);

    this.currentDropId = this.nextDropId;
    this.nextDropId = pickRandom(INITIAL_SUBSTANCE_IDS);
    this._notifyNext();
  }

  _notifyNext() {
    this.callbacks.onNextChange(this.nextDropId);
  }

  _spawnBody(substanceId, x, y, extraOptions = {}) {
    const substance = SUBSTANCES[substanceId];
    const passthrough = isPassthrough(substanceId);
    const r = radiusFor(substance.molarMass);
    const body = Bodies.circle(x, y, r, {
      restitution: 0.15,
      friction: 0.5,
      frictionAir: 0.001,
      label: `${substanceId}:${cryptoRandomId()}`,
      // 中性子や核分裂の破片(Y・I)は他の物質を「すり抜ける」。センサーにすると
      // 衝突イベントは発火するが物理的な反発は起きないので、当たっても他の玉を
      // 弾かない。空気抵抗と重力も切って、放たれた向きにまっすぐ飛び続けさせる。
      ...(passthrough ? { isSensor: true, frictionAir: 0 } : {}),
      ...extraOptions,
    });
    const terminal = !passthrough && isTerminalSubstance(substanceId);
    body.plugin.molecule = {
      substanceId,
      radius: r,
      passthrough,
      overLineSince: null,
      // すり抜ける粒子は基本的に画面外に出たら消えるが、画面内で止まった場合の
      // 保険として生成時刻を記録し、一定時間経過でも消せるようにする。
      spawnedAt: passthrough ? Date.now() : null,
      // すり抜ける粒子は時間ではなく画面外に出たら消える(残らず通り抜ける)。
      vanishAt: terminal ? Date.now() + TERMINAL_LIFETIME_MS : null,
    };
    World.add(this.world, body);
    return body;
  }

  _handleCollision(event) {
    for (const pair of event.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      if (!a.plugin.molecule || !b.plugin.molecule) continue;
      if (this.pendingMerge.has(a.id) || this.pendingMerge.has(b.id)) continue;

      // まず中性子による核分裂を判定する(中性子はすり抜けるので通常反応より優先)。
      if (this._tryFission(a, b)) continue;

      // 衝突した2体を核として、接触している近くの物質まで含めたクラスタから
      // マッチするレシピ(3体反応など)を探す。より多くの物質を消費するレシピを
      // 優先し、なければ2体反応にフォールバックする。
      const match = this._findClusterReaction(a, b);
      if (!match) continue;

      for (const body of match.bodies) this.pendingMerge.add(body.id);
      this._mergeBodies(match.bodies, match.reaction);
    }
  }

  // a・bを核に、接触中の物質を集めてマッチする反応を探す。
  // 見つかれば { bodies:[反応に使う物体...], reaction } を返す。なければ null。
  _findClusterReaction(a, b) {
    // 核の2体に、a・bそれぞれに接触している他の物質を加えて候補プールを作る。
    const pool = [a, b];
    const seen = new Set([a.id, b.id]);
    for (const core of [a, b]) {
      for (const other of this._contactBodies(core)) {
        if (seen.has(other.id) || this.pendingMerge.has(other.id)) continue;
        seen.add(other.id);
        pool.push(other);
      }
    }

    // 物質IDごとに、プール内の物体をまとめておく(必要個数だけ取り出すため)。
    const byId = new Map();
    for (const body of pool) {
      const id = body.plugin.molecule.substanceId;
      if (!byId.has(id)) byId.set(id, []);
      byId.get(id).push(body);
    }

    // REACTIONS は size 降順なので、消費数が多い(=難しい)反応から順に当てていく。
    // 核のa・bを必ず含むレシピだけを採用する(衝突した2体が関与しない反応は起こさない)。
    for (const reaction of REACTIONS) {
      const bodies = this._collectReactants(reaction, byId, a, b);
      if (bodies) return { bodies, reaction };
    }
    return null;
  }

  // reaction が要求する反応物(counts)を byId から集められれば、その物体配列を返す。
  // 集めた物体には核 a・b が必ず含まれていなければならない(なければ null)。
  _collectReactants(reaction, byId, a, b) {
    const bodies = [];
    for (const [id, need] of reaction.counts) {
      const available = byId.get(id);
      if (!available || available.length < need) return null;
      // a・bが候補にあれば優先的に選び、核が確実に反応へ加わるようにする。
      const sorted = [...available].sort((x, y) => {
        const xCore = x === a || x === b ? 0 : 1;
        const yCore = y === a || y === b ? 0 : 1;
        return xCore - yCore;
      });
      for (let i = 0; i < need; i++) bodies.push(sorted[i]);
    }
    if (!bodies.includes(a) || !bodies.includes(b)) return null;
    return bodies;
  }

  // core に物理的に接触している(=Matter.jsのペアが存在する)物体を列挙する。
  _contactBodies(core) {
    const result = [];
    for (const pair of this.engine.pairs.list) {
      if (!pair.isActive) continue;
      let other = null;
      if (pair.bodyA === core) other = pair.bodyB;
      else if (pair.bodyB === core) other = pair.bodyA;
      else continue;
      if (other.plugin.molecule) result.push(other);
    }
    return result;
  }

  // a・bのどちらかが中性子で、もう片方が核分裂する物質なら核分裂を起こす。
  // 起こしたら true を返す。
  _tryFission(a, b) {
    let neutronBody = null;
    let targetBody = null;
    if (isNeutron(a.plugin.molecule.substanceId)) {
      neutronBody = a;
      targetBody = b;
    } else if (isNeutron(b.plugin.molecule.substanceId)) {
      neutronBody = b;
      targetBody = a;
    } else {
      return false;
    }
    // 中性子同士がぶつかっても何も起きない。
    if (isNeutron(targetBody.plugin.molecule.substanceId)) return false;

    const fission = findFission(targetBody.plugin.molecule.substanceId);
    if (!fission) return false;

    this.pendingMerge.add(neutronBody.id);
    this.pendingMerge.add(targetBody.id);
    this._fission(neutronBody, targetBody, fission);
    return true;
  }

  // 核分裂: 中性子とターゲット(ウランなど)を消し、破片核種(すり抜け粒子)を
  // 生成して飛ばし、指定個数の中性子をランダムな方向へ射出する。
  _fission(neutronBody, targetBody, fission) {
    const x = targetBody.position.x;
    const y = targetBody.position.y;

    World.remove(this.world, [neutronBody, targetBody]);
    this.pendingMerge.delete(neutronBody.id);
    this.pendingMerge.delete(targetBody.id);

    // 破片核種を生成し、ランダムな基準方向を中心に等間隔で飛び散らせる。
    // 破片もすり抜け粒子なので、無重力のまま画面外まで直進して消える。
    const baseAngle = Math.random() * Math.PI * 2;
    const fragmentSpeed = 5;
    fission.fragments.forEach((fragmentId, i) => {
      const angle = baseAngle + (Math.PI * 2 * i) / fission.fragments.length;
      const spread = 12;
      const body = this._spawnBody(
        fragmentId,
        x + Math.cos(angle) * spread,
        y + Math.sin(angle) * spread,
        { restitution: 0.15, friction: 0.4 }
      );
      Body.setVelocity(body, { x: Math.cos(angle) * fragmentSpeed, y: Math.sin(angle) * fragmentSpeed });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
    });

    // 中性子をランダムな方向へ射出する。
    this._emitNeutrons(x, y, fission.neutrons);

    const pts = pointsFor(fission.energyKJ);
    this._addScore(pts);
    // 核分裂は生成物が複数あり通常の反応(2物質→1物質)とは形が違うので、
    // 専用コールバックで通知する。fragments と放出中性子数をそのまま渡す。
    this.callbacks.onFission(
      targetBody.plugin.molecule.substanceId,
      NEUTRON_ID,
      fission.fragments,
      fission.neutrons,
      fission.energyKJ,
      pts
    );
  }

  // (x, y) から count 個の中性子をランダムな方向へ飛ばす。
  _emitNeutrons(x, y, count) {
    const nr = radiusFor(SUBSTANCES[NEUTRON_ID].molarMass);
    const speed = 6;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // ターゲットの中心から少し離した位置に出して、生成直後の自己衝突を避ける。
      const body = this._spawnBody(
        NEUTRON_ID,
        x + Math.cos(angle) * (nr + 4),
        y + Math.sin(angle) * (nr + 4)
      );
      Body.setVelocity(body, { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed });
    }
  }

  // 反応物(bodies)を消し、生成物(reaction.products)を反応位置に生成する。
  // 反応物・生成物ともに個数可変(N体反応・複数生成物)に対応する。
  _mergeBodies(bodies, reaction) {
    const reactantIds = bodies.map((body) => body.plugin.molecule.substanceId);
    // 反応物の重心を生成位置の基準にする。
    const midX = bodies.reduce((sum, body) => sum + body.position.x, 0) / bodies.length;
    const midY = bodies.reduce((sum, body) => sum + body.position.y, 0) / bodies.length;

    World.remove(this.world, bodies);
    for (const body of bodies) this.pendingMerge.delete(body.id);

    // 生成物が複数あるときは重心の周りに少しずつ位置をずらして重なりを避ける。
    const products = reaction.products;
    products.forEach((productId, i) => {
      const angle = products.length > 1 ? (Math.PI * 2 * i) / products.length : 0;
      const spread = products.length > 1 ? 14 : 0;
      const newBody = this._spawnBody(
        productId,
        midX + Math.cos(angle) * spread,
        midY + Math.sin(angle) * spread,
        { restitution: 0.15, friction: 0.4 }
      );
      // 生成物は互いに少し離れる向きへ、全体としては上向きに跳ねる初速を与える。
      Body.setVelocity(newBody, {
        x: Math.cos(angle) * 1.5 + (Math.random() - 0.5) * 1.5,
        y: Math.sin(angle) * 1.5 - 1,
      });
      Body.setAngularVelocity(newBody, (Math.random() - 0.5) * 0.05);
    });

    const pts = pointsFor(reaction.enthalpyKJ);
    this._addScore(pts);
    this.callbacks.onReaction(reactantIds, products, reaction.enthalpyKJ, pts);
  }

  _addScore(delta) {
    this.score += delta;
    this.callbacks.onScoreChange(delta, this.score);
  }

  // すり抜ける粒子(中性子・核分裂の破片)に重力とちょうど逆向きの力を加えて
  // 重力を打ち消す。Matter.jsは物理更新時に force.y += mass * gravity.y * gravity.scale
  // を加えるので、同じ大きさの上向きの力を事前に積めば実質的に無重力になる。
  _cancelPassthroughGravity() {
    const g = this.engine.gravity;
    for (const body of this.world.bodies) {
      const molecule = body.plugin.molecule;
      if (!molecule || !molecule.passthrough) continue;
      body.force.y -= body.mass * g.y * g.scale;
    }
  }

  // 画面外に出たすり抜け粒子を消す(残らず通り抜ける)。画面内で止まってしまった
  // 粒子も、生成から PASSTHROUGH_LIFETIME_MS 経てば保険として消す。
  _removeStrayPassthrough() {
    const margin = 60;
    const now = Date.now();
    for (const body of this.world.bodies) {
      const molecule = body.plugin.molecule;
      if (!molecule || !molecule.passthrough) continue;
      const { x, y } = body.position;
      const offscreen =
        x < -margin ||
        x > CANVAS_WIDTH + margin ||
        y < -margin ||
        y > CANVAS_HEIGHT + margin;
      const expired =
        molecule.spawnedAt != null && now - molecule.spawnedAt > PASSTHROUGH_LIFETIME_MS;
      if (offscreen || expired) {
        World.remove(this.world, body);
      }
    }
  }

  // 終端物質(これ以上反応しない物質)を、一定時間経過後にフェードアウトさせて消滅させる。
  // 放置して消しても加点はしない(反応で消すことを促すため、放置プレイに報酬を与えない)。
  _checkVanish() {
    const now = Date.now();
    const bodies = this.world.bodies.filter(
      (b) => b.plugin.molecule && b.plugin.molecule.vanishAt != null
    );

    for (const body of bodies) {
      if (this.pendingMerge.has(body.id)) continue;
      if (now >= body.plugin.molecule.vanishAt) {
        World.remove(this.world, body);
      }
    }
  }

  _checkGameOver() {
    if (this.gameOver) return;
    const now = Date.now();
    const bodies = this.world.bodies.filter((b) => b.plugin.molecule);
    let overLine = false;

    for (const body of bodies) {
      const molecule = body.plugin.molecule;
      // すり抜けて消える一時的な粒子(中性子・核分裂の破片)はゲームオーバー判定から除外する。
      if (molecule.passthrough) continue;
      const speed = Body.getSpeed(body);
      const isResting = speed < 0.5;
      const top = body.position.y - molecule.radius;

      if (isResting && top < DANGER_LINE_Y) {
        if (molecule.overLineSince == null) {
          molecule.overLineSince = now;
        } else if (now - molecule.overLineSince > OVER_LINE_GRACE_MS) {
          overLine = true;
        }
      } else {
        molecule.overLineSince = null;
      }
    }

    if (overLine) {
      this._endGame();
    }
  }

  _endGame() {
    this.gameOver = true;
    Runner.stop(this.runner);
    this.callbacks.onGameOver(this.score);
  }

  start() {
    Runner.run(this.runner, this.engine);
    this._renderLoop();
  }

  _renderLoop() {
    this._draw();
    if (!this.gameOver) {
      requestAnimationFrame(() => this._renderLoop());
    }
  }

  _draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 危険ライン
    ctx.save();
    ctx.strokeStyle = "#ef5350";
    ctx.setLineDash([8, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, DANGER_LINE_Y);
    ctx.lineTo(CANVAS_WIDTH, DANGER_LINE_Y);
    ctx.stroke();
    ctx.restore();

    // 玉
    for (const body of this.world.bodies) {
      if (!body.plugin.molecule) continue;
      this._drawBody(body);
    }

    // 狙い位置ガイド(発射前)
    if (!this.gameOver) {
      const r = radiusFor(SUBSTANCES[this.currentDropId].molarMass);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = "#ffffff";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(this.aimX, 0);
      ctx.lineTo(this.aimX, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();
      this._drawCircle(this.aimX, r + 2, r, this.currentDropId, 0.85);
    }
  }

  _drawBody(body) {
    const { substanceId, radius, vanishAt } = body.plugin.molecule;
    let alpha = 1;
    if (vanishAt != null) {
      const remaining = vanishAt - Date.now();
      if (remaining < VANISH_FADE_MS) {
        alpha = Math.max(0, remaining / VANISH_FADE_MS);
      }
    }
    this._drawCircle(body.position.x, body.position.y, radius, substanceId, alpha, body.angle);
  }

  _drawCircle(x, y, r, substanceId, alpha = 1, rotation = 0) {
    const ctx = this.ctx;
    const substance = SUBSTANCES[substanceId];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fillStyle = substance.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.stroke();

    ctx.fillStyle = "#10131a";
    drawFormula(ctx, substance.formula, 0, 0, Math.max(14, r * 0.52));

    ctx.restore();
  }

  destroy() {
    Runner.stop(this.runner);
  }
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9);
}
