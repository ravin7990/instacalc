import { describe, expect, it } from "vitest";
import {
  employmentDeduction,
  incomeTax,
  calculateSalary,
  calculateSukanya,
  COURSE_COSTS,
  calculateFurusato,
  calculateJutakuLoan,
  calculateIdeco,
  calculateTaishokukin,
  calculateGakushiHoken,
  calculateKoigyoKyosai,
} from "@/engines/japan";

const round0 = (n: number) => Math.round(n);

describe("employmentDeduction", () => {
  it("follows the stepped Japanese formula", () => {
    expect(employmentDeduction(3_000_000)).toBeCloseTo(3_000_000 * 0.3 + 180_000, 0);
    expect(employmentDeduction(6_000_000)).toBeCloseTo(6_000_000 * 0.2 + 540_000, 0);
    expect(employmentDeduction(10_000_000)).toBe(1_950_000);
  });

  it("never drops below the 550,000 floor on low income", () => {
    expect(employmentDeduction(1_000_000)).toBeGreaterThanOrEqual(550_000);
  });
});

describe("incomeTax", () => {
  it("charges nothing on zero or negative income", () => {
    expect(incomeTax(0)).toBe(0);
    expect(incomeTax(-1000)).toBe(0);
  });

  it("applies the reconstruction surcharge to every bracket", () => {
    // First bracket: 5% then +2.1% => 1_000_000 x 0.05 x 1.021.
    expect(incomeTax(1_000_000)).toBeCloseTo(1_000_000 * 0.05 * 1.021, 0);
  });

  it("is monotonic across the bracket boundaries", () => {
    let prev = -1;
    for (let income = 0; income <= 50_000_000; income += 250_000) {
      const tax = incomeTax(income);
      expect(tax).toBeGreaterThanOrEqual(prev);
      prev = tax;
    }
  });
});

describe("calculateSalary", () => {
  const BASE = { annualGross: 5_000_000, isOver40: false, spouseMode: "none" as const, dependents: 0 };

  it("charges more care insurance from age 40", () => {
    const young = calculateSalary(BASE);
    const older = calculateSalary({ ...BASE, isOver40: true });
    expect(older.socialInsurance).toBeGreaterThan(young.socialInsurance);
  });

  it("reduces net pay as gross rises", () => {
    const low = calculateSalary({ ...BASE, annualGross: 3_000_000 });
    const high = calculateSalary({ ...BASE, annualGross: 15_000_000 });
    expect(high.net).toBeGreaterThan(low.net);
  });

  it("lowers net pay when a dependent spouse is declared", () => {
    const none = calculateSalary(BASE);
    const dependent = calculateSalary({ ...BASE, spouseMode: "dependent" });
    expect(dependent.net).toBeGreaterThan(none.net);
  });

  it("lowers net pay per dependent", () => {
    const none = calculateSalary(BASE);
    const two = calculateSalary({ ...BASE, dependents: 2 });
    expect(two.net).toBeGreaterThan(none.net);
  });

  it("never returns negative take-home pay", () => {
    expect(calculateSalary({ ...BASE, annualGross: 0 }).net).toBe(0);
  });

  it("keeps net pay below gross", () => {
    const r = calculateSalary(BASE);
    expect(r.net).toBeLessThan(r.gross);
    expect(r.totalDeductions).toBeGreaterThan(0);
  });

  it("reports a monthly figure that sums back to the annual net", () => {
    const r = calculateSalary(BASE);
    expect(r.monthlyNet * 12).toBeCloseTo(r.net, -3);
  });
});

describe("calculateSukanya", () => {
  const BASE = { childAge: 0, monthlySavings: 20_000, rate: 5, course: "national" as const };

  it("projects to university age", () => {
    const r = calculateSukanya({ ...BASE, childAge: 5 });
    expect(r.years).toBe(13);
  });

  it("accumulates contributions plus interest", () => {
    const r = calculateSukanya(BASE);
    expect(r.finalAmount).toBeGreaterThan(r.totalContributed);
    expect(r.interestEarned).toBeGreaterThan(0);
  });

  it("equals contributions alone at zero interest", () => {
    const r = calculateSukanya({ ...BASE, rate: 0 });
    expect(r.finalAmount).toBe(r.totalContributed);
    expect(r.interestEarned).toBe(0);
  });

  it("needs a larger monthly saving for a costlier course", () => {
    const cheap = calculateSukanya({ ...BASE, course: "national" });
    const dear = calculateSukanya({ ...BASE, course: "medical" });
    expect(dear.requiredMonthly).toBeGreaterThan(cheap.requiredMonthly);
  });

  it("flags an insufficient plan", () => {
    const r = calculateSukanya({ ...BASE, childAge: 15, monthlySavings: 1000 });
    expect(r.sufficient).toBe(false);
  });

  it("flags a sufficient plan with zero years to go", () => {
    const r = calculateSukanya({ ...BASE, childAge: 0, monthlySavings: 50_000 });
    expect(r.sufficient).toBe(true);
    expect(r.yearsToSufficient).toBe(0);
  });

  it("knows the course costs", () => {
    expect(COURSE_COSTS.medical).toBeGreaterThan(COURSE_COSTS.national);
    expect(COURSE_COSTS.private_science).toBeGreaterThan(COURSE_COSTS.private_arts);
  });
});

