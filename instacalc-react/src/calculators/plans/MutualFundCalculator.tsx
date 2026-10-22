import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateMutualFund, type RiskScenario } from "@/engines/mutual-fund";
import { fundCopy } from "@/i18n/fund-labels";
import { formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { JaMutualFundArticle } from "@/components/articles/ja/JaMutualFundArticle";
import { RuCompoundArticle } from "@/components/articles/ru/RuCompoundArticle";
import { InSipArticle } from "@/components/articles/in/InSipArticle";

const SCENARIOS: RiskScenario[] = ["conservative", "base", "aggressive"];

/**
 * Mutual fund return calculator: lumpsum plus monthly top-up, with expense
 * ratio, exit load, LTCG and an optional withdrawal phase.
 */
export default function MutualFundCalculator({ seo }: { seo: SeoRecord }) {
  const c = fundCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [s, setS] = useState({
    initial: 500_000, topup: 10_000, rate: 12, years: 15,
    stepUp: 5, expense: 1, inflation: 6, exitLoad: 1,
    ltcg: 12.5, exemption: 125_000, swpYear: 0, swp: 0,
    target: 20_000_000, scenario: 1,
  });

  const result = useMemo(
    () =>
      calculateMutualFund({
        initialInvestment: s.initial,
        monthlyTopup: s.topup,
        returnRate: s.rate,
        years: s.years,
        stepUp: s.stepUp,
        expenseRatio: s.expense,
        inflation: s.inflation,
        exitLoad: s.exitLoad,
        ltcgRate: s.ltcg,
        ltcgExemption: s.exemption,
        swpStartYear: s.swpYear,
        swpMonthly: s.swp,
        targetCorpus: s.target,
        riskScenario: SCENARIOS[s.scenario] ?? "base",
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const fields: FieldSpec[] = [
    {
      key: "initial", label: c.initialInvestment, value: s.initial,
      min: 0, max: 100_000_000, step: 10_000,
      slider: { min: 0, max: 5_000_000, step: 50_000 },
      prefix: p,
      chips: [100_000, 250_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: seo.locale === "ja" ? `${v / 10_000}万円` : `${p}${v / 100_000}L`,
        value: v,
      })),
    },
    {
      key: "topup", label: c.monthlyTopup, value: s.topup,
      min: 0, max: 1_000_000, step: 500,
      slider: { min: 0, max: 100_000, step: 500 },
      prefix: p,
      chips: [0, 5000, 10000, 25000, 50000].map((v) => ({
        label: seo.locale === "ja" ? (v >= 10_000 ? `${v / 10_000}万円` : `${v}円`) : `${p}${v}`,
        value: v,
      })),
    },
    { key: "rate", label: c.returnRate, value: s.rate, min: 1, max: 25, step: 0.5, suffix: "%",
      chips: [8, 10, 12, 14, 18].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "years", label: c.years, value: s.years, min: 1, max: 40, step: 1,
      slider: { min: 3, max: 30, step: 1 },
      suffix: c.year,
      chips: [5, 10, 15, 20, 30].map((v) => ({ label: `${v}`, value: v })) },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "stepUp", label: c.stepUp, value: s.stepUp, min: 0, max: 25, step: 1, suffix: "%",
      chips: [0, 5, 10, 15].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "expense", label: c.expenseRatio, value: s.expense, min: 0, max: 5, step: 0.05, suffix: "%",
      chips: [0.5, 1, 1.5, 2].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "inflation", label: c.inflation, value: s.inflation, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [4, 5, 6, 8].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "exitLoad", label: c.exitLoad, value: s.exitLoad, min: 0, max: 10, step: 0.25, suffix: "%",
      chips: [0, 0.5, 1, 2].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "ltcg", label: c.ltcgRate, value: s.ltcg, min: 0, max: 40, step: 0.5, suffix: "%",
      chips: [10, 12.5, 20].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "exemption", label: c.ltcgExemption, value: s.exemption, min: 0, max: 2_000_000, step: 25_000, prefix: p },
    { key: "swpYear", label: c.swpStartYear, value: s.swpYear, min: 0, max: 40, step: 1,
      chips: [0, 5, 10, 15, 20].map((v) => ({ label: `${v}`, value: v })) },
    { key: "swp", label: c.swpMonthly, value: s.swp, min: 0, max: 1_000_000, step: 5000, prefix: p },
  ];

  const scenarioLabels = [c.conservative, c.base, c.aggressive];

  const rows: Array<{ k: string; v: string }> = [
    { k: c.totalInvested, v: money(result.invested) },
    { k: c.grossCorpus, v: money(result.grossCorpus) },
    { k: c.estimatedReturns, v: money(result.grossCorpus - result.invested) },
    { k: c.exitLoadAmount, v: `- ${money(result.finalRedemption.exitLoadAmount)}` },
    { k: c.taxAmount, v: `- ${money(result.finalRedemption.taxAmount)}` },
    { k: c.realTerms, v: money(result.netRealTerms) },
    { k: c.effectiveCagr, v: `${result.effectiveCagr.toFixed(2)}%` },
    { k: c.expenseDrag, v: money(result.expenseDrag) },
    ...(result.cumulativeSwp > 0 ? [{ k: c.cumulativeSwp, v: money(result.cumulativeSwp) }] : []),
    ...(result.requiredInitial !== null ? [{ k: c.requiredInitial, v: money(result.requiredInitial) }] : []),
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.netRedemption, c.effectiveCagr, c.expenseDrag, c.totalInvested]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="mutual-fund-calculator"
          title={c.netRedemption}
          summary={{ label: c.netRedemption, value: money(result.finalRedemption.net) }}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <span id="scenario-label">{c.scenario}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="scenario-label">
                  {SCENARIOS.map((sc, i) => (
                    <button
                      key={sc}
                      type="button"
                      className={`chip${s.scenario === i ? " active" : ""}`}
                      aria-pressed={s.scenario === i}
                      onClick={() => setS((x) => ({ ...x, scenario: i }))}
                    >
                      {scenarioLabels[i]}
                    </button>
                  ))}
                </div>
              </div>

              {fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
              {advancedFields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
              <Field
                spec={{
                  key: "target", label: c.targetCorpus, value: s.target,
                  min: 0, max: 500_000_000, step: 500_000,
                  prefix: p,
                }}
                onChange={set("target")}
              />
            </>
          }
          results={
            <ul className="kv-list">
              {/* Net redemption is the headline; not repeated here. */}
              {rows.map((r) => (
                <li key={r.k}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        >
          <ProjectionTable
            caption={c.yearsTable}
            head={[c.year, c.totalInvested, c.grossCorpus, c.netRedemption]}
            rows={result.rows.map((r) => [
              String(r.year),
              formatCurrency(seo.locale, r.invested),
              formatCurrency(seo.locale, r.grossCorpus),
              formatCurrency(seo.locale, r.netIfRedeemed),
            ])}
          />
        </CalculatorShell>

        {seo.locale === "ja" && <JaMutualFundArticle />}
        {seo.locale === "ru" && <RuCompoundArticle />}
        {seo.locale === "en" && <InSipArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}