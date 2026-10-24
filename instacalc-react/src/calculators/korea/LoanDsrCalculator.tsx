import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateLoan, calculateDsr, maxLoanForDsr, type RepayType } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoLoanDsrArticle } from "@/components/articles/ko/KoLoanDsrArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function LoanDsrCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    principal: 300_000_000,
    ratePercent: 4.2,
    years: 30,
    type: 0, // 0: equalPayment, 1: equalPrincipal, 2: bullet
    annualIncome: 70_000_000,
    existingAnnualPayment: 5_000_000,
  });

  const repayType: RepayType = s.type === 0 ? "equalPayment" : s.type === 1 ? "equalPrincipal" : "bullet";

  const loan = useMemo(
    () =>
      calculateLoan({
        principal: s.principal,
        ratePercent: s.ratePercent,
        years: s.years,
        type: repayType,
      }),
    [s.principal, s.ratePercent, s.years, repayType],
  );

  const dsr = useMemo(
    () =>
      calculateDsr({
        annualIncome: s.annualIncome,
        newLoanAnnualPayment: loan.firstYearPayment,
        existingAnnualPayment: s.existingAnnualPayment,
      }),
    [s.annualIncome, loan.firstYearPayment, s.existingAnnualPayment],
  );

  const maxLoan = useMemo(
    () =>
      maxLoanForDsr(
        { ratePercent: s.ratePercent, years: s.years, type: repayType },
        s.annualIncome,
        s.existingAnnualPayment,
        40,
      ),
    [s.ratePercent, s.years, repayType, s.annualIncome, s.existingAnnualPayment],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "principal",
      label: "신규 대출 희망 원금",
      value: s.principal,
      min: 1_000_000,
      max: 2_000_000_000,
      step: 1_000_000,
      slider: { min: 10_000_000, max: 1_000_000_000, step: 10_000_000 },
      chips: [100_000_000, 200_000_000, 300_000_000, 500_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "ratePercent",
      label: "대출 연 이자율 (%)",
      value: s.ratePercent,
      min: 1.0,
      max: 20.0,
      step: 0.1,
      chips: [3.5, 4.0, 4.5, 5.0, 6.0].map((v) => ({ label: `${v}%`, value: v })),
    },
    {
      key: "years",
      label: "대출 상환 기간 (년)",
      value: s.years,
      min: 1,
      max: 50,
      step: 1,
      slider: { min: 5, max: 40, step: 5 },
      chips: [10, 20, 30, 40].map((v) => ({ label: `${v}년`, value: v })),
    },
    {
      key: "type",
      label: "상환 방식 선택",
      value: s.type,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "원리금균등", value: 0 },
        { label: "원금균등", value: 1 },
        { label: "만기일시", value: 2 },
      ],
    },
    {
      key: "annualIncome",
      label: "본인 연간 소득 (DSR 산정용)",
      value: s.annualIncome,
      min: 10_000_000,
      max: 500_000_000,
      step: 1_000_000,
      slider: { min: 20_000_000, max: 200_000_000, step: 5_000_000 },
      chips: [40_000_000, 60_000_000, 80_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "existingAnnualPayment",
      label: "기존 대출 연간 원리금 상환액",
      value: s.existingAnnualPayment,
      min: 0,
      max: 100_000_000,
      step: 500_000,
      chips: [0, 3_000_000, 6_000_000, 12_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "마지막 회차 월 상환액", v: `₩${n(Math.round(loan.lastPayment))}` },
    { k: "대출 기간 총 이자액", v: `₩${n(Math.round(loan.totalInterest))}` },
    { k: "총 상환금액 (원금+이자)", v: `₩${n(Math.round(loan.totalPayment))}` },
    { k: "산출 DSR 비율", v: `${dsr.dsrPercent}% (은행권 법정 규제한도: 40%)` },
    { k: "DSR 40% 규제 통과 여부", v: dsr.ok ? "✅ 대출 가능 (한도 내 충족)" : "⚠️ DSR 40% 초과 (대출금 축소 또는 기간 연장 필요)" },
    { k: "DSR 40% 기준 최대 대출 가능액", v: `약 ₩${n(maxLoan)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="대출이자 & DSR 계산기"
          points={["원리금균등·원금균등·만기일시 비교", "월 상환액 및 총 이자 즉시 산출", "DSR 40% 규제 한도 검증", "소득 기반 최대 대출 한도 역산"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="loan-dsr-calculator"
          title="대출이자 및 DSR 한도 계산기"
          summary={{ label: "첫 달 예상 월 상환액", value: `₩${n(Math.round(loan.firstPayment))}` }}
          onReset={() =>
            setS({
              principal: 300_000_000,
              ratePercent: 4.2,
              years: 30,
              type: 0,
              annualIncome: 70_000_000,
              existingAnnualPayment: 5_000_000,
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
                centerLabel="총 상환액"
                items={[
                  { label: "대출 원금", value: s.principal, color: "#0284c7" },
                  { label: "총 대출 이자", value: Math.round(loan.totalInterest), color: "#f59e0b" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="1년차 월별 대출 상환 스케줄"
            head={["회차", "월 상환액", "원금", "이자", "대출 잔액"]}
            rows={loan.rows.slice(0, 12).map((r) => [
              `${r.month}회차`,
              `₩${n(Math.round(r.payment))}`,
              `₩${n(Math.round(r.principal))}`,
              `₩${n(Math.round(r.interest))}`,
              `₩${n(Math.round(r.balance))}`,
            ])}
          />
        </CalculatorShell>

        <KoLoanDsrArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
