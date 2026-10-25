import { chromium } from "playwright";
import assert from "node:assert";

async function run() {
  console.log("🚀 Testing Related Calculators component across locales and formats...\n");
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  try {
    // 1. Check SIP Calculator (Indian English)
    console.log("Checking /sipcalculator.html...");
    await page.goto("http://localhost:8000/sipcalculator.html", { waitUntil: "networkidle" });
    const relatedSection = page.locator(".related-calculators");
    await assert.doesNotReject(relatedSection.waitFor({ state: "visible", timeout: 4000 }), "Related section should be visible");

    const relatedCards = page.locator(".related-link");
    const count = await relatedCards.count();
    console.log(`  ✓ Found ${count} related calculator cards on SIP Calculator`);
    assert.ok(count >= 4 && count <= 6, `Expected between 4 and 6 related cards, got ${count}`);

    // Verify current calculator (/sipcalculator.html) is not among related cards
    const cardHrefs = await page.locator(".related-link").evaluateAll((cards) => cards.map(c => c.getAttribute("href")));
    console.log("  ✓ Related links:", cardHrefs);
    assert.ok(!cardHrefs.includes("/sipcalculator.html"), "Active calculator should be excluded from related cards");

    // 2. Check EMI Calculator
    console.log("\nChecking /emicalculator.html...");
    await page.goto("http://localhost:8000/emicalculator.html", { waitUntil: "networkidle" });
    const emiRelatedCards = page.locator(".related-link");
    const emiCount = await emiRelatedCards.count();
    console.log(`  ✓ Found ${emiCount} related calculator cards on EMI Calculator`);
    assert.ok(emiCount >= 4, `Expected at least 4 related cards, got ${emiCount}`);
    const emiHrefs = await page.locator(".related-link").evaluateAll((cards) => cards.map(c => c.getAttribute("href")));
    console.log("  ✓ Related links on EMI:", emiHrefs);
    assert.ok(!emiHrefs.includes("/emicalculator.html"), "Active calculator should not be linked in related cards");

    // 3. Check Multilingual Locale: Japanese
    console.log("\nChecking Japanese locale /ja/compoundinterest.html...");
    await page.goto("http://localhost:8000/ja/compoundinterest.html", { waitUntil: "networkidle" });
    const jaRelated = page.locator(".related-calculators");
    await assert.doesNotReject(jaRelated.waitFor({ state: "visible", timeout: 4000 }));
    const jaTitle = await page.locator(".related-title").textContent();
    console.log(`  ✓ Japanese Section Title: "${jaTitle?.trim()}"`);
    assert.ok(jaTitle?.includes("関連する計算ツール"), "Should display Japanese heading");

    const jaHrefs = await page.locator(".related-link").evaluateAll((cards) => cards.map(c => c.getAttribute("href")));
    console.log("  ✓ Japanese localized URLs:", jaHrefs);
    assert.ok(jaHrefs.every(h => h.startsWith("/ja/")), "All Japanese related cards must have /ja/ prefix");

    // 4. Check Multilingual Locale: Korean
    console.log("\nChecking Korean locale /ko/compound-investment-calculator.html...");
    await page.goto("http://localhost:8000/ko/compound-investment-calculator.html", { waitUntil: "networkidle" });
    const koTitle = await page.locator(".related-title").textContent();
    console.log(`  ✓ Korean Section Title: "${koTitle?.trim()}"`);
    assert.ok(koTitle?.includes("관련 추천 계산기"), "Should display Korean heading");
    const koHrefs = await page.locator(".related-link").evaluateAll((cards) => cards.map(c => c.getAttribute("href")));
    assert.ok(koHrefs.every(h => h.startsWith("/ko/")), "All Korean related cards must have /ko/ prefix");

    // 5. Check Embedded Mode Suppression (?embed=true)
    console.log("\nChecking Embedded mode suppression (?embed=true)...");
    await page.goto("http://localhost:8000/sipcalculator.html?embed=true", { waitUntil: "networkidle" });
    const isVisibleInEmbed = await page.locator(".related-calculators").isVisible();
    console.log(`  ✓ Related calculators visible in embed mode: ${isVisibleInEmbed}`);
    assert.strictEqual(isVisibleInEmbed, false, "Related calculators must be hidden when ?embed=true");

    console.log("\n🎉 ALL RELATED CALCULATOR TESTS PASSED!");
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
