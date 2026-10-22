/**
 * Retirement planning engines: EPF, PPF, NPS, gratuity and CAGR.
 *
 * Each formula is ported from the corresponding legacy calculator so results
 * match what the site produces today. All are pure functions.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

/* ------------------------------------------------------------------ EPF */

export interface EpfInputs {
  monthlySalary: number;
  currentAge: number;
  retirementAge: number;
  /** Annual salary hike, percent. */
  annualHike: number;
  /** Employee EPF contribution, percent of eligible salary. */
  employeeRate: number;
  /** Voluntary PF contribution, percent (0 when switched off). */
  vpfRate: number;
  /** EPF interest rate, percent. */
  epfInterest: number;
  /** Employer EPF contribution, percent of eligible salary. */
  employerEpfRate: number;
  /** EPS (pension) contribution, percent of eligible salary. */
  epsRate: number;
  /** Wage cap for EPS eligibility, per month. */
  epsWageCap: number;
  /** When true, EPF contributions are also capped at `epfWageCap`. */
  wageCapMode: boolean;
  epfWageCap: number;
  /** Existing EPF balance carried into the projection. */
  currentBalance: number;
  /** One-time lump-sum top-up added up front. */
  oneTimeTopup: number;
  /** Expected inflation, percent, used for the real-value figure. */
  inflation: number;
}

export interface EpfYearRow {
  year: number;
  age: number;
  salary: number;
  employee: number;
  employer: number;
  eps: number;
  interest: number;
  balance: number;
  /** EPS balance expressed in today's money. */
  pensionToday: number;
}

export interface EpfResult {
  years: number;
  totalEmployee: number;
  totalEmployer: number;
  totalEps: number;
  totalInterest: number;
  totalInvested: number;
  /** EPF + VPF corpus at retirement. */
  corpus: number;
  /** Corpus adjusted for inflation. */
  corpusReal: number;
  /** Monthly EPS pension in today's money. */
  monthlyPension: number;
  /** Monthly EPF withdrawal after retirement. */
  monthlyEpf: number;
  rows: EpfYearRow[];
}

/**
 * Projects EPF year by year.
 *
 * EPS is capped at the statutory wage ceiling, which is why the pension stays
 * flat even as salary rises. EPF may or may not be capped, per the wage cap.
 */
export function calculateEpf(i: EpfInputs): EpfResult {
  const years = Math.max(0, Math.round(i.retirementAge - i.currentAge));
  const rows: EpfYearRow[] = [];

  let salary = i.monthlySalary;
  let balance = i.currentBalance + i.oneTimeTopup;
  const startBalance = balance;
  const realRate = (1 + i.epfInterest / 100) / (1 + i.inflation / 100) - 1;

  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalEps = 0;
  let totalInterest = 0;
  let epsBalance = 0;

  for (let y = 1; y <= years; y++) {
    // Salary grows before the year's contributions are taken.
    salary *= 1 + i.annualHike / 100;

    const epfWage = i.wageCapMode ? Math.min(salary, i.epfWageCap) : salary;
    const epsWage = Math.min(salary, i.epsWageCap);

    const employee = (epfWage * (i.employeeRate + i.vpfRate) * 12) / 100;
    const employer = (epfWage * i.employerEpfRate * 12) / 100;
    const eps = (epsWage * i.epsRate * 12) / 100;

    const opening = balance;
    // Interest is credited on the opening balance plus this year's additions,
    // matching the statutory notional-crediting convention.
    const interest = ((opening + employee + employer) * i.epfInterest) / 100;

    balance += employee + employer + interest;
    epsBalance = epsBalance * (1 + i.epfInterest / 100) + eps;

    totalEmployee += employee;
    totalEmployer += employer;
    totalEps += eps;
    totalInterest += interest;

    rows.push({
      year: y,
      age: i.currentAge + y,
      salary: round2(salary),
      employee: round2(employee),
      employer: round2(employer),
      eps: round2(eps),
      interest: round2(interest),
      balance: round2(balance),
      pensionToday: round2(epsBalance / Math.pow(1 + realRate, y)),
    });
  }

  // Pension is one third of the EPS balance at 60, per month, in today's money.
  const lastPension = rows.length ? rows[rows.length - 1].pensionToday : 0;

  return {
    years,
    totalEmployee: round2(totalEmployee),
    totalEmployer: round2(totalEmployer),
    totalEps: round2(totalEps),
    totalInterest: round2(totalInterest),
    totalInvested: round2(startBalance + totalEmployee + totalEmployer),
    corpus: round2(balance),
    corpusReal: round2(balance / Math.pow(1 + realRate, Math.max(1, years))),
    monthlyPension: round2(lastPension / 3 / 12),
    monthlyEpf: round2(balance / 12 / Math.max(1, 60 - i.retirementAge)),
    rows,
  };
}

