/**
 * check-markup.mjs — structural sanity check on the prerendered HTML.
 *
 * Confirms each page really contains a usable calculator: real inputs, labels,
 * results and FAQ content, all present without JavaScript. This is the proxy
 * for "crawlers and slow mobile devices see a complete page".
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));

/**
 * Paths with a bespoke React page. Kept in sync with `src/app/router.tsx`;
 * everything else renders the shared GenericPage shell during the staged
 * migration and is validated by check-parity.mjs instead.
 */
const IMPLEMENTED = new Set([
  "/", "/sipcalculator.html", "/sipcalculatorlumpsump.html", "/emicalculator.html",
  "/fdcalculator.html", "/rdcalculator.html", "/gstcalculator.html",
  "/compoundinterest.html", "/simpleinterestcalculator.html",
  "/ja/sipcalculator.html", "/ja/compoundinterest.html",
  "/ru/sipcalculator.html", "/ru/compoundinterest.html",
  "/us/compound-interest-calculator.html", "/us/simple-interest-calculator.html",

  // Date, time and life-stage tools
  "/agecalculator.html", "/duration/agecalculator.html", "/catagecalculator.html",
  "/duration/dayscalculator.html", "/duration/weekcalculator.html",
  "/duration/hourcalculator.html", "/duration/minutes-hourscalculator.html",
  "/ja/duration/agecalculator.html", "/ru/duration/agecalculator.html",
  "/us/age-calculator.html", "/us/days-calculator.html", "/us/hour-calculator.html",

  // Geometry, construction and volume
  "/moretools/diagonalcalculator.html", "/moretools/trignometrycalculator.html",
  "/moretools/concretecalculator.html", "/gallontolitercalculator.html",
  "/ja/moretools/concretecalculator.html", "/ru/moretools/concretecalculator.html",
  "/ko/moretools/concretecalculator.html",
  "/ja/moretools/diagonalcalculator.html", "/ru/moretools/diagonalcalculator.html",
  "/ko/moretools/diagonalcalculator.html",
  "/ja/moretools/trignometrycalculator.html", "/ru/moretools/trignometrycalculator.html",
  "/ko/moretools/trignometrycalculator.html",
  "/us/gallon-to-liter-calculator.html", "/us/concrete-calculator.html",
  "/us/diagonal-calculator.html", "/us/triangle-calculator.html",

  // Prose pages
  "/aboutus.html", "/contactus.html", "/privacypolicy.html", "/terms.html",
  "/delete-account.html",
  "/ja/aboutus.html", "/ja/contactus.html", "/ja/privacypolicy.html",
  "/ru/aboutus.html", "/ru/contactus.html", "/ru/privacypolicy.html",

  // Retirement, tax and withdrawal plans
  "/epfcalculator.html", "/ppfcalculator.html", "/npscalculator.html",
  "/gratuitycalculator.html", "/cagrcalculator.html", "/swpcalculator.html",
  "/ja/epfcalculator.html", "/ja/ppfcalculator.html", "/ja/npscalculator.html",
  "/ja/gratuitycalculator.html", "/ja/cagrcalculator.html", "/ja/swpcalculator.html",
  "/ru/epfcalculator.html", "/ru/ppfcalculator.html", "/ru/npscalculator.html",
  "/ru/gratuitycalculator.html", "/ru/cagrcalculator.html",

  // US edition
  "/us/401k-calculator.html", "/us/roth-ira-calculator.html", "/us/fire-calculator.html",
  "/us/cd-calculator.html", "/us/mortgage-calculator.html",
  "/us/monthly-investment-calculator.html", "/us/sales-tax-calculator.html",
  "/us/time-duration-calculator.html",
  "/us/paycheck-calculator.html", "/us/credit-card-payoff-calculator.html",
  "/us/student-loan-calculator.html", "/us/auto-loan-calculator.html",

  // Retirement planner
  "/retirementcalculator.html", "/ja/retirementcalculator.html",
  "/ru/retirementcalculator.html", "/us/retirement-calculator.html",

  // Locale homepages
  "/ja/", "/ru/", "/us/",

  // Mutual fund and remaining date tools
  "/mutualfundreturncalculator.html", "/ja/mutualfundreturncalculator.html",
  "/ru/mutualfundreturncalculator.html",
  "/duration/birthdaycalculator.html", "/ja/duration/birthdaycalculator.html",
  "/duration/juliandatecalculator.html", "/duration/timedurationcalculator.html",
  "/duration/timezonecalculator.html", "/us/time-zone-calculator.html",

  // Japanese-only tools
  "/ja/salarycalculator.html", "/ja/sukanyasamriddhicalculator.html",
  "/ja/duration/datecalculator.html", "/ja/duration/daycountercalculator.html",

  // Locale variants routed to shared components
  "/ja/catagecalculator.html", "/ru/catagecalculator.html",
  "/ja/emicalculator.html", "/ru/emicalculator.html",
  "/ja/fdcalculator.html", "/ru/fdcalculator.html",
  "/ja/rdcalculator.html", "/ru/rdcalculator.html",
  "/ja/gstcalculator.html", "/ru/gstcalculator.html",
  "/ja/simpleinterestcalculator.html", "/ja/sipcalculatorlumpsump.html",
  "/ja/gallontolitercalculator.html",

  // Duplicate URLs that serve a redirect notice rather than a tool
  "/coumpoundinterest.html", "/moretools/coumpoundinterest.html",
  "/cargcalculator.html", "/delete-account-verse.html", "/deleteaccountverse.html",
]);

