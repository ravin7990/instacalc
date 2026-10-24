import fs from 'node:fs';
import path from 'node:path';

const koDir = 'dist/ko';
const moreToolsDir = 'dist/ko/moretools';

const files = [
  ...fs.readdirSync(koDir).filter(f => f.endsWith('.html')).map(f => path.join(koDir, f)),
  ...fs.readdirSync(moreToolsDir).filter(f => f.endsWith('.html')).map(f => path.join(moreToolsDir, f)),
];

const segmenter = new Intl.Segmenter('ko', { granularity: 'word' });

const rows = [];

for (const filePath of files) {
  const html = fs.readFileSync(filePath, 'utf8');
  const relPath = filePath.replace(/\\/g, '/').replace('dist/', '');

  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';

  const descMatch = html.match(/<meta name="description"\s+content="([^"]+)"/);
  const desc = descMatch ? descMatch[1] : '';

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const h1 = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
  const h1Count = (html.match(/<h1/g) || []).length;

  const canonicalMatch = html.match(/<link rel="canonical"\s+href="([^"]+)"/);
  const canonical = canonicalMatch ? canonicalMatch[1] : '';

  const hreflangs = [...html.matchAll(/<link rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)].map(m => m[1]);

  const visFaqs = (html.match(/<details class="faq-item"/g) || []).length;
  const schemaFaqs = (html.match(/"@type":\s*"Question"/g) || []).length;

  const articleMatch = html.match(/<article[\s\S]*?<\/article>/);
  let artWords = 0;
  let artChars = 0;
  if (articleMatch) {
    const artText = articleMatch[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    artWords = artText.split(/\s+/).filter(Boolean).length;
    artChars = artText.replace(/\s/g, '').length;
  }

  const hasWebApp = html.includes('"@type":"WebApplication"') || html.includes('"@type":"SoftwareApplication"');
  const hasBreadcrumb = html.includes('"@type":"BreadcrumbList"');
  const hasFaqPage = html.includes('"@type":"FAQPage"');

  const langMatch = html.match(/<html[^>]*lang="([^"]+)"/);
  const lang = langMatch ? langMatch[1] : '';

  const naverVerif = html.includes('naver-site-verification');
  const ogTitle = html.includes('property="og:title"');
  const ogDesc = html.includes('property="og:description"');
  const ogImage = html.includes('property="og:image"');
  const twitterCard = html.includes('name="twitter:card"');

  rows.push({
    relPath,
    title,
    titleLen: title.length,
    desc,
    descLen: desc.length,
    h1,
    h1Count,
    canonical,
    hreflangs,
    visFaqs,
    schemaFaqs,
    artWords,
    artChars,
    hasWebApp,
    hasBreadcrumb,
    hasFaqPage,
    lang,
    naverVerif,
    ogTitle,
    ogDesc,
    ogImage,
    twitterCard
  });
}

fs.writeFileSync('scripts/audit-results.json', JSON.stringify(rows, null, 2), 'utf8');
console.log(`Audited ${rows.length} Korean pages. Saved to scripts/audit-results.json.`);
