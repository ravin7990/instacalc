/**
 * Compares the markup of a React calculator page against the legacy static page
 * it replaced, class by class.
 *
 * This is how the layout regression was found: the legacy pages shipped a
 * prominent hero result, a copy-summary action and a reset control, and the
 * React rewrite dropped all three while every SEO and unit test still passed.
 *
 * Usage: node scripts/compare-calc-page.mjs [reactPage] [legacyPage]
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const LEGACY_ROOT = join(import.meta.dirname, "..", "..");
const DIST = join(import.meta.dirname, "..", "dist");

const reactPage = process.argv[2] ?? "emicalculator.html";
const legacyPage = process.argv[3] ?? reactPage;

/** Classes that are structural scaffolding rather than calculator features. */
const IGNORE = new Set([
  "container", "section", "sr-only", "page-loading", "skip-link", "ic", "eyebrow",
]);

const classesOf = (file) => {
  const html = readFileSync(file, "utf8");
  const body = html.slice(html.indexOf("<body>"));
  const found = new Set();
  for (const m of body.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].trim().split(/\s+/)) {
      if (c && !IGNORE.has(c)) found.add(c);
    }
  }
  return found;
};

const reactFile = join(DIST, reactPage);
const legacyFile = join(LEGACY_ROOT, legacyPage);

if (!existsSync(reactFile)) {
  console.error(`[compare] missing React page: ${reactFile}`);
  process.exit(1);
}
if (!existsSync(legacyFile)) {
  console.error(`[compare] missing legacy page: ${legacyFile}`);
  process.exit(1);
}

const react = classesOf(reactFile);
const legacy = classesOf(legacyFile);

const dropped = [...legacy].filter((c) => !react.has(c)).sort();
const added = [...react].filter((c) => !legacy.has(c)).sort();

console.log(`[compare] ${reactPage}`);
console.log(`[compare] legacy classes: ${legacy.size}   react classes: ${react.size}\n`);

console.log(`[compare] DROPPED from legacy (${dropped.length}):`);
for (const c of dropped) console.log(`  - ${c}`);

console.log(`\n[compare] NEW in react (${added.length}):`);
for (const c of added) console.log(`  + ${c}`);

// Feature markers worth calling out explicitly, because their absence is what
// makes a calculator feel unfinished rather than fast.
const FEATURES = [
  ["hero-result-card", "prominent headline result"],
  ["res-val", "hero result value"],
  ["quick-copy-btn", "copy result from the headline"],
  ["calculator-actions", "action row (copy / reset)"],
  ["resetBtn", "reset to defaults"],
  ["copySummaryBtn", "copy full summary"],
  ["result-grid", "grid of result tiles"],
  ["result-card", "individual result tile"],
  ["chart-card", "chart panel"],
  ["chart-wrap", "chart container"],
  ["downloadCsvBtn", "CSV download"],
  ["faq-card", "FAQ / explainer"],
  ["related-tools", "related tool links"],
];

const missingFeatures = FEATURES.filter(([cls]) => legacy.has(cls) && !react.has(cls));
if (missingFeatures.length) {
  console.log(`\n[compare] FEATURE GAPS vs legacy (${missingFeatures.length}):`);
  for (const [cls, what] of missingFeatures) console.log(`  ! ${cls} — ${what}`);
}
