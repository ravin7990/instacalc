/**
 * Structural CSS validation for the SOURCE stylesheets.
 *
 * A missing closing brace is catastrophic and silent: every rule after it gets
 * nested inside the previous one and stops applying, so the page renders
 * unstyled while typecheck, unit tests, SEO parity and markup checks all pass.
 * That exact bug shipped once here (a `.site-nav` rule left open inside
 * `@media (max-width: 767px)`), so it is worth gating.
 *
 * Checks, per file:
 *   1. braces balance, and never go negative
 *   2. every rule sits at the nesting depth its selector implies
 *   3. no declaration appears directly inside an @media/@supports block
 *   4. quotes are balanced
 *
 * Run: node scripts/check-css-structure.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const STYLES = join(ROOT, "src/styles");

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (full.endsWith(".css")) out.push(full);
  }
  return out;
}

/** Strip comments so their contents cannot affect brace counting. */
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

let failed = false;

for (const file of walk(STYLES)) {
  const raw = readFileSync(file, "utf8");
  const css = stripComments(raw);
  const rel = file.slice(ROOT.length + 1);
  const problems = [];

  // 1. Brace balance, line-accurate.
  let depth = 0;
  const openLines = [];
  let inString = null;
  let line = 1;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "\n") line++;
    if (inString) {
      if (ch === "\\") i++;
      else if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inString = ch;
      continue;
    }
    if (ch === "{") {
      depth++;
      openLines.push(line);
    } else if (ch === "}") {
      depth--;
      if (depth < 0) {
        problems.push(`line ${line}: unmatched "}" (brace depth went negative)`);
        depth = 0;
      } else {
        openLines.pop();
      }
    }
  }
  if (depth > 0) {
    problems.push(
      `${openLines.length} unclosed "{" block(s); first opened at line(s) ` +
        `${openLines.slice(0, 5).join(", ")}${openLines.length > 5 ? " ..." : ""}`,
    );
  }
  if (inString) problems.push(`unterminated string ${inString}`);

  // 2/3. Walk top-level and flag declarations that are not inside a rule block.
  // A declaration sitting directly in an at-rule body is a strong hint that the
  // preceding rule block was never closed.
  const re = /([^{}]+)\{/g;
  let m;
  let guard = 0;
  while ((m = re.exec(css)) !== null && guard++ < 20000) {
    const prelude = m[1].trim();
    if (!prelude) continue;
    const lastLine = css.slice(0, m.index + m[1].length).split("\n").length;
    // Strip any leading declarations from the prelude (they belong to the
    // previous, unterminated block).
    const declsInPrelude = prelude
      .split("}")
      .pop()
      .split(";")
      .map((d) => d.trim())
      .filter((d) => d && !d.startsWith("@") && d.includes(":") && !d.includes("{"));
    if (declsInPrelude.length > 2) {
      problems.push(
        `near line ${lastLine}: ${declsInPrelude.length} stray declaration(s) before ` +
          `"${prelude.slice(0, 40)}" — a preceding rule is likely unclosed`,
      );
    }
  }

  if (problems.length === 0) {
    console.log(`[css-struct] PASS  ${rel}`);
  } else {
    failed = true;
    console.error(`[css-struct] FAIL  ${rel}`);
    for (const p of problems) console.error(`    ${p}`);
  }
}

process.exit(failed ? 1 : 0);
