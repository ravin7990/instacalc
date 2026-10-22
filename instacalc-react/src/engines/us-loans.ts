/**
 * US Loans, Paycheck and Debt payoff engines.
 * Pure functions covering:
 * - Paycheck take-home pay (2026 federal brackets, FICA Social Security/Medicare, 401k, health)
 * - Credit card payoff & debt-free schedule
 * - Student loan repayment with extra payments
 * - Auto loan payment with trade-in & sales tax
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ----------------------------------------------------------- Paycheck */

export type PayFrequency = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const FREQ_PERIODS: Record<PayFrequency, number> = {
  weekly: 52,
  biweekly: 26,
  semimonthly: 24,
  monthly: 12,
};

export interface PaycheckInputs {
  annualSalary: number;
  frequency: PayFrequency;
  filingStatus: "single" | "married";
  k401Percent: number;
  healthPerPeriod: number;
  /** State income tax rate (percent, e.g. 0% for TX/FL/WA, 5% median). */
  stateTaxRate?: number;
}

export interface PaycheckDeduction {
  name: string;
  perPaycheck: number;
  annual: number;
}

export interface PaycheckResult {
  grossPerPaycheck: number;
  netPerPaycheck: number;
  annualNet: number;
  annualGross: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  k401Annual: number;
  healthAnnual: number;
  totalDeductionsAnnual: number;
  effectiveTaxRate: number;
  deductions: PaycheckDeduction[];
}

/** 2026 Federal tax brackets after standard deduction */
const BRACKETS_2026: Record<"single" | "married", Array<[number, number, number]>> = {
  single: [
    [0, 11_925, 0.10],
    [11_925, 48_475, 0.12],
    [48_475, 103_350, 0.22],
    [103_350, 197_300, 0.24],
    [197_300, 250_525, 0.32],
    [250_525, 626_350, 0.35],
    [626_350, Infinity, 0.37],
  ],
  married: [
    [0, 23_850, 0.10],
    [23_850, 96_950, 0.12],
    [96_950, 206_700, 0.22],
    [206_700, 394_600, 0.24],
    [394_600, 501_050, 0.32],
    [501_050, 751_600, 0.35],
    [751_600, Infinity, 0.37],
  ],
};

const STANDARD_DEDUCTION_2026 = {
  single: 15_750,
  married: 31_500,
};

const SOCIAL_SECURITY_CAP_2026 = 184_500;

export function calculatePaycheck(i: PaycheckInputs): PaycheckResult {
  const periods = FREQ_PERIODS[i.frequency] ?? 26;
  const gross = Math.max(0, i.annualSalary);
  const grossPerPaycheck = gross / periods;

  const k401Rate = Math.min(100, Math.max(0, i.k401Percent)) / 100;
  const k401Annual = gross * k401Rate;
  const taxableWage = Math.max(0, gross - k401Annual);

  const stdDeduction = STANDARD_DEDUCTION_2026[i.filingStatus] ?? STANDARD_DEDUCTION_2026.single;
  const taxableIncome = Math.max(0, taxableWage - stdDeduction);

  let federalTax = 0;
  for (const [lo, hi, rate] of BRACKETS_2026[i.filingStatus]) {
    if (taxableIncome > lo) {
      federalTax += (Math.min(taxableIncome, hi) - lo) * rate;
    }
  }

  const socialSecurity = Math.min(taxableWage, SOCIAL_SECURITY_CAP_2026) * 0.062;
  const medicare = taxableWage * 0.0145;
  const addMedicareThreshold = i.filingStatus === "married" ? 250_000 : 200_000;
  const additionalMedicare = taxableWage > addMedicareThreshold ? (taxableWage - addMedicareThreshold) * 0.009 : 0;

  const stateRate = Math.max(0, (i.stateTaxRate ?? 0) / 100);
  const stateTax = taxableWage * stateRate;

  const healthAnnual = Math.max(0, i.healthPerPeriod) * periods;
  const totalDeductionsAnnual = federalTax + stateTax + socialSecurity + medicare + additionalMedicare + k401Annual + healthAnnual;
  const annualNet = Math.max(0, gross - totalDeductionsAnnual);
  const netPerPaycheck = annualNet / periods;

  const deductions: PaycheckDeduction[] = [
    { name: "Federal Income Tax", perPaycheck: federalTax / periods, annual: federalTax },
    ...(stateTax > 0
      ? [{ name: "State Income Tax", perPaycheck: stateTax / periods, annual: stateTax }]
      : []),
    { name: "Social Security (6.2%)", perPaycheck: socialSecurity / periods, annual: socialSecurity },
    { name: "Medicare (1.45%)", perPaycheck: medicare / periods, annual: medicare },
    ...(additionalMedicare > 0
      ? [{ name: "Additional Medicare (0.9%)", perPaycheck: additionalMedicare / periods, annual: additionalMedicare }]
      : []),
    { name: "401(k) Pre-Tax", perPaycheck: k401Annual / periods, annual: k401Annual },
    { name: "Health Insurance", perPaycheck: i.healthPerPeriod, annual: healthAnnual },
  ];

  return {
    grossPerPaycheck: round2(grossPerPaycheck),
    netPerPaycheck: round2(netPerPaycheck),
    annualNet: round2(annualNet),
    annualGross: round2(gross),
    federalTax: round2(federalTax),
    stateTax: round2(stateTax),
    socialSecurity: round2(socialSecurity),
    medicare: round2(medicare),
    additionalMedicare: round2(additionalMedicare),
    k401Annual: round2(k401Annual),
    healthAnnual: round2(healthAnnual),
    totalDeductionsAnnual: round2(totalDeductionsAnnual),
    effectiveTaxRate: gross > 0 ? round2(((federalTax + stateTax + socialSecurity + medicare + additionalMedicare) / gross) * 100) : 0,
    deductions: deductions.map((d) => ({
      ...d,
      perPaycheck: round2(d.perPaycheck),
      annual: round2(d.annual),
    })),
  };
}