/* ------------------------------------------------------------------ PPF */

export interface PpfInputs {
  annualInvestment: number;
  rate: number;
  tenure: number;
  /** Contribution frequency. */
  frequency: "year" | "month";
  openingBalance: number;
}

export interface PpfYearRow {
  year: number;
  opening: number;
  invested: number;
  interest: number;
  closing: number;
}

export interface PpfResult {
  maturity: number;
  totalInvested: number;
  totalInterest: number;
  rows: PpfYearRow[];
}

/**
 * PPF projection. Annual deposits are credited at the start of the financial
 * year; monthly deposits accrue interest each month, matching PPF convention.
 */
export function calculatePpf(i: PpfInputs): PpfResult {
  const r = i.rate / 100;
  const years = Math.max(0, Math.round(i.tenure));
  const rows: PpfYearRow[] = [];

  let balance = i.openingBalance;
  let totalInvested = i.openingBalance;

  for (let y = 1; y <= years; y++) {
    const opening = balance;
    let invested: number;
    let interest: number;

    if (i.frequency === "year") {
      // Deposit at the start of the year, then credit interest on the total.
      balance += i.annualInvestment;
      invested = i.annualInvestment;
      interest = balance * r;
      balance += interest;
    } else {
      const monthly = i.annualInvestment / 12;
      let running = opening;
      let accrued = 0;
      for (let m = 1; m <= 12; m++) {
        running += monthly;
        accrued += (running * r) / 12;
      }
      invested = i.annualInvestment;
      interest = accrued;
      balance = opening + invested + accrued;
    }

    totalInvested += invested;
    rows.push({
      year: y,
      opening: round2(opening),
      invested: round2(invested),
      interest: round2(interest),
      closing: round2(balance),
    });
  }

  return {
    maturity: round2(balance),
    totalInvested: round2(totalInvested),
    totalInterest: round2(Math.max(0, balance - totalInvested)),
    rows,
  };
}

/* ------------------------------------------------------------------ NPS */

export interface NpsInputs {
  monthlyContribution: number;
  currentAge: number;
  /** Expected annual return, percent. */
  returnRate: number;
  /** Share of the corpus drawn as an annuity, percent. */
  annuityPercent: number;
  /** Annuity (payout) rate, percent per annum. */
  annuityRate: number;
  /** Retirement age; the legacy calculator uses 60. */
  retirementAge?: number;
}

export interface NpsResult {
  years: number;
  invested: number;
  corpus: number;
  lumpsum: number;
  annuityCorpus: number;
  monthlyPension: number;
}

/**
 * NPS projection. Contributions are made at the start of each month, hence the
 * extra (1 + i) factor on the annuity formula.
 */
export function calculateNps(i: NpsInputs): NpsResult {
  const years = (i.retirementAge ?? 60) - i.currentAge;
  const n = years * 12;

  if (n <= 0) {
    return { years: 0, invested: 0, corpus: 0, lumpsum: 0, annuityCorpus: 0, monthlyPension: 0 };
  }

  const monthlyRate = i.returnRate / 100 / 12;
  // Future value of an annuity-due (payments at the start of the month).
  const factor = monthlyRate === 0 ? n : ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate) * (1 + monthlyRate);

  const corpus = i.monthlyContribution * factor;
  const annuityCorpus = corpus * (i.annuityPercent / 100);

  return {
    years,
    invested: round2(i.monthlyContribution * n),
    corpus: round2(corpus),
    lumpsum: round2(corpus - annuityCorpus),
    annuityCorpus: round2(annuityCorpus),
    // Annuity income = annuity corpus x annuity rate, spread over 12 months.
    monthlyPension: round2((annuityCorpus * (i.annuityRate / 100)) / 12),
  };
}

/* -------------------------------------------------------------- Gratuity */

export interface GratuityInputs {
  lastSalary: number;
  yearsOfService: number;
  extraMonths: number;
  /** Covered by the Payment of Gratuity Act (5+ years). */
  isCovered: boolean;
}

export interface GratuityResult {
  effectiveTenure: number;
  gratuity: number;
  taxFree: number;
  taxable: number;
  eligible: boolean;
}

/** Statutory tax-free gratuity ceiling. */
export const GRATUITY_TAX_FREE_LIMIT = 2_000_000;

