import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { Locale } from "@/config/site";
import {
  SUPPORTED_CURRENCIES,
  type CurrencyInfo,
  getEffectiveCurrency,
  getActiveCurrencyCode,
  setActiveCurrencyCode,
  symbol as getSymbol,
  formatCurrency as fmtCurrency,
  formatCompact as fmtCompact,
  formatWithUnits as fmtWithUnits,
  money as fmtMoney,
} from "@/lib/currency";

export interface CurrencyContextValue {
  /** Selected currency code ('AUTO' or specific ISO code like 'USD', 'INR'). */
  currencyCode: string;
  /** Effective resolved currency information. */
  currency: CurrencyInfo;
  /** Updates the active currency globally across the app. */
  setCurrency: (code: string) => void;
  /** Active currency symbol (e.g. '$', '₹', '€'). */
  symbol: string;
  /** Formats a numeric value as currency. */
  formatCurrency: (value: number) => string;
  /** Compact format with units (e.g. '$1.5M', '₹15.00 L'). */
  formatCompact: (value: number) => string;
  /** Full amount with units. */
  formatWithUnits: (value: number) => string;
  /** Standard calculator result money formatting. */
  money: (value: number) => string;
  /** All supported currencies for selection. */
  currencies: CurrencyInfo[];
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    return getActiveCurrencyCode() ?? "AUTO";
  });

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user_currency") {
        setSelectedCode(e.newValue || "AUTO");
      }
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setSelectedCode(customEvent.detail || "AUTO");
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("instacalc:currency-change", handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("instacalc:currency-change", handleCustom);
    };
  }, []);

  const setCurrency = (code: string) => {
    const normalized = (code || "AUTO").toUpperCase();
    setSelectedCode(normalized);
    setActiveCurrencyCode(normalized);
  };

  const effectiveCurrency = useMemo(
    () => getEffectiveCurrency(locale, selectedCode === "AUTO" ? undefined : selectedCode),
    [locale, selectedCode]
  );

  const value: CurrencyContextValue = useMemo(
    () => ({
      currencyCode: selectedCode,
      currency: effectiveCurrency,
      setCurrency,
      symbol: effectiveCurrency.symbol,
      formatCurrency: (v: number) => fmtCurrency(locale, v, effectiveCurrency.code),
      formatCompact: (v: number) => fmtCompact(locale, v, effectiveCurrency.code),
      formatWithUnits: (v: number) => fmtWithUnits(locale, v, effectiveCurrency.code),
      money: (v: number) => fmtMoney(locale, v, effectiveCurrency.code),
      currencies: SUPPORTED_CURRENCIES,
    }),
    [locale, selectedCode, effectiveCurrency]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    const fallback = getEffectiveCurrency("en");
    return {
      currencyCode: "AUTO",
      currency: fallback,
      setCurrency: () => {},
      symbol: fallback.symbol,
      formatCurrency: (v: number) => fmtCurrency("en", v),
      formatCompact: (v: number) => fmtCompact("en", v),
      formatWithUnits: (v: number) => fmtWithUnits("en", v),
      money: (v: number) => fmtMoney("en", v),
      currencies: SUPPORTED_CURRENCIES,
    };
  }
  return ctx;
}
