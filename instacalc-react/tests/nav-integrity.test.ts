import { describe, it, expect } from "vitest";
import { buildNav, localeHome } from "@/components/layout/Layout";
import { pageExists, existingHref, localeOrRoot } from "@/data/pageExists";
import { toolGroups } from "@/data/tools";
import { LOCALES, type Locale } from "@/config/site";

/**
 * Guards the "no link may point at a page that was never built" invariant.
 *
 * The locales are lopsided: /en/ carries 42 pages, /us/ 20, /ja/ 32, /ru/ 25
 * and /ko/ just 3 — and /ko/ has no homepage at all. The chrome used to build
 * its hrefs from `/${locale}/<file>` regardless, so every /us/ page shipped
 * three dead About/Contact/Privacy links and every /ko/ page shipped four dead
 * nav links plus a dead brand link. Those were the hard 404s in the crawl.
 *
 * These tests assert the invariant at the data layer (`pageExists`) and at the
 * two components that actually emit chrome links (`buildNav`, `localeHome`).
 */
describe("pageExists", () => {
  it("accepts root and each locale home that exists", () => {
    expect(pageExists("en", "/")).toBe(true);
    expect(pageExists("us", "/us/")).toBe(true);
    expect(pageExists("ja", "/ja/")).toBe(true);
    expect(pageExists("ru", "/ru/")).toBe(true);
    expect(pageExists("ko", "/ko/")).toBe(true);
  });

  it("resolves a bare filename strictly within the locale", () => {
    expect(pageExists("ja", "aboutus.html")).toBe(true);
    expect(pageExists("us", "aboutus.html")).toBe(false);
  });

  it("resolves an absolute path against the whole build", () => {
    // Root-only pages are real for every locale, /ko/ included.
    expect(pageExists("ko", "/")).toBe(true);
    expect(pageExists("ko", "/terms.html")).toBe(true);
    expect(pageExists("us", "/aboutus.html")).toBe(true);
  });

  it("rejects a locale path that was never built", () => {
    expect(pageExists("us", "/us/aboutus.html")).toBe(false);
    expect(pageExists("ko", "/ko/aboutus.html")).toBe(false);
  });

  it("external and same-page hrefs are always accepted", () => {
    expect(pageExists("ko", "https://example.com")).toBe(true);
    expect(pageExists("ko", "#main-content")).toBe(true);
  });

  it("ignores query strings and fragments", () => {
    expect(pageExists("en", "/sipcalculator.html?ref=nav")).toBe(true);
    expect(pageExists("en", "/nope.html#x")).toBe(false);
  });

  it("existingHref passes through or nulls", () => {
    expect(existingHref("en", "/terms.html")).toBe("/terms.html");
    expect(existingHref("us", "/us/terms.html")).toBeNull();
  });
});

describe("localeOrRoot", () => {
  it("prefers the locale's own page when it exists", () => {
    expect(localeOrRoot("ja", "aboutus.html")).toBe("/ja/aboutus.html");
    expect(localeOrRoot("en", "aboutus.html")).toBe("/aboutus.html");
  });

  it("falls back to the English original when the locale has none", () => {
    expect(localeOrRoot("us", "aboutus.html")).toBe("/aboutus.html");
    expect(localeOrRoot("ko", "aboutus.html")).toBe("/aboutus.html");
  });

  it("returns null when neither the locale nor the root has the page", () => {
    expect(localeOrRoot("ko", "sipcalculator.html")).toBe("/sipcalculator.html");
    expect(localeOrRoot("us", "definitely-not-a-page.html")).toBeNull();
  });

  it("never returns a path that is absent from the build", () => {
    for (const locale of LOCALES) {
      for (const file of ["aboutus.html", "contactus.html", "privacypolicy.html", "terms.html"]) {
        const href = localeOrRoot(locale as Locale, file);
        expect(href, `${locale} -> ${file}`).not.toBeNull();
        expect(pageExists(locale as Locale, href as string), `${locale} -> ${href}`).toBe(true);
      }
    }
  });
});

describe("buildNav", () => {
  it("emits only links that resolve, for every locale", () => {
    for (const locale of LOCALES) {
      const nav = buildNav(locale as Locale);
      expect(nav.length, `${locale} rendered no nav at all`).toBeGreaterThan(0);
      for (const l of nav) {
        expect(pageExists(locale as Locale, l.href), `${locale} nav -> ${l.href}`).toBe(true);
      }
    }
  });

  it("serves the English page where the locale has none", () => {
    // /us/ never had translated About/Contact/Privacy. Dropping them left the
    // nav three links short; the English page is the same convention the
    // footer already uses for root-only pages.
    expect(buildNav("us").map((l) => l.href)).toEqual([
      "/us/",
      "/aboutus.html",
      "/contactus.html",
      "/privacypolicy.html",
    ]);
  });

  it("keeps the locale's own About/Contact/Privacy for ja and ru", () => {
    for (const locale of ["ja", "ru"] as const) {
      expect(buildNav(locale).map((l) => l.href)).toEqual([
        `/${locale}/`,
        `/${locale}/aboutus.html`,
        `/${locale}/contactus.html`,
        `/${locale}/privacypolicy.html`,
      ]);
    }
  });

  it("renders a full nav for /ko/, pointing home to /ko/", () => {
    expect(buildNav("ko").map((l) => l.href)).toEqual([
      "/ko/",
      "/aboutus.html",
      "/contactus.html",
      "/ko/privacypolicy.html",
    ]);
  });

  it("has no duplicate hrefs (React key collisions)", () => {
    for (const locale of LOCALES) {
      const hrefs = buildNav(locale as Locale).map((l) => l.href);
      expect(new Set(hrefs).size, `${locale} has duplicate nav hrefs`).toBe(hrefs.length);
    }
  });
});

describe("localeHome", () => {
  it("returns each locale's own homepage when it exists", () => {
    expect(localeHome("en")).toBe("/");
    expect(localeHome("us")).toBe("/us/");
    expect(localeHome("ja")).toBe("/ja/");
    expect(localeHome("ru")).toBe("/ru/");
    expect(localeHome("ko")).toBe("/ko/");
  });

  it("always resolves, for every locale", () => {
    for (const locale of LOCALES) {
      expect(pageExists(locale as Locale, localeHome(locale as Locale))).toBe(true);
    }
  });
});

describe("toolGroups", () => {
  it("advertises only tools that exist, for every locale", () => {
    for (const locale of LOCALES) {
      for (const g of toolGroups(locale as Locale)) {
        for (const t of g.tools) {
          expect(pageExists(locale as Locale, t.path), `${locale} -> ${t.path}`).toBe(true);
        }
      }
    }
  });

  it("renders no empty groups", () => {
    for (const locale of LOCALES) {
      expect(toolGroups(locale as Locale).every((g) => g.tools.length > 0)).toBe(true);
    }
  });

  it("lists the full catalogue for /en/ but a subset elsewhere", () => {
    const count = (l: Locale) => toolGroups(l).reduce((n, g) => n + g.tools.length, 0);
    expect(count("en")).toBe(30);
    expect(count("us")).toBe(23);
    expect(count("ru")).toBeLessThan(count("en"));
    // /ko/ now carries 38 localized calculators in its catalogue.
    expect(count("ko")).toBe(38);
  });
});
