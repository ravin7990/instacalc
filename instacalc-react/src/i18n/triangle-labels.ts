import type { Locale } from "@/config/site";

export interface TriangleLabels {
  eyebrow: string;
  heroPoints: [string, string, string];
  title: string;
  selectType: string;
  unit: string;
  calculate: string;
  clearAll: string;
  resetDefaults: string;
  methodLabel: string;
  modes: {
    right: string;
    trapezoid: string;
    any3: string;
    isosceles: string;
    scalene: string;
    obtuse: string;
  };
  any3Methods: {
    sss: string;
    sas: string;
    asa: string;
  };
  fields: {
    sideA: string;
    sideB: string;
    sideC: string;
    angleY: string;
    angleZ: string;
    angleX: string;
    heightH: string;
    baseC: string;
    offsetW: string;
    topBaseW: string;
    botBaseC: string;
    equalLegA: string;
    apexAngleA: string;
    baseAngleB: string;
    sideSmallA: string;
    sideSmallB: string;
    sideSmallC: string;
    angleA: string;
    angleB: string;
    angleC: string;
    clearField: string;
  };
  results: {
    hypotenuse: string;
    sideA: string;
    sideB: string;
    sideC: string;
    angleX: string;
    angleY: string;
    angleZ: string;
    angleA: string;
    angleB: string;
    angleC: string;
    area: string;
    perimeter: string;
    semiPerimeter: string;
    inradius: string;
    circumradius: string;
    taperAngle: string;
    slantEdge: string;
    centralHeight: string;
    baseLength: string;
    equalLegs: string;
    baseAngles: string;
    altitudeBaseRatio: string;
    topBase: string;
    botBase: string;
    baseDiff: string;
    trigRatios: string;
    classification: string;
    solvedFrom: string;
    calcStatus: string;
    enter2Values: string;
    units: string;
    sqUnits: string;
  };
  diagramTitles: {
    right: string;
    trapezoid: string;
    any3: string;
    isosceles: string;
    scalene: string;
    obtuse: string;
  };
  summaries: {
    right: string;
    isosceles: string;
    obtuse: string;
    scalene: string;
    any3: string;
    trapezoid: string;
    result: string;
  };
  classifications: {
    right: string;
    isosceles: string;
    scalene: string;
    obtuse: string;
    acute: string;
    equilateral: string;
    trapezoid: string;
  };
}

const en: TriangleLabels = {
  eyebrow: "Shop Floor Trigonometry & Geometry",
  heroPoints: [
    "All 6 Triangle Modes with Real-Time Unit Switching: cm, m, mm, inch, ft, yard",
    "Individual ✕ Clear Buttons, Calculate Action & Clear All across All Shapes",
    "Flexible Multi-Parameter Solving for Right, Isosceles, Scalene, Obtuse & Trapezoid",
  ],
  title: "Triangle Calculator",
  selectType: "Select Triangle / Wedge Type",
  unit: "Measurement Unit",
  calculate: "Calculate",
  clearAll: "Clear All",
  resetDefaults: "Reset Defaults",
  methodLabel: "Calculation Method",
  modes: {
    right: "Right Triangle",
    trapezoid: "Right Trapezoid",
    any3: "Triangle (Any 3)",
    isosceles: "Isosceles (H, C)",
    scalene: "Scalene (H, C, W)",
    obtuse: "Obtuse (H, C, W)",
  },
  any3Methods: {
    sss: "3 Sides (SSS)",
    sas: "2 Sides + Angle (SAS)",
    asa: "1 Side + 2 Angles (ASA)",
  },
  fields: {
    sideA: "Side A (Vertical Leg)",
    sideB: "Side B (Horizontal Base)",
    sideC: "Side C (Hypotenuse)",
    angleY: "Angle Y (Apex Angle)",
    angleZ: "Angle Z (Base Angle)",
    angleX: "Angle X (Right Angle)",
    heightH: "Vertical Height (H)",
    baseC: "Base Length (C)",
    offsetW: "Apex Offset / Overhang (W)",
    topBaseW: "Top Base Width (W)",
    botBaseC: "Bottom Base Width (C)",
    equalLegA: "Equal Side Length A (or B)",
    apexAngleA: "Apex Angle a (°)",
    baseAngleB: "Base Angle b° / c°",
    sideSmallA: "Side a",
    sideSmallB: "Side b",
    sideSmallC: "Side c",
    angleA: "Angle A (°)",
    angleB: "Angle B (°)",
    angleC: "Angle C (°)",
    clearField: "Clear field",
  },
  results: {
    hypotenuse: "Hypotenuse (c)",
    sideA: "Side A (Vertical Leg)",
    sideB: "Side B (Horizontal Base)",
    sideC: "Side C (Hypotenuse)",
    angleX: "Angle X (Right Angle)",
    angleY: "Angle Y (Apex Angle)",
    angleZ: "Angle Z (Base Angle)",
    angleA: "Angle A (a°)",
    angleB: "Angle B (b°)",
    angleC: "Angle C (c°)",
    area: "Area",
    perimeter: "Perimeter",
    semiPerimeter: "Semi-perimeter (s)",
    inradius: "Inradius (r)",
    circumradius: "Circumradius (R)",
    taperAngle: "Taper Bevel Angle",
    slantEdge: "Slanted Edge Length",
    centralHeight: "Central Height (H)",
    baseLength: "Base Length (C)",
    equalLegs: "Equal Legs (A = B)",
    baseAngles: "Base Angles (b° = c°)",
    altitudeBaseRatio: "Altitude to Base Ratio (H / C)",
    topBase: "Top Base (W)",
    botBase: "Bottom Base (C)",
    baseDiff: "Base Difference (|C - W|)",
    trigRatios: "Trig Ratios",
    classification: "Classification",
    solvedFrom: "Solved From",
    calcStatus: "Calculation Status",
    enter2Values: "Enter any 2 values to calculate",
    units: "units",
    sqUnits: "sq units",
  },
  diagramTitles: {
    right: "Right Angle Calculator (Side A, B, C & Angles Y, Z)",
    trapezoid: "Right Trapezoid / Taper Wedge (H, W, C)",
    any3: "Triangle (Enter any 3 values)",
    isosceles: "Isosceles Triangle (Enter H, C or Equal Legs A)",
    scalene: "Scalene Triangle (Enter H, C and W)",
    obtuse: "Obtuse Triangle (Enter H, C and W)",
  },
  summaries: {
    right: "Hypotenuse (C) & Area",
    isosceles: "Equal Leg & Area",
    obtuse: "Obtuse Angle & Area",
    scalene: "Scalene Area & Angles",
    any3: "Triangle Area & Perimeter",
    trapezoid: "Slant Edge & Area",
    result: "Result",
  },
  classifications: {
    right: "Right Triangle",
    isosceles: "Isosceles Triangle",
    scalene: "Scalene Triangle",
    obtuse: "Obtuse Triangle",
    acute: "Acute Triangle",
    equilateral: "Equilateral Triangle",
    trapezoid: "Right Trapezoid / Taper Wedge",
  },
};

