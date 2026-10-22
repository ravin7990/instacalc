/**
 * Self-test for check-css-override.mjs.
 *
 * A guard that silently passes is worse than no guard, so this reinstates the
 * exact bug that shipped (`.quick-links a` beating `.quick-link`) and asserts
 * the check FAILS.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = join(ROOT, "scripts/check-css-override.mjs");
const VICTIM = join(ROOT, "src/styles/app.css");
const BACKUP = join(ROOT, "src/styles/.app.css.bak");

const BUG = `
/* Regression fixture: the child class must lose to this selector. */
.quick-links a {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--ic-border);
}
`;

function runCheck() {
  try {
    execFileSync(process.execPath, [CHECK], { stdio: "pipe" });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

copyFileSync(VICTIM, BACKUP);
try {
  const before = runCheck();
  if (before !== 0) {
    console.error(`[self-test] FAIL — clean tree should pass, got exit ${before}`);
    process.exit(1);
  }

  writeFileSync(VICTIM, readFileSync(BACKUP, "utf8") + BUG, "utf8");
  const status = runCheck();
  writeFileSync(VICTIM, readFileSync(BACKUP, "utf8"), "utf8");

  if (status === 0) {
    console.error("[self-test] FAIL — injected `.quick-links a` but check still passed.");
    process.exit(1);
  }
  console.log("[self-test] ok — injected `.quick-links a` and check failed as expected.");
  console.log("[self-test] PASS");
} finally {
  copyFileSync(BACKUP, VICTIM);
  try {
    unlinkSync(BACKUP);
  } catch {
    /* already gone */
  }
}
