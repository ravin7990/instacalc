import type { Locale } from "@/config/site";

/** Field/result labels for the SIP and lumpsum planners. */
export interface SipCopy {
  monthly: string;
  rate: string;
  rateSuffix: string;
  years: string;
  yearsSuffix: string;
  stepUp: string;
  inflation: string;
  invested: string;
  corpus: string;
  returns: string;
  realCorpus: string;
  realReturns: string;
  progress: string;
  goal: string;
  goalTarget: string;
  goalYears: string;
  requiredSip: string;
  advanced: string;
  oneTime: string;
}

const en: SipCopy = {
  monthly: "Monthly SIP Amount",
  rate: "Expected Return Rate",
  rateSuffix: "%",
  years: "Investment Tenure",
  yearsSuffix: "years",
  stepUp: "Annual Step-Up",
  inflation: "Expected Inflation",
  invested: "Total Invested",
  corpus: "Estimated Corpus",
  returns: "Estimated Returns",
  realCorpus: "Inflation Adjusted Corpus",
  realReturns: "Real Gains",
  progress: "Year-wise Growth",
  goal: "Goal Planner",
  goalTarget: "Target Corpus",
  goalYears: "Years to Goal",
  requiredSip: "Required Monthly SIP",
  advanced: "Advanced Controls",
  oneTime: "One-Time Investment",
};

const ja: SipCopy = {
  monthly: "毎月の投資額",
  rate: "想定リターン率",
  rateSuffix: "%",
  years: "運用期間",
  yearsSuffix: "年",
  stepUp: "年次ステップアップ",
  inflation: "想定インフレ率",
  invested: "投資合計額",
  corpus: "運用終了時（元本＋収益）",
  returns: "推定収益額",
  realCorpus: "実質価値（インフレ調整後）",
  realReturns: "実質利益",
  progress: "年次推移",
  goal: "目標額プランナー",
  goalTarget: "目標資産額",
  goalYears: "目標までの年数",
  requiredSip: "必要な毎月の投資額",
  advanced: "詳細設定",
  oneTime: "一時払投資額",
};

const ru: SipCopy = {
  monthly: "Ежемесячный взнос",
  rate: "Ожидаемая доходность",
  rateSuffix: "%",
  years: "Срок инвестирования",
  yearsSuffix: "лет",
  stepUp: "Ежегодный шаг",
  inflation: "Ожидаемая инфляция",
  invested: "Всего вложено",
  corpus: "Итоговый капитал",
  returns: "Доход",
  realCorpus: "Капитал с учётом инфляции",
  realReturns: "Реальный доход",
  progress: "Рост по годам",
  goal: "Планировщик цели",
  goalTarget: "Целевой капитал",
  goalYears: "Лет до цели",
  requiredSip: "Нужный ежемесячный взнос",
  advanced: "Дополнительные настройки",
  oneTime: "Разовое вложение",
};

const us: SipCopy = {
  monthly: "Monthly Contribution",
  rate: "Expected Return",
  rateSuffix: "%",
  years: "Time Horizon",
  yearsSuffix: "years",
  stepUp: "Annual Step-Up",
  inflation: "Expected Inflation",
  invested: "Total Contributed",
  corpus: "Projected Balance",
  returns: "Investment Growth",
  realCorpus: "Inflation-Adjusted Balance",
  realReturns: "Real Gains",
  progress: "Year-by-Year Growth",
  goal: "Goal Planner",
  goalTarget: "Target Amount",
  goalYears: "Years to Goal",
  requiredSip: "Required Monthly Amount",
  advanced: "Advanced Controls",
  oneTime: "One-Time Investment",
};

const ko: SipCopy = {
  monthly: "월 투자 금액",
  rate: "예상 수익률",
  rateSuffix: "%",
  years: "투자 기간",
  yearsSuffix: "년",
  stepUp: "연간 증가율",
  inflation: "예상 물가상승률",
  invested: "총 투자액",
  corpus: "예상 수령액",
  returns: "예상 수익",
  realCorpus: "실질 가치",
  realReturns: "실질 수익",
  progress: "연도별 성장",
  goal: "목표 플래너",
  goalTarget: "목표 금액",
  goalYears: "목표까지 연도",
  requiredSip: "필요한 월 투자액",
  advanced: "고급 설정",
  oneTime: "일시 납입액",
};

const ALL: Record<Locale, SipCopy> = { en, us, ja, ru, ko };

export function sipCopy(locale: Locale): SipCopy {
  return ALL[locale] ?? en;
}
