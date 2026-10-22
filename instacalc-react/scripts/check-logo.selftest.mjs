/**
 * Self-test for check-logo.mjs.
 *
 * Reinstates the original defect (no `.brand img` rule, so a 500x500 logo.png
 * renders at intrinsic size) and asserts the check FAILS.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = join(ROOT, "scripts/check-logo.mjs");
const CSS = join(ROOT, "src/styles/app.css");
const HEADER = join(ROOT, "src/components/layout/SiteHeader.tsx");

function runCheck() {
  try {
    execFileSync(process.execPath, [CHECK], { stdio: "pipe" });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

const cssOrig = readFileSync(CSS, "utf8");
const headerOrig = readFileSync(HEADER, "utf8");

const base = runCheck();
if (base !== 0) {
  console.error(`[self-test] FAIL — clean tree should pass, got exit ${base}`);
  process.exit(1);
}

const CASES = [
  {
    name: "`.brand img` rule deleted (the original bug)",
    restore: () => writeFileSync(CSS, cssOrig, "utf8"),
    apply: () =>
      writeFileSync(
        CSS,
        cssOrig.replace(/\.brand img\s*\{[^}]*\}/, ""),
        "utf8",
      ),
    landed: () => !/\.brand img\s*\{/.test(readFileSync(CSS, "utf8")),
  },
  {
    name: "logo sized to 120px instead of 38px",
    restore: () => writeFileSync(CSS, cssOrig, "utf8"),
    // Line-ending agnostic: the source uses CRLF, so a literal \n would not match.
    apply: () =>
      writeFileSync(
        CSS,
        cssOrig.replace(/(width:\s*)38px(\s*;[\s\S]{0,40}?height:\s*)38px/, "$1120px$2120px"),
        "utf8",
      ),
    landed: () => /width:\s*120px/.test(readFileSync(CSS, "utf8")),
  },
  {
    name: "img width/height attributes disagree with the CSS",
    restore: () => writeFileSync(HEADER, headerOrig, "utf8"),
    apply: () =>
      writeFileSync(HEADER, headerOrig.replace("width={38}", "width={132}"), "utf8"),
    landed: () => /width=\{132\}/.test(readFileSync(HEADER, "utf8")),
  },
  {
    name: "brand label reverted to short SITE.name",
    restore: () => writeFileSync(HEADER, headerOrig, "utf8"),
    apply: () =>
      writeFileSync(
        HEADER,
        headerOrig.replace(/{SITE.displayName}/, "{SITE.name}"),
        "utf8",
      ),
    landed: () => !readFileSync(HEADER, "utf8").includes("SITE.displayName"),
  },
];

let failed = false;

try {
  for (const c of CASES) {
    c.apply();
    if (!c.landed()) {
      console.error(`[self-test] SKIP ${c.name} — mutation did not land`);
      failed = true;
      c.restore();
      continue;
    }
    const status = runCheck();
    c.restore();

    if (status === 0) {
      console.error(`[self-test] FAIL — ${c.name} was not detected.`);
      failed = true;
    } else {
      console.log(`[self-test] ok — ${c.name}`);
    }
  }
} finally {
  writeFileSync(CSS, cssOrig, "utf8");
  writeFileSync(HEADER, headerOrig, "utf8");
}

if (failed) process.exit(1);
console.log("[self-test] PASS");
