/**
 * Guards the calculator result layout.
 *
 * Two regressions motivated this:
 *   1. The headline figure had no prominent card, so every output carried equal
 *      visual weight. Every mainstream calculator (NerdWallet, Bankrate, Google)
 *      leads with one large number, per "Highlight the Main Result".
 *   2. There was no way to reset or copy the result, which NN/G calls out under
 *      "Facilitate Easy Input Adjustments and Restarts".
 *
 * Asserts each calculator page renders the headline, at least the controls, and
 * still renders results server-side.
 *
 * Run: node scripts/check-calc-layout.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");

// Pages that are not calculators (home, about, contact, policy, …).
const NON_CALC = new Set([
  "index.html", "aboutus.html", "contactus.html", "privacypolicy.html", "terms.html",
  "delete-account.html",
]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".html")) out.push(full);
  }
  return out;
}

const problems = [];
let checked = 0;

for (const file of walk(DIST)) {
  const rel = file.slice(DIST.length + 1);
  const name = rel.split(/[\\/]/).pop();
  if (NON_CALC.has(name)) continue;

  const html = readFileSync(file, "utf8");
  const body = html.slice(html.indexOf("<body>"));
  // Only pages using the shared calculator shell are in scope.
  if (!/class="calculator-shell"/.test(body)) continue;
  checked++;

  if (!/class="result-hero"/.test(body)) {
    problems.push(`${rel} — no prominent headline result (.result-hero)`);
  }
  if (!/class="calc-actions"/.test(body)) {
    problems.push(`${rel} — no copy/reset controls (.calc-actions)`);
  }
  if (!/class="calc-grid"/.test(body)) {
    problems.push(`${rel} — calculator two-column grid missing`);
  }
  // Inputs must stay server-rendered so the tool works without JS. Date-based
  // tools use <input type="date"> rather than a slider, so accept either.
  const hasControl =
    /type="range"/.test(body) ||
    /type="date"/.test(body) ||
    /type="time"/.test(body) ||
    /type="number"/.test(body) ||
    /<select[\s>]/.test(body);
  if (!hasControl) {
    problems.push(`${rel} — no form control in prerendered output`);
  }
}

if (problems.length === 0) {
  console.log(
    `[calc-layout] PASS — ${checked} calculator page(s) lead with a headline result ` +
      `and offer copy/reset.`,
  );
  process.exit(0);
}

// Tally which invariant is failing, so a large failure count is diagnosable
// rather than just a wall of file names.
const tally = new Map();
for (const p of problems) {
  const key = p.split(" — ")[1] ?? p;
  tally.set(key, (tally.get(key) ?? 0) + 1);
}
console.error(`[calc-layout] FAIL — ${problems.length} problem(s) across ${checked} page(s):`);
for (const [reason, n] of [...tally].sort((a, b) => b[1] - a[1])) {
  console.error(`  ${n}x  ${reason}`);
}
console.error("\nfirst few files:");
for (const p of problems.slice(0, 8)) console.error(`  ${p}`);
process.exit(1);
process.exit(1);

