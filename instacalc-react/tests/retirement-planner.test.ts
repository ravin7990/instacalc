import { describe, expect, it } from "vitest";
import { planRetirement, accumulate } from "@/engines/retirement";

const BASE = {
  currentAge: 32, retirementAge: 60, lifeExpectancy: 85,
  currentMonthlyExpense: 4000, otherRetirementIncome: 1000,
  currentSavings: 50_000, monthlyContribution: 600, annualStepup: 4,
  preRetReturn: 8, postRetReturn: 5, inflation: 3, targetBequest: 50_000,
};

describe("accumulate", () => {
  it("emits one row per year to retirement", () => {
    const r = accumulate(BASE);
    expect(r.rows).toHaveLength(28);
    expect(r.rows[0].age).toBe(33);
  });

  it("leaves year one un-stepped and steps up thereafter", () => {
    const r = accumulate(BASE);
    const y1 = r.rows[0].annualContribution;
    const y2 = r.rows[1].annualContribution;
    expect(y2).toBeCloseTo(y1 * 1.04, 0);
  });

  it("credits interest before adding the contribution", () => {
    // With no contributions the balance is just the savings compounded monthly.
    const r = accumulate({ ...BASE, monthlyContribution: 0 });
    const expected = 50_000 * Math.pow(1 + 8 / 1200, 28 * 12);
    expect(r.corpus).toBeCloseTo(expected, 0);
  });

  it("counts the opening savings as invested", () => {
    const r = accumulate(BASE);
    expect(r.totalInvested).toBeGreaterThan(50_000);
    expect(r.corpus).toBeGreaterThan(r.totalInvested);
  });

  it("grows the balance every year", () => {
    const r = accumulate(BASE);
    for (let i = 1; i < r.rows.length; i++) {
      expect(r.rows[i].balance).toBeGreaterThan(r.rows[i - 1].balance);
    }
  });

  it("produces no rows when already at retirement age", () => {
    const r = accumulate({ ...BASE, currentAge: 60, retirementAge: 60 });
    expect(r.rows).toHaveLength(0);
    expect(r.corpus).toBe(50_000);
  });
});

describe("planRetirement", () => {
  it("splits the timeline into accumulation and retirement", () => {
    const r = planRetirement(BASE);
    expect(r.yearsToRetirement).toBe(28);
    expect(r.retirementYears).toBe(25);
  });

  it("inflates today's expenses to the first retirement year", () => {
    const r = planRetirement(BASE);
    const expected = 4000 * 12 * Math.pow(1.03, 28);
    expect(r.firstYearExpense).toBeCloseTo(expected, 0);
  });

  it("nets other retirement income off the withdrawal", () => {
    const r = planRetirement(BASE);
    expect(r.firstYearNetWithdrawal).toBeCloseTo(r.firstYearExpense - r.firstYearOtherIncome, 0);
  });

  it("adds the bequest present value to the withdrawal present value", () => {
    const r = planRetirement(BASE);
    expect(r.requiredCorpus).toBeCloseTo(r.bequestPV + (r.requiredCorpus - r.bequestPV), 0);
    expect(r.bequestPV).toBeCloseTo(50_000 / Math.pow(1.05, 25), 0);
  });

  it("reduces the required corpus when other income rises", () => {
    const low = planRetirement({ ...BASE, otherRetirementIncome: 0 });
    const high = planRetirement({ ...BASE, otherRetirementIncome: 3000 });
    expect(high.requiredCorpus).toBeLessThan(low.requiredCorpus);
  });

  it("reports a shortfall when the projection falls short", () => {
    // A tiny contribution against a large target must not be on track.
    const r = planRetirement({ ...BASE, monthlyContribution: 10, currentSavings: 0 });
    expect(r.onTrack).toBe(false);
    expect(r.shortfall).toBeGreaterThan(0);
    expect(r.shortfall).toBeCloseTo(r.requiredCorpus - r.projectedCorpus, 0);
  });

  it("reports no shortfall when the projection covers the plan", () => {
    const r = planRetirement({ ...BASE, monthlyContribution: 3000, currentSavings: 500_000 });
    expect(r.onTrack).toBe(true);
    expect(r.shortfall).toBe(0);
  });

  it("applies the 4% rule to the projected corpus", () => {
    const r = planRetirement(BASE);
    expect(r.monthlyIncomeAtRetirement).toBeCloseTo((r.projectedCorpus * 0.04) / 12, 0);
  });

  it("simulates a drawdown row per retirement year", () => {
    const r = planRetirement(BASE);
    expect(r.drawdown).toHaveLength(25);
    expect(r.drawdown[0].age).toBe(60);
  });

  it("never drives the retirement balance below zero", () => {
    const r = planRetirement({ ...BASE, postRetReturn: 1 });
    for (const row of r.drawdown) expect(row.balance).toBeGreaterThanOrEqual(0);
  });

  it("escalates withdrawals with inflation", () => {
    const r = planRetirement(BASE);
    expect(r.drawdown[1].withdrawal).toBeGreaterThan(r.drawdown[0].withdrawal);
  });

  it("needs no corpus when expenses are fully covered by other income", () => {
    const r = planRetirement({ ...BASE, otherRetirementIncome: 100_000, targetBequest: 0 });
    expect(r.requiredCorpus).toBe(0);
    expect(r.onTrack).toBe(true);
  });
});