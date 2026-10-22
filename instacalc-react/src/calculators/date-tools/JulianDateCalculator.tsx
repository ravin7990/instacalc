import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DateField } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { toJulianDay, toIsoDate } from "@/engines/dates";
import { dateCopy } from "@/i18n/date-labels";

/** Converts a Gregorian calendar date to Julian Day numbers. */
export default function JulianDateCalculator({ seo }: { seo: SeoRecord }) {
  const c = dateCopy(seo.locale);
  const [date, setDate] = useState(() => toIsoDate(new Date()));

  const result = useMemo(() => {
    const d = new Date(`${date}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : toJulianDay(d);
  }, [date]);

  const rows = result
    ? [
        // No "Julian Day (JD)" row: the shell renders JD as the headline, so
        // listing it again immediately below was a visible duplicate.
        { k: "Modified Julian Day (MJD)", v: result.modifiedJulianDay.toFixed(5) },
        { k: "Julian Day Number (JDN)", v: String(result.julianDayNumber) },
        { k: "Day of Year", v: String(result.dayOfYear) },
        { k: "Calendar Date", v: new Date(`${date}T00:00:00`).toDateString() },
      ]
    : [];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={["Julian Day", "Modified JD", "Day of Year"]} />

        <CalculatorShell
          locale={seo.locale}
          id="julian-date-calculator"
          title="Julian Day"
          summary={result ? { label: "JD", value: result.julianDay.toFixed(2) } : null}
          inputs={<DateField label={c.fromDate} value={date} onChange={setDate} />}
          results={
            <ul className="kv-list">
              {rows.map((r) => (
                <li key={r.k}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}