const us: TriangleLabels = {
  ...en,
  eyebrow: "American Workshop Geometry & Rafter Framing",
  heroPoints: [
    "All 6 Triangle Modes with US & Imperial Units: inches, feet, yards, cm, mm, m",
    "Individual ✕ Clear Buttons, Calculate Action & Clear All for Fast Layout",
    "Roof Pitch, Rafter Lengths, SSS, SAS, Isosceles & Sheet Metal Duct Tapers",
  ],
  title: "Triangle Calculator (US)",
};

const ja: TriangleLabels = {
  eyebrow: "幾何学・三角法・製缶加工計算ツール",
  heroPoints: [
    "全6種類の三角形モードとリアルタイム単位換算（cm, m, mm, inch, ft, yard）",
    "各入力欄の個別✕クリアボタン、一括計算＆全消去機能完備",
    "直角・二等辺・不等辺・鈍角・直角台形テーパーの柔軟な寸法計算",
  ],
  title: "三角形計算機",
  selectType: "三角形・くさび形状を選択",
  unit: "測定単位",
  calculate: "計算する",
  clearAll: "すべてクリア",
  resetDefaults: "初期値に戻す",
  methodLabel: "計算方法",
  modes: {
    right: "直角三角形",
    trapezoid: "直角台形・テーパー",
    any3: "一般三角形（任意の3値）",
    isosceles: "二等辺三角形 (H, C)",
    scalene: "不等辺三角形 (H, C, W)",
    obtuse: "鈍角三角形 (H, C, W)",
  },
  any3Methods: {
    sss: "三辺 (SSS)",
    sas: "二辺と挟角 (SAS)",
    asa: "一辺と二角 (ASA)",
  },
  fields: {
    sideA: "辺 A (垂直/高さ)",
    sideB: "辺 B (底辺)",
    sideC: "辺 C (斜辺)",
    angleY: "角 Y (頂角)",
    angleZ: "角 Z (底角)",
    angleX: "角 X (直角 90°)",
    heightH: "垂直高さ (H)",
    baseC: "底辺の長さ (C)",
    offsetW: "張り出し量・オフセット (W)",
    topBaseW: "上底幅 (W)",
    botBaseC: "下底幅 (C)",
    equalLegA: "等辺の長さ A (または B)",
    apexAngleA: "頂角 a (°)",
    baseAngleB: "底角 b° / c°",
    sideSmallA: "辺 a",
    sideSmallB: "辺 b",
    sideSmallC: "辺 c",
    angleA: "角 A (°)",
    angleB: "角 B (°)",
    angleC: "角 C (°)",
    clearField: "クリア",
  },
  results: {
    hypotenuse: "斜辺 (c)",
    sideA: "辺 A (垂直)",
    sideB: "辺 B (底辺)",
    sideC: "辺 C (斜辺)",
    angleX: "直角 X",
    angleY: "角 Y (頂角)",
    angleZ: "角 Z (底角)",
    angleA: "角 A (a°)",
    angleB: "角 B (b°)",
    angleC: "角 C (c°)",
    area: "面積",
    perimeter: "周囲長",
    semiPerimeter: "半周長 (s)",
    inradius: "内接円の半径 (r)",
    circumradius: "外接円の半径 (R)",
    taperAngle: "テーパー片角",
    slantEdge: "斜辺の長さ",
    centralHeight: "中央の高さ (H)",
    baseLength: "底辺の長さ (C)",
    equalLegs: "等辺 (A = B)",
    baseAngles: "底角 (b° = c°)",
    altitudeBaseRatio: "高さ・底辺比 (H / C)",
    topBase: "上底幅 (W)",
    botBase: "下底幅 (C)",
    baseDiff: "底辺の差 (|C - W|)",
    trigRatios: "三角比",
    classification: "三角形の分類",
    solvedFrom: "計算元の値",
    calcStatus: "計算ステータス",
    enter2Values: "計算するには任意の2つの値を入力してください",
    units: "単位",
    sqUnits: "平方単位",
  },
  diagramTitles: {
    right: "直角三角形計算（辺A・B・斜辺C＆角度Y・Z）",
    trapezoid: "直角台形・ダクトテーパー（H, W, C）",
    any3: "一般三角形（任意の3値を入力）",
    isosceles: "二等辺三角形（高さH・底辺Cまたは等辺A）",
    scalene: "不等辺三角形（高さH・底辺C・オフセットW）",
    obtuse: "鈍角三角形（高さH・底辺C・張り出しW）",
  },
  summaries: {
    right: "斜辺 (C) ＆ 面積",
    isosceles: "等辺 ＆ 面積",
    obtuse: "鈍角 ＆ 面積",
    scalene: "不等辺 面積 ＆ 角度",
    any3: "三角形 面積 ＆ 周長",
    trapezoid: "斜辺 ＆ 面積",
    result: "計算結果",
  },
  classifications: {
    right: "直角三角形",
    isosceles: "二等辺三角形",
    scalene: "不等辺三角形",
    obtuse: "鈍角三角形",
    acute: "鋭角三角形",
    equilateral: "正三角形",
    trapezoid: "直角台形 / テーパー",
  },
};

