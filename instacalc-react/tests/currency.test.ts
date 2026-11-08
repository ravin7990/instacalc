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
  getCurrencyForCountry,
  detectCountryFromTimezone,
  detectCountryFromLocale,
  COUNTRY_TO_CURRENCY,
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
    expect(codes).toContain("SGD");
    expect(codes).toContain("CHF");
    expect(codes).toContain("CNY");
    expect(codes).toContain("KRW");
    expect(codes).toContain("RUB");
    expect(codes).toContain("BRL");
    expect(codes).toContain("SAR");
    expect(codes).toContain("MXN");
    expect(codes).toContain("NZD");
    expect(codes).toContain("THB");
    expect(codes).toContain("IDR");
    expect(codes).toContain("TRY");
  });

  describe("Country auto-detection & currency resolution", () => {
    it("returns currency if available in supported list", () => {
      expect(getCurrencyForCountry("IN")).toBe("INR");
      expect(getCurrencyForCountry("US")).toBe("USD");
      expect(getCurrencyForCountry("GB")).toBe("GBP");
      expect(getCurrencyForCountry("ES")).toBe("EUR");
      expect(getCurrencyForCountry("DE")).toBe("EUR");
      expect(getCurrencyForCountry("FR")).toBe("EUR");
      expect(getCurrencyForCountry("IT")).toBe("EUR");
      expect(getCurrencyForCountry("JP")).toBe("JPY");
      expect(getCurrencyForCountry("CA")).toBe("CAD");
      expect(getCurrencyForCountry("AU")).toBe("AUD");
      expect(getCurrencyForCountry("AE")).toBe("AED");
      expect(getCurrencyForCountry("SG")).toBe("SGD");
      expect(getCurrencyForCountry("CH")).toBe("CHF");
      expect(getCurrencyForCountry("KR")).toBe("KRW");
      expect(getCurrencyForCountry("RU")).toBe("RUB");
      expect(getCurrencyForCountry("BR")).toBe("BRL");
      expect(getCurrencyForCountry("MX")).toBe("MXN");
      expect(getCurrencyForCountry("NZ")).toBe("NZD");
      expect(getCurrencyForCountry("TH")).toBe("THB");
      expect(getCurrencyForCountry("ID")).toBe("IDR");
      expect(getCurrencyForCountry("TR")).toBe("TRY");
    });

    it("falls back to Dollar (USD) when country currency is NOT in supported list", () => {
      // Pakistan (PKR not in list) -> USD
      expect(getCurrencyForCountry("PK")).toBe("USD");
      // Philippines (PHP not in list) -> USD
      expect(getCurrencyForCountry("PH")).toBe("USD");
      // Nigeria (NGN not in list) -> USD
      expect(getCurrencyForCountry("NG")).toBe("USD");
      // Bangladesh (BDT not in list) -> USD
      expect(getCurrencyForCountry("BD")).toBe("USD");
      // South Africa (ZAR not in list) -> USD
      expect(getCurrencyForCountry("ZA")).toBe("USD");
      // Kenya (KES not in list) -> USD
      expect(getCurrencyForCountry("KE")).toBe("USD");
      // Argentina (ARS not in list) -> USD
      expect(getCurrencyForCountry("AR")).toBe("USD");
      // Colombia (COP not in list) -> USD
      expect(getCurrencyForCountry("CO")).toBe("USD");
      // Unknown or null country -> USD
      expect(getCurrencyForCountry("XYZ")).toBe("USD");
      expect(getCurrencyForCountry(null)).toBe("USD");
      expect(getCurrencyForCountry(undefined)).toBe("USD");
      expect(getCurrencyForCountry("")).toBe("USD");
    });

    it("detects country code from IANA timezone strings", () => {
      expect(detectCountryFromTimezone("Asia/Kolkata")).toBe("IN");
      expect(detectCountryFromTimezone("Asia/Calcutta")).toBe("IN");
      expect(detectCountryFromTimezone("America/New_York")).toBe("US");
      expect(detectCountryFromTimezone("America/Los_Angeles")).toBe("US");
      expect(detectCountryFromTimezone("Europe/London")).toBe("GB");
      expect(detectCountryFromTimezone("Europe/Madrid")).toBe("ES");
      expect(detectCountryFromTimezone("Europe/Berlin")).toBe("DE");
      expect(detectCountryFromTimezone("Asia/Tokyo")).toBe("JP");
      expect(detectCountryFromTimezone("America/Toronto")).toBe("CA");
      expect(detectCountryFromTimezone("Australia/Sydney")).toBe("AU");
      expect(detectCountryFromTimezone("Asia/Dubai")).toBe("AE");
      expect(detectCountryFromTimezone("America/Sao_Paulo")).toBe("BR");
      expect(detectCountryFromTimezone("America/Mexico_City")).toBe("MX");
    });

    it("detects country code from locale strings", () => {
      expect(detectCountryFromLocale("en-US")).toBe("US");
      expect(detectCountryFromLocale("en-IN")).toBe("IN");
      expect(detectCountryFromLocale("en-GB")).toBe("GB");
      expect(detectCountryFromLocale("es-ES")).toBe("ES");
      expect(detectCountryFromLocale("es-MX")).toBe("MX");
      expect(detectCountryFromLocale("pt-BR")).toBe("BR");
      expect(detectCountryFromLocale("ja-JP")).toBe("JP");
      expect(detectCountryFromLocale("ko-KR")).toBe("KR");
      expect(detectCountryFromLocale("de-DE")).toBe("DE");
      expect(detectCountryFromLocale("invalid")).toBeNull();
      expect(detectCountryFromLocale("")).toBeNull();
    });
  });

  describe("Default locale currency resolution", () => {
    it("resolves default currency per locale when AUTO is active in node/ssr", () => {
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
