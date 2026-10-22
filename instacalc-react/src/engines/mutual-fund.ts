/**
 * Mutual fund return engine: lumpsum plus monthly SIP, with expense-ratio drag,
 * exit load, LTCG tax and an optional withdrawal phase.
 *
 * Ported from the legacy mutual fund return calculator, including its monthly
 * ordering: grow, deduct expenses, add the top-up, then take any SWP.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

export type RiskScenario = "conservative" | "base" | "aggressive";

export interface MutualFundInputs {
  initialInvestment: number;
  monthlyTopup: number;
  /** Expected annualised return, percent. */
  returnRate: number;
  years: number;
  /** Annual step-up to the monthly top-up, percent. */
  stepUp: number;
  /** Annual expense ratio, percent. */
  expenseRatio: number;
  /** Expected inflation, percent. */
  inflation: number;
  /** Exit load, percent of the corpus. */
  exitLoad: number;
  /** LTCG rate, percent. */
  ltcgRate: number;
  /** Statutory LTCG exemption, in currency. */
  ltcgExemption: number;
  /** Year the SWP starts (0 = never). */
  swpStartYear: number;
  swpMonthly: number;
  targetCorpus: number;
  riskScenario: RiskScenario;
}

export interface Redemption {
  gain: number;
  exitLoadAmount: number;
  taxAmount: number;
  net: number;
}

export interface MutualFundRow {
  year: number;
  invested: number;
  grossCorpus: number;
  cumulativeSwp: number;
  netIfRedeemed: number;
}

export interface MutualFundResult {
  months: number;
  invested: number;
  grossCorpus: number;
  cumulativeSwp: number;
  expenseDrag: number;
  finalRedemption: Redemption;
  /** Net value in today's money, after inflation. */
  netRealTerms: number;
  /** Effective CAGR across the whole plan, including any withdrawals. */
  effectiveCagr: number;
  /** Initial lump sum needed to hit the target, or null. */
  requiredInitial: number | null;
  rows: MutualFundRow[];
}

/** Scenario offsets applied to the base return, per the legacy calculator. */
export function scenarioAdjustedReturn(baseReturn: number, scenario: RiskScenario): number {
  const offset = scenario === "conservative" ? -2 : scenario === "aggressive" ? 2 : 0;
  return Math.max(0, baseReturn + offset);
}

/**
 * Net value if the corpus were redeemed today: the exit load applies to the
 * whole corpus, while LTCG applies only to the gain above the exemption.
 */
export function estimateRedemption(
  corpus: number,
  invested: number,
  exitLoadRate: number,
  taxRate: number,
  taxExemption: number,
): Redemption {
  const gain = Math.max(0, corpus - invested);
  const exitLoadAmount = Math.max(0, corpus * (Math.max(0, exitLoadRate) / 100));
  const taxableGain = Math.max(0, gain - Math.max(0, taxExemption));
  const taxAmount = taxableGain * (Math.max(0, taxRate) / 100);
  return {
    gain: round2(gain),
    exitLoadAmount: round2(exitLoadAmount),
    taxAmount: round2(taxAmount),
    net: round2(Math.max(0, corpus - exitLoadAmount - taxAmount)),
  };
}

/** Month-by-month portfolio simulation. */
export function simulatePortfolio(
  i: MutualFundInputs,
): Omit<MutualFundResult, "netRealTerms" | "effectiveCagr" | "requiredInitial"> {
  const months = Math.max(0, Math.round(i.years * 12));
  const adjustedReturn = scenarioAdjustedReturn(i.returnRate, i.riskScenario);
  const monthlyGrowth = adjustedReturn / 1200;
  const monthlyExpense = Math.max(0, i.expenseRatio) / 1200;

  let invested = Math.max(0, i.initialInvestment);
  let corpus = Math.max(0, i.initialInvestment);
  let monthlyTopup = Math.max(0, i.monthlyTopup);
  let cumulativeSwp = 0;
  let expenseDrag = 0;
  const rows: MutualFundRow[] = [];

  const swpStartMonth = i.swpStartYear > 0 ? (i.swpStartYear - 1) * 12 + 1 : Number.POSITIVE_INFINITY;

  for (let month = 1; month <= months; month++) {
    // The step-up applies at the start of each new year, not in year one.
    if (i.stepUp > 0 && month > 1 && (month - 1) % 12 === 0) {
      monthlyTopup *= 1 + i.stepUp / 100;
    }

    corpus *= 1 + monthlyGrowth;

    // The expense ratio is charged on the balance before the top-up lands.
    const expense = Math.max(0, corpus * monthlyExpense);
    corpus -= expense;
    expenseDrag += expense;

    if (monthlyTopup > 0) {
      corpus += monthlyTopup;
      invested += monthlyTopup;
    }

    if (month >= swpStartMonth && i.swpMonthly > 0) {
      const withdrawn = Math.min(corpus, i.swpMonthly);
      corpus -= withdrawn;
      cumulativeSwp += withdrawn;
    }

    if (month % 12 === 0) {
      rows.push({
        year: month / 12,
        invested: round2(invested),
        grossCorpus: round2(corpus),
        cumulativeSwp: round2(cumulativeSwp),
        netIfRedeemed: estimateRedemption(corpus, invested, i.exitLoad, i.ltcgRate, i.ltcgExemption).net,
      });
    }
  }

  return {
    months,
    invested: round2(invested),
    grossCorpus: round2(corpus),
    cumulativeSwp: round2(cumulativeSwp),
    expenseDrag: round2(expenseDrag),
    finalRedemption: estimateRedemption(corpus, invested, i.exitLoad, i.ltcgRate, i.ltcgExemption),
    rows,
  };
}

/**
 * Bisects the opening lump sum that reaches a target net value with the same
 * recurring plan, which is how the legacy page sizes the starting investment.
 */
export function estimateRequiredInitial(targetNet: number, i: MutualFundInputs): number | null {
  if (!Number.isFinite(targetNet) || targetNet <= 0) return null;

  const netFor = (initial: number) =>
    simulatePortfolio({ ...i, initialInvestment: initial }).finalRedemption.net;

  let lo = 0;
  let hi = Math.max(targetNet, 100_000);
  // Expand until the upper bound is sufficient.
  for (let guard = 0; guard < 40 && netFor(hi) < targetNet; guard++) hi *= 2;

  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    if (netFor(mid) < targetNet) lo = mid;
    else hi = mid;
  }
  return round2((lo + hi) / 2);
}

export function calculateMutualFund(i: MutualFundInputs): MutualFundResult {
  const base = simulatePortfolio(i);

  const inflationFactor = Math.pow(1 + i.inflation / 100, i.years);
  const netRealTerms =
    inflationFactor > 0 ? base.finalRedemption.net / inflationFactor : base.finalRedemption.net;

  const wealthRealized = base.finalRedemption.net + base.cumulativeSwp;
  const effectiveCagr =
    i.years > 0 && base.invested > 0 && wealthRealized > 0
      ? (Math.pow(wealthRealized / base.invested, 1 / i.years) - 1) * 100
      : 0;

  return {
    ...base,
    netRealTerms: round2(netRealTerms),
    effectiveCagr: round2(effectiveCagr),
    requiredInitial: estimateRequiredInitial(i.targetCorpus, i),
  };
}