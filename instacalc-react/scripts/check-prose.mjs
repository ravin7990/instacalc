/**
 * check-prose.mjs — verifies the prose pages render their extracted content.
 * Run: node scripts/check-prose.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

const targets = [
  ["aboutus.html", "About"],
  ["contactus.html", "Contact"],
  ["privacypolicy.html", "Privacy"],
  ["terms.html", "Terms"],
  ["delete-account.html", "Delete Account"],
  ["ja/privacypolicy.html", "Privacy (ja)"],
  ["ru/aboutus.html", "About (ru)"],
];

let bad = 0;
console.log("[check-prose] prose page rendering\n");

for (const [file, label] of targets) {
  const out = join(DIST, file);
  if (!existsSync(out)) {
    console.log(`  MISSING  ${label}`);
    bad++;
    continue;
  }

  const html = readFileSync(out, "utf8");
  const start = html.indexOf('<div id="root">');
  const body = start >= 0 ? html.slice(start) : "";

  const h1 = (body.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? "";
  const h2s = (body.match(/<h2[^>]*>/g) ?? []).length;
  const paras = (body.match(/<p[^>]*>/g) ?? []).length;
  const lists = (body.match(/<li[^>]*>/g) ?? []).length;
  const inline = /id="ic-content"/.test(html);
  const fallback = /page-loading|being upgraded/.test(body);

  // A real page has a heading, several sections and substantial prose.
  // Translated pages are legitimately a little shorter, and CJK headings are
  // far shorter in characters than English ones, so the bar is deliberately low.
  const h1Chars = [...h1].length;
  const ok = h1Chars >= 3 && h2s >= 2 && paras >= 3 && inline && !fallback;
  if (!ok) bad++;

  console.log(
    `  ${ok ? "OK  " : "FAIL"}  ${label.padEnd(16)} ` +
      `h2=${String(h2s).padStart(2)} p=${String(paras).padStart(2)} li=${String(lists).padStart(2)} ` +
      `inline=${inline} placeholder=${fallback}`,
  );
  if (label === "About") console.log(`        h1: ${h1.slice(0, 70)}`);
}

console.log(
  bad ? `\n[check-prose] ${bad} page(s) failed.` : "\n[check-prose] PASS — all prose pages render their extracted content.",
);
if (bad) process.exitCode = 1;
