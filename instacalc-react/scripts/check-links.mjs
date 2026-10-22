/**
 * Crawls the built site and reports every internal link whose target is not a
 * file on disk. Complements check-langswitch.mjs, which inspects a handful of
 * known pages: this walks all of them, so a broken link anywhere is caught.
 *
 * Relative hrefs are resolved against the linking page's own URL, exactly as a
 * browser would, which is what let the /ko/moretools/ depth bug through before.
 *
 * Run: node scripts/check-links.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const DIST = join(ROOT, "dist");
const ORIGIN = "https://instacalc.in";

/** Every prerendered HTML file under dist. */
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/** True when dist holds something that would serve this URL path. */
function resolves(pathname) {
  const rel = pathname.replace(/^\/+/, "");
  if (rel === "") return true; // "/" is the built index
  const target = join(DIST, rel);
  if (existsSync(target)) {
    if (statSync(target).isFile()) return true;
    // A directory is served by its index.html (GitHub Pages does this).
    return existsSync(join(target, "index.html"));
  }
  return false;
}

const pages = walk(DIST);
const problems = [];
let checked = 0;

for (const file of pages) {
  const html = readFileSync(file, "utf8");
  const pageUrl = `${ORIGIN}/${file.slice(DIST.length + 1).replace(/\\/g, "/")}`;

  for (const raw of [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])) {
    if (/^(#|https?:|mailto:|tel:|data:|javascript:)/i.test(raw)) continue;
    checked++;

    const pathname = raw.startsWith("/")
      ? raw
      : new URL(raw, pageUrl).pathname;

    // Ignore fragment/query-only and in-page navigation.
    const clean = pathname.split("?")[0].split("#")[0];
    if (!clean) continue;

    if (!resolves(clean)) {
      problems.push({ pageUrl, raw, clean });
    }
  }
}

// One entry per distinct broken target, keeping the first page that points at it.
const byTarget = new Map();
for (const p of problems) if (!byTarget.has(p.clean)) byTarget.set(p.clean, p);

console.log(`[link-check] ${pages.length} pages, ${checked} internal links scanned`);

if (byTarget.size) {
  console.error(
    `[link-check] FAIL — ${problems.length} broken link(s), ${byTarget.size} distinct target(s):\n`,
  );
  for (const [target, p] of byTarget) {
    console.error(`  ${target}\n      first seen on ${p.pageUrl}  (href="${p.raw}")\n`);
  }
  process.exit(1);
}

console.log("[link-check] PASS — every internal link resolves to a built file.");
