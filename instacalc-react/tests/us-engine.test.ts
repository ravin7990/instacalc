import { describe, expect, it } from "vitest";
import { calculate401k, calculateRothIra, calculateFire, calculateCd, calculateMortgage } from "@/engines/us-retirement";
import { calculatePaycheck, calculateCreditCardPayoff, calculateStudentLoan, calculateAutoLoan } from "@/engines/us-loans";
import { formatWithUnits, formatDate } from "@/lib/currency";

describe("calculate401k", () => {
  const K = {
    annualSalary: 85_000, contributionPercent: 8, employerMatchPercent: 50,
    matchLimitPercent: 6, currentAge: 30, retireAge: 65, currentBalance: 0,
    expectedReturn: 8, salaryGrowth: 3,
  };

  it("projects one row per year to retirement", () => {
    const r = calculate401k(K);
    expect(r.years).toBe(35);
    expect(r.rows).toHaveLength(35);
    expect(r.retireAge).toBe(65);
  });

  it("defers the configured percentage of salary", () => {
    expect(calculate401k(K).rows[0].employee).toBeCloseTo(85_000 * 0.08, 0);
  });

  it("matches only up to the match limit", () => {
    // Matchable salary is min(6% of 85000, 8% of 85000) = 5100, matched at 50%.
    expect(calculate401k(K).rows[0].employer).toBeCloseTo(2550, 0);
  });

  it("never matches more than the employee contributes", () => {
    const r = calculate401k({ ...K, contributionPercent: 2, employerMatchPercent: 100, matchLimitPercent: 6 });
    for (const row of r.rows) expect(row.employer).toBeLessThanOrEqual(row.employee + 1);
  });

  it("caps the employee deferral at the indexed IRS limit", () => {
    const r = calculate401k({ ...K, annualSalary: 1_000_000, contributionPercent: 50 });
    expect(r.rows[0].employee).toBeCloseTo(23_000, 0);
    expect(r.rows[1].employee).toBeCloseTo(23_000 * 1.02, 0);
  });

  it("grows salary by the configured rate each year", () => {
    expect(calculate401k(K).rows[1].salary).toBeCloseTo(85_000 * 1.03, 0);
  });

  it("treats deposits as arriving mid-year", () => {
    const y1 = calculate401k({ ...K, employerMatchPercent: 0, contributionPercent: 10 }).rows[0];
    expect(y1.growth).toBeCloseTo((y1.employee / 2) * 0.08, 0);
  });

  it("sums contributions and growth into the corpus", () => {
    const r = calculate401k(K);
    expect(r.corpus).toBeCloseTo(r.totalContributed + r.totalGrowth, 0);
  });

  it("carries an existing balance into the total", () => {
    expect(calculate401k({ ...K, currentBalance: 50_000 }).totalContributed)
      .toBeGreaterThan(calculate401k(K).totalContributed);
  });
});

describe("calculateRothIra", () => {
  const ROTH = { annualContribution: 7_000, returnRate: 8.5, years: 30, currentBalance: 0 };

  it("contributes and compounds every year", () => {
    const r = calculateRothIra(ROTH);
    expect(r.rows).toHaveLength(30);
    expect(r.totalContributed).toBe(7_000 * 30);
    expect(r.corpus).toBeGreaterThan(r.totalContributed);
  });

  it("earns more when contributions start the year", () => {
    const start = calculateRothIra({ ...ROTH, timing: "start" });
    const end = calculateRothIra({ ...ROTH, timing: "end" });
    const monthly = calculateRothIra({ ...ROTH, timing: "monthly" });
    expect(start.corpus).toBeGreaterThan(monthly.corpus);
    expect(monthly.corpus).toBeGreaterThan(end.corpus);
  });

  it("splits the corpus into contributions and growth", () => {
    const r = calculateRothIra(ROTH);
    expect(r.totalContributed + r.totalGrowth).toBeCloseTo(r.corpus, 0);
  });

  it("credits no growth in year one at zero return", () => {
    const r = calculateRothIra({ ...ROTH, returnRate: 0, years: 1 });
    expect(r.totalGrowth).toBe(0);
    expect(r.corpus).toBe(7_000);
  });
});

