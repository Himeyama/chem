// 物質データと反応レシピの定義。
//
// これまでの「同じ物質同士のみ合体する」という単線チェーン方式をやめ、
// 「任意の2つの物質が衝突したとき、対応する反応レシピがあれば合体する」
// という汎用的な反応テーブル方式を採用している。
// 各反応は原子数保存(質量保存の法則)を満たすものだけを採用しており、
// 「水素が湧く」「酸素が湧く」といった化学的な矛盾を避けている。

// 物質定義。formula は表示用の化学式、molarMass は分子量、
// color はCanvas描画時の色、fact は「次の物質」欄の下に表示する身近な豆知識コメント。
export const SUBSTANCES = {
  // 降ってくる素材。単体で存在しない元素は二原子分子(H2,N2,O2,F2,Cl2,S2)で扱い、
  // 金属・固体として単体で存在するC・Na・Ca・Uだけを単原子で登場させる。
  C:   { formula: "C",   name: "炭素",             molarMass: 12,  color: "#8d6e63", fact: "ダイヤモンドも鉛筆の芯も炭素" },
  Na:  { formula: "Na",  name: "ナトリウム",       molarMass: 23,  color: "#ffa726", fact: "水に入れると激しく反応する金属" },
  Ca:  { formula: "Ca",  name: "カルシウム",       molarMass: 40,  color: "#bdbdbd", fact: "骨や歯を作るミネラル" },

  H2:  { formula: "H2",  name: "水素",             molarMass: 2,   color: "#4fc3f7", fact: "燃料電池車の燃料になるよ" },
  O2:  { formula: "O2",  name: "酸素",             molarMass: 32,  color: "#29b6f6", fact: "呼吸で吸っている気体そのもの" },
  O3:  { formula: "O3",  name: "オゾン",           molarMass: 48,  color: "#0288d1", fact: "上空でオゾン層を作り紫外線を防ぐ" },
  N2:  { formula: "N2",  name: "窒素",             molarMass: 28,  color: "#7e57c2", fact: "お菓子の袋の中に入っている気体" },
  Cl2: { formula: "Cl2", name: "塩素",             molarMass: 71,  color: "#9ccc65", fact: "黄緑色で強い刺激臭のある有毒な気体" },
  F2:  { formula: "F2",  name: "フッ素",           molarMass: 38,  color: "#66bb6a", fact: "非常に反応しやすい気体" },
  S2:  { formula: "S2",  name: "二硫黄",           molarMass: 64,  color: "#fdd835", fact: "硫黄が蒸発するとできる分子" },
  S4:  { formula: "S4",  name: "四硫黄",           molarMass: 128, color: "#fbc02d", fact: "硫黄分子が集まる途中の姿" },
  S6:  { formula: "S6",  name: "六硫黄",           molarMass: 192, color: "#fdd835", fact: "環状構造をもつ硫黄の同素体" },
  S8:  { formula: "S8",  name: "硫黄(環状分子)",   molarMass: 256, color: "#f9a825", fact: "マッチや花火の材料になる硫黄の姿" },

  NO:   { formula: "NO",   name: "一酸化窒素",       molarMass: 30,  color: "#ba68c8", fact: "車の排気ガスにも含まれる気体" },
  NO2:  { formula: "NO2",  name: "二酸化窒素",       molarMass: 46,  color: "#8e24aa", fact: "光化学スモッグの原因になる赤褐色の気体" },
  HCl:  { formula: "HCl",  name: "塩化水素",         molarMass: 36.5, color: "#c5e1a5", fact: "水に溶けると胃液と同じ塩酸に！" },
  HF:   { formula: "HF",   name: "フッ化水素",       molarMass: 20,  color: "#a5d6a7", fact: "ガラスを溶かすほど強い反応性を持つよ" },
  H2O:  { formula: "H2O",  name: "水",               molarMass: 18,  color: "#4fc3f7", fact: "生き物に欠かせない、いちばん身近な液体" },
  H2O2: { formula: "H2O2", name: "過酸化水素",       molarMass: 34,  color: "#4dd0e1", fact: "傷口の消毒液オキシドールの主成分" },
  CO:   { formula: "CO",   name: "一酸化炭素",       molarMass: 28,  color: "#a1887f", fact: "無色無臭だけどとても危険なガス" },
  CO2:  { formula: "CO2",  name: "二酸化炭素",       molarMass: 44,  color: "#795548", fact: "炭酸飲料のシュワシュワの正体" },
  NaF:  { formula: "NaF",  name: "フッ化ナトリウム", molarMass: 42,  color: "#ffcc80", fact: "むし歯予防の歯磨き粉に配合される" },
  NaCl: { formula: "NaCl", name: "塩化ナトリウム",   molarMass: 58.5, color: "#ffb74d", fact: "お塩です！毎日の食卓に欠かせない" },
  CaF2: { formula: "CaF2", name: "フッ化カルシウム(蛍石)", molarMass: 78, color: "#81c784", fact: "美しい結晶「蛍石」として知られる鉱物" },
  CaCl2:{ formula: "CaCl2",name: "塩化カルシウム",   molarMass: 111, color: "#aed581", fact: "凍結防止剤や除湿剤に使われるよ" },
  CaO:  { formula: "CaO",  name: "酸化カルシウム(生石灰)", molarMass: 56, color: "#e0e0e0", fact: "お弁当の乾燥剤に使われる生石灰" },
  "Ca(OH)2": { formula: "Ca(OH)2", name: "水酸化カルシウム(消石灰)", molarMass: 74, color: "#f5f5f5", fact: "校庭のライン引きに使われる消石灰" },
  SO2:  { formula: "SO2",  name: "二酸化硫黄",       molarMass: 64,  color: "#ffee58", fact: "火山ガスや酸性雨のもとになる気体" },
  C2H2: { formula: "C2H2", name: "アセチレン",       molarMass: 26,  color: "#a1887f", fact: "溶接のガスバーナーに使われる気体" },
  C6H6: { formula: "C6H6", name: "ベンゼン",         molarMass: 78,  color: "#6d4c41", fact: "香水や合成繊維の原料になる芳香族の代表" },
  CS2:  { formula: "CS2",  name: "二硫化炭素",       molarMass: 76,  color: "#c0ca33", fact: "ゴムや繊維の製造に使われる液体" },
  NH3:  { formula: "NH3",  name: "アンモニア",       molarMass: 17,  color: "#7e57c2", fact: "刺激臭のある気体で肥料の原料になるよ" },

  // レア元素。ウランは核分裂の燃料、中性子はそれを引き起こす粒子。
  U:   { formula: "U",   name: "ウラン原子",       molarMass: 238, color: "#43a047", fact: "原子力発電の燃料になる重い放射性元素" },
  // 中性子は電荷を持たない粒子。分子量ではなく質量数1として扱い、見た目は小さくする。
  n:   { formula: "n",   name: "中性子",           molarMass: 1,   color: "#eeeeee", fact: "原子核の中にある電気を帯びていない粒子" },

  // ウランの核分裂で生まれる破片(生成核種)。実際の核分裂は破片の組み合わせが
  // 確率的に変わるので、代表的な分裂パターンぶんの核種を用意している。
  Y:   { formula: "Y",   name: "イットリウム原子", molarMass: 89,  color: "#26c6da", fact: "白色LEDや蛍光体に使われるレアメタル" },
  I:   { formula: "I",   name: "ヨウ素原子",       molarMass: 127, color: "#5e35b1", fact: "うがい薬や海藻に含まれる紫色の元素" },
  Ba:  { formula: "Ba",  name: "バリウム原子",     molarMass: 141, color: "#4db6ac", fact: "胃のX線検査で飲むバリウムの正体" },
  Kr:  { formula: "Kr",  name: "クリプトン原子",   molarMass: 92,  color: "#4dd0e1", fact: "白熱電球や照明に使われる希ガス" },
  Xe:  { formula: "Xe",  name: "キセノン原子",     molarMass: 140, color: "#7986cb", fact: "自動車のヘッドライトにも使われる希ガス" },
  Sr:  { formula: "Sr",  name: "ストロンチウム原子", molarMass: 94, color: "#4fc3f7", fact: "花火の赤い色を出すのに使われる金属" },
  Cs:  { formula: "Cs",  name: "セシウム原子",     molarMass: 140, color: "#9575cd", fact: "原子時計に使われる、時間の基準になる元素" },
  Rb:  { formula: "Rb",  name: "ルビジウム原子",   molarMass: 93,  color: "#7e57c2", fact: "水に触れると激しく反応するアルカリ金属" },

  // ウランのフッ化物・塩化物(フッ素・塩素の逐次付加で生成)。
  UF2: { formula: "UF2", name: "二フッ化ウラン",   molarMass: 276, color: "#4caf50", fact: "ウランにフッ素がつき始めた化合物" },
  UF4: { formula: "UF4", name: "四フッ化ウラン",   molarMass: 314, color: "#66bb6a", fact: "「グリーンソルト」と呼ばれる緑色の粉末" },
  UF6: { formula: "UF6", name: "六フッ化ウラン",   molarMass: 352, color: "#81c784", fact: "ウラン濃縮に使われる、気体になれるウラン化合物" },
  UCl2:{ formula: "UCl2",name: "二塩化ウラン",     molarMass: 309, color: "#7cb342", fact: "ウランに塩素がつき始めた化合物" },
  UCl4:{ formula: "UCl4",name: "四塩化ウラン",     molarMass: 380, color: "#9ccc65", fact: "緑色の結晶になるウランの塩化物" },
};

