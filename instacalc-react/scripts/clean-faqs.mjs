import fs from 'node:fs';

const file = './src/data/seo.generated.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

let cleanedCount = 0;
for (const pKey of Object.keys(data.pages)) {
  const p = data.pages[pKey];
  if (p && p.jsonLd) {
    for (const ld of p.jsonLd) {
      if (ld['@type'] === 'FAQPage' && Array.isArray(ld.mainEntity)) {
        for (const f of ld.mainEntity) {
          const oldName = f.name;
          const oldText = f.acceptedAnswer ? f.acceptedAnswer.text : '';
          f.name = cleanText(f.name);
          if (f.acceptedAnswer) {
            f.acceptedAnswer.text = cleanText(f.acceptedAnswer.text);
          }
          if (oldName !== f.name || oldText !== (f.acceptedAnswer ? f.acceptedAnswer.text : '')) {
            cleanedCount++;
          }
        }
      }
    }
  }
}

// Also fix ru/moretools/trignometrycalculator.html mnemonic answer
if (data.pages['ru/moretools/trignometrycalculator.html'] && data.pages['ru/moretools/trignometrycalculator.html'].jsonLd) {
  const faqPage = data.pages['ru/moretools/trignometrycalculator.html'].jsonLd.find((i) => i['@type'] === 'FAQPage');
  if (faqPage && faqPage.mainEntity) {
    for (const f of faqPage.mainEntity) {
      if (f.acceptedAnswer && f.acceptedAnswer.text.includes('Opposite/Hypotenuse')) {
        f.acceptedAnswer.text = 'В прямоугольном треугольнике: синус — отношение противолежащего катета к гипотенузе, косинус — отношение прилежащего катета к гипотенузе, тангенс — отношение противолежащего катета к прилежащему катету.';
      }
    }
  }
}

fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
console.log('Cleaned FAQ entities across all pages:', cleanedCount);
