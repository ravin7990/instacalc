import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateHealthInsuranceDependent } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoHealthInsuranceDependentArticle } from "@/components/articles/ko/KoHealthInsuranceDependentArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function HealthInsuranceDependentCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    financialIncome: 15_000_000,
    otherIncome: 0,
    propertyTaxBase: 300_000_000,
    hasBusinessRegistration: 0,
    businessIncomeAmount: 0,
  });

  const result = useMemo(
    () =>
      calculateHealthInsuranceDependent({
        financialIncome: s.financialIncome,
        otherIncome: s.otherIncome,
        propertyTaxBase: s.propertyTaxBase,
        hasBusinessRegistration: s.hasBusinessRegistration === 1,
        businessIncomeAmount: s.businessIncomeAmount,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "financialIncome",
      label: "연간 금융소득 (이자 및 배당금 총액)",
      value: s.financialIncome,
      min: 0,
      max: 100_000_000,
      step: 1_000_000,
      slider: { min: 0, max: 40_000_000, step: 1_000_000 },
      chips: [0, 5_000_000, 10_000_000, 15_000_000, 20_000_000, 25_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "otherIncome",
      label: "기타 연간 소득 (국민연금·공적연금·근로소득)",
      value: s.otherIncome,
      min: 0,
      max: 100_000_000,
      step: 1_000_000,
      chips: [0, 5_000_000, 10_000_000, 15_000_000, 20_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "propertyTaxBase",
      label: "보유 부동산 재산세 과세표준 (주택·토지·건물 합계)",
      value: s.propertyTaxBase,
      min: 0,
      max: 3_000_000_000,
      step: 10_000_000,
      slider: { min: 0, max: 1_500_000_000, step: 10_000_000 },
      chips: [0, 200_000_000, 400_000_000, 540_000_000, 900_000_000, 1_200_000_000].map((v) => ({
        label: v === 0 ? "없음" : `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "hasBusinessRegistration",
      label: "사업자등록증 보유 여부",
      value: s.hasBusinessRegistration,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "미보유 (일반/프리랜서)", value: 0 },
        { label: "보유 (개인사업자)", value: 1 },
      ],
    },
    {
      key: "businessIncomeAmount",
      label: "연간 사업소득금액 (총수입 - 필요경비)",
      value: s.businessIncomeAmount,
      min: 0,
      max: 50_000_000,
      step: 500_000,
      chips: [0, 1_000_000, 3_000_000, 5_000_000, 10_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "총 연간 합산소득", v: `₩${n(result.totalAnnualIncome)} (기준선 2,000만 원)` },
    { k: "재산세 과세표준", v: `₩${n(s.propertyTaxBase)} (기준선 5.4억 / 9억 원)` },
    { k: "피부양자 자격 판정 결과", v: result.isEligible ? "✅ 유지 가능 (적격)" : "❌ 탈락 (지역가입자 전환)" },
    { k: "판정 사유 및 세부 분석", v: result.disqualificationReason },
    {
      k: "탈락 시 예상 월 지역보험료",
      v: result.isEligible ? "0원 (피부양자 무료)" : `약 ₩${n(result.estimatedRegionalMonthlyPremium)} / 월 (장기요양 포함)`,
    },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="은퇴·건보 자격 진단기"
          points={[
            "연간 소득 2,000만 원 및 재산세 과표 5.4억·9억 탈락선 검증",
            "사업자등록 유무 및 프리랜서 소득 500만 원 기준 반영",
            "피부양자 자격 유지/박탈 여부 실시간 자동 진단",
            "탈락 시 부과되는 예상 월 지역건보료 사전 모의계산",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="health-insurance-dependent-calculator"
          title="건강보험 피부양자 자격 판정 및 지역보험료 계산"
          summary={{
            label: result.isEligible ? "피부양자 자격 유지 적격" : "피부양자 탈락 위험 (지역가입자 전환)",
            value: result.isEligible ? "유지 가능 (보험료 0원)" : `예상 건보료 월 ₩${n(result.estimatedRegionalMonthlyPremium)}`,
          }}
          onReset={() =>
            setS({
              financialIncome: 15_000_000,
              otherIncome: 0,
              propertyTaxBase: 300_000_000,
              hasBusinessRegistration: 0,
              businessIncomeAmount: 0,
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
                centerLabel={result.isEligible ? "적격" : "탈락"}
                items={[
                  { label: "금융소득", value: s.financialIncome, color: "#0284c7" },
                  { label: "기타소득", value: s.otherIncome + s.businessIncomeAmount, color: "#10b981" },
                ]}
              />
            </>
          }
        />

        <KoHealthInsuranceDependentArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
