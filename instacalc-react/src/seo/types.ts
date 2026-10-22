import type { Locale } from "@/config/site";

/** JSON-LD graph entries a page can emit. Mirrors the legacy markup exactly. */
export type JsonLd =
  | { "@type": "WebApplication"; name: string; url: string; applicationCategory: string; operatingSystem: string; description: string }
  | { "@type": "FAQPage"; mainEntity: Array<{ "@type": "Question"; name: string; acceptedAnswer: { "@type": "Answer"; text: string } }> }
  | { "@type": "BreadcrumbList"; itemListElement: Array<{ "@type": "ListItem"; position: number; name: string; item: string }> }
  | { "@type": "HowTo"; name: string; step: Array<{ "@type": "HowToStep"; position: number; name: string; text: string }> }
  | { "@type": "WebSite"; name: string; url: string }
  | { "@type": "Organization"; name: string; url: string }
  | { "@type": "WebPage"; name: string; url: string };

export interface HreflangLink {
  hreflang: string;
  href: string;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords?: string;
  /** Path of this page, always absolute-from-root with a leading slash. */
  path: string;
  locale: Locale;
  robots?: string;
  /** If false the page is emitted noindex (thin/duplicate pages). */
  indexable?: boolean;
  /** Branded OG title; falls back to `title` when absent. */
  ogTitle?: string;
  themeColor?: string;
  /** Absolute URLs of sibling translations. */
  alternates?: HreflangLink[];
  /** Breadcrumb trail, excludes the page itself. */
  breadcrumbs?: Array<{ name: string; path: string }>;
  faq?: Array<{ q: string; a: string }>;
  howTo?: { name: string; steps: Array<{ name: string; text: string }> };
  /** Maps to the WebApplication @type entry. */
  appCategory?: string;
  /** H1 rendered on the page. */
  h1?: string;
}
