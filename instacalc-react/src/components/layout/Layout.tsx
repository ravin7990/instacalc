import type { ReactNode } from "react";
import { SiteHeader, type NavLink } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ui } from "@/i18n/ui";
import { useScrolled } from "@/hooks/useScrolled";
import type { Locale } from "@/config/site";
import { pageExists, localeOrRoot } from "@/data/pageExists";

/**
 * Builds the locale's primary navigation.
 *
 * Each link is resolved through `localeOrRoot`: the locale's own page when it
 * exists, otherwise the English original, otherwise dropped. The locales are
 * lopsided — /us/ has no translated About/Contact/Privacy, /ko/ has no
 * homepage of its own — so a nav built from `/${locale}/<file>` alone shipped
 * links to pages that were never built. Those were the hard 404s the crawl
 * reported on every localised page.
 *
 * Serving the English page is the existing convention for root-only content
 * (the footer already sends every locale's visitor to the English Terms and
 * Delete Account), so the chrome now follows one rule rather than two.
 */
export function buildNav(locale: Locale): NavLink[] {
  const t = ui(locale);
  const candidates: Array<[string, string]> = [
    ["", t.home],
    ["aboutus.html", t.about],
    ["contactus.html", t.contact],
    ["privacypolicy.html", t.privacy],
  ];

  const links: NavLink[] = [];
  for (const [file, label] of candidates) {
    // Home is special-cased: `localeHome` resolves a missing homepage to the
    // site root, so the brand and nav always have somewhere real to point.
    const href = file === "" ? localeHome(locale) : localeOrRoot(locale, file);
    if (href) links.push({ href, label });
  }
  return links;
}

/**
 * Home URL for a locale.
 *
 * Locales without a homepage of their own — /ko/ ships three tool pages and no
 * index — fall back to `/`, which always exists. That matches the legacy
 * behaviour, where the Korean pages linked out to the site root rather than to
 * a non-existent `/ko/index.html`.
 */
export function localeHome(locale: Locale): string {
  const home = locale === "en" ? "/" : `/${locale}/`;
  return pageExists(locale, home) ? home : "/";
}

import { CookieBanner } from "@/components/layout/CookieBanner";

export function Layout({
  locale,
  children,
  nav,
}: {
  locale: Locale;
  children: ReactNode;
  nav?: NavLink[];
}) {
  const t = ui(locale);
  const links = nav ?? buildNav(locale);
  return (
    <>
      <a href="#main-content" className="skip-link">
        {t.skipToContent}
      </a>
      <SiteHeader
        locale={locale}
        nav={links}
        homeHref={localeHome(locale)}
        badge={t.regionBadge[locale]}
      />
      <main id="main-content">{children}</main>
      <SiteFooter locale={locale} nav={links} />
      <BackToTop label={t.backToTop} />
      <CookieBanner locale={locale} />
    </>
  );
}

/**
 * Appears only after the user scrolls, so it never occupies layout space at the
 * top of the page (avoids an unnecessary CLS source).
 */
function BackToTop({ label }: { label: string }) {
  const visible = useScrolled(320);
  return (
    <button
      type="button"
      className={`back-to-top${visible ? " is-visible" : ""}`}
      aria-label={label}
      // Kept in the DOM but out of the tab order until it is actually shown.
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
