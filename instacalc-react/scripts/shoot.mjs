/**
 * Screenshots the running site so the UI can be reviewed visually rather than
 * inferred from markup.
 *
 * Uses the locally installed Chrome/Edge (the Playwright-managed Chromium
 * download times out on this network). Falls back across known install paths.
 *
 * Usage:
 *   node scripts/shoot.mjs                     # default page set, 1440px
 *   node scripts/shoot.mjs /emicalculator.html # one page
 *   node scripts/shoot.mjs / 375               # one page at 375px (mobile)
 */
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.SMOKE_URL ?? "http://localhost:8000";
const OUT = join(import.meta.dirname, "..", "shots");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const LOCAL_BROWSERS = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

const exe = LOCAL_BROWSERS.find((p) => existsSync(p));
if (!exe) {
  console.error("[shoot] no local Chrome/Edge found; cannot screenshot.");
  process.exit(1);
}
console.log(`[shoot] using ${exe}`);

// Default: the three page types that define the site's UI.
const args = process.argv.slice(2);
const PAGES = args.length === 0
  ? ["/", "/emicalculator.html", "/compoundinterest.html", "/duration/agecalculator.html"]
  : [args[0]];

const WIDTHS = args.length >= 2 ? [Number(args[1])] : [1440];
const fullPage = !process.argv.includes("--viewport-only");

const browser = await chromium.launch({ executablePath: exe, channel: undefined });

for (const width of WIDTHS) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  for (const p of PAGES) {
    const url = `${BASE}${p}`;
    const res = await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    // Let fonts settle and any entry animation finish.
    await page.waitForTimeout(400);

    const slug = p === "/" ? "home" : p.replace(/^\/|\.html$/g, "").replace(/[\/\\]/g, "-");
    const file = join(OUT, `${slug}-${width}.png`);
    await page.screenshot({ path: file, fullPage });
    console.log(`[shoot] ${res.status()} ${url}\n         -> ${file}`);
  }
  await context.close();
}

await browser.close();
