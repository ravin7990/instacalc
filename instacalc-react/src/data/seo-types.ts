import type { Locale } from "@/config/site";
import type { HreflangLink, JsonLd } from "@/seo/types";

/**
 * Shape of one page's SEO record. Declared without importing the dataset so
 * this module is safe to include in the client bundle.
 */
export interface SeoRecord {
  path: string;
  locale: Locale;
  canonical: string;
  canonicalMismatch: boolean;
  title: string;
  description: string;
  keywords?: string;
  h1?: string;
  themeColor?: string;
  ogTitle?: string;
  ogImage?: string;
  alternates: HreflangLink[];
  jsonLd: JsonLd[];
  bytes: number;
  source: string;
}
