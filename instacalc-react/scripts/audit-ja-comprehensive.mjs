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

const distJa = findHtml('dist/ja');
const sitemapPath = 'dist/sitemap.xml';
let sitemapUrls = new Set();
if (fs.existsSync(sitemapPath)) {
  const sm = fs.readFileSync(sitemapPath, 'utf8');
  for (const m of sm.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapUrls.add(m[1].trim());
  }
}

const segmenter = new Intl.Segmenter('ja', { granularity: 'word' });

const results = [];
const seenTitles = new Map();
const seenDescs = new Map();

for (const { path: relPath, full } of distJa) {
  const html = fs.readFileSync(full, 'utf-8');
  const pageUrl = `https://instacalc.in/ja/${relPath}`;

  // Title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
  const desc = descMatch ? descMatch[1].trim() : '';

  // Canonical
  const canMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/i);
  const canonical = canMatch ? canMatch[1].trim() : '';

  // H1
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  const h1 = h1Matches.length > 0 ? h1Matches[0][1].replace(/<[^>]+>/g, '').trim() : '';

  // Hreflang
  const hreflangs = [...html.matchAll(/<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi)].map(m => ({
    lang: m[1],
    href: m[2]
  }));

  // Schema.org JSON-LD
  const schemaMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  const schemas = [];
  let schemaFaqCount = 0;
  let hasWebApplication = false;
  let hasBreadcrumbs = false;
  let hasFaqPage = false;
  let jsonParseErrors = 0;

  for (const sm of schemaMatches) {
    try {
      const parsed = JSON.parse(sm[1]);
      const type = parsed['@type'];
      schemas.push(type);
      if (type === 'WebApplication' || type === 'SoftwareApplication') hasWebApplication = true;
      if (type === 'BreadcrumbList') hasBreadcrumbs = true;
      if (type === 'FAQPage') {
        hasFaqPage = true;
        if (Array.isArray(parsed.mainEntity)) {
          schemaFaqCount += parsed.mainEntity.length;
        }
      }
    } catch (e) {
      jsonParseErrors++;
    }
  }

  // Visible FAQs
  const visibleFaqs = (html.match(/<details[^>]*class="[^"]*faq-item[^"]*"[^>]*>/gi) || []).length;

  // Article copy & length
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  let artWords = 0;
  let artChars = 0;
  if (articleMatch) {
    const artText = articleMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    artChars = artText.replace(/\s/g, '').length;
    for (const seg of segmenter.segment(artText)) {
      if (seg.isWordLike) artWords++;
    }
  }

  // Entire body text
  const body = (html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) || [])[1] || '';
  const bodyText = body.replace(/<script[\s\S]*?<\/script>/gi, '')
                       .replace(/<style[\s\S]*?<\/style>/gi, '')
                       .replace(/<[^>]+>/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();
  const totalChars = bodyText.replace(/\s/g, '').length;
  let totalWords = 0;
  for (const seg of segmenter.segment(bodyText)) {
    if (seg.isWordLike) totalWords++;
  }

  // Open Graph / Twitter
  const ogTitle = /<meta\s+property=["']og:title["']/i.test(html);
  const ogDesc = /<meta\s+property=["']og:description["']/i.test(html);
  const ogImage = /<meta\s+property=["']og:image["']/i.test(html);
  const twitterCard = /<meta\s+name=["']twitter:card["']/i.test(html);

  // Localization anomalies
  const hasRupee = html.includes('₹');
  const hasLakh = /\b(lakh|crore|lakhs|crores)\b/i.test(html);
  const hasPromptLeaks = /\((?:How to Use|Formula|Example|Rules|Use Cases|Common Mistakes|Disclaimer)\)/i.test(html);
  const hasRawLatex = /\$(?:\\to|\\leftrightarrow|1\\text\{m\}\^3|c|a,\s*b)\$/.test(html);

  // Sitemap
  const inSitemap = sitemapUrls.has(canonical || pageUrl);

  // Check sync with root ja/ file
  const rootFilePath = path.join('..', 'ja', relPath);
  let inSyncWithRoot = false;
  if (fs.existsSync(rootFilePath)) {
    const rootHtml = fs.readFileSync(rootFilePath, 'utf8');
    // Check if canonical and title match
    const rootTitleMatch = rootHtml.match(/<title>([^<]*)<\/title>/);
    inSyncWithRoot = rootTitleMatch && rootTitleMatch[1].trim() === title;
  }

  // Title uniqueness tracking
  if (!seenTitles.has(title)) seenTitles.set(title, []);
  seenTitles.get(title).push(relPath);

  // Description uniqueness tracking
  if (!seenDescs.has(desc)) seenDescs.set(desc, []);
  seenDescs.get(desc).push(relPath);

  results.push({
    relPath,
    title,
    titleLen: title.length,
    desc,
    descLen: desc.length,
    canonical,
    canonicalCorrect: canonical === pageUrl,
    h1,
    h1Count: h1Matches.length,
    hreflangs: hreflangs.map(h => h.lang),
    hasJaHreflang: hreflangs.some(h => h.lang === 'ja' || h.lang === 'ja-JP'),
    hasXDefault: hreflangs.some(h => h.lang === 'x-default'),
    hasWebApplication,
    hasBreadcrumbs,
    hasFaqPage,
    jsonParseErrors,
    visibleFaqs,
    schemaFaqCount,
    artWords,
    artChars,
    totalWords,
    totalChars,
    ogTitle,
    ogDesc,
    ogImage,
    twitterCard,
    hasRupee,
    hasLakh,
    hasPromptLeaks,
    hasRawLatex,
    inSitemap,
    inSyncWithRoot
  });
}

// Summary statistics
const totalPages = results.length;
const duplicateTitles = [...seenTitles.entries()].filter(([_, paths]) => paths.length > 1);
const duplicateDescs = [...seenDescs.entries()].filter(([_, paths]) => paths.length > 1);
const canonicalMismatches = results.filter(r => !r.canonicalCorrect);
const singleH1Fails = results.filter(r => r.h1Count !== 1);
const missingDesc = results.filter(r => !r.desc || r.descLen < 30);
const missingJaHreflang = results.filter(r => !r.hasJaHreflang);
const missingXDefault = results.filter(r => !r.hasXDefault);
const notInSitemap = results.filter(r => !r.inSitemap);
const missingSchemas = results.filter(r => !r.hasBreadcrumbs || (r.visibleFaqs > 0 && !r.hasFaqPage));
const jsonErrors = results.filter(r => r.jsonParseErrors > 0);
const anomalyPages = results.filter(r => r.hasRupee || r.hasLakh || r.hasPromptLeaks || r.hasRawLatex);

const summary = {
  totalPages,
  duplicateTitlesCount: duplicateTitles.length,
  duplicateDescsCount: duplicateDescs.length,
  canonicalMismatchesCount: canonicalMismatches.length,
  singleH1FailsCount: singleH1Fails.length,
  missingDescCount: missingDesc.length,
  missingJaHreflangCount: missingJaHreflang.length,
  missingXDefaultCount: missingXDefault.length,
  notInSitemapCount: notInSitemap.length,
  missingSchemasCount: missingSchemas.length,
  jsonErrorsCount: jsonErrors.length,
  anomalyPagesCount: anomalyPages.length,
  avgArtWords: Math.round(results.reduce((a, b) => a + b.artWords, 0) / (totalPages || 1)),
  avgArtChars: Math.round(results.reduce((a, b) => a + b.artChars, 0) / (totalPages || 1)),
  totalFaqsVisible: results.reduce((a, b) => a + b.visibleFaqs, 0),
  totalFaqsSchema: results.reduce((a, b) => a + b.schemaFaqCount, 0)
};

console.log('=== JAPANESE SEO AUDIT SUMMARY ===');
console.log(JSON.stringify(summary, null, 2));

if (anomalyPages.length > 0) {
  console.log('\n--- ANOMALIES DETECTED ---');
  for (const a of anomalyPages) {
    console.log(`${a.relPath}: Rupee=${a.hasRupee}, Lakh=${a.hasLakh}, PromptLeak=${a.hasPromptLeaks}, Latex=${a.hasRawLatex}`);
  }
}

if (canonicalMismatches.length > 0) {
  console.log('\n--- CANONICAL MISMATCHES ---');
  for (const c of canonicalMismatches) {
    console.log(`${c.relPath}: canonical=${c.canonical}`);
  }
}

if (notInSitemap.length > 0) {
  console.log('\n--- NOT IN SITEMAP ---');
  for (const s of notInSitemap) {
    console.log(`${s.relPath}`);
  }
}

fs.writeFileSync('scripts/audit-ja-results.json', JSON.stringify({ summary, results }, null, 2), 'utf8');
console.log('\nFull results saved to scripts/audit-ja-results.json');
