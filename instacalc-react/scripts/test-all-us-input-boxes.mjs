import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = "http://localhost:8000";

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const usCalcs = Object.values(seo.pages).filter(
  (p) => (p.locale === "us" || p.path.startsWith("/us/")) && p.path !== "/us/" && p.path !== "/us/index.html"
);

console.log(`[test-us-inputs] Testing ALL input boxes across ${usCalcs.length} US calculators...\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  locale: "en-US",
});

const report = [];
let totalInputsTested = 0;
let totalSlidersTested = 0;
let totalSelectsTested = 0;
let totalChipsTested = 0;
let totalFailures = 0;

for (let pIdx = 0; pIdx < usCalcs.length; pIdx++) {
  const pageDef = usCalcs[pIdx];
  const urlPath = pageDef.path;
  const fullUrl = BASE + urlPath;
  const page = await context.newPage();

  const calcReport = {
    index: pIdx + 1,
    path: urlPath,
    inputsTested: 0,
    slidersTested: 0,
    selectsTested: 0,
    chipsTested: 0,
    errors: [],
  };

  page.on("pageerror", (err) => {
    calcReport.errors.push(`Page error: ${err.message}`);
  });

  try {
    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 15000 });

    const getResultSnapshot = async () => {
      return await page.$$eval(
        ".result-hero-value, .result-tile .result-value, .kv-value, .metric-val",
        (els) => els.map((el) => el.innerText.trim()).filter(Boolean)
      );
    };

    const initialResults = await getResultSnapshot();
    const hasInitialBad = initialResults.filter((txt) => /NaN|undefined|null/i.test(txt));
    if (hasInitialBad.length > 0) {
      calcReport.errors.push(`Initial results contain bad values: ${JSON.stringify(hasInitialBad)}`);
    }

    // 1. Test every number input
    const numberCount = await page.$$eval("input[type='number']", (els) => els.length);
    for (let i = 0; i < numberCount; i++) {
      const input = (await page.$$("input[type='number']"))[i];
      if (!input) continue;
      const id = await input.getAttribute("id");
      const label = await page.$eval(`label[for='${id}']`, (el) => el.innerText.trim()).catch(() => `Input #${i}`);
      const curVal = await input.inputValue();
      const min = parseFloat(await input.getAttribute("min")) || 0;
      const max = parseFloat(await input.getAttribute("max")) || 100000000;
      const step = parseFloat(await input.getAttribute("step")) || 1;
      const curNum = parseFloat(curVal) || min;

      let testVal = curNum + step * 2;
      if (testVal > max) testVal = Math.max(min, curNum - step * 2);
      if (testVal === curNum) testVal = curNum + step;

      await input.fill(String(testVal));
      await input.dispatchEvent("input");
      await input.dispatchEvent("change");
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Field '${label}' change to ${testVal} caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.inputsTested++;
      totalInputsTested++;

      // Restore value
      await input.fill(String(curVal));
      await input.dispatchEvent("input");
      await input.dispatchEvent("change");
    }

    // 2. Test date inputs
    const dateCount = await page.$$eval("input[type='date']", (els) => els.length);
    for (let i = 0; i < dateCount; i++) {
      const input = (await page.$$("input[type='date']"))[i];
      if (!input) continue;
      const curVal = await input.inputValue();
      await input.fill("2024-01-15");
      await input.dispatchEvent("input");
      await input.dispatchEvent("change");
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Date input change caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.inputsTested++;
      totalInputsTested++;

      if (curVal) {
        await input.fill(curVal);
        await input.dispatchEvent("input");
        await input.dispatchEvent("change");
      }
    }

    // 3. Test every range slider
    const sliderCount = await page.$$eval("input[type='range']", (els) => els.length);
    for (let i = 0; i < sliderCount; i++) {
      const slider = (await page.$$("input[type='range']"))[i];
      if (!slider) continue;
      const min = parseFloat(await slider.getAttribute("min")) || 0;
      const max = parseFloat(await slider.getAttribute("max")) || 100;
      const mid = Math.round((min + max) / 2);

      await slider.evaluate((el, val) => {
        el.value = String(val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, mid);
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Slider #${i} change to ${mid} caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.slidersTested++;
      totalSlidersTested++;
    }

    // 4. Test select dropdowns
    const selectCount = await page.$$eval("select:not(#langSelect)", (els) => els.length);
    for (let i = 0; i < selectCount; i++) {
      const select = (await page.$$("select:not(#langSelect)"))[i];
      if (!select) continue;
      const options = await select.$$eval("option", (opts) => opts.map((o) => o.value));
      if (options.length > 1) {
        await select.selectOption(options[1]);
        await select.dispatchEvent("change");
        await page.waitForTimeout(100);

        const afterResults = await getResultSnapshot();
        const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
        if (badVals.length > 0) {
          calcReport.errors.push(`Select #${i} change to '${options[1]}' caused bad results: ${JSON.stringify(badVals)}`);
        }
      }
      calcReport.selectsTested++;
      totalSelectsTested++;
    }

    // 5. Test Quick Chips / Buttons
    const chipCount = await page.$$eval(
      "button.chip, .chips-wrap button, .field-quick button, .quick-options button, .chip-group button, .calc-presets button, .calc-chip, .toggle-btn",
      (els) => els.length
    );
    for (let i = 0; i < chipCount; i++) {
      const chip = (await page.$$(
        "button.chip, .chips-wrap button, .field-quick button, .quick-options button, .chip-group button, .calc-presets button, .calc-chip, .toggle-btn"
      ))[i];
      if (!chip) continue;
      const isVisible = await chip.isVisible();
      if (!isVisible) continue;

      const chipText = (await chip.innerText()).trim();
      await chip.click();
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Chip '${chipText}' click caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.chipsTested++;
      totalChipsTested++;
    }
  } catch (err) {
    calcReport.errors.push(`Fatal error in test: ${err.message}`);
  } finally {
    await page.close();
  }

  report.push(calcReport);
  if (calcReport.errors.length > 0) {
    totalFailures++;
    console.log(`[${pIdx + 1}/${usCalcs.length}] ❌ FAIL: ${urlPath}`);
    console.log(`    Errors: ${calcReport.errors.join("\n    ")}`);
  } else {
    console.log(
      `[${pIdx + 1}/${usCalcs.length}] PASS: ${urlPath} — tested ${calcReport.inputsTested} number/date inputs, ${calcReport.slidersTested} sliders, ${calcReport.selectsTested} selects, ${calcReport.chipsTested} chips.`
    );
  }
}

await browser.close();

console.log("\n=======================================================");
console.log(`US INPUT VALIDATION COMPLETE:`);
console.log(`  Total Number/Date Inputs Tested: ${totalInputsTested}`);
console.log(`  Total Range Sliders Tested:      ${totalSlidersTested}`);
console.log(`  Total Selects Tested:            ${totalSelectsTested}`);
console.log(`  Total Quick Chips/Toggles Tested:${totalChipsTested}`);
console.log(`  Grand Total Interactive Controls: ${totalInputsTested + totalSlidersTested + totalSelectsTested + totalChipsTested}`);
console.log(`  Total Calculators with Failures: ${totalFailures}`);
console.log("=======================================================\n");

writeFileSync(join(ROOT, "scripts", "us-input-validation-report.json"), JSON.stringify(report, null, 2), "utf8");
