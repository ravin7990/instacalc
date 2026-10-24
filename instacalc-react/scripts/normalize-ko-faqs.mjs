import fs from 'node:fs';
import path from 'node:path';

const koDir = '../ko';
const moreToolsDir = '../ko/moretools';

const files = [
  ...fs.readdirSync(koDir).filter(f => f.endsWith('.html')).map(f => path.join(koDir, f)),
  ...fs.readdirSync(moreToolsDir).filter(f => f.endsWith('.html')).map(f => path.join(moreToolsDir, f)),
];

let updatedCount = 0;

for (const filePath of files) {
  if (filePath.includes('privacypolicy') || filePath.endsWith('index.html')) {
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // Match all details blocks
  const detailsRegex = /<details[\s\S]*?<summary[^>]*>([\s\S]*?)<\/summary>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/details>/gi;
  const matches = [...html.matchAll(detailsRegex)];

  if (matches.length === 0) {
    console.warn(`No FAQs found in ${filePath}`);
    continue;
  }

  const seen = new Set();
  const uniqueFaqs = [];

  for (const m of matches) {
    const qRaw = m[1].replace(/<[^>]+>/g, '').trim();
    const aRaw = m[2].replace(/<[^>]+>/g, '').trim();
    // Normalize question for deduplication
    const normKey = qRaw.replace(/[?？\s,·\(\)\-]/g, '').slice(0, 8);

    if (!seen.has(normKey)) {
      seen.add(normKey);
      uniqueFaqs.push({ q: qRaw, a: aRaw });
    }
  }

  // Ensure we have between 10 and 11 FAQs
  const finalFaqs = uniqueFaqs.slice(0, 11);

  const faqItemsHtml = finalFaqs.map(f => `      <details class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
        <summary itemprop="name">${f.q}</summary>
        <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
          <p itemprop="text">${f.a}</p>
        </div>
      </details>`).join('\n');

  const newSection = `    <section class="faq-section" itemscope itemtype="https://schema.org/FAQPage">
      <h2>자주 묻는 질문 (FAQ)</h2>
${faqItemsHtml}
    </section>`;

  // 1. Remove all existing details and faq-sections from html
  html = html.replace(/<details[\s\S]*?<\/details>/gi, '');
  html = html.replace(/<section class="faq-section"[^>]*>[\s\S]*?<\/section>/gi, '');
  html = html.replace(/<h2>자주 묻는 질문[^<]*<\/h2>/gi, '');

  // 2. Insert clean newSection before </div>\n  <script or before </body>
  const marker = '</div>\n  <script type="module" src="/src/entry-client.tsx"></script>';
  if (html.includes(marker)) {
    html = html.replace(marker, `${newSection}\n  ${marker}`);
  } else if (html.includes('</div>\n</body>')) {
    html = html.replace('</div>\n</body>', `${newSection}\n  </div>\n</body>`);
  } else {
    html = html.replace('</body>', `${newSection}\n</body>`);
  }

  // Clean up any double empty lines
  html = html.replace(/\n{3,}/g, '\n\n');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`${path.basename(filePath).padEnd(45)} -> ${finalFaqs.length} FAQs`);
  updatedCount++;
}

console.log(`\nSuccessfully normalized FAQs for ${updatedCount} Korean pages.`);