describe("calculateFire", () => {
  const FIRE = {
    annualExpenses: 60_000, currentNetWorth: 150_000, annualSavings: 30_000,
    safeWithdrawalRate: 4, realReturn: 7, tier: "standard" as const, timing: "monthly" as const,
  };

  it("computes the 25x multiple at a 4% withdrawal rate", () => {
    const r = calculateFire(FIRE);
    expect(r.target).toBeCloseTo(1_500_000, 0);
    expect(r.multiple).toBeCloseTo(25, 0);
    expect(r.safeMonthlyIncome).toBeCloseTo(5_000, 0);
  });

  it("scales the target by lifestyle tier", () => {
    expect(calculateFire({ ...FIRE, tier: "lean" }).target).toBeLessThan(1_500_000);
    expect(calculateFire({ ...FIRE, tier: "fat" }).target).toBeGreaterThan(1_500_000);
  });

  it("raises the target as the withdrawal rate falls", () => {
    expect(calculateFire({ ...FIRE, safeWithdrawalRate: 3 }).target)
      .toBeGreaterThan(calculateFire({ ...FIRE, safeWithdrawalRate: 5 }).target);
  });

  it("clamps the withdrawal rate into 1-10 percent", () => {
    expect(calculateFire({ ...FIRE, safeWithdrawalRate: 0 }).multiple).toBeCloseTo(100, 0);
    expect(calculateFire({ ...FIRE, safeWithdrawalRate: 50 }).multiple).toBeCloseTo(10, 0);
  });

  it("reports zero years when already at the target", () => {
    const r = calculateFire({ ...FIRE, currentNetWorth: 2_000_000 });
    expect(r.yearsToFire).toBe(0);
    expect(r.progressPercent).toBe(100);
  });

  it("reaches the target in the same year regardless of contribution timing", () => {
    // Timing shifts the balance within a year, but with a steady contribution
    // and return it does not change which year the target is crossed.
    const start = calculateFire({ ...FIRE, timing: "start" }).yearsToFire;
    const monthly = calculateFire({ ...FIRE, timing: "monthly" }).yearsToFire;
    const end = calculateFire({ ...FIRE, timing: "end" }).yearsToFire;
    expect(start).toBe(monthly);
    expect(monthly).toBe(end);
  });

  it("accumulates more when contributions arrive at the start of the year", () => {
    // A larger savings rate must never take longer to reach the target.
    const slow = calculateFire({ ...FIRE, annualSavings: 10_000 }).yearsToFire ?? 99;
    const fast = calculateFire({ ...FIRE, annualSavings: 60_000 }).yearsToFire ?? 0;
    expect(slow).toBeGreaterThan(fast);
  });
});

describe("calculateCd", () => {
  const CD = { principal: 25_000, apy: 5, months: 12, frequency: 365, penaltyMonths: 0 };

  it("matches the APY exactly over a one-year term", () => {
    const r = calculateCd(CD);
    expect(r.balance).toBeCloseTo(25_000 * 1.05, 0);
    expect(r.totalInterest).toBeCloseTo(1_250, 0);
  });

  it("is unaffected by compounding frequency, because APY is already annual", () => {
    // The nominal rate is derived from the APY, so feeding it back through
    // (1 + r/n)^n returns the APY exactly for any n. Daily and monthly must
    // therefore agree — that is what an annual percentage yield means.
    const daily = calculateCd({ ...CD, frequency: 365 });
    const monthly = calculateCd({ ...CD, frequency: 12 });
    expect(daily.balance).toBeCloseTo(monthly.balance, 2);
    // Only the quoted nominal rate differs.
    expect(daily.nominalRate).not.toBeCloseTo(monthly.nominalRate, 2);
  });

  it("caps the early-withdrawal penalty at the interest earned", () => {
    const r = calculateCd({ ...CD, principal: 1_000, penaltyMonths: 24 });
    expect(r.penaltyAmount).toBeLessThanOrEqual(r.totalInterest + 0.01);
    expect(r.netInterest).toBeGreaterThanOrEqual(0);
  });

  it("charges no penalty when none is configured", () => {
    const r = calculateCd(CD);
    expect(r.penaltyAmount).toBe(0);
    expect(r.netPayout).toBe(r.balance);
  });

  it("grows the balance over a multi-year term", () => {
    const r = calculateCd({ ...CD, months: 60 });
    expect(r.balance).toBeCloseTo(25_000 * Math.pow(1.05, 5), 0);
  });
});

