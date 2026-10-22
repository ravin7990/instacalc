/**
 * Client-side SEO access.
 *
 * The full dataset (`seo.generated.json`, ~475 kB covering all 118 pages) is
 * imported ONLY by `seo-server.ts`, which runs in Node during prerendering and
 * never reaches a browser. This module therefore carries no dataset import.
 *
 * At runtime the client reads exactly one page's record, inlined into the
 * prerendered HTML as `<script id="ic-seo" type="application/json">`. That is
 * what keeps the initial JS payload — and therefore FCP/LCP/TBT — small.
 */
import type { SeoRecord } from "@/data/seo-types";

export type { SeoRecord };

const INLINE_ID = "ic-seo";

function inlineRecord(): SeoRecord | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(INLINE_ID);
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as SeoRecord;
  } catch {
    return null;
  }
}

let cache: SeoRecord | null = null;

/**
 * Resolves the current page's SEO record.
 *
 * On the client it comes from the inline payload written by build-pages.mjs.
 * During prerendering there is no DOM, so the full dataset is consulted instead
 * — but that module is only reachable from the server bundle.
 */
export function getSeo(path: string): SeoRecord | undefined {
  if (typeof document === "undefined") {
    // Server/prerender: pull the dataset in lazily so the client graph never
    // sees it. The import is dynamic, which keeps it out of the browser build.
    return serverLookup(path);
  }
  if (!cache) cache = inlineRecord();
  if (cache && matchesPath(cache.path, path)) return cache;
  return undefined;
}

/**
 * Whether an inlined record describes the requested URL.
 *
 * Directory homepages are the subtle case. `/ja/` is written to
 * `dist/ja/index.html` and its inlined record says `path: "/ja/"`, but a visitor
 * who types `/ja/index.html` directly (or follows such a link) has a
 * `location.pathname` of `/ja/index.html`. A strict comparison missed, the page
 * fell back to placeholder SEO, and hydration failed on those three pages.
 * Treating a trailing `index.html` as equivalent to its directory fixes it.
 */
function matchesPath(recordPath: string, requested: string): boolean {
  if (recordPath === requested) return true;
  return stripIndexHtml(requested) === recordPath;
}

/** `/ja/index.html` -> `/ja/`; any other path is returned unchanged. */
function stripIndexHtml(path: string): string {
  if (!path.endsWith("/index.html")) return path;
  return path.slice(0, -"index.html".length);
}

/** Injected by build-pages.mjs; replaced at build time in the SSR bundle. */
let serverLookup: (path: string) => SeoRecord | undefined = () => undefined;

/** Called by entry-server so the prerenderer can resolve any legacy path. */
export function __setServerLookup(fn: (path: string) => SeoRecord | undefined) {
  serverLookup = fn;
}


