import type { Locale } from "@/config/site";

/** Labels for the US edition: 401(k), Roth IRA, FIRE, CD, mortgage and sales tax. */
export interface UsCopy {
  eyebrow: string;
  annualSalary: string;
  contribution: string;
  employerMatch: string;
  matchLimit: string;
  currentAge: string;
  retireAge: string;
  currentBalance: string;
  expectedReturn: string;
  salaryGrowth: string;
  corpus: string;
  totalContributed: string;
  totalGrowth: string;
  employee: string;
  employer: string;
  annualContribution: string;
  investmentYears: string;
  timing: string;
  startOfYear: string;
  monthlyDca: string;
  endOfYear: string;
  annualExpenses: string;
  netWorth: string;
  annualSavings: string;
  safeWithdrawalRate: string;
  realReturn: string;
  fireTarget: string;
  leanFire: string;
  standardFire: string;
  fatFire: string;
  yearsToFire: string;
  remaining: string;
  monthlyIncome: string;
  multiple: string;
  apy: string;
  term: string;
  compounding: string;
  daily: string;
  monthlyCompounding: string;
  earlyPenalty: string;
  netPayout: string;
  homePrice: string;
  downPayment: string;
  interestRate: string;
  loanTerm: string;
  propertyTax: string;
  insurance: string;
  hoa: string;
  pmi: string;
  monthlyPayment: string;
  principalInterest: string;
  totalInterest: string;
  yearsTable: string;
  year: string;
  amount: string;
  salesTax: string;
  taxRate: string;
  taxAmount: string;
  netAmount: string;
  monthsSuffix: string;
  monthlyContribution: string;
  principalPaid: string;
  remainingBalance: string;
  nestEgg: string;
}

const en: UsCopy = {
  eyebrow: "US Retirement and Banking",
  annualSalary: "Annual Salary",
  contribution: "Employee Deferral",
  employerMatch: "Employer Match",
  matchLimit: "Match Applies Up To",
  currentAge: "Current Age",
  retireAge: "Retirement Age",
  currentBalance: "Current Balance",
  expectedReturn: "Expected Annual Return",
  salaryGrowth: "Annual Salary Growth",
  corpus: "Projected Nest Egg",
  totalContributed: "Total Contributed",
  totalGrowth: "Investment Growth",
  employee: "Employee Contributions",
  employer: "Employer Match",
  annualContribution: "Annual Contribution",
  investmentYears: "Investment Years",
  timing: "Contribution Timing",
  startOfYear: "Start of Year",
  monthlyDca: "Monthly",
  endOfYear: "End of Year",
  annualExpenses: "Annual Expenses",
  netWorth: "Current Net Worth",
  annualSavings: "Annual Savings",
  safeWithdrawalRate: "Safe Withdrawal Rate",
  realReturn: "Real Annual Return",
  fireTarget: "FIRE Target",
  leanFire: "Lean FIRE (75%)",
  standardFire: "Standard FIRE (100%)",
  fatFire: "Fat FIRE (130%)",
  yearsToFire: "Years to FIRE",
  remaining: "Still Needed",
  monthlyIncome: "Safe Monthly Income",
  multiple: "Savings Multiple",
  apy: "APY",
  term: "Term",
  compounding: "Compounding",
  daily: "Daily",
  monthlyCompounding: "Monthly",
  earlyPenalty: "Early Withdrawal Penalty",
  netPayout: "Net Payout",
  homePrice: "Home Price",
  downPayment: "Down Payment",
  interestRate: "Interest Rate",
  loanTerm: "Loan Term",
  propertyTax: "Property Tax Rate",
  insurance: "Homeowner's Insurance (annual)",
  hoa: "HOA (monthly)",
  pmi: "PMI (monthly)",
  monthlyPayment: "Total Monthly Payment",
  principalInterest: "Principal & Interest",
  totalInterest: "Total Interest",
  yearsTable: "Year-by-Year Breakdown",
  year: "Year",
  amount: "Amount",
  salesTax: "Sales Tax",
  taxRate: "Tax Rate",
  taxAmount: "Tax Amount",
  netAmount: "Total",
  monthsSuffix: "Months",
  monthlyContribution: "Monthly Contribution",
  principalPaid: "Principal Paid",
  remainingBalance: "Remaining Balance",
  nestEgg: "Retirement Nest Egg",
};

const ru: UsCopy = {
  ...en,
  eyebrow: "Пенсионное планирование",
  annualSalary: "Годовая зарплата",
  contribution: "Взнос работника",
  employerMatch: "Взнос работодателя",
  matchLimit: "Лимит софинансирования",
  currentAge: "Текущий возраст",
  retireAge: "Возраст выхода на пенсию",
  currentBalance: "Текущий капитал",
  expectedReturn: "Ожидаемая доходность",
  salaryGrowth: "Рост зарплаты",
  corpus: "Пенсионный капитал",
  totalContributed: "Всего внесено",
  totalGrowth: "Инвестиционный доход",
  employee: "Работник",
  employer: "Работодатель",
  annualContribution: "Ежемесячный взнос",
  investmentYears: "Срок накопления",
  timing: "Время взноса",
  startOfYear: "В начале года",
  monthlyDca: "Ежемесячно",
  endOfYear: "В конце года",
  annualExpenses: "Годовые расходы",
  netWorth: "Текущие накопления",
  annualSavings: "Ежегодные сбережения",
  safeWithdrawalRate: "Безопасная ставка изъятия",
  realReturn: "Реальная доходность",
  fireTarget: "Цель FIRE",
  leanFire: "Lean FIRE (экономный)",
  standardFire: "Standard FIRE",
  fatFire: "Fat FIRE (комфортный)",
  yearsToFire: "Лет до пенсии",
  remaining: "Осталось накопить",
  monthlyIncome: "Ежемесячный доход",
  multiple: "Коэффициент капитала",
  apy: "Ставка доходности",
  term: "Срок",
  compounding: "Капитализация",
  daily: "Ежедневно",
  monthlyCompounding: "Ежемесячно",
  earlyPenalty: "Штраф за досрочное снятие",
  netPayout: "Итоговая выплата",
  homePrice: "Стоимость недвижимости",
  downPayment: "Первоначальный взнос",
  interestRate: "Процентная ставка",
  loanTerm: "Срок кредита",
  propertyTax: "Налог на имущество",
  insurance: "Страховка",
  hoa: "Коммунальные платежи",
  pmi: "Ипотечное страхование",
  monthlyPayment: "Ежемесячный платёж",
  principalInterest: "Основной долг и проценты",
  totalInterest: "Переплата по процентам",
  yearsTable: "Погодовая динамика",
  year: "лет",
  amount: "Сумма",
  salesTax: "Налог с продаж",
  taxRate: "Ставка налога",
  taxAmount: "Сумма налога",
  netAmount: "Итоговая сумма",
  monthsSuffix: "мес.",
  monthlyContribution: "Ежемесячный взнос",
  principalPaid: "Выплачено основного долга",
  remainingBalance: "Остаток долга",
  nestEgg: "Пенсионные накопления",
};

const ALL: Record<Locale, UsCopy> = { en, us: en, ja: en, ru, ko: en };

export function usCopy(locale: Locale): UsCopy {
  return ALL[locale] ?? en;
}
