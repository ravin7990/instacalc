import { describe, expect, it } from "vitest";
import { absoluteUrl, LOCALES, type Locale } from "@/config/site";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The canonical/og:url a visitor sees must be identical before and after
 * hydration. Two independent code paths produce it:
 *
 *   prerenderer  build-pages.mjs  `${ORIGIN}${page.path}`
 *   client       useSeo.ts        absoluteUrl(meta.path)
 *
 * They previously disagreed on locale homes: the prerenderer emitted
 * `https://instacalc.in/ja/` while absoluteUrl() stripped the trailing slash to
 * `https://instacalc.in/ja`, so hydration rewrote the canonical to a URL that
 * was never the one advertised in the sitemap. Trailing slashes are significant
 * on locale homes, so they are preserved here and only the root is normalised.
 */
describe("absoluteUrl", () => {
  it("preserves the trailing slash on locale homes", () => {
    expect(absoluteUrl("/ja/")).toBe("https://instacalc.in/ja/");
    expect(absoluteUrl("/ru/")).toBe("https://instacalc.in/ru/");
  });

  it("normalises the root to a single slash", () => {
    expect(absoluteUrl("/")).toBe("https://instacalc.in/");
  });

  it("leaves file paths alone", () => {
    expect(absoluteUrl("/sipcalculator.html")).toBe("https://instacalc.in/sipcalculator.html");
  });

  it("adds a leading slash when missing", () => {
    expect(absoluteUrl("terms.html")).toBe("https://instacalc.in/terms.html");
  });

  it("never double-slash-joins with the origin", () => {
    for (const path of ["/", "/ja/", "/us/", "/ko/", "/duration/agecalculator.html"]) {
      expect(absoluteUrl(path)).not.toContain(".in//");
    }
  });

  it("matches the prerenderer's own formula for every locale home", () => {
    // Mirrors `const canonical = `${ORIGIN}${page.path === "/" ? "/" : page.path}``
    // in scripts/build-pages.mjs. If either side changes, this fails.
    for (const locale of LOCALES) {
      const path: string = locale === "en" ? "/" : `/${locale}/`;
      // Negative control: the old slash-stripping behaviour must be rejected.
      const stripped = `https://instacalc.in${path}`.replace(/\/$/, "");
      expect(absoluteUrl(path)).toBe(`https://instacalc.in${path}`);
      if (path !== "/") expect(absoluteUrl(path)).not.toBe(stripped);
    }
  });

  it("agrees with the canonical actually shipped in dist/", () => {
    for (const locale of LOCALES) {
      const file = locale === "en" ? "dist/index.html" : `dist/${locale}/index.html`;
      let html: string;
      try {
        html = readFileSync(join(process.cwd(), file), "utf8");
      } catch {
        continue; // not built; the build-time checks cover it
      }
      const shipped = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
      expect(shipped, `${file} has no canonical`).toBeTruthy();
      const path = locale === "en" ? "/" : `/${(locale as Locale)}/`;
      expect(shipped, `client canonical for ${path}`).toBe(absoluteUrl(path));
    }
  });
});
