/**
 * Fails if an HTML entity is written inside JSX text.
 *
 * JSX children are not HTML — `&nearr;` renders as the literal string
 * "&nearr;" on the page instead of "≈". Neither tsc nor the test suite
 * catches this, so it is checked explicitly.
 *
 * Legitimate uses that this must NOT flag:
 *   - entities inside quoted attribute values (title="A &amp; B")
 *   - string literals in script/JSX expressions ({a && "x &amp; y"})
 *   - && / || operators
 *
 * Run: node scripts/check-entities.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

// Named entities that actually occur in UI copy. A bare `&` followed by these
// plus ";" in JSX text is always a bug.
const ENTITY = /&([a-zA-Z][a-zA-Z0-9]{1,9});/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

const findings = [];

for (const file of walk(SRC)) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    // Only consider text that is actually JSX children: skip full-line
    // comments, and skip anything inside a quoted attribute value.
    const code = line.replace(/\{[^{}]*\}/g, ""); // drop {...} expressions
    if (/^\s*(\/\/|\*|\/\*)/.test(code)) return;
    const outsideAttrs = code.replace(/"[^"]*"/g, '""').replace(/'[^']*'/g, "''");
    for (const m of outsideAttrs.matchAll(ENTITY)) {
      findings.push({
        file: file.slice(ROOT.length + 1),
        line: i + 1,
        entity: m[0],
        text: line.trim(),
      });
    }
  });
}

if (findings.length === 0) {
  console.log("[entities] PASS — no raw HTML entities in JSX text.");
  process.exit(0);
}

console.error(`[entities] FAIL — ${findings.length} HTML entity/entities in JSX text:\n`);
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  ${f.entity}`);
  console.error(`    ${f.text}`);
}
console.error(
  "\nJSX does not decode HTML entities. Use the literal character (e.g. → ≈ ×)"
);
process.exit(1);
