import { describe, expect, it } from "vitest";
import {
  calculateEpf,
  calculatePpf,
  calculateNps,
  calculateGratuity,
  GRATUITY_TAX_FREE_LIMIT,
  calculateCagr,
  futureValue,
  calculateSwp,
} from "@/engines/retirement-plans";

/** The default inputs the legacy EPF page starts with. */
const EPF_DEFAULTS = {
  monthlySalary: 50_000,
  currentAge: 30,
  retirementAge: 58,
  annualHike: 7,
  employeeRate: 12,
  vpfRate: 0,
  epfInterest: 8.25,
  employerEpfRate: 3.67,
  epsRate: 8.33,
  epsWageCap: 15_000,
  wageCapMode: false,
  epfWageCap: 15_000,
  currentBalance: 250_000,
  oneTimeTopup: 0,
  inflation: 6,
};

describe("calculateEpf", () => {
  it("projects one row per year to retirement", () => {
    const r = calculateEpf(EPF_DEFAULTS);
    expect(r.years).toBe(28);
    expect(r.rows).toHaveLength(28);
  });

  it("applies the annual salary hike before the year's contributions", () => {
    const r = calculateEpf(EPF_DEFAULTS);
    expect(r.rows[0].salary).toBeCloseTo(53_500, 0);
    expect(r.rows[0].age).toBe(31);
  });

  it("computes employee and employer contributions as percentages of salary", () => {
    const y1 = calculateEpf(EPF_DEFAULTS).rows[0];
    expect(y1.employee).toBeCloseTo(53_500 * 0.12 * 12, 0);
    expect(y1.employer).toBeCloseTo(53_500 * 0.0367 * 12, 0);
  });

  it("caps EPS at the statutory wage ceiling regardless of salary", () => {
    for (const row of calculateEpf(EPF_DEFAULTS).rows) {
      expect(row.eps).toBeLessThanOrEqual(15_000 * 0.0833 * 12 + 1);
    }
  });

  it("caps EPF too when the wage cap is enabled", () => {
    const uncapped = calculateEpf({ ...EPF_DEFAULTS, currentAge: 40 });
    const capped = calculateEpf({ ...EPF_DEFAULTS, currentAge: 40, wageCapMode: true });
    expect(capped.corpus).toBeLessThan(uncapped.corpus);
  });

  it("includes the existing balance and any one-time top-up", () => {
    const base = calculateEpf({ ...EPF_DEFAULTS, currentAge: 50, oneTimeTopup: 0 });
    const topped = calculateEpf({ ...EPF_DEFAULTS, currentAge: 50, oneTimeTopup: 100_000 });
    expect(topped.corpus).toBeGreaterThan(base.corpus + 100_000);
  });

  it("credits interest on the opening balance plus contributions", () => {
    const y1 = calculateEpf({ ...EPF_DEFAULTS, currentAge: 55, annualHike: 0 }).rows[0];
    expect(y1.interest).toBeCloseTo((250_000 + y1.employee + y1.employer) * 0.0825, 0);
  });

  it("reports a real-terms corpus below the nominal one", () => {
    const r = calculateEpf(EPF_DEFAULTS);
    expect(r.corpusReal).toBeLessThan(r.corpus);
    expect(r.corpusReal).toBeGreaterThan(0);
  });

  it("produces positive monthly pension and EPF withdrawal figures", () => {
    const r = calculateEpf(EPF_DEFAULTS);
    expect(r.monthlyPension).toBeGreaterThan(0);
    expect(r.monthlyEpf).toBeGreaterThan(0);
  });

  it("is monotonic: a higher salary never lowers the corpus", () => {
    const low = calculateEpf({ ...EPF_DEFAULTS, monthlySalary: 20_000 });
    const high = calculateEpf({ ...EPF_DEFAULTS, monthlySalary: 80_000 });
    expect(high.corpus).toBeGreaterThan(low.corpus);
  });

  it("handles immediate retirement without producing rows", () => {
    const r = calculateEpf({ ...EPF_DEFAULTS, currentAge: 58, retirementAge: 58 });
    expect(r.rows).toHaveLength(0);
    expect(r.corpus).toBeCloseTo(250_000, 0);
  });
});

