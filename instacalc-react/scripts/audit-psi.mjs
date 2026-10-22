/**
 * audit-psi.mjs — PageSpeed Insights v5 audit gate.
 *
 * Hits https://www.googleapis.com/pagespeedonline/v5/runPagespeed for both
 * mobile and desktop, then checks each metric against the "Good" thresholds
 * published in the Core Web Vitals documentation.
 *
 *   Field (CrUX)      FCP <= 1800ms  LCP <= 2500ms  CLS <= 0.1
 *                      INP <= 200ms   TTFB <= 800ms
 *   Lab (Lighthouse)  TBT <= 200ms   Speed Index <= 3400ms
 *
 * Usage:
 *   node scripts/audit-psi.mjs                       # audits the local preview
 *   PSI_URL=https://instacalc.in node scripts/...    # audits production
 *   PSI_KEY=<google-api-key> node scripts/...        # key raises rate limits
 *   PSI_PATHS=/,/sipcalculator.html node scripts/... # limit to key pages
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

/**
 * Base URL of the preview server. The port follows the Vite config, which
 * derives it from `PORT` (dev = PORT, preview = PORT + 1000).
 */
const DEFAULT_PORT = Number(process.env.PORT ?? 7000) + 1000;
const BASE = (process.env.PSI_URL ?? `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, "");
const KEY = process.env.PSI_KEY;
const STRATEGIES = ["mobile", "desktop"];

/** "Good" thresholds. Anything at or under these passes. */
const THRESHOLDS = {
  "first-contentful-paint": 1800,
  "largest-contentful-paint": 2500,
  "cumulative-layout-shift": 0.1,
  "total-blocking-time": 200,
  "speed-index": 3400,
  "interactive": 3800,
};

/** Which PSI audit key each metric lives under. */
const METRIC_PATHS = {
  "first-contentful-paint": "audits.first-contentful-paint.numericValue",
  "largest-contentful-paint": "audits.largest-contentful-paint.numericValue",
  "cumulative-layout-shift": "audits.cumulative-layout-shift.numericValue",
  "total-blocking-time": "audits.total-blocking-time.numericValue",
  "speed-index": "audits.speed-index.numericValue",
  "interactive": "audits.interactive.numericValue",
};

const pick = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

/** Pages to audit: the key landing pages plus every calculator we converted. */
function targetPaths() {
  if (process.env.PSI_PATHS) return process.env.PSI_PATHS.split(",").map((s) => s.trim());
  return ["/", "/sipcalculator.html", "/compoundinterest.html", "/ematicalculator.html", "/fdcalculator.html", "/gstcalculator.html", "/us/compound-interest-calculator.html", "/ja/sipcalculator.html"];
}

async function audit(url, strategy) {
  const qs = new URLSearchParams({ url, strategy, category: ["performance", "seo"] });
  if (KEY) qs.set("key", KEY);

  const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${qs}`);
  const json = await res.json();

  if (!res.ok) {
    const msg = json?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const scores = {
    performance: Math.round((json.lighthouseResult?.categories?.performance?.score ?? 0) * 100),
    seo: Math.round((json.lighthouseResult?.categories?.seo?.score ?? 0) * 100),
  };

  const metrics = {};
  for (const [name, p] of Object.entries(METRIC_PATHS)) {
    const raw = pick(json.lighthouseResult, p);
    if (typeof raw === "number") metrics[name] = raw;
  }
  return { scores, metrics };
}

const fmt = (name, v) =>
  name === "cumulative-layout-shift" ? v.toFixed(3) : `${Math.round(v)}ms`;

let failures = 0;
const rows = [];

for (const path of targetPaths()) {
  const url = `${BASE}${path}`;
  for (const strategy of STRATEGIES) {
    let result;
    try {
      result = await audit(url, strategy);
    } catch (err) {
      console.log(`SKIP  ${url} [${strategy}] — ${err.message}`);
      continue;
    }

    const bad = [];
    for (const [name, value] of Object.entries(result.metrics)) {
      const limit = THRESHOLDS[name];
      if (limit !== undefined && value > limit) bad.push(`${name}=${fmt(name, value)} (limit ${fmt(name, limit)})`);
    }
    if (result.scores.seo < 90) bad.push(`seo score ${result.scores.seo}`);

    if (bad.length) failures++;
    rows.push({ path, strategy, ...result.scores, metrics: result.metrics, bad });
  }
}

// --- report ---------------------------------------------------------------
console.log("\nPageSpeed Insights audit");
console.log("=" .repeat(78));
for (const r of rows) {
  const status = r.bad.length ? "FAIL" : "PASS";
  console.log(`${status}  ${r.path}  [${r.strategy}]  perf=${r.scores.performance} seo=${r.scores.seo}`);
  console.log(
    "      " +
      Object.entries(r.metrics)
        .map(([k, v]) => `${k.split("-").map((s) => s[0]).join("").toUpperCase()}=${fmt(k, v)}`)
        .join("  "),
  );
  for (const b of r.bad) console.log(`      ! ${b}`);
}
console.log("=" .repeat(78));

if (!rows.length) {
  console.log("No results. Start a preview server first:  npm run preview");
} else if (failures) {
  console.log(`${failures} of ${rows.length} runs exceeded a "Good" threshold.`);
  process.exitCode = 1;
} else {
  console.log(`All ${rows.length} runs are within the "Good" thresholds.`);
}
