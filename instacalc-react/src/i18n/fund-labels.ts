import type { Locale } from "@/config/site";

/** Labels for the mutual fund return calculator. */
export interface FundCopy {
  eyebrow: string;
  initialInvestment: string;
  monthlyTopup: string;
  returnRate: string;
  years: string;
  stepUp: string;
  expenseRatio: string;
  inflation: string;
  exitLoad: string;
  ltcgRate: string;
  ltcgExemption: string;
  netRedemption: string;
  grossCorpus: string;
  totalInvested: string;
  estimatedReturns: string;
  expenseDrag: string;
  exitLoadAmount: string;
  taxAmount: string;
  realTerms: string;
  effectiveCagr: string;
  cumulativeSwp: string;
  targetCorpus: string;
  requiredInitial: string;
  scenario: string;
  conservative: string;
  base: string;
  aggressive: string;
  swpStartYear: string;
  swpMonthly: string;
  yearsTable: string;
  year: string;
}

const en: FundCopy = {
  eyebrow: "Mutual Fund Planning",
  initialInvestment: "Initial Investment",
  monthlyTopup: "Monthly Top-Up",
  returnRate: "Expected Return (CAGR)",
  years: "Investment Period",
  stepUp: "Annual Step-Up",
  expenseRatio: "Expense Ratio",
  inflation: "Expected Inflation",
  exitLoad: "Exit Load",
  ltcgRate: "LTCG Tax Rate",
  ltcgExemption: "LTCG Exemption",
  netRedemption: "Net Value on Redemption",
  grossCorpus: "Gross Corpus",
  totalInvested: "Total Invested",
  estimatedReturns: "Estimated Returns",
  expenseDrag: "Expense Drag",
  exitLoadAmount: "Exit Load Charged",
  taxAmount: "Tax Paid",
  realTerms: "Value in Today's Money",
  effectiveCagr: "Effective CAGR",
  cumulativeSwp: "Total Withdrawn (SWP)",
  targetCorpus: "Target Corpus",
  requiredInitial: "Lump Sum Needed",
  scenario: "Risk Scenario",
  conservative: "Conservative",
  base: "Base Case",
  aggressive: "Aggressive",
  swpStartYear: "SWP Start Year",
  swpMonthly: "Monthly Withdrawal (SWP)",
  yearsTable: "Year-wise Growth",
  year: "Year",
};

const ru: FundCopy = {
  eyebrow: "Инвестиции и паевые фонды",
  initialInvestment: "Начальные инвестиции",
  monthlyTopup: "Ежемесячное пополнение",
  returnRate: "Ожидаемая доходность (CAGR)",
  years: "Срок инвестирования",
  stepUp: "Ежегодная индексация взноса",
  expenseRatio: "Комиссия фонда (TER)",
  inflation: "Ожидаемая инфляция",
  exitLoad: "Комиссия за досрочный вывод",
  ltcgRate: "Ставка налога на доход (НДФЛ)",
  ltcgExemption: "Необлагаемый лимит дохода",
  netRedemption: "Сумма на руки (после налогов)",
  grossCorpus: "Итоговый капитал",
  totalInvested: "Всего инвестировано",
  estimatedReturns: "Инвестиционный доход",
  expenseDrag: "Потери на комиссиях",
  exitLoadAmount: "Удержанная комиссия за выход",
  taxAmount: "Уплаченный налог",
  realTerms: "Сумма в сегодняшних ценах",
  effectiveCagr: "Фактический CAGR (чистыми)",
  cumulativeSwp: "Всего выведено (SWP)",
  targetCorpus: "Целевой капитал",
  requiredInitial: "Необходимый начальный взнос",
  scenario: "Сценарий риска",
  conservative: "Консервативный",
  base: "Базовый",
  aggressive: "Агрессивный",
  swpStartYear: "Год начала выплат (SWP)",
  swpMonthly: "Ежемесячная выплата (SWP)",
  yearsTable: "Погодовая динамика роста",
  year: "Год",
};

const ALL: Record<Locale, FundCopy> = { en, us: en, ja: en, ru, ko: en };

export function fundCopy(locale: Locale): FundCopy {
  return ALL[locale] ?? en;
}