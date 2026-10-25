import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SHOTS_DIR = join(ROOT, "shots", "ja");
mkdirSync(SHOTS_DIR, { recursive: true });

const BASE = "http://localhost:8000";

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const jaPages = Object.values(seo.pages).filter((p) => p.path.startsWith("/ja/"));

console.log(`[test-ja] Testing all ${jaPages.length} Japanese pages on ${BASE}...\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  locale: "ja-JP",
});

const results = [];
let passCount = 0;
let failCount = 0;

for (let i = 0; i < jaPages.length; i++) {
  const pageDef = jaPages[i];
  const urlPath = pageDef.path;
  const fullUrl = BASE + urlPath;
  const page = await context.newPage();

  const consoleLogs = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" || (msg.type() === "warning" && !text.includes("DevTools") && !text.includes("Vite"))) {
      consoleLogs.push({ type: msg.type(), text });
    }
  });

  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });

  page.on("requestfailed", (req) => {
    const url = req.url();
    if (!url.includes("google") && !url.includes("doubleclick")) {
      failedRequests.push(`${url} (${req.failure()?.errorText})`);
    }
  });

  const pageResult = {
    index: i + 1,
    path: urlPath,
    status: "PASS",
    issues: [],
    details: {},
  };

  try {
    const response = await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });
    const httpStatus = response?.status();
    pageResult.details.httpStatus = httpStatus;

    if (httpStatus !== 200) {
      pageResult.status = "FAIL";
      pageResult.issues.push(`HTTP status: ${httpStatus}`);
    }

    // Check title and H1
    const title = await page.title();
    const h1 = await page.$eval("h1", (el) => el.innerText.trim()).catch(() => "");
    pageResult.details.title = title;
    pageResult.details.h1 = h1;

    if (!title) {
      pageResult.status = "FAIL";
      pageResult.issues.push("Missing <title>");
    }
    if (!h1) {
      pageResult.status = "FAIL";
      pageResult.issues.push("Missing <h1>");
    }

    // Check hydration & root
    const rootHasContent = await page.$eval("#root", (el) => el.children.length > 0).catch(() => false);
    if (!rootHasContent) {
      pageResult.status = "FAIL";
      pageResult.issues.push("#root has no rendered children");
    }

    // Check header & footer
    const headerExists = await page.$(".site-header").then((el) => !!el);
    const footerExists = await page.$(".site-footer").then((el) => !!el);
    if (!headerExists) pageResult.issues.push("Missing .site-header");
    if (!footerExists) pageResult.issues.push("Missing .site-footer");

    // Check if calculator page
    const hasCalc = await page.$(".calculator-shell").then((el) => !!el);
    pageResult.details.isCalculator = hasCalc;

    if (hasCalc) {
      // Find input fields
      const inputCount = await page.$$eval("input, select", (els) => els.length);
      pageResult.details.inputCount = inputCount;

      // Extract displayed numbers/metrics
      const metricTexts = await page.$$eval(
        ".result-hero-value, .result-tile .result-value, .kv-value, .metric-val",
        (els) => els.map((el) => el.innerText.trim())
      );
      pageResult.details.metrics = metricTexts;

      // Check for NaN or undefined in metrics
      const nanOrUndefined = metricTexts.filter(
        (txt) => /NaN|undefined|null/i.test(txt) || txt === ""
      );
      if (nanOrUndefined.length > 0) {
        pageResult.status = "FAIL";
        pageResult.issues.push(`Found invalid metric values: ${JSON.stringify(nanOrUndefined)}`);
      }

      // Check chart canvas
      const canvasCount = await page.$$eval("canvas", (els) => els.length);
      pageResult.details.canvasCount = canvasCount;

      // Test interaction: Type into the first number input or move slider
      const firstInput = await page.$("input[type='number'], input[type='range'], input:not([type])");
      if (firstInput) {
        const inputType = await firstInput.getAttribute("type");
        const curVal = await firstInput.inputValue();
        const numVal = parseFloat(curVal) || 10;
        const targetVal = String(Math.round(numVal * 1.2) + 1);

        if (inputType === "range") {
          await firstInput.evaluate((el, val) => {
            el.value = val;
            el.dispatchEvent(new Event("input", { bubbles: true }));
            el.dispatchEvent(new Event("change", { bubbles: true }));
          }, targetVal);
        } else {
          await firstInput.fill(targetVal);
          await firstInput.dispatchEvent("input");
          await firstInput.dispatchEvent("change");
        }
        await page.waitForTimeout(150);

        const newMetricTexts = await page.$$eval(
          ".result-hero-value, .result-tile .result-value, .kv-value, .metric-val",
          (els) => els.map((el) => el.innerText.trim())
        );
        const hasBadNewVals = newMetricTexts.filter((txt) => /NaN|undefined|null/i.test(txt));
        if (hasBadNewVals.length > 0) {
          pageResult.status = "FAIL";
          pageResult.issues.push(`Interactive update produced NaN/undefined: ${JSON.stringify(hasBadNewVals)}`);
        }
      }

      // Check FAQs
      const faqCount = await page.$$eval(".faq-item, details.faq", (els) => els.length);
      pageResult.details.faqCount = faqCount;
      if (faqCount < 3) {
        pageResult.issues.push(`Low FAQ count: ${faqCount}`);
      }

      // Check SEO prose article
      const articleTextLength = await page
        .$eval(".seo-section, article.prose, .prose-page", (el) => el.innerText.length)
        .catch(() => 0);
      pageResult.details.articleTextLength = articleTextLength;
    } else if (urlPath === "/ja/") {
      // Home page checks
      const toolsInCatalog = await page.$$eval(".tool-card", (els) => els.length);
      pageResult.details.toolsInCatalog = toolsInCatalog;
      if (toolsInCatalog < 15) {
        pageResult.issues.push(`Homepage catalog has only ${toolsInCatalog} tools`);
      }

      const searchInput = await page.$(".hero-search-input");
      if (searchInput) {
        await searchInput.fill("手取り");
        await page.waitForTimeout(100);
        const searchResults = await page.$$eval(".search-result", (els) => els.length);
        pageResult.details.searchResults = searchResults;
      }
    } else {
      // Prose pages
      const proseLength = await page.$eval(".prose-page, .prose", (el) => el.innerText.length).catch(() => 0);
      pageResult.details.proseLength = proseLength;
      if (proseLength < 100) {
        pageResult.issues.push(`Prose page content too short: ${proseLength} chars`);
      }
    }

    // Check console & page errors
    if (pageErrors.length > 0) {
      pageResult.status = "FAIL";
      pageResult.issues.push(`Page errors: ${pageErrors.join("; ")}`);
    }
    const criticalLogs = consoleLogs.filter((l) => l.type === "error");
    if (criticalLogs.length > 0) {
      pageResult.status = "FAIL";
      pageResult.issues.push(`Console errors: ${criticalLogs.map((c) => c.text).join("; ")}`);
    }
    if (failedRequests.length > 0) {
      pageResult.issues.push(`Failed requests: ${failedRequests.join("; ")}`);
    }

    // Take screenshots of key pages
    const keySlugs = [
      "/ja/",
      "/ja/salarycalculator.html",
      "/ja/furusato-nouzei-calculator.html",
      "/ja/jutaku-loan-kojo-calculator.html",
      "/ja/ideco-calculator.html",
      "/ja/taishokukin-calculator.html",
      "/ja/sipcalculator.html",
      "/ja/duration/agecalculator.html",
      "/ja/moretools/concretecalculator.html",
      "/ja/privacypolicy.html",
    ];
    if (keySlugs.includes(urlPath) || pageResult.issues.length > 0) {
      const shotName = (urlPath === "/ja/" ? "home" : urlPath.replace("/ja/", "").replace(/\.html|\//g, "_")) + ".png";
      const calcEl = await page.$(".calculator-shell");
      if (calcEl) {
        await calcEl.screenshot({ path: join(SHOTS_DIR, shotName) });
      } else {
        await page.screenshot({ path: join(SHOTS_DIR, shotName), fullPage: false });
      }
      pageResult.screenshot = shotName;
    }
  } catch (err) {
    pageResult.status = "FAIL";
    pageResult.issues.push(`Exception: ${err.message}`);
  } finally {
    await page.close();
  }

  if (pageResult.status === "PASS" && pageResult.issues.length === 0) {
    passCount++;
    console.log(`[${i + 1}/${jaPages.length}] PASS: ${urlPath}`);
  } else {
    failCount++;
    console.log(`[${i + 1}/${jaPages.length}] ${pageResult.status}: ${urlPath}`);
    for (const issue of pageResult.issues) {
      console.log(`    ⚠ ${issue}`);
    }
  }

  results.push(pageResult);
}

await browser.close();

console.log(`\n========================================`);
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED out of ${jaPages.length} Japanese pages.`);
console.log(`========================================`);

const summaryFile = join(ROOT, "scratch", "japanese-pages-test-result.json");
mkdirSync(dirname(summaryFile), { recursive: true });
writeFileSync(summaryFile, JSON.stringify({ passCount, failCount, results }, null, 2));
