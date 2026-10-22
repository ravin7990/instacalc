import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { breakDuration, parseTimeString } from "@/engines/life";
import { dateCopy } from "@/i18n/date-labels";
import { UsHoursArticle } from "@/components/articles/us/UsHoursArticle";
import { UsTimeDurationArticle } from "@/components/articles/us/UsTimeDurationArticle";

/**
 * Time arithmetic. Serves the hours calculator (start/end minus breaks) and the
 * minutes-to-hours converter (single value) from one component.
 */
export default function TimeTools({ seo }: { seo: SeoRecord }) {
  const c = dateCopy(seo.locale);
  const isMinutes = /minutes/.test(seo.path);

  const [minutes, setMinutes] = useState(isMinutes ? 510 : 480);
  const [endTime, setEndTime] = useState("17:30");
  const [breakMin, setBreakMin] = useState(60);

  const startMinutes = 9 * 60;

  const result = useMemo(() => {
    if (isMinutes) return breakDuration(minutes);

    const end = parseTimeString(endTime);
    if (end === null) return null;
    // Handle an overnight shift by adding 24 hours when end < start.
    const raw = end - startMinutes;
    const worked = (raw < 0 ? raw + 24 * 60 : raw) - breakMin;
    return breakDuration(worked);
  }, [isMinutes, minutes, endTime, breakMin]);

  // Minutes mode has a single numeric input; hours mode uses a time picker
  // plus a break field, rendered separately below.
  const minuteField: FieldSpec = {
    key: "minutes",
    label: c.minutes,
    value: minutes,
    min: 0,
    max: 100000,
    step: 1,
    slider: { min: 1, max: 1440, step: 1 },
    chips: [60, 90, 120, 480, 510].map((v) => ({ label: `${v}`, value: v })),
  };

  const isHoursMode = !isMinutes;

  if (isHoursMode) {
    return (
      <>
        <SeoHead seo={seo} appCategory="UtilitiesApplication" />
        <Layout locale={seo.locale}>
          <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.totalTime, c.decimalHours, c.timeHms]} />

          <CalculatorShell
            locale={seo.locale}
            id="hours-calculator"
            title={c.totalTime}
            summary={result ? { label: c.hours, value: `${result.hours}h ${result.minutes}m` } : null}
            inputs={
              <>
                <div className="field-card">
                  <div className="field-head">
                    <label htmlFor="endTime">{c.endTime}</label>
                  </div>
                  <input
                    id="endTime"
                    type="time"
                    className="date-input"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                  <p className="field-hint">
                    {c.startTime}: 09:00
                  </p>
                </div>
                <Field
                  spec={{
                    key: "breakMin",
                    label: c.breakTime,
                    value: breakMin,
                    min: 0,
                    max: 600,
                    step: 5,
                    chips: [0, 30, 45, 60, 90].map((v) => ({ label: `${v}`, value: v })),
                  }}
                  onChange={setBreakMin}
                />
              </>
            }
            results={result ? <TimeResult c={c} r={result} /> : <p className="helper-text">{c.pickDate}</p>}
          />

          {seo.locale === "us" && seo.path.includes("hour-calculator") && <UsHoursArticle />}
          {seo.locale === "us" && seo.path.includes("time-duration-calculator") && <UsTimeDurationArticle />}

          <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
        </Layout>
      </>
    );
  }

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.hours, c.decimalHours, c.timeHms]} />

        <CalculatorShell
          locale={seo.locale}
          id="minutes-hours-calculator"
          title={c.hours}
          summary={result ? { label: c.hours, value: String(result.hours) } : null}
          inputs={<Field spec={minuteField} onChange={setMinutes} />}
          results={result ? <TimeResult c={c} r={result} /> : null}
        />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}

function TimeResult({ c, r }: { c: ReturnType<typeof dateCopy>; r: ReturnType<typeof breakDuration> }) {
  // The shell already renders total hours as the headline, so there is no
  // "hours" row here, and no row needs its own emphasis styling.
  const rows = [
    { key: c.days_, value: String(r.days) },
    { key: c.minutes, value: String(r.minutes) },
    { key: c.decimalHours, value: r.decimalHours.toFixed(4) },
    { key: c.timeHms, value: r.hms },
    { key: c.totalTime, value: `${r.totalHours.toFixed(2)} ${c.hours}` },
  ];
  return (
    <ul className="kv-list">
      {rows.map((row) => (
        <li key={row.key}>
          <span className="kv-key">{row.key}</span>
          <span className="kv-value">{row.value}</span>
        </li>
      ))}
    </ul>
  );
}
