import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const BASE = "http://localhost:8000";

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const koPages = Object.values(seo.pages).filter(
  (p) => p.path.startsWith("/ko/") && p.path !== "/ko/" && p.path !== "/ko/privacypolicy.html"
);

console.log(`[test-inputs] Testing ALL input boxes across ${koPages.length} Korean calculators...\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  locale: "ko-KR",
});

const report = [];
let totalInputsTested = 0;
let totalSlidersTested = 0;
let totalSelectsTested = 0;
let totalChipsTested = 0;
let totalFailures = 0;

for (let pIdx = 0; pIdx < koPages.length; pIdx++) {
  const pageDef = koPages[pIdx];
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

    // Helper to get all current displayed result strings
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

      // Calculate a valid new test value
      let testVal = curNum + step * 2;
      if (testVal > max) testVal = Math.max(min, curNum - step * 2);
      if (testVal === curNum) testVal = curNum + step;

      const beforeResults = await getResultSnapshot();

      // Enter new value into number input
      await input.fill(String(testVal));
      await input.dispatchEvent("input");
      await input.dispatchEvent("change");
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();

      // Check results for NaN/undefined
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Field '${label}' change to ${testVal} caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.inputsTested++;
      totalInputsTested++;

      // Restore value
      const currentInput = (await page.$$("input[type='number']"))[i];
      if (currentInput) {
        await currentInput.fill(curVal);
        await currentInput.dispatchEvent("input");
        await currentInput.dispatchEvent("change");
        await page.waitForTimeout(50);
      }
    }

    // 2. Test every range slider
    const rangeCount = await page.$$eval("input[type='range']", (els) => els.length);
    for (let i = 0; i < rangeCount; i++) {
      const range = (await page.$$("input[type='range']"))[i];
      if (!range) continue;
      const min = parseFloat(await range.getAttribute("min")) || 0;
      const max = parseFloat(await range.getAttribute("max")) || 100;
      const step = parseFloat(await range.getAttribute("step")) || 1;
      const curVal = parseFloat(await range.inputValue()) || min;

      let testVal = curVal + step * 5;
      if (testVal > max) testVal = Math.max(min, curVal - step * 5);

      await range.evaluate((el, val) => {
        el.value = String(val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, testVal);
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Slider #${i} change to ${testVal} caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.slidersTested++;
      totalSlidersTested++;

      // Restore
      const currentRange = (await page.$$("input[type='range']"))[i];
      if (currentRange) {
        await currentRange.evaluate((el, val) => {
          el.value = String(val);
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }, curVal);
        await page.waitForTimeout(50);
      }
    }

    // 3. Test select elements
    const selects = await page.$$("select");
    for (let i = 0; i < selects.length; i++) {
      const sel = selects[i];
      const name = (await sel.getAttribute("name")) || (await sel.getAttribute("id")) || `select #${i}`;
      // Skip global lang switch
      const isLangSwitch = await sel.evaluate((el) => !!el.closest(".lang-switch"));
      if (isLangSwitch) continue;

      const options = await sel.$$eval("option", (opts) => opts.map((o) => o.value));
      for (const optVal of options) {
        await sel.selectOption(optVal);
        await sel.dispatchEvent("change");
        await page.waitForTimeout(100);

        const afterResults = await getResultSnapshot();
        const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
        if (badVals.length > 0) {
          calcReport.errors.push(`Select '${name}' option '${optVal}' caused bad results: ${JSON.stringify(badVals)}`);
        }
      }
      calcReport.selectsTested++;
      totalSelectsTested++;
    }

    // 4. Test date inputs (if any)
    const dateInputs = await page.$$("input[type='date']");
    for (let i = 0; i < dateInputs.length; i++) {
      const dInput = dateInputs[i];
      const curDate = await dInput.inputValue();
      await dInput.fill("1995-05-15");
      await dInput.dispatchEvent("input");
      await dInput.dispatchEvent("change");
      await page.waitForTimeout(100);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Date input #${i} caused bad results: ${JSON.stringify(badVals)}`);
      }

      calcReport.inputsTested++;
      totalInputsTested++;

      if (curDate) {
        await dInput.fill(curDate);
        await dInput.dispatchEvent("input");
        await dInput.dispatchEvent("change");
      }
    }

    // 5. Test quick chips and toggle buttons
    const chipCount = await page.$$eval(".chips-wrap .chip, .toggle-group .toggle-btn", (els) => els.length);
    for (let i = 0; i < Math.min(chipCount, 12); i++) {
      const chip = (await page.$$(".chips-wrap .chip, .toggle-group .toggle-btn"))[i];
      if (!chip) continue;
      const chipText = await chip.innerText().catch(() => `Chip #${i}`);
      await chip.click();
      await page.waitForTimeout(80);

      const afterResults = await getResultSnapshot();
      const badVals = afterResults.filter((txt) => /NaN|undefined|null/i.test(txt));
      if (badVals.length > 0) {
        calcReport.errors.push(`Chip '${chipText}' caused bad results: ${JSON.stringify(badVals)}`);
      }
      calcReport.chipsTested++;
      totalChipsTested++;
    }

    if (calcReport.errors.length === 0) {
      console.log(
        `[${pIdx + 1}/${koPages.length}] PASS: ${urlPath} — tested ${calcReport.inputsTested} number/date inputs, ${calcReport.slidersTested} sliders, ${calcReport.selectsTested} selects, ${calcReport.chipsTested} chips.`
      );
    } else {
      totalFailures++;
      console.log(`[${pIdx + 1}/${koPages.length}] FAIL: ${urlPath}`);
      for (const err of calcReport.errors) {
        console.log(`    ⚠ ${err}`);
      }
    }
  } catch (err) {
    totalFailures++;
    calcReport.errors.push(`Exception: ${err.message}`);
    console.log(`[${pIdx + 1}/${koPages.length}] EXCEPTION: ${urlPath} — ${err.message}`);
  } finally {
    await page.close();
  }

  report.push(calcReport);
}

await browser.close();

console.log("\n=======================================================");
console.log(`INPUT VALIDATION COMPLETE:`);
console.log(`  Total Number/Date Inputs Tested: ${totalInputsTested}`);
console.log(`  Total Range Sliders Tested:      ${totalSlidersTested}`);
console.log(`  Total Selects Tested:            ${totalSelectsTested}`);
console.log(`  Total Quick Chips/Toggles Tested:${totalChipsTested}`);
console.log(`  Grand Total Interactive Controls: ${totalInputsTested + totalSlidersTested + totalSelectsTested + totalChipsTested}`);
console.log(`  Total Calculators with Failures: ${totalFailures}`);
console.log("=======================================================");

const outFile = join(ROOT, "scratch", "all-input-boxes-test-report.json");
writeFileSync(outFile, JSON.stringify({ totalInputsTested, totalSlidersTested, totalSelectsTested, totalChipsTested, totalFailures, report }, null, 2));
