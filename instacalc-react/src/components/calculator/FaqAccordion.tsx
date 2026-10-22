import { ui } from "@/i18n/ui";
import type { Locale } from "@/config/site";
import type { SeoRecord } from "@/data/seo";
import { localeHome } from "@/components/layout/Layout";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * FAQ accordion. Uses native <details>/<summary> so it works with zero JS,
 * is keyboard accessible for free, and its content is present in the
 * prerendered HTML for crawlers.
 */
export function FaqAccordion({ locale, items }: { locale: Locale; items: FaqItem[] }) {
  const t = ui(locale);
  if (!items.length) return null;
  return (
    <section className="section seo-section" aria-labelledby="faq-heading">
      <div className="container">
        <h2 id="faq-heading" className="section-title">
          {t.faq}
        </h2>
        <div className="faq-list">
          {items.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                <span>{f.q}</span>
                <svg
                  className="faq-chevron"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="faq-answer">
                <p>{f.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Breadcrumbs({
  locale,
  trail,
  current,
}: {
  locale: Locale;
  /** Ancestor crumbs, excluding the current page. */
  trail: Array<{ name: string; href: string }>;
  current: string;
}) {
  const t = ui(locale);
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li>
          <a href={localeHome(locale)}>{t.breadcrumbHome}</a>
        </li>
        {trail.map((c) => (
          <li key={c.href}>
            <a href={c.href}>{c.name}</a>
          </li>
        ))}
        <li>
          <span aria-current="page">{current}</span>
        </li>
      </ol>
    </nav>
  );
}

/**
 * Reads the breadcrumb trail from the page's existing JSON-LD so the visible
 * crumbs and the structured data can never disagree.
 */
export function extractBreadcrumb(
  seo: SeoRecord,
): Array<{ name: string; href: string }> {
  const crumb = seo.jsonLd.find((j) => j["@type"] === "BreadcrumbList");
  if (!crumb || !("itemListElement" in crumb) || !Array.isArray(crumb.itemListElement)) return [];
  const items = crumb.itemListElement;
  // The last item is the current page, which Breadcrumbs renders itself.
  return items.slice(0, -1).map((i: any) => ({
    name: i.name,
    href: String(i.item ?? "").replace(/^https?:\/\/instacalc\.in/, "") || "/",
  }));
}

/** Reads the FAQ out of the page's JSON-LD. */
export function extractFaqItems(seo: SeoRecord): FaqItem[] {
  const faq = seo.jsonLd.find((j) => j["@type"] === "FAQPage");
  if (!faq || !("mainEntity" in faq) || !Array.isArray(faq.mainEntity)) return [];
  return faq.mainEntity.map((q: any) => ({ q: q.name, a: q.acceptedAnswer?.text ?? "" }));
}
