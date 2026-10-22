/**
 * audit-site.mjs — independent audit of the built site (dist/).
 *
 * The project's own checks (`npm run check:*`) verify SEO parity, CSS coverage and
 * per-page markup in isolation. None of them follow links. This crawls every
 * emitted HTML file, resolves every href/src it finds against dist/ and reports
 * anything that would 404 for a real visitor.
 *
 * Usage: node scripts/audit-site.mjs
 * Exit code 1 if any problem is found.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, dirname, normalize, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");

const problems = [];
const stats = { pages: 0, links: 0, assets: 0 };

/** Recursively collect every .html file under dist/. */
function collectHtml(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectHtml(full, out);
    else if (entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

/**
 * Resolves a site-absolute or relative reference to a real path on disk.
 * Returns null when the reference is external or not resolvable to dist/.
 */
function resolveRef(fromFile, ref) {
  let url;
  try {
    url = new URL(ref, "file:///");
  } catch {
    return null;
  }
  if (url.protocol !== "file:") return null;
  // Strip the leading slash, decode %XX, then join onto DIST.
  let pathPart = decodeURIComponent(url.pathname);
  if (pathPart.startsWith("/")) pathPart = pathPart.slice(1);
  if (pathPart === "") return null;
  let target = join(DIST, pathPart);
  // Directory URLs must resolve to their index.html.
  if (existsSync(target) && statSync(target).isDirectory()) {
    target = join(target, "index.html");
  }
  return target;
}

/** Attributes that hold a URL, per element name. */
const URL_ATTRS = {
  a: ["href"],
  link: ["href"],
  script: ["src"],
  img: ["src", "srcset"],
  source: ["src", "srcset"],
  video: ["src", "poster"],
  audio: ["src"],
  iframe: ["src"],
  use: ["href"],
};

/** Pulls every attribute value out of a tag's raw text. */
function attrs(tagText) {
  const out = {};
  const re = /([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m;
  while ((m = re.exec(tagText))) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  return out;
}

/** srcset is a comma separated list of "url descriptor" pairs. */
function srcsetUrls(value) {
  return String(value)
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .filter(Boolean);
}

const htmlFiles = collectHtml(DIST);
if (htmlFiles.length === 0) {
  console.error("[audit-site] no HTML found in dist/ — run `npm run build` first");
  process.exit(1);
}

for (const file of htmlFiles) {
  stats.pages++;
  const rel = relative(DIST, file).split(sep).join("/");
  const html = readFileSync(file, "utf8");

  for (const m of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g)) {
    const tag = m[1].toLowerCase();
    const wanted = URL_ATTRS[tag];
    if (!wanted) continue;
    const a = attrs(m[2]);

    for (const name of wanted) {
      if (!(name in a)) continue;
      const values = name === "srcset" ? srcsetUrls(a[name]) : [a[name]];
      for (const ref of values) {
        if (!ref) continue;
        // Skip anything that is not a same-site path reference.
        if (/^(#|mailto:|tel:|javascript:|data:)/i.test(ref)) continue;
        if (/^(https?:)?\/\//i.test(ref)) continue;

        const isAsset = tag !== "a" && tag !== "link";
        if (isAsset) stats.assets++;
        else stats.links++;

        const target = resolveRef(file, ref);
        if (target && !existsSync(target)) {
          problems.push(`${rel}: <${tag} ${name}> -> ${ref} (missing ${relative(DIST, target).split(sep).join("/")})`);
        }
      }
    }
  }
}

console.log(`[audit-site] crawled ${stats.pages} pages, ${stats.links} links, ${stats.assets} asset refs`);

if (problems.length) {
  console.log(`\n[audit-site] FAIL — ${problems.length} broken reference(s):`);
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}

console.log("[audit-site] PASS — every internal link and asset resolves.");
