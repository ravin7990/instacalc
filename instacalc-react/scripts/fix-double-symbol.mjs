/**
 * Removes the duplicated currency symbol from every calculator.
 *
 * Every calculator defined its formatter as
 *   const money = (v) => `${symbol(locale)}${formatWithUnits(locale, v)}`
 * but `formatWithUnits` already prefixes the symbol, so results rendered as
 * "₹₹43,391". Rewrites each to use the shared `money()` helper instead, and
 * reports any file it could not understand so it can be fixed by hand.
 *
 * Run: node scripts/fix-double-symbol.mjs [--check]
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CALC = join(ROOT, "src/calculators");
const CHECK_ONLY = process.argv.includes("--check");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".tsx") || full.endsWith(".ts")) out.push(full);
  }
  return out;
}

const changed = [];
const skipped = [];

for (const file of walk(CALC)) {
  const src = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length + 1);

  // Match both the locale-bound and seo.locale-bound variants of the helper.
  const decl =
    /const money = \(([a-zA-Z]+): number\) => `\$\{[a-zA-Z]+\}\$\{formatWithUnits\(([a-zA-Z.]+), \1\)\}`;/;
  const m = src.match(decl);
  if (!m) continue;

  const [, arg, localeExpr] = m;
  const next = src.replace(decl, `const money = (${arg}: number) => moneyFormat(${localeExpr}, ${arg});`);

  // Swap the import to bring in the shared helper as `moneyFormat`, so the
  // local `money` binding keeps its name and every call site is untouched.
  let out = next;
  if (/import \{([^}]*)\} from "@\/lib\/currency";/.test(out)) {
    out = out.replace(
      /import \{([^}]*)\} from "@\/lib\/currency";/,
      (full, names) => {
        const list = names
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
          .filter((n) => n !== "money");
        // Deduplicate while preserving order.
        const seen = new Set();
        const kept = list.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
        kept.push("money as moneyFormat");
        return `import { ${kept.join(", ")} } from "@/lib/currency";`;
      },
    );
  } else {
    skipped.push(`${rel} — no @/lib/currency import found`);
    continue;
  }

  changed.push(rel);
  if (!CHECK_ONLY) writeFileSync(file, out, "utf8");
}

if (skipped.length) {
  console.error(`[fix-symbol] ${skipped.length} file(s) need manual attention:`);
  for (const s of skipped) console.error(`  ${s}`);
}

console.log(
  `[fix-symbol] ${CHECK_ONLY ? "would update" : "updated"} ${changed.length} calculator(s)`,
);
for (const c of changed) console.log(`  ${CHECK_ONLY ? "would update" : "updated"} ${c}`);

process.exit(skipped.length ? 1 : 0);