const ko: TriangleLabels = {
  eyebrow: "현장 기하학 및 삼각법 계산기",
  heroPoints: [
    "모든 6가지 삼각형 모드 및 실시간 단위 변환 (cm, m, mm, inch, ft, yard)",
    "입력창별 개별 ✕ 지우기 버튼, 즉시 계산 및 전체 초기화 지원",
    "직각·이등변·부등변·둔각·사다리꼴 테이퍼 다중 변수 자동 해석",
  ],
  title: "삼각형 계산기",
  selectType: "삼각형 / 쐐기 형태 선택",
  unit: "측정 단위",
  calculate: "계산하기",
  clearAll: "전체 지우기",
  resetDefaults: "기본값 초기화",
  methodLabel: "계산 방식",
  modes: {
    right: "직각삼각형",
    trapezoid: "직각 사다리꼴·테이퍼",
    any3: "일반 삼각형 (임의의 3값)",
    isosceles: "이등변삼각형 (H, C)",
    scalene: "부등변삼각형 (H, C, W)",
    obtuse: "둔각삼각형 (H, C, W)",
  },
  any3Methods: {
    sss: "세 변 (SSS)",
    sas: "두 변과 끼인각 (SAS)",
    asa: "한 변과 양 끝각 (ASA)",
  },
  fields: {
    sideA: "변 A (수직/높이)",
    sideB: "변 B (밑변)",
    sideC: "변 C (빗변)",
    angleY: "각 Y (꼭지각)",
    angleZ: "각 Z (밑각)",
    angleX: "각 X (직각 90°)",
    heightH: "수직 높이 (H)",
    baseC: "밑변 길이 (C)",
    offsetW: "수평 편차·돌출량 (W)",
    topBaseW: "상부 너비 (W)",
    botBaseC: "하부 너비 (C)",
    equalLegA: "등변 길이 A (또는 B)",
    apexAngleA: "꼭지각 a (°)",
    baseAngleB: "밑각 b° / c°",
    sideSmallA: "변 a",
    sideSmallB: "변 b",
    sideSmallC: "변 c",
    angleA: "각 A (°)",
    angleB: "각 B (°)",
    angleC: "각 C (°)",
    clearField: "지우기",
  },
  results: {
    hypotenuse: "빗변 (c)",
    sideA: "변 A (수직변)",
    sideB: "변 B (밑변)",
    sideC: "변 C (빗변)",
    angleX: "직각 X (90°)",
    angleY: "각 Y (꼭지각)",
    angleZ: "각 Z (밑각)",
    angleA: "각 A (a°)",
    angleB: "각 B (b°)",
    angleC: "각 C (c°)",
    area: "넓이 / 단면적",
    perimeter: "둘레",
    semiPerimeter: "반둘레 (s)",
    inradius: "내접원 반지름 (r)",
    circumradius: "외접원 반지름 (R)",
    taperAngle: "테이퍼 각도",
    slantEdge: "빗변/경사면 길이",
    centralHeight: "중앙 높이 (H)",
    baseLength: "밑변 길이 (C)",
    equalLegs: "등변 (A = B)",
    baseAngles: "밑각 (b° = c°)",
    altitudeBaseRatio: "높이/밑변 비율 (H / C)",
    topBase: "상부 너비 (W)",
    botBase: "하부 너비 (C)",
    baseDiff: "밑변 차이 (|C - W|)",
    trigRatios: "삼각비 (sin, cos, tan)",
    classification: "삼각형 판별",
    solvedFrom: "계산 기준값",
    calcStatus: "계산 상태",
    enter2Values: "계산하려면 임의의 2개 값을 입력하세요",
    units: "단위",
    sqUnits: "단위²",
  },
  diagramTitles: {
    right: "직각삼각형 계산 (변 A·B·빗변 C 및 각도 Y·Z)",
    trapezoid: "직각 사다리꼴 / 닥트 테이퍼 (H, W, C)",
    any3: "일반 삼각형 (임의의 3개 값 입력)",
    isosceles: "이등변삼각형 (높이 H, 밑변 C 또는 등변 A)",
    scalene: "부등변삼각형 (높이 H, 밑변 C, 오프셋 W)",
    obtuse: "둔각삼각형 (높이 H, 밑변 C, 돌출량 W)",
  },
  summaries: {
    right: "빗변 (C) 및 넓이",
    isosceles: "등변 및 넓이",
    obtuse: "둔각 및 넓이",
    scalene: "부등변 넓이 및 각도",
    any3: "삼각형 넓이 및 둘레",
    trapezoid: "빗변 및 넓이",
    result: "계산 결과",
  },
  classifications: {
    right: "직각삼각형",
    isosceles: "이등변삼각형",
    scalene: "부등변삼각형",
    obtuse: "둔각삼각형",
    acute: "예각삼각형",
    equilateral: "정삼각형",
    trapezoid: "직각 사다리꼴 / 테이퍼 쐐기",
  },
};

