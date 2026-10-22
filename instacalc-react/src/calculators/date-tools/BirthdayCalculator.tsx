import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DateField, DatePresets } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { birthdayInfo, toIsoDate } from "@/engines/dates";
import { dateCopy } from "@/i18n/date-labels";
import { formatNumber, formatDate, formatWeekday } from "@/lib/currency";
import { JaBirthdayArticle } from "@/components/articles/ja/JaBirthdayArticle";

/** Birthday countdown and milestone details. */
export default function BirthdayCalculator({ seo }: { seo: SeoRecord }) {
  const c = dateCopy(seo.locale);
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [dob, setDob] = useState(() => toIsoDate(new Date(1995, 5, 15)));

  const result = useMemo(() => {
    const b = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(b.getTime())) return null;
    return { ...birthdayInfo(b, new Date()), birthDate: b };
  }, [dob]);

  const n = (v: number) => formatNumber(seo.locale, v);

  // The shell already renders the days-to-birthday as the headline, so that
  // row is dropped here to avoid showing the same figure twice.
  const rows = result
    ? [
        { k: c.age, v: `${result.age} ${c.years}` },
        { k: c.totalDays, v: n(result.daysLived) },
        { k: c.totalWeeks, v: n(Math.floor(result.daysLived / 7)) },
        { k: c.bornOn, v: formatWeekday(seo.locale, result.birthDate) },
        { k: c.nextFallsOn, v: formatWeekday(seo.locale, result.nextBirthday) },
        { k: c.halfLifetime, v: `${n(result.halfLifeDays)} ${c.days}` },
        { k: c.nextBirthdayDate, v: formatDate(seo.locale, result.nextBirthday, "long") },
      ]
    : [];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.age, c.nextBirthday, c.totalDays]} />

        <CalculatorShell
          locale={seo.locale}
          id="birthday-calculator"
          title={c.nextBirthday}
          summary={result ? { label: c.nextBirthday, value: `${n(result.daysToNext)} ${c.days}` } : null}
          inputs={
            <>
              <DateField label={c.dob} value={dob} onChange={setDob} max={today} />
              <DatePresets
                presets={[
                  { label: c.tenYearsAgo, iso: toIsoDate(new Date(new Date().getFullYear() - 10, 5, 15)) },
                  { label: c.twentyFiveYearsAgo, iso: toIsoDate(new Date(new Date().getFullYear() - 25, 5, 15)) },
                  { label: c.oneYearAgo, iso: toIsoDate(new Date(new Date().getFullYear() - 1, 5, 15)) },
                ]}
                onPick={setDob}
              />
            </>
          }
          results={
            result ? (
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.k} className={r.k === c.age ? "kv-emphasis" : undefined}>
                    <span className="kv-key">{r.k}</span>
                    <span className="kv-value">{r.v}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="helper-text">{c.pickDate}</p>
            )
          }
        />

        {seo.locale === "ja" && <JaBirthdayArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}