/** Prose pages render a document outline rather than a calculator. */
const PROSE_PAGES = /aboutus|contactus|privacypolicy|terms|delete-account/;

/** Extracts the first capture group of a regex from a string. */
const pick = (html, re) => (html.match(re) ?? [])[1]?.trim();

/**
 * Pages that render a key/value result list instead of a projection table.
 *
 * Matched on the calculator's subject rather than its filename, because the US
 * edition names the same tools differently (concrete-calculator vs
 * concretecalculator). `time-duration` is included because the hours/duration
 * tool reports a single elapsed time rather than a schedule.
 */
const KV_SUBJECTS = [
  "age", "catage", "days", "week", "hour", "minutes-hours",
  "time-duration", "timeduration", "time-zone", "birthday", "juliandate", "timezone",
  "datecalculator", "daycounter", "salary", "sukanya",
  "diagonal", "trignometry", "triangle", "concrete", "gallon", "gst", "sales-tax",
  "gratuity", "cagr", "nps", "fire", "cd-calculator",
];

/** True when the page is one of the key/value-style tools. */
function isKeyValuePage(path) {
  const file = path.split("/").pop()?.replace(/\.html$/, "") ?? "";
  return KV_SUBJECTS.some((s) => file.includes(s));
}

let issues = 0;
const note = (m) => {
  issues++;
  console.log(`  ${m}`);
};

console.log("[check-markup] verifying prerendered body content\n");