const ru: TriangleLabels = {
  eyebrow: "Инженерная геометрия и тригонометрия",
  heroPoints: [
    "Все 6 режимов треугольников с мгновенным переводом единиц (см, м, мм, дюймы, футы, ярды)",
    "Индивидуальные кнопки сброса ✕, расчет и полная очистка полей",
    "Гибкий многопараметрический расчет для прямоугольных, равнобедренных, тупоугольных и трапеций",
  ],
  title: "Калькулятор треугольника",
  selectType: "Выберите тип треугольника / трапеции",
  unit: "Единица измерения",
  calculate: "Рассчитать",
  clearAll: "Очистить всё",
  resetDefaults: "Сбросить по умолчанию",
  methodLabel: "Метод расчета",
  modes: {
    right: "Прямоугольный",
    trapezoid: "Прямоугольная трапеция",
    any3: "Треугольник (любые 3)",
    isosceles: "Равнобедренный (H, C)",
    scalene: "Разносторонний (H, C, W)",
    obtuse: "Тупоугольный (H, C, W)",
  },
  any3Methods: {
    sss: "3 стороны (SSS)",
    sas: "2 стороны и угол (SAS)",
    asa: "1 сторона и 2 угла (ASA)",
  },
  fields: {
    sideA: "Катет A (вертикальный)",
    sideB: "Катет B (горизонтальный)",
    sideC: "Гипотенуза C",
    angleY: "Угол Y (вершинный)",
    angleZ: "Угол Z (при основании)",
    angleX: "Прямой угол X (90°)",
    heightH: "Высота (H)",
    baseC: "Длина основания (C)",
    offsetW: "Смещение / свес (W)",
    topBaseW: "Верхнее основание (W)",
    botBaseC: "Нижнее основание (C)",
    equalLegA: "Равная сторона A (или B)",
    apexAngleA: "Угол при вершине a (°)",
    baseAngleB: "Угол при основании b° / c°",
    sideSmallA: "Сторона a",
    sideSmallB: "Сторона b",
    sideSmallC: "Сторона c",
    angleA: "Угол A (°)",
    angleB: "Угол B (°)",
    angleC: "Угол C (°)",
    clearField: "Очистить",
  },
  results: {
    hypotenuse: "Гипотенуза (c)",
    sideA: "Сторона A (вертикальная)",
    sideB: "Сторона B (горизонтальная)",
    sideC: "Гипотенуза (c)",
    angleX: "Прямой угол X (90°)",
    angleY: "Угол Y (вершинный)",
    angleZ: "Угол Z (при основании)",
    angleA: "Угол A (a°)",
    angleB: "Угол B (b°)",
    angleC: "Угол C (c°)",
    area: "Площадь",
    perimeter: "Периметр",
    semiPerimeter: "Полупериметр (s)",
    inradius: "Радиус вписанной окр. (r)",
    circumradius: "Радиус описанной окр. (R)",
    taperAngle: "Угол сужения (уклон)",
    slantEdge: "Наклонная сторона",
    centralHeight: "Высота (H)",
    baseLength: "Длина основания (C)",
    equalLegs: "Равные стороны (A = B)",
    baseAngles: "Углы при основании (b° = c°)",
    altitudeBaseRatio: "Отношение высоты к базе (H / C)",
    topBase: "Верхнее основание (W)",
    botBase: "Нижнее основание (C)",
    baseDiff: "Разность оснований (|C - W|)",
    trigRatios: "Тригонометрия (sin, cos, tg)",
    classification: "Тип треугольника",
    solvedFrom: "Рассчитано по",
    calcStatus: "Статус расчета",
    enter2Values: "Введите любые 2 значения для расчета",
    units: "ед.",
    sqUnits: "кв. ед.",
  },
  diagramTitles: {
    right: "Прямоугольный треугольник (стороны A, B, C и углы Y, Z)",
    trapezoid: "Прямоугольная трапеция / уклон (H, W, C)",
    any3: "Произвольный треугольник (любые 3 значения)",
    isosceles: "Равнобедренный треугольник (высота H, основание C)",
    scalene: "Разносторонний треугольник (высота H, основание C, смещение W)",
    obtuse: "Тупоугольный треугольник (высота H, основание C, свес W)",
  },
  summaries: {
    right: "Гипотенуза (C) и площадь",
    isosceles: "Равная сторона и площадь",
    obtuse: "Тупой угол и площадь",
    scalene: "Площадь и углы",
    any3: "Площадь и периметр",
    trapezoid: "Наклонная сторона и площадь",
    result: "Результат",
  },
  classifications: {
    right: "Прямоугольный треугольник",
    isosceles: "Равнобедренный треугольник",
    scalene: "Разносторонний треугольник",
    obtuse: "Тупоугольный треугольник",
    acute: "Остроугольный треугольник",
    equilateral: "Равносторонний треугольник",
    trapezoid: "Прямоугольная трапеция / уклон",
  },
};

