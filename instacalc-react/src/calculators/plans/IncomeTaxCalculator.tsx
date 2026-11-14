import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateIncomeTax } from "@/engines/income-tax";
import { symbol, money as moneyFormat } from "@/lib/currency";
import { useCurrency } from "@/app/CurrencyContext";
import { InIncomeTaxArticle } from "@/components/articles/in/InIncomeTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function IncomeTaxCalculator({ seo }: { seo: SeoRecord }) {
  const { symbol: activeSym } = useCurrency();
  const p = activeSym;
  const money = (v: number) => moneyFormat(seo.locale, v);

  const [income, setIncome] = useState(1200000);
  const [deductions, setDeductions] = useState(150000);
  const [nps, setNps] = useState(50000);

  const result = useMemo(
    () => calculateIncomeTax({ grossIncome: income, extraDeductions: deductions, npsDeduction: nps }),
    [income, deductions, nps],
  );

  const fields: FieldSpec[] = [
    {
      key: "income",
      label: "Gross Annual Income (₹)",
      value: income,
      min: 100000,
      max: 100000000,
      step: 10000,
      slider: { min: 300000, max: 5000000, step: 25000 },
      prefix: p,
      chips: [600000, 1000000, 1200000, 1500000, 2500000].map((v) => ({
        label: `₹${v / 100000}L`,
        value: v,
      })),
    },
    {
      key: "deductions",
      label: "Old Regime Deductions: 80C, 80D, HRA (₹)",
      value: deductions,
      min: 0,
      max: 2000000,
      step: 5000,
      slider: { min: 0, max: 1000000, step: 10000 },
      prefix: p,
      chips: [0, 150000, 250000, 400000].map((v) => ({
        label: `₹${v / 1000}K`,
        value: v,
      })),
    },
    {
      key: "nps",
      label: "NPS Tier 1 — Sec 80CCD(1B) (₹)",
      value: nps,
      min: 0,
      max: 50000,
      step: 5000,
      slider: { min: 0, max: 50000, step: 5000 },
      prefix: p,
      chips: [0, 25000, 50000].map((v) => ({
        label: `₹${v / 1000}K`,
        value: v,
      })),
    },
  ];

  const setters: Record<string, (v: number) => void> = {
    income: setIncome,
    deductions: setDeductions,
    nps: setNps,
  };

  const isNewBetter = result.winner === "new";
  const isEqual = result.winner === "equal";

  return (
    <>
      <SeoHead seo={seo} />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="Tax Planning & Regime Comparison"
          points={[
            "New Regime FY 2026-27 Slabs",
            "Old Regime Deduction Comparison",
            "Section 87A Rebate & ₹75k Std Deduction",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="income-tax-calculator"
          title="Income Tax Comparison"
          path={seo.path}
          summary={{
            label: isNewBetter ? "New Regime Tax" : "Old Regime Tax",
            value: money(isNewBetter ? result.newRegime.totalTax : result.oldRegime.totalTax),
          }}
          summaryText={`Income Tax Comparison: Gross Income ${money(income)}. New Regime Tax: ${money(result.newRegime.totalTax)}, Old Regime Tax: ${money(result.oldRegime.totalTax)}. ${isEqual ? "Both regimes yield equal tax." : `${result.winner.toUpperCase()} Regime saves ${money(result.difference)}/year.`}`}
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
                  background: isEqual
                    ? "#f1f5f9"
                    : isNewBetter
                    ? "#ecfdf5"
                    : "#eff6ff",
                  border: `1.5px solid ${isEqual ? "#cbd5e1" : isNewBetter ? "#10b981" : "#3b82f6"}`,
                  color: isEqual ? "#334155" : isNewBetter ? "#065f46" : "#1e40af",
                  fontWeight: 600,
                }}
              >
                {isEqual
                  ? "Both tax regimes yield the exact same tax for these parameters."
                  : isNewBetter
                  ? `🎉 New Tax Regime is more beneficial — saves ${money(result.difference)}/year!`
                  : `💡 Old Tax Regime is more beneficial — saves ${money(result.difference)}/year!`}
              </div>

              <ResultList
                items={[
                  {
                    label: "New Regime Total Tax",
                    value: money(result.newRegime.totalTax),
                    emphasis: isNewBetter,
                  },
                  {
                    label: "Old Regime Total Tax",
                    value: money(result.oldRegime.totalTax),
                    emphasis: !isNewBetter && !isEqual,
                  },
                  {
                    label: "Annual Tax Savings",
                    value: money(result.difference),
                    emphasis: true,
                  },
                  {
                    label: "New Regime Taxable Income",
                    value: money(result.newRegime.taxableIncome),
                  },
                  {
                    label: "Old Regime Taxable Income",
                    value: money(result.oldRegime.taxableIncome),
                  },
                ]}
              />

              <BreakdownDonutChart
                items={[
                  {
                    label: "New Regime Tax",
                    value: result.newRegime.totalTax,
                    color: "#10b981",
                  },
                  {
                    label: "Take-Home (New)",
                    value: Math.max(0, income - result.newRegime.totalTax),
                    color: "#0284c7",
                  },
                ]}
                centerLabel="New Regime"
                locale={seo.locale}
              />
            </>
          }
        >
          <ProjectionTable
            caption="Regime Breakdown Comparison (FY 2026-27)"
            head={["Metric", "New Tax Regime", "Old Tax Regime"]}
            rows={[
              ["Gross Total Salary", money(income), money(income)],
              [
                "Standard Deduction",
                money(result.newRegime.standardDeduction),
                money(result.oldRegime.standardDeduction),
              ],
              [
                "Other Eligible Deductions (80C, 80D, NPS)",
                "Not Allowed",
                money(deductions + nps),
              ],
              [
                "Net Taxable Income",
                money(result.newRegime.taxableIncome),
                money(result.oldRegime.taxableIncome),
              ],
              [
                "Base Slab Tax",
                money(result.newRegime.baseTax),
                money(result.oldRegime.baseTax),
              ],
              [
                "Section 87A Tax Rebate",
                money(result.newRegime.rebate87A),
                money(result.oldRegime.rebate87A),
              ],
              [
                "Health & Education Cess (4%)",
                money(result.newRegime.cess),
                money(result.oldRegime.cess),
              ],
              [
                "Net Annual Tax Payable",
                money(result.newRegime.totalTax),
                money(result.oldRegime.totalTax),
              ],
            ]}
          />
        </CalculatorShell>

        <InIncomeTaxArticle />
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
