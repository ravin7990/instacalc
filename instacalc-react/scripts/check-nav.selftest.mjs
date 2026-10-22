/**
 * Self-test for check-nav.mjs.
 *
 * Injects each defect the check is supposed to catch and asserts it FAILS.
 * Guards that silently pass are worse than no guard.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const CHECK = join(ROOT, "scripts/check-nav.mjs");
const CSS = join(ROOT, "src/styles/app.css");
const HEADER = join(ROOT, "src/components/layout/SiteHeader.tsx");

const CASES = [
  {
    name: "missing .site-nav:not(.open) drawer guard",
    files: [[CSS, (s) => s.replace(/\.site-nav:not\(\.open\)\s*\{\s*display:\s*none;?\s*\}/, "")]],
  },
  {
    name: "duplicate .site-nav display at base",
    // Match on the selector alone so CRLF/LF differences cannot break it.
    files: [
      [
        CSS,
        (s) => s.replace(/(\.site-nav\s*\{\s*display:\s*none;)/, `$1\n}\n.site-nav {\n  display: flex;`),
      ],
    ],
  },
  {
    name: "unlabelled main nav landmark",
    files: [[HEADER, (s) => s.replace(/\n\s*aria-label="Main"/, "")]],
  },
];

function runCheck() {
  try {
    execFileSync(process.execPath, [CHECK], { stdio: "pipe" });
    return 0;
  } catch (err) {
    return err.status ?? 1;
  }
}

const backups = [];
let failed = false;

const base = runCheck();
if (base !== 0) {
  console.error(`[self-test] FAIL — clean tree should pass, got exit ${base}`);
  process.exit(1);
}

try {
  for (const c of CASES) {
    const saved = new Map();
    for (const [file, mutate] of c.files) {
      saved.set(file, readFileSync(file, "utf8"));
      const next = mutate(saved.get(file));
      if (next === saved.get(file)) {
        console.error(`[self-test] SKIP ${c.name} — mutation did not apply`);
        failed = true;
        continue;
      }
      writeFileSync(file, next, "utf8");
    }
    const status = runCheck();
    for (const [file, content] of saved) writeFileSync(file, content, "utf8");
    backups.length = 0;

    if (status === 0) {
      console.error(`[self-test] FAIL — ${c.name} was not detected.`);
      failed = true;
    } else {
      console.log(`[self-test] ok — ${c.name}`);
    }
  }
} finally {
  for (const [file, content] of CASES.flatMap((c) => c.files).map(([f]) => [f, null])) {
    if (content === null) continue;
  }
}

if (failed) process.exit(1);
console.log("[self-test] PASS");
