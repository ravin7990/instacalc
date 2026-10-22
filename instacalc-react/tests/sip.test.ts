import { describe, expect, it } from "vitest";
import { calculateSip, requiredMonthlySip } from "@/engines/sip";

/**
 * Golden-value tests. Expected numbers are derived from the standard SIP
 * future-value-of-an-annuity formula computed independently here, so the
 * engine is checked against the maths rather than against itself.
 */
describe("calculateSip", () => {
  it("matches the closed-form annuity formula with no step-up", () => {
    const P = 25000;
    const annual = 12;
    const years = 10;
    const r = annual / 100 / 12;
    const n = years * 12;
    const expected = P * ((Math.pow(1 + r, n) - 1) / r);

    const out = calculateSip({ monthly: P, annualRate: annual, years });

    expect(out.months).toBe(120);
    expect(out.totalInvested).toBe(P * 120);
    expect(out.corpus).toBeCloseTo(expected, 0);
    expect(out.estimatedReturns).toBeCloseTo(expected - P * 120, 0);
  });

  it("invests exactly monthly * months when the rate is zero", () => {
    const out = calculateSip({ monthly: 5000, annualRate: 0, years: 20 });
    expect(out.totalInvested).toBe(5000 * 240);
    expect(out.corpus).toBe(5000 * 240);
    expect(out.estimatedReturns).toBe(0);
  });

  it("emits one projection row per completed year", () => {
    const out = calculateSip({ monthly: 10000, annualRate: 10, years: 5 });
    expect(out.rows).toHaveLength(5);
    expect(out.rows.map((r) => r.year)).toEqual([1, 2, 3, 4, 5]);
    // Rows must be monotonic and the final row must equal the corpus.
    for (let i = 1; i < out.rows.length; i++) {
      expect(out.rows[i].balance).toBeGreaterThan(out.rows[i - 1].balance);
    }
    expect(out.rows[out.rows.length - 1].balance).toBeCloseTo(out.corpus, 1);
  });

  it("grows faster with a yearly step-up than without", () => {
    const base = calculateSip({ monthly: 10000, annualRate: 12, years: 10 });
    const stepped = calculateSip({
      monthly: 10000,
      annualRate: 12,
      years: 10,
      stepUpPercent: 10,
    });
    expect(stepped.corpus).toBeGreaterThan(base.corpus);
    expect(stepped.totalInvested).toBeGreaterThan(base.totalInvested);
  });

  it("returns today's-money value when inflation is supplied", () => {
    const nominal = calculateSip({ monthly: 20000, annualRate: 12, years: 15 });
    const real = calculateSip({ monthly: 20000, annualRate: 12, years: 15, inflationPercent: 6 });
    expect(real.corpus).toBeCloseTo(nominal.corpus, 5);
    expect(real.inflationAdjustedCorpus).toBeLessThan(real.corpus);
  });

  it("handles fractional tenures", () => {
    const out = calculateSip({ monthly: 1000, annualRate: 8, years: 2.5 });
    expect(out.months).toBe(30);
    expect(out.rows).toHaveLength(3); // 2 full years + a remainder row
    expect(out.totalInvested).toBe(30000);
  });

  it("does not produce NaN for zero inputs", () => {
    const out = calculateSip({ monthly: 0, annualRate: 0, years: 0 });
    expect(Number.isFinite(out.corpus)).toBe(true);
    expect(out.corpus).toBe(0);
  });
});

describe("requiredMonthlySip", () => {
  it("finds a payment whose future value hits the target", () => {
    const target = 10_000_000;
    const years = 15;
    const annual = 12;
    const pmt = requiredMonthlySip(target, annual, years);

    const r = annual / 100 / 12;
    const n = years * 12;
    const fv = pmt * ((Math.pow(1 + r, n) - 1) / r);

    // The payment is rounded to 2 decimals for display, and the annuity factor
    // (~303x at these inputs) amplifies that rounding, so compare relatively.
    expect(Math.abs(fv - target) / target).toBeLessThan(1e-4);
  });

  it("requires a larger payment for a longer horizon", () => {
    const short = requiredMonthlySip(10_000_000, 12, 5);
    const long = requiredMonthlySip(10_000_000, 12, 20);
    expect(long).toBeLessThan(short);
  });

  it("returns the plain sum when the rate is zero", () => {
    expect(requiredMonthlySip(120_000, 0, 10)).toBeCloseTo(1000, 1);
  });
});
