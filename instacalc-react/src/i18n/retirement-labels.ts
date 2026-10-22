import type { Locale } from "@/config/site";

/** Labels for the EPF, PPF, NPS, gratuity, CAGR and SWP tools. */
export interface PlanCopy {
  eyebrow: string;
  monthlySalary: string;
  currentAge: string;
  retirementAge: string;
  years: string;
  annualHike: string;
  epfRate: string;
  vpfRate: string;
  interestRate: string;
  currentBalance: string;
  oneTimeTopup: string;
  inflation: string;
  corpus: string;
  corpusReal: string;
  monthlyPension: string;
  monthlyEpf: string;
  totalInvested: string;
  totalInterest: string;
  employee: string;
  employer: string;
  eps: string;
  balance: string;
  year: string;
  age: string;
  investment: string;
  tenure: string;
  openingBalance: string;
  maturity: string;
  frequency: string;
  yearly: string;
  monthly: string;
  contribution: string;
  returnRate: string;
  annuityPercent: string;
  annuityRate: string;
  lumpsum: string;
  annuityCorpus: string;
  pension: string;
  lastSalary: string;
  yearsOfService: string;
  extraMonths: string;
  gratuity: string;
  taxFree: string;
  taxable: string;
  eligibility: string;
  eligible: string;
  notEligible: string;
  covered: string;
  notCovered: string;
  initialValue: string;
  finalValue: string;
  cagr: string;
  profit: string;
  absoluteReturn: string;
  multiplier: string;
  corpusAtRetirement: string;
  withdrawal: string;
  sustainable: string;
  unsustainable: string;
  exhaustedYear: string;
  totalWithdrawal: string;
  yearsTable: string;
  salaryAtRetirement: string;
  interest: string;
}

const en: PlanCopy = {
  eyebrow: "Retirement and Tax Planning",
  monthlySalary: "Monthly Salary",
  currentAge: "Current Age",
  retirementAge: "Retirement Age",
  years: "Years",
  annualHike: "Annual Salary Hike",
  epfRate: "Employee EPF Rate",
  vpfRate: "Voluntary PF (VPF) Rate",
  interestRate: "Interest Rate",
  currentBalance: "Current EPF Balance",
  oneTimeTopup: "One-Time Top-Up",
  inflation: "Expected Inflation",
  corpus: "EPF Corpus at Retirement",
  corpusReal: "Corpus in Today's Money",
  monthlyPension: "Monthly EPS Pension",
  monthlyEpf: "Monthly EPF Withdrawal",
  totalInvested: "Total Invested",
  totalInterest: "Total Interest",
  employee: "Employee",
  employer: "Employer",
  eps: "EPS (Pension)",
  balance: "Balance",
  year: "Year",
  age: "Age",
  investment: "Annual Investment",
  tenure: "Tenure",
  openingBalance: "Opening Balance",
  maturity: "Maturity Value",
  frequency: "Investment Frequency",
  yearly: "Yearly",
  monthly: "Monthly",
  contribution: "Monthly Contribution",
  returnRate: "Expected Return",
  annuityPercent: "Annuity Share",
  annuityRate: "Annuity Rate",
  lumpsum: "Lump Sum",
  annuityCorpus: "Annuity Corpus",
  pension: "Monthly Pension",
  lastSalary: "Last Drawn Salary",
  yearsOfService: "Years of Service",
  extraMonths: "Extra Months",
  gratuity: "Gratuity Payable",
  taxFree: "Tax-Free Portion",
  taxable: "Taxable Portion",
  eligibility: "Eligibility",
  eligible: "Eligible",
  notEligible: "Not yet (needs 5 years)",
  covered: "Covered by Gratuity Act",
  notCovered: "Not Covered",
  initialValue: "Initial Value",
  finalValue: "Final Value",
  cagr: "CAGR",
  profit: "Profit",
  absoluteReturn: "Absolute Return",
  multiplier: "Growth Multiple",
  corpusAtRetirement: "Corpus",
  withdrawal: "Monthly Withdrawal",
  sustainable: "Sustainable for the full period",
  unsustainable: "Corpus exhausted early",
  exhaustedYear: "Corpus Lasts Until",
  totalWithdrawal: "Total Withdrawn",
  yearsTable: "Year-wise Breakdown",
  salaryAtRetirement: "Salary",
  interest: "Interest",
};

const ru: PlanCopy = {
  eyebrow: "Пенсионное и налоговое планирование",
  monthlySalary: "Ежемесячная зарплата",
  currentAge: "Текущий возраст",
  retirementAge: "Возраст выхода на пенсию",
  years: "Лет",
  annualHike: "Ежегодная индексация зарплаты",
  epfRate: "Ставка обязательного взноса",
  vpfRate: "Добровольный взнос",
  interestRate: "Процентная ставка",
  currentBalance: "Текущий баланс накоплений",
  oneTimeTopup: "Разовое пополнение",
  inflation: "Ожидаемая инфляция",
  corpus: "Пенсионный капитал к пенсии",
  corpusReal: "Капитал в сегодняшних ценах",
  monthlyPension: "Ежемесячная пенсия",
  monthlyEpf: "Ежемесячные выплаты из капитала",
  totalInvested: "Всего инвестировано",
  totalInterest: "Начисленные проценты",
  employee: "Работник",
  employer: "Работодатель",
  eps: "Пенсионная часть",
  balance: "Баланс",
  year: "Год",
  age: "Возраст",
  investment: "Ежегодные инвестиции",
  tenure: "Срок",
  openingBalance: "Начальный баланс",
  maturity: "Сумма к получению",
  frequency: "Периодичность взносов",
  yearly: "Ежегодно",
  monthly: "Ежемесячно",
  contribution: "Ежемесячный взнос",
  returnRate: "Ожидаемая доходность",
  annuityPercent: "Доля в аннуитет",
  annuityRate: "Ставка аннуитета",
  lumpsum: "Единовременная выплата",
  annuityCorpus: "Капитал аннуитета",
  pension: "Ежемесячная пенсия",
  lastSalary: "Последний оклад",
  yearsOfService: "Стаж работы (полных лет)",
  extraMonths: "Дополнительные месяцы",
  gratuity: "Сумма выходного пособия",
  taxFree: "Не облагается налогом",
  taxable: "Облагается налогом",
  eligibility: "Право на выплату",
  eligible: "Имеет право на выплату",
  notEligible: "Право пока не наступило",
  covered: "Сокращение / ликвидация (ст. 178 ТК)",
  notCovered: "Соглашение сторон (ст. 78 ТК)",
  initialValue: "Начальная сумма",
  finalValue: "Итоговая сумма",
  cagr: "CAGR",
  profit: "Чистая прибыль",
  absoluteReturn: "Абсолютная доходность",
  multiplier: "Коэффициент роста",
  corpusAtRetirement: "Капитал к пенсии",
  withdrawal: "Ежемесячное изъятие",
  sustainable: "Хватит на весь период",
  unsustainable: "Капитал закончится раньше срока",
  exhaustedYear: "Капитала хватит до",
  totalWithdrawal: "Всего изъято",
  yearsTable: "Погодовая динамика",
  salaryAtRetirement: "Оклад к пенсии",
  interest: "Проценты",
};

/**
 * Locales beyond English reuse the English labels until translated. This is
 * explicit rather than silent so the gap is visible if a label is added.
 */
const ALL: Record<Locale, PlanCopy> = {
  en,
  us: en,
  ja: en,
  ru,
  ko: en,
};

export function planCopy(locale: Locale): PlanCopy {
  return ALL[locale] ?? en;
}
