import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculatePolicyHousingLoan } from "@/engines/korea-extended";
import { formatNumber, formatKoreanWonText } from "@/lib/currency";
import { KoPolicyHousingLoanArticle } from "@/components/articles/ko/KoPolicyHousingLoanArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function PolicyHousingLoanCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    loanType: "didimdol" as "didimdol" | "beotimmok",
    householdType: "newlywed" as "general" | "newlywed" | "youth",
    annualIncome: 65_000_000,
    housePriceOrDeposit: 450_000_000,
    requestedLoanAmount: 250_000_000,
    loanTermYears: 30,
  });

  const result = useMemo(
    () =>
      calculatePolicyHousingLoan({
        loanType: s.loanType,
        householdType: s.householdType,
        annualIncome: s.annualIncome,
        housePriceOrDeposit: s.housePriceOrDeposit,
        requestedLoanAmount: s.requestedLoanAmount,
        loanTermYears: s.loanTermYears,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "loanType",
      label: "정책금융 대출 상품 선택",
      value: s.loanType === "didimdol" ? 0 : 1,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "디딤돌 대출 (내집마련 주택구입자금)", value: 0 },
        { label: "버팀목 대출 (전세보증금 대출)", value: 1 },
      ],
    },
    {
      key: "householdType",
      label: "가구 유형 (우대 대상 구분)",
      value: s.householdType === "general" ? 0 : s.householdType === "newlywed" ? 1 : 2,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "일반 무주택가구", value: 0 },
        { label: "신혼부부 (혼인 7년 이내)", value: 1 },
        { label: "청년 단독 세대주", value: 2 },
      ],
    },
    {
      key: "annualIncome",
      label: "부부합산 연소득 (세전 총소득)",
      value: s.annualIncome,
      min: 10_000_000,
      max: 120_000_000,
      step: 1_000_000,
      slider: { min: 20_000_000, max: 90_000_000, step: 1_000_000 },
      chips: [35_000_000, 50_000_000, 65_000_000, 85_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "housePriceOrDeposit",
      label: s.loanType === "didimdol" ? "주택 매매가격 (담보평가액)" : "임차 전세보증금",
      value: s.housePriceOrDeposit,
      min: 50_000_000,
      max: 1_000_000_000,
      step: 10_000_000,
      slider: { min: 100_000_000, max: 600_000_000, step: 10_000_000 },
      chips: [200_000_000, 300_000_000, 400_000_000, 500_000_000, 600_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "requestedLoanAmount",
      label: "희망 대출 신청 금액",
      value: s.requestedLoanAmount,
      min: 10_000_000,
      max: 500_000_000,
      step: 10_000_000,
      slider: { min: 50_000_000, max: 400_000_000, step: 10_000_000 },
      chips: [100_000_000, 150_000_000, 200_000_000, 250_000_000, 300_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "loanTermYears",
      label: "대출 상환 만기 (년)",
      value: s.loanTermYears,
      min: 10,
      max: 30,
      step: 5,
      chips: [10, 15, 20, 30].map((y) => ({ label: `${y}년`, value: y })),
    },
  ];

  const handleFieldChange = (key: string) => (val: number) => {
    if (key === "loanType") {
      set("loanType")(val === 0 ? "didimdol" : "beotimmok");
    } else if (key === "householdType") {
      const types = ["general", "newlywed", "youth"] as const;
      set("householdType")(types[val] ?? "general");
    } else {
      set(key as keyof typeof s)(val);
    }
  };

  const rows = [
    { k: "신청 자격 적격 여부", v: result.isEligible ? "✅ 신청 가능 (소득 및 자산 요건 충족)" : `❌ ${result.ineligibilityReason}` },
    { k: "정책상 최대 승인 한도", v: `₩${n(result.maxEligibleLimit)} (${formatKoreanWonText(result.maxEligibleLimit)})` },
    { k: "최종 승인 가능 대출액", v: `₩${n(result.approvedLoanAmount)} (${formatKoreanWonText(result.approvedLoanAmount)})` },
    { k: "적용 정책 우대금리", v: `연 ${result.appliedInterestRate}%` },
    { k: "월 원리금 균등 상환액", v: `₩${n(result.monthlyPayment)} / 월` },
    { k: "시중은행(연 4.5%) 이용 시 월 상환액", v: `₩${n(result.commercialBankMonthlyPayment)} / 월` },
    { k: "매월 아끼는 이자 절감 혜택", v: `매달 ₩${n(result.monthlyInterestSavings)} 절감 (${formatKoreanWonText(result.monthlyInterestSavings * 12)} / 연)` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="주택도시기금 정책금융"
          points={[
            "디딤돌(구입) 및 버팀목(전세) 가구별 소득 요건 자동 진단",
            "신혼부부(최대 4억)·청년 특례 한도 및 우대금리 산출",
            "시중은행(4.5%) 대비 월 이자 절감액 실시간 비교",
            "LTV 70~80% 및 담보평가액 상한선 자동 체크",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="policy-housing-loan-calculator"
          title="디딤돌·버팀목 정책금융 대출이자 및 한도 계산"
          summary={{
            label: "월 원리금 상환액",
            value: `₩${n(result.monthlyPayment)}`,
          }}
          onReset={() =>
            setS({
              loanType: "didimdol",
              householdType: "newlywed",
              annualIncome: 65_000_000,
              housePriceOrDeposit: 450_000_000,
              requestedLoanAmount: 250_000_000,
              loanTermYears: 30,
            })
          }
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={handleFieldChange(f.key)} />)}
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
                centerLabel="월 상환액"
                items={[
                  { label: "정책대출 상환액", value: result.monthlyPayment, color: "#10b981" },
                  { label: "시중은행 대비 절감액", value: result.monthlyInterestSavings, color: "#0284c7" },
                ]}
              />
            </>
          }
        />

        <KoPolicyHousingLoanArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
