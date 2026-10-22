/**
 * Global site constants. Single source of truth for URLs, brand and locales.
 */

export const SITE_ORIGIN = "https://instacalc.in";

export const SITE = {
  origin: SITE_ORIGIN,
  name: "InstaCalc",
  displayName: "InstaCalc.in",
  tagline: "All-in-One Online Calculators and Unit Converters",
  logo: "/logo.png",
  ogImage: "/instatheme.webp",
  themeColor: "#0284c7",
  adsense: "ca-pub-4943063856769784",
  ga: "G-J0ZWXR3T5P",
} as const;

export const LOCALES = ["en", "us", "ja", "ru", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { label: string; ogLocale: string; htmlLang: string }> = {
  en: { label: "English (India)", ogLocale: "en_IN", htmlLang: "en-IN" },
  us: { label: "English (US)", ogLocale: "en_US", htmlLang: "en-US" },
  ja: { label: "日本語", ogLocale: "ja_JP", htmlLang: "ja" },
  ru: { label: "Русский", ogLocale: "ru_RU", htmlLang: "ru" },
  ko: { label: "한국어", ogLocale: "ko_KR", htmlLang: "ko" },
};

/** Storage key used by the legacy language switcher/dialog. */
export const LANG_STORAGE_KEY = "user_lang";

/**
 * Absolute URL for a site path.
 *
 * Trailing slashes are significant here and must be preserved: a locale home
 * lives at `/ja/`, and the prerenderer emits `https://instacalc.in/ja/`. Stripping
 * the slash made `useSeo` rewrite the canonical to `/ja` the moment React
 * hydrated, so the crawler-visible tag disagreed with the live one and the two
 * URLs could be treated as separate documents. Only the root is normalised.
 */
export function absoluteUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return clean === "/" ? SITE_ORIGIN + "/" : SITE_ORIGIN + clean;
}
