import { describe, expect, it } from "vitest";
import {
  calculateMutualFund,
  simulatePortfolio,
  estimateRedemption,
  scenarioAdjustedReturn,
  estimateRequiredInitial,
  type MutualFundInputs,
} from "@/engines/mutual-fund";

const BASE: MutualFundInputs = {
  initialInvestment: 500_000,
  monthlyTopup: 10_000,
  returnRate: 12,
  years: 15,
  stepUp: 5,
  expenseRatio: 1,
  inflation: 6,
  exitLoad: 1,
  ltcgRate: 12.5,
  ltcgExemption: 125_000,
  swpStartYear: 0,
  swpMonthly: 0,
  targetCorpus: 20_000_000,
  riskScenario: "base",
};

describe("scenarioAdjustedReturn", () => {
  it("offsets by two points either side of the base case", () => {
    expect(scenarioAdjustedReturn(12, "base")).toBe(12);
    expect(scenarioAdjustedReturn(12, "conservative")).toBe(10);
    expect(scenarioAdjustedReturn(12, "aggressive")).toBe(14);
  });

  it("never returns a negative rate", () => {
    expect(scenarioAdjustedReturn(1, "conservative")).toBe(0);
  });
});

describe("estimateRedemption", () => {
  it("charges the exit load on the whole corpus", () => {
    const r = estimateRedemption(1_000_000, 500_000, 1, 12.5, 0);
    expect(r.exitLoadAmount).toBe(10_000);
  });

  it("charges LTCG only on the gain above the exemption", () => {
    const r = estimateRedemption(1_000_000, 500_000, 0, 12.5, 125_000);
    // Gain 500k less 125k exemption = 375k taxable at 12.5%.
    expect(r.taxAmount).toBeCloseTo(375_000 * 0.125, 0);
  });

  it("charges no tax when the gain sits inside the exemption", () => {
    const r = estimateRedemption(600_000, 500_000, 0, 12.5, 125_000);
    expect(r.taxAmount).toBe(0);
    expect(r.net).toBe(600_000);
  });

  it("treats a loss as no gain", () => {
    const r = estimateRedemption(400_000, 500_000, 0, 12.5, 0);
    expect(r.gain).toBe(0);
    expect(r.taxAmount).toBe(0);
  });
});

describe("simulatePortfolio", () => {
  it("emits one row per year", () => {
    expect(simulatePortfolio(BASE).rows).toHaveLength(15);
  });

  it("adds every top-up to the invested total", () => {
    // Year one only: the step-up does not apply until year two.
    const r = simulatePortfolio({ ...BASE, years: 1, stepUp: 0 });
    expect(r.invested).toBe(500_000 + 10_000 * 12);
  });

  it("steps the top-up up each year but not in year one", () => {
    const rows = simulatePortfolio(BASE).rows;
    const y2 = rows[1].invested - rows[0].invested;
    expect(y2).toBeGreaterThan(rows[0].invested - 500_000);
  });

  it("charges the expense ratio every month, reducing the corpus", () => {
    const withFees = simulatePortfolio({ ...BASE, expenseRatio: 2 });
    const without = simulatePortfolio({ ...BASE, expenseRatio: 0 });
    expect(withFees.grossCorpus).toBeLessThan(without.grossCorpus);
    expect(withFees.expenseDrag).toBeGreaterThan(0);
  });

  it("applies the scenario offset to the return", () => {
    const low = simulatePortfolio({ ...BASE, riskScenario: "conservative" });
    const high = simulatePortfolio({ ...BASE, riskScenario: "aggressive" });
    expect(high.grossCorpus).toBeGreaterThan(low.grossCorpus);
  });

  it("takes withdrawals only from the configured start year", () => {
    const none = simulatePortfolio({ ...BASE, swpStartYear: 0, swpMonthly: 50_000 });
    expect(none.cumulativeSwp).toBe(0);

    const late = simulatePortfolio({ ...BASE, swpStartYear: 11, swpMonthly: 50_000 });
    // 5 years x 12 months x 50k.
    expect(late.cumulativeSwp).toBeCloseTo(5 * 12 * 50_000, 0);
  });

  it("never withdraws more than the corpus holds", () => {
    const r = simulatePortfolio({ ...BASE, swpStartYear: 1, swpMonthly: 10_000_000 });
    expect(r.grossCorpus).toBeGreaterThanOrEqual(0);
    expect(r.cumulativeSwp).toBeLessThan(10_000_000 * 15 + 1);
  });

  it("grows the corpus over a positive-return horizon", () => {
    const r = simulatePortfolio({ ...BASE, expenseRatio: 0, exitLoad: 0, ltcgRate: 0 });
    expect(r.grossCorpus).toBeGreaterThan(r.invested);
  });
});

describe("calculateMutualFund", () => {
  it("reports the net redemption after load and tax", () => {
    const r = calculateMutualFund(BASE);
    const { gain, exitLoadAmount, taxAmount, net } = r.finalRedemption;
    expect(net).toBeCloseTo(r.grossCorpus - exitLoadAmount - taxAmount, 0);
    expect(gain).toBeGreaterThan(0);
  });

  it("reports a real-terms value below the nominal net value", () => {
    const r = calculateMutualFund(BASE);
    expect(r.netRealTerms).toBeLessThan(r.finalRedemption.net);
  });

  it("computes an effective CAGR across the plan", () => {
    const r = calculateMutualFund(BASE);
    expect(r.effectiveCagr).toBeGreaterThan(0);
    // It should sit below the headline return after drag, load and tax.
    expect(r.effectiveCagr).toBeLessThan(BASE.returnRate);
  });

  it("returns zero CAGR when nothing is invested", () => {
    const r = calculateMutualFund({ ...BASE, initialInvestment: 0, monthlyTopup: 0 });
    expect(r.effectiveCagr).toBe(0);
  });
});

describe("estimateRequiredInitial", () => {
  it("solves for a lump sum that reaches the target", () => {
    const target = 20_000_000;
    const needed = estimateRequiredInitial(target, BASE)!;
    expect(needed).toBeGreaterThan(0);

    const check = simulatePortfolio({ ...BASE, initialInvestment: needed }).finalRedemption.net;
    // Relative comparison: the solver works in large currency amounts.
    expect(Math.abs(check - target) / target).toBeLessThan(0.001);
  });

  it("returns null for a non-positive target", () => {
    expect(estimateRequiredInitial(0, BASE)).toBeNull();
    expect(estimateRequiredInitial(-5, BASE)).toBeNull();
  });

  it("needs less when the monthly top-up is higher", () => {
    const low = estimateRequiredInitial(20_000_000, BASE)!;
    const high = estimateRequiredInitial(20_000_000, { ...BASE, monthlyTopup: 50_000 })!;
    expect(high).toBeLessThan(low);
  });
});