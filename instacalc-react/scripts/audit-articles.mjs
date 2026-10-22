import fs from 'node:fs';
import path from 'node:path';

const dir = 'dist/us';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.html'));

console.log('ARTICLE-SPECIFIC AUDIT (Checking solely the <article> tag):');
let failed = 0;
for (const file of files) {
  const html = fs.readFileSync(path.join(dir, file), 'utf-8');
  const articleMatch = html.match(/<article[^>]*class="[^"]*seo-section[^"]*"[^>]*>([\s\S]*?)<\/article>/);
  if (!articleMatch) {
    console.log(`❌ MISSING ARTICLE IN: ${file}`);
    failed++;
  } else {
    const text = articleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = text.split(/\s+/).length;
    console.log(`${file.padEnd(35)} | Article words: ${words} | ${words >= 500 ? '✅ 500+ words' : '❌ SHORT'}`);
    if (words < 500) failed++;
  }
}
console.log(`\nTotal failures: ${failed}/24`);
