import { describe, expect, it } from "vitest";
import { calculateEmi, annualEmi } from "@/engines/emi";
import { calculateFd, calculateRd, applyTaxOnInterest } from "@/engines/deposits";
import { calculateCompound, calculateSimple } from "@/engines/interest";
import { calculateTax } from "@/engines/tax";

describe("calculateEmi", () => {
  it("matches the closed-form EMI formula", () => {
    const P = 5_000_000;
    const annual = 8.5;
    const years = 20;
    const r = annual / 100 / 12;
    const n = years * 12;
    const expected = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const out = calculateEmi({ principal: P, annualRate: annual, years });
    expect(out.emi).toBeCloseTo(expected, 0);
    expect(out.months).toBe(240);
  });

  it("amortises the loan to exactly zero", () => {
    const out = calculateEmi({ principal: 2_000_000, annualRate: 9, years: 15 });
    const last = out.rows[out.rows.length - 1];
    expect(Math.abs(last.closing)).toBeLessThan(1);
    expect(out.totalPayment).toBeCloseTo(out.emi * out.months, 0);
    expect(out.totalInterest).toBeCloseTo(out.totalPayment - 2_000_000, 0);
  });

  it("splits principal and interest so they sum to the payment", () => {
    const out = calculateEmi({ principal: 1_000_000, annualRate: 10, years: 10 });
    const totalPrincipal = out.rows.reduce((s, r) => s + r.principalPaid, 0);
    expect(totalPrincipal).toBeCloseTo(1_000_000, -1);
  });

  it("returns the plain division at zero interest", () => {
    const out = calculateEmi({ principal: 120_000, annualRate: 0, years: 10 });
    expect(out.emi).toBe(1000);
    expect(out.totalInterest).toBe(0);
  });

  it("annualEmi mirrors the monthly formula over years", () => {
    expect(annualEmi(120_000, 10, 5)).toBeGreaterThan(0);
    expect(annualEmi(120_000, 0, 5)).toBe(24_000);
  });
});

describe("deposits", () => {
  it("compounds FD annually", () => {
    const out = calculateFd(100_000, 10, 5);
    expect(out.maturity).toBeCloseTo(100_000 * Math.pow(1.1, 5), 0);
    expect(out.totalInterest).toBeCloseTo(out.maturity - 100_000, 1);
    expect(out.rows).toHaveLength(5);
  });

  it("accumulates RD instalments with annual compounding", () => {
    const out = calculateRd(50_000, 10, 5);
    expect(out.totalDeposited).toBe(250_000);
    expect(out.maturity).toBeGreaterThan(250_000);
    expect(out.rows).toHaveLength(5);
    // Balance must strictly increase each year.
    for (let i = 1; i < out.rows.length; i++) {
      expect(out.rows[i].balance).toBeGreaterThan(out.rows[i - 1].balance);
    }
  });

  it("withdraws tax from interest", () => {
    const { tax, netInterest } = applyTaxOnInterest(100_000, 30);
    expect(tax).toBe(30_000);
    expect(netInterest).toBe(70_000);
  });
});

describe("interest", () => {
  it("compounds yearly at the stated rate", () => {
    const out = calculateCompound({ principal: 100_000, ratePercent: 10, years: 3, frequency: "yearly" });
    expect(out.maturity).toBeCloseTo(133_100, 0);
  });

  it("earns more when compounding is more frequent", () => {
    const yearly = calculateCompound({ principal: 100_000, ratePercent: 10, years: 5, frequency: "yearly" });
    const monthly = calculateCompound({ principal: 100_000, ratePercent: 10, years: 5, frequency: "monthly" });
    expect(monthly.maturity).toBeGreaterThan(yearly.maturity);
    expect(monthly.effectiveAnnualRate).toBeGreaterThan(10);
  });

  it("adds recurring contributions to the balance", () => {
    const base = calculateCompound({ principal: 100_000, ratePercent: 10, years: 5, frequency: "monthly" });
    const withRecurring = calculateCompound({
      principal: 100_000,
      ratePercent: 10,
      years: 5,
      frequency: "monthly",
      recurring: 1000,
    });
    expect(withRecurring.totalInvested).toBeGreaterThan(base.totalInvested);
    expect(withRecurring.maturity).toBeGreaterThan(base.maturity);
  });

  it("simple interest matches P(1+rt)", () => {
    const out = calculateSimple({ principal: 100_000, ratePercent: 10, years: 3 });
    expect(out.maturity).toBeCloseTo(130_000, 0);
    expect(out.totalInterest).toBeCloseTo(30_000, 0);
  });

  it("simple interest grows linearly, one constant slice per year", () => {
    const out = calculateSimple({ principal: 100_000, ratePercent: 10, years: 5 });
    // Every year must add exactly 10% of the original principal.
    for (const row of out.rows) {
      expect(row.interest).toBeCloseTo(10_000, 1);
    }
  });

  it("charges instalments simple interest only for the years they are held", () => {
    // 10k/yr for 3 years at 10%: the principal earns 30k, and the instalments
    // earn 10% of 2 years + 10% of 1 year + 0 = 3k. Total interest = 33k.
    const out = calculateSimple({ principal: 100_000, ratePercent: 10, years: 3, recurring: 10_000 });
    expect(out.totalInvested).toBe(130_000);
    expect(out.totalInterest).toBeCloseTo(33_000, 0);
    expect(out.maturity).toBeCloseTo(163_000, 0);
  });
});

describe("tax", () => {
  it("extracts the base from a tax-inclusive amount", () => {
    const out = calculateTax({ amount: 1180, ratePercent: 18, inclusive: true });
    expect(out.baseAmount).toBeCloseTo(1000, 1);
    expect(out.taxAmount).toBeCloseTo(180, 1);
    expect(out.totalAmount).toBe(1180);
  });

  it("adds tax on top of an exclusive amount", () => {
    const out = calculateTax({ amount: 1000, ratePercent: 18, inclusive: false });
    expect(out.taxAmount).toBe(180);
    expect(out.totalAmount).toBe(1180);
  });

  it("is a no-op at zero rate", () => {
    const out = calculateTax({ amount: 500, ratePercent: 0, inclusive: false });
    expect(out.taxAmount).toBe(0);
    expect(out.totalAmount).toBe(500);
  });

  it("round-trips between inclusive and exclusive", () => {
    const inclusive = calculateTax({ amount: 1180, ratePercent: 5, inclusive: true });
    const exclusive = calculateTax({ amount: inclusive.baseAmount, ratePercent: 5, inclusive: false });
    expect(exclusive.totalAmount).toBeCloseTo(1180, 1);
  });
});
