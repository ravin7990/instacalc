/**
 * verify-locale-content.mjs — confirms each locale's prose page carries its
 * own translated copy rather than falling back to English.
 * Run: node scripts/verify-locale-content.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");

const pairs = [
  ["aboutus.html", "ja/aboutus.html"],
  ["contactus.html", "ja/contactus.html"],
  ["privacypolicy.html", "ja/privacypolicy.html"],
  ["aboutus.html", "ru/aboutus.html"],
  ["contactus.html", "ru/contactus.html"],
  ["privacypolicy.html", "ru/privacypolicy.html"],
];

const read = (file) => readFileSync(join(DIST, file), "utf8");
const inline = (html) => {
  const m = html.match(/<script id="ic-content"[^>]*>([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]) : null;
};

let bad = 0;
console.log("[locale-content] translated prose check\n");

for (const [enFile, localeFile] of pairs) {
  const en = inline(read(enFile));
  const loc = inline(read(localeFile));
  const lang = localeFile.split("/")[0];

  if (!en || !loc) {
    console.log(`  MISSING inline content: ${localeFile}`);
    bad++;
    continue;
  }

  const same = loc.hero.h1 === en.hero.h1 && loc.blocks.length === en.blocks.length;
  if (same) {
    console.log(`  FAIL  ${localeFile.padEnd(26)} identical to ${enFile} (English fallback!)`);
    bad++;
  } else {
    console.log(`  OK    ${localeFile.padEnd(26)} ${loc.blocks.length} blocks vs en ${en.blocks.length}`);
    console.log(`        h1: ${loc.hero.h1.slice(0, 60)}`);
    // A translated page should contain characters outside the Latin range.
    const nonLatin = /[\u3040-\u30ff\u0400-\u04ff]/.test(loc.hero.h1 + JSON.stringify(loc.blocks));
    if (!nonLatin) {
      console.log(`        WARN  ${lang}: no ${lang === "ja" ? "kana/kanji" : "Cyrillic"} detected in content`);
      bad++;
    }
  }
}

console.log(bad ? `\n[locale-content] ${bad} problem(s).` : "\n[locale-content] PASS — every locale serves its own copy.");
if (bad) process.exitCode = 1;
