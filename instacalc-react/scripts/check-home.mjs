/**
 * Verifies the redesigned homepage: search box, filter chips, result count and
 * that every tool link it renders actually exists in the build (a broken
 * library link is the worst possible regression on the front page).
 *
 * Run: node scripts/check-home.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const problems = [];

const PAGES = [
  ["dist/index.html", "/"],
  ["dist/us/index.html", "/us/"],
  ["dist/ja/index.html", "/ja/"],
  ["dist/ru/index.html", "/ru/"],
];

for (const [rel, base] of PAGES) {
  if (!existsSync(join(ROOT, rel))) continue;
  const full = readFileSync(join(ROOT, rel), "utf8");
  // Inspect only the BODY. The inlined <style> contains every class name, so
  // searching the whole document finds CSS rules and produces false hits.
  const html = full.slice(full.indexOf("<body>"));
  console.log(`\n== ${base}`);

  // Search: must be a real labelled input, present in the prerendered HTML so
  // it works before hydration and is visible to crawlers.
  const hasSearch = /class="hero-search-input"/.test(html);
  const searchLabel = /<label[^>]*for="tool-search"[^>]*class="sr-only"/.test(html);
  console.log(`   search input: ${hasSearch}  labelled: ${searchLabel}`);
  if (!hasSearch) problems.push(`${base} — hero search input missing`);
  if (!searchLabel) problems.push(`${base} — search input has no label`);

  // Filter chips: "All" plus at least one real category, each exposing its
  // pressed state. The en catalogue has 3 groups, so 4 chips is correct — do
  // not hard-code a count.
  const chips = [...html.matchAll(/<button[^>]*class="filter-chip"[^>]*>/g)];
  console.log(`   filter chips: ${chips.length}`);
  if (chips.length < 2) {
    problems.push(`${base} — expected category chips, found ${chips.length}`);
  }
  const withoutPressed = chips.filter((m) => !/aria-pressed=/.test(m[0]));
  if (withoutPressed.length) {
    problems.push(`${base} — ${withoutPressed.length} filter chip(s) missing aria-pressed`);
  }

  // Result count line so the visitor knows what they are looking at.
  const hasCount = /class="result-count"/.test(html);
  console.log(`   result count: ${hasCount}`);
  if (!hasCount) problems.push(`${base} — result count missing`);

  // Every tool card must link to a page we actually built.
  const cards = [...html.matchAll(/class="tool-card"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  console.log(`   tool cards: ${cards.length}`);
  if (cards.length === 0) problems.push(`${base} — no tool cards rendered`);

  const broken = [];
  for (const href of cards) {
    const target = new URL(href, `https://instacalc.in${base}`).pathname;
    if (!existsSync(join(ROOT, "dist", target.replace(/^\//, "")))) broken.push(target);
  }
  if (broken.length) {
    problems.push(
      `${base} — ${broken.length} tool card(s) link to missing pages: ` +
        `${[...new Set(broken)].slice(0, 5).join(", ")}`,
    );
  }
  console.log(`   broken links: ${broken.length}`);

  // The popular panel links must be valid too, not just the grid.
  const popular = [...html.matchAll(/class="quick-link"[^>]*href="([^"]+)"/g)].map((m) => m[1]);
  const brokenPopular = popular.filter((href) => {
    const target = new URL(href, `https://instacalc.in${base}`).pathname;
    return !existsSync(join(ROOT, "dist", target.replace(/^\//, "")));
  });
  if (brokenPopular.length) {
    problems.push(
      `${base} — ${brokenPopular.length} popular link(s) 404: ${brokenPopular.slice(0, 3).join(", ")}`,
    );
  }
  console.log(`   popular links: ${popular.length} (broken ${brokenPopular.length})`);

  // The old accordion markup should be gone, not merely hidden by CSS.
  if (/class="tool-group"/.test(html)) {
    problems.push(`${base} — legacy accordion markup still present`);
  }
}

if (problems.length === 0) {
  console.log("\n[home] PASS — search, filters and tool links are all sound.");
  process.exit(0);
}
console.error(`\n[home] FAIL — ${problems.length} problem(s):\n`);
for (const p of problems) console.error(`  ${p}`);
process.exit(1);
