/**
 * Per-page SEO audit against the real build output.
 *
 * The link/asset audit (`audit-site.mjs`) only proves nothing 404s. This checks
 * the things a crawler actually ranks on, page by page, against the HTML that
 * would ship — not against the SEO dataset, because the dataset can be perfect
 * while the template drops a tag on the floor.
 *
 * Rules are split into FAIL (a crawl error, or something that actively hurts
 * ranking) and WARN (a soft signal worth knowing about).
 *
 * Run: node scripts/audit-seo.mjs   (requires dist/ — run `npm run build` first)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const ORIGIN = "https://instacalc.in";

/** `/us/` and `/ja/` serve English and Japanese respectively. */
const LANG_OF = { en: "en", us: "en", ja: "ja", ru: "ru", ko: "ko" };

/** Recursively collect every .html file under dist. */
function htmlFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) out.push(...htmlFiles(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

/** All `<meta name|property=... content=...>` values, keyed by lowercased name. */
function metas(html, attr) {
  const map = new Map();
  const re = new RegExp(`<meta\\s+${attr}="([^"]+)"\\s+content="([^"]*)"`, "gi");
  for (const m of html.matchAll(re)) map.set(m[1].toLowerCase(), m[2]);
  return map;
}

/** hrefs of every `<link rel="...">`, since rel can repeat. */
function linkHrefs(html, rel) {
  const re = new RegExp(`<link\\s+rel="${rel}"\\s+href="([^"]*)"`, "gi");
  return [...html.matchAll(re)].map((m) => m[1]);
}

/** First `<tag ... name="...">` attribute value. */
function attr(html, tag, name) {
  const m = html.match(new RegExp(`<${tag}\\s[^>]*${name}="([^"]*)"`, "i"));
  return m ? m[1] : null;
}

/** Decode the entities that appear in head values, so lengths are honest. */
function decode(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Group rows by rule for a compact report. */
function byRule(rows) {
  const m = new Map();
  for (const r of rows) m.set(r.rule, [...(m.get(r.rule) ?? []), r]);
  return m;
}

function report(label, rows, limit = 8) {
  if (!rows.length) return;
  console.log(`\n${label} (${rows.length}):\n`);
  for (const [rule, list] of byRule(rows)) {
    console.log(`  ${rule}  (${list.length})`);
    for (const r of list.slice(0, limit)) console.log(`    ${r.page}  — ${r.msg}`);
    if (list.length > limit) console.log(`    ... and ${list.length - limit} more`);
  }
}


const files = htmlFiles(DIST);
const fails = [];
const warns = [];
const seenTitle = new Map();
const seenDesc = new Map();

for (const file of files) {
  const rel = relative(DIST, file).split(sep).join("/");
  const page = rel === "index.html" ? "/" : `/${rel}`;
  if (page === "/404.html") continue;
  const html = readFileSync(file, "utf8");
  const headEnd = html.indexOf("</head>");
  const head = headEnd < 0 ? html : html.slice(0, headEnd + 7);
  const body = headEnd < 0 ? "" : html.slice(headEnd);

  const fail = (rule, msg) => fails.push({ page, rule, msg });
  const warn = (rule, msg) => warns.push({ page, rule, msg });

  // Expected language from the path, so `lang` has something to be checked
  // against rather than merely being present.
  const seg = page.split("/").filter(Boolean)[0] ?? "";
  const expectedLang = LANG_OF[seg] ?? "en";

  const titleMatch = head.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decode(titleMatch[1].trim()) : "";
  if (!title) fail("title", "missing <title>");
  else {
    if (title.length > 65) warn("title", `${title.length} chars — Google truncates around 60`);
    if (title.length < 15) warn("title", `only ${title.length} chars`);
    if (seenTitle.has(title)) warn("title", `duplicate of ${seenTitle.get(title)}`);
    else seenTitle.set(title, page);
  }

  const desc = metas(head, "name").get("description");
  if (!desc) fail("description", "missing meta description");
  else {
    const d = decode(desc);
    if (d.length > 170) warn("description", `${d.length} chars — truncates around 160`);
    if (d.length < 50) warn("description", `only ${d.length} chars`);
    if (seenDesc.has(d)) warn("description", `duplicate of ${seenDesc.get(d)}`);
    else seenDesc.set(d, page);
  }

  // Canonical: absolute, and pointing at its own URL.
  const canon = linkHrefs(head, "canonical")[0];
  if (!canon) fail("canonical", "missing <link rel=canonical>");
  else if (!canon.startsWith(`${ORIGIN}/`)) fail("canonical", `not absolute on ${ORIGIN}: ${canon}`);
  else if (canon !== `${ORIGIN}${page}`) {
    fail("canonical", `points at ${canon}, expected ${ORIGIN}${page}`);
  }

  // hreflang cluster: present, absolute, self-consistent.
  const alternates = [
    ...head.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]*)"/gi),
  ];
  if (alternates.length === 0) fail("hreflang", "no hreflang alternates");
  const langs = alternates.map((m) => m[1].toLowerCase());
  if (alternates.length && !langs.includes("x-default")) fail("hreflang", "cluster has no x-default");
  for (const m of alternates) {
    if (!m[2].startsWith("https://")) fail("hreflang", `relative alternate: ${m[2]}`);
  }
  if (canon && alternates.length && !alternates.some((m) => m[2] === canon)) {
    fail("hreflang", `cluster omits its own canonical ${canon}`);
  }

  const prop = metas(head, "property");
  for (const k of ["og:title", "og:description", "og:image", "og:type", "og:url", "og:site_name"]) {
    if (!prop.get(k)) fail("opengraph", `missing ${k}`);
  }
  if (canon && prop.get("og:url") && prop.get("og:url") !== canon) {
    fail("opengraph", `og:url ${prop.get("og:url")} disagrees with canonical ${canon}`);
  }
  for (const k of ["og:image", "og:url"]) {
    const v = prop.get(k);
    if (v && !v.startsWith("https://")) fail("opengraph", `${k} is not absolute: ${v}`);
  }
  if (!prop.get("og:locale")) warn("opengraph", "missing og:locale");

  if (!metas(head, "name").get("twitter:card")) fail("twitter", "missing twitter:card");

  const robots = metas(head, "name").get("robots");
  if (!robots) fail("robots", "missing robots meta");
  else if (/noindex/i.test(robots)) fail("robots", `explicitly noindex: ${robots}`);

  const lang = attr(head, "html", "lang");
  if (!lang) fail("lang", "<html> has no lang attribute");
  else if (lang.split("-")[0].toLowerCase() !== expectedLang) {
    fail("lang", `lang="${lang}" but the path implies "${expectedLang}"`);
  }

  if (!metas(head, "name").get("viewport")) fail("viewport", "missing viewport meta");
  if (!/<meta\s+charset=/i.test(head)) fail("charset", "missing charset meta");

  const blocks = [
    ...head.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi),
  ];
  if (blocks.length === 0) fail("jsonld", "no JSON-LD structured data");
  blocks.forEach((b, i) => {
    try {
      if (!JSON.parse(b[1])["@type"]) fail("jsonld", `block ${i + 1} has no @type`);
    } catch (e) {
      fail("jsonld", `block ${i + 1} is not valid JSON: ${e.message}`);
    }
  });

  const h1s = [...body.matchAll(/<h1\b/gi)];
  if (h1s.length === 0) fail("h1", "no <h1> in the body");
  else if (h1s.length > 1) fail("h1", `${h1s.length} <h1> elements (want exactly 1)`);

  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const undescribed = imgs.filter((t) => !/\salt=/i.test(t) && !/role="presentation"/i.test(t));
  if (undescribed.length) {
    fail("images", `${undescribed.length} <img> without alt or role="presentation"`);
  }

  const firstH2 = body.search(/<h2\b/i);

// ---------------------------------------------------------------- report ----
console.log(`\n[audit-seo] ${files.length} pages scanned against ${ORIGIN}\n`);

if (fails.length) {
  report("FAIL — crawl or ranking errors", fails);
} else {
  console.log("FAIL: none — every page meets the hard SEO requirements.");
}
report("WARN — soft signals", warns);

const dirty = new Set([...fails, ...warns].map((r) => r.page)).size;
console.log(
  `\n[audit-seo] ${files.length - dirty}/${files.length} pages fully clean; ` +
    `${fails.length} fail, ${warns.length} warn.`,
);

process.exit(fails.length ? 1 : 0);

  const firstH3 = body.search(/<h3\b/i);
  if (firstH3 >= 0 && (firstH2 < 0 || firstH3 < firstH2)) {
    warn("headings", "<h3> appears before any <h2>");
  }
}
