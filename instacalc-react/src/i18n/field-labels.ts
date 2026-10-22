import type { Locale } from "@/config/site";

/** Field/result labels shared by the loan, deposit and tax calculators. */
export interface FieldCopy {
  principal: string;
  rate: string;
  percent: string;
  years: string;
  yearsSuffix: string;
  amount: string;
  invested: string;
  interest: string;
  total: string;
  maturity: string;
  emi: string;
  totalPayment: string;
  totalInterest: string;
  annual: string;
  monthly: string;
  oneTime: string;
  yearsTable: string;
  schedule: string;
  investedTotal: string;
  taxRate: string;
  taxAmount: string;
  netAmount: string;
  gstRate: string;
  baseAmount: string;
  exclusive: string;
  inclusive: string;
}

const en: FieldCopy = {
  principal: "Loan Amount",
  rate: "Interest Rate",
  percent: "%",
  years: "Tenure",
  yearsSuffix: "years",
  amount: "Amount",
  invested: "Invested",
  interest: "Interest",
  total: "Total",
  maturity: "Maturity Value",
  emi: "Monthly EMI",
  totalPayment: "Total Payment",
  totalInterest: "Total Interest",
  annual: "Annual Deposit",
  monthly: "Monthly Deposit",
  oneTime: "One-Time Investment",
  yearsTable: "Year-wise Breakdown",
  schedule: "Year",
  investedTotal: "Total Invested",
  taxRate: "Tax Rate",
  taxAmount: "Tax Amount",
  netAmount: "Net Amount",
  gstRate: "GST Rate",
  baseAmount: "Base Amount",
  exclusive: "Amount (exclusive)",
  inclusive: "Amount (inclusive)",
};

const ja: FieldCopy = {
  principal: "借入金額",
  rate: "金利",
  percent: "%",
  years: "期間",
  yearsSuffix: "年",
  amount: "金額",
  invested: "元本",
  interest: "利息",
  total: "合計",
  maturity: "満期元本",
  emi: "毎月の返済額",
  totalPayment: "返済総額",
  totalInterest: "支払利息総額",
  annual: "年間積立額",
  monthly: "月間積立額",
  oneTime: "一時払投資",
  yearsTable: "年次推移",
  schedule: "年",
  investedTotal: "投資合計額",
  taxRate: "税率",
  taxAmount: "税額",
  netAmount: "手取り額",
  gstRate: "GST税率",
  baseAmount: "税抜金額",
  exclusive: "税別金額",
  inclusive: "税込金額",
};

const ru: FieldCopy = {
  principal: "Сумма кредита",
  rate: "Процентная ставка",
  percent: "%",
  years: "Срок",
  yearsSuffix: "лет",
  amount: "Сумма",
  invested: "Вложено",
  interest: "Проценты",
  total: "Итого",
  maturity: "Сумма к погашению",
  emi: "Ежемесячный платёж",
  totalPayment: "Общая сумма выплат",
  totalInterest: "Переплата по процентам",
  annual: "Годовой взнос",
  monthly: "Месячный взнос",
  oneTime: "Разовое вложение",
  yearsTable: "Разбивка по годам",
  schedule: "Год",
  investedTotal: "Всего вложено",
  taxRate: "Налоговая ставка",
  taxAmount: "Сумма налога",
  netAmount: "Сумма к получению",
  gstRate: "Ставка GST",
  baseAmount: "Базовая сумма",
  exclusive: "Сумма без налога",
  inclusive: "Сумма с налогом",
};

const us: FieldCopy = {
  principal: "Loan Amount",
  rate: "Interest Rate",
  percent: "%",
  years: "Term",
  yearsSuffix: "years",
  amount: "Amount",
  invested: "Contributed",
  interest: "Interest",
  total: "Total",
  maturity: "Maturity Value",
  emi: "Monthly Payment",
  totalPayment: "Total Paid",
  totalInterest: "Total Interest",
  annual: "Annual Deposit",
  monthly: "Monthly Deposit",
  oneTime: "One-Time Investment",
  yearsTable: "Year-by-Year Breakdown",
  schedule: "Year",
  investedTotal: "Total Contributed",
  taxRate: "Tax Rate",
  taxAmount: "Tax Amount",
  netAmount: "Net Amount",
  gstRate: "Sales Tax Rate",
  baseAmount: "Pre-tax Amount",
  exclusive: "Amount (exclusive)",
  inclusive: "Amount (inclusive)",
};

const ko: FieldCopy = {
  principal: "대출 금액",
  rate: "이자율",
  percent: "%",
  years: "기간",
  yearsSuffix: "년",
  amount: "금액",
  invested: "원금",
  interest: "이자",
  total: "합계",
  maturity: "만수 시 금액",
  emi: "월 상환액",
  totalPayment: "총 상환액",
  totalInterest: "총 이자",
  annual: "연도 납입액",
  monthly: "월 납입액",
  oneTime: "일시 납입",
  yearsTable: "연도별 내역",
  schedule: "연도",
  investedTotal: "총 납입액",
  taxRate: "세율",
  taxAmount: "세액",
  netAmount: "실수령액",
  gstRate: "세율",
  baseAmount: "세전 금액",
  exclusive: "세외 금액",
  inclusive: "세금 포함 금액",
};

const ALL: Record<Locale, FieldCopy> = { en, us, ja, ru, ko };

export function fieldCopy(locale: Locale): FieldCopy {
  return ALL[locale] ?? en;
}
