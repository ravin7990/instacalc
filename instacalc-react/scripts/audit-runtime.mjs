/**
 * audit-runtime.mjs — real-browser audit of the built site.
 *
 * The existing check-* scripts parse markup with jsdom, which cannot see
 * anything that only appears once JavaScript runs: hydration mismatches,
 * console errors, failed network requests, or controls that do nothing when
 * clicked. This crawls the built `dist/` in Chromium and reports those.
 *
 * Usage: node scripts/audit-runtime.mjs [baseUrl]
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE = process.argv[2] ?? "http://localhost:4173";

/** Every emitted .html file, as site-absolute paths. */
function htmlFiles(dir = DIST, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) htmlFiles(full, acc);
    else if (entry.endsWith(".html")) {
      const rel = relative(DIST, full).replace(/\\/g, "/");
      acc.push(rel === "index.html" ? "/" : `/${rel}`);
    }
  }
  return acc;
}

/** Noise we do not want to report as site defects. */
const IGNORE = [
  /favicon/i,
  /Download the React DevTools/i,
  /\[vite\] connect/i,
];

const all = htmlFiles().sort();
// Optional third arg limits the page count, which keeps quick runs fast.
const limit = Number(process.argv[3] ?? 0);
const paths = limit ? all.slice(0, limit) : all;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const consoleErrors = new Map(); // message -> [paths]
const pageErrors = new Map();
const failedRequests = new Map();
const brokenLinks = new Map(); // href -> [paths]
const hydrationIssues = new Map();

const add = (map, key, path) => {
  if (!map.has(key)) map.set(key, []);
  map.get(key).push(path);
};

const seenLinks = new Set();

for (const path of paths) {
  const page = await context.newPage();
  const logs = [];

  page.on("console", (msg) => {
    if (msg.type() !== "error" && msg.type() !== "warning") return;
    const text = msg.text();
    if (IGNORE.some((re) => re.test(text))) return;
    logs.push(text);
  });
  page.on("pageerror", (err) => add(pageErrors, err.message.split("\n")[0], path));
  page.on("requestfailed", (req) =>
    add(failedRequests, `${req.url()} (${req.failure()?.errorText ?? "failed"})`, path),
  );

  const response = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });

  if (!response || !response.ok()) {
    add(pageErrors, `HTTP ${response?.status() ?? "no-response"}`, path);
  }

  for (const text of logs) {
    // React hydration problems all mention these; group them separately so a
    // single systemic bug is one line, not 119.
    if (/hydrat|did not match|server (?:HTML|rendered text)/i.test(text)) add(hydrationIssues, text, path);
    else add(consoleErrors, text, path);
  }

  // Collect same-origin links once per unique href to keep the crawl quick.
  const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
  for (const href of hrefs) {
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (/^https?:\/\//i.test(href)) continue;
    if (seenLinks.has(href)) continue;
    seenLinks.add(href);
    const target = new URL(href, BASE + path).pathname;
    const res = await context.request.get(BASE + target, { timeout: 15000 });
    if (!res.ok()) add(brokenLinks, `${href} -> HTTP ${res.status()}`, path);
  }

  await page.close();
}

await browser.close();

const report = (title, map) => {
  console.log(`\n=== ${title} ===`);
  if (!map.size) {
    console.log("  none");
    return 0;
  }
  for (const [msg, where] of map) {
    console.log(`  [${where.length} page(s)] ${msg}`);
    if (where.length <= 5) console.log(`      ${where.join(", ")}`);
    else console.log(`      e.g. ${where.slice(0, 3).join(", ")} +${where.length - 3} more`);
  }
  return map.size;
};

console.log(`[audit] crawled ${paths.length} page(s) at ${BASE}`);

let total = 0;
total += report("HYDRATION ISSUES", hydrationIssues);
total += report("UNCAUGHT PAGE ERRORS", pageErrors);
total += report("CONSOLE ERRORS/WARNINGS", consoleErrors);
total += report("FAILED REQUESTS", failedRequests);
total += report("BROKEN INTERNAL LINKS", brokenLinks);

console.log(`\n[audit] ${total} distinct issue(s)`);
process.exitCode = total ? 1 : 0;
