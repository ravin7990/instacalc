/**
 * Guards against the currency symbol being rendered twice.
 *
 * Every calculator originally formatted money as
 * `${symbol(locale)}${formatWithUnits(locale, v)}`, but `formatWithUnits`
 * already prefixes the symbol, so every rupee/dollar figure on the site read
 * "₹₹43,391". Engines and unit tests never caught it because they return bare
 * numbers, so only the rendered output exposes it.
 *
 * This scans the BUILT pages for a repeated symbol.
 *
 * Run: node scripts/check-currency.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = join(import.meta.dirname, "..", "dist");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".html")) out.push(full);
  }
  return out;
}

// Any currency glyph appearing twice in a row, e.g. "₹₹" or "$$".
const DOUBLE = /(₹|\$|¥|€|£|₩|₽|₪|₫|฿)\1(?:\d|[\d.,])/g;

const problems = [];
let scanned = 0;

for (const file of walk(DIST)) {
  const html = readFileSync(file, "utf8");
  const body = html.slice(html.indexOf("<body>"));
  if (!body) continue;
  scanned++;

  const hits = [...body.matchAll(DOUBLE)];
  if (hits.length) {
    const sample = [...new Set(hits.map((h) => h[0]))].slice(0, 4);
    problems.push(
      `${file.slice(DIST.length + 1)} — ${hits.length} doubled symbol(s): ${sample.join(", ")}`,
    );
  }
}

if (problems.length === 0) {
  console.log(`[currency] PASS — no doubled currency symbols across ${scanned} page(s).`);
  process.exit(0);
}

console.error(`[currency] FAIL — ${problems.length} page(s) render a doubled symbol:\n`);
for (const p of problems.slice(0, 20)) console.error(`  ${p}`);
if (problems.length > 20) console.error(`  …and ${problems.length - 20} more`);
console.error(
  "\nformatWithUnits() already includes the symbol. Do not prepend another —\n" +
    "use the shared money() helper from @/lib/currency.",
);
process.exit(1);
