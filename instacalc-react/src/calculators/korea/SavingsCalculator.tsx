import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSavings, type SavingsTaxType, type SavingsMethod } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoSavingsArticle } from "@/components/articles/ko/KoSavingsArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function SavingsCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    monthlyDeposit: 500_000,
    periodMonths: 12,
    annualRate: 4.5,
    taxType: 0, // 0: normal(15.4%), 1: preferential(1.4%), 2: nonTaxable(0%)
    savingsMethod: 0, // 0: fixed(단리), 1: compound(월복리)
  });

  const taxTypeMap: SavingsTaxType[] = ["normal", "preferential", "nonTaxable"];
  const methodMap: SavingsMethod[] = ["fixed", "compound"];

  const result = useMemo(
    () =>
      calculateSavings({
        monthlyDeposit: s.monthlyDeposit,
        periodMonths: s.periodMonths,
        annualRate: s.annualRate,
        taxType: taxTypeMap[s.taxType],
        savingsMethod: methodMap[s.savingsMethod],
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "monthlyDeposit",
      label: "매월 적립 금액 (원)",
      value: s.monthlyDeposit,
      min: 10_000,
      max: 10_000_000,
      step: 50_000,
      slider: { min: 100_000, max: 3_000_000, step: 50_000 },
      chips: [100_000, 300_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "periodMonths",
      label: "적금 기간 (개월)",
      value: s.periodMonths,
      min: 1,
      max: 60,
      step: 1,
      chips: [
        { label: "6개월", value: 6 },
        { label: "12개월 (1년)", value: 12 },
        { label: "24개월 (2년)", value: 24 },
        { label: "36개월 (3년)", value: 36 },
      ],
    },
    {
      key: "annualRate",
      label: "약정 연이율 (%)",
      value: s.annualRate,
      min: 0.1,
      max: 15,
      step: 0.1,
      chips: [
        { label: "3.5%", value: 3.5 },
        { label: "4.0%", value: 4.0 },
        { label: "4.5%", value: 4.5 },
        { label: "5.5%", value: 5.5 },
      ],
    },
    {
      key: "taxType",
      label: "과세 구분",
      value: s.taxType,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "일반과세 (15.4%)", value: 0 },
        { label: "세금우대 (1.4%)", value: 1 },
        { label: "비과세 (0%)", value: 2 },
      ],
    },
    {
      key: "savingsMethod",
      label: "적금 적립 방식",
      value: s.savingsMethod,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "정액적립식 (단리)", value: 0 },
        { label: "월복리 적금", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "총 불입 원금", v: `₩${n(result.totalPrincipal)}` },
    { k: "세전 약정 이자", v: `₩${n(result.preTaxInterest)}` },
    { k: "이자소득세 공제액", v: `₩${n(result.totalTax)}` },
    { k: "세후 실수령 이자", v: `₩${n(result.postTaxInterest)}` },
    { k: "실효 연이자율", v: `${result.effectiveRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 정기적금 계산기"
          points={["정액적립식 단리 공식 반영", "15.4% 소득세 원천징수 계산", "회차별 누적 적립 스케줄", "선납이연 및 풍차돌리기 연계"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="savings-calculator"
          title="2026년 정기적금 만기 수령액 및 이자 계산기"
          summary={{ label: "만기 최종 수령액", value: `₩${n(result.totalReturn)}` }}
          onReset={() =>
            setS({
              monthlyDeposit: 500_000,
              periodMonths: 12,
              annualRate: 4.5,
              taxType: 0,
              savingsMethod: 0,
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
                centerLabel="만기 수령액"
                items={[
                  { label: "총 납입원금", value: result.totalPrincipal, color: "#0284c7" },
                  { label: "세후 이자", value: result.postTaxInterest, color: "#10b981" },
                  ...(result.totalTax > 0 ? [{ label: "공제 세금", value: result.totalTax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="적금 회차별 누적 원금 및 누적 이자 추이"
            head={["회차", "누적 납입원금", "누적 발생이자", "총 평가잔액"]}
            rows={result.schedule.map((sc) => [
              `${sc.month}개월차`,
              `₩${n(sc.cumulativePrincipal)}`,
              `₩${n(sc.cumulativeInterest)}`,
              `₩${n(sc.balance)}`,
            ])}
          />
        </CalculatorShell>

        <KoSavingsArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