const es: TriangleLabels = {
  eyebrow: "Trigonometría y geometría técnica",
  heroPoints: [
    "6 modos de triángulos y trapecios con cambio de unidad en tiempo real: cm, m, mm, pulg, pies, yd",
    "Botones individuales ✕ para borrar campos, cálculo instantáneo y restablecimiento rápido",
    "Resolución multiparámetro para triángulo rectángulo, isósceles, escaleno, obtusángulo y trapecio",
  ],
  title: "Calculadora de Triángulos",
  selectType: "Seleccionar tipo de triángulo / cuña",
  unit: "Unidad de medida",
  calculate: "Calcular",
  clearAll: "Borrar todo",
  resetDefaults: "Restaurar valores",
  methodLabel: "Método de cálculo",
  modes: {
    right: "Triángulo rectángulo",
    trapezoid: "Trapecio rectángulo",
    any3: "Triángulo (3 datos)",
    isosceles: "Isósceles (H, C)",
    scalene: "Escaleno (H, C, W)",
    obtuse: "Obtusángulo (H, C, W)",
  },
  any3Methods: {
    sss: "3 lados (LLL)",
    sas: "2 lados + ángulo (LAL)",
    asa: "1 lado + 2 ángulos (ALA)",
  },
  fields: {
    sideA: "Cateto A (altura vertical)",
    sideB: "Cateto B (base horizontal)",
    sideC: "Lado C (hipotenusa)",
    angleY: "Ángulo Y (ángulo superior)",
    angleZ: "Ángulo Z (ángulo de base)",
    angleX: "Ángulo X (ángulo recto 90°)",
    heightH: "Altura vertical (H)",
    baseC: "Longitud de base (C)",
    offsetW: "Desplazamiento / voladizo (W)",
    topBaseW: "Base superior (W)",
    botBaseC: "Base inferior (C)",
    equalLegA: "Lado igual A (o B)",
    apexAngleA: "Ángulo del vértice a (°)",
    baseAngleB: "Ángulo de la base b° / c°",
    sideSmallA: "Lado a",
    sideSmallB: "Lado b",
    sideSmallC: "Lado c",
    angleA: "Ángulo A (°)",
    angleB: "Ángulo B (°)",
    angleC: "Ángulo C (°)",
    clearField: "Borrar campo",
  },
  results: {
    hypotenuse: "Hipotenusa (c)",
    sideA: "Cateto A (vertical)",
    sideB: "Cateto B (base horizontal)",
    sideC: "Lado C (hipotenusa)",
    angleX: "Ángulo X (recto)",
    angleY: "Ángulo Y (superior)",
    angleZ: "Ángulo Z (base)",
    angleA: "Ángulo A (a°)",
    angleB: "Ángulo B (b°)",
    angleC: "Ángulo C (c°)",
    area: "Área",
    perimeter: "Perímetro",
    semiPerimeter: "Semiperímetro (s)",
    inradius: "Inradio (r)",
    circumradius: "Circunradio (R)",
    taperAngle: "Ángulo de inclinación / bisel",
    slantEdge: "Longitud del lado inclinado",
    centralHeight: "Altura central (H)",
    baseLength: "Longitud de base (C)",
    equalLegs: "Lados iguales (A = B)",
    baseAngles: "Ángulos de base (b° = c°)",
    altitudeBaseRatio: "Relación altura / base (H / C)",
    topBase: "Base superior (W)",
    botBase: "Base inferior (C)",
    baseDiff: "Diferencia de bases (|C - W|)",
    trigRatios: "Razones trigonométricas",
    classification: "Clasificación",
    solvedFrom: "Calculado a partir de",
    calcStatus: "Estado del cálculo",
    enter2Values: "Introduce 2 valores cualesquiera para calcular",
    units: "unid.",
    sqUnits: "unid.²",
  },
  diagramTitles: {
    right: "Triángulo rectángulo (Lados A, B, C y ángulos Y, Z)",
    trapezoid: "Trapecio rectángulo / cuña (H, W, C)",
    any3: "Triángulo general (introduce 3 valores)",
    isosceles: "Triángulo isósceles (introduce H, C o lados iguales A)",
    scalene: "Triángulo escaleno (introduce H, C y W)",
    obtuse: "Triángulo obtusángulo (introduce H, C y W)",
  },
  summaries: {
    right: "Hipotenusa (C) y área",
    isosceles: "Lado igual y área",
    obtuse: "Ángulo obtuso y área",
    scalene: "Área y ángulos",
    any3: "Área y perímetro",
    trapezoid: "Lado inclinado y área",
    result: "Resultado",
  },
  classifications: {
    right: "Triángulo rectángulo",
    isosceles: "Triángulo isósceles",
    scalene: "Triángulo escaleno",
    obtuse: "Triángulo obtusángulo",
    acute: "Triángulo acutángulo",
    equilateral: "Triángulo equilátero",
    trapezoid: "Trapecio rectángulo / cuña",
  },
};

