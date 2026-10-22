/**
 * Hypothesis: the design tokens in :root are not resolving, so every
 * `var(--ic-*)` declaration is invalid at computed-value time and silently
 * drops to its initial/inherited value. That produces exactly the symptom of
 * "unstyled": transparent backgrounds, zero gaps, missing borders, no radius,
 * no max-width.
 *
 * This verifies each custom property referenced anywhere in the stylesheet is
 * actually declared in a :root block.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const assetsDir = join(ROOT, "dist/assets");
const file = readdirSync(assetsDir).find((f) => f.endsWith(".css"));
const css = readFileSync(join(assetsDir, file), "utf8");

// Declared tokens: pull the :root block(s) and list custom property names.
const declared = new Set();
for (const m of css.matchAll(/:root\s*\{([^}]*)\}/g)) {
  for (const d of m[1].matchAll(/(--[\w-]+)\s*:/g)) declared.add(d[1]);
}

// Referenced tokens: every var() usage.
const referenced = new Map(); // name -> count
for (const m of css.matchAll(/var\(\s*(--[\w-]+)/g)) {
  referenced.set(m[1], (referenced.get(m[1]) ?? 0) + 1);
}

console.log(`[vars] :root declares ${declared.size} tokens`);
console.log(`[vars] stylesheet references ${referenced.size} distinct tokens\n`);

const missing = [...referenced.keys()].filter((t) => !declared.has(t));
if (missing.length === 0) {
  console.log("[vars] PASS — every referenced custom property is declared.");
} else {
  console.error(`[vars] FAIL — ${missing.length} referenced but NOT declared:`);
  for (const t of missing) console.error(`  ${t}  (used ${referenced.get(t)}x)`);
}

// Show the :root block verbatim so a malformed declaration is visible.
const first = css.match(/:root\s*\{[^}]*\}/);
let malformed = 0;
if (first) {
  const body = first[0];
  console.log(`\n[vars] :root block is ${body.length} chars`);
  // Look for the classic killers: a declaration without a value, or a value
  // that swallowed the following declarations.
  const decls = body.slice(6, -1).split(";");
  const bad = decls.filter((d) => d.trim() && !/^--[\w-]+\s*:\s*\S/.test(d.trim()));
  malformed = bad.length;
  if (bad.length) {
    console.error(`[vars] malformed declarations inside :root:`);
    for (const b of bad) console.error(`  ${JSON.stringify(b.trim())}`);
  }
}

process.exit(missing.length === 0 && malformed === 0 ? 0 : 1);
