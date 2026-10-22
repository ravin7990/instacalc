import type { SeoRecord } from "@/data/seo";

/**
 * Shared hero for every calculator page. The H1 and intro copy come straight
 * from the page's SEO record, which was extracted from the live HTML — so the
 * heading Google indexes is identical to today's.
 */
export function CalculatorHero({
  seo,
  eyebrow,
  points,
  actions,
}: {
  seo: SeoRecord;
  eyebrow?: string;
  /** Short feature bullets shown in the side panel. */
  points?: string[];
  actions?: Array<{ href: string; label: string; variant?: "primary" | "ghost" }>;
}) {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
          <h1>{seo.h1 || seo.title}</h1>
          <p>{seo.description}</p>
          {actions?.length ? (
            <div className="hero-actions">
              {actions.map((a) => (
                <a key={a.href} className={`btn btn-${a.variant ?? "primary"}`} href={a.href}>
                  {a.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {points?.length ? (
          <aside className="hero-panel">
            <h2 className="sr-only">
              {seo.locale === "ru" ? "Ключевые возможности" : seo.locale === "ja" ? "主な機能" : seo.locale === "ko" ? "주요 특징" : "Key features"}
            </h2>
            <ul className="hero-points">
              {points.map((p) => (
                <li key={p}>
                  <svg
                    className="hero-check"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m20 6-11 11-5-5" />
                  </svg>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
