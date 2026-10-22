import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const US_DIR = join(DIST, "us");
const files = readdirSync(US_DIR).filter((f) => f.endsWith(".html"));
const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");

console.log(`AUDITING ${files.length} US PAGES IN dist/us/\n`);

const auditResults = [];

for (const file of files) {
  const path = "/us/" + (file === "index.html" ? "" : file);
  const html = readFileSync(join(US_DIR, file), "utf8");

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";

  // Description
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  const desc = descMatch ? descMatch[1] : "";

  // Canonical
  const canonMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
  const canonical = canonMatch ? canonMatch[1] : "";

  // Robots
  const robotsMatch = html.match(/<meta name="robots" content="([^"]*)"/);
  const robots = robotsMatch ? robotsMatch[1] : "";

  // Alternates
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => ({
    lang: m[1],
    href: m[2],
  }));

  // Open Graph
  const ogTitle = (html.match(/<meta property="og:title" content="([^"]*)"/) || [])[1];
  const ogDesc = (html.match(/<meta property="og:description" content="([^"]*)"/) || [])[1];
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]*)"/) || [])[1];
  const ogImg = (html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1];

  // Twitter
  const twCard = (html.match(/<meta name="twitter:card" content="([^"]*)"/) || [])[1];

  // H1
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  const rawH1 = h1Matches.length ? h1Matches[0][1].trim() : "";

  // JSON-LD
  const jsonLdScripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const schemas = [];
  let jsonLdValid = true;
  for (const s of jsonLdScripts) {
    try {
      schemas.push(JSON.parse(s[1]));
    } catch {
      jsonLdValid = false;
    }
  }

  // In sitemap?
  const inSitemap = sitemap.includes(`https://instacalc.in${path}`);

  // Issues and warnings
  const issues = [];
  const warnings = [];

  if (!title) issues.push("Missing <title>");
  else if (title.length < 30) warnings.push(`Short title (${title.length} chars)`);
  else if (title.length > 70) warnings.push(`Long title (${title.length} chars)`);

  if (!desc) issues.push("Missing meta description");
  else if (desc.length < 100) warnings.push(`Short description (${desc.length} chars)`);
  else if (desc.length > 170) warnings.push(`Long description (${desc.length} chars)`);

  const expectedCanonical = `https://instacalc.in${path}`;
  if (canonical !== expectedCanonical) {
    issues.push(`Canonical mismatch: got ${canonical}, expected ${expectedCanonical}`);
  }

  if (robots !== "index,follow") issues.push(`Robots is not index,follow: ${robots}`);

  if (!alts.some((a) => a.lang === "en-US")) warnings.push("Missing en-US hreflang alternate");
  if (!alts.some((a) => a.lang === "x-default")) warnings.push("Missing x-default hreflang alternate");

  if (!ogTitle || !ogDesc || !ogUrl || !ogImg) warnings.push("Incomplete OpenGraph tags");
  if (!twCard) warnings.push("Missing twitter:card");

  if (h1Matches.length !== 1) issues.push(`Found ${h1Matches.length} <h1> elements (expected 1)`);
  if (/<[a-z][\s\S]*>/i.test(rawH1)) warnings.push(`H1 contains raw HTML tags: ${rawH1}`);

  if (!jsonLdValid) issues.push("Invalid JSON-LD script syntax");
  if (schemas.length === 0) warnings.push("No JSON-LD schemas found");

  if (!inSitemap) issues.push("Missing from sitemap.xml");

  auditResults.push({
    file,
    path,
    title,
    desc,
    canonical,
    titleLen: title.length,
    descLen: desc.length,
    h1: rawH1.replace(/<[^>]+>/g, "").trim(),
    hasHtmlInH1: /<[a-z][\s\S]*>/i.test(rawH1),
    schemas: schemas.map((s) => s["@type"]).join(", "),
    alts: alts.map((a) => a.lang).join(", "),
    issues,
    warnings,
  });
}

console.log("File".padEnd(36) + " | Title | Desc | Schema Types".padEnd(38) + " | Issues / Warnings");
console.log("-".repeat(120));
for (const r of auditResults) {
  const status =
    (r.issues.length ? "ERR: " + r.issues.join("; ") : "") +
    (r.warnings.length ? " WARN: " + r.warnings.join("; ") : r.issues.length ? "" : "PERFECT");
  console.log(
    r.file.padEnd(36) +
      " | " +
      String(r.titleLen).padStart(5) +
      " | " +
      String(r.descLen).padStart(4) +
      " | " +
      r.schemas.padEnd(36) +
      " | " +
      status,
  );
}

const totalIssues = auditResults.reduce((sum, r) => sum + r.issues.length, 0);
const totalWarnings = auditResults.reduce((sum, r) => sum + r.warnings.length, 0);
console.log(`\nAudit completed: ${totalIssues} critical errors, ${totalWarnings} warnings across ${files.length} US pages.`);

console.log("\n" + "=".repeat(80));
console.log("DETAILED PAGE-BY-PAGE AUDIT REPORT:");
console.log("=".repeat(80));

for (const r of auditResults) {
  console.log(`\n📄 [${r.path}]`);
  console.log(`   Title (${r.titleLen} chars): "${r.title}"`);
  console.log(`   Description (${r.descLen} chars): "${r.desc}"`);
  console.log(`   H1: "${r.h1}"`);
  console.log(`   Canonical: ${r.canonical}`);
  console.log(`   Hreflangs: ${r.alts}`);
  console.log(`   Schemas: ${r.schemas}`);
  if (r.issues.length) console.log(`   ❌ Critical Issues: ${r.issues.join(", ")}`);
  if (r.warnings.length) console.log(`   ⚠️ Warnings: ${r.warnings.join(", ")}`);
}

