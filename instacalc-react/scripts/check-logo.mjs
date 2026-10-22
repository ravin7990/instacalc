/**
 * Guards the header brand/logo against the oversized-render bug.
 *
 * logo.png is a 500x500 source. React initially had no `.brand img` rule, so
 * the image rendered at its intrinsic size and blew up the header. This check
 * asserts the CSS constrains the box and matches legacy (38x38), that the HTML
 * width/height attributes agree with the CSS (no layout shift before the
 * stylesheet loads), and that the brand label is the full site name.
 *
 * Run: node scripts/check-logo.mjs
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT = join(import.meta.dirname, "..");
const CSS_FILES = [join(ROOT, "src/styles/app.css"), join(ROOT, "src/styles/tokens.css")];
const HEADER = join(ROOT, "src/components/layout/SiteHeader.tsx");

const LEGACY_LOGO_PX = 38;
const LEGACY_BRAND_FONT_REM = 1.2;

const css = CSS_FILES.map((f) => readFileSync(f, "utf8")).join("\n");
const header = readFileSync(HEADER, "utf8");

const problems = [];

// 1. `.brand img` must exist and constrain BOTH dimensions.
const imgRule = css.match(/\.brand img\s*\{([^}]*)\}/);
if (!imgRule) {
  problems.push(
    "no `.brand img` rule — logo.png is a 500x500 source and will render at " +
      "intrinsic size, blowing up the header",
  );
} else {
  const body = imgRule[1];
  const w = body.match(/(^|;)\s*width\s*:\s*([^;]+)/);
  const h = body.match(/(^|;)\s*height\s*:\s*([^;]+)/);
  console.log(`[logo] .brand img width=${w?.[2].trim() ?? "MISSING"} height=${h?.[2].trim() ?? "MISSING"}`);
  if (!w) problems.push("`.brand img` does not set width");
  if (!h) problems.push("`.brand img` does not set height");
  for (const [name, m] of [["width", w], ["height", h]]) {
    if (m && !m[2].includes(String(LEGACY_LOGO_PX))) {
      problems.push(
        `.brand img ${name} is "${m[2].trim()}" but legacy uses ${LEGACY_LOGO_PX}px`,
      );
    }
  }
}

// 2. `.brand` typography should match legacy so the wordmark reads the same size.
const brandRule = css.match(/\.brand\s*\{([^}]*)\}/);
if (!brandRule) {
  problems.push("no `.brand` rule");
} else {
  const fs = brandRule[1].match(/(^|;)\s*font-size\s*:\s*([^;]+)/);
  console.log(`[logo] .brand font-size=${fs?.[2].trim() ?? "MISSING"}`);
  if (!fs) {
    problems.push("`.brand` has no font-size — the wordmark will render at inherited size");
  } else if (!fs[2].includes(String(LEGACY_BRAND_FONT_REM))) {
    problems.push(
      `.brand font-size is "${fs[2].trim()}" but legacy uses ${LEGACY_BRAND_FONT_REM}rem`,
    );
  }
}

// 3. The <img> attributes must match the CSS, or the pre-CSS box is wrong.
const imgTag = header.match(/<img[\s\S]*?\/>/);
if (!imgTag) {
  problems.push("header has no <img> for the logo");
} else {
  const tag = imgTag[0];
  const w = tag.match(/width=\{(\d+)\}/);
  const h = tag.match(/height=\{(\d+)\}/);
  console.log(`[logo] <img> width=${w?.[1] ?? "MISSING"} height=${h?.[1] ?? "MISSING"}`);
  if (!w || Number(w[1]) !== LEGACY_LOGO_PX) {
    problems.push(`<img> width attribute is ${w?.[1] ?? "missing"}, expected ${LEGACY_LOGO_PX}`);
  }
  if (!h || Number(h[1]) !== LEGACY_LOGO_PX) {
    problems.push(`<img> height attribute is ${h?.[1] ?? "missing"}, expected ${LEGACY_LOGO_PX}`);
  }
  if (!/\balt=/.test(tag)) problems.push("logo <img> has no alt attribute");
}

// 4. The brand label must be the full display name ("InstaCalc.in").
if (!header.includes("SITE.displayName")) {
  problems.push(
    "header brand does not render SITE.displayName — expected the full " +
      '"InstaCalc.in" wordmark',
  );
}

// 5. Confirm the shipped build actually applies the rule.
const dist = join(ROOT, "dist/index.html");
try {
  const built = readFileSync(dist, "utf8");
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => errors.push(e.message));
  const dom = new JSDOM(built, { virtualConsole: vc });
  const style = dom.window.document.querySelector("style")?.textContent ?? "";
  const sheetRule = style.match(/\.brand img\s*\{([^}]*)\}/);
  if (!sheetRule) {
    problems.push("built page does not inline a `.brand img` rule");
  } else {
    const w = sheetRule[1].match(/(^|;)\s*width\s*:\s*([^;]+)/);
    const h = sheetRule[1].match(/(^|;)\s*height\s*:\s*([^;]+)/);
    console.log(`[logo] built page .brand img width=${w?.[2].trim()} height=${h?.[2].trim()}`);
    if (!w || !w[2].includes(String(LEGACY_LOGO_PX))) {
      problems.push("built CSS does not constrain the logo width to 38px");
    }
    if (!h || !h[2].includes(String(LEGACY_LOGO_PX))) {
      problems.push("built CSS does not constrain the logo height to 38px");
    }
  }
  const m = built.match(/<img[^>]*src="\/logo\.png"[^>]*>/);
  console.log(`[logo] built markup ${m ? m[0] : "logo img NOT FOUND"}`);
  dom.window.close();
} catch {
  problems.push("dist/index.html not found — run npm run build first");
}

if (problems.length === 0) {
  console.log("\n[logo] PASS — header logo matches legacy (38x38) and stays sized.");
  process.exit(0);
}
console.error(`\n[logo] FAIL — ${problems.length} problem(s):\n`);
for (const p of problems) console.error(`  ${p}`);
process.exit(1);