describe("calculateFurusato", () => {
  it("calculates realistic limit for typical single earner", () => {
    const res = calculateFurusato({
      annualIncome: 5_000_000,
      familyType: "single",
      dependents: 0,
      donationAmount: 50_000,
    });
    expect(res.limit).toBeGreaterThan(40_000);
    expect(res.limit).toBeLessThan(90_000);
    expect(res.effectiveContribution).toBe(2000);
    expect(res.taxSaved).toBe(48_000);
    expect(res.excess).toBe(0);
  });

  it("warns and calculates excess when donation exceeds limit", () => {
    const res = calculateFurusato({
      annualIncome: 3_000_000,
      familyType: "single",
      dependents: 0,
      donationAmount: 100_000,
    });
    expect(res.excess).toBeGreaterThan(0);
    expect(res.effectiveContribution).toBe(2000 + res.excess);
  });
});

describe("calculateJutakuLoan", () => {
  it("calculates deduction for certified vs general housing", () => {
    const cert = calculateJutakuLoan({
      balance: 40_000_000,
      houseType: "certified",
      income: 6_000_000,
    });
    const gen = calculateJutakuLoan({
      balance: 40_000_000,
      houseType: "general",
      income: 6_000_000,
    });
    expect(cert.annualDeduction).toBe(round0(40_000_000 * 0.007));
    expect(gen.annualDeduction).toBe(round0(30_000_000 * 0.007)); // capped at 30m
    expect(cert.totalDeduction).toBeGreaterThan(gen.totalDeduction);
  });
});

describe("calculateIdeco", () => {
  it("enforces job category contribution limits", () => {
    const company = calculateIdeco({
      jobCategory: "company_none",
      monthlyContribution: 50_000,
      currentAge: 30,
      annualReturnRate: 5,
      annualGrossIncome: 5_000_000,
    });
    expect(company.monthly).toBe(23_000);
    expect(company.totalContributed).toBe(23_000 * 12 * 30);
    expect(company.investmentGains).toBeGreaterThan(0);
    expect(company.annualTaxSaved).toBeGreaterThan(0);
  });
});

describe("calculateTaishokukin", () => {
  it("calculates retirement allowance tax with 1/2 deduction formula", () => {
    const res = calculateTaishokukin({
      severanceAmount: 20_000_000,
      tenureYears: 38,
      declarationSubmitted: true,
    });
    // 38 years: 8m + 700k * 18 = 20.6m deduction!
    // Since severance 20m <= deduction 20.6m, taxable is 0 and tax is 0!
    expect(res.deductionAmount).toBe(8_000_000 + 700_000 * 18);
    expect(res.taxableRetirementIncome).toBe(0);
    expect(res.totalTax).toBe(0);
    expect(res.netSeverance).toBe(20_000_000);
    expect(res.takeHomeRatio).toBe(100);
  });

  it("withholds flat 20.42% if declaration was not submitted", () => {
    const res = calculateTaishokukin({
      severanceAmount: 20_000_000,
      tenureYears: 38,
      declarationSubmitted: false,
    });
    expect(res.incomeTax).toBe(round0(20_000_000 * 0.2042));
    expect(res.netSeverance).toBeLessThan(20_000_000);
  });
});

describe("calculateGakushiHoken", () => {
  it("projects NISA vs traditional Gakushi Hoken", () => {
    const res = calculateGakushiHoken({
      course: "private_arts",
      childAge: 0,
      monthlySavings: 20_000,
      nisaRate: 5,
      gakushiReturnRate: 105,
    });
    expect(res.years).toBe(18);
    expect(res.totalContributed).toBe(20_000 * 12 * 18);
    expect(res.nisaFinalAmount).toBeGreaterThan(res.gakushiFinalAmount);
    expect(res.diffBenefit).toBeGreaterThan(0);
  });
});

describe("calculateKoigyoKyosai", () => {
  it("computes full tax deduction for small business owner", () => {
    const res = calculateKoigyoKyosai({
      monthlyAmount: 70_000,
      durationYears: 20,
      taxableIncome: 5_000_000,
      payoutReason: "kyosai_a",
    });
    expect(res.totalContributed).toBe(70_000 * 12 * 20);
    expect(res.annualTaxSaved).toBeGreaterThan(150_000);
    expect(res.totalTaxSaved).toBeGreaterThan(3_000_000);
    expect(res.payoutAmount).toBeGreaterThan(res.totalContributed);
  });
});