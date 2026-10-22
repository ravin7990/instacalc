/**
 * Compound interest and simple interest engines.
 *
 * Compound interest supports a recurring contribution and several compounding
 * frequencies, matching the legacy pages' capability set.
 */

export type Frequency = "yearly" | "quarterly" | "monthly" | "weekly" | "daily";

const PERIODS: Record<Frequency, number> = {
  yearly: 1,
  quarterly: 4,
  monthly: 12,
  weekly: 52,
  daily: 365,
};

export interface CompoundInputs {
  principal: number;
  ratePercent: number;
  years: number;
  frequency: Frequency;
  /** Optional recurring contribution made at the end of each period. */
  recurring?: number;
}

export interface CompoundRow {
  year: number;
  invested: number;
  interest: number;
  amount: number;
}

export interface CompoundResult {
  maturity: number;
  totalInvested: number;
  totalInterest: number;
  effectiveAnnualRate: number;
  rows: CompoundRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateCompound({
  principal,
  ratePercent,
  years,
  frequency,
  recurring = 0,
}: CompoundInputs): CompoundResult {
  const perYear = PERIODS[frequency];
  const r = ratePercent / 100 / perYear;
  const totalPeriods = Math.round(years * perYear);

  let amount = principal;
  let invested = principal;
  const rows: CompoundRow[] = [];

  for (let p = 1; p <= totalPeriods; p++) {
    amount = amount * (1 + r) + recurring;
    invested += recurring;

    if (p % perYear === 0) {
      rows.push({
        year: p / perYear,
        invested: round2(invested),
        interest: round2(amount - invested),
        amount: round2(amount),
      });
    }
  }

  return {
    maturity: round2(amount),
    totalInvested: round2(invested),
    totalInterest: round2(amount - invested),
    // Nominal rate compounded more often yields a higher effective yield.
    effectiveAnnualRate: round2((Math.pow(1 + r, perYear) - 1) * 100),
    rows,
  };
}

/**
 * Simple interest: interest is always computed on the ORIGINAL principal, so
 * growth is linear and A = P(1 + r·t).
 *
 * A recurring instalment added at the END of year y earns simple interest only
 * for the remaining (n - y) years, so over the life of the plan the instalments
 * contribute r·(n-1) + r·(n-2) + … + r·0.
 */
export function calculateSimple({
  principal,
  ratePercent,
  years,
  recurring = 0,
}: Omit<CompoundInputs, "frequency">): CompoundResult {
  const r = ratePercent / 100;
  const n = Math.round(years);
  const rows: CompoundRow[] = [];
  let invested = principal;
  let amount = principal;

  for (let y = 1; y <= n; y++) {
    amount += recurring;
    invested += recurring;
    // Each year, the principal earns r, and every instalment added in a
    // previous year (there are y-1 of them) earns r as well.
    const interest = (principal + recurring * (y - 1)) * r;
    amount += interest;
    rows.push({
      year: y,
      invested: round2(invested),
      interest: round2(interest),
      amount: round2(amount),
    });
  }

  return {
    maturity: round2(amount),
    totalInvested: round2(invested),
    totalInterest: round2(amount - invested),
    effectiveAnnualRate: round2(ratePercent),
    rows,
  };
}
