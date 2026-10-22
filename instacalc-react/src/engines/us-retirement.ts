/**
 * US retirement and banking engines: 401(k), Roth IRA, FIRE, CD and mortgage.
 *
 * Each formula is ported from the corresponding legacy page so results match
 * what the site produces today. All are pure functions.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ---------------------------------------------------------------- 401(k) */

export interface FourOhOneKInputs {
  annualSalary: number;
  /** Employee deferral, percent of salary. */
  contributionPercent: number;
  /** Employer match, percent of salary. */
  employerMatchPercent: number;
  /** Salary up to which the match applies, percent. */
  matchLimitPercent: number;
  currentAge: number;
  retireAge: number;
  currentBalance: number;
  /** Expected annual return, percent. */
  expectedReturn: number;
  /** Annual salary growth, percent. */
  salaryGrowth: number;
}

export interface FourOhOneKRow {
  year: number;
  age: number;
  salary: number;
  employee: number;
  employer: number;
  growth: number;
  balance: number;
}

export interface FourOhOneKResult {
  years: number;
  retireAge: number;
  totalEmployee: number;
  totalEmployer: number;
  totalContributed: number;
  totalGrowth: number;
  corpus: number;
  rows: FourOhOneKRow[];
}

/**
 * IRS elective-deferral limit, indexed. The legacy page uses $23,000 growing at
 * 2% a year.
 */
const IRS_LIMIT_BASE = 23_000;
const IRS_LIMIT_INDEX = 1.02;

export function calculate401k(i: FourOhOneKInputs): FourOhOneKResult {
  const years = Math.max(1, i.retireAge - i.currentAge);
  const r = i.expectedReturn / 100;
  const rows: FourOhOneKRow[] = [];

  let salary = i.annualSalary;
  let balance = i.currentBalance;
  let totalEmployee = i.currentBalance;
  let totalEmployer = 0;
  let totalGrowth = 0;

  for (let y = 1; y <= years; y++) {
    // The deferral limit indexes with inflation and caps the employee's deposit.
    const irsLimit = IRS_LIMIT_BASE * Math.pow(IRS_LIMIT_INDEX, y - 1);
    const employee = Math.min(salary * (i.contributionPercent / 100), irsLimit);

    // The employer only matches up to the match limit, and never more than the
    // employee actually contributes.
    const matchable = Math.min(
      salary * (i.matchLimitPercent / 100),
      salary * (i.contributionPercent / 100),
    );
    const employer = matchable * (i.employerMatchPercent / 100);

    const deposit = employee + employer;
    // Deposits are treated as arriving mid-year.
    const growth = (balance + deposit / 2) * r;
    balance += deposit + growth;

    totalEmployee += employee;
    totalEmployer += employer;
    totalGrowth += growth;

    rows.push({
      year: y,
      age: i.currentAge + y,
      salary: round2(salary),
      employee: round2(employee),
      employer: round2(employer),
      growth: round2(growth),
      balance: round2(balance),
    });

    salary *= 1 + i.salaryGrowth / 100;
  }

  return {
    years,
    retireAge: i.currentAge + years,
    totalEmployee: round2(totalEmployee),
    totalEmployer: round2(totalEmployer),
    totalContributed: round2(totalEmployee + totalEmployer),
    totalGrowth: round2(totalGrowth),
    corpus: round2(balance),
    rows,
  };
}

/* -------------------------------------------------------------- Roth IRA */

export interface RothIraInputs {
  annualContribution: number;
  /** Expected annual return, percent. */
  returnRate: number;
  years: number;
  currentBalance: number;
  /** When contributions are made within the year. */
  timing: "start" | "monthly" | "end";
}

export interface RothRow {
  year: number;
  opening: number;
  contribution: number;
  growth: number;
  closing: number;
}

export interface RothResult {
  totalContributed: number;
  totalGrowth: number;
  corpus: number;
  rows: RothRow[];
}