describe("calculatePpf", () => {
  it("compounds an annual deposit made at the start of the year", () => {
    const r = calculatePpf({
      annualInvestment: 150_000, rate: 7.1, tenure: 1, frequency: "year", openingBalance: 0,
    });
    expect(r.maturity).toBeCloseTo(150_000 * 1.071, 0);
    expect(r.totalInvested).toBe(150_000);
  });

  it("compounds over the full tenure", () => {
    const r = calculatePpf({
      annualInvestment: 150_000, rate: 7.1, tenure: 15, frequency: "year", openingBalance: 0,
    });
    expect(r.rows).toHaveLength(15);
    expect(r.totalInvested).toBe(150_000 * 15);
    expect(r.maturity).toBeGreaterThan(r.totalInvested);
    expect(r.totalInterest).toBeCloseTo(r.maturity - r.totalInvested, 0);
  });

  it("earns more with annual deposits, because they are credited at year start", () => {
    // A yearly deposit lands before interest is credited, so each rupee earns a
    // full year. Monthly deposits sit idle until their month comes round, so the
    // average balance earning interest is lower.
    const base = { annualInvestment: 150_000, rate: 7.1, tenure: 15, openingBalance: 0 };
    const annual = calculatePpf({ ...base, frequency: "year" });
    const monthly = calculatePpf({ ...base, frequency: "month" });
    expect(annual.maturity).toBeGreaterThan(monthly.maturity);
    expect(annual.totalInterest).toBeGreaterThan(monthly.totalInterest);
  });

  it("carries an opening balance into the projection", () => {
    const r = calculatePpf({
      annualInvestment: 100_000, rate: 7.1, tenure: 3, frequency: "year", openingBalance: 50_000,
    });
    expect(r.rows[0].opening).toBe(50_000);
    expect(r.totalInvested).toBe(50_000 + 100_000 * 3);
  });

  it("keeps the balance growing year on year", () => {
    const r = calculatePpf({
      annualInvestment: 150_000, rate: 7.1, tenure: 15, frequency: "year", openingBalance: 0,
    });
    for (let i = 1; i < r.rows.length; i++) {
      expect(r.rows[i].closing).toBeGreaterThan(r.rows[i - 1].closing);
    }
  });
});

describe("calculateNps", () => {
  const NPS = { monthlyContribution: 10_000, currentAge: 30, returnRate: 10, annuityPercent: 40, annuityRate: 6 };

  it("invests the contribution every month to age 60", () => {
    const r = calculateNps(NPS);
    expect(r.years).toBe(30);
    expect(r.invested).toBe(10_000 * 360);
  });

  it("matches the annuity-due future value", () => {
    const i = 0.1 / 12;
    const n = 30 * 12;
    const expected = 10_000 * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    expect(calculateNps(NPS).corpus).toBeCloseTo(expected, 0);
  });

  it("splits the corpus between lumpsum and annuity", () => {
    const r = calculateNps(NPS);
    expect(r.annuityCorpus).toBeCloseTo(r.corpus * 0.4, 0);
    expect(r.lumpsum + r.annuityCorpus).toBeCloseTo(r.corpus, 0);
  });

  it("derives the monthly pension from the annuity corpus", () => {
    const r = calculateNps(NPS);
    expect(r.monthlyPension).toBeCloseTo((r.annuityCorpus * 0.06) / 12, 0);
  });

  it("returns zeros at or past retirement age", () => {
    const r = calculateNps({ ...NPS, currentAge: 60 });
    expect(r.corpus).toBe(0);
    expect(r.invested).toBe(0);
  });
});

describe("calculateGratuity", () => {
  it("uses 15/26 for covered employees", () => {
    const r = calculateGratuity({ lastSalary: 50_000, yearsOfService: 5, extraMonths: 0, isCovered: true });
    expect(r.gratuity).toBeCloseTo((15 / 26) * 50_000 * 5, 0);
  });

  it("uses 15/30 for uncovered employees", () => {
    const r = calculateGratuity({ lastSalary: 50_000, yearsOfService: 5, extraMonths: 0, isCovered: false });
    expect(r.gratuity).toBeCloseTo((15 / 30) * 50_000 * 5, 0);
  });

  it("rounds up only when extra months exceed six", () => {
    const base = { lastSalary: 50_000, yearsOfService: 5, isCovered: true };
    expect(calculateGratuity({ ...base, extraMonths: 6 }).effectiveTenure).toBe(5);
    expect(calculateGratuity({ ...base, extraMonths: 7 }).effectiveTenure).toBe(6);
  });

  it("never rounds up when not covered", () => {
    const r = calculateGratuity({ lastSalary: 50_000, yearsOfService: 5, extraMonths: 11, isCovered: false });
    expect(r.effectiveTenure).toBe(5);
  });

  it("splits gratuity at the tax-free ceiling", () => {
    const r = calculateGratuity({ lastSalary: 500_000, yearsOfService: 20, extraMonths: 0, isCovered: true });
    expect(r.taxFree).toBe(GRATUITY_TAX_FREE_LIMIT);
    expect(r.taxable).toBeCloseTo(r.gratuity - GRATUITY_TAX_FREE_LIMIT, 0);
  });

  it("marks eligibility at five years of service", () => {
    const base = { lastSalary: 50_000, extraMonths: 0, isCovered: true };
    expect(calculateGratuity({ ...base, yearsOfService: 5 }).eligible).toBe(true);
    expect(calculateGratuity({ ...base, yearsOfService: 4 }).eligible).toBe(false);
  });
});