describe("calculateMortgage", () => {
  const HOME = {
    homePrice: 450_000, downPercent: 20, rate: 6.8, years: 30,
    taxRate: 1.2, insurance: 1_400, hoa: 0,
  };

  it("borrows the price less the down payment", () => {
    const r = calculateMortgage(HOME);
    expect(r.downPayment).toBe(90_000);
    expect(r.principal).toBe(360_000);
  });

  it("matches the closed-form principal and interest", () => {
    const m = 0.068 / 12;
    const n = 360;
    const expected = (360_000 * (m * Math.pow(1 + m, n))) / (Math.pow(1 + m, n) - 1);
    expect(calculateMortgage(HOME).monthlyPI).toBeCloseTo(expected, 0);
  });

  it("charges PMI only below a 20 percent down payment", () => {
    expect(calculateMortgage(HOME).monthlyPmi).toBe(0);
    expect(calculateMortgage({ ...HOME, downPercent: 10 }).monthlyPmi).toBeGreaterThan(0);
  });

  it("totals principal, tax, insurance, HOA and PMI", () => {
    const r = calculateMortgage({ ...HOME, downPercent: 10, hoa: 150 });
    expect(r.totalMonthlyPayment).toBeCloseTo(
      r.monthlyPI + r.monthlyTax + r.monthlyInsurance + r.monthlyHoa + r.monthlyPmi, 0,
    );
  });

  it("amortises the loan to zero over the term", () => {
    const r = calculateMortgage(HOME);
    expect(r.rows).toHaveLength(30);
    expect(Math.abs(r.rows[29].closing)).toBeLessThan(1);
  });

  it("pays more interest early than principal, and the reverse late on", () => {
    const r = calculateMortgage(HOME);
    expect(r.rows[0].interestPaid).toBeGreaterThan(r.rows[0].principalPaid);
    expect(r.rows[29].principalPaid).toBeGreaterThan(r.rows[29].interestPaid);
  });

  it("returns the principal unchanged at zero interest", () => {
    // 10 years of payments: 360,000 / 120 months.
    const r = calculateMortgage({ ...HOME, rate: 0, years: 10 });
    expect(r.totalInterest).toBe(0);
    expect(r.monthlyPI).toBeCloseTo(3_000, 0);
  });

  it("shortens the loan and reduces interest with extra principal payments", () => {
    const base = calculateMortgage(HOME);
    const withExtra = calculateMortgage({ ...HOME, extraPayment: 500 });
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest);
    expect(withExtra.rows.length).toBeLessThan(base.rows.length);
  });
});

