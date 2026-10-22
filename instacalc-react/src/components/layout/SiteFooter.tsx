import { SITE } from "@/config/site";
import { ui } from "@/i18n/ui";
import type { Locale } from "@/config/site";
import { localeOrRoot } from "@/data/pageExists";

export interface SiteFooterProps {
  locale: Locale;
  /** Primary nav (Home/About/Contact/Privacy) reused in the footer. */
  nav: NavLinkItem[];
}

export interface NavLinkItem {
  href: string;
  label: string;
}

export function SiteFooter({ locale, nav }: SiteFooterProps) {
  const t = ui(locale);
  // Terms and Delete Account exist in translated form for ja; for other locales
  // fallback cleanly to site root via localeOrRoot.
  const legal: NavLinkItem[] = [
    { href: localeOrRoot(locale, "terms.html") ?? "/terms.html", label: t.terms },
    { href: "/disclaimer.html", label: locale === "ja" ? "免責事項" : locale === "ru" ? "Отказ от ответственности" : locale === "ko" ? "면책 조항" : "Disclaimer" },
    { href: localeOrRoot(locale, "delete-account.html") ?? "/delete-account.html", label: t.deleteAccount },
  ];

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-tagline">{t.footerTagline}</p>
        <nav className="footer-links" aria-label="Footer">
          {[...nav, ...legal].map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="container footer-regions">
        <span className="footer-regions-title">Regional Editions:</span>
        <div className="footer-region-links">
          <a href="/" hrefLang="en-IN">🇮🇳 India (English)</a>
          <a href="/us/" hrefLang="en-US">🇺🇸 United States (English)</a>
          <a href="/ja/" hrefLang="ja-JP">🇯🇵 日本 (日本語)</a>
          <a href="/ko/" hrefLang="ko-KR">🇰🇷 대한민국 (한국어)</a>
          <a href="/ru/" hrefLang="ru-RU">🇷🇺 Россия (Русский)</a>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()} {SITE.displayName}. {t.allRightsReserved}
        </p>
      </div>
    </footer>
  );
}
