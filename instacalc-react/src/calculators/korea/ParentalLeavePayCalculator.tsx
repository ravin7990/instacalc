import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateParentalLeavePay } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoParentalLeavePayArticle } from "@/components/articles/ko/KoParentalLeavePayArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function ParentalLeavePayCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    ordinaryMonthlyWage: 3_000_000,
    durationMonths: 12,
    isBothParentsLeave: 0, // 0: no, 1: yes (6+6)
  });

  const result = useMemo(
    () =>
      calculateParentalLeavePay({
        ordinaryMonthlyWage: s.ordinaryMonthlyWage,
        durationMonths: s.durationMonths,
        isBothParentsLeave: s.isBothParentsLeave === 1,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "ordinaryMonthlyWage",
      label: "통상임금 (기본급 + 고정수당 월급)",
      value: s.ordinaryMonthlyWage,
      min: 1_000_000,
      max: 10_000_000,
      step: 100_000,
      slider: { min: 1_500_000, max: 6_000_000, step: 100_000 },
      chips: [2_000_000, 2_500_000, 3_000_000, 3_500_000, 4_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "durationMonths",
      label: "육아휴직 신청 개월 수",
      value: s.durationMonths,
      min: 1,
      max: 12,
      step: 1,
      chips: [3, 6, 9, 12].map((m) => ({ label: `${m}개월`, value: m })),
    },
    {
      key: "isBothParentsLeave",
      label: "6+6 부모육아휴직제 적용 여부 (부모 동시/순차 사용)",
      value: s.isBothParentsLeave,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "일반 단독 육아휴직 (최대 250만 원)", value: 0 },
        { label: "6+6 부모육아휴직제 (최대 450만 원)", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "총 육아휴직 급여 수령액", v: `₩${n(result.totalPaidAmount)}` },
    { k: "월평균 수령액", v: `₩${n(result.averageMonthlyPay)} / 월` },
    {
      k: "1~3개월차 월 지급액",
      v: `₩${n(result.monthlyBreakdown[0]?.paidAmount ?? 0)} (상한 ₩${n(result.monthlyBreakdown[0]?.monthlyCap ?? 0)})`,
    },
    {
      k: "4~6개월차 월 지급액",
      v: result.monthlyBreakdown[3]
        ? `₩${n(result.monthlyBreakdown[3].paidAmount)} (상한 ₩${n(result.monthlyBreakdown[3].monthlyCap)})`
        : "해당 없음",
    },
    {
      k: "7~12개월차 월 지급액",
      v: result.monthlyBreakdown[6]
        ? `₩${n(result.monthlyBreakdown[6].paidAmount)} (상한 ₩${n(result.monthlyBreakdown[6].monthlyCap)})`
        : "해당 없음",
    },
    { k: "종전(월 150만 한도) 대비 2026 추가 혜택", v: `+₩${n(result.capBenefitGain)} 더 많이 수령` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 고용노동부 최신 개정"
          points={[
            "1~3개월차 최대 250만 원 상한액 대폭 인상 반영",
            "4~6개월차 200만 원, 7~12개월차 160만 원 적용",
            "6+6 부모육아휴직제 최대 450만 원 특례 계산",
            "월별 실 수령액 타임라인 실시간 제공",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="parental-leave-pay-calculator"
          title="육아휴직 급여 모의계산 (2026 개정안)"
          summary={{
            label: `${s.durationMonths}개월 총 수령액`,
            value: `₩${n(result.totalPaidAmount)}`,
          }}
          onReset={() =>
            setS({
              ordinaryMonthlyWage: 3_000_000,
              durationMonths: 12,
              isBothParentsLeave: 0,
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
                centerLabel="기간별 급여"
                items={[
                  {
                    label: "1~3개월분",
                    value: result.monthlyBreakdown.slice(0, 3).reduce((acc, x) => acc + x.paidAmount, 0),
                    color: "#0284c7",
                  },
                  {
                    label: "4~6개월분",
                    value: result.monthlyBreakdown.slice(3, 6).reduce((acc, x) => acc + x.paidAmount, 0),
                    color: "#10b981",
                  },
                  {
                    label: "7~12개월분",
                    value: result.monthlyBreakdown.slice(6, 12).reduce((acc, x) => acc + x.paidAmount, 0),
                    color: "#f59e0b",
                  },
                ].filter((x) => x.value > 0)}
              />
            </>
          }
        />

        <KoParentalLeavePayArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
