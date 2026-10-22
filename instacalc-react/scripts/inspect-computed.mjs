/**
 * Renders the served page in jsdom and reports COMPUTED styles for the
 * elements that looked unstyled in the browser screenshot. This is the ground
 * truth: if `.btn` computes to a background and padding here, the CSS is fine
 * and the problem is elsewhere (caching, a different URL, an extension).
 *
 * Usage: node scripts/inspect-computed.mjs [path]
 */
import { JSDOM } from "jsdom";

const BASE = process.env.SMOKE_URL ?? "http://localhost:8000";
const PATHNAME = process.argv[2] ?? "/";

const html = await (await fetch(`${BASE}${PATHNAME}`)).text();
const dom = new JSDOM(html, { pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

// getComputedStyle in jsdom resolves cascade + custom properties for real
// stylesheet rules (it does not run layout, so widths report as "auto").
const probe = (sel, props) => {
  const el = document.querySelector(sel);
  if (!el) return console.log(`  ${sel}: NOT FOUND`);
  const cs = window.getComputedStyle(el);
  const out = Object.entries(props)
    .map(([k]) => `${k}=${cs.getPropertyValue(k) || "(empty)"}`)
    .join("  ");
  console.log(`  ${sel}\n    ${out}`);
};

console.log(`[computed] ${PATHNAME} (${html.length} chars)\n`);

console.log("[computed] stylesheets seen by the parser:");
for (const ss of document.styleSheets) {
  const rules = ss.cssRules?.length ?? "?";
  console.log(`  <style> rules=${rules} media=${ss.media?.mediaText || "(none)"}`);
}

console.log("\n[computed] design tokens resolve:");
const rootStyle = window.getComputedStyle(document.documentElement);
for (const t of ["--ic-primary", "--ic-gap", "--ic-container", "--ic-radius-md", "--ic-border"]) {
  console.log(`  ${t} = ${rootStyle.getPropertyValue(t) || "(UNDEFINED)"}`);
}

console.log("\n[computed] key elements:");
probe(".btn.btn-primary", {
  "background-color": 1, display: 1, "min-height": 1, padding: 1, "border-radius": 1, color: 1,
});
probe(".hero-actions", { display: 1, gap: 1, "margin-top": 1 });
probe(".quick-links", { "list-style-type": 1, display: 1 });
probe(".quick-link", { display: 1, padding: 1, background: 1, "border-radius": 1, color: 1, "text-decoration-line": 1 });
probe(".hero-copy", { background: 1, padding: 1, "border-radius": 1, display: 1 });
probe(".hero-badges", { display: 1, "grid-template-columns": 1 });
probe(".badge-card", { padding: 1, border: 1, background: 1, display: 1 });
probe(".hero-tag", { display: 1, padding: 1, background: 1, "border-radius": 1, color: 1 });
probe(".container", { "max-width": 1, "padding-inline": 1, width: 1 });
probe("h1", { "font-size": 1, "font-family": 1, "font-weight": 1 });

probe(".brand", { display: 1, "font-size": 1, "font-weight": 1, gap: 1, "letter-spacing": 1 });
probe(".brand img", { width: 1, height: 1, "border-radius": 1, "object-fit": 1, "flex-shrink": 1 });
const brandImg = document.querySelector(".brand img");
if (brandImg) {
  console.log(
    `  [attrs] src=${brandImg.getAttribute("src")} ` +
      `w=${brandImg.getAttribute("width")} h=${brandImg.getAttribute("height")} ` +
      `alt="${brandImg.getAttribute("alt")}"`,
  );
  const brandText = document.querySelector(".brand span");
  console.log(`  [text] brand label = "${brandText?.textContent.trim()}"`);
} else {
  console.log("  [attrs] .brand img NOT FOUND");
}
console.log("\n[computed] language switcher + footer:");
probe(".lang-switch", { display: 1, height: 1, "border-radius": 1, padding: 1, "align-items": 1 });
probe(".lang-switch select", { "font-size": 1, "font-weight": 1, color: 1, height: 1 });
probe(".site-footer", { background: 1, "margin-top": 1, "border-top-width": 1 });
probe(".footer-inner", { display: 1, gap: 1 });
probe(".footer-tagline", { color: 1, "font-size": 1 });
probe(".footer-links", { display: 1, gap: 1, "flex-wrap": 1 });
probe(".footer-links a", { color: 1, "font-size": 1, "font-weight": 1 });
probe(".footer-bottom", { "margin-top": 1, padding: 1, color: 1 });

probe(".tool-card", { display: 1, padding: 1, "border-radius": 1, "min-height": 1 });
probe(".tool-card-label", { "font-weight": 1 });
probe(".tool-card-group", { "font-size": 1, color: 1 });
probe(".filter-chip", { display: 1, "border-radius": 1, padding: 1 });
probe(".result-count", { color: 1, "font-size": 1 });
probe(".hero-search-input", { width: 1, height: 1, "border-radius": 1, padding: 1 });
probe(".hero-search-icon", { display: 1, position: 1, left: 1 });
probe(".tool-grid", { display: 1, "grid-template-columns": 1, gap: 1 });

console.log("\n[computed] library inventory:");
const cards = [...document.querySelectorAll(".tool-card")];
console.log(`  tool cards rendered: ${cards.length}`);
console.log(`  first 3: ${cards.slice(0, 3).map((c) => c.querySelector(".tool-card-label")?.textContent).join(" | ")}`);
const chips = [...document.querySelectorAll(".filter-chip")];
console.log(`  filter chips: ${chips.length}`);
chips.forEach((c) => console.log(`    ${c.textContent.trim()}  [pressed=${c.getAttribute("aria-pressed")}]`));
console.log(`  result count text: "${document.querySelector(".result-count")?.textContent.trim()}"`);
console.log(`  hero search present: ${!!document.querySelector(".hero-search-input")}`);

console.log("\n[computed] site header:");
probe(".site-header", { background: 1, display: 1, height: 1 });
probe(".brand img", { width: 1, height: 1, "border-radius": 1 });
