import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const DIST_RU = "dist/ru";

function walk(dir, out = []) {
  try {
    for (const e of readdirSync(dir)) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (e.endsWith(".html")) out.push(full);
    }
  } catch (err) {}
  return out;
}

const segmenter = new Intl.Segmenter("ru", { granularity: "word" });

function countWords(str) {
  let count = 0;
  for (const seg of segmenter.segment(str)) {
    if (seg.isWordLike) count++;
  }
  return count;
}

const files = walk(DIST_RU);
console.log(`=== AUDITING RUSSIAN PAGES (${files.length} found) ===\n`);

const rows = [];

for (const f of files.sort()) {
  const rel = f.replace(/\\/g, "/").replace(/^dist\/ru\//, "");
  const html = readFileSync(f, "utf8");

  const titleM = html.match(/<title>([\s\S]*?)<\/title>/);
  const title = titleM ? titleM[1].trim() : "(no title)";

  const h1M = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1M ? h1M[1].replace(/<[^>]+>/g, "").trim() : "(no h1)";

  // Article content
  const artM = html.match(/<article[^>]*class=["'][^"']*prose-page[^"']*["'][^>]*>([\s\S]*?)<\/article>/i);
  const artText = artM ? artM[1].replace(/<[^>]+>/g, " ").trim() : "";
  const artWords = artText ? countWords(artText) : 0;

  // Body text
  const bodyM = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyText = bodyM ? bodyM[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").trim() : "";
  const totalWords = countWords(bodyText);

  // FAQs
  const visFaqs = [...html.matchAll(/<details[^>]*class=["'][^"']*faq[^"']*["']/gi)].length;

  let schemaFaqs = 0;
  const jsonLdMatches = html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      if (data["@type"] === "FAQPage" && Array.isArray(data.mainEntity)) {
        schemaFaqs += data.mainEntity.length;
      } else if (Array.isArray(data["@graph"])) {
        for (const item of data["@graph"]) {
          if (item["@type"] === "FAQPage" && Array.isArray(item.mainEntity)) {
            schemaFaqs += item.mainEntity.length;
          }
        }
      }
    } catch {}
  }

  rows.push({
    file: rel,
    title: title.slice(0, 45) + (title.length > 45 ? "..." : ""),
    h1: h1.slice(0, 35) + (h1.length > 35 ? "..." : ""),
    totalWords,
    artWords,
    visFaqs,
    schemaFaqs,
  });
}

console.log(
  "File".padEnd(35) +
  "TotalW".padStart(8) +
  "ArtW".padStart(8) +
  "VisFAQ".padStart(8) +
  "SchFAQ".padStart(8) +
  "  Title"
);
console.log("-".repeat(95));

for (const r of rows) {
  console.log(
    r.file.padEnd(35) +
    String(r.totalWords).padStart(8) +
    String(r.artWords).padStart(8) +
    String(r.visFaqs).padStart(8) +
    String(r.schemaFaqs).padStart(8) +
    "  " + r.title
  );
}
