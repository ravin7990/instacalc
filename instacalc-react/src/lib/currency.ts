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

/**
 * Maps ISO 3166-1 alpha-2 country codes to national currency codes.
 */
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // Directly supported in list:
  IN: "INR",
  US: "USD", PR: "USD", GU: "USD", VI: "USD", AS: "USD", MP: "USD",
  GB: "GBP",
  JP: "JPY",
  CA: "CAD",
  AU: "AUD",
  AE: "AED",
  SG: "SGD",
  CH: "CHF", LI: "CHF",
  CN: "CNY",
  KR: "KRW",
  RU: "RUB", BY: "RUB",
  BR: "BRL",
  SA: "SAR",
  MX: "MXN",
  NZ: "NZD",
  TH: "THB",
  ID: "IDR",
  TR: "TRY",
  // Eurozone:
  ES: "EUR", DE: "EUR", FR: "EUR", IT: "EUR", NL: "EUR", BE: "EUR",
  AT: "EUR", IE: "EUR", PT: "EUR", FI: "EUR", GR: "EUR", CY: "EUR",
  EE: "EUR", LV: "EUR", LT: "EUR", LU: "EUR", MT: "EUR", SK: "EUR",
  SI: "EUR", HR: "EUR", AD: "EUR", MC: "EUR", SM: "EUR", VA: "EUR",
  ME: "EUR", XK: "EUR",
};

/**
 * Maps IANA timezones to ISO country codes.
 */
export const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  // India
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",

  // United States & Territories
  "America/New_York": "US",
  "America/Detroit": "US",
  "America/Kentucky/Louisville": "US",
  "America/Kentucky/Monticello": "US",
  "America/Indiana/Indianapolis": "US",
  "America/Indiana/Vincennes": "US",
  "America/Indiana/Winamac": "US",
  "America/Indiana/Marengo": "US",
  "America/Indiana/Petersburg": "US",
  "America/Indiana/Vevay": "US",
  "America/Indiana/Tell_City": "US",
  "America/Indiana/Knox": "US",
  "America/Chicago": "US",
  "America/Menominee": "US",
  "America/North_Dakota/Center": "US",
  "America/North_Dakota/New_Salem": "US",
  "America/North_Dakota/Beulah": "US",
  "America/Denver": "US",
  "America/Boise": "US",
  "America/Phoenix": "US",
  "America/Los_Angeles": "US",
  "America/Anchorage": "US",
  "America/Juneau": "US",
  "America/Sitka": "US",
  "America/Metlakatla": "US",
  "America/Yakutat": "US",
  "America/Nome": "US",
  "America/Adak": "US",
  "Pacific/Honolulu": "US",
  "America/Puerto_Rico": "PR",
  "Pacific/Guam": "GU",

  // United Kingdom
  "Europe/London": "GB",
  "Europe/Belfast": "GB",

  // Eurozone
  "Europe/Madrid": "ES",
  "Atlantic/Canary": "ES",
  "Africa/Ceuta": "ES",
  "Europe/Berlin": "DE",
  "Europe/Busingen": "DE",
  "Europe/Paris": "FR",
  "Europe/Rome": "IT",
  "Europe/Amsterdam": "NL",
  "Europe/Brussels": "BE",
  "Europe/Vienna": "AT",
  "Europe/Dublin": "IE",
  "Europe/Lisbon": "PT",
  "Atlantic/Madeira": "PT",
  "Atlantic/Azores": "PT",
  "Europe/Helsinki": "FI",
  "Europe/Athens": "GR",
  "Asia/Nicosia": "CY",
  "Europe/Tallinn": "EE",
  "Europe/Riga": "LV",
  "Europe/Vilnius": "LT",
  "Europe/Luxembourg": "LU",
  "Europe/Malta": "MT",
  "Europe/Bratislava": "SK",
  "Europe/Ljubljana": "SI",
  "Europe/Zagreb": "HR",

  // Japan
  "Asia/Tokyo": "JP",

  // Canada
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Montreal": "CA",
  "America/Edmonton": "CA",
  "America/Winnipeg": "CA",
  "America/Halifax": "CA",
  "America/St_Johns": "CA",
  "America/Regina": "CA",

  // Australia
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Australia/Brisbane": "AU",
  "Australia/Perth": "AU",
  "Australia/Adelaide": "AU",
  "Australia/Hobart": "AU",
  "Australia/Darwin": "AU",

  // UAE
  "Asia/Dubai": "AE",

  // Singapore
  "Asia/Singapore": "SG",

  // Switzerland
  "Europe/Zurich": "CH",

  // China
  "Asia/Shanghai": "CN",
  "Asia/Urumqi": "CN",

  // South Korea
  "Asia/Seoul": "KR",

  // Russia
  "Europe/Moscow": "RU",
  "Europe/Samara": "RU",
  "Europe/Kaliningrad": "RU",
  "Asia/Yekaterinburg": "RU",
  "Asia/Omsk": "RU",
  "Asia/Novosibirsk": "RU",
  "Asia/Krasnoyarsk": "RU",
  "Asia/Irkutsk": "RU",
  "Asia/Yakutsk": "RU",
  "Asia/Vladivostok": "RU",

  // Brazil
  "America/Sao_Paulo": "BR",
  "America/Manaus": "BR",
  "America/Fortaleza": "BR",
  "America/Recife": "BR",
  "America/Belem": "BR",

  // Saudi Arabia
  "Asia/Riyadh": "SA",

  // Mexico
  "America/Mexico_City": "MX",
  "America/Cancun": "MX",
  "America/Monterrey": "MX",
  "America/Tijuana": "MX",

  // New Zealand
  "Pacific/Auckland": "NZ",

  // Thailand
  "Asia/Bangkok": "TH",

  // Indonesia
  "Asia/Jakarta": "ID",

  // Turkey
  "Europe/Istanbul": "TR",
  "Asia/Istanbul": "TR",
};

