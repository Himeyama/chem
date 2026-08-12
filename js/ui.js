/* global katex */
import { SUBSTANCES } from "./elements.js";
import { radiusFor, formulaToTeX, drawFormula } from "./utils.js";

const HIGHSCORE_KEY = "chem-suika-highscore";
const MAX_LOG_ENTRIES = 30;

export function getHighscore() {
  return Number(localStorage.getItem(HIGHSCORE_KEY) || "0");
}

export function setHighscore(value) {
  localStorage.setItem(HIGHSCORE_KEY, String(value));
}

export class UI {
  constructor() {
    this.scoreEl = document.getElementById("score");
    this.highscoreEl = document.getElementById("highscore");
    this.nextCanvas = document.getElementById("nextCanvas");
    this.nextCtx = this.nextCanvas.getContext("2d");
    this.nextNameEl = document.getElementById("nextName");
    this.nextFactEl = document.getElementById("nextFact");
    this.popupEl = document.getElementById("reactionPopup");
    this.logEl = document.getElementById("reactionLog");
    this.modalEl = document.getElementById("gameOverModal");
    this.finalScoreEl = document.getElementById("finalScore");
    this.finalHighscoreEl = document.getElementById("finalHighscore");
    this.retryButton = document.getElementById("retryButton");

    this.popupTimer = null;
    this.highscoreEl.textContent = getHighscore();
  }

  updateScore(total) {
    this.scoreEl.textContent = total;
  }

  flashScore(delta) {
    this.scoreEl.classList.remove("pop", "penalty");
    void this.scoreEl.offsetWidth; // reflow でアニメーションを再トリガー
    this.scoreEl.classList.add("pop");
    if (delta < 0) this.scoreEl.classList.add("penalty");
  }

  // 衝突で反応が起きたとき、ゲーム画面中央にTeX形式の反応式とエネルギー量を表示する。
  showReactionPopup(substanceIdA, substanceIdB, productId, enthalpyKJ, points) {
    clearTimeout(this.popupTimer);

    const tex = [substanceIdA, substanceIdB, productId]
      .map((id) => formulaToTeX(SUBSTANCES[id].formula));
    const equation = `${tex[0]} + ${tex[1]} \\rightarrow ${tex[2]}`;
    const verb = enthalpyKJ >= 0 ? "放出" : "吸収";
    const sign = points >= 0 ? "+" : "";

    this.popupEl.innerHTML = "";
    const equationEl = document.createElement("div");
    equationEl.className = "popup-equation";
    katex.render(equation, equationEl, { throwOnError: false });

    const energyEl = document.createElement("div");
    energyEl.className = "popup-energy";
    energyEl.textContent = `${Math.abs(enthalpyKJ)} kJ/mol ${verb}　${sign}${points}pt`;

    this.popupEl.appendChild(equationEl);
    this.popupEl.appendChild(energyEl);

    const product = SUBSTANCES[productId];
    if (product.fact) {
      const factEl = document.createElement("div");
      factEl.className = "popup-fact";
      factEl.textContent = product.fact;
      this.popupEl.appendChild(factEl);
    }

    this.popupEl.classList.add("show");
    this.popupTimer = setTimeout(() => {
      this.popupEl.classList.remove("show");
    }, 4200);
  }

  // 反応式をTeX整形して反応ログの先頭に積み上げる。
  addReactionLog(substanceIdA, substanceIdB, productId) {
    const tex = [substanceIdA, substanceIdB, productId]
      .map((id) => formulaToTeX(SUBSTANCES[id].formula));
    const equation = `${tex[0]} + ${tex[1]} \\rightarrow ${tex[2]}`;

    const entry = document.createElement("div");
    entry.className = "log-entry";
    katex.render(equation, entry, { throwOnError: false });

    this.logEl.insertBefore(entry, this.logEl.firstChild);
    while (this.logEl.children.length > MAX_LOG_ENTRIES) {
      this.logEl.removeChild(this.logEl.lastChild);
    }
  }