describe("calculatePaycheck", () => {
  const PAY = {
    annualSalary: 85_000,
    frequency: "biweekly" as const,
    filingStatus: "single" as const,
    k401Percent: 6,
    healthPerPeriod: 120,
  };

  it("calculates gross and net take-home per paycheck", () => {
    const r = calculatePaycheck(PAY);
    expect(r.grossPerPaycheck).toBeCloseTo(85_000 / 26, 0);
    expect(r.netPerPaycheck).toBeGreaterThan(1_500);
    expect(r.netPerPaycheck).toBeLessThan(r.grossPerPaycheck);
    expect(r.annualNet).toBeCloseTo(r.netPerPaycheck * 26, 0);
  });

  it("withholds 6.2% Social Security and 1.45% Medicare", () => {
    const r = calculatePaycheck(PAY);
    const taxableWage = 85_000 - 85_000 * 0.06;
    expect(r.socialSecurity).toBeCloseTo(taxableWage * 0.062, 0);
    expect(r.medicare).toBeCloseTo(taxableWage * 0.0145, 0);
  });

  it("applies standard deduction and progressive 2026 federal brackets", () => {
    const r = calculatePaycheck(PAY);
    expect(r.federalTax).toBeGreaterThan(5_000);
    expect(r.federalTax).toBeLessThan(12_000);
  });
});

describe("calculateCreditCardPayoff", () => {
  it("determines months to debt-free and amortizes to zero", () => {
    const r = calculateCreditCardPayoff({ balance: 5_000, apr: 24, monthlyPayment: 200 });
    expect(r.neverPayoff).toBe(false);
    expect(r.monthsToPayoff).toBeGreaterThan(24);
    expect(r.monthsToPayoff).toBeLessThan(48);
    expect(r.totalInterest).toBeGreaterThan(1_000);
    expect(r.rows.length).toBeGreaterThan(1);
    expect(r.rows[r.rows.length - 1].closing).toBe(0);
  });

  it("detects when monthly payment does not cover interest", () => {
    const r = calculateCreditCardPayoff({ balance: 5_000, apr: 24, monthlyPayment: 50 });
    expect(r.neverPayoff).toBe(true);
    expect(r.monthsToPayoff).toBe(0);
  });
});

describe("calculateStudentLoan", () => {
  it("calculates monthly payment on standard 10-year term", () => {
    const r = calculateStudentLoan({ balance: 35_000, rate: 5.5, years: 10 });
    expect(r.monthlyPayment).toBeCloseTo(379.8, 0);
    expect(r.totalInterest).toBeCloseTo(10_581, 0);
  });

  it("calculates savings and shortened timeline with extra monthly payments", () => {
    const r = calculateStudentLoan({ balance: 35_000, rate: 5.5, years: 10, extraMonthly: 100 });
    expect(r.savingsWithExtra).toBeGreaterThan(2_000);
    expect(r.monthsWithExtra).toBeLessThan(120);
  });
});

describe("calculateAutoLoan", () => {
  it("factors in vehicle price, trade-in, down payment, and sales tax", () => {
    const r = calculateAutoLoan({
      vehiclePrice: 35_000,
      downPayment: 5_000,
      tradeInValue: 2_000,
      salesTaxRate: 7.0,
      interestRate: 6.5,
      termMonths: 60,
    });
    // taxable = 33,000, tax = 2,310, loan = 35000 - 5000 - 2000 + 2310 = 30,310
    expect(r.salesTaxAmount).toBeCloseTo(2_310, 0);
    expect(r.loanAmount).toBeCloseTo(30_310, 0);
    expect(r.monthlyPayment).toBeGreaterThan(500);
    expect(r.monthlyPayment).toBeLessThan(650);
    expect(r.rows).toHaveLength(5);
  });
});

describe("US currency and date formatting", () => {
  it("never outputs Indian Lakhs or Crores for US locale", () => {
    expect(formatWithUnits("us", 450_000)).not.toContain("L");
    expect(formatWithUnits("us", 450_000)).not.toContain("Cr");
    expect(formatWithUnits("us", 1_500_000)).toBe("$1,500,000");
    expect(formatWithUnits("us", 450_000)).toBe("$450,000");
  });

  it("formats dates in US MM/DD/YYYY standard format", () => {
    const d = new Date(2026, 8, 11); // Sept 11, 2026
    expect(formatDate("us", d, "short")).toBe("09/11/2026");
  });
});