// 反応レシピ: [ [反応物ID...], [生成物ID...], 反応エネルギー[kJ/mol] ]
// 反応物・生成物ともに配列で、個数を並べて書く(N体反応・複数生成物に対応)。
//   例: 2Na + F2 -> 2NaF は [["Na", "Na", "F2"], ["NaF", "NaF"], ...] と書く。
// 反応エネルギーは高校化学レベルの代表的な値を参考にした概算値。
// 発熱(正の値)はスコア加点、吸熱(負の値)は減点になる(game.jsのpointsFor()で変換)。
// 反応物の並び順は問わない(衝突判定時に多重集合として一致すればマッチする)。
const RECIPES = [
  // 酸素まわり(すべて実際の化学反応式どおり、原子数保存を満たす)
  [["O2", "O2", "O2"], ["O3", "O3"], -286], // 3O2 -> 2O3(吸熱: オゾン生成)
  [["C", "C", "O2"], ["CO", "CO"], 221], // 2C + O2 -> 2CO
  [["CO", "CO", "O2"], ["CO2", "CO2"], 566], // 2CO + O2 -> 2CO2
  [["C", "O2"], ["CO2"], 393.5], // C + O2 -> CO2(炭素の完全燃焼)
  [["Ca", "Ca", "O2"], ["CaO", "CaO"], 1270], // 2Ca + O2 -> 2CaO

  // 窒素酸化物
  [["N2", "O2"], ["NO", "NO"], -180], // N2 + O2 -> 2NO(吸熱)
  [["NO", "NO", "O2"], ["NO2", "NO2"], 428], // 2NO + O2 -> 2NO2

  // 水素・ハロゲン化水素・水
  [["H2", "Cl2"], ["HCl", "HCl"], 185], // H2 + Cl2 -> 2HCl
  [["H2", "F2"], ["HF", "HF"], 542], // H2 + F2 -> 2HF
  [["H2", "H2", "O2"], ["H2O", "H2O"], 484], // 2H2 + O2 -> 2H2O
  [["H2", "O2"], ["H2O2"], 136], // H2 + O2 -> H2O2(過酸化水素)

  // ナトリウム・カルシウムの化合物
  [["Na", "Na", "F2"], ["NaF", "NaF"], 1146], // 2Na + F2 -> 2NaF
  [["Na", "Na", "Cl2"], ["NaCl", "NaCl"], 822], // 2Na + Cl2 -> 2NaCl
  [["Ca", "F2"], ["CaF2"], 1228], // Ca + F2 -> CaF2
  [["Ca", "Cl2"], ["CaCl2"], 795], // Ca + Cl2 -> CaCl2
  [["CaO", "H2O"], ["Ca(OH)2"], 65], // CaO + H2O -> Ca(OH)2(水和熱)

  // 硫黄の重合(分子どうしの反応なので原子数はそのまま保存される)
  [["S2", "S2"], ["S4"], 92],
  [["S2", "S4"], ["S6"], 95], // 環状六硫黄の生成
  [["S4", "S4"], ["S8"], 98],

  // 硫黄の燃焼
  [["S2", "O2", "O2"], ["SO2", "SO2"], 594], // S2 + 2O2 -> 2SO2

  // 炭素と硫黄の化合
  [["C", "S2"], ["CS2"], -89], // C + S2 -> CS2(吸熱: 二硫化炭素)

  // 窒素の水素化からアンモニアへ(ハーバー・ボッシュ法)。不安定な中間体を経ずに
  // N2 + 3H2 -> 2NH3 の4体反応で一気にアンモニアを2個作る。
  [["N2", "H2", "H2", "H2"], ["NH3", "NH3"], 92], // N2 + 3H2 -> 2NH3

  // ウランのフッ素化(ウラン濃縮で使う六フッ化ウランUF6へ逐次付加)
  [["U", "F2"], ["UF2"], 1100],
  [["UF2", "F2"], ["UF4"], 900],
  [["UF4", "F2"], ["UF6"], 500],
  // ウランの塩素化
  [["U", "Cl2"], ["UCl2"], 800],
  [["UCl2", "Cl2"], ["UCl4"], 600],

  // 炭素の連鎖からベンゼンへ。不安定なC2・C4H4は経由しない。
  [["C", "C", "H2"], ["C2H2"], 227], // 2C + H2 -> C2H2(アセチレン)
  [["C2H2", "C2H2", "C2H2"], ["C6H6"], 597], // 3C2H2 -> C6H6(アセチレンの三量化でベンゼン)
];

