import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateAnnualLeavePay } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoAnnualLeavePayArticle } from "@/components/articles/ko/KoAnnualLeavePayArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function AnnualLeavePayCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    monthlyBaseSalary: 3_500_000,
    monthlyFixedAllowance: 200_000,
    weeklyHours: 40,
    unusedDays: 5,
  });

  const result = useMemo(
    () =>
      calculateAnnualLeavePay({
        monthlyBaseSalary: s.monthlyBaseSalary,
        monthlyFixedAllowance: s.monthlyFixedAllowance,
        weeklyHours: s.weeklyHours,
        unusedDays: s.unusedDays,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "monthlyBaseSalary",
      label: "월 기본급 (통상임금 기본급)",
      value: s.monthlyBaseSalary,
      min: 1_000_000,
      max: 20_000_000,
      step: 100_000,
      slider: { min: 2_000_000, max: 8_000_000, step: 100_000 },
      chips: [2_500_000, 3_000_000, 3_500_000, 4_000_000, 5_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "monthlyFixedAllowance",
      label: "월 고정수당 (직책수당·직무수당 등 통상임금 산입분)",
      value: s.monthlyFixedAllowance,
      min: 0,
      max: 5_000_000,
      step: 50_000,
      chips: [0, 100_000, 200_000, 300_000, 500_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "unusedDays",
      label: "미사용 연차휴가 일수 (일)",
      value: s.unusedDays,
      min: 0.5,
      max: 30,
      step: 0.5,
      slider: { min: 1, max: 20, step: 0.5 },
      chips: [1, 3, 5, 7, 10, 15].map((d) => ({ label: `${d}일`, value: d })),
    },
    {
      key: "weeklyHours",
      label: "주 소정근로시간 (주 5일 8시간 = 40시간)",
      value: s.weeklyHours,
      min: 15,
      max: 52,
      step: 1,
      chips: [
        { label: "주 40시간 (기본 209시간)", value: 40 },
        { label: "주 35시간", value: 35 },
        { label: "주 30시간", value: 30 },
      ],
    },
  ];

  const rows = [
    { k: "월 통상임금 합계", v: `₩${n(result.monthlyOrdinaryWage)}` },
    { k: "월 소정근로시간 (주휴 포함)", v: `${result.monthlyStandardHours}시간` },
    { k: "시간당 통상임금", v: `₩${n(result.hourlyOrdinaryWage)} / 시간` },
    { k: "1일 통상임금 (8시간 기준)", v: `₩${n(result.dailyOrdinaryWage)}` },
    { k: "총 연차수당 (세전 지급액)", v: `₩${n(result.totalAnnualLeavePay)}` },
    { k: "예상 세금 및 4대보험 공제", v: `-₩${n(result.estimatedTaxAndDeductions)}` },
    { k: "예상 실수령 연차수당", v: `₩${n(result.netAnnualLeavePay)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="노동법 급여 계산기"
          points={[
            "근로기준법 제60조 및 209시간 통상임금 산출식 적용",
            "1일 8시간 통상임금 기준 미사용 일수 실시간 계산",
            "연말정산 소득세 공제 반영 예상 실수령액 확인",
            "퇴직 시 잔여 연차 보상 정산 가이드",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="annual-leave-pay-calculator"
          title="미사용 연차유급휴가 수당 계산"
          summary={{
            label: "총 미사용 연차수당 (세전)",
            value: `₩${n(result.totalAnnualLeavePay)}`,
          }}
          onReset={() =>
            setS({
              monthlyBaseSalary: 3_500_000,
              monthlyFixedAllowance: 200_000,
              weeklyHours: 40,
              unusedDays: 5,
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
                centerLabel="연차수당"
                items={[
                  { label: "실수령액", value: result.netAnnualLeavePay, color: "#10b981" },
                  { label: "예상 세금공제", value: result.estimatedTaxAndDeductions, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoAnnualLeavePayArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
