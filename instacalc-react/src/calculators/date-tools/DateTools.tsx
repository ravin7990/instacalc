import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DateField, DatePresets } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import {
  addToDate,
  addWeeks,
  businessDaysBetween,
  daysBetween,
  isoWeek,
  toIsoDate,
  weeksBetween,
} from "@/engines/dates";
import { formatNumber, formatDate } from "@/lib/currency";
import { dateCopy } from "@/i18n/date-labels";
import { UsDaysArticle } from "@/components/articles/us/UsDaysArticle";
import { JaDateArticle } from "@/components/articles/ja/JaDateArticle";

/**
 * Date arithmetic tool shared by the days and weeks calculators. The two legacy
 * pages differ only in which results they lead with.
 */
export default function DateTools({ seo }: { seo: SeoRecord }) {
  const c = dateCopy(seo.locale);
  // dayscalculator / weekcalculator / the Japanese date tools all use this.
  const isWeeks = /week/.test(seo.path);
  const isJapanese = /daycounter/.test(seo.path);

  const today = useMemo(() => toIsoDate(new Date()), []);
  const [from, setFrom] = useState(() => toIsoDate(addToDate(new Date(), { months: -1 })));
  const [to, setTo] = useState(today);
  const [offset, setOffset] = useState(0);

  const result = useMemo(() => {
    const a = new Date(`${from}T00:00:00`);
    const b = new Date(`${to}T00:00:00`);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;

    const week = isoWeek(a);
    return {
      days: daysBetween(a, b),
      businessDays: businessDaysBetween(a, b),
      weeks: weeksBetween(a, b),
      week,
      shifted: toIsoDate(isWeeks ? addWeeks(a, offset) : addToDate(a, { days: offset })),
    };
  }, [from, to, offset, isWeeks]);

  const n = (v: number) => formatNumber(seo.locale, v);

  const rows = result
    ? [
        // No "Calendar Days" row: the shell already shows it as the headline.
        { key: c.businessDays, value: `${n(Math.abs(result.businessDays))} ${c.days}` },
        { key: c.weeksBetween, value: `${n(Math.abs(result.weeks))} ${c.weeks}` },
        { key: c.isoWeek, value: `Week ${n(result.week.week)}` },
        { key: c.isoYear, value: String(result.week.year) },
        { key: c.resultDate, value: formatDate(seo.locale, result.shifted, "short") },
      ]
    : [];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.calendarDays, c.businessDays, c.weeksBetween]}
        />

        <CalculatorShell
          locale={seo.locale}
          id={isWeeks ? "week-calculator" : isJapanese ? "day-counter-calculator" : "days-calculator"}
          title={isWeeks ? c.weeksBetween : c.calendarDays}
          summary={result ? { label: c.calendarDays, value: n(Math.abs(result.days)) } : null}
          inputs={
            <>
              <DateField label={c.fromDate} value={from} onChange={setFrom} />
              <DateField label={c.toDate} value={to} onChange={setTo} />
              <DatePresets
                presets={[
                  { label: c.today, iso: today },
                  { label: "−7d", iso: toIsoDate(addToDate(new Date(), { days: -7 })) },
                  { label: "−30d", iso: toIsoDate(addToDate(new Date(), { days: -30 })) },
                  { label: "−1y", iso: toIsoDate(addToDate(new Date(), { years: -1 })) },
                ]}
                onPick={setTo}
              />
              <div className="field-card">
                <div className="field-head">
                  <label htmlFor="offset">{c.addWeeks}</label>
                </div>
                <div className="chips-scroll">
                  {[-52, -12, -4, -1, 0, 1, 4, 12, 52].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`chip${offset === v ? " active" : ""}`}
                      aria-pressed={offset === v}
                      onClick={() => setOffset(v)}
                    >
                      {v > 0 ? `+${v}` : v}
                    </button>
                  ))}
                </div>
                <p className="field-result">
                  {c.resultDate}: <strong>{result?.shifted ?? "—"}</strong>
                </p>
              </div>
            </>
          }
          results={
            result ? (
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.key}>
                    <span className="kv-key">{r.key}</span>
                    <span className="kv-value">{r.value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="helper-text">{c.pickDate}</p>
            )
          }
        />

        {seo.locale === "us" && <UsDaysArticle />}
        {seo.locale === "ja" && <JaDateArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