/**
 * Returns the currency code for a given country code:
 * - If country's currency is in SUPPORTED_CURRENCIES -> that currency code
 * - Otherwise -> "USD" (Dollar)
 */
export function getCurrencyForCountry(countryCode?: string | null): string {
  if (!countryCode) return "USD";
  const normalized = countryCode.trim().toUpperCase();
  const currency = COUNTRY_TO_CURRENCY[normalized];
  if (currency && CURRENCY_MAP.has(currency)) {
    return currency;
  }
  return "USD";
}

/**
 * Detects country from an IANA timezone string.
 */
export function detectCountryFromTimezone(tz?: string): string | null {
  if (!tz) return null;
  if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
  if (/Calcutta|Kolkata/i.test(tz)) return "IN";
  if (/Tokyo/i.test(tz)) return "JP";
  if (/Seoul/i.test(tz)) return "KR";
  if (/London|Belfast/i.test(tz)) return "GB";
  if (/Madrid|Canary|Berlin|Paris|Rome|Amsterdam|Brussels|Vienna|Dublin|Lisbon|Helsinki|Athens/i.test(tz)) return "ES";
  if (/Toronto|Vancouver|Montreal|Edmonton/i.test(tz)) return "CA";
  if (/Sydney|Melbourne|Brisbane|Perth|Adelaide/i.test(tz)) return "AU";
  if (/Dubai/i.test(tz)) return "AE";
  if (/Riyadh/i.test(tz)) return "SA";
  if (/Singapore/i.test(tz)) return "SG";
  if (/Zurich/i.test(tz)) return "CH";
  if (/Shanghai|Beijing|Urumqi/i.test(tz)) return "CN";
  if (/Moscow|Samara|Yekaterinburg|Novosibirsk/i.test(tz)) return "RU";
  if (/Sao_Paulo|Manaus|Fortaleza/i.test(tz)) return "BR";
  if (/Mexico_City|Cancun|Monterrey|Tijuana/i.test(tz)) return "MX";
  if (/Auckland/i.test(tz)) return "NZ";
  if (/Bangkok/i.test(tz)) return "TH";
  if (/Jakarta/i.test(tz)) return "ID";
  if (/Istanbul/i.test(tz)) return "TR";
  if (/New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu|Detroit|Indiana/i.test(tz)) return "US";
  return null;
}

