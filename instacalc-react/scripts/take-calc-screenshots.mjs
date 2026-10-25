import { chromium } from "playwright";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SHOTS_DIR = join(ROOT, "shots", "ko-calcs");
import("node:fs").then((fs) => fs.mkdirSync(SHOTS_DIR, { recursive: true }));

const BASE = "http://localhost:8000";

const calcs = [
  "salary-calculator.html",
  "severance-pay-calculator.html",
  "loan-dsr-calculator.html",
  "deposit-calculator.html",
  "card-deduction-optimizer-calculator.html",
  "korean-age-calculator.html",
  "pyeong-calculator.html",
  "moretools/concretecalculator.html",
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  locale: "ko-KR",
});

for (const c of calcs) {
  const page = await context.newPage();
  await page.goto(`${BASE}/ko/${c}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const calcEl = await page.$(".calculator-shell");
  if (calcEl) {
    const filename = c.replace(/\//g, "_").replace(".html", ".png");
    await calcEl.screenshot({ path: join(SHOTS_DIR, filename) });
    console.log(`Saved screenshot: ${filename}`);
  }
  await page.close();
}

await browser.close();
