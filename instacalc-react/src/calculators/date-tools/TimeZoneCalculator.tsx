import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { dateCopy } from "@/i18n/date-labels";
import { UsTimeZoneArticle } from "@/components/articles/us/UsTimeZoneArticle";

/** A small, widely used set of zones covering the site's main audiences. */
const ZONES = [
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "America/New_York", label: "New York (ET)" },
  { id: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { id: "Europe/London", label: "London (GMT/BST)" },
  { id: "Europe/Berlin", label: "Central Europe (CET)" },
  { id: "Asia/Dubai", label: "Dubai (GST)" },
  { id: "Asia/Singapore", label: "Singapore (SGT)" },
  { id: "Asia/Tokyo", label: "Tokyo (JST)" },
  { id: "Australia/Sydney", label: "Sydney (AEST)" },
  { id: "UTC", label: "UTC" },
];

const labelFor = (zone: string) => ZONES.find((z) => z.id === zone)?.label ?? zone;

/** UTC offset in milliseconds for a zone at a given instant, DST included. */
function offsetOf(instant: number, zone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(new Date(instant)).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - instant;
}

function offsetLabel(instant: number, zone: string): string {
  const hours = offsetOf(instant, zone) / 3_600_000;
  return `UTC${hours >= 0 ? "+" : ""}${hours}`;
}

/** Converts a wall-clock time between two IANA time zones. */
export default function TimeZoneCalculator({ seo }: { seo: SeoRecord }) {
  const c = dateCopy(seo.locale);
  const [time, setTime] = useState("12:00");
  const [from, setFrom] = useState("America/New_York");
  const [to, setTo] = useState("Asia/Kolkata");

  const result = useMemo(() => {
    const [h, m] = time.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;

    // Treat the entry as wall-clock time in the source zone: guess a UTC
    // instant, measure the zone's offset, then correct for it.
    const guess = Date.UTC(2026, 0, 15, h, m);
    const instant = new Date(guess - offsetOf(guess, from));

    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: to,
      dateStyle: "full",
      timeStyle: "short",
    }).format(instant);

    return { formatted, fromLabel: labelFor(from), toLabel: labelFor(to), instant };
  }, [time, from, to]);

  const rows = result
    ? [
        { k: c.fromDate, v: `${result.fromLabel} (${offsetLabel(result.instant.getTime(), from)})` },
        { k: c.toDate, v: `${result.toLabel} (${offsetLabel(result.instant.getTime(), to)})` },
      ]
    : [];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.fromDate, c.toDate, c.today]} />

        <CalculatorShell
          locale={seo.locale}
          id="time-zone-calculator"
          title="Converted Time"
          summary={result ? { label: "To", value: result.formatted } : null}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <label htmlFor="tzTime">{c.startTime}</label>
                </div>
                <input
                  id="tzTime"
                  type="time"
                  className="date-input"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>

              <div className="field-card">
                <div className="field-head">
                  <label htmlFor="tzFrom">{c.fromDate}</label>
                </div>
                <select id="tzFrom" className="date-input" value={from} onChange={(e) => setFrom(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </select>

                <div className="field-head" style={{ marginTop: "0.75rem" }}>
                  <label htmlFor="tzTo">{c.toDate}</label>
                </div>
                <select id="tzTo" className="date-input" value={to} onChange={(e) => setTo(e.target.value)}>
                  {ZONES.map((z) => (
                    <option key={z.id} value={z.id}>{z.label}</option>
                  ))}
                </select>
              </div>
            </>
          }
          results={
            <ul className="kv-list">
              {/* The converted time is already the headline result. */}
              {rows.map((r) => (
                <li key={r.k + r.v}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        />

        <UsTimeZoneArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}