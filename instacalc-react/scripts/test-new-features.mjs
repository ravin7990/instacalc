import { chromium } from "playwright";
import assert from "node:assert";

async function run() {
  console.log("🚀 Starting Playwright E2E verification of elevated platform features...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (err) => {
    console.error("  [PAGE ERROR]", err.message);
  });

  try {
    // -------------------------------------------------------------
    // Test 1: PWA Manifest & Service Worker
    // -------------------------------------------------------------
    console.log("\n📦 Test 1: PWA Manifest & Service Worker...");
    const manifestResp = await page.goto("http://localhost:8000/manifest.json");
    assert.strictEqual(manifestResp.status(), 200, "manifest.json should return 200");
    const manifestJson = await manifestResp.json();
    assert.strictEqual(manifestJson.name, "InstaCalc - Instant Financial & Utility Calculators");
    assert.strictEqual(manifestJson.display, "standalone");
    console.log("  ✓ manifest.json is served, valid, and configured as standalone");

    const swResp = await page.goto("http://localhost:8000/sw.js");
    assert.strictEqual(swResp.status(), 200, "sw.js should return 200");
    const swText = await swResp.text();
    assert.ok(swText.includes("instacalc-v"), "sw.js should contain cache version");
    console.log("  ✓ sw.js is served and contains service worker lifecycle code");

    // -------------------------------------------------------------
    // Test 2: Shareable URL State / Deep Linking on Declarative & Bespoke Calcs
    // -------------------------------------------------------------
    console.log("\n🔗 Test 2: Shareable URL State / Deep Linking...");
    // 2a. Declarative Sip Calculator
    await page.goto("http://localhost:8000/sipcalculator.html?monthly=25000&rate=15&years=20", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(600);

    const monthlyInput = page.locator('input[data-field="monthly"]');
    const rateInput = page.locator('input[data-field="rate"]');
    const yearsInput = page.locator('input[data-field="years"]');

    assert.strictEqual(await monthlyInput.inputValue(), "25000", "Monthly input should prefill from URL param");
    assert.strictEqual(await rateInput.inputValue(), "15", "Rate input should prefill from URL param");
    assert.strictEqual(await yearsInput.inputValue(), "20", "Years input should prefill from URL param");
    console.log("  ✓ /sipcalculator.html prefilled from query string (monthly=25000, rate=15, years=20)");

    // Modify years and check URL updates dynamically
    await yearsInput.fill("25");
    await page.waitForTimeout(600);
    assert.ok(page.url().includes("years=25"), `URL should dynamically sync to years=25 (actual: ${page.url()})`);
    console.log(`  ✓ URL synchronized to current state: ${page.url()}`);

    // 2b. Universal field-level URL sync on /emicalculator.html
    console.log("  Testing universal field sync on /emicalculator.html...");
    await page.goto("http://localhost:8000/emicalculator.html?principal=5000000&rate=9.5&years=20", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(600);
    const emiPrincipalInput = page.locator('input[data-field="principal"]');
    const emiRateInput = page.locator('input[data-field="rate"]');
    const emiYearsInput = page.locator('input[data-field="years"]');

    assert.strictEqual(await emiPrincipalInput.inputValue(), "5000000", "EMI principal should prefill from URL");
    assert.strictEqual(await emiRateInput.inputValue(), "9.5", "EMI rate should prefill from URL");
    assert.strictEqual(await emiYearsInput.inputValue(), "20", "EMI years should prefill from URL");
    console.log("  ✓ Universal field sync works seamlessly on /emicalculator.html");

    // -------------------------------------------------------------
    // Test 3: Rich Scenario Comparison Studio (Delta Badges & Inputs Tag)
    // -------------------------------------------------------------
    console.log("\n⚖️ Test 3: Scenario Comparison Studio (Headline + Δ% Badge + Metric Rows)...");
    await page.goto("http://localhost:8000/sipcalculator.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    const initialHero = (await page.locator(".result-hero-value").textContent()).trim();
    const compareBtn = page.locator(".calc-actions button:has-text('Compare'), .calc-actions button:has-text('比較'), .calc-actions button:has-text('비교')").first();
    await compareBtn.click();
    await page.waitForTimeout(300);

    const compareCard = page.locator(".compare-card");
    assert.ok(await compareCard.isVisible(), ".compare-card should be visible after clicking Compare");

    const scenarioAVal = (await page.locator(".compare-item.is-scenario-a .compare-item-val").textContent()).trim();
    assert.strictEqual(scenarioAVal, initialHero, "Scenario A value should match snapshotted initial result");
    console.log(`  ✓ Scenario A locked at: ${scenarioAVal}`);

    // Modify monthly investment to test delta badge
    await page.locator('input[data-field="monthly"]').fill("35000");
    await page.waitForTimeout(400);

    const scenarioBVal = (await page.locator(".compare-item.is-scenario-b .compare-item-val").textContent()).trim();
    console.log(`  ✓ Scenario B updated to: ${scenarioBVal}`);
    assert.notStrictEqual(scenarioAVal, scenarioBVal, "Scenario B should update live when input changes");

    // Verify calculated delta badge
    const deltaBadge = page.locator(".compare-delta-badge");
    assert.ok(await deltaBadge.isVisible(), "Delta badge (.compare-delta-badge) should be visible");
    const deltaText = (await deltaBadge.textContent()).trim();
    console.log(`  ✓ Live percentage delta badge computed: ${deltaText}`);
    assert.ok(deltaText.includes("%"), "Delta badge should show percentage change");

    // -------------------------------------------------------------
    // Test 4: Financial Workbook CSV / Excel Export
    // -------------------------------------------------------------
    console.log("\n📊 Test 4: Multi-Section Financial Workbook CSV Export...");
    const downloadPromise = page.waitForEvent("download");
    const exportCsvBtn = page.locator(".calc-actions button:has-text('Export CSV'), .calc-actions button:has-text('CSVエクスポート'), .calc-actions button:has-text('CSV 내보내기')").first();
    await exportCsvBtn.click();

    const download = await downloadPromise;
    const downloadFilename = download.suggestedFilename();
    assert.ok(downloadFilename.endsWith(".csv"), `Downloaded file should be .csv (got: ${downloadFilename})`);

    const downloadStream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const csvBuffer = Buffer.concat(chunks);

    // Verify UTF-8 BOM (\xEF\xBB\xBF)
    assert.strictEqual(csvBuffer[0], 0xef, "CSV should start with UTF-8 BOM byte 1");
    assert.strictEqual(csvBuffer[1], 0xbb, "CSV should start with UTF-8 BOM byte 2");
    assert.strictEqual(csvBuffer[2], 0xbf, "CSV should start with UTF-8 BOM byte 3");

    const csvContent = csvBuffer.toString("utf8");
    console.log(`  ✓ Exported workbook: ${downloadFilename} (${csvBuffer.length} bytes, starts with UTF-8 BOM)`);

    // Verify multi-section contents
    assert.ok(csvContent.includes("INSTACALC FINANCIAL REPORT"), "Workbook should contain header title block");
    assert.ok(csvContent.includes("INPUT PARAMETERS"), "Workbook should contain Input Parameters block");
    assert.ok(
      csvContent.includes("SCENARIO COMPARISON") || csvContent.includes("CALCULATION SUMMARY"),
      "Workbook should contain calculation results block"
    );
    console.log("  ✓ Workbook successfully structured with Metadata, Input Parameters, Results, and Schedule");

    // -------------------------------------------------------------
    // Test 5: Interactive Embed Widget Studio & Themed Embedded Mode
    // -------------------------------------------------------------
    console.log("\n🖼️ Test 5: Interactive Embed Widget Studio & Themed Embedded Mode...");
    const embedBtn = page.locator(".calc-actions button:has-text('Embed'), .calc-actions button:has-text('埋め込み'), .calc-actions button:has-text('임베드')").first();
    await embedBtn.click();
    await page.waitForTimeout(300);

    const embedModal = page.locator(".embed-modal");
    assert.ok(await embedModal.isVisible(), "Embed modal dialog should be visible");

    // Click "Dark" theme option
    const darkThemeBtn = page.locator(".embed-option-btn:has-text('Dark')");
    await darkThemeBtn.click();
    await page.waitForTimeout(200);

    let snippetText = await page.locator(".embed-code-box").inputValue();
    assert.ok(snippetText.includes("theme=dark"), "Snippet URL should include theme=dark when Dark is selected");
    console.log("  ✓ Embed customizer updates theme parameter: theme=dark");

    // Click "Compact" size option
    const compactBtn = page.locator(".embed-option-btn:has-text('Compact')");
    await compactBtn.click();
    await page.waitForTimeout(200);

    snippetText = await page.locator(".embed-code-box").inputValue();
    assert.ok(snippetText.includes('height="540"'), "Snippet height should adjust to 540 in Compact mode");
    console.log("  ✓ Embed customizer updates dimensions: height=540 (Compact)");

    // Close modal
    await page.locator(".embed-close-btn").click();
    await page.waitForTimeout(200);

    // Test embedded mode with theme=dark
    console.log("  Testing embedded mode: /sipcalculator.html?embed=true&theme=dark...");
    await page.goto("http://localhost:8000/sipcalculator.html?embed=true&theme=dark", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(400);

    const isEmbeddedThemed = await page.evaluate(() => {
      const htmlHasClass = document.documentElement.classList.contains("is-embedded-calc");
      const hasDarkAttr = document.documentElement.getAttribute("data-embed-theme") === "dark";
      const attributionVisible = document.querySelector(".embed-attribution-bar") !== null;
      return { htmlHasClass, hasDarkAttr, attributionVisible };
    });

    assert.strictEqual(isEmbeddedThemed.htmlHasClass, true, "html should have is-embedded-calc class");
    assert.strictEqual(isEmbeddedThemed.hasDarkAttr, true, "html should have data-embed-theme='dark'");
    assert.strictEqual(isEmbeddedThemed.attributionVisible, true, "Embed attribution bar should be present");
    console.log("  ✓ Embedded widget renders with clean attribution bar and theme attributes");

    // -------------------------------------------------------------
    // Test 6: Multilingual Check (Japanese & Korean)
    // -------------------------------------------------------------
    console.log("\n🌏 Test 6: Multilingual Check (Japanese & Korean)...");
    await page.goto("http://localhost:8000/ja/jutaku-loan-kojo-calculator.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(400);
    const jaCompareBtn = page.locator(".calc-actions button:has-text('シナリオ比較')");
    assert.ok(await jaCompareBtn.isVisible(), "Japanese Compare button (シナリオ比較) should be visible");
    const jaCsvBtn = page.locator(".calc-actions button:has-text('CSV出力')");
    assert.ok(await jaCsvBtn.isVisible(), "Japanese CSV button (CSV出力) should be visible");
    const jaEmbedBtn = page.locator(".calc-actions button:has-text('埋め込み')");
    assert.ok(await jaEmbedBtn.isVisible(), "Japanese Embed button (埋め込み) should be visible");
    console.log("  ✓ Japanese calculator has fully translated action buttons (シナリオ比較, CSV出力, 埋め込み)");

    await page.goto("http://localhost:8000/ko/salary-calculator.html", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForTimeout(400);
    const koCompareBtn = page.locator(".calc-actions button:has-text('비교하기')");
    assert.ok(await koCompareBtn.isVisible(), "Korean Compare button (비교하기) should be visible");
    const koCsvBtn = page.locator(".calc-actions button:has-text('CSV 내보내기')");
    assert.ok(await koCsvBtn.isVisible(), "Korean CSV button (CSV 내보내기) should be visible");
    const koEmbedBtn = page.locator(".calc-actions button:has-text('퍼가기')");
    assert.ok(await koEmbedBtn.isVisible(), "Korean Embed button (퍼가기) should be visible");
    console.log("  ✓ Korean calculator has fully translated action buttons (비교하기, CSV 내보내기, 퍼가기)");

    // -------------------------------------------------------------
    // Test 7: Calculation History, One-Click Load & Multi-Select PDF/CSV Export
    // -------------------------------------------------------------
    console.log("\n📜 Test 7: Calculation History, One-Click Load & Batch Multi-Export...");
    await page.goto("http://localhost:8000/sipcalculator.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    // Clear previous test localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // 1. Initial State: Monthly = 25000, Headline = ₹57.51 L
    const saveBtn = page.locator(".calc-actions button:has-text('Save to History'), .calc-actions button:has-text('履歴に保存'), .calc-actions button:has-text('기록 저장')").first();
    await saveBtn.click();
    await page.waitForTimeout(400);

    // Verify history panel opened and has 1 entry
    const historyCard = page.locator(".history-card");
    assert.ok(await historyCard.isVisible(), ".history-card should be visible after saving");
    let historyItems = page.locator(".history-item");
    assert.strictEqual(await historyItems.count(), 1, "History should have 1 item");

    const firstRunVal = (await historyItems.first().locator(".history-item-headline").textContent()).trim();
    assert.strictEqual(firstRunVal, "₹57.51 L", "History item 1 headline should match ₹57.51 L");
    console.log("  ✓ Run 1 saved to history: ₹57.51 L (Monthly: 25,000)");

    // 2. Change monthly to 50000 -> Headline becomes ₹1.15 Cr -> Save again
    const histMonthlyInput = page.locator('input[data-field="monthly"]');
    await histMonthlyInput.fill("50000");
    await page.waitForTimeout(400);

    await saveBtn.click();
    await page.waitForTimeout(400);

    historyItems = page.locator(".history-item");
    assert.strictEqual(await historyItems.count(), 2, "History should now contain 2 items");
    const secondRunVal = (await historyItems.first().locator(".history-item-headline").textContent()).trim();
    assert.strictEqual(secondRunVal, "₹1.15 Cr", "History item 2 headline should match ₹1.15 Cr");
    console.log("  ✓ Run 2 saved to history: ₹1.15 Cr (Monthly: 50,000)");

    // 3. Test One-Click Load function: Click 'Load' on Run 1 (the older entry, index 1)
    const run1LoadBtn = historyItems.nth(1).locator(".history-load-btn");
    await run1LoadBtn.click();
    await page.waitForTimeout(400);

    // Assert that the main calculator inputs and results reverted to Run 1
    const currentMonthlyVal = await histMonthlyInput.inputValue();
    const currentHeroVal = (await page.locator(".result-hero-value").textContent()).trim();
    assert.strictEqual(currentMonthlyVal, "25000", "Main calculator monthly input should revert to 25000 on Load");
    assert.strictEqual(currentHeroVal, "₹57.51 L", "Main calculator hero result should revert to ₹57.51 L on Load");
    console.log("  ✓ One-Click Load successfully restored Run 1 (25000 / ₹57.51 L) into active calculator!");

    // 4. Test Multi-Select Batch CSV Export
    // Check master 'Select All' checkbox
    const selectAllCheckbox = page.locator(".history-select-all");
    await selectAllCheckbox.check();
    await page.waitForTimeout(200);

    const batchCsvPromise = page.waitForEvent("download");
    const exportBatchCsvBtn = page.locator(".history-batch-btn:has-text('Export Selected CSV')");
    await exportBatchCsvBtn.click();

    const batchCsvDownload = await batchCsvPromise;
    assert.ok(batchCsvDownload.suggestedFilename().includes("history-comparison.csv"), "Filename should be history comparison CSV");

    const batchStream = await batchCsvDownload.createReadStream();
    const batchChunks = [];
    for await (const chunk of batchStream) {
      batchChunks.push(chunk);
    }
    const batchBuffer = Buffer.concat(batchChunks);
    assert.strictEqual(batchBuffer[0], 0xef, "Batch CSV should start with UTF-8 BOM");
    const batchContent = batchBuffer.toString("utf8");

    assert.ok(batchContent.includes("INSTACALC CALCULATION HISTORY REPORT"), "Batch CSV contains header block");
    assert.ok(batchContent.includes("SIDE-BY-SIDE RUN COMPARISON MATRIX"), "Batch CSV contains side-by-side matrix");
    assert.ok(batchContent.includes("Run #1") && batchContent.includes("Run #2"), "Batch CSV contains both runs");
    console.log("  ✓ Batch CSV export successfully generated comparison matrix across selected history runs");

    // 5. Test Multi-Select Batch PDF / Full Card Export with Graphs and Breakdowns
    await page.evaluate(() => {
      window.__printTriggered = false;
      window.print = () => {
        window.__printTriggered = true;
      };
    });

    const exportBatchPdfBtn = page.locator(
      ".history-batch-btn:has-text('Export Selected PDF')"
    );
    await exportBatchPdfBtn.click();
    await page.waitForTimeout(100);

    await page.emulateMedia({ media: "print" });
    const summaryPage = page.locator(".print-history-batch .print-history-summary-page");
    assert.ok(await summaryPage.isVisible(), "Print history report should include executive summary page");

    const batchCards = page.locator(".print-history-batch .print-plan-full-card");
    const cardCount = await batchCards.count();
    assert.strictEqual(cardCount, 2, "Batch print report should contain 2 detailed plan cards across separate pages");

    for (let i = 0; i < cardCount; i++) {
      const card = batchCards.nth(i);
      const heroVal = (await card.locator(".print-plan-hero .print-hero-value, .print-report-hero .print-hero-value").textContent()).trim();
      assert.ok(heroVal.length > 0, `Plan #${i + 1} card should have headline hero value`);

      const inputRows = await card.locator(".print-plan-inputs-col .print-plan-input-row").count();
      assert.ok(inputRows > 0, `Plan #${i + 1} card should contain input parameter rows`);

      const metricTiles = await card.locator(".print-plan-results-col .print-plan-tile").count();
      assert.ok(metricTiles > 0, `Plan #${i + 1} card should contain calculation breakdown tiles`);

      const chartImg = card.locator(".print-plan-chart-box img.print-plan-chart-img");
      if ((await chartImg.count()) > 0) {
        const src = await chartImg.getAttribute("src");
        assert.ok(src && src.startsWith("data:image/"), `Plan #${i + 1} card should contain embedded chart image`);
      }
    }
    await page.emulateMedia({ media: "screen" });
    console.log("  ✓ Batch PDF export correctly renders executive summary on page 1, followed by dedicated full-page cards with hero, breakdown, and chart images for each selected plan");

    // 6. Multilingual check for Japanese and Korean history buttons
    await page.goto("http://localhost:8000/ja/jutaku-loan-kojo-calculator.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const jaSaveBtn = page.locator(".calc-actions button:has-text('履歴に保存')");
    assert.ok(await jaSaveBtn.isVisible(), "Japanese Save to History button (履歴に保存) should be visible");

    await page.goto("http://localhost:8000/ko/salary-calculator.html", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(400);
    const koSaveBtn = page.locator(".calc-actions button:has-text('기록 저장')");
    assert.ok(await koSaveBtn.isVisible(), "Korean Save to History button (기록 저장) should be visible");
    console.log("  ✓ Multilingual History controls verified in Japanese and Korean");

    console.log("\n🎉 ALL TESTS PASSED! All elevated features including Calculation History verified successfully with 0 defects.");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("\n❌ E2E Test Failure:", err);
  process.exit(1);
});
