/**
 * Self-test for check-entities.mjs.
 *
 * Verifies the check actually FAILS on the bug it exists to catch. A guard that
 * silently passes is worse than no guard.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = join(ROOT, "scripts/check-entities.mjs");
const VICTIM = join(ROOT, "src/pages/Home.tsx");
const BACKUP = join(ROOT, "src/pages/.Home.tsx.bak");

const BAD = [
  ['<span aria-hidden="true">\u2192</span>', '<span aria-hidden="true">&nearr;</span>'],
];

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

  for (const [clean, dirty] of BAD) {
    const src = readFileSync(BACKUP, "utf8");
    if (!src.includes(clean)) {
      console.error(`[self-test] SKIP — anchor not present in ${VICTIM}: ${clean}`);
      continue;
    }
    writeFileSync(VICTIM, src.replace(clean, dirty), "utf8");
    const status = runCheck();
    writeFileSync(VICTIM, readFileSync(BACKUP, "utf8"), "utf8");

    if (status === 0) {
      console.error(`[self-test] FAIL — injected ${dirty} but check still passed.`);
      process.exit(1);
    }
    console.log(`[self-test] ok — injected ${dirty} and check failed as expected.`);
  }
  console.log("[self-test] PASS");
} finally {
  copyFileSync(BACKUP, VICTIM);
  try {
    unlinkSync(BACKUP);
  } catch {
    /* already gone */
  }
}
