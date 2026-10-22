/**
 * Audits class usage in the React tree against the stylesheet.
 *
 * The rewrite dropped ~147 legacy CSS classes. When a component still emits a
 * class that no longer exists in app.css, it silently renders unstyled — which
 * is how the results column lost its card and the whole page started reading as
 * "scattered" rather than polished. This check makes that class of bug loud.
 *
 * Run: node scripts/check-css-coverage.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

/**
 * "primary"/"ghost" appear here only as the default inside `btn-${variant}`;
 * the resulting concrete class (.btn-primary / .btn-ghost) is checked instead.
 */
const SKIP = new Set(["sr-only", "active", "hidden", "primary"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx$/.test(entry)) out.push(full);
  }
  return out;
}

/** Collect literal classNames plus the literal branches of template strings. */
function collectClasses(markup, into) {
  // className="a b c"
  for (const m of markup.matchAll(/className="([^"{}]+)"/g)) {
    for (const cls of m[1].trim().split(/\s+/)) if (cls) into.add(cls);
  }
  // className={`base ${cond ? "on" : "off"}`} — take the quoted branches only
  for (const m of markup.matchAll(/className=\{`([^`]*)`\}/g)) {
    for (const q of m[1].matchAll(/"([^"]*)"/g)) {
      for (const cls of q[1].trim().split(/\s+/)) if (cls) into.add(cls);
    }
  }
}

const css = [join(SRC, "styles/app.css"), join(SRC, "styles/tokens.css")]
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const used = new Map(); // class -> first file that references it
for (const file of walk(SRC)) {
  const markup = readFileSync(file, "utf8");
  const found = new Set();
  collectClasses(markup, found);
  for (const cls of found) {
    if (SKIP.has(cls)) continue;
    if (!used.has(cls)) used.set(cls, file.slice(ROOT.length + 1));
  }
}

const missing = [];
for (const [cls, file] of used) {
  // Match the class as a whole selector, not as a prefix of a longer one.
  const re = new RegExp(`\\.${cls.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(?![\\w-])`);
  if (!re.test(css)) missing.push({ cls, file });
}

if (missing.length === 0) {
  console.log(`[css] PASS — all ${used.size} classes used in components are styled.`);
  process.exit(0);
}

console.error(`[css] FAIL — ${missing.length} class(es) used but never styled:\n`);
for (const { cls, file } of missing) {
  console.error(`  .${cls}  (used in ${file})`);
}
console.error("\nEach of these renders unstyled. Add the rule, or drop the class from the markup.");
process.exit(1);
