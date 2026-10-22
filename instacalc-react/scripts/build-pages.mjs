/**
 * build-pages.mjs — prerenders every route to a static HTML file.
 *
 * Two guarantees matter here:
 *  1. Every legacy URL is emitted at exactly the same path, so no ranking is lost.
 *  2. The <head> contains the full SEO set (title, description, canonical,
 *     hreflang, OG, Twitter, JSON-LD) BEFORE any JavaScript runs.
 *
 * Uses react-dom/server (via the SSR bundle built by `vite build --ssr`),
 * including Suspense fallbacks, so lazy() routes still prerender.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync, writeFileSync as wf } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const SSR_ENTRY = join(ROOT, "dist-ssr", "entry-server.js");
const LEGACY = join(ROOT, "..");

if (!existsSync(SSR_ENTRY)) {
  console.error("[build-pages] missing dist-ssr/entry-server.js — run `npm run build:server` first");
  process.exit(1);
}

const { render } = await import(`file://${SSR_ENTRY.replace(/\\/g, "/")}`);
const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const pages = seo.pages;
const content = JSON.parse(readFileSync(join(ROOT, "src", "data", "content.generated.json"), "utf8"));

const ORIGIN = "https://instacalc.in";
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Reads the built CSS so it can be inlined (critical CSS = no render block). */
function readCss() {
  const assets = join(DIST, "assets");
  if (!existsSync(assets)) return "";
  return readdirSync(assets)
    .filter((f) => f.endsWith(".css"))
    .map((f) => readFileSync(join(assets, f), "utf8"))
    .join("\n");
}

/** Finds the built JS entry so the page can hydrate. */
function findEntryScript() {
  const html = join(DIST, "index.html");
  if (existsSync(html)) {
    const m = readFileSync(html, "utf8").match(/<script[^>]*src="([^"]+)"[^>]*><\/script>/);
    if (m) return m[1];
  }
  const assets = join(DIST, "assets");
  if (existsSync(assets)) {
    const js = readdirSync(assets).filter((f) => f.endsWith(".js") && f.startsWith("main-"));
    if (js.length) return `/assets/${js[0]}`;
  }
  return "";
}

function buildHead(page, css, entry, body, opts = {}) {
  // `marker` writes data-page on <html>. The 404 document uses it so the client
  // renders the NotFound page even though the address bar shows the URL that
  // was actually requested (see App.tsx).
  const marker = opts.marker ? ` data-page="${esc(opts.marker)}"` : "";
  // Emit the page's OWN url as canonical. 24 legacy pages declared a canonical
  // pointing at a different page (e.g. every /ru/ page pointed at its English
  // twin) even though they carried distinct translated titles and a matching
  // hreflang — self-referencing canonicals are the correct signal and keep
  // those locales indexed.
  const canonical = `${ORIGIN}${page.path === "/" ? "/" : page.path}`;
  const alternates = (page.alternates ?? [])
    .map((a) => `<link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(a.href)}">`)
    .join("\n  ");

  // JSON-LD is reproduced verbatim from the legacy page.
  const jsonLd = (page.jsonLd ?? [])
    .map((j) => `<script type="application/ld+json">${JSON.stringify(j)}</script>`)
    .join("\n  ");

  // The single SEO record this page needs, inlined for the client. Only the
  // fields the runtime actually reads are included — the 475 kB dataset stays
  // on the server.
  const inline = {
    path: page.path,
    locale: page.locale,
    title: page.title,
    description: page.description,
    keywords: page.keywords ?? "",
    h1: page.h1 ?? "",
    themeColor: page.themeColor ?? "#0284c7",
    ogTitle: page.ogTitle ?? "",
    ogImage: page.ogImage ?? "",
    alternates: page.alternates ?? [],
    jsonLd: page.jsonLd ?? [],
    canonical: page.path === "/" ? "/" : page.path,
    canonicalMismatch: false,
    bytes: page.bytes ?? 0,
    source: page.source ?? page.path,
  };
  const inlineSeo = `<script id="ic-seo" type="application/json">${JSON.stringify(inline).replace(/</g, "\\u003c")}</script>`;

  // Prose pages also carry their extracted copy inline, so the browser never
  // needs the full content dataset. Content keys mirror the legacy folder
  // layout ("ja/privacy.html"), so derive the key from the page path directly.
  const fileName = page.path.split("/").pop() ?? "";
  const localeDir = page.path.split("/").slice(1, -1).join("/");
  const prose = content[localeDir ? `${localeDir}/${fileName}` : fileName];
  const inlineContent = prose
    ? `<script id="ic-content" type="application/json">${JSON.stringify(prose).replace(/</g, "\\u003c")}</script>`
    : "";

  // Only the explicitly-known duplicates are noindex. `canonicalMismatch`
  // records the LEGACY markup, where /ru/ and /ko/ pages pointed at their
  // English twins; those canonicals are now self-referencing because the pages
  // carry genuinely translated content, so they must stay indexable.
  const DUPLICATE_SOURCES = new Set([
    "coumpoundinterest.html",
    "moretools/coumpoundinterest.html",
    "cargcalculator.html",
    "delete-account-verse.html",
    "deleteaccountverse.html",
  ]);
  const robots = opts.noindex
    ? "noindex,follow"
    : DUPLICATE_SOURCES.has(page.source)
      ? "noindex,follow"
      : "index,follow";

  const htmlLang =
    page.locale === "en"
      ? "en-IN"
      : page.locale === "us"
      ? "en-US"
      : page.locale === "ja"
      ? "ja"
      : page.locale === "ko"
      ? "ko"
      : page.locale === "ru"
      ? "ru"
      : "en";

  const isNoAdPage =
    opts.marker === "404" ||
    opts.noindex ||
    page.path === "/404.html" ||
    DUPLICATE_SOURCES.has(page.source);
  const adsenseTag = isNoAdPage
    ? ""
    : '\n  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4943063856769784" crossorigin="anonymous"></script>';

  return `<!doctype html>
<html lang="${htmlLang}"${marker}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(page.title)}</title>
  <meta name="description" content="${esc(page.description)}">
  ${page.keywords ? `<meta name="keywords" content="${esc(page.keywords)}">` : ""}
  <meta name="author" content="InstaCalc">
  <meta name="robots" content="${robots}">
  <meta name="naver-site-verification" content="instacalc-naver-verification">${adsenseTag}
  <meta name="theme-color" content="${esc(page.themeColor ?? "#0284c7")}">
  <link rel="canonical" href="${esc(canonical)}">
  ${alternates}
  <meta property="og:title" content="${esc(page.ogTitle ?? page.title)}">
  <meta property="og:description" content="${esc(page.description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${esc(page.ogImage ?? `${ORIGIN}/instatheme.webp`)}">
  <meta property="og:site_name" content="InstaCalc">
  <meta property="og:locale" content="${esc(page.ogLocale ?? (page.locale === "us" ? "en_US" : page.locale === "ja" ? "ja_JP" : page.locale === "ko" ? "ko_KR" : page.locale === "ru" ? "ru_RU" : "en_IN"))}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(page.ogTitle ?? page.title)}">
  <meta name="twitter:description" content="${esc(page.description)}">
  <meta name="twitter:image" content="${esc(page.ogImage ?? `${ORIGIN}/instatheme.webp`)}">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="icon" type="image/webp" href="/favicon.webp">
  ${jsonLd}
  <style>${css}</style>
</head>
<body>
  <div id="root">${body}</div>
  ${inlineSeo}
  ${inlineContent}
  <script type="module" src="${entry}"></script>
</body>
</html>`;
}

