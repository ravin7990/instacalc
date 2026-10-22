import type { Locale } from "@/config/site";

/** Labels for the cat age, gallon and geometry tools. */
export interface CatCopy {
  eyebrow: string;
  catAge: string;
  humanAge: string;
  lifeStage: string;
  lifeExpectancy: string;
  remainingYears: string;
  lifespanUsed: string;
  projection: string;
  rounding: string;
  oneDecimal: string;
  wholeYears: string;
  yearsSuffix: string;
}

const en: CatCopy = {
  eyebrow: "Pet Age",
  catAge: "Cat Age",
  humanAge: "Human Equivalent",
  lifeStage: "Life Stage",
  lifeExpectancy: "Typical Lifespan",
  remainingYears: "Years Remaining",
  lifespanUsed: "of lifespan used",
  projection: "Year-by-Year Conversion",
  rounding: "Rounding",
  oneDecimal: "One decimal",
  wholeYears: "Whole years",
  yearsSuffix: "years",
};

const ja: CatCopy = {
  ...en,
  eyebrow: "ペットの年齢",
  catAge: "猫の年齢",
  humanAge: "人間換算年齢",
  lifeStage: "ライフステージ",
  lifeExpectancy: "平均寿命",
  remainingYears: "残り年数",
  lifespanUsed: "寿命の割合",
  projection: "年数別換算表",
  rounding: "丸め",
  oneDecimal: "小数第一位",
  wholeYears: "整数",
  yearsSuffix: "年",
};

const ru: CatCopy = {
  ...en,
  eyebrow: "Возраст питомца",
  catAge: "Возраст кошки",
  humanAge: "В человеческих годах",
  lifeStage: "Стадия жизни",
  lifeExpectancy: "Средняя продолжительность жизни",
  remainingYears: "Осталось лет",
  lifespanUsed: "от срока жизни",
  projection: "Пересчёт по годам",
  rounding: "Округление",
  oneDecimal: "До десятых",
  wholeYears: "Целые числа",
  yearsSuffix: "лет",
};

const us: CatCopy = { ...en };

const ko: CatCopy = {
  ...en,
  eyebrow: "반려동물 나이",
  catAge: "고양이 나이",
  humanAge: "사람 나이로 환산",
  lifeStage: "생애 단계",
  lifeExpectancy: "평균 수명",
  remainingYears: "남은 수년",
  lifespanUsed: "수명 대비",
  projection: "연도별 환산표",
  rounding: "반올림",
  oneDecimal: "소수점 첫째 자리",
  wholeYears: "정수",
  yearsSuffix: "년",
};

const ALL: Record<Locale, CatCopy> = { en, us, ja, ru, ko };

export function catCopy(locale: Locale): CatCopy {
  return ALL[locale] ?? en;
}
