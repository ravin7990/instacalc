/**
 * Server-only access to the full SEO dataset.
 *
 * Imported exclusively by the router and the prerenderer (both run in Node).
 * Keeping the dataset out of the client graph is what keeps the initial JS
 * payload — and therefore FCP/LCP/TBT — small.
 */
import seoData from "@/data/seo.generated.json";
import type { SeoRecord } from "@/data/seo-types";

const pages = seoData.pages as unknown as Record<string, SeoRecord>;

/** Every record keyed by its on-disk file path. */
export const SEO_PAGES: Record<string, SeoRecord> = pages;

/** Every record keyed by its URL path, e.g. "/" or "/us/401k-calculator.html". */
export const SEO_BY_PATH: Record<string, SeoRecord> = Object.values(pages).reduce(
  (acc, p) => {
    acc[p.path] = p;
    return acc;
  },
  {} as Record<string, SeoRecord>,
);

/** Every URL path that actually exists in this build, e.g. "/ja/sipcalculator.html". */
export const ALL_PATHS: string[] = Object.keys(SEO_BY_PATH).sort();

/** Fast existence test for a URL path. */
export function pageExists(path: string): boolean {
  return Object.prototype.hasOwnProperty.call(SEO_BY_PATH, path);
}

/** Server-side lookup: always consults the full dataset. */
export function getSeo(path: string): SeoRecord | undefined {
  return SEO_BY_PATH[path];
}

export type { SeoRecord };
