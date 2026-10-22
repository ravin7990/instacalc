/**
 * audit-en.mjs — audits all English (Indian) prerendered pages in dist/
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const DEVANAGARI = /[\u0900-\u097F]/;

const KEY_PAGES = [
  "index.html",
  "emicalculator.html",
  "gstcalculator.html",
  "sipcalculator.html",
  "mutualfundreturncalculator.html",
  "epfcalculator.html",
  "ppfcalculator.html",
  "npscalculator.html",
  "gratuitycalculator.html",
  "fdcalculator.html",
  "rdcalculator.html",
  "compoundinterest.html",
  "simpleinterestcalculator.html",
  "cagrcalculator.html",
  "retirementcalculator.html",
  "catagecalculator.html",
  "duration/agecalculator.html",
  "duration/birthdaycalculator.html",
  "duration/dayscalculator.html",
  "duration/hourcalculator.html",
  "duration/juliandatecalculator.html",
  "duration/minutes-hourscalculator.html",
  "duration/timedurationcalculator.html",
  "duration/timezonecalculator.html",
  "duration/weekcalculator.html",
  "moretools/concretecalculator.html",
  "moretools/diagonalcalculator.html",
  "moretools/trignometrycalculator.html",
];

console.log(`=== AUDITING KEY INDIAN/ENGLISH PAGES (${KEY_PAGES.length} targets) ===\n`);
console.log(
  `${"File".padEnd(38)} ${"TotalW".padStart(7)} ${"ArtW".padStart(7)} ${"VisFAQ".padStart(7)} ${"SchFAQ".padStart(7)} ${"Hindi?".padStart(7)}  Title`
);
console.log("-".repeat(110));

let failures = 0;

for (const rel of KEY_PAGES) {
  const file = join(DIST, rel);
  if (!existsSync(file)) {
    console.log(`${rel.padEnd(38)} MISSING FILE!`);
    failures++;
    continue;
  }

  const html = readFileSync(file, "utf8");
  const hasHindi = DEVANAGARI.test(html);

  // Total words
  const cleanBody = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const totalWords = cleanBody ? cleanBody.split(/\s+/).length : 0;

  // Article words
  const artMatch = html.match(/<article[\s\S]*?<\/article>/i);
  let artWords = 0;
  if (artMatch) {
    const artClean = artMatch[0].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    artWords = artClean ? artClean.split(/\s+/).length : 0;
  }

  // FAQs
  const visFaq = (html.match(/<details\b[^>]*class="[^"]*faq-item[^"]*"[^>]*>/gi) || []).length;
  const schFaq = (html.match(/"@type":\s*"Question"/gi) || []).length;

  // Title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const title = (titleMatch ? titleMatch[1] : "").slice(0, 40);

  const status = totalWords < 500 || visFaq < 10 || hasHindi ? "FAIL" : "OK";
  if (status === "FAIL") failures++;

  console.log(
    `${rel.padEnd(38)} ${String(totalWords).padStart(7)} ${String(artWords).padStart(7)} ${String(visFaq).padStart(7)} ${String(schFaq).padStart(7)} ${hasHindi ? "YES" : "NO".padStart(7)}  ${title} [${status}]`
  );
}

console.log("\n" + "-".repeat(110));
if (failures === 0) {
  console.log("PASS — all key Indian/English pages have >500 words, >=10 FAQs, and ZERO Hindi text!");
} else {
  console.log(`WARNING — ${failures} pages did not meet criteria.`);
}