const ALL_LABELS: Record<Locale, TriangleLabels> = { en, us, ja, ru, ko, es };

export function triangleLabels(locale: Locale): TriangleLabels {
  return ALL_LABELS[locale] ?? en;
}

const METHOD_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {},
  us: {},
  es: {
    "Legs A and B (Pythagorean theorem)": "Catetos A y B (teorema de Pitágoras)",
    "Leg A and Hypotenuse C": "Cateto A e hipotenusa C",
    "Leg B and Hypotenuse C": "Cateto B e hipotenusa C",
    "Leg A and Apex Angle Y": "Cateto A y ángulo superior Y",
    "Leg A and Base Angle Z": "Cateto A y ángulo de base Z",
    "Leg B and Apex Angle Y": "Cateto B y ángulo superior Y",
    "Leg B and Base Angle Z": "Cateto B y ángulo de base Z",
    "Hypotenuse C and Apex Angle Y": "Hipotenusa C y ángulo superior Y",
    "Hypotenuse C and Base Angle Z": "Hipotenusa C y ángulo de base Z",
    "Height (H) & Base (C)": "Altura (H) y base (C)",
    "Equal Leg (A) & Base (C)": "Lado igual (A) y base (C)",
    "Equal Leg (A) & Height (H)": "Lado igual (A) y altura (H)",
    "Base (C) & Base Angle (B)": "Base (C) y ángulo de base (B)",
    "Base (C) & Apex Angle (A)": "Base (C) y ángulo del vértice (A)",
    "Height (H) & Base Angle (B)": "Altura (H) y ángulo de base (B)",
    "Height (H) & Apex Angle (A)": "Altura (H) y ángulo del vértice (A)",
    "Equal Leg (A) & Base Angle (B)": "Lado igual (A) y ángulo de base (B)",
    "Equal Leg (A) & Apex Angle (A)": "Lado igual (A) y ángulo del vértice (A)",
  },
  ja: {
    "Legs A and B (Pythagorean theorem)": "二辺 A・B（ピタゴラスの定理）",
    "Leg A and Hypotenuse C": "辺 A と斜辺 C",
    "Leg B and Hypotenuse C": "辺 B と斜辺 C",
    "Leg A and Apex Angle Y": "辺 A と頂角 Y",
    "Leg A and Base Angle Z": "辺 A と底角 Z",
    "Leg B and Apex Angle Y": "辺 B と頂角 Y",
    "Leg B and Base Angle Z": "辺 B と底角 Z",
    "Hypotenuse C and Apex Angle Y": "斜辺 C と頂角 Y",
    "Hypotenuse C and Base Angle Z": "斜辺 C と底角 Z",
    "Height (H) & Base (C)": "高さ (H) と底辺 (C)",
    "Equal Leg (A) & Base (C)": "等辺 (A) と底辺 (C)",
    "Equal Leg (A) & Height (H)": "等辺 (A) と高さ (H)",
    "Base (C) & Base Angle (B)": "底辺 (C) と底角 (B)",
    "Base (C) & Apex Angle (A)": "底辺 (C) と頂角 (A)",
    "Height (H) & Base Angle (B)": "高さ (H) と底角 (B)",
    "Height (H) & Apex Angle (A)": "高さ (H) と頂角 (A)",
    "Equal Leg (A) & Base Angle (B)": "等辺 (A) と底角 (B)",
    "Equal Leg (A) & Apex Angle (A)": "等辺 (A) と頂角 (A)",
  },
  ko: {
    "Legs A and B (Pythagorean theorem)": "두 변 A·B (피타고라스 정리)",
    "Leg A and Hypotenuse C": "변 A 및 빗변 C",
    "Leg B and Hypotenuse C": "변 B 및 빗변 C",
    "Leg A and Apex Angle Y": "변 A 및 꼭지각 Y",
    "Leg A and Base Angle Z": "변 A 및 밑각 Z",
    "Leg B and Apex Angle Y": "변 B 및 꼭지각 Y",
    "Leg B and Base Angle Z": "변 B 및 밑각 Z",
    "Hypotenuse C and Apex Angle Y": "빗변 C 및 꼭지각 Y",
    "Hypotenuse C and Base Angle Z": "빗변 C 및 밑각 Z",
    "Height (H) & Base (C)": "높이 (H) 및 밑변 (C)",
    "Equal Leg (A) & Base (C)": "등변 (A) 및 밑변 (C)",
    "Equal Leg (A) & Height (H)": "등변 (A) 및 높이 (H)",
    "Base (C) & Base Angle (B)": "밑변 (C) 및 밑각 (B)",
    "Base (C) & Apex Angle (A)": "밑변 (C) 및 꼭지각 (A)",
    "Height (H) & Base Angle (B)": "높이 (H) 및 밑각 (B)",
    "Height (H) & Apex Angle (A)": "높이 (H) 및 꼭지각 (A)",
    "Equal Leg (A) & Base Angle (B)": "등변 (A) 및 밑각 (B)",
    "Equal Leg (A) & Apex Angle (A)": "등변 (A) 및 꼭지각 (A)",
  },
  ru: {
    "Legs A and B (Pythagorean theorem)": "Катеты A и B (теорема Пифагора)",
    "Leg A and Hypotenuse C": "Катет A и гипотенуза C",
    "Leg B and Hypotenuse C": "Катет B и гипотенуза C",
    "Leg A and Apex Angle Y": "Катет A и угол Y",
    "Leg A and Base Angle Z": "Катет A и угол Z",
    "Leg B and Apex Angle Y": "Катет B и угол Y",
    "Leg B and Base Angle Z": "Катет B и угол Z",
    "Hypotenuse C and Apex Angle Y": "Гипотенуза C и угол Y",
    "Hypotenuse C and Base Angle Z": "Гипотенуза C и угол Z",
    "Height (H) & Base (C)": "Высота (H) и основание (C)",
    "Equal Leg (A) & Base (C)": "Равная сторона (A) и основание (C)",
    "Equal Leg (A) & Height (H)": "Равная сторона (A) и высота (H)",
    "Base (C) & Base Angle (B)": "Основание (C) и угол при основании (B)",
    "Base (C) & Apex Angle (A)": "Основание (C) и угол при вершине (A)",
    "Height (H) & Base Angle (B)": "Высота (H) и угол при основании (B)",
    "Height (H) & Apex Angle (A)": "Высота (H) и угол при вершине (A)",
    "Equal Leg (A) & Base Angle (B)": "Равная сторона (A) и угол при основании (B)",
    "Equal Leg (A) & Apex Angle (A)": "Равная сторона (A) и угол при вершине (A)",
  },
};

