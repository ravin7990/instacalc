import type { Locale } from "@/config/site";

/** Labels for the gallon-to-litre converter. */
export interface VolCopy {
  eyebrow: string;
  amount: string;
  from: string;
  to: string;
  swap: string;
  result: string;
  litres: string;
  usGallons: string;
  imperialGallons: string;
  quarts: string;
  pints: string;
  cups: string;
  fluidOunces: string;
  millilitres: string;
  cubicFeet: string;
}

const en: VolCopy = {
  eyebrow: "Volume Conversion",
  amount: "Amount",
  from: "Convert From",
  to: "Convert To",
  swap: "Swap Units",
  result: "Result",
  litres: "Litres (L)",
  usGallons: "US Gallons",
  imperialGallons: "Imperial Gallons",
  quarts: "Quarts (qt)",
  pints: "Pints (pt)",
  cups: "Cups",
  fluidOunces: "Fluid Ounces (fl oz)",
  millilitres: "Millilitres (mL)",
  cubicFeet: "Cubic Feet (ft³)",
};

const ja: VolCopy = {
  ...en,
  eyebrow: "体積換算",
  amount: "数値",
  from: "換算元",
  to: "換算先",
  swap: "単位を入れ替え",
  result: "結果",
  litres: "リットル (L)",
  usGallons: "米ガロン",
  imperialGallons: "英ガロン",
  quarts: "クォート (qt)",
  pints: "パイント (pt)",
  cups: "カップ",
  fluidOunces: "液量オンス (fl oz)",
  millilitres: "ミリリットル (mL)",
  cubicFeet: "立方フィート (ft³)",
};

const ru: VolCopy = {
  ...en,
  eyebrow: "Перевод объёма",
  amount: "Количество",
  from: "Перевести из",
  to: "Перевести в",
  swap: "Поменять местами",
  result: "Результат",
  litres: "Литры (L)",
  usGallons: "Галлоны (США)",
  imperialGallons: "Имперские галлоны",
  quarts: "Кварты (qt)",
  pints: "Пинты (pt)",
  cups: "Стаканы",
  fluidOunces: "Жидкие унции (fl oz)",
  millilitres: "Миллилитры (mL)",
  cubicFeet: "Кубические футы (ft³)",
};

const us: VolCopy = {
  ...en,
  litres: "Liters (L)",
  millilitres: "Milliliters (mL)",
};

const ko: VolCopy = {
  ...en,
  eyebrow: "부피 환산",
  amount: "수량",
  from: "변환 기준",
  to: "변환 대상",
  swap: "단위 교환",
  result: "결과",
  litres: "리터 (L)",
  usGallons: "미국 갤런",
  imperialGallons: "영국 갤런",
  quarts: "쿼트 (qt)",
  pints: "파인트 (pt)",
  cups: "컵",
  fluidOunces: "플루이드 온스 (fl oz)",
  millilitres: "밀리리터 (mL)",
  cubicFeet: "세제곱피트 (ft³)",
};

const ALL: Record<Locale, VolCopy> = { en, us, ja, ru, ko };

export function volCopy(locale: Locale): VolCopy {
  return ALL[locale] ?? en;
}
