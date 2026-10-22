/**
 * check-new-pages.mjs — confirms the newly converted tools prerender real content.
 * Usage: node scripts/check-new-pages.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

const targets = [
  ["agecalculator.html", "Age"],
  ["catagecalculator.html", "Cat Age"],
  ["duration/dayscalculator.html", "Days"],
  ["duration/weekcalculator.html", "Week"],
  ["duration/hourcalculator.html", "Hours"],
  ["duration/minutes-hourscalculator.html", "Minutes to Hours"],
  ["moretools/diagonalcalculator.html", "Diagonal"],
  ["moretools/trignometrycalculator.html", "Triangle"],
  ["moretools/concretecalculator.html", "Concrete"],
  ["gallontolitercalculator.html", "Gallon"],
  ["ja/moretools/concretecalculator.html", "Concrete (ja)"],
  ["ru/moretools/diagonalcalculator.html", "Diagonal (ru)"],
  ["us/age-calculator.html", "Age (us)"],

  // Retirement, tax and withdrawal plans
  ["epfcalculator.html", "EPF"],
  ["ppfcalculator.html", "PPF"],
  ["npscalculator.html", "NPS"],
  ["gratuitycalculator.html", "Gratuity"],
  ["cagrcalculator.html", "CAGR"],
  ["swpcalculator.html", "SWP"],
  ["ru/cagrcalculator.html", "CAGR (ru)"],

  // US edition
  ["us/401k-calculator.html", "401(k)"],
  ["us/roth-ira-calculator.html", "Roth IRA"],
  ["us/fire-calculator.html", "FIRE"],
  ["us/cd-calculator.html", "CD"],
  ["us/mortgage-calculator.html", "Mortgage"],
  ["us/monthly-investment-calculator.html", "Monthly Investment"],
  ["us/sales-tax-calculator.html", "Sales Tax"],

  // Retirement planner (shared across locales)
  ["retirementcalculator.html", "Retirement"],
  ["ja/retirementcalculator.html", "Retirement (ja)"],
  ["us/retirement-calculator.html", "Retirement (us)"],

  // Locale homepages
  ["index.html", "Home (en)"],

  // Mutual fund and remaining date tools
  ["mutualfundreturncalculator.html", "Mutual Fund"],
  ["ja/mutualfundreturncalculator.html", "Mutual Fund (ja)"],
  ["duration/birthdaycalculator.html", "Birthday"],
  ["duration/juliandatecalculator.html", "Julian Date"],
  ["duration/timedurationcalculator.html", "Time Duration"],
  ["duration/timezonecalculator.html", "Time Zone"],
  ["us/time-zone-calculator.html", "Time Zone (us)"],

  // Japanese-only tools
  ["ja/salarycalculator.html", "Salary (ja)"],
  ["ja/duration/datecalculator.html", "Date Calc (ja)"],
  ["ja/duration/daycountercalculator.html", "Day Counter (ja)"],

  // Locale variants routed to shared components
  ["ja/emicalculator.html", "EMI (ja)"],
  ["ru/compoundinterest.html", "Compound (ru)"],
  ["ja/sipcalculatorlumpsump.html", "Lumpsum (ja)"],
];

let bad = 0;
console.log("[check-new-pages] prerendered content\n");

for (const [file, label] of targets) {
  const out = join(DIST, file);
  if (!existsSync(out)) {
    console.log(`  MISSING  ${label.padEnd(20)} ${file}`);
    bad++;
    continue;
  }

  const html = readFileSync(out, "utf8");
  const start = html.indexOf('<div id="root">');
  const body = start >= 0 ? html.slice(start) : "";

  const h1 = /<h1[\s>]/.test(body);
  const shell = /calculator-shell/.test(body);
  const results = /kv-list|result-list|result-grid|result-hero/.test(body);
  const fallback = /page-loading/.test(body);
  const inputs = (body.match(/<input|<select/g) ?? []).length;

  // Results must contain real numbers server-side, not placeholders or NaN.
  const values = [...body.matchAll(/class="kv-value">([^<]*)</g), ...body.matchAll(/class="result-value">([^<]*)</g)]
    .map((m) => m[1].trim())
    .filter(Boolean);
  const real = values.filter((v) => !/^(—|-|--)$/.test(v) && !/NaN|Infinity/.test(v));

  // The homepage is not a calculator: it has the unit converter and tool library.
  const isHome = /(^|\/)index\.html$/.test(file);

  const ok = isHome
    ? h1 && !fallback && /conversion-input/.test(body) && /tool-card/.test(body)
    : h1 && shell && results && !fallback && real.length > 0;
  if (!ok) bad++;

  console.log(
    `  ${ok ? "OK  " : "FAIL"}  ${label.padEnd(20)} ` +
      `h1=${h1} shell=${shell} results=${results} controls=${inputs} ` +
      `values=${real.length}/${values.length} fallback=${fallback}`,
  );
}

console.log(bad ? `\n[check-new-pages] ${bad} page(s) failed.` : "\n[check-new-pages] PASS — all converted pages render real content.");
if (bad) process.exitCode = 1;
