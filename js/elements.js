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
  H:   { formula: "H",   name: "水素原子",         molarMass: 1,   color: "#4fc3f7", fact: "宇宙で一番たくさんある元素だよ" },
  O:   { formula: "O",   name: "酸素原子",         molarMass: 16,  color: "#29b6f6", fact: "私たちが呼吸に使う元素" },
  N:   { formula: "N",   name: "窒素原子",         molarMass: 14,  color: "#7e57c2", fact: "空気の約8割を占めている元素" },
  C:   { formula: "C",   name: "炭素原子",         molarMass: 12,  color: "#8d6e63", fact: "ダイヤモンドも鉛筆の芯も炭素" },
  Cl:  { formula: "Cl",  name: "塩素原子",         molarMass: 35.5, color: "#9ccc65", fact: "プールの消毒に使われるよ" },
  Na:  { formula: "Na",  name: "ナトリウム原子",   molarMass: 23,  color: "#ffa726", fact: "水に入れると激しく反応する金属" },
  F:   { formula: "F",   name: "フッ素原子",       molarMass: 19,  color: "#66bb6a", fact: "歯磨き粉に入っていることがあるよ" },
  Ca:  { formula: "Ca",  name: "カルシウム原子",   molarMass: 40,  color: "#bdbdbd", fact: "骨や歯を作るミネラル" },
  S:   { formula: "S",   name: "硫黄原子",         molarMass: 32,  color: "#fdd835", fact: "マッチや火薬の材料になる黄色い元素" },

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
  C2:  { formula: "C2",  name: "二炭素",           molarMass: 24,  color: "#795548", fact: "炭素同士が結びついた不安定な分子" },

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
  C4H4: { formula: "C4H4", name: "シクロブタジエン", molarMass: 52,  color: "#8d6e63", fact: "アセチレンが2つくっついた不安定な分子" },
  C6H6: { formula: "C6H6", name: "ベンゼン",         molarMass: 78,  color: "#6d4c41", fact: "香水や合成繊維の原料になる芳香族の代表" },
  CS2:  { formula: "CS2",  name: "二硫化炭素",       molarMass: 76,  color: "#c0ca33", fact: "ゴムや繊維の製造に使われる液体" },
  NH:   { formula: "NH",   name: "イミドゲン",       molarMass: 15,  color: "#9575cd", fact: "アンモニアができる途中の不安定な分子" },
  NH3:  { formula: "NH3",  name: "アンモニア",       molarMass: 17,  color: "#7e57c2", fact: "刺激臭のある気体で肥料の原料になるよ" },

  // レア元素。ウランは核分裂の燃料、中性子はそれを引き起こす粒子。
  U:   { formula: "U",   name: "ウラン原子",       molarMass: 238, color: "#43a047", fact: "原子力発電の燃料になる重い放射性元素" },
  // 中性子は電荷を持たない粒子。分子量ではなく質量数1として扱い、見た目は小さくする。
  n:   { formula: "n",   name: "中性子",           molarMass: 1,   color: "#eeeeee", fact: "原子核の中にある電気を帯びていない粒子" },

  // ウランの核分裂で生まれる破片。
  Y:   { formula: "Y",   name: "イットリウム原子", molarMass: 89,  color: "#26c6da", fact: "白色LEDや蛍光体に使われるレアメタル" },
  I:   { formula: "I",   name: "ヨウ素原子",       molarMass: 127, color: "#5e35b1", fact: "うがい薬や海藻に含まれる紫色の元素" },

  // ウランのフッ化物・塩化物(フッ素・塩素の逐次付加で生成)。
  UF2: { formula: "UF2", name: "二フッ化ウラン",   molarMass: 276, color: "#4caf50", fact: "ウランにフッ素がつき始めた化合物" },
  UF4: { formula: "UF4", name: "四フッ化ウラン",   molarMass: 314, color: "#66bb6a", fact: "「グリーンソルト」と呼ばれる緑色の粉末" },
  UF6: { formula: "UF6", name: "六フッ化ウラン",   molarMass: 352, color: "#81c784", fact: "ウラン濃縮に使われる、気体になれるウラン化合物" },
  UCl2:{ formula: "UCl2",name: "二塩化ウラン",     molarMass: 309, color: "#7cb342", fact: "ウランに塩素がつき始めた化合物" },
  UCl4:{ formula: "UCl4",name: "四塩化ウラン",     molarMass: 380, color: "#9ccc65", fact: "緑色の結晶になるウランの塩化物" },
};

