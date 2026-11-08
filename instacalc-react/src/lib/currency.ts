import type { Locale } from "@/config/site";

/**
 * Global currency management and locale-aware formatting.
 * Supports dynamic currency selection across all calculators,
 * while preserving native regional groupings (Lakh/Crore for INR, 億円/万円 for JPY, etc.).
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  formatLocale: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee", formatLocale: "en-IN" },
  { code: "USD", symbol: "$", name: "US Dollar", formatLocale: "en-US" },
  { code: "EUR", symbol: "€", name: "Euro", formatLocale: "de-DE" },
  { code: "GBP", symbol: "£", name: "British Pound", formatLocale: "en-GB" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", formatLocale: "ja-JP" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", formatLocale: "en-CA" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", formatLocale: "en-AU" },
  { code: "AED", symbol: "AED", name: "UAE Dirham", formatLocale: "en-AE" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", formatLocale: "en-SG" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", formatLocale: "de-CH" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", formatLocale: "zh-CN" },
  { code: "KRW", symbol: "₩", name: "South Korean Won", formatLocale: "ko-KR" },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", formatLocale: "ru-RU" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", formatLocale: "pt-BR" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal", formatLocale: "en-SA" },
  { code: "MXN", symbol: "Mex$", name: "Mexican Peso", formatLocale: "es-MX" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", formatLocale: "en-NZ" },
  { code: "THB", symbol: "฿", name: "Thai Baht", formatLocale: "th-TH" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", formatLocale: "id-ID" },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", formatLocale: "tr-TR" },
];

export const CURRENCY_MAP = new Map<string, CurrencyInfo>(
  SUPPORTED_CURRENCIES.map((c) => [c.code, c])
);

export const CURRENCY_STORAGE_KEY = "user_currency";

const CONFIG: Record<Locale, { locale: string; currency: string; symbol: string }> = {
  en: { locale: "en-IN", currency: "INR", symbol: "₹" },
  us: { locale: "en-US", currency: "USD", symbol: "$" },
  ja: { locale: "ja-JP", currency: "JPY", symbol: "¥" },
  ru: { locale: "ru-RU", currency: "RUB", symbol: "₽" },
  ko: { locale: "ko-KR", currency: "KRW", symbol: "₩" },
  es: { locale: "es-ES", currency: "EUR", symbol: "€" },
};

let inMemoryActiveCurrency: string | null = null;
const listeners = new Set<(code: string) => void>();

export function getActiveCurrencyCode(): string | null {
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (stored) {
        const upper = stored.toUpperCase();
        if (upper === "AUTO") return "AUTO";
        if (CURRENCY_MAP.has(upper)) return upper;
      }
    } catch {
      // private mode
    }
  }
  return inMemoryActiveCurrency;
}

export function setActiveCurrencyCode(code: string): void {
  const normalized = (code || "AUTO").toUpperCase();
  inMemoryActiveCurrency = normalized === "AUTO" ? null : normalized;
  if (typeof window !== "undefined") {
    try {
      if (normalized === "AUTO") {
        window.localStorage.removeItem(CURRENCY_STORAGE_KEY);
      } else {
        window.localStorage.setItem(CURRENCY_STORAGE_KEY, normalized);
      }
    } catch {
      // private mode
    }
    window.dispatchEvent(new CustomEvent("instacalc:currency-change", { detail: normalized }));
  }
  listeners.forEach((fn) => fn(normalized));
}

export function subscribeCurrencyChange(callback: (code: string) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getEffectiveCurrency(locale: Locale, explicitCode?: string): CurrencyInfo {
  const code = (explicitCode ?? getActiveCurrencyCode())?.toUpperCase();
  if (code && code !== "AUTO" && CURRENCY_MAP.has(code)) {
    return CURRENCY_MAP.get(code)!;
  }
  const fallback = CONFIG[locale] ?? CONFIG.en;
  return {
    code: fallback.currency,
    symbol: fallback.symbol,
    name: fallback.currency,
    formatLocale: fallback.locale,
  };
}

const formattersCache = new Map<string, Intl.NumberFormat>();
const numberFormattersCache = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(cur: CurrencyInfo): Intl.NumberFormat {
  const key = `${cur.formatLocale}_${cur.code}`;
  let f = formattersCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(cur.formatLocale, {
      style: "currency",
      currency: cur.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    formattersCache.set(key, f);
  }
  return f;
}

function getNumberFormatter(formatLocale: string): Intl.NumberFormat {
  let f = numberFormattersCache.get(formatLocale);
  if (!f) {
    f = new Intl.NumberFormat(formatLocale);
    numberFormattersCache.set(formatLocale, f);
  }
  return f;
}

export function symbol(locale: Locale, explicitCode?: string): string {
  return getEffectiveCurrency(locale, explicitCode).symbol;
}

export function formatCurrency(locale: Locale, value: number, explicitCode?: string): string {
  if (!Number.isFinite(value)) return "—";
  const cur = getEffectiveCurrency(locale, explicitCode);
  return getCurrencyFormatter(cur).format(value);
}

export function formatNumber(locale: Locale, value: number): string {
  if (!Number.isFinite(value)) return "—";
  const cur = getEffectiveCurrency(locale);
  return getNumberFormatter(cur.formatLocale).format(Math.round(value));
}

/**
 * Formats a money value for a calculator's result set.
 * Caller should NOT prepend a currency symbol.
 */
export function money(locale: Locale, value: number, explicitCode?: string): string {
  return formatWithUnits(locale, value, explicitCode);
}

