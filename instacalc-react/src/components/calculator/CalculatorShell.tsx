import { useEffect, useRef, useState, type ReactNode } from "react";
import { ui } from "@/i18n/ui";
import type { Locale } from "@/config/site";

export interface ResultItem {
  label: string;
  value: string;
  /** Rendered as an emphasised headline figure. */
  emphasis?: boolean;
  hint?: string;
}

/**
 * The shared calculator frame: title row, optional mode toggles, inputs on the
 * left and results on the right. Uses container queries so the two columns
 * collapse independently of the viewport (tablets in landscape stay two-up).
 */
export function CalculatorShell({
  locale,
  id,
  title,
  modes,
  advanced,
  onToggleAdvanced,
  inputs,
  results,
  summary,
  summaryText,
  onReset,
  children,
}: {
  locale: Locale;
  id?: string;
  title?: string;
  /** e.g. Monthly SIP / Lumpsum — rendered as a linked segmented control. */
  modes?: Array<{ href: string; label: string; active?: boolean }>;
  advanced?: boolean;
  onToggleAdvanced?: () => void;
  inputs: ReactNode;
  results: ReactNode;
  summary?: { label: string; value: string } | null;
  /** Plain-text result summary, used by the copy button. */
  summaryText?: string;
  /** Restores every input to its default. Omitted hides the reset control. */
  onReset?: () => void;
  children?: ReactNode;
}) {
  const t = ui(locale);
  const [copied, setCopied] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  // On narrow screens the headline is duplicated by a sticky pill so the figure
  // stays visible while scrolling through a long input column. That is only
  // useful once the real hero has scrolled away; showing both at once just
  // printed the same number twice.
  const [heroInView, setHeroInView] = useState(false);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      // rootMargin collapses the observation to a thin band, so the pill takes
      // over as soon as the hero is genuinely off screen rather than at the
      // very edge of the viewport.
      { rootMargin: "-72px 0px -72px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  /**
   * Copies whatever is currently on screen.
   *
   * Prefer the caller-supplied `summaryText` when present. Otherwise scrape the
   * rendered figures, so all 22 calculators that use this shell directly (rather
   * than going through createCalculatorPage) get a working copy action without
   * each having to assemble its own string.
   */
  const copy = async () => {
    const text =
      summaryText ??
      (() => {
        const root = resultsRef.current;
        if (!root) return summary ? `${summary.label}: ${summary.value}` : "";
        const values = [
          ...root.querySelectorAll<HTMLElement>(
            ".result-hero-value, .result-tile .result-value, .kv-value",
          ),
        ]
          .map((el) => el.textContent?.trim() ?? "")
          .filter(Boolean);
        const labels = [
          ...root.querySelectorAll<HTMLElement>(
            ".result-hero-label, .result-tile .result-label, .kv-key",
          ),
        ]
          .map((el) => el.textContent?.trim() ?? "")
          .filter(Boolean);
        return values
          .map((v, i) => (labels[i] ? `${labels[i]}: ${v}` : v))
          .join("\n");
      })();

    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / denied permission). Failing
      // silently is better than an error toast for a convenience action.
    }
  };
  return (
    <section id={id} className="section">
      <div className="container">
        <div className="calculator-shell" data-advanced={advanced ? "on" : "off"}>
          {(modes?.length || onToggleAdvanced) && (
            <div className="calculator-header-row">
              {modes?.length ? (
                <div className="toggle-group" aria-label={t.results}>
                  {modes.map((m) => (
                    <a
                      key={m.href}
                      href={m.href}
                      className={`toggle-btn${m.active ? " active" : ""}`}
                      aria-current={m.active ? "page" : undefined}
                    >
                      {m.label}
                    </a>
                  ))}
                </div>
              ) : (
                <span />
              )}

              {onToggleAdvanced ? (
                <button
                  id="toggleViewBtn"
                  type="button"
                  className={`btn btn-ghost btn-sm${advanced ? " active" : ""}`}
                  aria-pressed={advanced}
                  onClick={onToggleAdvanced}
                >
                  {advanced ? t.advancedOn : t.advancedOff}
                </button>
              ) : null}
            </div>
          )}

          {/* Mobile-only sticky headline result. Position: sticky (not fixed) so
              it never creates layout shift when it appears. */}
          {summary ? (
            <div
              className={`mobile-summary-pill${heroInView ? " is-suppressed" : ""}`}
              aria-live="polite"
            >
              <span className="metric-label">{summary.label}</span>
              <span className="metric-val">{summary.value}</span>
            </div>
          ) : null}

          <div className="calc-grid">
            <div className="calc-inputs">{inputs}</div>
            <div className="calc-results" ref={resultsRef} aria-live="polite">
              <h2 className="sr-only">{title ?? t.results}</h2>

              {/* The headline figure is the single most important thing on the
                  page, so it gets its own prominent card rather than sitting
                  in a list beside its secondary figures. This mirrors the
                  pattern used by NerdWallet, Bankrate and Google. */}
              {summary ? (
                <div className="result-hero" ref={heroRef}>
                  <span className="result-hero-label">{summary.label}</span>
                  <strong className="result-hero-value">{summary.value}</strong>
                </div>
              ) : null}

              {results}

              {/* Copy and reset sit with the output, where the user is already
                  looking, rather than being buried below the fold. */}
              {summary || onReset ? (
                <div className="calc-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
                    {copied ? t.copied : t.copySummary}
                  </button>
                  {onReset ? (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
                      {t.reset}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="calc-disclaimer-note">
                <small>
                  {locale === "ja"
                    ? "※ 本ツールの試算結果はシミュレーションであり、将来の運用成果や実際の税額・支払額を保証するものではありません。金融・税務判断は専門家にご相談ください。"
                    : locale === "ru"
                    ? "Внимание: расчет носит информационно-ознакомительный характер и не является индивидуальной финансовой, налоговой или инвестиционной рекомендацией."
                    : locale === "ko"
                    ? "※ 본 계산 결과는 단순 모의 시뮬레이션용 수치이며 실제 지급액이나 공제액과 차이가 있을 수 있습니다. 공인 재무·세무 전문가와 상담하시기 바랍니다."
                    : "Disclaimer: Calculations and projections are for educational and illustrative purposes only and do not constitute certified financial, tax, or investment advice."}
                </small>
              </div>
            </div>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}

/**
 * Secondary figures, rendered as a grid of tiles.
 *
 * A flat label/value list makes every figure carry equal weight. Competitors
 * lead with one big number and group the supporting figures into scannable
 * cards, so the user can tell at a glance which number answers their question.
 */
export function ResultList({ items }: { items: ResultItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="result-grid">
      {items.map((r) => (
        <li key={r.label} className={`result-tile${r.emphasis ? " is-primary" : ""}`}>
          <span className="result-label">{r.label}</span>
          <span className="result-value">{r.value}</span>
          {r.hint ? <span className="result-hint">{r.hint}</span> : null}
        </li>
      ))}
    </ul>
  );
}
