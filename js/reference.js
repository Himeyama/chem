/* global katex */
// 「遊び方」フッターの折り畳みに入れる、反応式一覧と物質・反応の解説を生成する。
// 反応データは elements.js を唯一の出典とし(RECIPE_LIST・FISSION_TARGETS など)、
// ここでは表示用にカテゴリ分けし、各カテゴリに解説文を添えて KaTeX で描画する。
// 折り畳みは1つにまとめ、「反応式一覧」と「解説」を同じ場所で見せる。

import {
  SUBSTANCES,
  RECIPE_LIST,
  FISSION_TARGETS,
  NEUTRON_CAPTURE,
  DECAYS,
  NEUTRON_ID,
} from "./elements.js";
import { formulaToTeX } from "./utils.js";

// 物質IDの配列を「2NaF」のように係数付きの項の並びにまとめてTeX化する。
// 同じ物質が連続していなくても登場順を保ち、個数を係数にまとめる。
function termsToTeX(ids) {
  const counts = new Map();
  const order = [];
  for (const id of ids) {
    if (!counts.has(id)) order.push(id);
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return order
    .map((id) => {
      const n = counts.get(id);
      const tex = formulaToTeX(SUBSTANCES[id].formula);
      return n > 1 ? `${n}${tex}` : tex;
    })
    .join(" + ");
}

function equationTeX(reactantIds, productIds) {
  return `${termsToTeX(reactantIds)} \\rightarrow ${termsToTeX(productIds)}`;
}

// 反応式一覧のカテゴリ分け。各カテゴリは
//   title: 見出し
//   intro: そのグループの物質・反応の解説文
//   match: RECIPE_LIST の各反応がこのカテゴリに属するかの述語
// で構成する。RECIPE_LIST のインデックス範囲ではなく述語で振り分けることで、
// レシピの並び替えや追加があっても壊れにくくする。
const REACTION_CATEGORIES = [
  {
    title: "燃焼・酸化（酸素との反応）",
    intro:
      "炭素や金属が酸素と結びつくのが燃焼・酸化だよ。炭素は酸素が足りないと有毒な一酸化炭素になり、たっぷりあると二酸化炭素まで燃えきる。オゾンの生成だけは熱を吸う吸熱反応なんだ。",
    match: (r) =>
      r.reactants.includes("O2") &&
      ["O3", "CO", "CO2", "CaO", "ZnO"].some((id) => r.products.includes(id)),
  },
  {
    title: "水・水素・ハロゲン化水素",
    intro:
      "水素はハロゲン（塩素やフッ素）や酸素と結びついて、水や塩化水素・フッ化水素・過酸化水素になるよ。塩化水素は水に溶けると胃液と同じ塩酸になるんだ。",
    match: (r) =>
      ["H2O", "H2O2", "HCl", "HF"].some((id) => r.products.includes(id)) &&
      !r.products.includes("Ca(OH)2") &&
      !["Zn", "Fe", "Cu", "Ag", "Na", "Ca", "Au", "AgNO3"].some((id) =>
        r.reactants.includes(id)
      ),
  },
  {
    title: "ナトリウム・カルシウムの化合物",
    intro:
      "ナトリウムやカルシウムはハロゲンと結びついて塩になるよ。2Na + Cl₂ → 2NaCl は毎日の食卓の塩そのもの。生石灰（CaO）に水を注ぐと消石灰になり、熱を出すんだ。",
    match: (r) =>
      ["NaF", "NaCl", "CaF2", "CaCl2", "Ca(OH)2"].some((id) =>
        r.products.includes(id)
      ) && !r.reactants.includes("HCl"),
  },
  {
    // 金属を酸に溶かす反応は副生成物として SO₂ や NO を出すため、
    // 硫黄・窒素・強酸カテゴリより先に判定して先取りする（順序が重要）。
    title: "金属を酸に溶かす（イオン化傾向）",
    intro:
      "金属には溶けやすさの順番（イオン化傾向）があるよ。水素より溶けやすいナトリウム・カルシウム・亜鉛・鉄は塩酸・硫酸・硝酸のどれにでも溶けて水素を出すけど、銅・銀の貴金属は酸化力のある硝酸でないと溶けない。金だけはどんな単一の酸にも溶けず、王水（濃硝酸＋濃塩酸）が必要なんだ。王水は金専用というわけではなく、亜鉛・鉄・銅も溶かせるよ。",
    match: (r) =>
      (["Zn", "Fe", "Cu", "Ag", "Au", "Na", "Ca"].some((id) =>
        r.reactants.includes(id)
      ) &&
        ["H2SO4", "HNO3", "HCl", "王水", "Cl2"].some((id) =>
          r.reactants.includes(id)
        )) ||
      r.reactants.includes("AgNO3"),
  },
  {
    title: "硫黄とその化合物",
    intro:
      "硫黄は S₂ どうしがくっついて S₄・S₆・S₈ と大きな環状分子に育つよ。燃やすと二酸化硫黄になり、これは酸性雨のもとにもなる気体。水素と結びつくと、温泉のにおいのもと・硫化水素になるんだ。",
    match: (r) =>
      ["S4", "S6", "S8", "CS2", "SO2", "H2S"].some((id) =>
        r.products.includes(id)
      ) && !r.products.includes("SO3"),
  },
  {
    title: "窒素の化合物（アンモニア・窒素酸化物）",
    intro:
      "空気中の窒素と水素からアンモニアを作るのがハーバー・ボッシュ法。肥料づくりに欠かせず、世界の食料を支える大発明だよ。窒素酸化物（NO・NO₂）は排気ガスやスモッグの原因にもなる。",
    match: (r) => ["NH3", "NO", "NO2"].some((id) => r.products.includes(id)),
  },
  {
    title: "有機化合物（アセチレン・ベンゼン・酢酸）",
    intro:
      "炭素と水素からアセチレンができ、それが3つ集まると芳香族の代表ベンゼンになるよ。アセチレンを水と結びつけて酸化すると、お酢のすっぱさのもと・酢酸ができるんだ。",
    match: (r) =>
      ["C2H2", "C6H6", "CH3CHO", "CH3COOH"].some((id) =>
        r.products.includes(id)
      ),
  },
  {
    title: "強い酸をつくる（接触法・オストワルト法・王水）",
    intro:
      "二酸化硫黄を酸化して水と反応させると硫酸（接触法）、二酸化窒素を水に溶かすと硝酸（オストワルト法）ができるよ。濃硝酸と濃塩酸を混ぜると、金さえ溶かす最強の酸・王水になるんだ。",
    match: (r) =>
      ["SO3", "H2SO4", "HNO3", "王水"].some((id) => r.products.includes(id)) &&
      !["Zn", "Fe", "Cu", "Ag", "Au", "Na", "Ca", "AgNO3"].some((id) =>
        r.reactants.includes(id)
      ),
  },
  {
    title: "ウランの化合物（濃縮・塩化）",
    intro:
      "ウランをフッ素と結びつけると、気体になれる六フッ化ウラン（UF₆）ができるよ。これはウラン濃縮に使われる大事な化合物なんだ。塩素とも結びついて塩化物になる。",
    match: (r) =>
      ["UF2", "UF4", "UF6", "UCl2", "UCl4"].some((id) => r.products.includes(id)),
  },
];

// 反応をカテゴリに割り当てる。どのカテゴリにも当てはまらなかったものは
// 最後の「その他」にまとめ、取りこぼしがないようにする。
function categorizeReactions() {
  const buckets = REACTION_CATEGORIES.map((c) => ({
    title: c.title,
    intro: c.intro,
    items: [],
  }));
  const other = { title: "その他の反応", intro: "", items: [] };
  for (const recipe of RECIPE_LIST) {
    const idx = REACTION_CATEGORIES.findIndex((c) => c.match(recipe));
    (idx >= 0 ? buckets[idx] : other).items.push(recipe);
  }
  if (other.items.length > 0) buckets.push(other);
  return buckets.filter((b) => b.items.length > 0);
}

// 1つの反応式を、式(KaTeX)とエネルギー(発熱/吸熱)の行にして返す。
function renderReactionRow(recipe) {
  const row = document.createElement("div");
  row.className = "ref-reaction";

  const eqEl = document.createElement("div");
  eqEl.className = "ref-equation";
  katex.render(equationTeX(recipe.reactants, recipe.products), eqEl, {
    throwOnError: false,
  });

  const energyEl = document.createElement("div");
  const verb = recipe.enthalpyKJ >= 0 ? "発熱" : "吸熱";
  energyEl.className = `ref-energy ${recipe.enthalpyKJ >= 0 ? "exo" : "endo"}`;
  energyEl.textContent = `${Math.abs(recipe.enthalpyKJ)} kJ/mol ${verb}`;

  row.appendChild(eqEl);
  row.appendChild(energyEl);
  return row;
}

// 核反応(核分裂・中性子捕獲・β崩壊)のカテゴリを作る。化学反応とは別枠で見せる。
function renderNuclearSection() {
  const section = document.createElement("div");
  section.className = "ref-category";

  const heading = document.createElement("h3");
  heading.textContent = "核反応（化学反応の約1億倍のエネルギー）";
  section.appendChild(heading);

  const intro = document.createElement("p");
  intro.className = "ref-cat-intro";
  intro.textContent =
    "核分裂しやすいウラン235やプルトニウム239に中性子が当たると、原子核が2つに割れて中性子をまき散らすよ。飛び散った中性子が次の核分裂を起こすと連鎖反応に。ウラン238は中性子を吸ってウラン239になり、やがてβ崩壊してプルトニウム239に変わるんだ。";
  section.appendChild(intro);

  const nTeX = formulaToTeX(SUBSTANCES[NEUTRON_ID].formula);

  // 核分裂: ターゲット + n → 破片 + 破片 + (放出中性子)。代表パターンを載せる。
  for (const [targetId, target] of Object.entries(FISSION_TARGETS)) {
    for (const outcome of target.outcomes) {
      const left = `${formulaToTeX(SUBSTANCES[targetId].formula)} + ${nTeX}`;
      const products = outcome.fragments.map((id) =>
        formulaToTeX(SUBSTANCES[id].formula)
      );
      products.push(outcome.neutrons > 1 ? `${outcome.neutrons}${nTeX}` : nTeX);
      const row = document.createElement("div");
      row.className = "ref-reaction";
      const eqEl = document.createElement("div");
      eqEl.className = "ref-equation";
      katex.render(`${left} \\rightarrow ${products.join(" + ")}`, eqEl, {
        throwOnError: false,
      });
      row.appendChild(eqEl);
      section.appendChild(row);
    }
  }

  // 中性子捕獲: ターゲット + n → 生成核種。
  for (const [fromId, toId] of Object.entries(NEUTRON_CAPTURE)) {
    const row = document.createElement("div");
    row.className = "ref-reaction";
    const eqEl = document.createElement("div");
    eqEl.className = "ref-equation";
    katex.render(equationTeX([fromId, NEUTRON_ID], [toId]), eqEl, {
      throwOnError: false,
    });
    const noteEl = document.createElement("div");
    noteEl.className = "ref-energy";
    noteEl.textContent = "中性子捕獲";
    row.appendChild(eqEl);
    row.appendChild(noteEl);
    section.appendChild(row);
  }

  // β崩壊: 時間差で別核種に変わる。
  for (const [fromId, decay] of Object.entries(DECAYS)) {
    const row = document.createElement("div");
    row.className = "ref-reaction";
    const eqEl = document.createElement("div");
    eqEl.className = "ref-equation";
    katex.render(equationTeX([fromId], [decay.to]), eqEl, { throwOnError: false });
    const noteEl = document.createElement("div");
    noteEl.className = "ref-energy";
    noteEl.textContent = "β崩壊（時間差）";
    row.appendChild(eqEl);
    row.appendChild(noteEl);
    section.appendChild(row);
  }

  return section;
}

// 反応式一覧＋解説を container に描画する。折り畳みは1つで、
// 各カテゴリに「解説文 → 反応式」を並べる。
export function renderReactionReference(container) {
  if (!container) return;
  container.innerHTML = "";

  const intro = document.createElement("p");
  intro.className = "ref-intro";
  intro.innerHTML =
    "このゲームに登場するすべての反応と、そのしくみの解説だよ。式の右側の色は、" +
    "<span class=\"ref-energy exo\">緑＝発熱（加点）</span>／" +
    "<span class=\"ref-energy endo\">青＝吸熱（減点）</span>を表しているよ。";
  container.appendChild(intro);

  for (const bucket of categorizeReactions()) {
    const section = document.createElement("div");
    section.className = "ref-category";

    const heading = document.createElement("h3");
    heading.textContent = bucket.title;
    section.appendChild(heading);

    if (bucket.intro) {
      const p = document.createElement("p");
      p.className = "ref-cat-intro";
      p.textContent = bucket.intro;
      section.appendChild(p);
    }

    for (const recipe of bucket.items) {
      section.appendChild(renderReactionRow(recipe));
    }
    container.appendChild(section);
  }

  container.appendChild(renderNuclearSection());
}
