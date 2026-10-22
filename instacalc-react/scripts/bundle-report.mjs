/**
 * bundle-report.mjs — prints raw and gzipped asset sizes.
 *
 * Used to track the Core Web Vitals budget: the numbers that drive FCP/LCP are
 * the bytes the browser must download and parse before first paint.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, "..", "dist");
const ASSETS = join(DIST, "assets");

const files = readdirSync(ASSETS).filter((f) => /\.(js|css)$/.test(f));

const rows = files
  .map((f) => {
    const buf = readFileSync(join(ASSETS, f));
    return {
      file: f,
      raw: buf.length,
      gzip: gzipSync(buf, { level: 9 }).length,
      brotli: brotliCompressSync(buf).length,
    };
  })
  .sort((a, b) => b.gzip - a.gzip);

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const pad = (s, n) => String(s).padEnd(n);

console.log("\nAsset sizes (dist/assets)");
console.log("=".repeat(64));
console.log(pad("file", 38) + pad("raw", 10) + pad("gzip", 10) + "brotli");
console.log("-".repeat(64));
for (const r of rows) {
  console.log(pad(r.file, 38) + pad(kb(r.raw), 10) + pad(kb(r.gzip), 10) + kb(r.brotli));
}

const totalRaw = rows.reduce((s, r) => s + r.raw, 0);
const totalGzip = rows.reduce((s, r) => s + r.gzip, 0);
console.log("-".repeat(64));
console.log(pad(`${rows.length} files`, 38) + pad(kb(totalRaw), 10) + pad(kb(totalGzip), 10));

// Initial payload = entry + whatever the entry statically imports (vendor).
const entry = rows.find((r) => r.file.startsWith("main-"));
const vendor = rows.find((r) => r.file.startsWith("vendor-"));
const initial = [entry, vendor].filter(Boolean).reduce((s, r) => s + r.gzip, 0);
console.log(`\nInitial JS payload (entry + vendor, gzipped): ${kb(initial)}`);
console.log("Everything else is code-split and loads on demand per route.");
