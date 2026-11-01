/**
 * submit-indexnow.mjs — submits all published URLs to IndexNow (Bing & Yandex).
 *
 * IndexNow is an open protocol used by Microsoft Bing, Yandex, Seznam, and Naver
 * to instantly crawl and index new or updated content without waiting for periodic crawls.
 *
 * Usage: node scripts/submit-indexnow.mjs [--dry-run]
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const HOST = "instacalc.in";
const ORIGIN = `https://${HOST}`;

// 1. Get IndexNow Key
let apiKey = "34dfeb893226695362bd8029a2de1ea4";
const verifPath = join(ROOT, "src", "data", "site-verification.json");
if (existsSync(verifPath)) {
  try {
    const data = JSON.parse(readFileSync(verifPath, "utf8"));
    if (data.indexnowKey) apiKey = data.indexnowKey.trim();
  } catch {}
}
if (process.env.INDEXNOW_KEY) {
  apiKey = process.env.INDEXNOW_KEY.trim();
}

// 2. Collect URLs from dist/sitemap.xml or src/data/seo.generated.json
let urlList = [];
const sitemapPath = join(ROOT, "dist", "sitemap.xml");

if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, "utf8");
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const u = m[1].trim();
    if (u.startsWith(ORIGIN) && !urlList.includes(u)) {
      urlList.push(u);
    }
  }
}

if (!urlList.length) {
  // Fallback to seo.generated.json
  const seoPath = join(ROOT, "src", "data", "seo.generated.json");
  if (existsSync(seoPath)) {
    const seo = JSON.parse(readFileSync(seoPath, "utf8"));
    const DUPLICATES = new Set([
      "coumpoundinterest.html",
      "moretools/coumpoundinterest.html",
      "cargcalculator.html",
      "delete-account-verse.html",
      "deleteaccountverse.html",
      "404.html",
    ]);
    urlList = Object.values(seo.pages)
      .filter((p) => !DUPLICATES.has(p.source) && p.path !== "/404.html")
      .map((p) => `${ORIGIN}${p.path === "/" ? "/" : p.path}`);
  }
}

console.log(`[indexnow] Target Host: ${HOST}`);
console.log(`[indexnow] API Key: ${apiKey}`);
console.log(`[indexnow] Key Location: ${ORIGIN}/${apiKey}.txt`);
console.log(`[indexnow] URLs discovered: ${urlList.length}`);

if (!urlList.length) {
  console.error("[indexnow] Error: No URLs found to submit. Run `npm run build` first.");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
if (isDryRun) {
  console.log("[indexnow] Dry run mode enabled — skipping network request.");
  console.log(`Sample URLs (first 5):\n${urlList.slice(0, 5).map((u) => `  - ${u}`).join("\n")}`);
  process.exit(0);
}

// 3. Submit payload to endpoints
const ENDPOINTS = [
  "https://api.indexnow.org/indexnow",
  "https://www.bing.com/indexnow",
  "https://yandex.com/indexnow",
];

const payload = {
  host: HOST,
  key: apiKey,
  keyLocation: `${ORIGIN}/${apiKey}.txt`,
  urlList,
};

async function submit() {
  let anySuccess = false;

  for (const endpoint of ENDPOINTS) {
    try {
      console.log(`[indexnow] Submitting ${urlList.length} URLs to ${endpoint}...`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`[indexnow] ${endpoint} -> Status ${res.status} (${res.statusText})`);
      if (res.status === 200 || res.status === 202) {
        console.log(`  ✓ Successfully submitted to ${endpoint}`);
        anySuccess = true;
      } else {
        const text = await res.text().catch(() => "");
        console.log(`  Note: response was ${res.status}: ${text || res.statusText}`);
        if (res.status === 403) {
          console.log(`  Hint: Ensure https://${HOST}/${apiKey}.txt is deployed and reachable publicly.`);
        }
      }
    } catch (err) {
      console.error(`[indexnow] Failed to contact ${endpoint}: ${err.message}`);
    }
  }

  if (anySuccess) {
    console.log(`\n[indexnow] Done! Bing, Yandex and participating search engines have received the batch.`);
  } else {
    console.log(`\n[indexnow] Notice: If the key file is not yet deployed on https://${HOST}/${apiKey}.txt, deploy first, then re-run.`);
  }
}

submit();
