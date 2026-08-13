// 半径・スコア変換などの共通関数。
// 半径は sqrt(分子量) に比例させることで、面積(πr^2)が分子量に比例するようにする。
const RADIUS_SCALE = 8.5;
const MIN_RADIUS = 22;

export function radiusFor(molarMass) {
  return Math.max(MIN_RADIUS, RADIUS_SCALE * Math.sqrt(molarMass));
}

// 反応エネルギー[kJ/mol] を得点に変換する。1 kJ = 1000 ポイント。
// 発熱(正の値)は加点、吸熱(負の値)は減点になる。
export function pointsFor(enthalpyKJ) {
  return Math.round(enthalpyKJ * 1000);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 色の明度を段階に応じて変化させる(段階が進むほど暗くする)。
export function shadeColor(hex, percent) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `rgb(${r}, ${g}, ${b})`;
}

// Unicode上付き数字(²³⁵など)を通常の数字に戻す対応表。
const SUPERSCRIPT_DIGITS = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

// 化学式の数字を下付き文字に変換し、KaTeXでレンダリングできるTeX文字列にする。
// 例: "H2O" -> "\\mathrm{H_{2}O}"
// 質量数などのUnicode上付き数字(例: "²³⁵U")は前置の上付き "^{235}" に変換する。
export function formulaToTeX(formula) {
  // 先頭の連続したUnicode上付き数字を質量数とみなし、TeXの上付きに変換する。
  let tex = formula.replace(/^([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/, (_, sup) => {
    const digits = [...sup].map((ch) => SUPERSCRIPT_DIGITS[ch]).join("");
    return `^{${digits}}`;
  });
  // 通常の数字は下付きにする。
  tex = tex.replace(/(\d+)/g, "_{$1}");
  return `\\mathrm{${tex}}`;
}

// ラテン文字は従来どおり Georgia などの欧文セリフで描画し、王水のような日本語を
// 含む物質名は Noto Serif JP にフォールバックさせる。Georgia は日本語グリフを持たない
// ため、ファミリー末尾に Noto Serif JP を加えるだけで漢字だけがこのフォントで描かれる。
const FORMULA_FONT_FAMILY = "Georgia, 'Times New Roman', 'Noto Serif JP', serif";

// 化学式文字列を「文字」と「数字(下付き)」のトークンに分割する。
// 例: "Ca(OH)2" -> [{text:"Ca(OH)", sub:false}, {text:"2", sub:true}]
function tokenizeFormula(formula) {
  const tokens = [];
  const re = /(\d+)|([^\d]+)/g;
  let match;
  while ((match = re.exec(formula)) !== null) {
    if (match[1]) {
      tokens.push({ text: match[1], sub: true });
    } else {
      tokens.push({ text: match[2], sub: false });
    }
  }
  return tokens;
}

// 化学式をCanvasに描画する。数字は下付き文字として右下に小さく表示する。
// fontSize は通常文字の基準フォントサイズ(px)。(x, y) は文字列全体の中心座標。
export function drawFormula(ctx, formula, x, y, fontSize) {
  const subFontSize = fontSize * 0.68;
  const subOffsetY = fontSize * 0.22;
  const tokens = tokenizeFormula(formula);

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  // 全体の幅を測って中央揃えできるようにする。
  let totalWidth = 0;
  for (const token of tokens) {
    ctx.font = `bold ${token.sub ? subFontSize : fontSize}px ${FORMULA_FONT_FAMILY}`;
    totalWidth += ctx.measureText(token.text).width;
  }

  let cursorX = x - totalWidth / 2;
  const baselineY = y + fontSize * 0.35;

  for (const token of tokens) {
    const size = token.sub ? subFontSize : fontSize;
    ctx.font = `bold ${size}px ${FORMULA_FONT_FAMILY}`;
    ctx.fillText(token.text, cursorX, token.sub ? baselineY + subOffsetY : baselineY);
    cursorX += ctx.measureText(token.text).width;
  }

  ctx.restore();
}
