import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/components/articles/ko';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx')).sort();

let allPass = true;
console.log('File'.padEnd(42) + 'Words' + '   Status');
console.log('-'.repeat(58));

for (const f of files) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const text = content.replace(/<[^>]+>/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  
  const hasForbiddenEntities = /&(times|divide|rarr|le|ge);/.test(content);
  const hasProperContainer = content.includes('className="section prose-page"');
  
  const pass = words >= 500 && words <= 700 && !hasForbiddenEntities && hasProperContainer;
  if (!pass) allPass = false;
  
  const status = pass ? 'PASS' : 'FAIL';
  console.log(f.padEnd(42) + String(words).padStart(5) + '   ' + status + (hasForbiddenEntities ? ' [ENTITY]' : '') + (!hasProperContainer ? ' [CONTAINER]' : ''));
}

console.log('-'.repeat(58));
console.log(`Total files: ${files.length}, All pass: ${allPass}`);
process.exit(allPass ? 0 : 1);