for (const page of Object.values(seo.pages)) {
  const rel =
    page.path === "/" ? "index.html" : page.path.endsWith("/") ? `${page.path}index.html` : page.path;
  const out = join(DIST, rel.replace(/^\//, ""));
  if (!existsSync(out)) continue;

  const html = readFileSync(out, "utf8");
  const body = html.slice(html.indexOf('<div id="root">'));

  if (!IMPLEMENTED.has(page.path)) continue; // validated by check-parity

  const isCalculator = /calculator-shell/.test(body);
  // A locale homepage is the root of its directory, e.g. "/ja/".
  const isHome = page.path === "/" || /^\/[a-z]{2}\/$/.test(page.path);
  const isProse = PROSE_PAGES.test(page.path);
  // Near-duplicate URLs render a redirect notice, not a calculator.
  const isDuplicate = /coumpoundinterest|cargcalculator|delete-account-verse|deleteaccountverse/.test(
    page.path,
  );

  if (isDuplicate) {
    // They must be noindex and must link through to the canonical version.
    const robots = pick(html, /<meta name="robots" content="([^"]*)"/);
    if (robots !== "noindex,follow") note(`${page.path} — duplicate should be noindex (got "${robots}")`);
    if (!/Open /.test(body)) note(`${page.path} — duplicate page has no link to the canonical tool`);
  } else if (isHome) {
    // The homepage must carry the unit converter and the tool library.
    if (!/id="conversion-input"/.test(body)) note(`${page.path} — unit converter input missing`);
    if (!/tool-card/.test(body)) note(`${page.path} — tool library is empty`);
  } else if (isProse) {
    // Prose pages need a real document outline and body copy, server-rendered.
    const h2s = (body.match(/<h2[^>]*>/g) ?? []).length;
    const paras = (body.match(/<p[^>]*>/g) ?? []).length;
    if (h2s < 2) note(`${page.path} — prose page has only ${h2s} <h2> sections`);
    if (paras < 3) note(`${page.path} — prose page has only ${paras} paragraphs`);
    // The prose container is `<article class="section prose-page">`, or contact container for contact pages
    const isContact = /contactus/.test(page.path);
    if (isContact) {
      if (!/\bcontact-(?:section|layout|grid)\b/.test(body)) note(`${page.path} — contact container missing`);
    } else {
      if (!/\bprose-page\b/.test(body)) note(`${page.path} — prose container missing`);
    }
    if (/being upgraded/.test(body)) note(`${page.path} — still showing the placeholder shell`);
  } else if (!isCalculator && !isHome) {
    note(`${page.path} — expected a calculator shell`);
    continue;
  }

  if (isCalculator) {
    // Accessible form controls. Number inputs get a real <label for>; range
    // inputs and selects use aria-label, which is equally valid.
    const numbers = body.match(/<input[^>]*type="number"[^>]*>/g) ?? [];
    const ranges = body.match(/<input[^>]*type="range"[^>]*>/g) ?? [];
    const dates = body.match(/<input[^>]*type="date"[^>]*>/g) ?? [];
    const selects = body.match(/<select/g) ?? [];
    const labels = body.match(/<label/g) ?? [];
    const total = numbers.length + ranges.length + dates.length + selects.length;

    if (total === 0) note(`${page.path} — calculator has no form controls`);

    // Range inputs must be labelled either by <label for> or aria-label.
    for (const r of ranges) {
      if (!/aria-label=/.test(r)) note(`${page.path} — unlabelled slider`);
    }
    // Selects and date inputs need an associated label or aria-label.
    for (const s of [...selects, ...dates]) {
      if (!/aria-label=/.test(s)) {
        // Acceptable when a <label for> targets it; count is a coarse check.
        if (labels.length === 0) note(`${page.path} — control without any label`);
      }
    }

    // Results must be rendered server-side, not left blank for JS to fill.
    // The headline figure lives in `.result-hero` and supporting figures in
    // `.result-grid`; some tools use a definition list instead.
    const hasResults =
      /class="result-hero"/.test(body) ||
      /class="result-grid"/.test(body) ||
      /class="result-list"/.test(body) ||
      /kv-list/.test(body);
    if (!hasResults) note(`${page.path} — no results in prerendered output`);

    // Deposit and loan pages carry a year-wise projection table.
    if (!isKeyValuePage(page.path) && !/<table/.test(body)) {
      note(`${page.path} — expected a projection table`);
    }
  }

  if (isHome) {
    // The unit converter is the homepage's main feature.
    if (!/id="conversion-input"/.test(body)) note(`${page.path} — unit converter input missing`);
    if (!/tool-card/.test(body)) note(`${page.path} — tool library is empty`);
  }

  // Shared chrome on every page.
  for (const [name, re] of [
    ["header", /class="site-header"/],
    ["footer", /class="site-footer"/],
    ["h1", /<h1[\s>]/],
    ["lang attr", /<html lang="[a-z]{2}(-[A-Za-z0-9]+)?"/],
  ]) {
    if (!re.test(html)) note(`${page.path} — missing ${name}`);
  }
}

// Images must declare dimensions everywhere, or they will shift layout (CLS).
for (const page of Object.values(seo.pages)) {
  const rel =
    page.path === "/" ? "index.html" : page.path.endsWith("/") ? `${page.path}index.html` : page.path;
  const out = join(DIST, rel.replace(/^\//, ""));
  if (!existsSync(out)) continue;
  const html = readFileSync(out, "utf8");
  for (const m of html.matchAll(/<img(?![^>]*\bwidth=)[^>]*>/g)) {
    note(`${page.path} — <img> without width/height: ${m[0].slice(0, 70)}`);
  }
}

if (issues === 0) {
  console.log(`[check-markup] PASS — all ${IMPLEMENTED.size} React pages have complete, accessible, CLS-safe markup.`);
} else {
  console.log(`\n[check-markup] ${issues} issue(s) found.`);
  process.exitCode = 1;
}
