import { getSeo } from "@/data/seo";
import type { SeoRecord } from "@/data/seo-types";
import { resolveRoute, loadPage, type PageComponent } from "@/app/router";
import NotFound from "@/pages/NotFound";
import { lazy, useMemo, Suspense, useState, useEffect } from "react";
import { trackPageView } from "@/lib/analytics";
import { PageContext } from "@/app/PageContext";

/**
 * Root component. Resolves the current path to a route and renders its page.
 *
 * `getSeo` reads the record inlined into the prerendered HTML on the client and
 * falls back to the full dataset during prerendering, so neither path needs the
 * other one's data.
 *
 * The page loader is wrapped in `lazy()` here (rather than in the route table)
 * so the route table stays a set of plain async functions that the prerenderer
 * can await directly. Memoising by loader keeps the same lazy component across
 * re-renders, which hydration requires to match the server output.
 */
export default function App({ path }: { path: string }) {
  // GitHub Pages serves dist/404.html for ANY unmatched URL while the address bar
  // still shows the URL the visitor asked for. That document ships the 404 body's
  // prerendered markup, so routing on `path` would resolve a different page and
  // hydration would fail. build-pages.mjs marks the document, so trust that marker
  // over the (meaningless) request path. The `path` check covers the prerenderer,
  // which has no DOM but does render this route by its real path.
  if (isNotFoundDocument() || path === NOT_FOUND_PATH) {
    return <NotFound seo={NOT_FOUND_SEO} />;
  }

  const route = resolveRoute(path);
  const initialSeo = getSeo(path) ?? fallbackSeo(path, route.locale);
  const [seo, setSeo] = useState<SeoRecord>(initialSeo);

  useEffect(() => {
    trackPageView(path, seo.title, seo.locale);
  }, [path, seo.title, seo.locale]);

  useEffect(() => {
    if (seo.description === "") {
      import("@/data/seo.generated.json").then((mod) => {
        const pages = mod.default.pages as Record<string, SeoRecord>;
        const cleanPath = path.endsWith("/index.html") ? path.slice(0, -"index.html".length) : path;
        for (const p of Object.values(pages)) {
          if (p.path === cleanPath || p.path === path) {
            setSeo(p);
            break;
          }
        }
      });
    }
  }, [path, seo.description]);

  const Page = useMemo(() => lazy(() => route.load()) as PageComponent, [route.load]);

  return (
    <PageContext.Provider value={{ path, locale: route.locale, seo }}>
      <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
        <Page seo={seo} />
      </Suspense>
    </PageContext.Provider>
  );
}

/** The route the 404 document is prerendered from. */
const NOT_FOUND_PATH = "/404.html";

/** True when the served HTML is the 404 document (marked by build-pages.mjs). */
function isNotFoundDocument(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.dataset.page === "404"
  );
}

/**
 * Fixed record for the 404 page, shared by the prerenderer and the browser.
 *
 * Deliberately static and shared: any value derived from the request path would
 * differ between the prerender and hydration, which is exactly what caused the
 * original mismatch.
 */
const NOT_FOUND_SEO: SeoRecord = {
  path: NOT_FOUND_PATH,
  locale: "en",
  canonical: NOT_FOUND_PATH,
  canonicalMismatch: false,
  title: "Page not found | InstaCalc",
  description: "The page you are looking for is unavailable.",
  keywords: "",
  h1: "Page not found",
  themeColor: "#0284c7",
  ogTitle: "Page not found | InstaCalc",
  ogImage: "",
  alternates: [],
  jsonLd: [],
  bytes: 0,
  source: "404.html",
};

/** Used only if a path has no SEO record; keeps the render total. */
function fallbackSeo(path: string, locale: SeoRecord["locale"] = "en"): SeoRecord {
  return {
    path,
    locale,
    canonical: path,
    canonicalMismatch: false,
    title: "InstaCalc",
    description: "Free online calculators and unit converters.",
    keywords: "",
    h1: "",
    themeColor: "#0284c7",
    ogTitle: "",
    ogImage: "",
    alternates: [],
    jsonLd: [],
    bytes: 0,
    source: path,
  };
}

export { loadPage };