// 中性子はどの反応レシピにも「反応物」として登場させない。
// 通常の合体反応(2物質→1物質)ではなく、game.js側で特別扱いする「核分裂」の
// トリガーとしてのみ使うため。以下は中性子がぶつかったときに核分裂する物質の定義。
//
// トリガー物質ID → { outcomes: [分裂パターン...] }。
// 実際の核分裂は破片核種の組み合わせが確率的に変わるので、代表的な分裂パターンを
// 複数用意し、各パターンの weight(重み)で確率的に1つ選ぶ。
// 各パターン: { fragments: [生成核種ID...], neutrons: 放出中性子数, weight: 相対確率 }
//
// 核分裂1回のエネルギーは約200MeV。1molあたりに換算すると
//   200e6 eV × 1.602e-19 J/eV × 6.022e23 /mol ≒ 1.93e13 J/mol = 1.93e10 kJ/mol
// 化学反応(数百kJ/mol)の約1億倍という、核エネルギーの桁違いの大きさを表す。
// エネルギーはどのパターンでもほぼ同じなのでターゲット共通で持たせる。
export const FISSION_TARGETS = {
  U: {
    energyKJ: 1.93e10,
    outcomes: [
      // バリウム + クリプトン + 3n(教科書で最も有名なU-235の分裂)。
      { fragments: ["Ba", "Kr"], neutrons: 3, weight: 4 },
      // キセノン + ストロンチウム + 2n。
      { fragments: ["Xe", "Sr"], neutrons: 2, weight: 3 },
      // ヨウ素 + イットリウム + 2n。
      { fragments: ["I", "Y"], neutrons: 2, weight: 2 },
      // セシウム + ルビジウム + 2n。
      { fragments: ["Cs", "Rb"], neutrons: 2, weight: 1 },
    ],
  },
};