const ERROR_TRANSLATIONS: Record<Locale, Record<string, string>> = {
  en: {},
  us: {},
  es: {
    "Hypotenuse C must be strictly greater than leg A.": "La hipotenusa C debe ser estrictamente mayor que el cateto A.",
    "Hypotenuse C must be strictly greater than leg B.": "La hipotenusa C debe ser estrictamente mayor que el cateto B.",
    "Angles Y and Z must sum to 90 degrees.": "Los ángulos Y y Z deben sumar exactamente 90 grados.",
    "Please provide at least one side length (A, B, or C) to determine triangle size.":
      "Introduce al menos la longitud de un lado (A, B o C) para determinar el tamaño del triángulo.",
    "Please enter any 2 values to calculate the triangle.":
      "Introduce 2 valores cualesquiera para calcular el triángulo rectángulo.",
    "Please enter any 2 values to calculate the right triangle.":
      "Introduce 2 valores cualesquiera para calcular el triángulo rectángulo.",
    "Equal leg A must be strictly greater than height H.": "El lado igual A debe ser estrictamente mayor que la altura H.",
    "Base C must be strictly less than twice the equal leg A (C < 2A).":
      "La base C debe ser menor que el doble del lado igual A (C < 2A).",
    "Please provide at least one length (H, C, or A) to determine the triangle's scale.":
      "Introduce al menos una longitud (H, C o A) para determinar la escala del triángulo.",
    "Please enter any 2 values to calculate the isosceles triangle.":
      "Introduce 2 valores cualesquiera para calcular el triángulo isósceles.",
  },
  ja: {
    "Hypotenuse C must be strictly greater than leg A.": "斜辺 C は辺 A よりも長くなければなりません。",
    "Hypotenuse C must be strictly greater than leg B.": "斜辺 C は辺 B よりも長くなければなりません。",
    "Angles Y and Z must sum to 90 degrees.": "角 Y と角 Z の和は 90° でなければなりません。",
    "Please provide at least one side length (A, B, or C) to determine triangle size.":
      "三角形の大きさを確定するため、少なくとも1つの辺の長さ（A, B, または C）を入力してください。",
    "Please enter any 2 values to calculate the triangle.":
      "直角三角形を計算するには任意の2つの値を入力してください。",
    "Please enter any 2 values to calculate the right triangle.":
      "直角三角形を計算するには任意の2つの値を入力してください。",
    "Equal leg A must be strictly greater than height H.": "等辺 A は中央の高さ H よりも長くなければなりません。",
    "Base C must be strictly less than twice the equal leg A (C < 2A).":
      "底辺 C は等辺 A の2倍未満でなければなりません (C < 2A)。",
    "Please provide at least one length (H, C, or A) to determine the triangle's scale.":
      "三角形の大きさを確定するため、少なくとも1つの長さ（H, C, または A）を入力してください。",
    "Please enter any 2 values to calculate the isosceles triangle.":
      "二等辺三角形を計算するには任意の2つの値を入力してください。",
  },
  ko: {
    "Hypotenuse C must be strictly greater than leg A.": "빗변 C는 변 A보다 커야 합니다.",
    "Hypotenuse C must be strictly greater than leg B.": "빗변 C는 변 B보다 커야 합니다.",
    "Angles Y and Z must sum to 90 degrees.": "각 Y와 각 Z의 합은 90°여야 합니다.",
    "Please provide at least one side length (A, B, or C) to determine triangle size.":
      "삼각형 크기를 결정하려면 최소 1개의 변 길이(A, B 또는 C)를 입력해야 합니다.",
    "Please enter any 2 values to calculate the triangle.":
      "직각삼각형을 계산하려면 임의의 2개 값을 입력하세요.",
    "Please enter any 2 values to calculate the right triangle.":
      "직각삼각형을 계산하려면 임의의 2개 값을 입력하세요.",
    "Equal leg A must be strictly greater than height H.": "등변 A는 높이 H보다 커야 합니다.",
    "Base C must be strictly less than twice the equal leg A (C < 2A).":
      "밑변 C는 등변 A의 2倍 미만이어야 합니다 (C < 2A).",
    "Please provide at least one length (H, C, or A) to determine the triangle's scale.":
      "삼각형의 크기를 결정하려면 최소 1개의 길이(H, C 또는 A)를 입력해야 합니다.",
    "Please enter any 2 values to calculate the isosceles triangle.":
      "이등변삼각형을 계산하려면 임의의 2개 값을 입력하세요.",
  },
  ru: {
    "Hypotenuse C must be strictly greater than leg A.": "Гипотенуза C должна быть строго больше катета A.",
    "Hypotenuse C must be strictly greater than leg B.": "Гипотенуза C должна быть строго больше катета B.",
    "Angles Y and Z must sum to 90 degrees.": "Сумма углов Y и Z должна быть равна 90°.",
    "Please provide at least one side length (A, B, or C) to determine triangle size.":
      "Укажите хотя бы одну сторону (A, B или C) для определения масштаба треугольника.",
    "Please enter any 2 values to calculate the triangle.":
      "Введите любые 2 значения для расчета прямоугольного треугольника.",
    "Please enter any 2 values to calculate the right triangle.":
      "Введите любые 2 значения для расчета прямоугольного треугольника.",
    "Equal leg A must be strictly greater than height H.": "Равная сторона A должна быть строго больше высоты H.",
    "Base C must be strictly less than twice the equal leg A (C < 2A).":
      "Основание C должно быть меньше удвоенной стороны A (C < 2A).",
    "Please provide at least one length (H, C, or A) to determine the triangle's scale.":
      "Укажите хотя бы один линейный размер (H, C или A) для расчета треугольника.",
    "Please enter any 2 values to calculate the isosceles triangle.":
      "Введите любые 2 значения для расчета равнобедренного треугольника.",
  },
};

