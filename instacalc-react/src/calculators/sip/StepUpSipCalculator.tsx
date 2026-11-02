import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSip } from "@/engines/sip";
import { symbol, money as moneyFormat } from "@/lib/currency";
import { InStepUpSipArticle } from "@/components/articles/in/InStepUpSipArticle";
import { TimelineGrowthChart, BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function StepUpSipCalculator({ seo }: { seo: SeoRecord }) {
  const p = symbol(seo.locale);
  const money = (v: number) => moneyFormat(seo.locale, v);

  const [monthly, setMonthly] = useState(10000);
  const [stepUp, setStepUp] = useState(10);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);

  const stepUpResult = useMemo(
    () => calculateSip({ monthly, annualRate: rate, years, stepUpPercent: stepUp }),
    [monthly, rate, years, stepUp],
  );

  const flatResult = useMemo(
    () => calculateSip({ monthly, annualRate: rate, years, stepUpPercent: 0 }),
    [monthly, rate, years],
  );

  const extraCorpus = Math.max(0, stepUpResult.corpus - flatResult.corpus);

  const fields: FieldSpec[] = [
    {
      key: "monthly",
      label: "Initial Monthly SIP (₹)",
      value: monthly,
      min: 500,
      max: 500000,
      step: 500,
      slider: { min: 1000, max: 100000, step: 1000 },
      prefix: p,
      chips: [2500, 5000, 10000, 25000, 50000].map((v) => ({
        label: `₹${v / 1000}K`,
        value: v,
      })),
    },
    {
      key: "stepUp",
      label: "Annual Step-Up (% p.a.)",
      value: stepUp,
      min: 0,
      max: 30,
      step: 1,
      slider: { min: 0, max: 25, step: 1 },
      suffix: "%",
      chips: [5, 10, 15, 20].map((v) => ({
        label: `${v}%`,
        value: v,
      })),
    },
    {
      key: "rate",
      label: "Expected Return Rate (% p.a.)",
      value: rate,
      min: 1,
      max: 30,
      step: 0.5,
      slider: { min: 5, max: 20, step: 0.5 },
      suffix: "%",
      chips: [8, 10, 12, 14, 16].map((v) => ({
        label: `${v}%`,
        value: v,
      })),
    },
    {
      key: "years",
      label: "Tenure (Years)",
      value: years,
      min: 1,
      max: 40,
      step: 1,
      slider: { min: 1, max: 30, step: 1 },
      suffix: " Yrs",
      chips: [5, 10, 15, 20, 25].map((v) => ({
        label: `${v} Yrs`,
        value: v,
      })),
    },
  ];

  const setters: Record<string, (v: number) => void> = {
    monthly: setMonthly,
    stepUp: setStepUp,
    rate: setRate,
    years: setYears,
  };

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="Wealth Accelerator"
          points={[
            "Annual Salary Increment Compounding",
            "Side-by-Side Flat SIP Comparison",
            "Year-Wise Progressive Cash Flow Table",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="step-up-sip-calculator"
          title="Step-Up SIP Corpus"
          path={seo.path}
          summary={{
            label: "Step-Up SIP Corpus",
            value: money(stepUpResult.corpus),
          }}
          summaryText={`Step-Up SIP Plan: Initial ₹${monthly}/mo with ${stepUp}% annual top-up for ${years} years @ ${rate}% return generates ₹${Math.round(stepUpResult.corpus).toLocaleString("en-IN")}, an extra ₹${Math.round(extraCorpus).toLocaleString("en-IN")} over a flat SIP.`}
          inputs={
            <div className="calc-inputs">
              {fields.map((f) => (
                <Field
                  key={f.key}
                  spec={f}
                  onChange={(v) => setters[f.key]?.(v)}
                />
              ))}
            </div>
          }
          results={
            <>
              <div
                style={{
                  padding: "0.85rem 1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  background: "#ecfdf5",
                  border: "1.5px solid #10b981",
                  color: "#065f46",
                  fontWeight: 600,
                }}
              >
                🚀 A {stepUp}% annual step-up generates an extra {money(extraCorpus)} over a standard flat SIP!
              </div>

              <ResultList
                items={[
                  {
                    label: "Step-Up SIP Total Corpus",
                    value: money(stepUpResult.corpus),
                    emphasis: true,
                  },
                  {
                    label: "Extra Wealth from Step-Up",
                    value: money(extraCorpus),
                    emphasis: true,
                  },
                  {
                    label: "Total Invested (Step-Up)",
                    value: money(stepUpResult.totalInvested),
                  },
                  {
                    label: "Total Estimated Returns",
                    value: money(stepUpResult.estimatedReturns),
                  },
                  {
                    label: "Flat SIP Corpus (No Step-Up)",
                    value: money(flatResult.corpus),
                  },
                ]}
              />

              <BreakdownDonutChart
                items={[
                  {
                    label: "Total Invested",
                    value: stepUpResult.totalInvested,
                    color: "#0284c7",
                  },
                  {
                    label: "Compound Returns",
                    value: stepUpResult.estimatedReturns,
                    color: "#10b981",
                  },
                ]}
                centerLabel="Total Corpus"
                locale={seo.locale}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title="Step-Up SIP vs Flat SIP Growth Over Time"
            labels={stepUpResult.rows.map((r) => `Yr ${r.year}`)}
            datasets={[
              {
                label: "Step-Up SIP Corpus",
                data: stepUpResult.rows.map((r) => r.balance),
                color: "#10b981",
                fill: true,
              },
              {
                label: "Flat SIP Corpus",
                data: flatResult.rows.map((r) => r.balance),
                color: "#64748b",
                dashed: true,
              },
            ]}
            locale={seo.locale}
          />

          <ProjectionTable
            caption="Year-Wise Progressive Breakdown"
            head={["Year", "Monthly SIP", "Total Invested", "Step-Up Corpus", "Flat SIP Corpus"]}
            rows={stepUpResult.rows.map((r, idx) => {
              const flatYear = flatResult.rows[idx]?.balance ?? 0;
              const yrMonthly = Math.round(monthly * Math.pow(1 + stepUp / 100, r.year - 1));
              return [
                String(r.year),
                money(yrMonthly),
                money(r.contributed),
                money(r.balance),
                money(flatYear),
              ];
            })}
          />
        </CalculatorShell>

        <InStepUpSipArticle />
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
