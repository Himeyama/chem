/* global Matter */
import { SUBSTANCES, INITIAL_SUBSTANCE_IDS, findReaction, isTerminalSubstance } from "./elements.js";
import { createPhysics, CANVAS_WIDTH, CANVAS_HEIGHT, DANGER_LINE_Y } from "./physics.js";
import { radiusFor, pointsFor, pickRandom, drawFormula } from "./utils.js";

const { World, Bodies, Body, Events, Runner } = Matter;

const OVER_LINE_GRACE_MS = 1500;
const TERMINAL_LIFETIME_MS = 3000; // 終端物質が反応しないまま画面に残っていられる時間
const VANISH_FADE_MS = 500; // 消滅までのフェードアウト時間
const VANISH_BONUS = 30;

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
    Events.on(this.engine, "afterUpdate", () => {
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
    this._spawnBody(substanceId, this.aimX, r + 2, { restitution: 0.15, friction: 0.4 });

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
    const r = radiusFor(substance.molarMass);
    const body = Bodies.circle(x, y, r, {
      restitution: 0.15,
      friction: 0.5,
      frictionAir: 0.001,
      label: `${substanceId}:${cryptoRandomId()}`,
      ...extraOptions,
    });
    const terminal = isTerminalSubstance(substanceId);
    body.plugin.molecule = {
      substanceId,
      radius: r,
      overLineSince: null,
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

      const reaction = findReaction(a.plugin.molecule.substanceId, b.plugin.molecule.substanceId);
      if (!reaction) continue;

      this.pendingMerge.add(a.id);
      this.pendingMerge.add(b.id);
      this._mergeBodies(a, b, reaction);
    }
  }

  _mergeBodies(a, b, reaction) {
    const substanceIdA = a.plugin.molecule.substanceId;
    const substanceIdB = b.plugin.molecule.substanceId;
    const midX = (a.position.x + b.position.x) / 2;
    const midY = (a.position.y + b.position.y) / 2;

    World.remove(this.world, [a, b]);
    this.pendingMerge.delete(a.id);
    this.pendingMerge.delete(b.id);

    const newBody = this._spawnBody(reaction.product, midX, midY, {
      restitution: 0.15,
      friction: 0.4,
    });
    Body.setVelocity(newBody, { x: (Math.random() - 0.5) * 1.5, y: -1 });
    Body.setAngularVelocity(newBody, (Math.random() - 0.5) * 0.05);

    const pts = pointsFor(reaction.enthalpyKJ);
    this._addScore(pts);
    this.callbacks.onReaction(substanceIdA, substanceIdB, reaction.product, reaction.enthalpyKJ, pts);
  }

  _addScore(delta) {
    this.score += delta;
    this.callbacks.onScoreChange(delta, this.score);
  }

  // 終端物質(これ以上反応しない物質)を、一定時間経過後にフェードアウトさせて消滅させる。
  _checkVanish() {
    const now = Date.now();
    const bodies = this.world.bodies.filter(
      (b) => b.plugin.molecule && b.plugin.molecule.vanishAt != null
    );

    for (const body of bodies) {
      if (this.pendingMerge.has(body.id)) continue;
      if (now >= body.plugin.molecule.vanishAt) {
        World.remove(this.world, body);
        this._addScore(VANISH_BONUS);
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
