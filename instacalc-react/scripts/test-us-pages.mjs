import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SHOTS_DIR = join(ROOT, "shots", "us");
mkdirSync(SHOTS_DIR, { recursive: true });

const BASE = "http://localhost:8000";

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const usPages = Object.values(seo.pages).filter((p) => p.locale === "us" || p.path.startsWith("/us/"));

console.log(`[test-us] Testing all ${usPages.length} US pages on ${BASE}...\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  locale: "en-US",
});

const results = [];
let passCount = 0;
let failCount = 0;

for (let i = 0; i < usPages.length; i++) {
  const pageDef = usPages[i];
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

    // Check React root mounted
    const rootHtml = await page.$eval("#root", (el) => el.innerHTML).catch(() => null);
    if (!rootHtml || rootHtml.trim() === "") {
      pageResult.status = "FAIL";
      pageResult.issues.push("React #root is empty or missing");
    }

    // Check for React hydration errors (Minified React error #418 or similar)
    const hydrationErrors = consoleLogs.filter(
      (l) => l.text.includes("Minified React error #418") || l.text.includes("Hydration failed") || l.text.includes("did not match")
    );
    if (hydrationErrors.length > 0) {
      pageResult.status = "FAIL";
      pageResult.issues.push(`React Hydration Error: ${hydrationErrors.map((e) => e.text).join("; ")}`);
    }

    // Check for uncaught runtime exceptions
    if (pageErrors.length > 0) {
      pageResult.status = "FAIL";
      pageResult.issues.push(`Uncaught JS Errors: ${pageErrors.join("; ")}`);
    }

    // Check console errors
    const errorsOnly = consoleLogs.filter((l) => l.type === "error");
    if (errorsOnly.length > 0) {
      pageResult.issues.push(`Console errors: ${errorsOnly.map((e) => e.text).join("; ")}`);
    }

    // Check SEO & title
    const title = await page.title();
    pageResult.details.title = title;
    if (!title) {
      pageResult.issues.push("Missing document title");
    }

    // Check calculator shell or prose
    const isHome = urlPath === "/us/" || urlPath === "/us/index.html";
    if (isHome) {
      const hero = await page.$(".hero-title, h1");
      pageResult.details.hasHero = !!hero;
      const searchBox = await page.$("#toolSearch");
      pageResult.details.hasSearch = !!searchBox;
      await page.screenshot({ path: join(SHOTS_DIR, "home.png") });
    } else {
      const calcShell = await page.$(".calc-shell");
      const prose = await page.$(".prose");
      const h1 = await page.$("h1");
      pageResult.details.hasCalcShell = !!calcShell;
      pageResult.details.hasProse = !!prose;
      pageResult.details.hasH1 = !!h1;

      if (!calcShell && !prose) {
        pageResult.issues.push("Missing .calc-shell and .prose");
      }

      // Check for incorrect currency or terminology leak
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (bodyText.includes("₹")) {
        pageResult.status = "FAIL";
        pageResult.issues.push("Found Rupee symbol (₹) on US page");
      }
      if (/\b(lakh|crore|lakhs|crores)\b/i.test(bodyText)) {
        pageResult.status = "FAIL";
        pageResult.issues.push("Found Indian numbering unit (Lakh/Crore) on US page");
      }

      // Capture screenshot for key calculators
      const keyCalcs = [
        "401k-calculator",
        "mortgage-calculator",
        "paycheck-calculator",
        "roth-ira-calculator",
        "fire-calculator",
        "cd-calculator",
        "auto-loan-calculator",
        "sales-tax-calculator",
        "compound-interest-calculator",
        "student-loan-calculator",
      ];
      for (const k of keyCalcs) {
        if (urlPath.includes(k)) {
          const shotName = `${k}.png`;
          await page.screenshot({ path: join(SHOTS_DIR, shotName) });
          break;
        }
      }
    }

    if (pageResult.issues.length > 0 && pageResult.status === "PASS") {
      pageResult.status = "WARN";
    }
  } catch (err) {
    pageResult.status = "FAIL";
    pageResult.issues.push(`Fatal page test error: ${err.message}`);
  } finally {
    await page.close();
  }

  results.push(pageResult);
  if (pageResult.status === "FAIL") {
    failCount++;
    console.log(`[${i + 1}/${usPages.length}] ❌ FAIL: ${urlPath}`);
    console.log(`    Issues: ${pageResult.issues.join("\n    ")}`);
  } else if (pageResult.status === "WARN") {
    console.log(`[${i + 1}/${usPages.length}] ⚠️  WARN: ${urlPath} — ${pageResult.issues.join(", ")}`);
  } else {
    passCount++;
    console.log(`[${i + 1}/${usPages.length}] ✅ PASS: ${urlPath}`);
  }
}

await browser.close();

console.log("\n=======================================================");
console.log(`US PAGES AUDIT COMPLETE:`);
console.log(`  Total Pages Tested: ${usPages.length}`);
console.log(`  Passed:             ${passCount}`);
console.log(`  Warnings:           ${results.filter((r) => r.status === "WARN").length}`);
console.log(`  Failed:             ${failCount}`);
console.log("=======================================================\n");

writeFileSync(join(ROOT, "scripts", "us-pages-audit-results.json"), JSON.stringify(results, null, 2), "utf8");
