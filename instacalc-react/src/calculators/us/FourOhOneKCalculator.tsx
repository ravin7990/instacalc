import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculate401k } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { Us401kArticle } from "@/components/articles/us/Us401kArticle";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";

/** 401(k) projection with employer match and the indexed IRS deferral limit. */
export default function FourOhOneKCalculator({ seo }: { seo: SeoRecord }) {
  const c = usCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [s, setS] = useState({
    salary: 85_000, contribution: 8, match: 50, matchLimit: 6,
    age: 30, retire: 65, balance: 0, ret: 8, growth: 3,
  });

  const result = useMemo(
    () =>
      calculate401k({
        annualSalary: s.salary,
        contributionPercent: s.contribution,
        employerMatchPercent: s.match,
        matchLimitPercent: s.matchLimit,
        currentAge: s.age,
        retireAge: s.retire,
        currentBalance: s.balance,
        expectedReturn: s.ret,
        salaryGrowth: s.growth,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const fields: FieldSpec[] = [
    {
      key: "salary", label: c.annualSalary, value: s.salary,
      min: 20_000, max: 1_000_000, step: 1_000,
      slider: { min: 30_000, max: 400_000, step: 5_000 },
      prefix: p,
      chips: [50_000, 85_000, 120_000, 200_000, 300_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    { key: "contribution", label: c.contribution, value: s.contribution, min: 1, max: 50, step: 1, suffix: "%",
      chips: [3, 6, 8, 10, 15].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "match", label: c.employerMatch, value: s.match, min: 0, max: 100, step: 5, suffix: "%",
      chips: [0, 25, 50, 75, 100].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "matchLimit", label: c.matchLimit, value: s.matchLimit, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [3, 4, 6, 100].map((v) => ({ label: `${v === 100 ? "100" : v + "%"}`, value: v })) },
    { key: "age", label: c.currentAge, value: s.age, min: 18, max: 70, step: 1, suffix: c.year,
      chips: [22, 25, 30, 35, 40].map((v) => ({ label: `${v}`, value: v })) },
    { key: "retire", label: c.retireAge, value: s.retire, min: 50, max: 75, step: 1, suffix: c.year,
      chips: [59, 60, 65, 67].map((v) => ({ label: `${v}`, value: v })) },
    { key: "ret", label: c.expectedReturn, value: s.ret, min: 1, max: 15, step: 0.5, suffix: "%",
      chips: [5, 7, 8, 10].map((v) => ({ label: `${v}%`, value: v })) },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "growth", label: c.salaryGrowth, value: s.growth, min: 0, max: 10, step: 0.5, suffix: "%",
      chips: [0, 2, 3, 5].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "balance", label: c.currentBalance, value: s.balance, min: 0, max: 5_000_000, step: 1_000, prefix: p },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.corpus, c.employerMatch, c.totalGrowth, c.totalContributed]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="401k-calculator"
          title={c.corpus}
          summary={{ label: c.corpus, value: money(result.corpus) }}
          inputs={
            <>
              {fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
              {advancedFields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
            </>
          }
          results={
            <>
              <ResultList
                // "corpus" is the headline and is not repeated as a tile.
                items={[
                  { label: c.totalContributed, value: money(result.totalContributed) },
                  { label: c.totalGrowth, value: money(result.totalGrowth) },
                  { label: c.employee, value: money(result.totalEmployee) },
                  { label: c.employer, value: money(result.totalEmployer) },
                  { label: c.retireAge, value: `${result.retireAge}` },
                ]}
              />
              <BreakdownDonutChart
                locale={seo.locale}
                centerLabel={c.totalGrowth}
                items={[
                  { label: c.employee, value: result.totalEmployee, color: "#0284c7" },
                  { label: c.employer, value: result.totalEmployer, color: "#6366f1" },
                  { label: c.totalGrowth, value: result.totalGrowth, color: "#10b981" },
                ]}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title="401(k) Retirement Corpus Growth"
            subtitle="Projected account balance accumulation from employee and employer contributions"
            labels={result.rows.map((r) => `Age ${r.age}`)}
            datasets={[
              {
                label: c.corpus,
                data: result.rows.map((r) => r.balance),
                color: "#10b981",
                fill: true,
              },
            ]}
            locale={seo.locale}
          />
          <ProjectionTable
            caption={c.yearsTable}
            head={[c.year, c.employee, c.employer, c.totalGrowth, c.corpus]}
            rows={result.rows.map((r) => [
              String(r.year),
              formatCurrency(seo.locale, r.employee),
              formatCurrency(seo.locale, r.employer),
              formatCurrency(seo.locale, r.growth),
              formatCurrency(seo.locale, r.balance),
            ])}
          />
        </CalculatorShell>

        <Us401kArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
