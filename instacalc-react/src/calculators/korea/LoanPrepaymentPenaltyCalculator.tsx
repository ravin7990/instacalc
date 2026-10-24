import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateLoanPrepaymentPenalty } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoLoanPrepaymentPenaltyArticle } from "@/components/articles/ko/KoLoanPrepaymentPenaltyArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function LoanPrepaymentPenaltyCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    prepaymentAmount: 200_000_000,
    feeRatePercent: 1.2,
    loanTermDays: 1095,
    elapsedDays: 365,
    currentInterestRate: 4.8,
    newInterestRate: 3.5,
  });

  const result = useMemo(
    () =>
      calculateLoanPrepaymentPenalty({
        prepaymentAmount: s.prepaymentAmount,
        feeRatePercent: s.feeRatePercent,
        loanTermDays: s.loanTermDays,
        elapsedDays: s.elapsedDays,
        currentInterestRate: s.currentInterestRate,
        newInterestRate: s.newInterestRate,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "prepaymentAmount",
      label: "중도상환 원금 (조기 갚으려는 금액)",
      value: s.prepaymentAmount,
      min: 1_000_000,
      max: 2_000_000_000,
      step: 10_000_000,
      slider: { min: 10_000_000, max: 1_000_000_000, step: 10_000_000 },
      chips: [50_000_000, 100_000_000, 200_000_000, 300_000_000, 500_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "feeRatePercent",
      label: "대출 중도상환수수료율 (%)",
      value: s.feeRatePercent,
      min: 0.1,
      max: 3.0,
      step: 0.1,
      chips: [
        { label: "0.5% (신용대출)", value: 0.5 },
        { label: "1.2% (주담대 변동)", value: 1.2 },
        { label: "1.4% (주담대 고정)", value: 1.4 },
        { label: "1.5% (제2금융권)", value: 1.5 },
      ],
    },
    {
      key: "elapsedDays",
      label: "대출 실행 후 경과 일수 (3년 1,095일 기준)",
      value: s.elapsedDays,
      min: 1,
      max: 1095,
      step: 30,
      slider: { min: 1, max: 1095, step: 10 },
      chips: [
        { label: "6개월 (180일)", value: 180 },
        { label: "1년 (365일)", value: 365 },
        { label: "1.5년 (545일)", value: 545 },
        { label: "2년 (730일)", value: 730 },
        { label: "3년 (1,095일 면제)", value: 1095 },
      ],
    },
    {
      key: "currentInterestRate",
      label: "현재 이용 중인 대출 금리 (%)",
      value: s.currentInterestRate,
      min: 1.0,
      max: 20.0,
      step: 0.1,
      chips: [3.8, 4.5, 4.8, 5.2, 5.8].map((r) => ({ label: `${r}%`, value: r })),
    },
    {
      key: "newInterestRate",
      label: "갈아타려는 신규 대환 대출 금리 (%)",
      value: s.newInterestRate,
      min: 1.0,
      max: 20.0,
      step: 0.1,
      chips: [2.8, 3.2, 3.5, 3.8, 4.0].map((r) => ({ label: `${r}%`, value: r })),
    },
  ];

  const rows = [
    { k: "당초 약정 최고 수수료 (경과 0일 기준)", v: `₩${n(Math.round(s.prepaymentAmount * (s.feeRatePercent / 100)))}` },
    { k: "현재 경과일수 기준 부과 수수료", v: `₩${n(result.prepaymentPenalty)}` },
    { k: "수수료 면제까지 남은 일수", v: `${result.remainingPenaltyDays}일 (3년 경과 시 0원 면제)` },
    { k: "대환 시 매달 아끼는 이자 금액", v: `₩${n(result.monthlyInterestSavings)} / 월` },
    { k: "수수료 회수 손익분기점(BEP)", v: `${result.breakEvenMonths}개월 후 원금 회수` },
    { k: "대환대출 갈아타기 추천 여부", v: result.isWorthRefinancing ? "추천 (수수료 대비 이자 절감 효과 큼)" : "보류 또는 면제 시점 대기 권장" },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="대출 갈아타기 손익 계산"
          points={[
            "3년(1,095일) 법정 슬라이딩 일할 감면 공식 정확 적용",
            "대출 실행일별 잔여 수수료 실시간 확인",
            "신규 대출 금리 인하 시 월 이자 절감액 비교",
            "대환대출 손익분기점(BEP) 개월수 자동 진단",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="loan-prepayment-penalty-calculator"
          title="대출 중도상환수수료 및 대환대출 손익분기 계산"
          summary={{
            label: result.prepaymentPenalty === 0 ? "중도상환수수료 0원 (전액 면제)" : "현재 발생 중도상환수수료",
            value: result.prepaymentPenalty === 0 ? "0원 (3년 만기 경과)" : `₩${n(result.prepaymentPenalty)}`,
          }}
          onReset={() =>
            setS({
              prepaymentAmount: 200_000_000,
              feeRatePercent: 1.2,
              loanTermDays: 1095,
              elapsedDays: 365,
              currentInterestRate: 4.8,
              newInterestRate: 3.5,
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
                centerLabel="수수료 vs 절감"
                items={[
                  { label: "1년 누적 이자 절감액", value: result.monthlyInterestSavings * 12, color: "#10b981" },
                  { label: "부과 수수료", value: result.prepaymentPenalty, color: "#ef4444" },
                ]}
              />
            </>
          }
        />

        <KoLoanPrepaymentPenaltyArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
