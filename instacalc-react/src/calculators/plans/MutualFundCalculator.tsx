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
import { useCurrency } from "@/app/CurrencyContext";
import { JaMutualFundArticle } from "@/components/articles/ja/JaMutualFundArticle";
import { RuMutualFundArticle } from "@/components/articles/ru/RuMutualFundArticle";
import { InSipArticle } from "@/components/articles/in/InSipArticle";
import { EsMutualFundArticle } from "@/components/articles/es/EsFinanceArticles";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";

const SCENARIOS: RiskScenario[] = ["conservative", "base", "aggressive"];

/**
 * Mutual fund return calculator: lumpsum plus monthly top-up, with expense
 * ratio, exit load, LTCG and an optional withdrawal phase.
 */
export default function MutualFundCalculator({ seo }: { seo: SeoRecord }) {
  const { symbol: activeSym } = useCurrency();
  const c = fundCopy(seo.locale);
  const p = activeSym;
  const money = (n: number) => moneyFormat(seo.locale, n);

  const isRu = seo.locale === "ru";
  const isEs = seo.locale === "es";
  const [s, setS] = useState({
    initial: isEs ? 15_000 : 500_000,
    topup: isEs ? 300 : 10_000,
    rate: isEs ? 8 : 12,
    years: 15,
    stepUp: isEs ? 3 : 5,
    expense: isEs ? 0.3 : 1,
    inflation: isRu ? 7 : isEs ? 3 : 6,
    exitLoad: isRu || isEs ? 0 : 1,
    ltcg: isRu ? 13 : isEs ? 19 : 12.5,
    exemption: isRu ? 3_000_000 : isEs ? 0 : 125_000,
    swpYear: 0,
    swp: 0,
    target: isEs ? 250_000 : 20_000_000,
    scenario: 1,
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
      key: "initial",
      label: c.initialInvestment,
      value: s.initial,
      min: 0,
      max: 100_000_000,
      step: isEs ? 1_000 : 10_000,
      slider: { min: 0, max: isEs ? 500_000 : 5_000_000, step: isEs ? 5_000 : 50_000 },
      prefix: p,
      chips: isEs
        ? [5_000, 15_000, 30_000, 50_000, 100_000].map((v) => ({
            label: `${v / 1000}K €`,
            value: v,
          }))
        : [100_000, 250_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
            label:
              seo.locale === "ja"
                ? `${v / 10_000}万円`
                : isRu
                ? v >= 1_000_000
                  ? `${v / 1_000_000} млн ₽`
                  : `${v / 1000} тыс. ₽`
                : `${p}${v / 100_000}L`,
            value: v,
          })),
    },
    {
      key: "topup",
      label: c.monthlyTopup,
      value: s.topup,
      min: 0,
      max: 1_000_000,
      step: isEs ? 50 : 500,
      slider: { min: 0, max: isEs ? 5_000 : 100_000, step: isEs ? 50 : 500 },
      prefix: p,
      chips: isEs
        ? [0, 150, 300, 600, 1200].map((v) => ({
            label: `${v} €`,
            value: v,
          }))
        : [0, 5000, 10000, 25000, 50000].map((v) => ({
            label:
              seo.locale === "ja"
                ? v >= 10_000
                  ? `${v / 10_000}万円`
                  : `${v}円`
                : isRu
                ? v === 0
                  ? "0 ₽"
                  : `${v / 1000} тыс. ₽`
                : `${p}${v}`,
            value: v,
          })),
    },
    { key: "rate", label: c.returnRate, value: s.rate, min: 1, max: 25, step: 0.5, suffix: "%",
      chips: [6, 8, 10, 12, 15].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "years", label: c.years, value: s.years, min: 1, max: 40, step: 1,
      slider: { min: 3, max: 30, step: 1 },
      suffix: c.year,
      chips: [5, 10, 15, 20, 30].map((v) => ({ label: `${v}`, value: v })) },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "stepUp", label: c.stepUp, value: s.stepUp, min: 0, max: 25, step: 1, suffix: "%",
      chips: [0, 3, 5, 10, 15].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "expense", label: c.expenseRatio, value: s.expense, min: 0, max: 5, step: 0.05, suffix: "%",
      chips: [0.2, 0.5, 1, 1.5, 2].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "inflation", label: c.inflation, value: s.inflation, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [2, 3, 4, 6, 8].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "exitLoad", label: c.exitLoad, value: s.exitLoad, min: 0, max: 10, step: 0.25, suffix: "%",
      chips: [0, 0.5, 1, 2].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "ltcg", label: c.ltcgRate, value: s.ltcg, min: 0, max: 40, step: 0.5, suffix: "%",
      chips: (isEs ? [0, 19, 21, 23] : [10, 12.5, 20]).map((v) => ({ label: `${v}%`, value: v })) },
    { key: "exemption", label: c.ltcgExemption, value: s.exemption, min: 0, max: 2_000_000, step: isEs ? 1_000 : 25_000, prefix: p },
    { key: "swpYear", label: c.swpStartYear, value: s.swpYear, min: 0, max: 40, step: 1,
      chips: [0, 5, 10, 15, 20].map((v) => ({ label: `${v}`, value: v })) },
    { key: "swp", label: c.swpMonthly, value: s.swp, min: 0, max: 1_000_000, step: isEs ? 100 : 5000, prefix: p },
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
                  min: 0, max: 500_000_000, step: isEs ? 10_000 : 500_000,
                  prefix: p,
                }}
                onChange={set("target")}
              />
            </>
          }
          results={
            <>
              <ul className="kv-list">
                {/* Net redemption is the headline; not repeated here. */}
                {rows.map((r) => (
                  <li key={r.k}>
                    <span className="kv-key">{r.k}</span>
                    <span className="kv-value">{r.v}</span>
                  </li>
                ))}
              </ul>
              <BreakdownDonutChart
                items={[
                  { label: c.totalInvested, value: result.invested, color: "#0284c7" },
                  { label: c.estimatedReturns, value: Math.max(0, result.grossCorpus - result.invested), color: "#10b981" },
                ]}
                centerLabel={c.estimatedReturns}
                locale={seo.locale}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title={
              seo.locale === "ja"
                ? "投資信託資産推移グラフ"
                : isEs
                ? "Trayectoria de fondos de inversión y ETFs"
                : "Mutual Fund Growth Trajectory"
            }
            subtitle={
              seo.locale === "ja"
                ? "投資元本と運用資産の推移"
                : isEs
                ? "Patrimonio bruto proyectado frente al capital aportado durante el plazo"
                : "Projected gross corpus vs invested amount over tenure"
            }
            labels={result.rows.map((r) =>
              isEs ? `Año ${r.year}` : `${seo.locale === "ja" ? "" : "Yr "}${r.year}${seo.locale === "ja" ? "年目" : ""}`,
            )}
            datasets={[
              {
                label: c.grossCorpus,
                data: result.rows.map((r) => r.grossCorpus),
                color: "#0284c7",
                fill: true,
              },
              {
                label: c.totalInvested,
                data: result.rows.map((r) => r.invested),
                color: "#64748b",
                dashed: true,
              },
            ]}
            locale={seo.locale}
          />
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
        {seo.locale === "ru" && <RuMutualFundArticle />}
        {seo.locale === "es" && <EsMutualFundArticle />}
        {seo.locale === "en" && <InSipArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
