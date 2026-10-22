/**
 * check-parity.mjs — verifies the prerendered output against the legacy site.
 *
 * Guards the migration's core promise: no URL, title, description, canonical,
 * hreflang or JSON-LD may silently disappear during the React conversion.
 *
 * Run: node scripts/check-parity.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const LEGACY = join(ROOT, "..");

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));

const pick = (html, re) => (html.match(re) || [])[1]?.trim();

/**
 * The emitted HTML is entity-escaped, but `seo.generated.json` holds decoded
 * text (the extractor decodes entities when reading the legacy markup). Both
 * sides are normalised to decoded form before comparison.
 */
const decode = (s = "") =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

let failures = 0;
const fail = (msg) => {
  failures++;
  console.log(`  FAIL ${msg}`);
};

console.log("[check-parity] verifying prerendered output against the legacy site\n");

for (const [source, page] of Object.entries(seo.pages)) {
  // 404.html is an error page emitted with noindex, not a regular content page.
  if (page.path === "/404.html") continue;

  const rel =
    page.path === "/"
      ? "index.html"
      : page.path.endsWith("/")
        ? `${page.path}index.html`
        : page.path;
  const out = join(DIST, rel.replace(/^\//, ""));

  if (!existsSync(out)) {
    fail(`${page.path} — not emitted (${rel})`);
    continue;
  }

  const html = readFileSync(out, "utf8");
  const issues = [];

  const title = decode(pick(html, /<title>([\s\S]*?)<\/title>/) ?? "");
  if (title !== page.title) issues.push(`title mismatch: "${title}" != "${page.title}"`);

  const desc = decode(pick(html, /<meta name="description" content="([^"]*)"/) ?? "");
  if (desc !== page.description) issues.push(`description mismatch`);

  const canonical = pick(html, /<link rel="canonical" href="([^"]+)"/);
  const expectedCanonical = `https://instacalc.in${page.path === "/" ? "/" : page.path}`;
  if (canonical !== expectedCanonical) issues.push(`canonical "${canonical}" != "${expectedCanonical}"`);

  // Every legacy hreflang alternate must still be present.
  for (const alt of page.alternates ?? []) {
    if (!html.includes(`hreflang="${alt.hreflang}"`) || !html.includes(alt.href)) {
      issues.push(`missing hreflang ${alt.hreflang} -> ${alt.href}`);
    }
  }

  // Every legacy JSON-LD @type must survive.
  for (const j of page.jsonLd ?? []) {
    const types = j["@graph"]
      ? j["@graph"].map((g) => g["@type"]).filter(Boolean)
      : [j["@type"]].filter(Boolean);
    for (const t of types) {
      if (!html.includes(`"@type":"${t}"`)) issues.push(`missing JSON-LD ${t}`);
    }
  }

  // Prerendered body must contain real content, not a Suspense fallback.
  if (html.includes('class="page-loading"') || html.includes("Switched to client rendering")) {
    issues.push("body contains a Suspense fallback instead of content");
  }
  if (!/<h1[\s>]/.test(html)) issues.push("no <h1> in prerendered body");

  if (issues.length) {
    fail(`${page.path}`);
    for (const i of issues) console.log(`       - ${i}`);
  }
}

// --- sitemap parity -------------------------------------------------------
const legacyXml = readFileSync(join(LEGACY, "sitemap.xml"), "utf8");
const legacyLocs = [...legacyXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const newXml = readFileSync(join(DIST, "sitemap.xml"), "utf8");
const newLocs = new Set([...newXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

// `/foo/index.html` and `/foo/` are the same URL.
const norm = (u) => u.replace("https://instacalc.in/", "").replace(/index\.html$/, "");
const newNorm = new Set([...newLocs].map(norm));
const missing = legacyLocs.filter((l) => !newNorm.has(norm(l)));

console.log(`[check-parity] sitemap: ${legacyLocs.length} legacy URLs, ${newLocs.size} emitted`);
if (missing.length) {
  fail(`sitemap dropped ${missing.length} legacy URL(s):`);
  for (const m of missing) console.log(`       - ${m}`);
}

// --- required static files ------------------------------------------------
for (const f of ["robots.txt", "ads.txt", "app-ads.txt", "CNAME", "sitemap.xml", "404.html"]) {
  if (!existsSync(join(DIST, f))) fail(`missing ${f} in dist/`);
}

if (failures === 0) {
  console.log("\n[check-parity] PASS — all 118 pages match the legacy SEO surface.");
} else {
  console.log(`\n[check-parity] ${failures} check(s) failed.`);
  process.exitCode = 1;
}
