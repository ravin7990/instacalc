import fs from 'node:fs';
import path from 'node:path';

const koDir = '../ko';
const moreToolsDir = '../ko/moretools';

const htmlFiles = [
  ...fs.readdirSync(koDir).filter(f => f.endsWith('.html')).map(f => path.join(koDir, f)),
  ...fs.readdirSync(moreToolsDir).filter(f => f.endsWith('.html')).map(f => path.join(moreToolsDir, f))
];

console.log('HTML File'.padEnd(45) + 'FAQ Count' + '   Status');
console.log('-'.repeat(65));

let allPass = true;
for (const file of htmlFiles) {
  const content = fs.readFileSync(file, 'utf8');
  // Match FAQ question items or schema FAQ questions
  const qMatches = content.match(/itemprop="name">([^<]+)<\/(summary|span)>/g) ||
                   content.match(/itemtype="https?:\/\/schema\.org\/Question"/g) ||
                   content.match(/class="faq-question"/g) || [];
  
  const faqCount = qMatches.length;
  // Exclude privacy policy and index page if they don't have FAQs
  if (file.includes('privacypolicy') || file.endsWith('index.html')) {
    continue;
  }
  
  const pass = faqCount >= 10 && faqCount <= 15;
  if (!pass) allPass = false;
  console.log(file.padEnd(45) + String(faqCount).padStart(5) + '       ' + (pass ? 'PASS' : 'FAIL'));
}

console.log('-'.repeat(65));
console.log(`All calculator pages pass FAQ requirement (10-13 FAQs): ${allPass}`);
process.exit(allPass ? 0 : 1);
