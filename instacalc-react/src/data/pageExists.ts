import EXISTING_PATHS from "@/data/tools.generated.json";
import type { Locale } from "@/config/site";

/**
 * Single source of truth for "does this URL actually resolve?".
 *
 * Chrome's crawl of the legacy site reported hard 404s for a large share of
 * every localised page. The cause was never the route table — that is
 * generated from the page list and matches it exactly — it was the chrome:
 * the header nav, footer nav, brand link and breadcrumbs all built their hrefs
 * from `/${locale}/<file>` without checking that the page was ever built.
 *
 * `src/data/tools.ts` already solved this for the homepage catalogue by
 * filtering against the generated path list. This module exports that same
 * predicate so the chrome can use it too, instead of each call site
 * re-deriving a path and hoping it exists.
 *
 * Backed by a 3.4 kB path-only list rather than the 475 kB SEO dataset, so it
 * costs the client bundle nothing.
 */

/** Locale -> set of site-absolute paths that were actually built. */
const SETS = new Map<string, ReadonlySet<string>>(
  Object.entries(EXISTING_PATHS).map(([locale, paths]) => [locale, new Set(paths as string[])]),
);

/**
 * Every path in the build, regardless of locale.
 *
 * Used for genuinely site-wide URLs — `/`, and the root-only pages Terms and
 * Delete Account — which resolve for every locale's visitor.
 */
const ALL = new Set<string>([...SETS.values()].flatMap((s) => [...s]));

/**
 * True when `href` points at a document that was actually built.
 *
 * An absolute href is checked against the whole build, because a path is a path
 * wherever it is linked from: `/` and `/terms.html` are real pages for a /ko/
 * visitor even though /ko/ itself carries only tool pages.
 *
 * A bare filename (`aboutus.html`) is resolved *within the locale*, so a
 * localised page never silently points at the English original. Use
 * `localeOrRoot` when that fallback is what you actually want.
 *
 * Query strings and `#fragment`s are ignored, since they address the same
 * document. External and same-page hrefs are always accepted.
 */
export function pageExists(locale: Locale, href: string): boolean {
  if (!href || href.startsWith("#") || href.startsWith("http")) return true;
  const bare = href.split(/[?#]/)[0];
  if (bare.startsWith("/")) return ALL.has(bare);
  const prefix = locale === "en" ? "" : `/${locale}`;
  return (SETS.get(locale)?.has(`${prefix}/${bare}`) ?? false);
}

/**
 * Resolves a root-relative page to the locale's own copy, falling back to the
 * English original, and finally to `null` when neither exists.
 *
 * This is what the chrome uses for Home / About / Contact / Privacy. The
 * locales are lopsided — /us/ has no translated About or Contact, /ko/ has no
 * homepage — and the alternative to falling back is dropping the link
 * altogether, which left /ko/ with a completely empty nav and every /us/ page
 * three links short. Root-only pages already resolve this way in the footer
 * (Terms and Delete Account are English for every locale), so the chrome now
 * follows the same rule instead of inventing a second one.
 */
export function localeOrRoot(locale: Locale, file: string): string | null {
  const prefix = locale === "en" ? "" : `/${locale}`;
  const local = `${prefix}/${file}`;
  if (SETS.get(locale)?.has(local)) return local;
  const root = `/${file}`;
  return ALL.has(root) ? root : null;
}

/** Convenience wrapper: `href` if it resolves, otherwise `null`. */
export function existingHref(locale: Locale, href: string): string | null {
  return pageExists(locale, href) ? href : null;
}