/**
 * Detects country from a locale string (e.g. "en-US" -> "US", "es-ES" -> "ES").
 */
export function detectCountryFromLocale(loc?: string): string | null {
  if (!loc) return null;
  const parts = loc.split(/[-_]/);
  if (parts.length > 1 && parts[1].length === 2) {
    return parts[1].toUpperCase();
  }
  return null;
}

let cachedDetectedCountry: string | null = null;

/**
 * Detects user's country based on browser environment (sessionStorage, timezone, navigator locale).
 */
export function detectUserCountry(): string | null {
  if (cachedDetectedCountry) return cachedDetectedCountry;
  if (typeof window === "undefined") return null;

  try {
    const sessionSaved = window.sessionStorage.getItem("instacalc_detected_country");
    if (sessionSaved) {
      cachedDetectedCountry = sessionSaved.toUpperCase();
      return cachedDetectedCountry;
    }
  } catch {
    // private browsing
  }

  // 1. Check browser timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryFromTz = detectCountryFromTimezone(tz);
    if (countryFromTz) {
      cachedDetectedCountry = countryFromTz;
      return cachedDetectedCountry;
    }
  } catch {
    // ignore
  }

  // 2. Check navigator language
  try {
    const navLang = navigator.language || (navigator.languages && navigator.languages[0]);
    const countryFromNav = detectCountryFromLocale(navLang);
    if (countryFromNav) {
      cachedDetectedCountry = countryFromNav;
      return cachedDetectedCountry;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Returns the auto-detected currency code for the current user:
 * - If country's currency is in the supported list -> that currency
 * - Otherwise -> "USD" (Dollar)
 */
export function getAutoDetectedCurrencyCode(): string {
  const country = detectUserCountry();
  return getCurrencyForCountry(country);
}

let isGeoDetectionInitialized = false;

/**
 * Asynchronously checks geolocation via free GeoIP endpoints in the browser
 * and triggers currency update if country changes and user has not set a manual override.
 */
export function initCountryAutoDetection(): void {
  if (isGeoDetectionInitialized || typeof window === "undefined") return;
  isGeoDetectionInitialized = true;

  try {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored && stored !== "AUTO") {
      // User has manually chosen a currency; do not override
      return;
    }

    const sessionSaved = window.sessionStorage.getItem("instacalc_detected_country");
    if (sessionSaved) {
      cachedDetectedCountry = sessionSaved.toUpperCase();
      return;
    }
  } catch {
    // private mode
  }

  // Asynchronous network detection with fallback
  const fetchEndpoint = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch("https://api.country.is/", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.country === "string" && data.country.length === 2) {
          return data.country.toUpperCase();
        }
      }
    } catch {
      // try fallback
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch("https://ipapi.co/country/", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const text = (await res.text()).trim().toUpperCase();
        if (text.length === 2) {
          return text;
        }
      }
    } catch {
      // network failure or offline
    }

    return null;
  };

  fetchEndpoint().then((country) => {
    if (country) {
      const prevCountry = cachedDetectedCountry;
      cachedDetectedCountry = country;
      try {
        window.sessionStorage.setItem("instacalc_detected_country", country);
      } catch {
        // private mode
      }

      const prevCurrency = getCurrencyForCountry(prevCountry);
      const newCurrency = getCurrencyForCountry(country);
      if (newCurrency !== prevCurrency) {
        window.dispatchEvent(new CustomEvent("instacalc:currency-change", { detail: "AUTO" }));
        listeners.forEach((fn) => fn("AUTO"));
      }
    }
  });
}

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
  // When AUTO is active in browser, resolve currency based on auto-detected location:
  if (typeof window !== "undefined") {
    const autoCode = getAutoDetectedCurrencyCode();
    if (autoCode && CURRENCY_MAP.has(autoCode)) {
      return CURRENCY_MAP.get(autoCode)!;
    }
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