  // 大きな数を「1.93×10¹⁰」のような指数表記の文字列にする。
  // 1万未満はそのまま整数で返す(化学反応レベルの値まで壊さないため)。
  _formatBigNumber(value) {
    const abs = Math.abs(value);
    if (abs < 10000) return String(Math.round(value));
    const exp = Math.floor(Math.log10(abs));
    const mantissa = value / Math.pow(10, exp);
    const superscript = String(exp)
      .split("")
      .map((ch) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(ch)] ?? ch)
      .join("");
    // 仮数は小数第2位まで(例: 1.93)。末尾の余分な0は落とす。
    const mantissaStr = mantissa.toFixed(2).replace(/\.?0+$/, "");
    return `${mantissaStr}×10${superscript}`;
  }

  // 核分裂の反応式TeXを組み立てる。例: U + n → Y + I + 2n
  _fissionEquationTeX(targetId, neutronId, fragmentIds, neutronCount) {
    const left = `${formulaToTeX(SUBSTANCES[targetId].formula)} + ${formulaToTeX(
      SUBSTANCES[neutronId].formula
    )}`;
    const products = fragmentIds.map((id) => formulaToTeX(SUBSTANCES[id].formula));
    // 放出中性子は係数付きで表示(2個なら 2n)。
    const neutronTeX = formulaToTeX(SUBSTANCES[neutronId].formula);
    products.push(neutronCount > 1 ? `${neutronCount}${neutronTeX}` : neutronTeX);
    return `${left} \\rightarrow ${products.join(" + ")}`;
  }

  // 核分裂が起きたときのポップアップ表示。
  showFissionPopup(targetId, neutronId, fragmentIds, neutronCount, energyKJ, points) {
    clearTimeout(this.popupTimer);
    const equation = this._fissionEquationTeX(targetId, neutronId, fragmentIds, neutronCount);
    const verb = energyKJ >= 0 ? "放出" : "吸収";
    const sign = points >= 0 ? "+" : "";

    this.popupEl.innerHTML = "";
    const equationEl = document.createElement("div");
    equationEl.className = "popup-equation";
    katex.render(equation, equationEl, { throwOnError: false });

    const energyEl = document.createElement("div");
    energyEl.className = "popup-energy";
    const energyStr = this._formatBigNumber(Math.abs(energyKJ));
    const pointsStr = this._formatBigNumber(points);
    energyEl.textContent = `${energyStr} kJ/mol ${verb}　${sign}${pointsStr}pt`;

    this.popupEl.appendChild(equationEl);
    this.popupEl.appendChild(energyEl);

    const factEl = document.createElement("div");
    factEl.className = "popup-fact";
    factEl.textContent = "核分裂だ！化学反応の約1億倍もの莫大なエネルギーが出るよ";
    this.popupEl.appendChild(factEl);

    this.popupEl.classList.add("show");
    this.popupTimer = setTimeout(() => {
      this.popupEl.classList.remove("show");
    }, 4200);
  }

  // 核分裂の反応式を反応ログの先頭に積み上げる。
  addFissionLog(targetId, neutronId, fragmentIds, neutronCount) {
    const equation = this._fissionEquationTeX(targetId, neutronId, fragmentIds, neutronCount);
    const entry = document.createElement("div");
    entry.className = "log-entry";
    katex.render(equation, entry, { throwOnError: false });
    this.logEl.insertBefore(entry, this.logEl.firstChild);
    while (this.logEl.children.length > MAX_LOG_ENTRIES) {
      this.logEl.removeChild(this.logEl.lastChild);
    }
  }

  clearReactionLog() {
    this.logEl.innerHTML = "";
  }

  updateNext(substanceId) {
    const substance = SUBSTANCES[substanceId];
    const ctx = this.nextCtx;
    ctx.clearRect(0, 0, 100, 100);
    const r = Math.min(38, radiusFor(substance.molarMass));
    ctx.beginPath();
    ctx.arc(50, 50, r, 0, Math.PI * 2);
    ctx.fillStyle = substance.color;
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#10131a";
    drawFormula(ctx, substance.formula, 50, 50, Math.max(14, r * 0.52));
    this.nextNameEl.textContent = substance.name;
    this.nextFactEl.textContent = substance.fact ?? "";
  }

  showGameOver(score) {
    const best = Math.max(score, getHighscore());
    setHighscore(best);
    this.finalScoreEl.textContent = score;
    this.finalHighscoreEl.textContent = best;
    this.highscoreEl.textContent = best;
    this.modalEl.classList.remove("hidden");
  }

  hideGameOver() {
    this.modalEl.classList.add("hidden");
  }
}
