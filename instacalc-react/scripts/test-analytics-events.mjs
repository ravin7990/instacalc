import { chromium } from "playwright";

const BASE = "http://localhost:8000";

console.log("[test-analytics] Launching Playwright to test all user action events...\n");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 960 },
  permissions: ["clipboard-read", "clipboard-write"],
});

const page = await context.newPage();

// Capture all events logged to dataLayer / gtag / Firebase
const loggedEvents = [];

await page.exposeFunction("__onTrackEvent", (event) => {
  loggedEvents.push(event);
  console.log(`  -> [EVENT LOGGED] ${event.name}:`, JSON.stringify(event.params));
});

// Intercept window.__FIREBASE_LOG_EVENT__ and gtag in the browser
await page.addInitScript(() => {
  window.dataLayer = window.dataLayer || [];
  const origPush = window.dataLayer.push.bind(window.dataLayer);
  window.dataLayer.push = function (...args) {
    args.forEach((item) => {
      if (item && item.event) {
        window.__onTrackEvent({ name: item.event, params: item });
      }
    });
    return origPush(...args);
  };

  // Poll for Firebase or gtag dispatcher
  const interval = setInterval(() => {
    if (window.__FIREBASE_LOG_EVENT__ && !window.__HOOKED__) {
      window.__HOOKED__ = true;
      const origLog = window.__FIREBASE_LOG_EVENT__;
      window.__FIREBASE_LOG_EVENT__ = function (analytics, name, params) {
        window.__onTrackEvent({ name, params: params || {} });
        return origLog.apply(this, arguments);
      };
      clearInterval(interval);
    }
  }, 50);
});

// --- Test 1: Page View on /us/401k-calculator.html ---
console.log("Test 1: Navigate to /us/401k-calculator.html (Testing page_view & Firebase init)");
await page.goto(`${BASE}/us/401k-calculator.html`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);

const hasPv = loggedEvents.some((e) => e.name === "page_view");
console.log(`Result 1: page_view tracked? ${hasPv ? "✅ YES" : "❌ NO"}`);

// --- Test 2: Chip Click ---
console.log("\nTest 2: Click a preset chip on 401(k) calculator");
const chip = await page.$(".chips-wrap button.chip");
if (chip) {
  await chip.click();
  await page.waitForTimeout(300);
}
const hasChip = loggedEvents.some((e) => e.name === "calc_chip_click");
console.log(`Result 2: calc_chip_click tracked? ${hasChip ? "✅ YES" : "❌ NO"}`);

// --- Test 3: Slider change ---
console.log("\nTest 3: Move a range slider");
const slider = await page.$("input[type='range']");
if (slider) {
  await slider.evaluate((el) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
    if (setter) {
      setter.call(el, "120000");
    } else {
      el.value = "120000";
    }
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
  await page.waitForTimeout(600); // wait for 400ms debounce
}
const hasSlider = loggedEvents.some((e) => e.name === "calc_slider_change");
console.log(`Result 3: calc_slider_change tracked? ${hasSlider ? "✅ YES" : "❌ NO"}`);

// --- Test 4: Copy Results ---
console.log("\nTest 4: Click 'Copy Results' button");
const copyBtn = await page.$(".calc-actions button");
if (copyBtn) {
  await copyBtn.click();
  await page.waitForTimeout(300);
}
const hasCopy = loggedEvents.some((e) => e.name === "calc_copy_result");
console.log(`Result 4: calc_copy_result tracked? ${hasCopy ? "✅ YES" : "❌ NO"}`);

// --- Test 5: FAQ toggle ---
console.log("\nTest 5: Toggle FAQ accordion");
const faqSummary = await page.$(".faq-item summary");
if (faqSummary) {
  await faqSummary.click();
  await page.waitForTimeout(300);
}
const hasFaq = loggedEvents.some((e) => e.name === "faq_toggle");
console.log(`Result 5: faq_toggle tracked? ${hasFaq ? "✅ YES" : "❌ NO"}`);

// --- Test 6: Cookie consent ---
console.log("\nTest 6: Click Cookie Consent button");
const consentBtn = await page.$(".cookie-actions button");
if (consentBtn) {
  await consentBtn.click();
  await page.waitForTimeout(300);
}
const hasConsent = loggedEvents.some((e) => e.name === "cookie_consent");
console.log(`Result 6: cookie_consent tracked? ${hasConsent ? "✅ YES" : "❌ NO"}`);

// --- Test 7: Homepage Search & Unit Converter ---
console.log("\nTest 7: Navigate to Homepage / and test search & unit converter");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const searchInput = await page.$("#tool-search");
if (searchInput) {
  await searchInput.fill("SIP");
  await searchInput.dispatchEvent("input");
  await page.waitForTimeout(900); // wait for 800ms debounce
}
const hasSearch = loggedEvents.some((e) => e.name === "search");
console.log(`Result 7a: search tracked? ${hasSearch ? "✅ YES" : "❌ NO"}`);

const convInput = await page.$("#conversion-input");
if (convInput) {
  await convInput.fill("10 km to mile");
  await convInput.dispatchEvent("input");
  await page.waitForTimeout(800); // wait for 700ms debounce
}
const hasUnit = loggedEvents.some((e) => e.name === "unit_convert");
console.log(`Result 7b: unit_convert tracked? ${hasUnit ? "✅ YES" : "❌ NO"}`);

await browser.close();

console.log("\n=======================================================");
console.log(`ANALYTICS ACTION VERIFICATION COMPLETE:`);
console.log(`  Total Action Events Recorded: ${loggedEvents.length}`);
console.log(`  page_view:         ${hasPv ? "PASS" : "FAIL"}`);
console.log(`  calc_chip_click:   ${hasChip ? "PASS" : "FAIL"}`);
console.log(`  calc_slider_change:${hasSlider ? "PASS" : "FAIL"}`);
console.log(`  calc_copy_result:  ${hasCopy ? "PASS" : "FAIL"}`);
console.log(`  faq_toggle:        ${hasFaq ? "PASS" : "FAIL"}`);
console.log(`  cookie_consent:    ${hasConsent ? "PASS" : "FAIL"}`);
console.log(`  search:            ${hasSearch ? "PASS" : "FAIL"}`);
console.log(`  unit_convert:      ${hasUnit ? "PASS" : "FAIL"}`);
console.log("=======================================================\n");

const allPassed = hasPv && hasChip && hasSlider && hasCopy && hasFaq && hasConsent && hasSearch && hasUnit;
process.exit(allPassed ? 0 : 1);
