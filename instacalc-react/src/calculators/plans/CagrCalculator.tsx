import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCagr, futureValue } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { JaCagrArticle } from "@/components/articles/ja/JaCagrArticle";
import { RuCagrArticle } from "@/components/articles/ru/RuCagrArticle";
import { InCagrArticle } from "@/components/articles/in/InCagrArticle";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";


/**
 * CAGR and future-value calculator. Two modes, because the legacy page offers
 * both "what rate did I get?" and "what will this become?".
 */
export default function CagrCalculator({ seo }: { seo: SeoRecord }) {
  const c = planCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [mode, setMode] = useState(0);
  const [initial, setInitial] = useState(100_000);
  const [finalValue, setFinalValue] = useState(250_000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () =>
      mode === 0
        ? calculateCagr(initial, finalValue, years)
        : futureValue(initial, rate, years),
    [mode, initial, finalValue, rate, years],
  );

  const fields: FieldSpec[] =
    mode === 0
      ? [
          {
            key: "initial", label: c.initialValue, value: initial,
            min: 1, max: 1_000_000_000, step: 1000,
            slider: { min: 10_000, max: 10_000_000, step: 10_000 },
            prefix: p,
          },
          {
            key: "final", label: c.finalValue, value: finalValue,
            min: 1, max: 1_000_000_000, step: 1000,
            slider: { min: 10_000, max: 10_000_000, step: 10_000 },
            prefix: p,
          },
          { key: "years", label: c.years, value: years, min: 1, max: 60, step: 1,
            suffix: c.years, chips: [1, 3, 5, 10, 20].map((v) => ({ label: `${v}`, value: v })) },
        ]
      : [
          {
            key: "initial", label: c.initialValue, value: initial,
            min: 1, max: 1_000_000_000, step: 1000,
            slider: { min: 10_000, max: 10_000_000, step: 10_000 },
            prefix: p,
          },
          { key: "rate", label: c.cagr, value: rate, min: 0.1, max: 50, step: 0.5, suffix: "%",
            chips: [5, 8, 10, 12, 15].map((v) => ({ label: `${v}%`, value: v })) },
          { key: "years", label: c.years, value: years, min: 1, max: 60, step: 1,
            suffix: c.years, chips: [1, 3, 5, 10, 20].map((v) => ({ label: `${v}`, value: v })) },
        ];

  // No CAGR/maturity row here: the shell already leads with it.
  const rows = result
    ? [
        { key: c.profit, value: money(result.profit) },
        { key: c.absoluteReturn, value: `${result.absoluteReturn.toFixed(2)}%` },
        { key: c.multiplier, value: `${result.multiplier.toFixed(2)}x` },
      ]
    : [];

  const timelineData = useMemo(() => {
    if (!result || years <= 0) return null;
    const cagrRate = mode === 0 ? result.cagr / 100 : rate / 100;
    const labels: string[] = [];
    const valArr: number[] = [];
    const initialArr: number[] = [];

    for (let y = 0; y <= years; y++) {
      labels.push(`Yr ${y}`);
      const val = Math.round(initial * Math.pow(1 + cagrRate, y));
      valArr.push(val);
      initialArr.push(initial);
    }

    return {
      labels,
      datasets: [
        { label: c.maturity, data: valArr, color: "#10b981", fill: true },
        { label: c.initialValue, data: initialArr, color: "#0284c7", dashed: true },
      ],
    };
  }, [result, years, mode, rate, initial, c.maturity, c.initialValue]);

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.cagr, c.profit, c.absoluteReturn, c.multiplier]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="cagr-calculator"
          title={c.cagr}
          // The headline must follow the active mode: "CAGR" mode leads with the
          // rate, "Maturity" mode with the projected value. Showing the rate in
          // both modes left the maturity figure stranded in the supporting list.
          summary={
            result
              ? mode === 0
                ? { label: c.cagr, value: `${result.cagr.toFixed(2)}%` }
                : { label: c.maturity, value: money(result.futureValue) }
              : null
          }
          inputs={
            <>
              <div className="field-card">
                <div className="chips-scroll" role="group" aria-label="Calculator mode">
                  <button
                    type="button"
                    className={`chip${mode === 0 ? " active" : ""}`}
                    aria-pressed={mode === 0}
                    onClick={() => setMode(0)}
                  >
                    {c.cagr}
                  </button>
                  <button
                    type="button"
                    className={`chip${mode === 1 ? " active" : ""}`}
                    aria-pressed={mode === 1}
                    onClick={() => setMode(1)}
                  >
                    {c.maturity}
                  </button>
                </div>
              </div>

              {fields.map((f) => (
                <Field
                  key={f.key}
                  spec={f}
                  onChange={(v) => {
                    if (f.key === "initial") setInitial(v);
                    else if (f.key === "final") setFinalValue(v);
                    else if (f.key === "rate") setRate(v);
                    else setYears(v);
                  }}
                />
              ))}
            </>
          }
          results={
            <>
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.key}>
                    <span className="kv-key">{r.key}</span>
                    <span className="kv-value">{r.value}</span>
                  </li>
                ))}
              </ul>
              {result ? (
                <BreakdownDonutChart
                  locale={seo.locale}
                  centerLabel={c.profit}
                  items={[
                    { label: c.initialValue, value: initial, color: "#0284c7" },
                    { label: c.profit, value: result.profit, color: "#10b981" },
                  ]}
                />
              ) : null}
            </>
          }
        >
          {timelineData ? (
            <TimelineGrowthChart
              title="CAGR Wealth Trajectory"
              subtitle="Projected compounding growth over the investment horizon"
              labels={timelineData.labels}
              datasets={timelineData.datasets}
              locale={seo.locale}
            />
          ) : null}
        </CalculatorShell>

        {seo.locale === "ja" && <JaCagrArticle />}
        {seo.locale === "ru" && <RuCagrArticle />}
        {seo.locale === "en" && <InCagrArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
