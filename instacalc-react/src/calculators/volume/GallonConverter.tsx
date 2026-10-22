import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import type { Locale } from "@/config/site";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { convert } from "@/engines/units";
import { volCopy } from "@/i18n/volume-labels";
import { UsGallonArticle } from "@/components/articles/us/UsGallonArticle";
import { JaGallonArticle } from "@/components/articles/ja/JaGallonArticle";

function getUnits(locale: Locale) {
  const isUs = locale === "us";
  return [
    { id: "gal", name: "US Gallon" },
    { id: "impgal", name: "Imperial Gallon" },
    { id: "drygal", name: "US Dry Gallon" },
    { id: "l", name: isUs ? "Liter" : "Litre" },
    { id: "qt", name: "Quart" },
    { id: "pt", name: "Pint" },
    { id: "cup", name: "Cup" },
    { id: "floz", name: "Fluid Ounce" },
    { id: "ml", name: isUs ? "Milliliter" : "Millilitre" },
  ];
}

/**
 * Gallon to litre converter. Reuses the shared unit engine, extended with the
 * two gallon variants the legacy page supports.
 */
export default function GallonConverter({ seo }: { seo: SeoRecord }) {
  const c = volCopy(seo.locale);

  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("gal");
  const [to, setTo] = useState("l");

  const result = useMemo(() => convert(amount, from, to), [amount, from, to]);

  // Litres is already the headline result, so it is not repeated here.
  const related = useMemo(
    () => [
      { key: c.usGallons, value: toGallons(amount, from) },
      { key: c.quarts, value: toUnit(amount, from, "qt") },
      { key: c.fluidOunces, value: toUnit(amount, from, "floz") },
      { key: c.millilitres, value: toUnit(amount, from, "ml") },
    ],
    [amount, from, c],
  );

  const fields: FieldSpec[] = [
    {
      key: "amount",
      label: c.amount,
      value: amount,
      min: 0,
      max: 1_000_000,
      step: 0.01,
      slider: { min: 0.1, max: 1000, step: 0.1 },
      chips: [0.5, 1, 2, 5, 10, 55].map((v) => ({ label: `${v}`, value: v })),
    },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.litres, c.usGallons, c.quarts, c.fluidOunces]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="gallon-converter"
          title={c.result}
          summary={result ? { label: c.litres, value: toLitres(amount, from) } : null}
          inputs={
            <>
              {fields.map((spec) => (
                <Field key={spec.key} spec={spec} onChange={setAmount} />
              ))}

              <div className="field-card">
                <div className="field-head">
                  <label htmlFor="fromUnit">{c.from}</label>
                </div>
                <select
                  id="fromUnit"
                  className="date-input"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  {getUnits(seo.locale).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <div className="field-head" style={{ marginTop: "0.75rem" }}>
                  <label htmlFor="toUnit">{c.to}</label>
                </div>
                <select
                  id="toUnit"
                  className="date-input"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                >
                  {getUnits(seo.locale).map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "0.75rem" }}
                  onClick={() => {
                    setFrom(to);
                    setTo(from);
                  }}
                >
                  {c.swap}
                </button>
              </div>
            </>
          }
          results={
            <>
              <ul className="kv-list">
                <li className="kv-emphasis">
                  <span className="kv-key">
                    {amount} {from} =
                  </span>
                  <span className="kv-value">{result ? `${fmt(result.result)} ${to}` : "—"}</span>
                </li>
                {related.map((r) => (
                  <li key={r.key}>
                    <span className="kv-key">{r.key}</span>
                    <span className="kv-value">{r.value}</span>
                  </li>
                ))}
              </ul>
            </>
          }
        />

        {seo.locale === "us" && <UsGallonArticle />}
        {seo.locale === "ja" && <JaGallonArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}

const fmt = (n: number) => Number(n.toPrecision(8)).toLocaleString("en-US");

function toLitres(amount: number, from: string) {
  return `${fmt(convert(amount, from, "l")?.result ?? 0)} L`;
}
function toGallons(amount: number, from: string) {
  return `${fmt(convert(amount, from, "gal")?.result ?? 0)} gal`;
}
function toUnit(amount: number, from: string, to: string) {
  const r = convert(amount, from, to);
  return r ? `${fmt(r.result)} ${to}` : "—";
}
