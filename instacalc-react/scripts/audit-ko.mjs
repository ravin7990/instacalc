import fs from 'node:fs';
import path from 'node:path';

function findHtml(dir, base = '') {
  let res = [];
  if (!fs.existsSync(dir)) return res;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      res = res.concat(findHtml(full, rel));
    } else if (entry.name.endsWith('.html')) {
      res.push({ path: rel, full });
    }
  }
  return res;
}

const koDistFiles = findHtml('dist/ko');
const koLegacyFiles = findHtml('../ko');

console.log(`=== AUDITING KOREAN PAGES ===`);
console.log(`Found in dist/ko: ${koDistFiles.length}`);
console.log(`Found in ../ko: ${koLegacyFiles.length}\n`);

const segmenter = new Intl.Segmenter('ko', { granularity: 'word' });

const filesToAudit = koDistFiles.length ? koDistFiles : koLegacyFiles;

for (const { path: relPath, full } of filesToAudit) {
  const html = fs.readFileSync(full, 'utf-8');
  
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
  
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/) || [])[1] || '';
  const text = body.replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
                   
  const charCount = text.replace(/\s/g, '').length;
  let wordCount = 0;
  for (const seg of segmenter.segment(text)) {
    if (seg.isWordLike) wordCount++;
  }
  const spaceWords = text.split(/\s+/).filter(Boolean).length;
  
  const articleMatch = html.match(/<article[^>]*class="[^"]*prose-page[^"]*"[^>]*>([\s\S]*?)<\/article>/i)
                    || html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let articleWords = 0;
  let articleChars = 0;
  if (articleMatch) {
    const artText = articleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    articleChars = artText.replace(/\s/g, '').length;
    for (const seg of segmenter.segment(artText)) {
      if (seg.isWordLike) articleWords++;
    }
  }
  
  const visibleFaqs = (html.match(/<details[^>]*class="[^"]*faq-item[^"]*"[^>]*>/g) || html.match(/<details[^>]*class="[^"]*faq[^"]*"[^>]*>/g) || []).length;
  const schemaFaqs = (html.match(/"@type":\s*"Question"/g) || []).length;
  
  console.log(`${relPath.padEnd(35)} | Title: ${title.slice(0, 40)}...`);
  console.log(`   Words: ${wordCount} | Chars: ${charCount} | SpaceWords: ${spaceWords} | ArtWords: ${articleWords} | FAQs: ${visibleFaqs} (vis) / ${schemaFaqs} (schema)\n`);
}
