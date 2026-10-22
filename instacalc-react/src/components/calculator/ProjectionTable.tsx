/**
 * Year-wise projection table.
 *
 * Rendered as a real <table> with a <caption> for accessibility and SEO. The
 * wrapper scrolls horizontally on narrow screens instead of collapsing to cards,
 * which keeps a single table in the DOM for crawlers and avoids the extra
 * layout work of a JS-driven responsive mode.
 *
 * No `.container` wrapper here: this table is always rendered as a child of
 * CalculatorShell, which already supplies one. A second container nested inside
 * it re-applied the page gutter and left the table visibly inset and ragged
 * within the calculator card.
 *
 * No default height cap either. A `max-height` cut the table mid-row with no
 * scroll affordance, so the last visible row looked broken rather than
 * scrollable, and the projection table cell backgrounds are opaque, which
 * defeats the usual CSS scroll-shadow technique. The legacy `.table-shell`
 * simply grew to fit, so callers that genuinely need a cap can still pass
 * `maxHeight`.
 */
export function ProjectionTable({
  caption,
  head,
  rows,
  maxHeight,
}: {
  caption: string;
  head: string[];
  rows: string[][];
  /** Optional height cap. Omitted by default so the table is never cut mid-row. */
  maxHeight?: number;
}) {
  if (!rows.length) return null;
  return (
    <div
      className="table-scroll"
      style={maxHeight ? { maxHeight } : undefined}
      tabIndex={0}
      role="region"
      aria-label={caption}
    >
      <table className="projection-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={h} scope="col" className={i === 0 ? "num" : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((cell, ci) =>
                ci === 0 ? (
                  <th key={ci} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={ci}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