export function calculateGratuity(i: GratuityInputs): GratuityResult {
  let effectiveTenure = i.yearsOfService;
  let gratuity: number;

  if (i.isCovered) {
    // Covered employees round up: more than 6 months counts as a full year.
    if (i.extraMonths > 6) effectiveTenure += 1;
    gratuity = (15 / 26) * i.lastSalary * effectiveTenure;
  } else {
    // Uncovered employees get no rounding.
    gratuity = (15 / 30) * i.lastSalary * effectiveTenure;
  }

  const taxFree = Math.min(gratuity, GRATUITY_TAX_FREE_LIMIT);
  const taxable = Math.max(0, gratuity - GRATUITY_TAX_FREE_LIMIT);

  return {
    effectiveTenure,
    gratuity: round2(gratuity),
    taxFree: round2(taxFree),
    taxable: round2(taxable),
    eligible: i.yearsOfService >= 5,
  };
}

/* ------------------------------------------------------------------ CAGR */

export interface CagrResult {
  cagr: number;
  profit: number;
  absoluteReturn: number;
  multiplier: number;
  futureValue: number;
}

/** Compound annual growth rate from an initial and a final value. */
export function calculateCagr(initial: number, finalValue: number, years: number): CagrResult | null {
  if (initial <= 0 || finalValue <= 0 || years <= 0) return null;
  const cagr = (Math.pow(finalValue / initial, 1 / years) - 1) * 100;
  const profit = finalValue - initial;
  return {
    cagr: round2(cagr),
    profit: round2(profit),
    absoluteReturn: round2((profit / initial) * 100),
    multiplier: round2(finalValue / initial),
    futureValue: round2(finalValue),
  };
}

/** Future value from a present amount, a CAGR and a horizon. */
export function futureValue(present: number, rate: number, years: number): CagrResult | null {
  if (present <= 0 || years <= 0) return null;
  const fv = present * Math.pow(1 + rate / 100, years);
  const profit = fv - present;
  return {
    cagr: round2(rate),
    profit: round2(profit),
    absoluteReturn: round2((profit / present) * 100),
    multiplier: round2(fv / present),
    futureValue: round2(fv),
  };
}

/* ------------------------------------------------------------------- SWP */

export interface SwpInputs {
  initialCorpus: number;
  monthlyWithdrawal: number;
  /** Expected annual return, percent. */
  rate: number;
  years: number;
  /** Annual withdrawal inflation, percent. */
  withdrawalInflation: number;
}

export interface SwpYearRow {
  year: number;
  opening: number;
  withdrawn: number;
  interest: number;
  closing: number;
  /** Withdrawal for that year, already inflated. */
  withdrawal: number;
}

export interface SwpResult {
  totalWithdrawal: number;
  totalInterest: number;
  /** True when the corpus survived the full horizon. */
  sustainable: boolean;
  /** Year the corpus ran out, or null when it lasted the whole term. */
  exhaustedYear: number | null;
  rows: SwpYearRow[];
}

/**
 * Systematic Withdrawal Plan. Each month the withdrawal is taken first, then
 * interest is credited on the reduced balance. Withdrawals rise with inflation
 * unless inflation is set to zero.
 */
export function calculateSwp(i: SwpInputs): SwpResult {
  const monthlyRate = i.rate / 100 / 12;
  const rows: SwpYearRow[] = [];

  let balance = i.initialCorpus;
  let totalWithdrawal = 0;
  let totalInterest = 0;
  let exhaustedYear: number | null = null;

  for (let y = 1; y <= Math.max(0, Math.round(i.years)); y++) {
    // Withdrawals escalate with inflation each year.
    const yearlyWithdrawal = i.monthlyWithdrawal * 12 * Math.pow(1 + i.withdrawalInflation / 100, y - 1);
    const opening = balance;
    let yearWithdrawal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      if (balance <= 0) {
        balance = 0;
        continue;
      }
      // Never withdraw more than remains.
      const actual = Math.min(yearlyWithdrawal / 12, balance);
      balance -= actual;
      yearWithdrawal += actual;

      const interest = balance * monthlyRate;
      balance += interest;
      yearInterest += interest;
    }

    totalWithdrawal += yearWithdrawal;
    totalInterest += yearInterest;
    if (exhaustedYear === null && balance <= 0) exhaustedYear = y;

    rows.push({
      year: y,
      opening: round2(opening),
      withdrawn: round2(yearWithdrawal),
      interest: round2(yearInterest),
      closing: round2(balance),
      withdrawal: round2(yearlyWithdrawal),
    });
  }

  return {
    totalWithdrawal: round2(totalWithdrawal),
    totalInterest: round2(totalInterest),
    sustainable: exhaustedYear === null,
    exhaustedYear,
    rows,
  };
}



