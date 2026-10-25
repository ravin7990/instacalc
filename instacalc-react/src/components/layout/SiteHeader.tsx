import { useEffect, useRef, useState } from "react";
import { SITE, LOCALES, LOCALE_META, LANG_STORAGE_KEY } from "@/config/site";
import type { Locale } from "@/config/site";
import { ui } from "@/i18n/ui";
import { localeHome } from "@/components/layout/Layout";
import { trackLanguageSwitch, trackNavClick, trackEvent } from "@/lib/analytics";

export interface NavLink {
  href: string;
  label: string;
}

/** Short badge shown in the switcher, e.g. "US (EN)". */
const SWITCHER_LABEL: Record<Locale, string> = {
  en: "IN (EN)",
  us: "US (EN)",
  ja: "JP (JA)",
  ru: "RU (RU)",
  ko: "KR (KO)",
};

/**
 * Locale prefix for a target locale's home page.
 *
 * The switcher targets every locale, including /ko/, which has no homepage of
 * its own. `localeHome` resolves that to `/` so the option never navigates to
 * a 404.
 */
function localeHref(target: Locale): string {
  return localeHome(target);
}

export interface SiteHeaderProps {
  locale: Locale;
  nav: NavLink[];
  /** Absolute URL of the locale home, used by the brand link. */
  homeHref: string;
  /** Region badge shown next to the brand (e.g. "USA"). */
  badge?: string;
}

export function SiteHeader({ locale, nav, homeHref, badge }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close the mobile drawer on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a
          href={homeHref}
          className="brand"
          aria-label={`${SITE.name} home`}
          onClick={() => trackNavClick("header_brand", SITE.displayName, homeHref)}
        >
          {/* Attributes match the CSS (38x38) and the 500x500 source aspect
              ratio, so the box is correct before the stylesheet loads and no
              layout shift occurs on slow connections. */}
          <img
            src={SITE.logo}
            alt={`${SITE.name} logo`}
            width={38}
            height={38}
          />
          <span>
            {SITE.displayName}
            {badge ? <small className="brand-badge">{badge}</small> : null}
          </span>
        </a>

        {/* Region / language pill, centred between the brand and the nav.
            A native <select> keeps it keyboard- and screen-reader-friendly
            with no custom JS, and costs no layout until it renders. */}
        <div className="lang-switch">
          <label className="sr-only" htmlFor="langSelect">
            {ui(locale).language}
          </label>
          <select
            id="langSelect"
            value={locale}
            onChange={(e) => {
              const next = e.target.value as Locale;
              trackLanguageSwitch(locale, next);
              try {
                window.localStorage.setItem(LANG_STORAGE_KEY, next);
              } catch {
                /* private mode — navigation still works */
              }
              window.location.href = localeHref(next);
            }}
          >
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {SWITCHER_LABEL[l]} · {LOCALE_META[l].label}
              </option>
            ))}
          </select>
          <Icon name="globe" size={16} />
        </div>

        <button
          className="menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mainNav"
          onClick={() => {
            const next = !open;
            setOpen(next);
            trackEvent("mobile_menu_toggle", { is_open: next });
          }}
        >
          <Icon name={open ? "close" : "menu"} />
        </button>

        <nav
          className={`site-nav${open ? " open" : ""}`}
          id="mainNav"
          ref={navRef}
          aria-label="Main"
        >
          {nav.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => trackNavClick("header_nav", l.label, l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <span className="sr-only" data-locale={locale} />
    </header>
  );
}

/**
 * Minimal inline SVG icon set. Replaces the FontAwesome CDN stylesheet that
 * was render-blocking on 111 legacy pages — these cost nothing to inline.
 */
export function Icon({
  name,
  size = 20,
}: {
  name: "menu" | "close" | "arrow-up" | "chevron-down" | "globe" | "check" | "search";
  size?: number;
}) {
  const paths: Record<string, string> = {
    menu: "M3 6h18M3 12h18M3 18h18",
    close: "M18 6 6 18M6 6l12 12",
    "arrow-up": "M12 19V5M5 12l7-7 7 7",
    "chevron-down": "m6 9 6 6 6-6",
    globe:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z",
    check: "m20 6-11 11-5-5",
    search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  };
  return (
    <svg
      className="ic"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