/* ------------------------------------------------------ Credit Card Payoff */

export interface CreditCardInputs {
  balance: number;
  apr: number;
  monthlyPayment: number;
  extraMonthly?: number;
}

export interface LoanScheduleRow {
  year: number;
  opening: number;
  paid: number;
  interest: number;
  closing: number;
}

export interface CreditCardResult {
  neverPayoff: boolean;
  monthsToPayoff: number;
  yearsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
  payoffMonthYear: string;
  rows: LoanScheduleRow[];
}

export function calculateCreditCardPayoff(i: CreditCardInputs): CreditCardResult {
  const bal0 = Math.max(0, i.balance);
  const apr = Math.max(0, i.apr) / 100;
  const pay = Math.max(0, i.monthlyPayment) + Math.max(0, i.extraMonthly ?? 0);

  const monthlyInterestMin = (bal0 * apr) / 12;
  const neverPayoff = bal0 > 0 && pay <= monthlyInterestMin;

  if (neverPayoff || bal0 === 0) {
    return {
      neverPayoff: bal0 > 0,
      monthsToPayoff: 0,
      yearsToPayoff: 0,
      totalInterest: 0,
      totalPaid: 0,
      payoffMonthYear: "Never",
      rows: [],
    };
  }

  const dailyRate = apr / 365;
  const rows: LoanScheduleRow[] = [];
  let simBal = bal0;
  let simMonths = 0;
  let totalInterest = 0;
  let year = 1;
  let opening = simBal;
  let paidInYear = 0;
  let interestInYear = 0;

  while (simBal > 0 && simMonths < 600) {
    const interest = simBal * dailyRate * 30.42;
    simBal += interest;
    simMonths++;
    totalInterest += interest;

    const actualPay = Math.min(pay, simBal);
    simBal -= actualPay;
    paidInYear += actualPay;
    interestInYear += interest;

    if (simBal < 0.01) simBal = 0;

    if (simMonths % 12 === 0 || simBal === 0) {
      rows.push({
        year,
        opening: round2(opening),
        paid: round2(paidInYear),
        interest: round2(interestInYear),
        closing: round2(simBal),
      });
      year++;
      opening = simBal;
      paidInYear = 0;
      interestInYear = 0;
    }
  }

  const d = new Date();
  d.setMonth(d.getMonth() + simMonths);
  const payoffMonthYear = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });

  return {
    neverPayoff: false,
    monthsToPayoff: simMonths,
    yearsToPayoff: round2(simMonths / 12),
    totalInterest: round2(totalInterest),
    totalPaid: round2(bal0 + totalInterest),
    payoffMonthYear,
    rows,
  };
}

/* --------------------------------------------------------- Student Loan */

export interface StudentLoanInputs {
  balance: number;
  rate: number;
  years: number;
  extraMonthly?: number;
}

export interface StudentLoanResult {
  monthlyPayment: number;
  totalInterest: number;
  totalRepaid: number;
  extraMonthly: number;
  monthsWithExtra: number;
  savingsWithExtra: number;
  rows: LoanScheduleRow[];
}

