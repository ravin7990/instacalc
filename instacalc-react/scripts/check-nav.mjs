/**
 * Structural checks for the site header and footer.
 *
 * The missing-brace defect that left the whole page unstyled lived in the
 * header/footer region of the stylesheet, and `.site-nav`'s `display` ended up
 * toggled in three separate places so the mobile drawer stopped hiding. These
 * checks keep both invariants.
 *
 *  1. The header and footer nav landmarks must both have an accessible name.
 *  2. aria-controls must point at an element that actually exists.
 *  3. `.site-nav` display must not be declared in more than one place per
 *     breakpoint (base / >=768 / <=767) — scattered toggles are what broke it.
 *
 * Run: node scripts/check-nav.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const HEADER = join(ROOT, "src/components/layout/SiteHeader.tsx");
const FOOTER = join(ROOT, "src/components/layout/SiteFooter.tsx");
const CSS = join(ROOT, "src/styles/app.css");

const problems = [];

const header = readFileSync(HEADER, "utf8");
const footer = readFileSync(FOOTER, "utf8");
const css = readFileSync(CSS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

// 1. Both <nav> landmarks need an accessible name.
const navTags = [...`${header}\n${footer}`.matchAll(/<nav\b([\s\S]*?)>/g)];
if (navTags.length < 2) {
  problems.push(`expected 2 <nav> landmarks, found ${navTags.length}`);
}
navTags.forEach((m, i) => {
  const attrs = m[1];
  const hasLabel = /aria-label\s*=/.test(attrs);
  if (!hasLabel) problems.push(`nav #${i + 1} has no aria-label (unlabelled landmark)`);
});

// 2. aria-controls must resolve.
for (const m of header.matchAll(/aria-controls\s*=\s*"([^"]+)"/g)) {
  const id = m[1];
  if (!new RegExp(`id\\s*=\\s*"${id}"`).test(header)) {
    problems.push(`aria-controls="${id}" has no matching element`);
  }
}

// 3. `.site-nav` display declarations must be one per breakpoint.
//
// Walk the stylesheet tracking the enclosing @media condition properly: a
// naive "look backwards for @media" is wrong because a rule AFTER a closed
// media block still sees that block's text. So brace depth is tracked and the
// condition is reset whenever an at-rule closes.
const displayDecls = [];
{
  /** Parse a block of CSS, collecting exact `.site-nav` display declarations. */
  function scan(source, cond, out) {
    let i = 0;
    let buf = "";
    while (i < source.length) {
      const ch = source[i];
      if (ch === "{") {
        const prelude = buf.trim();
        buf = "";
        const inner = readBlock(source, i);
        if (prelude.startsWith("@media")) {
          scan(inner.body, prelude.replace(/\s+/g, " "), out);
        } else if (prelude.startsWith("@")) {
          // @supports / @layer: treat as the same condition.
          scan(inner.body, prelude.replace(/\s+/g, " "), out);
        } else if (prelude.replace(/\s+/g, " ") === ".site-nav") {
          const disp = inner.body.match(/(^|;)\s*display\s*:\s*([^;]+)/);
          if (disp) out.push({ cond, value: disp[2].trim() });
        }
        i = inner.end + 1;
        buf = "";
        continue;
      }
      if (ch === "}") {
        // Unbalanced at this level; stop rather than mis-tracking.
        break;
      }
      buf += ch;
      i++;
    }
  }

  /** Read the balanced block starting at the given "{", returning body + end index. */
  function readBlock(source, openIdx) {
    let d = 0;
    let i = openIdx;
    for (; i < source.length; i++) {
      if (source[i] === "{") d++;
      else if (source[i] === "}") {
        d--;
        if (d === 0) return { body: source.slice(openIdx + 1, i), end: i };
      }
    }
    return { body: source.slice(openIdx + 1), end: source.length - 1 };
  }

  scan(css, "(base)", displayDecls);
}

const byCondition = new Map();
for (const d of displayDecls) {
  byCondition.set(d.cond, [...(byCondition.get(d.cond) ?? []), d.value]);
}
for (const [cond, values] of byCondition) {
  if (values.length > 1) {
    problems.push(
      `${cond}: .site-nav display declared ${values.length}x (${values.join(", ")}) — ` +
        `keep exactly one per breakpoint`,
    );
  }
}
if (byCondition.size === 0) {
  problems.push("could not locate any .site-nav display rule");
}

// The closed drawer must exist for <=767px, otherwise the nav is always open.
if (!/\.site-nav:not\(\.open\)\s*\{\s*display:\s*none/.test(css)) {
  problems.push(
    "missing `.site-nav:not(.open) { display: none }` — the mobile drawer would never hide",
  );
}

if (problems.length === 0) {
  console.log("[nav-check] PASS — header/footer landmarks, ids and drawer toggle are sound.");
  process.exit(0);
}

console.error(`[nav-check] FAIL — ${problems.length} problem(s):\n`);
for (const p of problems) console.error(`  ${p}`);
process.exit(1);
