import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSalary } from "@/engines/korea";
import { formatNumber, formatKoreanWonText } from "@/lib/currency";
import { KoSalaryArticle } from "@/components/articles/ko/KoSalaryArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function SalaryCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    amount: 50_000_000,
    basis: 0, // 0: annual, 1: monthly
    severanceIncluded: 0, // 0: excluded, 1: included (1/13)
    mealAllowance: 200_000,
    household: 1,
    children: 0,
  });

  const result = useMemo(
    () =>
      calculateSalary({
        amount: s.amount,
        basis: s.basis === 0 ? "annual" : "monthly",
        severanceIncluded: s.severanceIncluded === 1,
        mealAllowance: s.mealAllowance,
        household: s.household,
        children: s.children,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "amount",
      label: s.basis === 0 ? "연봉 (세전 총지급액)" : "월급 (세전 기본급+수당)",
      value: s.amount,
      min: 1_000_000,
      max: 300_000_000,
      step: 1_000_000,
      slider: { min: 20_000_000, max: 150_000_000, step: 1_000_000 },
      chips: [30_000_000, 40_000_000, 50_000_000, 70_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "basis",
      label: "계산 기준 (연봉 / 월급)",
      value: s.basis,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "연봉 기준", value: 0 },
        { label: "월급 기준", value: 1 },
      ],
    },
    {
      key: "household",
      label: "부양가족 수 (본인 포함)",
      value: s.household,
      min: 1,
      max: 10,
      step: 1,
      chips: [1, 2, 3, 4].map((v) => ({ label: `${v}명`, value: v })),
    },
    {
      key: "children",
      label: "20세 이하 자녀 수",
      value: s.children,
      min: 0,
      max: 6,
      step: 1,
      chips: [0, 1, 2, 3].map((v) => ({ label: `${v}명`, value: v })),
    },
    {
      key: "mealAllowance",
      label: "비과세 식대 (월 최대 20만원)",
      value: s.mealAllowance,
      min: 0,
      max: 300_000,
      step: 50_000,
      chips: [
        { label: "0원", value: 0 },
        { label: "10만원", value: 100_000 },
        { label: "20만원(한도)", value: 200_000 },
      ],
    },
  ];

  const rows = [
    { k: "세전 월 환산 급여", v: `₩${n(result.monthlyGross)}` },
    { k: "국민연금 (4.75%)", v: `₩${n(result.pension)}` },
    { k: "건강보험 (3.595%)", v: `₩${n(result.health)}` },
    { k: "장기요양보험 (건보료의 13.14%)", v: `₩${n(result.longTerm)}` },
    { k: "고용보험 (0.9%)", v: `₩${n(result.employment)}` },
    { k: "근로소득세 (간이세액 산정)", v: `₩${n(result.incomeTax)}` },
    { k: "지방소득세 (소득세의 10%)", v: `₩${n(result.localTax)}` },
    { k: "총 공제액 합계", v: `₩${n(result.totalDeduction)}` },
    { k: "실수령 비율", v: `${result.netRatio}%` },
    { k: "기업 부담 4대보험", v: `₩${n(result.employerInsurance)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 연봉 계산기"
          points={["4대보험 자동 공제", "소득세·지방소득세 산출", "부양가족 및 자녀 반영", "기업 총고용비용 안내"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="salary-calculator"
          title="2026년 연봉 및 월급 실수령액 계산"
          summary={{ label: "예상 월 실수령액", value: `₩${n(result.monthlyNet)} (${formatKoreanWonText(result.monthlyNet)})` }}
          onReset={() =>
            setS({
              amount: 50_000_000,
              basis: 0,
              severanceIncluded: 0,
              mealAllowance: 200_000,
              household: 1,
              children: 0,
            })
          }
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
          results={
            <>
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.k}>
                    <span className="kv-key">{r.k}</span>
                    <span className="kv-value">{r.v}</span>
                  </li>
                ))}
              </ul>
              <BreakdownDonutChart
                locale={seo.locale}
                centerLabel="월 실수령액"
                items={[
                  { label: "실수령액", value: result.monthlyNet, color: "#10b981" },
                  { label: "4대보험 합계", value: result.pension + result.health + result.longTerm + result.employment, color: "#0284c7" },
                  { label: "소득세·지방세", value: result.incomeTax + result.localTax, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoSalaryArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
