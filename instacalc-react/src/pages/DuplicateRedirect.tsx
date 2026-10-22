import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/seo/SeoHead";
import { localeHome } from "@/components/layout/Layout";
import { ui } from "@/i18n/ui";

/**
 * Serves the handful of legacy URLs that are near-duplicates of another tool
 * (`coumpoundinterest` -> `compoundinterest`, `cargcalculator` ->
 * `cagrcalculator`). These were excluded from the sitemap and carry a canonical
 * pointing at the real tool, so they must not compete for the same keywords.
 *
 * The page is `noindex,follow` and points visitors at the canonical version.
 */
export default function DuplicateRedirect({ seo }: { seo: SeoRecord }) {
  const t = ui(seo.locale);

  // Where the real tool lives.
  //
  // This used to be derived from `seo.canonical`, but that field means different
  // things on the two sides of hydration: the prerenderer reads the raw dataset
  // (canonical = "compoundinterest.html", a bare filename) while the browser
  // reads the record build-pages.mjs inlined, which rewrites canonical to the
  // page's own path. That produced two different link texts for the same page
  // and React threw hydration error #418 on all five duplicate URLs.
  //
  // An explicit map keyed by path is identical on both sides, so it cannot drift.
  const target = DUPLICATE_TARGETS[seo.path];
  // Only used if a future duplicate is added without updating the map; keeps the
  // page total rather than rendering a link to nowhere.
  const href = target ? `/${target}` : localeHome(seo.locale);

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <article className="section prose-page">
          <div className="container prose">
            <h1>{seo.h1 || seo.title}</h1>
            <p className="lede">{seo.description}</p>

            <p>
              This page has moved. The calculator you are looking for now lives at a
              single, canonical address.
            </p>

            <p>
              <a className="btn btn-primary" href={href}>
                {target ? `Open /${target}` : t.browseTools}
              </a>
            </p>

            <p>
              <a href={localeHome(seo.locale)}>{t.browseTools}</a>
            </p>
          </div>
        </article>
      </Layout>
    </>
  );
}

/**
 * Duplicate URL -> the canonical tool it duplicates.
 *
 * Mirrors the `canonical` values recorded for these pages in the legacy dataset,
 * but as an explicit constant so the prerender and the browser cannot disagree.
 */
const DUPLICATE_TARGETS: Record<string, string> = {
  "/coumpoundinterest.html": "compoundinterest.html",
  "/moretools/coumpoundinterest.html": "compoundinterest.html",
  "/cargcalculator.html": "cagrcalculator.html",
  "/delete-account-verse.html": "delete-account.html",
  "/deleteaccountverse.html": "delete-account.html",
};