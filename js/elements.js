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
  H2S:  { formula: "H2S",  name: "硫化水素",         molarMass: 34,  color: "#9e9d24", fact: "腐った卵のようなにおいがする温泉の気体" },

  // 金属。イオン化傾向が水素より大きいZn・Feは希塩酸・希硫酸にも溶けて水素を出すが、
  // 水素より小さい貴金属(Cu・Ag・Au)はそれらには溶けず、強い酸(硝酸・王水)でのみ溶ける。
  Zn:  { formula: "Zn",  name: "亜鉛",             molarMass: 65,  color: "#90a4ae", fact: "トタンや乾電池に使われる、酸にも塩基にも溶ける金属" },
  Fe:  { formula: "Fe",  name: "鉄",               molarMass: 56,  color: "#8d8d8d", fact: "建物や機械を支える、いちばん身近な金属" },
  Cu:  { formula: "Cu",  name: "銅",               molarMass: 64,  color: "#e07b53", fact: "10円玉や電線に使われる赤みがかった金属" },
  Ag:  { formula: "Ag",  name: "銀",               molarMass: 108, color: "#cfd8dc", fact: "アクセサリーや鏡に使われる、いちばん電気を通す金属" },
  Au:  { formula: "Au",  name: "金",               molarMass: 197, color: "#ffca28", fact: "王水にしか溶けない、さびない貴金属の王様" },

  // 硫黄・窒素の酸化物と、そこから作る強い酸(オキソ酸)。
  SO3:  { formula: "SO3",  name: "三酸化硫黄",       molarMass: 80,  color: "#fff176", fact: "水と激しく反応して硫酸になる気体" },
  H2SO4:{ formula: "H2SO4",name: "硫酸",             molarMass: 98,  color: "#f9a825", fact: "車のバッテリーにも入っている強い酸" },
  HNO3: { formula: "HNO3", name: "硝酸",             molarMass: 63,  color: "#ab47bc", fact: "金属をよく溶かす、火薬や肥料の原料になる酸" },
  // 王水は濃硝酸と濃塩酸を混ぜた混合物。単一分子ではないが、金を溶かす特別な液体
  // としてゲーム内では1つの物質として扱う。金の溶解反応が原子数保存で閉じるよう、
  // ゲーム内では HNO3 + 4HCl 相当(硝酸1:塩酸4)の組成として定義している。
  "王水": { formula: "王水", name: "王水",           molarMass: 209, color: "#d4a017", fact: "濃硝酸と濃塩酸を混ぜた、金さえ溶かす最強の酸" },

  // 酢酸とその中間体(アセチレンの水和→酸化で作る)。
  CH3CHO:  { formula: "CH3CHO",  name: "アセトアルデヒド", molarMass: 44, color: "#bcaaa4", fact: "お酒に酔ったあと二日酔いを起こす原因の物質" },
  CH3COOH: { formula: "CH3COOH", name: "酢酸",         molarMass: 60,  color: "#8d6e63", fact: "お酢のすっぱさのもと。食卓でおなじみの弱い酸" },

  // 金属を酸で溶かしてできる塩(水溶液中の化合物としてゲーム内で扱う)。
  CuSO4:   { formula: "CuSO4",   name: "硫酸銅",       molarMass: 160, color: "#42a5f5", fact: "水に溶けると鮮やかな青色になる銅の塩" },
  "Cu(NO3)2": { formula: "Cu(NO3)2", name: "硝酸銅",   molarMass: 188, color: "#5c6bc0", fact: "銅を硝酸に溶かすとできる青い塩" },
  AgNO3:   { formula: "AgNO3",   name: "硝酸銀",       molarMass: 170, color: "#b0bec5", fact: "光に当たると黒くなる、写真フィルムに使われた銀の塩" },
  HAuCl4:  { formula: "HAuCl4",  name: "テトラクロロ金酸", molarMass: 340, color: "#ffd54f", fact: "金を王水に溶かすとできる黄色い化合物" },
  // 銅の塩化物は、銅が塩酸に溶けないため塩素(Cl2)と直接反応させて作る。
  CuCl2:   { formula: "CuCl2",   name: "塩化銅",       molarMass: 135, color: "#26a69a", fact: "水に溶けると青緑色になる銅の塩。炎色反応は青緑色" },
  // 塩化銀は、硝酸銀の水溶液に塩化物イオンを加えると白く沈殿する。塩化物の検出に使う定番反応。
  AgCl:    { formula: "AgCl",    name: "塩化銀",       molarMass: 143.5, color: "#eceff1", fact: "塩化物イオンを加えると白く沈殿する、写真感光材にも使われた塩" },

  // イオン化傾向が水素より大きい金属(Na・Ca・Zn・Fe)を希酸に溶かしてできる塩。
  // このとき水素(H2)を発生しながら溶けるのがポイント(貴金属との違い)。
  Na2SO4:  { formula: "Na2SO4",  name: "硫酸ナトリウム", molarMass: 142, color: "#ffcc80", fact: "入浴剤やガラスの原料に使われる白い塩" },
  CaSO4:   { formula: "CaSO4",   name: "硫酸カルシウム", molarMass: 136, color: "#eeeeee", fact: "石こうボードやチョークの主成分" },
  Ag2SO4:  { formula: "Ag2SO4",  name: "硫酸銀",       molarMass: 312, color: "#90a4ae", fact: "銀を熱濃硫酸に溶かすとできる、水に溶けにくい塩" },
  NaNO3:   { formula: "NaNO3",   name: "硝酸ナトリウム", molarMass: 85,  color: "#ffe0b2", fact: "チリ硝石として採れる、火薬や肥料の原料になる塩" },
  "Ca(NO3)2": { formula: "Ca(NO3)2", name: "硝酸カルシウム", molarMass: 164, color: "#f0f4c3", fact: "肥料に使われる、水によく溶けるカルシウムの塩" },
  // 亜鉛を空気中で燃やすとできる酸化物。酸にも塩基にも溶ける両性酸化物。
  ZnO:     { formula: "ZnO",     name: "酸化亜鉛",     molarMass: 81,  color: "#fafafa", fact: "日焼け止めや化粧品に使われる白い粉。両性酸化物" },
  ZnCl2:   { formula: "ZnCl2",   name: "塩化亜鉛",     molarMass: 136, color: "#b0bec5", fact: "はんだ付けや乾電池に使われる亜鉛の塩" },
  ZnSO4:   { formula: "ZnSO4",   name: "硫酸亜鉛",     molarMass: 161, color: "#a5d6a7", fact: "化粧品や農薬にも使われる亜鉛の塩" },
  "Zn(NO3)2": { formula: "Zn(NO3)2", name: "硝酸亜鉛", molarMass: 189, color: "#b2dfdb", fact: "染色や触媒に使われる亜鉛の塩" },
  FeCl2:   { formula: "FeCl2",   name: "塩化鉄(II)",   molarMass: 127, color: "#a1887f", fact: "淡い緑色をした、鉄を塩酸に溶かしてできる塩" },
  FeSO4:   { formula: "FeSO4",   name: "硫酸鉄(II)",   molarMass: 152, color: "#8d6e63", fact: "貧血の薬にも使われる鉄の塩" },
  // 鉄を希硝酸に溶かすと、酸化されて2価ではなく3価の鉄(III)の塩になる。
  "Fe(NO3)3": { formula: "Fe(NO3)3", name: "硝酸鉄(III)", molarMass: 242, color: "#bf6a3a", fact: "赤褐色をした鉄(III)の塩。インクや媒染剤に使われる" },
  // 鉄を王水に溶かすと、酸化力の強さから2価ではなく3価の鉄(III)の塩化物になる。
  FeCl3:   { formula: "FeCl3",   name: "塩化鉄(III)",  molarMass: 162.5, color: "#8d5524", fact: "黄褐色をした鉄(III)の塩。水処理の凝集剤にも使われる" },

  // レア元素。ウランは核分裂の燃料、中性子はそれを引き起こす粒子。
  // ウランには同位体があり、核分裂しやすいU235と、しにくいU238で挙動が異なる。
  // 質量数はUnicode上付き数字で化学式の前に付ける(²³⁵U のように表示される)。
  U235:{ formula: "²³⁵U", name: "ウラン235",     molarMass: 235, color: "#66bb6a", fact: "核分裂しやすい、原子力発電の主役になるウラン" },
  U238:{ formula: "²³⁸U", name: "ウラン238",     molarMass: 238, color: "#2e7d32", fact: "天然ウランのほとんどを占める、核分裂しにくいウラン" },
  // U238が中性子を捕らえてできる。β崩壊で少し経つとプルトニウム239に変わる。
  U239:{ formula: "²³⁹U", name: "ウラン239",     molarMass: 239, color: "#00897b", fact: "中性子を吸ったウラン。すぐ崩壊してプルトニウムになる" },
  Pu239:{ formula: "²³⁹Pu", name: "プルトニウム239", molarMass: 239, color: "#c62828", fact: "U238から生まれる、核分裂する人工の元素" },
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
  [["Zn", "Zn", "O2"], ["ZnO", "ZnO"], 696], // 2Zn + O2 -> 2ZnO(亜鉛の燃焼)

  // 窒素酸化物
  [["N2", "O2"], ["NO", "NO"], -180], // N2 + O2 -> 2NO(吸熱)
  [["NO", "NO", "O2"], ["NO2", "NO2"], 428], // 2NO + O2 -> 2NO2

  // 水素・ハロゲン化水素・水
  [["H2", "Cl2"], ["HCl", "HCl"], 185], // H2 + Cl2 -> 2HCl
  [["H2", "F2"], ["HF", "HF"], 542], // H2 + F2 -> 2HF
  [["H2", "H2", "O2"], ["H2O", "H2O"], 484], // 2H2 + O2 -> 2H2O
  [["H2", "O2"], ["H2O2"], 136], // H2 + O2 -> H2O2(過酸化水素)
  [["H2", "H2", "S2"], ["H2S", "H2S"], 41], // 2H2 + S2 -> 2H2S

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

  // ウランのフッ素化(ウラン濃縮で使う六フッ化ウランUF6へ逐次付加)。
  // 現実の濃縮は同位体を区別せずUF6にするので、U235・U238どちらからも作れる。
  [["U235", "F2"], ["UF2"], 1100],
  [["U238", "F2"], ["UF2"], 1100],
  [["UF2", "F2"], ["UF4"], 900],
  [["UF4", "F2"], ["UF6"], 500],
  // ウランの塩素化
  [["U235", "Cl2"], ["UCl2"], 800],
  [["U238", "Cl2"], ["UCl2"], 800],
  [["UCl2", "Cl2"], ["UCl4"], 600],

  // 炭素の連鎖からベンゼンへ。不安定なC2・C4H4は経由しない。
  [["C", "C", "H2"], ["C2H2"], 227], // 2C + H2 -> C2H2(アセチレン)
  [["C2H2", "C2H2", "C2H2"], ["C6H6"], 597], // 3C2H2 -> C6H6(アセチレンの三量化でベンゼン)

  // 硫酸の合成(接触法)。二酸化硫黄を三酸化硫黄に酸化し、水と反応させて硫酸へ。
  [["SO2", "SO2", "O2"], ["SO3", "SO3"], 198], // 2SO2 + O2 -> 2SO3
  [["SO3", "H2O"], ["H2SO4"], 130], // SO3 + H2O -> H2SO4(激しい発熱)

  // 硝酸の合成(オストワルト法の最終段)。二酸化窒素を水に溶かして硝酸にする。
  [["NO2", "NO2", "NO2", "NO2", "O2", "H2O", "H2O"], ["HNO3", "HNO3", "HNO3", "HNO3"], 300], // 4NO2 + O2 + 2H2O -> 4HNO3

  // 王水の生成。濃硝酸と濃塩酸(HCl)を混ぜてつくる。ゲーム内では金の溶解が
  // 原子数保存で閉じるよう HNO3 + 4HCl の組成として1つの物質にまとめている。
  [["HNO3", "HCl", "HCl", "HCl", "HCl"], ["王水"], 20],

  // 酢酸の合成。アセチレンを水和してアセトアルデヒドにし、それを酸化して酢酸にする。
  [["C2H2", "H2O"], ["CH3CHO"], 150], // C2H2 + H2O -> CH3CHO(アセチレンの水和)
  [["CH3CHO", "CH3CHO", "O2"], ["CH3COOH", "CH3COOH"], 590], // 2CH3CHO + O2 -> 2CH3COOH

  // 銅を酸で溶かす。銅は塩酸や希硫酸には溶けず、酸化力のある酸(熱濃硫酸・硝酸)にだけ溶ける。
  [["Cu", "H2SO4", "H2SO4"], ["CuSO4", "SO2", "H2O", "H2O"], 100], // Cu + 2H2SO4 -> CuSO4 + SO2 + 2H2O(熱濃硫酸)
  [["Cu", "Cu", "Cu", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3"],
   ["Cu(NO3)2", "Cu(NO3)2", "Cu(NO3)2", "NO", "NO", "H2O", "H2O", "H2O", "H2O"], 300], // 3Cu + 8HNO3 -> 3Cu(NO3)2 + 2NO + 4H2O(希硝酸)
  [["Cu", "HNO3", "HNO3", "HNO3", "HNO3"], ["Cu(NO3)2", "NO2", "NO2", "H2O", "H2O"], 250], // Cu + 4HNO3 -> Cu(NO3)2 + 2NO2 + 2H2O(濃硝酸)

  // 銅を塩素と直接反応させて塩化銅にする(銅は塩酸には溶けない)。
  [["Cu", "Cl2"], ["CuCl2"], 220], // Cu + Cl2 -> CuCl2

  // 銀を硝酸で溶かす。銀も酸化力のある硝酸にだけ溶けて硝酸銀になる。
  [["Ag", "Ag", "Ag", "HNO3", "HNO3", "HNO3", "HNO3"], ["AgNO3", "AgNO3", "AgNO3", "NO", "H2O", "H2O"], 200], // 3Ag + 4HNO3 -> 3AgNO3 + NO + 2H2O(希硝酸)
  [["Ag", "HNO3", "HNO3"], ["AgNO3", "NO2", "H2O"], 160], // Ag + 2HNO3 -> AgNO3 + NO2 + H2O(濃硝酸)

  // 硝酸銀に塩化水素(塩酸)を加えると塩化銀が白く沈殿する。塩化物イオン検出の定番反応。
  [["AgNO3", "HCl"], ["AgCl", "HNO3"], 66], // AgNO3 + HCl -> AgCl↓ + HNO3

  // 金を王水で溶かす。金はどんな単一の酸にも溶けず、王水にだけ溶けて金酸になる。
  [["Au", "王水"], ["HAuCl4", "NO", "H2O", "H2O"], 100], // Au + (HNO3 + 4HCl) -> HAuCl4 + NO + 2H2O

  // 王水は金専用ではなく、硝酸に溶ける金属(Zn・Fe・Cu)ならどれも溶かす。
  // 銀だけは表面にAgClの不動態膜ができて王水にも溶けにくいため対象外。
  [["Zn", "Zn", "Zn", "王水", "王水"], ["ZnCl2", "ZnCl2", "ZnCl2", "NO", "NO", "H2O", "H2O", "H2O", "H2O"], 330], // 3Zn + 2(HNO3+4HCl) -> 3ZnCl2 + 2NO + 4H2O
  [["Cu", "Cu", "Cu", "王水", "王水"], ["CuCl2", "CuCl2", "CuCl2", "NO", "NO", "H2O", "H2O", "H2O", "H2O"], 310], // 3Cu + 2(HNO3+4HCl) -> 3CuCl2 + 2NO + 4H2O
  // 鉄は王水では酸化力の強さから3価の塩化鉄(III)になる。塩酸比が3:1で割り切れず1HClが余る。
  [["Fe", "王水"], ["FeCl3", "NO", "H2O", "H2O", "HCl"], 340], // Fe + (HNO3+4HCl) -> FeCl3 + NO + 2H2O + HCl

  // イオン化傾向が水素より大きい金属(Na・Ca・Zn・Fe)を希塩酸に溶かす。
  // 貴金属と違い、これらは塩酸・希硫酸にも溶けて水素(H2)を発生する。
  [["Zn", "HCl", "HCl"], ["ZnCl2", "H2"], 153], // Zn + 2HCl -> ZnCl2 + H2
  [["Fe", "HCl", "HCl"], ["FeCl2", "H2"], 88], // Fe + 2HCl -> FeCl2 + H2
  [["Na", "Na", "HCl", "HCl"], ["NaCl", "NaCl", "H2"], 638], // 2Na + 2HCl -> 2NaCl + H2(激しく反応)
  [["Ca", "HCl", "HCl"], ["CaCl2", "H2"], 465], // Ca + 2HCl -> CaCl2 + H2

  // 同じ金属を希硫酸に溶かす(こちらも水素が発生する)。
  [["Zn", "H2SO4"], ["ZnSO4", "H2"], 143], // Zn + H2SO4 -> ZnSO4 + H2
  [["Fe", "H2SO4"], ["FeSO4", "H2"], 100], // Fe + H2SO4 -> FeSO4 + H2
  [["Na", "Na", "H2SO4"], ["Na2SO4", "H2"], 640], // 2Na + H2SO4 -> Na2SO4 + H2
  [["Ca", "H2SO4"], ["CaSO4", "H2"], 470], // Ca + H2SO4 -> CaSO4 + H2

  // 金属を硝酸に溶かす。ゲームでは酸の濃度を区別しないので、鉄のように濃硝酸では
  // 不動態化する金属も「溶ける方(=希硝酸)」で溶かす。水素ではなく一酸化窒素(NO)が発生する。
  [["Zn", "Zn", "Zn", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3", "HNO3"],
   ["Zn(NO3)2", "Zn(NO3)2", "Zn(NO3)2", "NO", "NO", "H2O", "H2O", "H2O", "H2O"], 320], // 3Zn + 8HNO3 -> 3Zn(NO3)2 + 2NO + 4H2O
  // 鉄は希硝酸に溶けて3価の硝酸鉄(III)になる(濃硝酸では不動態化して溶けないが濃度は考慮しない)。
  [["Fe", "HNO3", "HNO3", "HNO3", "HNO3"], ["Fe(NO3)3", "NO", "H2O", "H2O"], 330], // Fe + 4HNO3 -> Fe(NO3)3 + NO + 2H2O

  // Na・Caはイオン化傾向が非常に大きく、貴金属と違い酸化力を借りずとも硝酸と激しく反応して
  // 水素(H2)を発生する(HCl・H2SO4との反応と同じパターン)。
  [["Na", "Na", "HNO3", "HNO3"], ["NaNO3", "NaNO3", "H2"], 630], // 2Na + 2HNO3 -> 2NaNO3 + H2
  [["Ca", "HNO3", "HNO3"], ["Ca(NO3)2", "H2"], 460], // Ca + 2HNO3 -> Ca(NO3)2 + H2

  // 銀を硫酸に溶かす。ゲームでは濃度を区別しないので溶ける方(=熱濃硫酸)で溶かし、SO2を出す。
  [["Ag", "Ag", "H2SO4", "H2SO4"], ["Ag2SO4", "SO2", "H2O", "H2O"], 80], // 2Ag + 2H2SO4 -> Ag2SO4 + SO2 + 2H2O
];

// 中性子はどの反応レシピにも「反応物」として登場させない。
// 通常の合体反応(2物質→1物質)ではなく、game.js側で特別扱いする「核反応」の
// トリガーとしてのみ使うため。中性子が当たったときの挙動は同位体で異なる:
//   - U235・Pu239 … 即座に核分裂する(FISSION_TARGETS)
//   - U238        … 中性子を捕獲してU239になる(NEUTRON_CAPTURE)。U239は
//                    時間差でβ崩壊してPu239になる(DECAYS)
//
// FISSION_TARGETS: トリガー物質ID → { energyKJ, outcomes: [分裂パターン...] }。
// 実際の核分裂は破片核種の組み合わせが確率的に変わるので、代表的な分裂パターンを
// 複数用意し、各パターンの weight(重み)で確率的に1つ選ぶ。
// 各パターン: { fragments: [生成核種ID...], neutrons: 放出中性子数, weight: 相対確率 }
//
// 核分裂1回のエネルギーは約200MeV。1molあたりに換算すると
//   200e6 eV × 1.602e-19 J/eV × 6.022e23 /mol ≒ 1.93e13 J/mol = 1.93e10 kJ/mol
// 化学反応(数百kJ/mol)の約1億倍という、核エネルギーの桁違いの大きさを表す。
// エネルギーはどのパターンでもほぼ同じなのでターゲット共通で持たせる。
const FISSION_OUTCOMES = [
  // バリウム + クリプトン + 3n(教科書で最も有名なU-235の分裂)。
  { fragments: ["Ba", "Kr"], neutrons: 3, weight: 4 },
  // キセノン + ストロンチウム + 2n。
  { fragments: ["Xe", "Sr"], neutrons: 2, weight: 3 },
  // ヨウ素 + イットリウム + 2n。
  { fragments: ["I", "Y"], neutrons: 2, weight: 2 },
  // セシウム + ルビジウム + 2n。
  { fragments: ["Cs", "Rb"], neutrons: 2, weight: 1 },
];
export const FISSION_TARGETS = {
  U235: { energyKJ: 1.93e10, outcomes: FISSION_OUTCOMES },
  Pu239: { energyKJ: 1.93e10, outcomes: FISSION_OUTCOMES },
};

// 中性子捕獲: 核分裂せず中性子を吸って別の核種に変わる反応。
// トリガー物質ID → 捕獲後の物質ID。U238 + n -> U239。
export const NEUTRON_CAPTURE = {
  U238: "U239",
};

// 時間差崩壊: 生成後、一定時間経つと自動的に別の核種へ変わる(β崩壊など)。
// 物質ID → { to: 変化後の物質ID, afterMs: 崩壊までの時間 }。U239 -> Pu239。
export const DECAYS = {
  U239: { to: "Pu239", afterMs: 2500 },
};

export function findNeutronCapture(id) {
  return NEUTRON_CAPTURE[id] ?? null;
}

export function findDecay(id) {
  return DECAYS[id] ?? null;
}

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

// 「遊び方」欄の反応式一覧を表示するための、元の記述順を保った反応レシピ一覧。
// REACTIONS は counts(Map)化・size降順ソートされていて表示順が崩れるため、
// RECIPES の並び(酸素まわり→窒素→…と話題ごとにまとまっている)をそのまま
// { reactants, products, enthalpyKJ } の形で公開する。
export const RECIPE_LIST = RECIPES.map(([reactants, products, enthalpyKJ]) => ({
  reactants,
  products,
  enthalpyKJ,
}));

// ゲーム開始時にランダムに降ってくる初期物質のID一覧。単体で存在しない元素は
// 二原子分子(H2,N2,O2,F2,Cl2,S2)で、金属・固体はそのまま単体(C,Na,Ca)で降らせる。
// Caは反応相手がO2・F2・Cl2に限られ他より合体しにくいため、登場回数を減らして
// 出現頻度そのものを下げている(重み付き抽選)。
//
// レア元素(放射性)の中性子(n)・ウランは、核燃料サイクルを時々体験できる程度に
// 抑えた低い出現頻度にする。他の物質(炭素=4など)に比べてかなり希にしか降ってこない。
// ウラン枠は、現実の天然ウランの同位体存在比(U235: 0.72%, U238: 99.28%)で
// U235とU238に配分している。そのためU235は極めて希にしか降ってこない。
const URANIUM_WEIGHT = 1.5; // ウラン全体の出現重み(炭素の半分以下に抑える)
export const INITIAL_SUBSTANCE_WEIGHTS = {
  H2: 8,
  O2: 4,
  N2: 4,
  C: 4,
  Cl2: 8,
  Na: 4,
  F2: 8,
  Ca: 4, // 反応相手が限られ溜まりやすいので少なめ
  S2: 4,
  n: 1, // レア(放射性): ごく希にしか降らせない
  U235: URANIUM_WEIGHT * 0.0072, // 天然存在比0.72%。希少な核分裂性ウラン
  U238: URANIUM_WEIGHT * 0.9928, // 天然存在比99.28%。核分裂しにくい大部分

  // イオン化傾向が水素より大きい卑金属。塩酸・希硫酸にも溶けるので反応相手が多い。
  Zn: 3,
  Fe: 3,
  // 貴金属(Cu・Ag・Au)。反応相手が強い酸(硝酸・王水)に限られるうえ、レアな金属を
  // 貴重な酸と組み合わせて溶かす達成感を出すため、卑金属より希少にしている。
  // ゲーム性が残る程度に、卑金属(=3・2)の約7割の重みに抑えた(×0.7)。
  Cu: 3 * 0.7,
  Ag: 2 * 0.7,
  // 金は王水にしか溶けず、溶かすには王水(硝酸+塩酸4)を用意する必要があり最も難しい。
  // その希少性を反映して、他の貴金属のさらに半分の重みにして最もレアにしている。
  Au: 2 * 0.7 * 0.5,
  // 強い酸。生成反応(接触法・オストワルト法など)でも作れるが、素材としても直接降らせる。
  // 塩酸(HCl)はFe・Zn・Na・Caとの反応で2個、王水生成で4個と消費量が多いので多めに降らせる。
  HCl: 5,
  H2SO4: 2,
  HNO3: 2,
  CH3COOH: 2,
};

// 重み付き抽選で降ってくる物質のIDを1つ選ぶ。
export function pickInitialSubstance() {
  const entries = Object.entries(INITIAL_SUBSTANCE_WEIGHTS);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let r = Math.random() * total;
  for (const [id, w] of entries) {
    r -= w;
    if (r < 0) return id;
  }
  return entries[entries.length - 1][0]; // 丸め誤差の保険
}

// どの反応レシピにも「反応物」として登場しない物質のIDの集合。
// これ以上他の物質と反応しない「終端物質」であり、game.js側で一定時間後に
// 自動消滅させる対象として扱う。
// ウランはフッ素(F2)・塩素(Cl2)の反応物なので自動的に終端物質から外れ、
// 生成物のUF6・UCl4などが終端物質(=一定時間で消滅)になる。
// 金属(Cu・Ag・Au)を酸で溶かしてできた塩(CuSO4・Cu(NO3)2・AgNO3・HAuCl4)も
// 反応物に登場しないため自動的に終端物質になり、「溶けたもの」として消滅する。
// 中性子・核分裂の破片(Y・I)はすり抜けて画面外で消える特殊粒子なので、
// 時間経過で消える終端物質からは除外する。
const REACTANT_IDS = new Set();
for (const [reactants] of RECIPES) {
  for (const id of reactants) REACTANT_IDS.add(id);
}
// 核反応に関わる物質(中性子で核分裂/捕獲するターゲット、時間差崩壊する核種)は
// 「これ以上反応しない終端物質」ではないので、時間消滅の対象から除外する。
const NUCLEAR_ACTIVE_IDS = new Set([
  ...Object.keys(FISSION_TARGETS), // 中性子で核分裂する(U235・Pu239)
  ...Object.keys(NEUTRON_CAPTURE), // 中性子を捕獲する(U238)
  ...Object.keys(DECAYS), // 時間差で別核種に崩壊する(U239)
]);
export const TERMINAL_SUBSTANCE_IDS = new Set(
  Object.keys(SUBSTANCES).filter(
    (id) => !REACTANT_IDS.has(id) && !isPassthrough(id) && !NUCLEAR_ACTIVE_IDS.has(id)
  )
);

export function isTerminalSubstance(id) {
  return TERMINAL_SUBSTANCE_IDS.has(id);
}
