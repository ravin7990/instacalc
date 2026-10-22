/**
 * Verifies the header language switcher and the footer legal links resolve
 * correctly for every locale, including the `../` prefix sub-locales need to
 * reach root-only pages (terms.html, delete-account.html).
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

const PAGES = [
  ["dist/index.html", "/"],
  ["dist/us/index.html", "/us/"],
  ["dist/ja/index.html", "/ja/"],
  ["dist/ru/index.html", "/ru/"],
  // /ko/ ships only three tool pages and has no home page in the legacy source,
  // so check it via a real ko page instead of an index that does not exist.
  ["dist/ko/moretools/concretecalculator.html", "/ko/moretools/"],
];

let failed = false;

for (const [rel, base] of PAGES) {
  if (!existsSync(join(ROOT, rel))) {
    console.error(`\n== ${base}\n   ! page not built: ${rel}`);
    failed = true;
    continue;
  }
  const html = readFileSync(join(ROOT, rel), "utf8");
  console.log(`\n== ${base}`);

  // Language switcher present with all five locales.
  const hasSwitch = html.includes('class="lang-switch"');
  console.log(`   lang-switch rendered: ${hasSwitch}`);
  if (!hasSwitch) {
    failed = true;
    console.error("   ! missing language switcher");
  }

  const options = [...html.matchAll(/<option value="([a-z]+)"[^>]*>([^<]*)</g)].map(
    (m) => `${m[1]}=${m[2].trim()}`,
  );
  console.log(`   options (${options.length}): ${options.join(" | ")}`);
  if (options.length !== 5) {
    failed = true;
    console.error(`   ! expected 5 locale options, got ${options.length}`);
  }

  // Every option must carry a globe-adjacent label, and the select needs a
  // real accessible name (sr-only label is fine).
  const labelled = /<label class="sr-only" for="langSelect">/.test(html);
  console.log(`   select has accessible label: ${labelled}`);
  if (!labelled) {
    failed = true;
    console.error("   ! langSelect has no label");
  }

  // Footer legal links. Sub-locales must use ../ to reach root-only pages.
  const terms = html.match(/href="([^"]*terms\.html)"/);
  const del = html.match(/href="([^"]*delete-account\.html)"/);
  console.log(`   terms: ${terms ? terms[1] : "MISSING"}`);
  console.log(`   delete-account: ${del ? del[1] : "MISSING"}`);

  if (!terms || !del) {
    failed = true;
    console.error("   ! missing footer legal links");
  } else {
    // Resolve each href against THIS page's own URL, so a depth error is
    // caught. An earlier version compared against an expected value using a
    // base derived from the locale rather than the real page path, which let a
    // wrong `../terms.html` on /ko/moretools/ pass.
    const pageUrl = `https://instacalc.in${base}`;
    const url = new URL(terms[1], pageUrl);
    const expectedTerms = base.startsWith("/ja/") ? "/ja/terms.html" : "/terms.html";
    if (url.pathname !== expectedTerms) {
      failed = true;
      console.error(`   ! terms resolves to ${url.pathname}, expected ${expectedTerms}`);
    }
    const url2 = new URL(del[1], pageUrl);
    const expectedDel = base.startsWith("/ja/") ? "/ja/delete-account.html" : "/delete-account.html";
    if (url2.pathname !== expectedDel) {
      failed = true;
      console.error(`   ! delete-account resolves to ${url2.pathname}, expected ${expectedDel}`);
    }
    // Sanity: must not escape the site.
    if (!url.origin.includes("instacalc.in")) {
      failed = true;
      console.error(`   ! terms escaped origin: ${url}`);
    }
// The resolved target must be a page we actually built.
    for (const target of [url, url2]) {
      const builtPath = join(ROOT, "dist", target.pathname.replace(/^\//, ""));
      if (!existsSync(builtPath)) {
        failed = true;
        console.error(`   ! link target not present in build: dist${target.pathname}`);
      }
    }
  }

  // Guard against the specific regression this check exists for: a footer link
  // that uses a relative prefix, which resolves differently depending on how
  // deeply the page is nested. Assert every footer legal link is absolute.
  const footerAt = html.indexOf('class="footer-links"');
  if (footerAt < 0) {
    failed = true;
    console.error('   ! footer-links region not found in markup');
  } else {
    const footer = html.slice(footerAt, html.indexOf("</footer>", footerAt));
    // Match any href that walks up the tree, with or without a leading slash:
    // "../x", "/../x" and "./x" all resolve relative to the current page.
    const relLinks = [...footer.matchAll(/href="((?:\/)?\.\.?\/[^"]*)"/g)].map((m) => m[1]);
    if (relLinks.length) {
      failed = true;
      console.error(
        `   ! footer uses relative href(s) ${relLinks.join(", ")} — ` +
          `they resolve differently per page depth; use absolute paths`,
      );
    }
  }
}

// The resolved targets must actually exist in the build output.
for (const p of ["dist/terms.html", "dist/delete-account.html"]) {
  try {
    readFileSync(join(ROOT, p), "utf8");
    console.log(`\n[exists] ${p}`);
  } catch {
    failed = true;
    console.error(`\n[exists] MISSING ${p}`);
  }
}

process.exit(failed ? 1 : 0);