const css = readCss();
const entry = findEntryScript();

let written = 0;
let failed = 0;
for (const [source, page] of Object.entries(pages)) {
  // Preserve the legacy file layout exactly: /foo.html stays /foo.html,
  // and a directory index (/ja/) is written as ja/index.html.
  const rel = page.path === "/" ? "index.html" : page.path.endsWith("/") ? `${page.path}index.html` : page.path;
  const out = join(DIST, rel.replace(/^\//, ""));
  mkdirSync(dirname(out), { recursive: true });
  try {
    const body = await render(page.path);
    wf(out, buildHead(page, css, entry, body), "utf8");
    written++;
  } catch (err) {
    failed++;
    console.error(`[build-pages] FAILED ${page.path}: ${err.message}`);
  }
}

console.log(`[build-pages] prerendered ${written} pages -> dist/${failed ? ` (${failed} failed)` : ""}`);
if (failed) process.exitCode = 1;

// --- static assets that must ship for SEO and monetisation -----------------
const ROOT_ASSETS = ["robots.txt", "ads.txt", "app-ads.txt", "CNAME", "favicon.ico", "favicon.webp", "logo.png", "instatheme.webp"];
for (const f of ROOT_ASSETS) {
  const src = join(LEGACY, f);
  if (existsSync(src)) copyFileSync(src, join(DIST, f));
}
if (existsSync(join(LEGACY, "images"))) {
  mkdirSync(join(DIST, "images"), { recursive: true });
  for (const f of readdirSync(join(LEGACY, "images"))) {
    copyFileSync(join(LEGACY, "images", f), join(DIST, "images", f));
  }
}

// 404 for GitHub Pages.
//
// This used to be a byte-for-byte copy of index.html, which shipped the
// HOMEPAGE's prerendered markup. GitHub Pages serves this file for any unmatched
// URL while the address bar still shows the requested path, so the client
// resolved a different route and hydration failed (React error #418) on every
// 404 hit. Prerender the real NotFound page instead and mark the document with
// `data-page="404"` so the client renders the same component regardless of the
// URL that was requested. Marked noindex so it never enters the index.
{
  const notFound = {
    path: "/404.html",
    locale: "en",
    source: "404.html",
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
    canonicalMismatch: false,
  };
  try {
    const body = await render("/404.html");
    const html = buildHead(notFound, css, entry, body, { noindex: true, marker: "404" });
    wf(join(DIST, "404.html"), html, "utf8");
  } catch (err) {
    console.error(`[build-pages] FAILED 404.html: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log("[build-pages] copied robots.txt, ads.txt, app-ads.txt, CNAME, favicons, images");
