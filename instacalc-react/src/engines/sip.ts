/**
 * SIP (Systematic Investment Plan) engine.
 *
 * Pure functions, no DOM. The legacy site carried ~42 KB of inline JS per
 * locale for this; here it is one tested module shared by every locale.
 */

export interface SipInputs {
  /** Monthly investment. */
  monthly: number;
  /** Annualised expected return, in percent (e.g. 12 for 12%). */
  annualRate: number;
  /** Investment tenure in years. */
  years: number;
  /** Annual step-up applied to the monthly amount, in percent. 0 = none. */
  stepUpPercent?: number;
  /** Expected annual inflation, in percent, used for the real-value figure. */
  inflationPercent?: number;
}

export interface SipYearRow {
  year: number;
  /** Contribution made during this year. */
  contributed: number;
  /** Balance at the end of this year. */
  balance: number;
  /** Interest earned in this year. */
  interest: number;
}

export interface SipResult {
  monthly: number;
  monthlyRate: number;
  months: number;
  totalInvested: number;
  /** Future value of the invested corpus. */
  corpus: number;
  /** corpus - totalInvested */
  estimatedReturns: number;
  /** Corpus expressed in today's money. */
  inflationAdjustedCorpus: number;
  /** Absolute gain in today's money. */
  realReturns: number;
  /** Simple annualised return on invested amount. */
  cagrOnInvestment: number;
  rows: SipYearRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateSip(input: SipInputs): SipResult {
  const { monthly, annualRate, years } = input;
  const stepUp = input.stepUpPercent ?? 0;
  const inflation = input.inflationPercent ?? 0;

  const months = Math.max(0, Math.round(years * 12));
  const monthlyRate = annualRate / 100 / 12;
  // Step-up is applied once a year, converted to the equivalent monthly growth.
  const monthlyStepFactor = stepUp / 100 / 12;

  let balance = 0;
  let totalInvested = 0;
  let currentMonthly = monthly;
  const rows: SipYearRow[] = [];

  for (let m = 1; m <= months; m++) {
    // Contributions are made at the start of each month.
    if (monthlyRate > 0) {
      balance = balance * (1 + monthlyRate) + currentMonthly;
    } else {
      balance += currentMonthly;
    }
    totalInvested += currentMonthly;

    if (m % 12 === 0) {
      const year = m / 12;
      rows.push({
        year,
        contributed: round2(totalInvested),
        balance: round2(balance),
        interest: round2(balance - totalInvested),
      });
      // Step-up compounds on the monthly amount once per year.
      currentMonthly *= 1 + monthlyStepFactor;
    }
  }

  // If the tenure is not a whole number of years, fold the remainder in.
  if (months > 0 && months % 12 !== 0) {
    rows.push({
      year: round2(years),
      contributed: round2(totalInvested),
      balance: round2(balance),
      interest: round2(balance - totalInvested),
    });
  }

  const realRate = inflationRate(monthlyRate, inflation / 100 / 12);
  const inflationAdjusted = months > 0 && realRate > 0 ? balance / Math.pow(1 + realRate, months) : balance;

  const investedForYears = months / 12;

  return {
    monthly,
    monthlyRate,
    months,
    totalInvested: round2(totalInvested),
    corpus: round2(balance),
    estimatedReturns: round2(balance - totalInvested),
    inflationAdjustedCorpus: round2(inflationAdjusted),
    realReturns: round2(inflationAdjusted - totalInvested),
    cagrOnInvestment:
      investedForYears > 0 && totalInvested > 0
        ? round2((Math.pow(balance / totalInvested, 1 / investedForYears) - 1) * 100)
        : 0,
    rows,
  };
}

/** Converts a nominal monthly rate into the matching real monthly rate. */
function inflationRate(nominalMonthly: number, inflationMonthly: number): number {
  return (1 + nominalMonthly) / (1 + inflationMonthly) - 1;
}

/**
 * Smallest constant monthly SIP that reaches `target`, found by bisection.
 * Used by the goal-based planner on the SIP page.
 */
export function requiredMonthlySip(target: number, annualRate: number, years: number): number {
  const months = Math.max(1, Math.round(years * 12));
  if (months === 0 || target <= 0) return 0;

  const futureValueOf = (payment: number) => {
    const r = annualRate / 100 / 12;
    if (r === 0) return payment * months;
    return payment * ((Math.pow(1 + r, months) - 1) / r);
  };

  let lo = 0;
  let hi = Math.max(target, 1);
  while (futureValueOf(hi) < target && hi < 1e12) hi *= 2;

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (futureValueOf(mid) < target) lo = mid;
    else hi = mid;
  }
  return round2((lo + hi) / 2);
}