export function translateMethod(method: string, locale: Locale): string {
  return METHOD_TRANSLATIONS[locale]?.[method] ?? method;
}

export function translateError(error: string | undefined, locale: Locale): string {
  if (!error) return "";
  if (ERROR_TRANSLATIONS[locale]?.[error]) return ERROR_TRANSLATIONS[locale][error];
  if (locale === "ja" && error.includes("Please enter any 2 values")) {
    return "直角三角形を計算するには任意の2つの値を入力してください。";
  }
  if (locale === "ko" && error.includes("Please enter any 2 values")) {
    return "직각삼각형을 계산하려면 임의의 2개 값을 입력하세요.";
  }
  if (locale === "ru" && error.includes("Please enter any 2 values")) {
    return "Введите любые 2 значения для расчета прямоугольного треугольника.";
  }
  if (locale === "es" && error.includes("Please enter any 2 values")) {
    return "Introduce 2 valores cualesquiera para calcular el triángulo.";
  }
  return ERROR_TRANSLATIONS[locale]?.[error] ?? error;
}

export function translateClassification(c: string, t: TriangleLabels): string {
  if (c.includes("Right") || c === "直角三角形" || c === "Прямоугольный треугольник" || c === "직각삼각형") return t.classifications.right;
  if (c.includes("Equilateral") || c === "正三角形" || c === "Равносторонний треугольник" || c === "정삼각형") return t.classifications.equilateral;
  if (c.includes("Isosceles") || c === "二等辺三角形" || c === "Равнобедренный треугольник" || c === "이등변삼각형") return t.classifications.isosceles;
  if (c.includes("Obtuse") || c === "鈍角三角形" || c === "Тупоугольный треугольник" || c === "둔각삼각형") return t.classifications.obtuse;
  if (c.includes("Scalene") || c === "不等辺三角形" || c === "Разносторонний треугольник" || c === "부등변삼각형") return t.classifications.scalene;
  if (c.includes("Acute") || c === "鋭角三角形" || c === "Остроугольный треугольник" || c === "예각삼각형") return t.classifications.acute;
  if (c.includes("Trapezoid") || c === "直角台形" || c === "Прямоугольная трапеция" || c === "직각 사다리꼴") return t.classifications.trapezoid;
  return c;
}
