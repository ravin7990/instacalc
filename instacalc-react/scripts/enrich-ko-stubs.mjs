import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const KO_DIR = join(import.meta.dirname, "..", "..", "ko");
const files = [
  "salary-calculator.html",
  "severance-pay-calculator.html",
  "weekly-holiday-pay-calculator.html",
  "pyeong-calculator.html",
  "korean-age-calculator.html",
  "brokerage-fee-calculator.html",
  "jeonse-wolse-calculator.html",
  "acquisition-tax-calculator.html",
  "loan-dsr-calculator.html",
  "unemployment-benefit-calculator.html",
];

for (const file of files) {
  const filePath = join(KO_DIR, file);
  let html = readFileSync(filePath, "utf8");
  if (html.includes('hreflang="ko-KR"')) continue;

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : "";
  const descMatch = html.match(/<meta name="description"\s+content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : "";

  const canonicalUrl = `https://instacalc.in/ko/${file}`;
  const insert = `  <link rel="alternate" hreflang="ko-KR" href="${canonicalUrl}">
  <link rel="alternate" hreflang="x-default" href="${canonicalUrl}">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": ${JSON.stringify(title)},
    "url": "${canonicalUrl}",
    "description": ${JSON.stringify(desc)},
    "inLanguage": "ko"
  }
  </script>
`;

  html = html.replace("</head>", `${insert}</head>`);
  writeFileSync(filePath, html, "utf8");
  console.log(`Updated ${file}`);
}
