import type { Locale } from "@/config/site";

/**
 * Locale-aware currency formatting, ported from the legacy currency-manager.js.
 * Keeps the Indian Lakh/Crore grouping that INR users expect.
 */

const CONFIG: Record<Locale, { locale: string; currency: string; symbol: string }> = {
  en: { locale: "en-IN", currency: "INR", symbol: "₹" },
  us: { locale: "en-US", currency: "USD", symbol: "$" },
  ja: { locale: "ja-JP", currency: "JPY", symbol: "¥" },
  ru: { locale: "ru-RU", currency: "RUB", symbol: "₽" },
  ko: { locale: "ko-KR", currency: "KRW", symbol: "₩" },
};

/** Pair of formatters, created once per locale. */
interface Formatters {
  currency: Intl.NumberFormat;
  number: Intl.NumberFormat;
}

const cache = new Map<Locale, Formatters>();

function formatters(locale: Locale): Formatters {
  const hit = cache.get(locale);
  if (hit) return hit;

  const c = CONFIG[locale] ?? CONFIG.en;
  const made: Formatters = {
    currency: new Intl.NumberFormat(c.locale, {
      style: "currency",
      currency: c.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    number: new Intl.NumberFormat(c.locale),
  };
  cache.set(locale, made);
  return made;
}

export function symbol(locale: Locale): string {
  return (CONFIG[locale] ?? CONFIG.en).symbol;
}

export function formatCurrency(locale: Locale, value: number): string {
  if (!Number.isFinite(value)) return "—";
  return formatters(locale).currency.format(value);
}

export function formatNumber(locale: Locale, value: number): string {
  if (!Number.isFinite(value)) return "—";
  return formatters(locale).number.format(Math.round(value));
}

/**
 * Formats a money value for a calculator's result set.
 *
 * `formatWithUnits` already includes the locale's currency symbol (₹, $, ¥ …),
 * so callers must NOT prepend one. An earlier version of every calculator did
 * `${symbol(locale)}${formatWithUnits(...)}`, which rendered "₹₹43,391".
 * This helper exists so the intent is stated once and the mistake cannot recur.
 *
 * Usage: format: (v) => money(locale, v)
 */
export function money(locale: Locale, value: number): string {
  return formatWithUnits(locale, value);
}

/** Compact money with the locale's conventional units (Cr/L, 億円, млн …). */
export function formatCompact(locale: Locale, value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const s = (CONFIG[locale] ?? CONFIG.en).symbol;

  switch (locale) {
    case "ja":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(1)}億円`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}万円`;
      break;
    case "ko":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(1)}억`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}만`;
      break;
    case "ru":
      if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)} млрд ₽`;
      if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)} млн ₽`;
      if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)} тыс. ₽`;
      break;
    case "us":
      if (abs >= 1e9) return `${sign}${s}${(abs / 1e9).toFixed(1)}B`;
      if (abs >= 1e6) return `${sign}${s}${(abs / 1e6).toFixed(1)}M`;
      if (abs >= 1e3) return `${sign}${s}${(abs / 1e3).toFixed(1)}K`;
      break;
    default:
      if (abs >= 1e7) return `${sign}${s}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${s}${(abs / 1e5).toFixed(2)} L`;
      if (abs >= 1e3) return `${sign}${s}${(abs / 1e3).toFixed(1)}K`;
  }
  return `${sign}${formatNumber(locale, abs)}`;
}

/** Full amount with locale units (Cr/L, 万円, млн …). */
export function formatWithUnits(locale: Locale, value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const s = (CONFIG[locale] ?? CONFIG.en).symbol;

  switch (locale) {
    case "ja":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(2)}億円`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}万円`;
      break;
    case "ko":
      if (abs >= 1e8) return `${sign}${s}${(abs / 1e8).toFixed(2)}억`;
      if (abs >= 1e4) return `${sign}${s}${Math.round(abs / 1e4)}만`;
      break;
    case "ru":
      if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} млрд ₽`;
      if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)} млн ₽`;
      if (abs >= 1e3) return `${sign}${Math.round(abs / 1e3)} тыс. ₽`;
      break;
    case "us":
      return `${sign}${formatCurrency(locale, abs)}`;
    default:
      if (abs >= 1e7) return `${sign}${s}${(abs / 1e7).toFixed(2)} Cr`;
      if (abs >= 1e5) return `${sign}${s}${(abs / 1e5).toFixed(2)} L`;
  }
  return `${sign}${formatCurrency(locale, abs)}`;
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

