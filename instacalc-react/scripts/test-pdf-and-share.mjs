import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:8000";

const TEST_PAGES = [
  {
    path: "/sipcalculator.html",
    locale: "en",
    pdfText: "Download PDF (A4)",
    shareText: "Share",
    copiedFeedback: "Link Copied!",
    reportTitle: "Calculation Report",
    inputsTitle: "Input Parameters",
    resultsTitle: "Calculation Breakdown",
  },
  {
    path: "/ko/salary-calculator.html",
    locale: "ko",
    pdfText: "PDF 다운로드 (A4)",
    shareText: "공유하기",
    copiedFeedback: "링크 복사됨",
    reportTitle: "계산 결과 보고서",
    inputsTitle: "입력 조건 및 설정",
    resultsTitle: "상세 결과 및 세부 내역",
  },
  {
    path: "/ja/jutaku-loan-kojo-calculator.html",
    locale: "ja",
    pdfText: "PDF出力 (A4)",
    shareText: "共有",
    copiedFeedback: "リンクをコピーしました",
    reportTitle: "計算結果レポート",
    inputsTitle: "入力条件・設定パラメータ",
    resultsTitle: "計算結果および内訳",
  },
];

async function run() {
  console.log(`🚀 Starting PDF Generation & Share verification on ${BASE_URL}...`);
  const browser = await chromium.launch({ headless: true });
  let totalAssertions = 0;
  let passedAssertions = 0;

  function assert(condition, message) {
    totalAssertions++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedAssertions++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
    }
  }

  try {
    for (const testPage of TEST_PAGES) {
      const url = `${BASE_URL}${testPage.path}`;
      console.log(`\n🔍 Testing page [${testPage.locale}]: ${url}`);

      const context = await browser.newContext({
        permissions: ["clipboard-read", "clipboard-write"],
      });
      const page = await context.newPage();

      // Track window.print and analytics events
      await page.addInitScript(() => {
        window.__PRINT_CALLED__ = false;
        window.print = () => {
          window.__PRINT_CALLED__ = true;
        };
        window.__FIRED_EVENTS__ = [];

        window.dataLayer = window.dataLayer || [];
        const origPush = window.dataLayer.push.bind(window.dataLayer);
        window.dataLayer.push = function (...args) {
          args.forEach((item) => {
            if (item && item.event) {
              window.__FIRED_EVENTS__.push({ name: item.event, params: item });
            }
          });
          return origPush(...args);
        };

        const interval = setInterval(() => {
          if (window.__FIREBASE_LOG_EVENT__ && !window.__HOOKED__) {
            window.__HOOKED__ = true;
            const origLog = window.__FIREBASE_LOG_EVENT__;
            window.__FIREBASE_LOG_EVENT__ = function (analytics, name, params) {
              window.__FIRED_EVENTS__.push({ name, params: params || {} });
              return origLog.apply(this, arguments);
            };
            clearInterval(interval);
          }
        }, 30);
      });

      await page.goto(url, { waitUntil: "networkidle" });

      // 1. Check A4 Print Header & Footer exist in DOM
      const headerExists = await page.locator(".print-report-header").count();
      assert(headerExists > 0, "Print report header is mounted in the document");

      const brandName = await page.locator(".print-brand-name").first().textContent();
      assert(brandName.trim() === "InstaCalc", `Print brand name is InstaCalc (got "${brandName.trim()}")`);

      const footerExists = await page.locator(".print-report-footer").count();
      assert(footerExists > 0, "Print report footer is mounted in the document");

      const disclaimerText = await page.locator(".print-footer-disclaimer").first().textContent();
      assert(disclaimerText.length > 20, "Print report footer includes comprehensive legal disclaimer");

      // 2. Check localized button text in .calc-actions
      const pdfBtn = page.locator(".calc-pdf-btn");
      const pdfBtnText = (await pdfBtn.textContent()).trim();
      assert(pdfBtnText.includes(testPage.pdfText), `PDF button has localized text "${testPage.pdfText}" (got "${pdfBtnText}")`);

      const shareBtn = page.locator(".calc-actions button:has-text('" + testPage.shareText + "')");
      const shareBtnCount = await shareBtn.count();
      assert(shareBtnCount > 0, `Share button has localized label "${testPage.shareText}"`);

      // 3. Test "Download PDF" button click
      await pdfBtn.click();
      await page.waitForTimeout(150);

      const printCalled = await page.evaluate(() => window.__PRINT_CALLED__);
      assert(printCalled === true, "Clicking Download PDF triggers window.print()");

      const pdfEventFired = await page.evaluate(() =>
        window.__FIRED_EVENTS__.some((e) => e.name === "calc_download_pdf")
      );
      assert(pdfEventFired === true, "Firebase analytics logged 'calc_download_pdf' event");

      // 4. Test "Share" button click (fallback to clipboard in headless test)
      await shareBtn.click();
      await page.waitForTimeout(150);

      const shareEventFired = await page.evaluate(() =>
        window.__FIRED_EVENTS__.some((e) => e.name === "calc_share")
      );
      assert(shareEventFired === true, "Firebase analytics logged 'calc_share' event");

      const feedbackVisible = await page.locator(`.calc-actions button:has-text('${testPage.copiedFeedback}')`).count();
      assert(feedbackVisible > 0, `Share click provides feedback "${testPage.copiedFeedback}"`);

      // 5. Test @media print emulation
      await page.emulateMedia({ media: "print" });

      // In print mode, .calc-actions, nav, and site-header should be hidden
      const headerDisplay = await page.locator("header.site-header").evaluate((el) => window.getComputedStyle(el).display);
      assert(headerDisplay === "none", "Site header is hidden in @media print");

      const navDisplay = await page.locator(".calc-actions").evaluate((el) => window.getComputedStyle(el).display);
      assert(navDisplay === "none", "Action buttons (.calc-actions) are hidden in @media print");

      // In print mode, .print-report-header and .print-report-footer should be visible
      const reportHeaderDisplay = await page.locator(".print-report-header").evaluate((el) => window.getComputedStyle(el).display);
      assert(reportHeaderDisplay !== "none", `Report header is visible in @media print (display: ${reportHeaderDisplay})`);

      const reportFooterDisplay = await page.locator(".print-report-footer").evaluate((el) => window.getComputedStyle(el).display);
      assert(reportFooterDisplay !== "none", `Report footer is visible in @media print (display: ${reportFooterDisplay})`);

      // In print mode, long editorial articles MUST BE HIDDEN (excluded from PDF)
      const articleCount = await page.locator("article").count();
      if (articleCount > 0) {
        const articleDisplay = await page.locator("article").first().evaluate((el) => window.getComputedStyle(el).display);
        assert(articleDisplay === "none", "Editorial article is excluded (display: none) from PDF report in @media print");
      }

      await context.close();
    }

    console.log(`\n========================================`);
    console.log(`Total checks: ${totalAssertions} | Passed: ${passedAssertions}`);
    if (passedAssertions === totalAssertions) {
      console.log(`🎉 ALL PDF & SHARING TESTS PASSED 100%!`);
    } else {
      console.error(`⚠️ SOME CHECKS FAILED (${totalAssertions - passedAssertions})`);
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