describe("calculateCagr", () => {
  it("doubles in five years at roughly 14.87 percent", () => {
    const r = calculateCagr(100_000, 200_000, 5)!;
    expect(r.cagr).toBeCloseTo(14.87, 1);
    expect(r.multiplier).toBeCloseTo(2, 2);
  });

  it("reports profit and absolute return", () => {
    const r = calculateCagr(100_000, 150_000, 4)!;
    expect(r.profit).toBe(50_000);
    expect(r.absoluteReturn).toBeCloseTo(50, 6);
  });

  it("returns null for invalid inputs", () => {
    expect(calculateCagr(0, 100, 5)).toBeNull();
    expect(calculateCagr(100, 0, 5)).toBeNull();
    expect(calculateCagr(100, 200, 0)).toBeNull();
  });

  it("compounds futureValue correctly", () => {
    expect(futureValue(100_000, 10, 10)!.futureValue).toBeCloseTo(100_000 * Math.pow(1.1, 10), 0);
  });

  it("inverts futureValue back into the same rate", () => {
    const fv = futureValue(100_000, 12, 10)!;
    expect(calculateCagr(100_000, fv.futureValue, 10)!.cagr).toBeCloseTo(12, 1);
  });
});

describe("calculateSwp", () => {
  // 50k/month from 50 lakh is a 10% annual withdrawal, well above the ~3.4%
  // safe rate, so it legitimately exhausts. A sustainable rate needs a much
  // larger corpus relative to the withdrawal.
  const SWP = { initialCorpus: 20_000_000, monthlyWithdrawal: 50_000, rate: 8, years: 20 };

  it("projects one row per year", () => {
    expect(calculateSwp({ ...SWP, withdrawalInflation: 0 }).rows).toHaveLength(20);
  });

  it("withdraws before crediting interest", () => {
    const r = calculateSwp({ initialCorpus: 1_000_000, monthlyWithdrawal: 10_000, rate: 12, years: 1, withdrawalInflation: 0 });
    expect(r.totalWithdrawal).toBeCloseTo(120_000, 0);
    expect(r.totalInterest).toBeGreaterThan(0);
  });

  it("flags an unsustainable withdrawal rate", () => {
    const r = calculateSwp({ initialCorpus: 1_000_000, monthlyWithdrawal: 100_000, rate: 4, years: 20, withdrawalInflation: 0 });
    expect(r.sustainable).toBe(false);
    expect(r.exhaustedYear).not.toBeNull();
  });

  it("flags a conservative withdrawal rate as sustainable", () => {
    const r = calculateSwp({ ...SWP, withdrawalInflation: 0 });
    expect(r.sustainable).toBe(true);
    expect(r.exhaustedYear).toBeNull();
  });

  it("never drives the balance below zero", () => {
    const r = calculateSwp({ initialCorpus: 500_000, monthlyWithdrawal: 90_000, rate: 2, years: 15, withdrawalInflation: 5 });
    for (const row of r.rows) expect(row.closing).toBeGreaterThanOrEqual(0);
  });

  it("escalates withdrawals with inflation", () => {
    const flat = calculateSwp({ ...SWP, years: 10, withdrawalInflation: 0 });
    const rising = calculateSwp({ ...SWP, years: 10, withdrawalInflation: 6 });
    expect(rising.totalWithdrawal).toBeGreaterThan(flat.totalWithdrawal);
    expect(rising.rows[9].withdrawal).toBeGreaterThan(rising.rows[0].withdrawal);
  });
});