export function amortizeLoan(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || years <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

export function calculateStudentLoan(i: StudentLoanInputs): StudentLoanResult {
  const P = Math.max(0, i.balance);
  const rate = Math.max(0, i.rate);
  const years = Math.max(1, i.years);
  const extra = Math.max(0, i.extraMonthly ?? 0);

  const monthly = amortizeLoan(P, rate, years);
  const totalMonths = years * 12;
  const totalInterest = monthly * totalMonths - P;

  // Extra payment calculation
  let monthsWithExtra = totalMonths;
  let savingsWithExtra = 0;
  const rows: LoanScheduleRow[] = [];

  const r = rate / 100 / 12;
  let simBal = P;
  let simMonths = 0;
  let interestPaidWithExtra = 0;
  let y = 1;
  let opening = simBal;
  let paidInYear = 0;
  let interestInYear = 0;

  while (simBal > 0.01 && simMonths < 600) {
    const interest = simBal * r;
    interestInYear += interest;
    interestPaidWithExtra += interest;
    simBal += interest;

    const pay = Math.min(monthly + extra, simBal);
    simBal -= pay;
    paidInYear += pay;
    simMonths++;

    if (simBal < 0.01) simBal = 0;

    if (simMonths % 12 === 0 || simBal === 0) {
      rows.push({
        year: y,
        opening: round2(opening),
        paid: round2(paidInYear),
        interest: round2(interestInYear),
        closing: round2(simBal),
      });
      y++;
      opening = simBal;
      paidInYear = 0;
      interestInYear = 0;
    }
  }

  if (extra > 0) {
    monthsWithExtra = simMonths;
    savingsWithExtra = Math.max(0, totalInterest - interestPaidWithExtra);
  }

  return {
    monthlyPayment: round2(monthly),
    totalInterest: round2(totalInterest),
    totalRepaid: round2(P + totalInterest),
    extraMonthly: round2(extra),
    monthsWithExtra,
    savingsWithExtra: round2(savingsWithExtra),
    rows,
  };
}

/* ----------------------------------------------------------- Auto Loan */

export interface AutoLoanInputs {
  vehiclePrice: number;
  downPayment: number;
  tradeInValue: number;
  salesTaxRate: number;
  interestRate: number;
  termMonths: number;
}

export interface AutoLoanResult {
  loanAmount: number;
  salesTaxAmount: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  rows: LoanScheduleRow[];
}

export function calculateAutoLoan(i: AutoLoanInputs): AutoLoanResult {
  const price = Math.max(0, i.vehiclePrice);
  const down = Math.max(0, i.downPayment);
  const tradeIn = Math.max(0, i.tradeInValue);
  const taxRate = Math.max(0, i.salesTaxRate) / 100;
  const apr = Math.max(0, i.interestRate);
  const months = Math.max(1, i.termMonths);

  const taxableAmount = Math.max(0, price - tradeIn);
  const salesTaxAmount = taxableAmount * taxRate;
  const loanAmount = Math.max(0, price - down - tradeIn + salesTaxAmount);

  const monthlyPayment = amortizeLoan(loanAmount, apr, months / 12);
  const totalInterest = monthlyPayment * months - loanAmount;
  const totalCost = down + tradeIn + monthlyPayment * months;

  // Build year-by-year schedule
  const r = apr / 100 / 12;
  const rows: LoanScheduleRow[] = [];
  let simBal = loanAmount;
  let year = 1;
  let opening = simBal;
  let paidInYear = 0;
  let interestInYear = 0;

  for (let m = 1; m <= months; m++) {
    const interest = simBal * r;
    const paid = m === months ? simBal + interest : monthlyPayment;
    const principalPaid = paid - interest;
    simBal = Math.max(0, simBal - principalPaid);
    paidInYear += paid;
    interestInYear += interest;

    if (m % 12 === 0 || m === months) {
      rows.push({
        year,
        opening: round2(opening),
        paid: round2(paidInYear),
        interest: round2(interestInYear),
        closing: round2(simBal),
      });
      year++;
      opening = simBal;
      paidInYear = 0;
      interestInYear = 0;
    }
  }

  return {
    loanAmount: round2(loanAmount),
    salesTaxAmount: round2(salesTaxAmount),
    monthlyPayment: round2(monthlyPayment),
    totalInterest: round2(totalInterest),
    totalCost: round2(totalCost),
    rows,
  };
}
