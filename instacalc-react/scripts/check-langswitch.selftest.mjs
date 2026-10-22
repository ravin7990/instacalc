/**
 * Self-test for check-langswitch.mjs.
 *
 * Reinstates the depth bug that shipped (`/../terms.html` emitted for every
 * sub-locale, which resolves to /ko/terms.html on nested pages) and asserts
 * the check FAILS. Also verifies the check catches a wrong link target.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = join(ROOT, "scripts/check-langswitch.mjs");
const VICTIM = join(ROOT, "dist/ko/moretools/concretecalculator.html");

function runCheck() {
  try {
    execFileSync(process.execPath, [CHECK], { stdio: "pipe" });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

const base = runCheck();
if (base !== 0) {
  console.error(`[self-test] FAIL — clean build should pass, got exit ${base}`);
  process.exit(1);
}

const original = readFileSync(VICTIM, "utf8");

const CASES = [
  {
    name: "relative ../ prefix in the footer legal links",
    // Target the footer link specifically: the first terms.html href on the page
    // belongs elsewhere, so a blind replace would not exercise the footer.
    apply: (s) =>
      s.replace(
        /(class="footer-links"[\s\S]*?href=")\/terms\.html(")/,
        '$1/../terms.html$2',
      ),
  },
  {
    name: "delete-account link points at a page that does not exist",
    apply: (s) => s.replace(/(class="footer-links"[\s\S]*?href=")\/delete-account\.html(")/, '$1/nope.html$2'),
  },
];

let failed = false;

try {
  for (const c of CASES) {
    const mutated = c.apply(original);
    if (mutated === original) {
      console.error(`[self-test] SKIP ${c.name} — mutation did not apply`);
      failed = true;
      continue;
    }
    writeFileSync(VICTIM, mutated, "utf8");
    // Confirm the file on disk really changed before trusting the result.
    const onDisk = readFileSync(VICTIM, "utf8");
    if (onDisk !== mutated) {
      failed = true;
      console.error(`[self-test] SKIP ${c.name} — write did not land`);
      writeFileSync(VICTIM, original, "utf8");
      continue;
    }
    if (onDisk.includes("/../terms.html")) {
      console.log(`[self-test]   (injected /../terms.html into the page)`);
    }
    const status = runCheck();
    writeFileSync(VICTIM, original, "utf8");

    if (status === 0) {
      console.error(`[self-test] FAIL — ${c.name} was not detected.`);
      failed = true;
    } else {
      console.log(`[self-test] ok — ${c.name}`);
    }
  }
} finally {
  writeFileSync(VICTIM, original, "utf8");
}

if (failed) process.exit(1);
console.log("[self-test] PASS");
