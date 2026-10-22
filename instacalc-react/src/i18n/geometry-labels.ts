import type { Locale } from "@/config/site";

/** Labels for the diagonal, triangle and concrete tools. */
export interface GeoCopy {
  eyebrow: string;
  shape: string;
  rectangle: string;
  square: string;
  rightTriangle: string;
  cuboid: string;
  polygon: string;
  sss: string;
  sas: string;
  asa: string;
  length: string;
  width: string;
  height: string;
  side: string;
  sideA: string;
  sideB: string;
  sideLength: string;
  sides: string;
  diagonal: string;
  hypotenuse: string;
  area: string;
  perimeter: string;
  formula: string;
  angleA: string;
  angleB: string;
  trigRatios: string;
  classification: string;
  units: string;
  squareUnits: string;
  volume: string;
  dryVolume: string;
  cement: string;
  cementBags: string;
  sand: string;
  aggregate: string;
  mixGrade: string;
  mixRatio: string;
  wastage: string;
  slab: string;
  column: string;
  beam: string;
  footing: string;
  staircase: string;
  circle: string;
  wall: string;
  thickness: string;
  diameter: string;
  quantity: string;
  tread: string;
  riser: string;
}

const en: GeoCopy = {
  eyebrow: "Geometry and Construction",
  shape: "Shape",
  rectangle: "Rectangle",
  square: "Square",
  rightTriangle: "Right Triangle",
  cuboid: "Box / Cuboid",
  polygon: "Polygon",
  sss: "SSS (three sides)",
  sas: "SAS (two sides + angle)",
  asa: "ASA (angle + side + angle)",
  length: "Length",
  width: "Width",
  height: "Height",
  side: "Side Length",
  sideA: "Side A",
  sideB: "Side B",
  sideLength: "Side Length",
  sides: "Number of Sides",
  diagonal: "Diagonal",
  hypotenuse: "Hypotenuse (c)",
  area: "Area",
  perimeter: "Perimeter",
  formula: "Formula",
  angleA: "Angle A",
  angleB: "Angle B",
  trigRatios: "Trigonometric Ratios",
  classification: "Triangle Type",
  units: "units",
  squareUnits: "sq units",
  volume: "Wet Volume",
  dryVolume: "Required Volume",
  cement: "Cement",
  cementBags: "Cement Bags (50 kg)",
  sand: "Sand",
  aggregate: "Aggregate",
  mixGrade: "Concrete Grade",
  mixRatio: "Mix Ratio (C : S : A)",
  wastage: "Extra Wastage (%)",
  slab: "Slab",
  column: "Column",
  beam: "Beam",
  footing: "Footing",
  staircase: "Staircase",
  circle: "Circular Column",
  wall: "Wall",
  thickness: "Thickness",
  diameter: "Diameter",
  quantity: "Quantity",
  tread: "Tread",
  riser: "Riser",
};

const ja: GeoCopy = {
  ...en,
  eyebrow: "幾何と建設",
  shape: "形状",
  rectangle: "長方形",
  square: "正方形",
  rightTriangle: "直角三角形",
  cuboid: "直方体",
  polygon: "多角形",
  sss: "三辺",
  sas: "二辺と挟角",
  asa: "二角と辺",
  length: "長さ",
  width: "幅",
  height: "高さ",
  side: "一辺の長さ",
  sideA: "辺 A",
  sideB: "辺 B",
  sideLength: "一辺の長さ",
  sides: "辺の数",
  diagonal: "対角線",
  hypotenuse: "斜辺 (c)",
  area: "面積",
  perimeter: "周長",
  formula: "公式",
  angleA: "角 A",
  angleB: "角 B",
  trigRatios: "三角比",
  classification: "三角形の種類",
  units: "単位",
  squareUnits: "平方単位",
  volume: "生体積",
  dryVolume: "必要体積",
  cement: "セメント",
  cementBags: "セメント袋 (50 kg)",
  sand: "砂",
  aggregate: "骨材",
  mixGrade: "コンクリートの種類",
  mixRatio: "配合比 (C : S : A)",
  wastage: "ロス率 (%)",
  slab: "スラブ",
  column: "柱",
  beam: "梁",
  footing: "基礎",
  staircase: "階段",
  circle: "円柱",
  wall: "壁",
  thickness: "厚さ",
  diameter: "直径",
  quantity: "数量",
  tread: "踏面幅",
  riser: "蹴上げ",
};

