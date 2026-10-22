/**
 * Guards against the headline result being rendered twice.
 *
 * The calculator shell draws one prominent headline (.result-hero) from the
 * `summary` prop. Several calculators also listed that same figure as the first
 * emphasised row of their results list, so visitors saw the identical number
 * twice in a row — once large, once boxed. On the age calculator this read as
 * "EXACT AGE 25y 0m 0d" immediately above "Exact Age / 25 Years, 0 Months, 0 Days".
 *
 * This asserts the headline's label never reappears among the supporting tiles
 * or key/value rows on the same page.
 *
 * Run: node scripts/check-result-duplication.mjs
 */
import { readdirSync, statSync, readFileSync } from "node:fs";
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

/** Visible text of an element's inner HTML, with entities resolved enough to compare. */
const text = (html) =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .trim();

const problems = [];
let checked = 0;

// The hero/pill overlap is resolved at runtime, so the shipped bundle — not the
// prerendered HTML — is what proves the pill can be hidden at all. Assert the
// suppression class name survives the build into the client assets.
const assets = join(DIST, "assets");
const bundles = statSync(assets).isDirectory()
  ? readdirSync(assets).filter((f) => f.endsWith(".js"))
  : [];
const js = bundles.map((f) => readFileSync(join(assets, f), "utf8")).join("\n");
if (!js.includes("is-suppressed")) {
  problems.push(
    "assets — the sticky mobile pill has no suppression path, so the headline is printed twice on mobile",
  );
}

for (const file of walk(DIST)) {
  const rel = file.slice(DIST.length + 1);
  const html = readFileSync(file, "utf8");

  const heroMatch = html.match(/class="result-hero-label"[^>]*>([\s\S]*?)<\/span>/);
  if (!heroMatch) continue;
  checked++;

  const hero = text(heroMatch[1]);
  if (!hero) continue;

  

  // Supporting tiles and definition rows are the two places a repeat would land.
  const supporting = [
    ...html.matchAll(/class="result-label"[^>]*>([\s\S]*?)<\/span>/g),
    ...html.matchAll(/class="kv-key"[^>]*>([\s\S]*?)<\/span>/g),
  ]
    .map((m) => text(m[1]))
    .filter(Boolean);

  if (supporting.includes(hero)) {
    problems.push(`${rel} — headline "${hero}" is repeated in the results list`);
  }
}

if (problems.length === 0) {
  console.log(
    `[result-dup] PASS — ${checked} calculator page(s) show the headline result once.`,
  );
  process.exit(0);
}

console.error(`[result-dup] FAIL — ${problems.length} duplicated headline(s):`);
for (const p of problems) console.error(`  ${p}`);
process.exit(1);
