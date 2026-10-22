import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join } from "path";

function walk(dir) {
  let res = [];
  for (const f of readdirSync(dir)) {
    const full = join(dir, f);
    if (statSync(full).isDirectory()) res = res.concat(walk(full));
    else if (f.endsWith(".html")) res.push(full);
  }
  return res;
}

let out = "";
const log = (s) => (out += s + "\n");

const files = walk("dist/ru");
for (const f of files) {
  const content = readFileSync(f, "utf8");
  const hits = content.match(/([^\.\n<>{}\"']*?(?:Инди|India|рупи|₹|lakh|crore|EPFO|Nifty|UPSC|PFRDA)[^\.\n<>{}\"']*)/gi) || [];
  const filtered = hits.map(s => s.trim()).filter(s => {
    const lower = s.toLowerCase();
    if (lower.includes("индивидуаль")) return false;
    if (s === "English (India)" || s === "🇮🇳 India (English)") return false;
    return true;
  });
  if (filtered.length > 0) {
    log("\n=============================");
    log("=== " + f + " (" + filtered.length + " matches) ===");
    log("=============================");
    const set = Array.from(new Set(filtered));
    set.forEach(h => log("  * " + h));
  }
}

writeFileSync("scripts/india-matches.utf8.txt", out, "utf8");
console.log("Wrote matches to scripts/india-matches.utf8.txt");