// 中性子(すり抜ける特殊粒子)の物質ID。
export const NEUTRON_ID = "n";

export function isNeutron(id) {
  return id === NEUTRON_ID;
}

// 他の物質を「すり抜ける」粒子の集合。中性子と、核分裂で飛び散る破片核種
// (全ターゲット・全分裂パターンに登場する核種)が該当する。センサー化して重力を
// 無視し直進させ、画面外に出たら消滅する(game.js側で扱う)。
const PASSTHROUGH_IDS = new Set([NEUTRON_ID]);
for (const { outcomes } of Object.values(FISSION_TARGETS)) {
  for (const { fragments } of outcomes) {
    for (const id of fragments) PASSTHROUGH_IDS.add(id);
  }
}

export function isPassthrough(id) {
  return PASSTHROUGH_IDS.has(id);
}

// 中性子が id の物質に当たったときの核分裂結果を返す。核分裂しなければ null。
// 分裂パターンは weight に応じて確率的に1つ選び、game.js が扱いやすいよう
// { fragments, neutrons, energyKJ } の形にして返す。
export function findFission(id) {
  const target = FISSION_TARGETS[id];
  if (!target) return null;
  const outcome = pickWeighted(target.outcomes);
  return {
    fragments: outcome.fragments,
    neutrons: outcome.neutrons,
    energyKJ: target.energyKJ,
  };
}

