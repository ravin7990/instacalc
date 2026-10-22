/**
 * Generates the set of tool URLs that actually exist, per locale.
 *
 * The catalogue in src/data/tools.ts lists every tool for every locale, but the
 * ja / ru / ko locales only carry a subset of the English pages. Without this
 * filter the localised homepages linked to pages that were never built, so
 * roughly a third of those links 404'd.
 *
 * Emits a compact path-only list per locale (a few kB) rather than importing the
 * 475 kB SEO dataset into the client bundle, which would wreck the initial JS
 * payload this project works hard to keep small.
 *
 * Run: node scripts/gen-tools.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const LOCALES = ["en", "us", "ja", "ru", "ko"];

const seo = JSON.parse(readFileSync(join(ROOT, "src/data/seo.generated.json"), "utf8"));
const paths = Object.values(seo.pages).map((p) => p.path);

/** Bucket each path under its locale. Root "/" and "/x.html" are English. */
const byLocale = Object.fromEntries(LOCALES.map((l) => [l, []]));
for (const path of paths) {
  const seg = path.split("/").filter(Boolean);
  let locale = "en";
  if (seg.length > 0 && LOCALES.includes(seg[0]) && seg[0] !== "en") locale = seg[0];
  byLocale[locale].push(path);
}

for (const l of LOCALES) byLocale[l].sort();

const out = join(ROOT, "src/data/tools.generated.json");
writeFileSync(out, `${JSON.stringify(byLocale, null, 0)}\n`, "utf8");

console.log(
  `[gen-tools] ${paths.length} pages -> ${LOCALES.map((l) => `${l}:${byLocale[l].length}`).join(" ")}`,
);
console.log(`[gen-tools] wrote ${out}`);
