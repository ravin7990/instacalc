import fs from 'node:fs';
import path from 'node:path';

function findHtml(dir, base = '') {
  let res = [];
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

const jaFiles = findHtml('dist/ja');
console.log(`AUDITING ALL ${jaFiles.length} JAPANESE PAGES:\n`);

const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });

for (const { path: relPath, full } of jaFiles) {
  const html = fs.readFileSync(full, 'utf-8');
  
  // Title and H1
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1]?.replace(/<[^>]+>/g, '').trim() || '';
  
  // Text content & word/char counts
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/) || [])[1] || '';
  const text = body.replace(/<script[\s\S]*?<\/script>/gi, '')
                   .replace(/<style[\s\S]*?<\/style>/gi, '')
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/\s+/g, ' ')
                   .trim();
                   
  const charCount = text.replace(/\s/g, '').length;
  // Intl.Segmenter Japanese words
  let wordCount = 0;
  for (const seg of segmenter.segment(text)) {
    if (seg.isWordLike) wordCount++;
  }
  // Standard space-split word count
  const spaceWords = text.split(/\s+/).filter(Boolean).length;
  
  // Article tag check
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
  
  // Visible FAQs (<details class="faq-item">)
  const visibleFaqs = (html.match(/<details[^>]*class="[^"]*faq-item[^"]*"[^>]*>/g) || []).length;
  
  // Schema FAQs
  const schemaFaqs = (html.match(/"@type":\s*"Question"/g) || []).length;
  
  console.log(`${relPath.padEnd(35)} | SegmentWords: ${String(wordCount).padStart(4)} | Chars: ${String(charCount).padStart(5)} | SpaceWords: ${String(spaceWords).padStart(4)} | ArtWords: ${String(articleWords).padStart(4)} | FAQs: ${visibleFaqs} (vis) / ${schemaFaqs} (schema)`);
}