export function calculateRothIra(i: RothIraInputs): RothResult {
  const r = i.returnRate / 100;
  const rows: RothRow[] = [];

  let balance = i.currentBalance;
  let totalContributed = i.currentBalance;

  for (let y = 1; y <= Math.max(0, Math.round(i.years)); y++) {
    const opening = balance;
    let growth: number;

    if (i.timing === "start") {
      balance += i.annualContribution;
      growth = balance * r;
      balance += growth;
    } else if (i.timing === "end") {
      growth = opening * r;
      balance = opening + i.annualContribution + growth;
    } else {
      // Monthly contributions: each instalment earns its share of the year.
      const monthly = i.annualContribution / 12;
      let running = opening;
      let accrued = 0;
      for (let m = 1; m <= 12; m++) {
        running += monthly;
        accrued += (running * r) / 12;
      }
      growth = accrued;
      balance = opening + i.annualContribution + accrued;
    }

    totalContributed += i.annualContribution;
    rows.push({
      year: y,
      opening: round2(opening),
      contribution: round2(i.annualContribution),
      growth: round2(growth),
      closing: round2(balance),
    });
  }

  return {
    totalContributed: round2(totalContributed),
    totalGrowth: round2(Math.max(0, balance - totalContributed)),
    corpus: round2(balance),
    rows,
  };
}

/* ------------------------------------------------------------------ FIRE */

export type FireTier = "lean" | "standard" | "fat";
export type FireTiming = "monthly" | "start" | "end";

/** Lifestyle multipliers applied to annual expenses. */
export const FIRE_TIERS: Record<FireTier, number> = {
  lean: 0.75,
  standard: 1.0,
  fat: 1.3,
};

export interface FireInputs {
  annualExpenses: number;
  currentNetWorth: number;
  annualSavings: number;
  /** Safe withdrawal rate, percent. Clamped to 1-10%. */
  safeWithdrawalRate: number;
  /** Real (inflation-adjusted) return, percent. Clamped to 0.1-20%. */
  realReturn: number;
  tier: FireTier;
  timing: FireTiming;
}

export interface FireResult {
  target: number;
  leanTarget: number;
  standardTarget: number;
  fatTarget: number;
  /** Years until the target is reached, or null if not within the horizon. */
  yearsToFire: number | null;
  remaining: number;
  progressPercent: number;
  /** Monthly income the target supports at the chosen withdrawal rate. */
  safeMonthlyIncome: number;
  multiple: number;
}

/** Simulation horizon, matching the legacy page. */
const MAX_SIM_YEARS = 60;

export function calculateFire(i: FireInputs): FireResult {
  // Clamp the inputs to sane ranges so a stray keystroke cannot explode the maths.
  const swr = Math.min(0.1, Math.max(0.01, i.safeWithdrawalRate / 100));
  const r = Math.min(0.2, Math.max(0.001, i.realReturn / 100));

  const leanTarget = (i.annualExpenses * FIRE_TIERS.lean) / swr;
  const standardTarget = i.annualExpenses / swr;
  const fatTarget = (i.annualExpenses * FIRE_TIERS.fat) / swr;
  const target = (i.annualExpenses * FIRE_TIERS[i.tier]) / swr;

  let balance = i.currentNetWorth;
  let yearsToFire: number | null = balance >= target ? 0 : null;

  for (let y = 1; y <= MAX_SIM_YEARS; y++) {
    const opening = balance;
    const returns =
      i.timing === "start"
        ? (opening + i.annualSavings) * r
        : i.timing === "end"
          ? opening * r
          : (opening + i.annualSavings / 2) * r;
    balance = opening + i.annualSavings + returns;

    if (yearsToFire === null && balance >= target) {
      yearsToFire = y;
      break;
    }
  }

  return {
    target: round2(target),
    leanTarget: round2(leanTarget),
    standardTarget: round2(standardTarget),
    fatTarget: round2(fatTarget),
    yearsToFire,
    remaining: round2(Math.max(0, target - i.currentNetWorth)),
    progressPercent: round2(Math.min(100, target > 0 ? (i.currentNetWorth / target) * 100 : 0)),
    safeMonthlyIncome: round2((target * swr) / 12),
    multiple: round2(1 / swr),
  };
}

/* -------------------------------------------------------------------- CD */

export interface CdInputs {
  principal: number;
  /** Annual percentage yield, percent. */
  apy: number;
  /** Term in months. */
  months: number;
  /** Compounding periods per year (365 daily, 12 monthly). */
  frequency: number;
  /** Early-withdrawal penalty, in months of interest. */
  penaltyMonths: number;
}

export interface CdResult {
  balance: number;
  totalInterest: number;
  penaltyAmount: number;
  netPayout: number;
  netInterest: number;
  /** Nominal rate implied by the APY at the given compounding frequency. */
  nominalRate: number;
}

/**
 * CD projection. The nominal rate is derived from the APY:
 * APY = (1 + r/n)^n - 1, so r = n * ((1 + APY)^(1/n) - 1).
 */
