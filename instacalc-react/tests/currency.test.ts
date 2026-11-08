import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  SUPPORTED_CURRENCIES,
  getEffectiveCurrency,
  getActiveCurrencyCode,
  setActiveCurrencyCode,
  symbol,
  formatCurrency,
  formatCompact,
  formatWithUnits,
  money,
  isCurrencySymbol,
  replaceCurrencySymbol,
} from "@/lib/currency";

describe("Global Currency Selection & Formatting", () => {
  beforeEach(() => {
    setActiveCurrencyCode("AUTO");
  });

  afterEach(() => {
    setActiveCurrencyCode("AUTO");
  });

  it("provides comprehensive list of supported world currencies", () => {
    expect(SUPPORTED_CURRENCIES.length).toBeGreaterThanOrEqual(15);
    const codes = SUPPORTED_CURRENCIES.map((c) => c.code);
    expect(codes).toContain("USD");
    expect(codes).toContain("EUR");
    expect(codes).toContain("GBP");
    expect(codes).toContain("INR");
    expect(codes).toContain("JPY");
    expect(codes).toContain("CAD");
    expect(codes).toContain("AUD");
    expect(codes).toContain("AED");
  });

  describe("Default locale currency resolution", () => {
    it("resolves default currency per locale when AUTO is active", () => {
      expect(getEffectiveCurrency("en").code).toBe("INR");
      expect(getEffectiveCurrency("en").symbol).toBe("₹");

      expect(getEffectiveCurrency("us").code).toBe("USD");
      expect(getEffectiveCurrency("us").symbol).toBe("$");

      expect(getEffectiveCurrency("ja").code).toBe("JPY");
      expect(getEffectiveCurrency("ja").symbol).toBe("¥");

      expect(getEffectiveCurrency("ru").code).toBe("RUB");
      expect(getEffectiveCurrency("ru").symbol).toBe("₽");

      expect(getEffectiveCurrency("ko").code).toBe("KRW");
      expect(getEffectiveCurrency("ko").symbol).toBe("₩");

      expect(getEffectiveCurrency("es").code).toBe("EUR");
      expect(getEffectiveCurrency("es").symbol).toBe("€");
    });
  });

  describe("Active currency switching", () => {
    it("switches globally when setActiveCurrencyCode is called", () => {
      setActiveCurrencyCode("USD");
      expect(getActiveCurrencyCode()).toBe("USD");
      expect(getEffectiveCurrency("en").code).toBe("USD");
      expect(symbol("en")).toBe("$");

      setActiveCurrencyCode("EUR");
      expect(getActiveCurrencyCode()).toBe("EUR");
      expect(getEffectiveCurrency("en").code).toBe("EUR");
      expect(symbol("en")).toBe("€");

      setActiveCurrencyCode("GBP");
      expect(symbol("en")).toBe("£");

      setActiveCurrencyCode("AUTO");
      expect(symbol("en")).toBe("₹");
      expect(symbol("us")).toBe("$");
    });
  });

  describe("formatWithUnits", () => {
    it("formats INR with Lakhs and Crores", () => {
      expect(formatWithUnits("en", 15_000_000, "INR")).toBe("₹1.50 Cr");
      expect(formatWithUnits("en", 1_500_000, "INR")).toBe("₹15.00 L");
      expect(formatWithUnits("en", 25_000, "INR")).toBe("₹25,000");
    });

    it("formats USD with standard numeric formatting", () => {
      expect(formatWithUnits("us", 1_500_000, "USD")).toBe("$1,500,000");
      expect(formatWithUnits("en", 450_000, "USD")).toBe("$450,000");
    });

    it("formats EUR correctly", () => {
      const formatted = formatWithUnits("en", 1_500_000, "EUR");
      expect(formatted).toContain("€");
      expect(formatted).toContain("1");
    });

    it("formats JPY with 万円 / 億円", () => {
      expect(formatWithUnits("ja", 150_000_000, "JPY")).toBe("¥1.50億円");
      expect(formatWithUnits("ja", 15_000_000, "JPY")).toBe("¥1500万円");
    });

    it("formats KRW with 만 / 억", () => {
      expect(formatWithUnits("ko", 150_000_000, "KRW")).toBe("₩1.50억");
      expect(formatWithUnits("ko", 15_000_000, "KRW")).toBe("₩1500만");
    });
  });

  describe("formatCompact", () => {
    it("compacts USD using K, M, B notation", () => {
      expect(formatCompact("us", 1_500_000_000, "USD")).toBe("$1.5B");
      expect(formatCompact("us", 1_500_000, "USD")).toBe("$1.5M");
      expect(formatCompact("us", 25_000, "USD")).toBe("$25.0K");
    });

    it("compacts GBP using K, M, B notation", () => {
      expect(formatCompact("en", 1_500_000, "GBP")).toBe("£1.5M");
      expect(formatCompact("en", 50_000, "GBP")).toBe("£50.0K");
    });

    it("compacts INR using K, L, Cr notation", () => {
      expect(formatCompact("en", 15_000_000, "INR")).toBe("₹1.50 Cr");
      expect(formatCompact("en", 1_500_000, "INR")).toBe("₹15.00 L");
      expect(formatCompact("en", 50_000, "INR")).toBe("₹50.0K");
    });
  });

  describe("money helper", () => {
    it("delegates to formatWithUnits without double prefix", () => {
      expect(money("us", 10_000, "USD")).toBe("$10,000");
      expect(money("en", 10_000, "INR")).toBe("₹10,000");
    });
  });

  describe("isCurrencySymbol and replaceCurrencySymbol", () => {
    it("recognises currency symbols", () => {
      expect(isCurrencySymbol("₹")).toBe(true);
      expect(isCurrencySymbol("$")).toBe(true);
      expect(isCurrencySymbol("€")).toBe(true);
      expect(isCurrencySymbol("£")).toBe(true);
      expect(isCurrencySymbol("¥")).toBe(true);
      expect(isCurrencySymbol("C$")).toBe(true);
      expect(isCurrencySymbol("AED")).toBe(true);
      expect(isCurrencySymbol("years")).toBe(false);
      expect(isCurrencySymbol("%")).toBe(false);
    });

    it("replaces currency symbol on chip labels", () => {
      expect(replaceCurrencySymbol("₹50K", "$")).toBe("$50K");
      expect(replaceCurrencySymbol("₹5L", "€")).toBe("€5L");
      expect(replaceCurrencySymbol("$10K", "£")).toBe("£10K");
      expect(replaceCurrencySymbol("10%", "$")).toBe("10%");
    });
  });
});
