/**
 * extract-content.mjs
 *
 * Parses the prose pages (about, contact, privacy, terms, delete-account) from
 * the legacy site into structured JSON: a hero block plus ordered sections of
 * headings, paragraphs and lists.
 *
 * This is the content equivalent of extract-seo.mjs — the React page renders
 * this data instead of re-authoring the copy, so wording can never drift.
 *
 * Run: node scripts/extract-content.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LEGACY = join(ROOT, "..");

/**
 * Prose pages to extract. Each locale is extracted separately because the
 * Japanese and Russian pages carry genuinely translated copy — reusing the
 * English text there would ship untranslated content on those URLs.
 */
const TARGETS = [
  { file: "aboutus.html", locales: ["", "ja/", "ru/"] },
  { file: "contactus.html", locales: ["", "ja/", "ru/"] },
  { file: "privacypolicy.html", locales: ["", "ja/", "ru/", "ko/"] },
  { file: "terms.html", locales: ["", "ja/", "ru/"] },
  { file: "delete-account.html", locales: ["", "ja/", "ru/"] },
];


/** Strips tags and collapses whitespace, then decodes entities. */
function text(html) {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Removes a whole subtree (script/style/svg/icon tags) before parsing. */
function clean(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    // Font Awesome icon elements carry no content worth keeping.
    .replace(/<i\b[^>]*>\s*<\/i>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

/**
 * Walks the content region and emits an ordered list of blocks.
 * Only h1-h4, p, ul and ol are captured; purely decorative wrappers are skipped.
 */
function parseBlocks(html) {
  const blocks = [];
  // Iterate over the interesting tags in document order.
  const re = /<(h[1-4]|p|ul|ol)\b([^>]*)>([\s\S]*?)<\/\1>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[1].toLowerCase();
    const inner = m[3];

    if (tag === "ul" || tag === "ol") {
      const items = [...inner.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)]
        .map((li) => text(li[1]))
        .filter(Boolean);
      if (items.length) blocks.push({ type: tag, items });
      continue;
    }

    const value = text(inner);
    if (!value) continue;

    if (tag.startsWith("h")) {
      blocks.push({ type: "h", level: Number(tag[1]), text: value });
    } else {
      blocks.push({ type: "p", text: value });
    }
  }
  return blocks;
}

/** Pulls the hero H1 and its lead paragraph, which the page renders separately. */
function parseHero(html) {
  const heroSection = html.match(/<section class="hero"[\s\S]*?<\/section>/i)?.[0] ?? html;
  const h1 = text(heroSection.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? "");
  const paras = [...heroSection.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((p) => text(p[1])).filter(Boolean);
  // The lead is the first paragraph that is not a sub-caption of a stat block.
  const lead = paras.find((p) => p.length > 60) ?? paras[0] ?? "";
  return { h1, lead };
}

const out = {};
for (const { file, locales } of TARGETS) {
  for (const prefix of locales) {
    const key = `${prefix}${file}`;
    const src = join(LEGACY, prefix, file);
    if (!existsSync(src)) {
      console.log(`[extract-content] skip ${key} (not present)`);
      continue;
    }

    const raw = readFileSync(src, "utf8");
    const main = raw.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? raw;
    const cleaned = clean(main);

    out[key] = {
      hero: parseHero(cleaned),
      blocks: parseBlocks(cleaned),
    };
    console.log(
      `[extract-content] ${key.padEnd(28)} h1="${out[key].hero.h1.slice(0, 40)}" ` +
        `blocks=${out[key].blocks.length}`,
    );
  }
}

const outDir = join(ROOT, "src", "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "content.generated.json"), JSON.stringify(out, null, 2));
console.log("[extract-content] -> src/data/content.generated.json");