// 反応レシピ: [反応物Aの物質ID, 反応物Bの物質ID, 生成物の物質ID, 反応エネルギー[kJ/mol]]
// 反応エネルギーは高校化学レベルの代表的な値を参考にした概算値。
// 発熱(正の値)はスコア加点、吸熱(負の値)は減点になる(game.jsのpointsFor()で変換)。
// 反応物の順序は問わない(衝突判定時にどちらの並びでもマッチする)。
const RECIPES = [
  // 単体分子の生成(結合エネルギー)
  ["H", "H", "H2", 436],
  ["O", "O", "O2", 498],
  ["N", "N", "N2", 945],
  ["Cl", "Cl", "Cl2", 243],
  ["F", "F", "F2", 158],
  ["S", "S", "S2", 425],

  // 酸素の逐次付加
  ["O2", "O", "O3", -106], // 吸熱反応(オゾン生成)
  ["C", "O", "CO", 111],
  ["CO", "O", "CO2", 283],
  ["C", "O2", "CO2", 393.5], // 炭素の完全燃焼
  ["Ca", "O", "CaO", 635],
  ["N", "O", "NO", -90], // 吸熱反応(一酸化窒素生成)
  ["NO", "O", "NO2", 214], // 一酸化窒素が酸化されて二酸化窒素になる
  ["H", "Cl", "HCl", 432],
  ["H", "F", "HF", 565],
  ["H2", "O", "H2O", 242],

  // 水素と酸素分子の反応
  ["H2", "O2", "H2O2", 136],

  // ナトリウム・カルシウムの化合物
  ["Na", "F", "NaF", 573],
  ["Na", "Cl", "NaCl", 411],
  ["Ca", "F2", "CaF2", 1228],
  ["Ca", "Cl2", "CaCl2", 795],
  ["CaO", "H2O", "Ca(OH)2", 65], // 水和熱(生石灰が水を吸って消石灰になる)

  // 硫黄の重合
  ["S2", "S2", "S4", 92],
  ["S2", "S4", "S6", 95], // 環状六硫黄の生成
  ["S4", "S4", "S8", 98],

  // 硫黄の燃焼
  ["S", "O2", "SO2", 297],

  // 炭素と硫黄の化合
  ["C", "S2", "CS2", -89], // 吸熱反応(二硫化炭素の生成)

  // 窒素の水素化からアンモニアへ
  ["N", "H", "NH", 391], // N-H結合の生成
  ["NH", "H2", "NH3", 391], // アンモニア完成

  // ウランのフッ素化(ウラン濃縮で使う六フッ化ウランUF6へ逐次付加)
  ["U", "F2", "UF2", 1100],
  ["UF2", "F2", "UF4", 900],
  ["UF4", "F2", "UF6", 500],
  // ウランの塩素化
  ["U", "Cl2", "UCl2", 800],
  ["UCl2", "Cl2", "UCl4", 600],

  // 炭素の連鎖からベンゼンへ
  ["C", "C", "C2", 602],
  ["C2", "H2", "C2H2", 227], // アセチレン生成
  ["C2H2", "C2H2", "C4H4", 150], // アセチレンの二量化
  ["C4H4", "C2H2", "C6H6", 400], // アセチレンの三量化でベンゼンが完成(実際の工業的合成法)
];