export function calculateCd(i: CdInputs): CdResult {
  const apy = i.apy / 100;
  const n = i.frequency || 365;
  const nominalRate = n * (Math.pow(1 + apy, 1 / n) - 1);

  let balance = i.principal;
  for (let m = 1; m <= Math.max(0, Math.round(i.months)); m++) {
    // One twelfth of a year accrues n*(1/12) compounding periods.
    balance *= Math.pow(1 + nominalRate / n, n / 12);
  }

  const totalInterest = Math.max(0, balance - i.principal);
  // The penalty is capped at the interest actually earned.
  const firstYearMonthlyInterest = (i.principal * apy) / 12;
  const penaltyAmount = i.penaltyMonths > 0
    ? Math.min(totalInterest, i.penaltyMonths * firstYearMonthlyInterest)
    : 0;

  return {
    balance: round2(balance),
    totalInterest: round2(totalInterest),
    penaltyAmount: round2(penaltyAmount),
    netPayout: round2(balance - penaltyAmount),
    netInterest: round2(Math.max(0, totalInterest - penaltyAmount)),
    nominalRate: round2(nominalRate * 100),
  };
}

/* -------------------------------------------------------------- Mortgage */

export interface MortgageInputs {
  homePrice: number;
  /** Down payment, percent of price. */
  downPercent: number;
  /** Annual interest rate, percent. */
  rate: number;
  /** Term in years. */
  years: number;
  /** Annual property tax rate, percent of price. */
  taxRate: number;
  /** Annual homeowner's insurance. */
  insurance: number;
  /** Monthly HOA dues. */
  hoa: number;
  /** Optional extra monthly payment toward principal. */
  extraPayment?: number;
}

export interface MortgageYearRow {
  year: number;
  opening: number;
  principalPaid: number;
  interestPaid: number;
  closing: number;
}

export interface MortgageResult {
  principal: number;
  downPayment: number;
  /** Principal and interest only. */
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  /** Private mortgage insurance, charged below a 20% down payment. */
  monthlyPmi: number;
  totalMonthlyPayment: number;
  /** Bi-weekly payment option (half of monthly P&I, 26 payments/yr). */
  biweeklyPayment: number;
  totalInterest: number;
  totalPaid: number;
  rows: MortgageYearRow[];
}

/** PMI rate applied to the loan when the down payment is under 20%. */
const PMI_ANNUAL_RATE = 0.0075;

export function calculateMortgage(i: MortgageInputs): MortgageResult {
  const downDollars = i.homePrice * (i.downPercent / 100);
  const principal = Math.max(0, i.homePrice - downDollars);

  const monthlyRate = i.rate / 100 / 12;
  const totalMonths = Math.max(1, Math.round(i.years * 12));
  const extra = Math.max(0, i.extraPayment ?? 0);

  const monthlyPI =
    monthlyRate > 0
      ? (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1)
      : principal / totalMonths;

  const monthlyTax = (i.homePrice * (i.taxRate / 100)) / 12;
  const monthlyInsurance = i.insurance / 12;
  const monthlyPmi = i.downPercent < 20 ? (principal * PMI_ANNUAL_RATE) / 12 : 0;

  const rows: MortgageYearRow[] = [];
  let balance = principal;
  let totalInterest = 0;
  let yearOpening = principal;
  let yearInterest = 0;
  let yearPrincipal = 0;

  for (let m = 1; m <= totalMonths && balance > 0.001; m++) {
    const interest = balance * monthlyRate;
    const standardPrincipal = monthlyPI - interest;
    const paid = Math.min(balance, standardPrincipal + extra);
    balance = Math.max(0, balance - paid);
    totalInterest += interest;
    yearInterest += interest;
    yearPrincipal += paid;

    if (m % 12 === 0 || m === totalMonths || balance === 0) {
      rows.push({
        year: Math.ceil(m / 12),
        opening: round2(yearOpening),
        principalPaid: round2(yearPrincipal),
        interestPaid: round2(yearInterest),
        closing: round2(balance),
      });
      yearOpening = balance;
      yearInterest = 0;
      yearPrincipal = 0;
      if (balance === 0) break;
    }
  }

  return {
    principal: round2(principal),
    downPayment: round2(downDollars),
    monthlyPI: round2(monthlyPI),
    monthlyTax: round2(monthlyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyHoa: round2(i.hoa),
    monthlyPmi: round2(monthlyPmi),
    totalMonthlyPayment: round2(monthlyPI + monthlyTax + monthlyInsurance + i.hoa + monthlyPmi + extra),
    biweeklyPayment: round2(monthlyPI / 2),
    totalInterest: round2(totalInterest),
    totalPaid: round2(principal + totalInterest),
    rows,
  };
}


