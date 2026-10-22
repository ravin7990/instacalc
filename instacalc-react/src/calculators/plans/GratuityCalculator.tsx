import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateGratuity } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { RuInternationalArticle } from "@/components/articles/ru/RuInternationalArticle";
import { InGratuityArticle } from "@/components/articles/in/InGratuityArticle";

/** Gratuity under the Payment of Gratuity Act, or the uncovered rate. */
export default function GratuityCalculator({ seo }: { seo: SeoRecord }) {
  const c = planCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [salary, setSalary] = useState(50_000);
  const [years, setYears] = useState(5);
  const [months, setMonths] = useState(0);
  const [covered, setCovered] = useState(1);

  const result = useMemo(
    () =>
      calculateGratuity({
        lastSalary: salary,
        yearsOfService: years,
        extraMonths: months,
        isCovered: covered === 1,
      }),
    [salary, years, months, covered],
  );

  const fields: FieldSpec[] = [
    {
      key: "salary", label: c.lastSalary, value: salary,
      min: 5_000, max: 1_000_000, step: 500,
      slider: { min: 10_000, max: 500_000, step: 500 },
      prefix: p,
      chips: [25_000, 50_000, 75_000, 100_000, 200_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    { key: "years", label: c.yearsOfService, value: years, min: 0, max: 40, step: 1,
      slider: { min: 1, max: 30, step: 1 },
      suffix: c.years,
      chips: [1, 3, 5, 10, 20].map((v) => ({ label: `${v}`, value: v })) },
    { key: "months", label: c.extraMonths, value: months, min: 0, max: 11, step: 1,
      chips: [0, 3, 6, 7, 11].map((v) => ({ label: `${v}`, value: v })) },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.gratuity, c.taxFree, c.taxable, c.eligibility]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="gratuity-calculator"
          title={c.gratuity}
          summary={{ label: c.gratuity, value: money(result.gratuity) }}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <span id="covered-label">{c.covered}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="covered-label">
                  <button
                    type="button"
                    className={`chip${covered === 1 ? " active" : ""}`}
                    aria-pressed={covered === 1}
                    onClick={() => setCovered(1)}
                  >
                    {c.covered}
                  </button>
                  <button
                    type="button"
                    className={`chip${covered === 0 ? " active" : ""}`}
                    aria-pressed={covered === 0}
                    onClick={() => setCovered(0)}
                  >
                    {c.notCovered}
                  </button>
                </div>
              </div>

              {fields.map((f) => (
                <Field
                  key={f.key}
                  spec={f}
                  onChange={(v) => {
                    if (f.key === "salary") setSalary(v);
                    else if (f.key === "years") setYears(v);
                    else setMonths(v);
                  }}
                />
              ))}
            </>
          }
          results={
            <ResultList
              // "gratuity" is the headline and is not repeated as a tile.
              items={[
                { label: c.taxFree, value: money(result.taxFree) },
                { label: c.taxable, value: money(result.taxable) },
                { label: c.yearsOfService, value: `${result.effectiveTenure} ${c.years}` },
                { label: c.eligibility, value: result.eligible ? c.eligible : c.notEligible },
              ]}
            />
          }
        />

        {seo.locale === "ru" && <RuInternationalArticle />}
        {seo.locale === "en" && <InGratuityArticle />}
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