// 中性子はどの反応レシピにも「反応物」として登場させない。
// 通常の合体反応(2物質→1物質)ではなく、game.js側で特別扱いする「核分裂」の
// トリガーとしてのみ使うため。以下は中性子がぶつかったときに核分裂する物質の定義。
// トリガー物質ID → { fragments: [生成核種ID...], neutrons: 放出中性子数, energyKJ: 反応エネルギー }
export const FISSION_TARGETS = {
  // ウラン + 中性子 → イットリウム + ヨウ素 + 中性子2個(核分裂の代表例)。
  // 核分裂1回のエネルギーは約200MeV。1molあたりに換算すると
  //   200e6 eV × 1.602e-19 J/eV × 6.022e23 /mol ≒ 1.93e13 J/mol = 1.93e10 kJ/mol
  // 化学反応(数百kJ/mol)の約1億倍という、核エネルギーの桁違いの大きさを表す。
  U: { fragments: ["Y", "I"], neutrons: 2, energyKJ: 1.93e10 },
};

// 中性子(すり抜ける特殊粒子)の物質ID。
export const NEUTRON_ID = "n";

export function isNeutron(id) {
  return id === NEUTRON_ID;
}

// 他の物質を「すり抜ける」粒子の集合。中性子と、核分裂で飛び散る破片核種
// (イットリウム・ヨウ素)が該当する。センサー化して重力を無視し直進させ、
// 画面外に出たら消滅する(game.js側で扱う)。
const PASSTHROUGH_IDS = new Set([NEUTRON_ID]);
for (const { fragments } of Object.values(FISSION_TARGETS)) {
  for (const id of fragments) PASSTHROUGH_IDS.add(id);
}

export function isPassthrough(id) {
  return PASSTHROUGH_IDS.has(id);
}

// 中性子が id の物質に当たったときの核分裂結果を返す。核分裂しなければ null。
export function findFission(id) {
  return FISSION_TARGETS[id] ?? null;
}

// 反応検索を高速化するためのマップ。キーは "物質IDA|物質IDB" (アルファベット順に正規化)。
const REACTION_MAP = new Map();
function reactionKey(idA, idB) {
  return [idA, idB].sort().join("|");
}
for (const [a, b, product, enthalpyKJ] of RECIPES) {
  REACTION_MAP.set(reactionKey(a, b), { product, enthalpyKJ });
}

// substanceIdA, substanceIdB から反応結果を引く。反応がなければ null。
export function findReaction(idA, idB) {
  return REACTION_MAP.get(reactionKey(idA, idB)) ?? null;
}

// ゲーム開始時にランダムに降ってくる初期物質(原子)のID一覧。
// Caは反応相手がO単体・F2・Cl2に限られ他の原子より合体しにくいため、
// 配列に登場する回数を減らして出現頻度そのものを下げている(重み付き抽選)。
//
// レア元素の中性子(n)は「炭素の半分」、ウラン(U)はさらにその半分
// (=炭素の1/4)の出現頻度にしたい。重み付き抽選なので、配列に登場する回数で
// 頻度を表す。基準として炭素(C)を4回登場させ、中性子はその半分の2回、
// ウランはさらに半分の1回にしている。他の既存元素も比率を保つため4倍にしている。
export const INITIAL_SUBSTANCE_IDS = [
  "H", "H", "H", "H", "H", "H", "H", "H",
  "O", "O", "O", "O",
  "N", "N", "N", "N",
  "C", "C", "C", "C",
  "Cl", "Cl", "Cl", "Cl", "Cl", "Cl", "Cl", "Cl",
  "Na", "Na", "Na", "Na",
  "F", "F", "F", "F", "F", "F", "F", "F",
  "Ca", "Ca", "Ca", "Ca",
  "S", "S", "S", "S",
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
for (const [a, b] of RECIPES) {
  REACTANT_IDS.add(a);
  REACTANT_IDS.add(b);
}
export const TERMINAL_SUBSTANCE_IDS = new Set(
  Object.keys(SUBSTANCES).filter(
    (id) => !REACTANT_IDS.has(id) && !isPassthrough(id)
  )
);

export function isTerminalSubstance(id) {
  return TERMINAL_SUBSTANCE_IDS.has(id);
}
