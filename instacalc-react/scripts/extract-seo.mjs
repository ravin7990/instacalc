/**
 * extract-seo.mjs
 *
 * Parses the legacy static site and emits `src/data/seo.generated.json`.
 * This guarantees the React build reproduces today's titles, descriptions,
 * keywords, canonicals, hreflang sets and JSON-LD verbatim — no SEO drift.
 *
 * Run:  node scripts/extract-seo.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { applyRuSeo } from "./update-ru-seo.mjs";
import { applyEnglishFaqs } from "./fix-hindi-faqs.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LEGACY = join(ROOT, "..");

const SKIP_DIRS = new Set(["node_modules", "scratch", "instacalc-react", ".git", ".github", "dist", ".freebuff", ".kilo"]);
const SITE_ORIGIN = "https://instacalc.in";

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

const pick = (html, re) => (html.match(re) || [])[1]?.trim();

function decode(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extract(html) {
  // Canonical is captured verbatim for parity, but must NOT drive the route.
  // 25 legacy pages declare a canonical that differs from their own path
  // (ru/* + ko/* point at their English twins; cargcalculator -> cagrcalculator).
  // The route is always the on-disk file path, because that is the URL we emit.
  const canonical = pick(html, /<link rel="canonical" href="https:\/\/instacalc\.in\/([^"]*)"/) ?? "";
  const title = decode(pick(html, /<title>([\s\S]*?)<\/title>/) ?? "");
  const description = decode(pick(html, /<meta name="description"\s*\n?\s*content="([^"]*)"/) ?? "");
  const keywords = decode(pick(html, /<meta name="keywords"\s*\n?\s*content="([^"]*)"/) ?? "");
  const themeColor = pick(html, /<meta name="theme-color" content="([^"]*)"/);
  const rawH1 = pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/) ?? "";
  const h1 = decode(rawH1.replace(/<[^>]+>/g, "").trim());
  const ogImage = pick(html, /<meta property="og:image" content="([^"]*)"/);
  const ogTitle = decode(pick(html, /<meta property="og:title" content="([^"]*)"/) ?? "");

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({
    hreflang: m[1],
    href: m[2],
  }));

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((m) => {
      try {
        return JSON.parse(m[1].trim());
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const detailsFaqs = [...html.matchAll(/<details[^>]*class="[^"]*faq[^"]*"[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*(?:<div[^>]*>)?\s*<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((m) => ({
      "@type": "Question",
      name: decode(m[1].replace(/<[^>]+>/g, "").trim()),
      acceptedAnswer: {
        "@type": "Answer",
        text: decode(m[2].replace(/<[^>]+>/g, "").trim()),
      },
    }));

  if (detailsFaqs.length > 0) {
    const existingFaqIdx = jsonLd.findIndex((j) => j && (j["@type"] === "FAQPage" || ("@graph" in j && j["@graph"]?.some((item) => item?.["@type"] === "FAQPage"))));
    if (existingFaqIdx === -1) {
      jsonLd.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: detailsFaqs,
      });
    } else {
      const existing = jsonLd[existingFaqIdx];
      const count = existing["@type"] === "FAQPage" ? (existing.mainEntity?.length ?? 0) : 0;
      if (detailsFaqs.length > count) {
        if (existing["@type"] === "FAQPage") {
          existing.mainEntity = detailsFaqs;
        } else {
          jsonLd.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: detailsFaqs,
          });
        }
      }
    }
  }

  return { canonical, title, description, keywords, themeColor, h1, ogImage, ogTitle, alternates, jsonLd };
}

const files = walk(LEGACY);
const pages = {};

const SKIP_FILES = new Set([
  "us/aboutus.html",
  "us/contactus.html",
  "us/privacypolicy.html",
  "us/terms.html",
  "us/delete-account.html",
]);

for (const file of files) {
  const rel = relative(LEGACY, file).split(sep).join("/");
  if (SKIP_FILES.has(rel)) continue;
  const html = readFileSync(file, "utf8");
  const data = extract(html);

  // Route path is ALWAYS the on-disk file location: that is the URL we emit,
  // and it is what the existing sitemap indexes. `index.html` collapses to `/`.
  let path = `/${rel}`;
  if (path === "/index.html") path = "/";
  else if (path.endsWith("/index.html")) path = path.slice(0, -"index.html".length);

  // Locale from the file's first path segment
  const seg = path.split("/")[1];
  const locale = ["us", "ja", "ru", "ko"].includes(seg) ? seg : "en";

  // True when the legacy page declares a canonical other than its own path.
  // `canonical` is stored bare and `path` has a leading slash, so normalise both.
  // `/ja/` and `ja/index.html` are the same URL and must NOT count as a mismatch.
  const selfCanonical = (path === "/" ? "" : path.replace(/^\//, "")).replace(/index\.html$/, "");
  const canonicalMismatch = data.canonical.replace(/index\.html$/, "") !== selfCanonical;

  let title = data.title;
  let description = data.description;
  if (rel === "us/retirement-calculator.html") {
    description = description.replace(/\bcorpus\b/gi, "balance");
  } else if (rel === "us/simple-interest-calculator.html") {
    title = "Simple Interest Calculator (US) | Loan & Investment APR Formula";
  }

  pages[rel] = {
    path,
    locale,
    canonical: data.canonical,
    canonicalMismatch,
    title,
    description,
    keywords: data.keywords,
    h1: data.h1,
    themeColor: data.themeColor,
    ogTitle: data.ogTitle,
    ogImage: data.ogImage,
    alternates: data.alternates,
    jsonLd: data.jsonLd,
    bytes: Buffer.byteLength(html),
    source: rel,
  };
}

if (!pages["us/auto-loan-calculator.html"]) {
  pages["us/auto-loan-calculator.html"] = {
    path: "/us/auto-loan-calculator.html",
    locale: "us",
    canonical: "/us/auto-loan-calculator.html",
    canonicalMismatch: false,
    title: "Auto Loan Calculator (US) | Monthly Car Payment & Trade-In",
    description: "Calculate monthly auto loan payments with vehicle price, trade-in value, down payment, interest rate (APR), sales tax, and full amortization schedule.",
    keywords: "auto loan calculator, car payment calculator, car loan calculator, vehicle financing, auto loan amortization",
    h1: "Auto Loan Calculator (US)",
    themeColor: "#005f73",
    ogTitle: "Auto Loan Calculator (US) — Car Payment & Amortization",
    ogImage: "https://instacalc.in/cover.png",
    alternates: [
      { hreflang: "en-US", href: "https://instacalc.in/us/auto-loan-calculator.html" },
      { hreflang: "x-default", href: "https://instacalc.in/us/auto-loan-calculator.html" },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Auto Loan Calculator (US)",
        url: "https://instacalc.in/us/auto-loan-calculator.html",
        applicationCategory: "FinanceApplication",
        operatingSystem: "All",
        description: "Calculate monthly auto loan payments with vehicle price, down payment, trade-in, and sales tax.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "InstaCalc", item: "https://instacalc.in/" },
          { "@type": "ListItem", position: 2, name: "US Calculators", item: "https://instacalc.in/us/" },
          { "@type": "ListItem", position: 3, name: "Auto Loan Calculator", item: "https://instacalc.in/us/auto-loan-calculator.html" },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a good APR for an auto loan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A good auto loan APR in the US typically ranges from 5% to 7% for new cars and 6% to 9% for used cars for borrowers with credit scores above 720.",
            },
          },
          {
            "@type": "Question",
            name: "How much down payment should I put on a car?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The general recommendation is at least 20% down on a new vehicle and 10% on a used car to prevent negative equity as the vehicle depreciates.",
            },
          },
          {
            "@type": "Question",
            name: "How does vehicle trade-in affect sales tax?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "In most US states, trade-in credit reduces the taxable purchase price of the new vehicle. For example, trading an $8,000 car toward a $30,000 vehicle lowers taxable price to $22,000.",
            },
          },
          {
            "@type": "Question",
            name: "What is the difference between a 48, 60, and 72-month auto loan?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Shorter terms (36–48 months) have higher monthly payments but lower interest rates and drastically lower total interest costs. Longer terms (72–84 months) reduce monthly payments but increase total interest paid and risk negative equity.",
            },
          },
          {
            "@type": "Question",
            name: "Should I finance through a dealership, bank, or credit union?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Credit unions and local banks frequently offer APRs 1% to 2% lower than dealership financing. Getting pre-approved before visiting the dealer gives you negotiating leverage and guards against dealer interest markups.",
            },
          },
          {
            "@type": "Question",
            name: "What is the 20/4/10 rule for buying a car?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The 20/4/10 rule recommends putting at least 20% down, financing for no more than 4 years (48 months), and keeping total monthly transportation costs (loan, insurance, fuel) under 10% of gross monthly income.",
            },
          },
          {
            "@type": "Question",
            name: "What are typical dealer documentation and title fees?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Dealer documentation fees ('doc fees') vary by state from $75 in New York and California to over $600 in Florida. Always ask for an itemized out-the-door price breakdown before signing.",
            },
          },
          {
            "@type": "Question",
            name: "Can I pay off my auto loan early without penalty?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Most modern auto loans use simple interest and do not have prepayment penalties. Paying extra principal each month reduces future interest charges and shortens your payoff date.",
            },
          },
          {
            "@type": "Question",
            name: "Does a higher credit score lower car loan interest rates?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Super-prime borrowers (credit score 781+) qualify for the lowest rates (often 5%–6%), while subprime borrowers (score 501–600) can face rates of 12% to 18% or higher.",
            },
          },
          {
            "@type": "Question",
            name: "What is GAP insurance and do I need it?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Guaranteed Asset Protection (GAP) insurance covers the gap between your car's market value and your remaining loan balance if the car is totaled or stolen. It is recommended if your down payment was under 20% or your loan term exceeds 60 months.",
            },
          },
        ],
      },
    ],
    bytes: 35000,
    source: "us/auto-loan-calculator.html",
  };
}

applyRuSeo(pages);
applyEnglishFaqs(pages);

const outDir = join(ROOT, "src", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "seo.generated.json"), JSON.stringify({ origin: SITE_ORIGIN, pages }, null, 2));

const total = Object.keys(pages).length;
console.log(`[extract-seo] ${total} pages -> src/data/seo.generated.json`);
const byLocale = {};
for (const p of Object.values(pages)) byLocale[p.locale] = (byLocale[p.locale] || 0) + 1;
console.log("[extract-seo] by locale:", byLocale);

const mismatched = Object.entries(pages).filter(([, p]) => p.canonicalMismatch);
console.log(`\n[extract-seo] ${mismatched.length} pages declare a canonical != their own path:`);
for (const [file, p] of mismatched) {
  console.log(`   ${file.padEnd(42)} canonical -> /${p.canonical}`);
}
const noJsonLd = Object.entries(pages).filter(([, p]) => p.jsonLd.length === 0);
console.log(`\n[extract-seo] ${noJsonLd.length} pages have no JSON-LD.`);
const noAlt = Object.entries(pages).filter(([, p]) => p.alternates.length === 0);
console.log(`[extract-seo] ${noAlt.length} pages have no hreflang alternates.`);