const ru: GeoCopy = {
  ...en,
  eyebrow: "Геометрия и строительство",
  shape: "Фигура",
  rectangle: "Прямоугольник",
  square: "Квадрат",
  rightTriangle: "Прямоугольный треугольник",
  cuboid: "Прямоугольный параллелепипед",
  polygon: "Многоугольник",
  sss: "По трём сторонам",
  sas: "По двум сторонам и углу",
  asa: "По углу, стороне и углу",
  length: "Длина",
  width: "Ширина",
  height: "Высота",
  side: "Длина стороны",
  sideA: "Сторона A",
  sideB: "Сторона B",
  sideLength: "Длина стороны",
  sides: "Число сторон",
  diagonal: "Диагональ",
  hypotenuse: "Гипотенуза (c)",
  area: "Площадь",
  perimeter: "Периметр",
  formula: "Формула",
  angleA: "Угол A",
  angleB: "Угол B",
  trigRatios: "Тригонометрические отношения",
  classification: "Тип треугольника",
  units: "ед.",
  squareUnits: "кв. ед.",
  volume: "Объём бетона",
  dryVolume: "Требуемый объём",
  cement: "Цемент",
  cementBags: "Мешки цемента (50 кг)",
  sand: "Песок",
  aggregate: "Щебень",
  mixGrade: "Марка бетона",
  mixRatio: "Пропорция (Ц : П : Щ)",
  wastage: "Запас (%)",
  slab: "Плита",
  column: "Колонна",
  beam: "Балка",
  footing: "Фундамент",
  staircase: "Лестница",
  circle: "Круглая колонна",
  wall: "Стена",
  thickness: "Толщина",
  diameter: "Диаметр",
  quantity: "Количество",
  tread: "Ступень",
  riser: "Подступенок",
};

const us: GeoCopy = { ...en, eyebrow: "Geometry and Construction" };

const ko: GeoCopy = {
  ...en,
  eyebrow: "기하학 및 건축 자재 계산",
  shape: "구조물 형태",
  rectangle: "직사각형",
  square: "정사각형",
  rightTriangle: "직각삼각형",
  cuboid: "직육면체",
  polygon: "정다각형",
  sss: "세 변 (SSS)",
  sas: "두 변과 끼인각 (SAS)",
  asa: "두 각과 끼인변 (ASA)",
  length: "길이 (m)",
  width: "너비/가로 (m)",
  height: "높이/세로 (m)",
  side: "한 변의 길이",
  sideA: "변 A",
  sideB: "변 B",
  sideLength: "변의 길이",
  sides: "변의 개수 (n)",
  diagonal: "대각선 길이",
  hypotenuse: "빗변 (c)",
  area: "단면적/넓이",
  perimeter: "둘레",
  formula: "적용 공식",
  angleA: "각 A (°)",
  angleB: "각 B (°)",
  trigRatios: "삼각비 (sin·cos·tan)",
  classification: "삼각형 판별",
  units: "단위",
  squareUnits: "단위²",
  volume: "타설 체적 (루베 / m³)",
  dryVolume: "소요 체적 (할증 포함)",
  cement: "시멘트 중량",
  cementBags: "시멘트 (40kg 포대)",
  sand: "모래 (골재)",
  aggregate: "자갈 (굵은골재)",
  mixGrade: "콘크리트 배합 강도",
  mixRatio: "배합비 (시멘트 : 모래 : 자갈)",
  wastage: "현장 할증률 (%)",
  slab: "슬래브 (바닥/슬라브)",
  column: "기둥",
  beam: "보 (하리)",
  footing: "독립기초 (푸팅)",
  staircase: "계단",
  circle: "원형 기둥",
  wall: "옹벽 / 벽체",
  thickness: "두께 (m)",
  diameter: "지름 (m)",
  quantity: "수량 (개소)",
  tread: "디딤판 깊이 (m)",
  riser: "챌판 높이 (m)",
};
const ALL: Record<Locale, GeoCopy> = { en, us, ja, ru, ko };

export function geoCopy(locale: Locale): GeoCopy {
  return ALL[locale] ?? en;
}
