import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const US_DIR = join(DIST, "us");
const files = readdirSync(US_DIR).filter((f) => f.endsWith(".html"));

console.log("AUDITING WORD COUNT & FAQS ACROSS US PAGES:\n");

const stats = [];

for (const file of files) {
  const html = readFileSync(join(US_DIR, file), "utf8");

  // Extract FAQs from HTML
  const faqs = [...html.matchAll(/<details class="faq-item"[\s\S]*?<summary>([\s\S]*?)<\/summary>[\s\S]*?<div class="faq-answer">([\s\S]*?)<\/div>/g)];

  // Count schema FAQs
  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  let schemaFaqCount = 0;
  for (const s of schemaMatch) {
    if (s.includes("FAQPage")) {
      const match = s.match(/"@type":"Question"/g);
      if (match) schemaFaqCount = Math.max(schemaFaqCount, match.length);
    }
  }

  // Extract visible body text (excluding script, style, nav, header, footer)
  let bodyText = html
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  const totalWords = bodyText.split(/\s+/).filter(Boolean).length;

  stats.push({
    file,
    faqsCount: faqs.length,
    schemaFaqCount,
    totalWords,
  });
}

console.log("File".padEnd(36) + " | Total Words | Visible FAQs | Schema FAQs | Meets 500w? | Meets 10 FAQs?");
console.log("-".repeat(105));
for (const s of stats) {
  const wOk = s.totalWords >= 500 ? "✅ YES" : "❌ NO (" + s.totalWords + ")";
  const fOk = s.faqsCount >= 10 ? "✅ YES" : "❌ NO (" + s.faqsCount + ")";
  console.log(
    s.file.padEnd(36) +
      " | " +
      String(s.totalWords).padStart(11) +
      " | " +
      String(s.faqsCount).padStart(12) +
      " | " +
      String(s.schemaFaqCount).padStart(11) +
      " | " +
      wOk.padEnd(11) +
      " | " +
      fOk,
  );
}

const under500 = stats.filter((s) => s.totalWords < 500);
const under10Faqs = stats.filter((s) => s.faqsCount < 10);
console.log(`\nPages under 500 words: ${under500.length}/${files.length}`);
console.log(`Pages under 10 FAQs: ${under10Faqs.length}/${files.length}`);