// weight プロパティを持つ要素の配列から、重みに比例した確率で1つ選ぶ。
function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r < 0) return item;
  }
  return items[items.length - 1]; // 丸め誤差の保険
}

// 反応検索を高速化するためのマップ。キーは反応物IDをソートして "|" で連結した
// 多重集合キー(並び順を問わず、同じ物質が複数あってもそのまま個数が効く)。
const REACTION_MAP = new Map();
function reactantKey(ids) {
  return [...ids].sort().join("|");
}

// 物質IDの配列を「物質ID→必要個数」のMapにする(多重集合のカウント)。
function countMap(ids) {
  const m = new Map();
  for (const id of ids) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
}

// レシピが要求する反応物の個数(=クラスタから何体を消費するか)の最大値。
// game.js側でクラスタ探索を打ち切る上限に使う。
export let MAX_REACTANTS = 2;
// game.js のクラスタ探索用に、反応物の必要個数(counts)を前計算した一覧。
// 消費数が多い(=難しい)反応を優先して当てられるよう size 降順に並べておく。
export const REACTIONS = [];
for (const [reactants, products, enthalpyKJ] of RECIPES) {
  REACTION_MAP.set(reactantKey(reactants), {
    products,
    enthalpyKJ,
    size: reactants.length,
  });
  REACTIONS.push({
    counts: countMap(reactants),
    size: reactants.length,
    products,
    enthalpyKJ,
  });
  if (reactants.length > MAX_REACTANTS) MAX_REACTANTS = reactants.length;
}
REACTIONS.sort((a, b) => b.size - a.size);

// 物質IDの配列(多重集合)にちょうど一致する反応を引く。なければ null。
// 返り値には size(反応物の個数)も含む。
export function findReactionForSet(ids) {
  return REACTION_MAP.get(reactantKey(ids)) ?? null;
}

// ゲーム開始時にランダムに降ってくる初期物質のID一覧。単体で存在しない元素は
// 二原子分子(H2,N2,O2,F2,Cl2,S2)で、金属・固体はそのまま単体(C,Na,Ca)で降らせる。
// Caは反応相手がO2・F2・Cl2に限られ他より合体しにくいため、登場回数を減らして
// 出現頻度そのものを下げている(重み付き抽選)。
//
// レア元素の中性子(n)は「炭素の半分」、ウラン(U)はさらにその半分
// (=炭素の1/4)の出現頻度にしたい。重み付き抽選なので、配列に登場する回数で
// 頻度を表す。基準として炭素(C)を4回登場させ、中性子はその半分の2回、
// ウランはさらに半分の1回にしている。他の既存物質も比率を保つため4倍にしている。
export const INITIAL_SUBSTANCE_IDS = [
  "H2", "H2", "H2", "H2", "H2", "H2", "H2", "H2",
  "O2", "O2", "O2", "O2",
  "N2", "N2", "N2", "N2",
  "C", "C", "C", "C",
  "Cl2", "Cl2", "Cl2", "Cl2", "Cl2", "Cl2", "Cl2", "Cl2",
  "Na", "Na", "Na", "Na",
  "F2", "F2", "F2", "F2", "F2", "F2", "F2", "F2",
  "Ca", "Ca", "Ca", "Ca",
  "S2", "S2", "S2", "S2",
  "n", "n", // レア: 炭素の半分の頻度
  "U", // レア: 中性子のさらに半分(炭素の1/4)の頻度
];

// どの反応レシピにも「反応物」として登場しない物質のIDの集合。
// これ以上他の物質と反応しない「終端物質」であり、game.js側で一定時間後に
// 自動消滅させる対象として扱う。
// ウランはフッ素(F2)・塩素(Cl2)の反応物なので自動的に終端物質から外れ、
// 生成物のUF6・UCl4などが終端物質(=一定時間で消滅)になる。
// 中性子・核分裂の破片(Y・I)はすり抜けて画面外で消える特殊粒子なので、
// 時間経過で消える終端物質からは除外する。
const REACTANT_IDS = new Set();
for (const [reactants] of RECIPES) {
  for (const id of reactants) REACTANT_IDS.add(id);
}
export const TERMINAL_SUBSTANCE_IDS = new Set(
  Object.keys(SUBSTANCES).filter(
    (id) => !REACTANT_IDS.has(id) && !isPassthrough(id)
  )
);

export function isTerminalSubstance(id) {
  return TERMINAL_SUBSTANCE_IDS.has(id);
}
