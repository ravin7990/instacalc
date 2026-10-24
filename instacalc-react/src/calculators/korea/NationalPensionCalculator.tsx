import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateNationalPension } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoNationalPensionArticle } from "@/components/articles/ko/KoNationalPensionArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function NationalPensionCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    monthlyIncome: 3_500_000,
    yearsEnrolled: 25,
    isEmployee: 0, // 0: employee (4.5%), 1: regional (9.0%)
  });

  const result = useMemo(
    () =>
      calculateNationalPension({
        monthlyIncome: s.monthlyIncome,
        yearsEnrolled: s.yearsEnrolled,
        isEmployee: s.isEmployee === 0,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "monthlyIncome",
      label: "월 평균 소득액 (기준소득월액, 원)",
      value: s.monthlyIncome,
      min: 390_000,
      max: 6_170_000,
      step: 100_000,
      slider: { min: 500_000, max: 6_170_000, step: 100_000 },
      chips: [2_000_000, 3_000_000, 4_000_000, 5_000_000, 6_170_000].map((v) => ({
        label: v === 6_170_000 ? "상한액 617만" : `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "yearsEnrolled",
      label: "총 예상 가입 기간 (년수, 10~40년)",
      value: s.yearsEnrolled,
      min: 10,
      max: 45,
      step: 1,
      chips: [
        { label: "10년 (최소요건)", value: 10 },
        { label: "20년", value: 20 },
        { label: "25년", value: 25 },
        { label: "30년", value: 30 },
      ],
    },
    {
      key: "isEmployee",
      label: "가입자 유형 구분",
      value: s.isEmployee,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "직장가입자 (본인 4.5% + 회사 4.5%)", value: 0 },
        { label: "지역가입자 (본인 9.0% 전액)", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "적용 기준소득월액", v: `₩${n(result.standardMonthlyIncome)}` },
    { k: "매월 본인 부담 보험료", v: `₩${n(result.monthlyPremium)}` },
    { k: "가입기간 총 납부보험료", v: `₩${n(result.totalPremiumsPaid)}` },
    { k: "만 65세 기준 연간 예상 수령액", v: `₩${n(result.estimatedAnnualPension)}` },
    { k: "원금 회수 소요 기간(손익분기)", v: `약 ${result.breakEvenYears}년 (${result.breakEvenMonths}개월)` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="국민연금 예상수령액 계산기"
          points={["2026 기준소득월액 상·하한선 반영", "직장(4.5%) 및 지역(9.0%) 보험료 계산", "만 65세 이후 평생 예상 연금액 산출", "납부 원금 회수 손익분기 기간 분석"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="national-pension-calculator"
          title="국민연금 예상 수령액 및 월 납부보험료 계산기"
          summary={{ label: "만 65세 이후 매월 예상 연금액", value: `₩${n(result.estimatedMonthlyPension)}` }}
          onReset={() =>
            setS({
              monthlyIncome: 3_500_000,
              yearsEnrolled: 25,
              isEmployee: 0,
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
                centerLabel="연금 수지 분석"
                items={[
                  { label: "총 납부보험료", value: result.totalPremiumsPaid, color: "#0284c7" },
                  { label: "10년간 총 수령액", value: result.estimatedAnnualPension * 10, color: "#10b981" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="가입 기간별 예상 월 수령액 및 납부 총액 비교"
            head={["가입 기간", "월 예상 연금액", "연간 총 수령액", "누적 납부보험료"]}
            rows={result.yearsSchedule.map((ys) => [
              `${ys.years}년`,
              `₩${n(ys.monthlyPension)}`,
              `₩${n(ys.annualPension)}`,
              `₩${n(ys.totalPaid)}`,
            ])}
          />
        </CalculatorShell>

        <KoNationalPensionArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
