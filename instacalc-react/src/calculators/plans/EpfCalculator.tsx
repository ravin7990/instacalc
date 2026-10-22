import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateEpf } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { RuEpfArticle } from "@/components/articles/ru/RuEpfArticle";
import { InEpfArticle } from "@/components/articles/in/InEpfArticle";

/** EPF, EPS and VPF projection. */
export default function EpfCalculator({ seo }: { seo: SeoRecord }) {
  const c = planCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [s, setS] = useState({
    salary: 50_000, age: 30, retire: 58, hike: 7,
    interest: 8.25, balance: 250_000, inflation: 6, vpf: 0, topup: 0,
  });

  const result = useMemo(
    () =>
      calculateEpf({
        monthlySalary: s.salary, currentAge: s.age, retirementAge: s.retire,
        annualHike: s.hike, employeeRate: 12, vpfRate: s.vpf, epfInterest: s.interest,
        employerEpfRate: 3.67, epsRate: 8.33, epsWageCap: 15_000,
        wageCapMode: false, epfWageCap: 15_000,
        currentBalance: s.balance, oneTimeTopup: s.topup, inflation: s.inflation,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const fields: FieldSpec[] = [
    {
      key: "salary", label: c.monthlySalary, value: s.salary,
      min: 5_000, max: 500_000, step: 500,
      slider: { min: 10_000, max: 200_000, step: 500 },
      prefix: p,
      chips: [15_000, 25_000, 50_000, 100_000, 200_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    { key: "age", label: c.currentAge, value: s.age, min: 18, max: 60, step: 1, suffix: c.years,
      chips: [22, 25, 30, 35, 40].map((v) => ({ label: `${v}`, value: v })) },
    { key: "retire", label: c.retirementAge, value: s.retire, min: 50, max: 70, step: 1, suffix: c.years,
      chips: [57, 58, 60, 63, 65].map((v) => ({ label: `${v}`, value: v })) },
    { key: "hike", label: c.annualHike, value: s.hike, min: 0, max: 20, step: 0.5, suffix: "%",
      chips: [0, 5, 7, 10, 15].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "interest", label: c.interestRate, value: s.interest, min: 3, max: 12, step: 0.05, suffix: "%",
      chips: [7.5, 8, 8.25, 9].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "balance", label: c.currentBalance, value: s.balance, min: 0, max: 10_000_000, step: 1000, prefix: p },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "vpf", label: c.vpfRate, value: s.vpf, min: 0, max: 5, step: 0.5, suffix: "%",
      chips: [0, 1, 2, 5].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "topup", label: c.oneTimeTopup, value: s.topup, min: 0, max: 5_000_000, step: 10_000, prefix: p },
    { key: "inflation", label: c.inflation, value: s.inflation, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [4, 5, 6, 7].map((v) => ({ label: `${v}%`, value: v })) },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow}
          points={[c.corpus, c.monthlyPension, c.corpusReal, c.totalInterest]} />

        <CalculatorShell
          locale={seo.locale} id="epf-calculator" title={c.corpus}
          summary={{ label: c.corpus, value: money(result.corpus) }}
          inputs={<>
            {fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
            {advancedFields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
          </>}
          results={
            <ResultList
              // "corpus" is the headline and is not repeated as a tile.
              items={[
                { label: c.corpusReal, value: money(result.corpusReal) },
                { label: c.monthlyPension, value: money(result.monthlyPension) },
                { label: c.monthlyEpf, value: money(result.monthlyEpf) },
                { label: c.totalInvested, value: money(result.totalInvested) },
                { label: c.totalInterest, value: money(result.totalInterest) },
                { label: c.employee, value: money(result.totalEmployee) },
                { label: c.employer, value: money(result.totalEmployer) },
                { label: c.eps, value: money(result.totalEps) },
              ]}
            />
          }
        >
          <ProjectionTable
            caption={c.yearsTable}
            head={[c.year, c.age, c.employee, c.employer, c.interest, c.balance]}
            rows={result.rows.map((r) => [
              String(r.year), String(r.age),
              formatCurrency(seo.locale, r.employee),
              formatCurrency(seo.locale, r.employer),
              formatCurrency(seo.locale, r.interest),
              formatCurrency(seo.locale, r.balance),
            ])}
          />
        </CalculatorShell>

        {seo.locale === "ru" && <RuEpfArticle />}
        {seo.locale === "en" && <InEpfArticle />}
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
