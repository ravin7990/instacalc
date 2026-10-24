import fs from 'node:fs';
import path from 'node:path';

const US_DIR = 'dist/us';
const files = fs.readdirSync(US_DIR).filter(f => f.endsWith('.html'));

const results = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(US_DIR, file), 'utf8');

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  // H1
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';

  // Article tag
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let artWords = 0;
  if (articleMatch) {
    const artText = articleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    artWords = artText.split(/\s+/).filter(Boolean).length;
  }

  // Body words
  let bodyText = html
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const bodyWords = bodyText.split(/\s+/).filter(Boolean).length;

  // Visible FAQs
  const visFaqs = (html.match(/<details[^>]*class=["'][^"']*faq-item[^"']*["'][^>]*>/gi) || []).length;

  // Schema FAQs
  const schemaMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  let schemaFaqs = 0;
  for (const sm of schemaMatches) {
    if (sm[1].includes('FAQPage')) {
      const qMatches = sm[1].match(/"@type"\s*:\s*"Question"/g);
      if (qMatches) schemaFaqs = Math.max(schemaFaqs, qMatches.length);
    }
  }

  // Check currency & terminology
  const hasDollar = html.includes('$');
  const hasRupee = html.includes('₹');
  const hasLakh = /\b(lakh|crore|lakhs|crores)\b/i.test(html);

  // Extract H2s
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());

  results.push({
    file,
    title,
    h1,
    desc,
    artWords,
    bodyWords,
    visFaqs,
    schemaFaqs,
    hasDollar,
    hasRupee,
    hasLakh,
    h2s
  });
}

console.log('AUDIT RESULTS (24 US PAGES):');
console.log('File'.padEnd(35) + ' | ArtWords | BodyWords | VisFAQs | SchemaFAQs | Rupee? | Lakh?');
console.log('-'.repeat(95));
for (const r of results) {
  const rupeeStr = r.hasRupee ? 'YES ❌' : 'NO ✅';
  const lakhStr = r.hasLakh ? 'YES ❌' : 'NO ✅';
  console.log(
    r.file.padEnd(35) + ' | ' +
    String(r.artWords).padStart(8) + ' | ' +
    String(r.bodyWords).padStart(9) + ' | ' +
    String(r.visFaqs).padStart(7) + ' | ' +
    String(r.schemaFaqs).padStart(10) + ' | ' +
    rupeeStr.padEnd(6) + ' | ' +
    lakhStr
  );
}

const under500Art = results.filter(r => r.artWords < 500);
const between500and700Art = results.filter(r => r.artWords >= 500 && r.artWords <= 700);
const over700Art = results.filter(r => r.artWords > 700);

const under10Faqs = results.filter(r => r.visFaqs < 10);
const between10and13Faqs = results.filter(r => r.visFaqs >= 10 && r.visFaqs <= 13);
const over13Faqs = results.filter(r => r.visFaqs > 13);

console.log('\n--- WORD COUNT BREAKDOWN (ARTICLE TAG) ---');
console.log(`Under 500 words: ${under500Art.length} pages`);
for (const r of under500Art) console.log(`  ${r.file}: ${r.artWords} words (body: ${r.bodyWords})`);
console.log(`500 to 700 words: ${between500and700Art.length} pages`);
for (const r of between500and700Art) console.log(`  ${r.file}: ${r.artWords} words`);
console.log(`Over 700 words: ${over700Art.length} pages`);
for (const r of over700Art) console.log(`  ${r.file}: ${r.artWords} words`);

console.log('\n--- FAQ COUNT BREAKDOWN ---');
console.log(`Under 10 FAQs: ${under10Faqs.length} pages`);
for (const r of under10Faqs) console.log(`  ${r.file}: ${r.visFaqs} FAQs`);
console.log(`10 to 13 FAQs: ${between10and13Faqs.length} pages`);
for (const r of between10and13Faqs) console.log(`  ${r.file}: ${r.visFaqs} FAQs`);
console.log(`Over 13 FAQs: ${over13Faqs.length} pages`);
for (const r of over13Faqs) console.log(`  ${r.file}: ${r.visFaqs} FAQs`);

fs.writeFileSync('scripts/audit-us-results.json', JSON.stringify(results, null, 2), 'utf8');
console.log('\nSaved full results to scripts/audit-us-results.json');
