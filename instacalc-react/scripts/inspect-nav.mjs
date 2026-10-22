/**
 * Reviews the rendered header and footer: which CSS rules actually match, what
 * each element computes to, and the nav link inventory.
 *
 * This exists because the missing-brace bug lived in the header/footer region
 * of the stylesheet, and reading the source was not enough to trust it.
 *
 * Usage: node scripts/inspect-nav.mjs [path]
 */
import { JSDOM } from "jsdom";

const BASE = process.env.SMOKE_URL ?? "http://localhost:8000";
const PATHNAME = process.argv[2] ?? "/";

const html = await (await fetch(`${BASE}${PATHNAME}`)).text();
const dom = new JSDOM(html, { pretendToBeVisual: true });
const { window } = dom;
const { document } = window;

console.log(`[nav] ${PATHNAME} — ${html.length} chars\n`);

const sheet = document.styleSheets[0];
const rules = [];
const collect = (list) => {
  for (const r of list) {
    if (r.selectorText) rules.push(r.selectorText);
    else if (r.cssRules) collect(r.cssRules);
  }
};
collect(sheet.cssRules);

const matches = (el, sel) => {
  try {
    return el.matches(sel);
  } catch {
    return false;
  }
};

// Which top-level rules match each region?
const region = (label, root) => {
  console.log(`[nav] ${label}`);
  if (!root) {
    console.log("  NOT RENDERED");
    return;
  }
  const hit = [];
  for (const r of rules) {
    for (const part of r.split(",")) {
      const sel = part.trim();
      if (!sel) continue;
      if (matches(root, sel)) hit.push(sel);
    }
  }
  console.log(`  matched ${hit.length} rule(s): ${[...new Set(hit)].join(", ")}`);
};

const style = (el, props) => {
  if (!el) return "  (missing)";
  const cs = window.getComputedStyle(el);
  return Object.entries(props)
    .map(([k]) => `${k}=${cs.getPropertyValue(k) || "(empty)"}`)
    .join("  ");
};

console.log("=== TOP NAV ===\n");
region("header.site-header", document.querySelector(".site-header"));
region("div.header-inner", document.querySelector(".header-inner"));
region("a.brand", document.querySelector(".brand"));
region("button.menu-toggle", document.querySelector(".menu-toggle"));
region("nav.site-nav", document.querySelector(".site-nav"));

console.log("\n  computed:");
console.log("  .site-header  ", style(document.querySelector(".site-header"), {
  position: 1, "background-color": 1, "border-bottom-width": 1, "z-index": 1,
}));
console.log("  .header-inner ", style(document.querySelector(".header-inner"), {
  display: 1, "align-items": 1, gap: 1, "min-height": 1,
}));
console.log("  .brand        ", style(document.querySelector(".brand"), {
  display: 1, "font-weight": 1, color: 1,
}));
console.log("  .menu-toggle  ", style(document.querySelector(".menu-toggle"), {
  display: 1, width: 1, height: 1, "border-radius": 1, "margin-left": 1,
}));
console.log("  .site-nav     ", style(document.querySelector(".site-nav"), {
  display: 1, gap: 1, "margin-left": 1, position: 1,
}));

const brand = document.querySelector(".brand");
console.log(`\n  brand logo: ${brand?.querySelector("img")?.getAttribute("src") ?? "(none)"}`);
console.log(`  brand img attr size: w=${brand?.querySelector("img")?.getAttribute("width")} h=${brand?.querySelector("img")?.getAttribute("height")}`);

console.log("\n=== BOTTOM NAV ===\n");
region("footer.site-footer", document.querySelector(".site-footer"));
region("div.footer-inner", document.querySelector(".footer-inner"));
region("div.footer-brand", document.querySelector(".footer-brand"));
region("nav.footer-nav", document.querySelector(".footer-nav"));
region("div.footer-bottom", document.querySelector(".footer-bottom"));

console.log("\n  computed:");
console.log("  .site-footer  ", style(document.querySelector(".site-footer"), {
  "margin-top": 1, padding: 1, background: 1, "border-top-width": 1,
}));
console.log("  .footer-inner ", style(document.querySelector(".footer-inner"), {
  display: 1, "grid-template-columns": 1, gap: 1,
}));
console.log("  .footer-nav ul", style(document.querySelector(".footer-nav ul"), {
  display: 1, "list-style-type": 1, gap: 1,
}));
console.log("  .footer-bottom", style(document.querySelector(".footer-bottom"), {
  "margin-top": 1, padding: 1, color: 1,
}));

// Link inventory — catches missing/duplicate/empty labels.
const links = (root, label) => {
  const as = [...root.querySelectorAll("a")];
  console.log(`\n  ${label}: ${as.length} link(s)`);
  const seen = new Map();
  for (const a of as) {
    const href = a.getAttribute("href");
    const text = a.textContent.trim();
    if (!text) console.log(`    ! EMPTY label: ${href}`);
    if (seen.has(href)) {
      console.log(`    ! DUPLICATE href: ${href} ("${seen.get(href)}" and "${text}")`);
    }
    seen.set(href, text);
  }
  for (const [href, text] of seen) console.log(`    ${href}  ->  "${text}"`);
};

console.log("\n=== LINK INVENTORY ===");
links(document.querySelector(".site-header"), "header");
links(document.querySelector(".site-footer"), "footer");

// Accessibility: nav landmarks need labels, drawer state must be exposed.
console.log("\n=== A11Y ===");
for (const nav of document.querySelectorAll("nav")) {
  const cls = nav.className || "(no class)";
  console.log(`  nav.${cls}: aria-label=${nav.getAttribute("aria-label") ?? "MISSING"}`);
}
const toggle = document.querySelector(".menu-toggle");
console.log(`  .menu-toggle aria-expanded=${toggle?.getAttribute("aria-expanded") ?? "MISSING"}`);
console.log(`  .menu-toggle aria-controls=${toggle?.getAttribute("aria-controls") ?? "MISSING"}`);
const navEl = document.querySelector(".site-nav");
console.log(`  nav id=${navEl?.id ?? "MISSING"} (must match aria-controls)`);
const svg = document.querySelector(".site-header svg");
console.log(`  header svg aria-hidden=${svg?.getAttribute("aria-hidden") ?? "MISSING"}`);
