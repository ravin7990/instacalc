/**
 * inspect-content.mjs — sanity-checks the extracted prose content.
 * Run: node scripts/inspect-content.mjs [file]
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const data = JSON.parse(readFileSync(join(ROOT, "src", "data", "content.generated.json"), "utf8"));
const only = process.argv[2];

/** Blocks that indicate the parser leaked markup or navigation chrome. */
const SUSPECT = [
  { re: /class=|href=|<|>|\/\//, why: "looks like raw markup" },
  { re: /^(home|about us|contact us|privacy policy)$/i, why: "navigation label" },
  { re: /^\W*$/, why: "empty" },
];

let issues = 0;
for (const [file, page] of Object.entries(data)) {
  if (only && file !== only) continue;

  console.log(`\n=== ${file} ===`);
  console.log(`hero.h1: ${page.hero.h1}`);
  console.log(`hero.lead: ${page.hero.lead.slice(0, 90)}…`);

  const counts = {};
  for (const b of page.blocks) counts[b.type] = (counts[b.type] ?? 0) + 1;
  console.log(`blocks: ${JSON.stringify(counts)}`);

  for (const b of page.blocks) {
    const value = b.type === "h" || b.type === "p" ? b.text : (b.items ?? []).join(" ");
    for (const s of SUSPECT) {
      if (s.re.test(value)) {
        console.log(`  SUSPECT (${s.why}): ${value.slice(0, 90)}`);
        issues++;
      }
    }
  }

  // Show the outline so the structure is reviewable at a glance.
  console.log("outline:");
  for (const b of page.blocks) {
    if (b.type === "h") console.log(`  ${"  ".repeat(b.level - 1)}h${b.level}: ${b.text.slice(0, 70)}`);
  }
}

console.log(issues ? `\n${issues} suspect block(s).` : "\nNo suspect blocks.");
