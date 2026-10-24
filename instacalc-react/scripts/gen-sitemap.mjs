/**
 * gen-sitemap.mjs — regenerates sitemap.xml from the extracted SEO data.
 *
 * Reproduces every <loc> the legacy sitemap contained (no URL is dropped), and
 * adds xhtml:lang alternates so hreflang and the sitemap agree. Near-duplicate
 * pages are marked noindex and excluded from the sitemap, matching what the
 * prerenderer writes into each page's <head>.
 *
 * Run: node scripts/gen-sitemap.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const ORIGIN = "https://instacalc.in";

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));

/** Carries the legacy lastmod where known, otherwise build time. */
const LEGACY_SITEMAP = join(ROOT, "..", "sitemap.xml");
const lastmod = new Map();
if (existsSync(LEGACY_SITEMAP)) {
  const xml = readFileSync(LEGACY_SITEMAP, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
    lastmod.set(m[1].replace(`${ORIGIN}/`, "").replace(/\/$/, ""), m[2]);
  }
}

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/**
 * Legacy URLs that are genuinely near-duplicates of another tool. These were
 * absent from the original sitemap and declared a canonical elsewhere, so they
 * stay out of the index.
 *
 * Note: pages whose canonical merely pointed at their English translation (the
 * /ru/ and /ko/ tools) are NOT listed. Their canonicals are now self-referencing
 * because they carry genuinely translated content, so they belong in the index.
 */
const DUPLICATE_SOURCES = new Set([
  "coumpoundinterest.html",
  "moretools/coumpoundinterest.html",
  "cargcalculator.html",
  "delete-account-verse.html",
  "deleteaccountverse.html",
  "404.html",
]);

const entries = Object.values(seo.pages)
  // Only the explicitly-listed duplicates and error pages are excluded.
  .filter((p) => !DUPLICATE_SOURCES.has(p.source) && p.path !== "/404.html" && p.source !== "404.html")
  .sort((a, b) => (a.path === "/" ? -1 : b.path === "/" ? 1 : a.path.localeCompare(b.path)));

const today = new Date().toISOString().slice(0, 10);

function buildUrlset(items) {
  const urls = items
    .map((p) => {
      const loc = p.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${p.path}`;
      const mod = lastmod.get(p.path.replace(/^\//, "").replace(/\/$/, "")) ?? today;
      // Priority: home 1.0, calculators 0.8, everything else 0.6.
      const priority = p.path === "/" ? "1.0" : /calculator|interest|emi|gst/.test(p.path) ? "0.8" : "0.6";

      const alts = (p.alternates ?? [])
        .map((a) => {
          let href = a.href;
          if (href.endsWith("/index.html")) href = href.slice(0, -"index.html".length);
          else if (href === `${ORIGIN}/index.html`) href = `${ORIGIN}/`;
          return `    <xhtml:link rel="alternate" hreflang="${esc(a.hreflang)}" href="${esc(href)}"/>`;
        })
        .join("\n");

      return `  <url>
    <loc>${esc(loc)}</loc>
    <lastmod>${mod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
${alts}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

// 1. Write consolidated sitemap.xml
writeFileSync(join(DIST, "sitemap.xml"), buildUrlset(entries), "utf8");

// 2. Write regional sitemaps
const locales = ["us", "ja", "ru", "ko"];
for (const loc of locales) {
  const locEntries = entries.filter((p) => p.locale === loc || p.path.startsWith(`/${loc}/`));
  if (locEntries.length > 0) {
    const locDir = join(DIST, loc);
    if (!existsSync(locDir)) mkdirSync(locDir, { recursive: true });
    writeFileSync(join(locDir, "sitemap.xml"), buildUrlset(locEntries), "utf8");
    console.log(`[gen-sitemap] ${locEntries.length} URLs -> dist/${loc}/sitemap.xml`);
  }
}

// 3. Write sitemap-index.xml
const indexSitemaps = [
  `${ORIGIN}/sitemap.xml`,
  ...locales.map((l) => `${ORIGIN}/${l}/sitemap.xml`),
];
const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexSitemaps
  .map(
    (loc) => `  <sitemap>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
  </sitemap>`,
  )
  .join("\n")}
</sitemapindex>
`;
writeFileSync(join(DIST, "sitemap-index.xml"), sitemapIndexXml, "utf8");

// 4. Write RSS 2.0 feeds for Naver Search Advisor and Google Feed discovery
function buildRss(title, link, description, lang, items) {
  const pubDate = new Date().toUTCString();
  const rssItems = items
    .slice(0, 50)
    .map((p) => {
      const loc = p.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${p.path}`;
      return `    <item>
      <title>${esc(p.title)}</title>
      <link>${esc(loc)}</link>
      <description>${esc(p.description)}</description>
      <guid>${esc(loc)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${esc(title)}</title>
    <link>${esc(link)}</link>
    <description>${esc(description)}</description>
    <language>${esc(lang)}</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
${rssItems}
  </channel>
</rss>
`;
}

// Global RSS
writeFileSync(join(DIST, "rss.xml"), buildRss("InstaCalc - Free Online Calculators", `${ORIGIN}/`, "Smart financial, mathematics, time and construction calculators", "en-IN", entries), "utf8");
console.log(`[gen-sitemap] wrote dist/rss.xml`);

// Korean RSS for Naver Search Advisor
const koEntries = entries.filter((p) => p.locale === "ko" || p.path.startsWith("/ko/"));
if (koEntries.length > 0) {
  const koDir = join(DIST, "ko");
  if (!existsSync(koDir)) mkdirSync(koDir, { recursive: true });
  writeFileSync(join(koDir, "rss.xml"), buildRss("InstaCalc 대한민국 - 온라인 계산기", `${ORIGIN}/ko/`, "무료 온라인 계산기 및 표준 단위 변환기", "ko-KR", koEntries), "utf8");
  console.log(`[gen-sitemap] wrote dist/ko/rss.xml for Naver Search Advisor`);
}

const legacyCount = lastmod.size;
console.log(`[gen-sitemap] ${entries.length} indexable URLs -> dist/sitemap.xml`);
console.log(`[gen-sitemap] wrote dist/sitemap-index.xml with ${indexSitemaps.length} regional sitemaps`);
console.log(`[gen-sitemap] (legacy sitemap had ${legacyCount}; ${Object.keys(seo.pages).length - entries.length} duplicates excluded as noindex)`);
