/**
 * migration-status.mjs — reports which legacy pages still need converting.
 * Run: node scripts/migration-status.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const seo = JSON.parse(readFileSync(join(ROOT, "src", "data", "seo.generated.json"), "utf8"));
const router = readFileSync(join(ROOT, "src", "app", "router.tsx"), "utf8");

const converted = new Set([...router.matchAll(/path:\s*"([^"]+)"/g)].map((m) => m[1]));
const all = Object.values(seo.pages);
const remaining = all.filter((p) => !converted.has(p.path));

const byLocale = {};
for (const p of remaining) byLocale[p.locale] = (byLocale[p.locale] ?? 0) + 1;

console.log(`[migration] ${converted.size} of ${all.length} pages converted`);
console.log(`[migration] ${remaining.length} remaining, by locale:`, byLocale);

// Group the remainder by tool family so the next batch is easy to scope.
const families = new Map();
for (const p of remaining) {
  const file = p.path.split("/").pop()?.replace(/\.html$/, "") ?? p.path;
  // Collapse naming variants (us/diagonal-calculator vs diagonalcalculator).
  const family = file.replace(/-calculator|-calc/g, "calculator");
  if (!families.has(family)) families.set(family, { count: 0, paths: [] });
  const f = families.get(family);
  f.count++;
  f.paths.push(p.path);
}

console.log("\n[migration] remaining by tool:");
for (const [family, f] of [...families].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`  ${String(f.count).padStart(2)}x  ${family}`);
  for (const p of f.paths) console.log(`        ${p}`);
}