/** Compact money with conventional units (Cr/L, 億円, млн, K/M/B …). */
export function formatCompact(locale: Locale, value: number, explicitCode?: string): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const cur = getEffectiveCurrency(locale, explicitCode);
  const s = cur.symbol;

  switch (cur.code) {
    case "JPY":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(1)}億円`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}万円`;
      break;
    case "KRW":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(1)}억`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}만`;
      break;
    case "RUB":
      if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)} млрд ₽`;
      if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)} млн ₽`;
      if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)} тыс. ₽`;
      break;
    case "INR":
      if (abs >= 1e7) return `${sign}${s}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${s}${(abs / 1e5).toFixed(2)} L`;
      if (abs >= 1e3) return `${sign}${s}${(abs / 1e3).toFixed(1)}K`;
      break;
    default:
      if (abs >= 1e9) return `${sign}${s}${(abs / 1e9).toFixed(1)}B`;
      if (abs >= 1e6) return `${sign}${s}${(abs / 1e6).toFixed(1)}M`;
      if (abs >= 1e3) return `${sign}${s}${(abs / 1e3).toFixed(1)}K`;
      break;
  }
  return `${sign}${getNumberFormatter(cur.formatLocale).format(Math.round(abs))}`;
}

/** Full amount with units (Cr/L, 万円, млн, or formatted currency). */
export function formatWithUnits(locale: Locale, value: number, explicitCode?: string): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const cur = getEffectiveCurrency(locale, explicitCode);
  const s = cur.symbol;

  switch (cur.code) {
    case "JPY":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(2)}億円`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}万円`;
      break;
    case "KRW":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(2)}억`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}만`;
      break;
    case "RUB":
      if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} млрд ₽`;
      if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)} млн ₽`;
      if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)} тыс. ₽`;
      break;
    case "INR":
      if (abs >= 1e7) return `${sign}${s}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${s}${(abs / 1e5).toFixed(2)} L`;
      break;
    default:
      return `${sign}${formatCurrency(locale, abs, cur.code)}`;
  }
  return `${sign}${formatCurrency(locale, abs, cur.code)}`;
}

export const KNOWN_CURRENCY_SYMBOLS = new Set([
  "₹", "$", "€", "£", "¥", "₩", "₽", "C$", "A$", "S$", "Fr.", "Mex$", "R$", "฿", "Rp", "₺", "AED", "SAR", "CHF", "NZ$"
]);

export function isCurrencySymbol(s?: string): boolean {
  if (!s) return false;
  const trimmed = s.trim();
  if (KNOWN_CURRENCY_SYMBOLS.has(trimmed)) return true;
  return /^[₹$€£¥₩₽฿₺]|^(C\$|A\$|S\$|Mex\$|R\$|NZ\$|AED|SAR|CHF|Fr\.|Rp)/.test(trimmed);
}

export function replaceCurrencySymbol(text: string, newSymbol: string): string {
  if (!text) return text;
  for (const sym of KNOWN_CURRENCY_SYMBOLS) {
    if (text.startsWith(sym)) {
      return newSymbol + text.slice(sym.length);
    }
  }
  return text.replace(/^[₹$€£¥₩₽฿₺]/, newSymbol);
}

/** Returns the Japanese Imperial Era (和暦), e.g. 令和8年. */
export function formatJapaneseEra(date: Date | string): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(`${date.includes("T") ? date : date + "T00:00:00"}`) : date;
  if (Number.isNaN(d.getTime())) return "";
  try {
    return new Intl.DateTimeFormat("ja-JP-u-ca-japanese", { era: "long", year: "numeric" }).format(d);
  } catch {
    return "";
  }
}

/** Localized weekday name (e.g. "火曜日" for ja, "Tuesday" for en). */
export function formatWeekday(
  locale: Locale,
  date: Date | string,
  style: "short" | "long" = "long",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(`${date.includes("T") ? date : date + "T00:00:00"}`) : date;
  if (Number.isNaN(d.getTime())) return "—";
  const loc = CONFIG[locale]?.locale ?? "en-IN";
  return d.toLocaleDateString(loc, { weekday: style });
}

/** Formats a Date or ISO string per locale standards (MM/DD/YYYY for US, YYYY年（和暦）M月D日 for JA). */
export function formatDate(
  locale: Locale,
  date: Date | string,
  style: "short" | "medium" | "long" = "short",
): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(`${date.includes("T") ? date : date + "T00:00:00"}`) : date;
  if (Number.isNaN(d.getTime())) return "—";

  const loc = CONFIG[locale]?.locale ?? "en-IN";
  if (locale === "ja") {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    if (style === "short") {
      const mm = String(m).padStart(2, "0");
      const dd = String(day).padStart(2, "0");
      return `${y}/${mm}/${dd}`;
    }
    const era = formatJapaneseEra(d);
    if (style === "long" && era) {
      return `${y}年（${era}）${m}月${day}日`;
    }
    return `${y}年${m}月${day}日`;
  }

  if (style === "short") {
    if (locale === "us") {
      // MM/DD/YYYY standard
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    }
    return new Intl.DateTimeFormat(loc, { year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  }

  return new Intl.DateTimeFormat(loc, {
    dateStyle: style,
  }).format(d);
}

/**
 * Formats a KRW amount into native Korean 4-digit units (만, 억).
 * e.g. 20_642_960 -> "약 2,064만 원", 150_000_000 -> "약 1억 5,000만 원"
 */
export function formatKoreanWonText(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e8) {
    const eok = Math.floor(abs / 1e8);
    const man = Math.round((abs % 1e8) / 1e4);
    return man > 0 ? `약 ${sign}${eok}억 ${man.toLocaleString("ko-KR")}만 원` : `약 ${sign}${eok}억 원`;
  }
  if (abs >= 1e4) {
    return `약 ${sign}${Math.round(abs / 1e4).toLocaleString("ko-KR")}만 원`;
  }
  return `${sign}${Math.round(abs).toLocaleString("ko-KR")}원`;
}
