/**
 * Catches a class whose styles are structurally overridden — the one CSS
 * specificity bug that actually shipped here.
 *
 * The pattern: markup uses a BEM-ish pair, `<ul class="quick-links">` holding
 * `<a class="quick-link">`, and the stylesheet styles the CHILD via
 * `.quick-links a` instead of `.quick-link`. The element selector wins on
 * specificity (0,1,1 vs 0,1,0) regardless of source order, so the child class
 * rule is silently dead for every property they share.
 *
 * Only flags a class when BOTH are true, which makes it precise rather than a
 * noisy lint:
 *   1. a rule exists for the exact class `.quick-link`, AND
 *   2. a selector `<ancestor-with-plural-class> <bare element>` exists whose
 *      ancestor class is the plural of that class.
 * A bare `.container a` or `.prose p` with no matching singular class rule is
 * legitimate and ignored.
 *
 * Run: node scripts/check-css-override.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const SRC = join(ROOT, "src/styles");

const css = readdirSync(SRC)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(SRC, f), "utf8"))
  .join("\n")
  // Strip comments: they sit between a rule's closing brace and the next
  // selector, and would otherwise be glued onto the following selector so it
  // never matches an exact comparison.
  .replace(/\/\*[\s\S]*?\*\//g, "");

// Every selector in the stylesheet, comma-split.
const selectors = new Set();
const re = /(^|[};])([^{}@]+)\{/g;
let m;
while ((m = re.exec(css)) !== null) {
  for (const raw of m[2].split(",")) {
    const sel = raw.trim().replace(/\s+/g, " ");
    if (sel) selectors.add(sel);
  }
}

const specificity = (sel) => {
  const ids = (sel.match(/#[\w-]+/g) ?? []).length;
  const classes =
    (sel.match(/\.[\w-]+/g) ?? []).length +
    (sel.match(/\[[^\]]+\]/g) ?? []).length +
    (sel.match(/:(?!:)[\w-]+/g) ?? []).length;
  const types = (sel.match(/(^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return ids * 100 + classes * 10 + types;
};

const findings = [];

for (const sel of selectors) {
  // Must be "<plural-class> <bare-element>".
  const mm = sel.match(/^\.([\w-]+) ([a-z][\w-]*)$/);
  if (!mm) continue;
  const [, pluralCls, element] = mm;

  const singular = pluralCls.replace(/s$/, "");
  if (singular === pluralCls) continue; // not plural; skip

  const childRule = `.${singular}`;
  if (!selectors.has(childRule)) continue; // no competing class rule

  // Only a real conflict when the element selector actually outranks it.
  if (specificity(sel) > specificity(childRule)) {
    findings.push({ sel, childRule, pluralCls, singular });
  }
}

if (findings.length === 0) {
  console.log(
    "[override] PASS — no child class silently overridden by an ancestor element selector.",
  );
  process.exit(0);
}

console.error(`[override] ${findings.length} class rule(s) silently overridden:\n`);
for (const f of findings) {
  console.error(
    `  "${f.childRule}" is defeated by "${f.sel}" (${specificity(f.sel)} > ${specificity(f.childRule)})`,
  );
  console.error(
    `    markup pairs .${f.pluralCls} with .${f.singular}; style the child via .${f.singular}`,
  );
}
process.exit(1);
