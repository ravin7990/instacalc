import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateDeposit, type DepositTaxType, type DepositInterestType } from "@/engines/korea-finance";
import { formatNumber, formatKoreanWonText } from "@/lib/currency";
import { KoDepositArticle } from "@/components/articles/ko/KoDepositArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function DepositCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    principal: 20_000_000,
    periodMonths: 12,
    annualRate: 3.8,
    taxType: 0, // 0: normal(15.4%), 1: preferential(1.4%), 2: nonTaxable(0%)
    interestType: 0, // 0: simple, 1: compoundMonthly
  });

  const taxTypeMap: DepositTaxType[] = ["normal", "preferential", "nonTaxable"];
  const interestTypeMap: DepositInterestType[] = ["simple", "compoundMonthly"];

  const result = useMemo(
    () =>
      calculateDeposit({
        principal: s.principal,
        periodMonths: s.periodMonths,
        annualRate: s.annualRate,
        taxType: taxTypeMap[s.taxType],
        interestType: interestTypeMap[s.interestType],
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "principal",
      label: "예금 예치금액",
      value: s.principal,
      min: 100_000,
      max: 1_000_000_000,
      step: 1_000_000,
      slider: { min: 1_000_000, max: 100_000_000, step: 1_000_000 },
      chips: [10_000_000, 20_000_000, 30_000_000, 50_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "periodMonths",
      label: "예금 예치 기간 (개월)",
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
      label: "기본 약정 연이율 (%)",
      value: s.annualRate,
      min: 0.1,
      max: 15,
      step: 0.1,
      chips: [
        { label: "3.0%", value: 3.0 },
        { label: "3.5%", value: 3.5 },
        { label: "3.8%", value: 3.8 },
        { label: "4.2%", value: 4.2 },
      ],
    },
    {
      key: "taxType",
      label: "과세 유형 선택",
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
      key: "interestType",
      label: "이자 지급 방식",
      value: s.interestType,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "단리", value: 0 },
        { label: "월복리", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "예치 원금", v: `₩${n(result.principal)}` },
    { k: "세전 만기 이자", v: `₩${n(result.preTaxInterest)}` },
    { k: "원천징수 소득세", v: `₩${n(result.incomeTax)}` },
    { k: "원천징수 지방소득세", v: `₩${n(result.localTax)}` },
    { k: "총 납부 세금", v: `₩${n(result.totalTax)}` },
    { k: "세후 실수령 이자", v: `₩${n(result.postTaxInterest)}` },
    { k: "실효 연수익률", v: `${result.effectiveRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 정기예금 계산기"
          points={["단리 및 월복리 정밀 계산", "15.4% 일반과세 vs 1.4% 세금우대 비교", "만기 실수령액 즉시 산출", "예금자보호 5천만원 기준 안내"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="deposit-calculator"
          title="2026년 정기예금 만기 이자 및 실수령액 계산"
          summary={{ label: "만기 총 실수령액", value: `₩${n(result.totalReturn)} (${formatKoreanWonText(result.totalReturn)})` }}
          onReset={() =>
            setS({
              principal: 20_000_000,
              periodMonths: 12,
              annualRate: 3.8,
              taxType: 0,
              interestType: 0,
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
                  { label: "예치 원금", value: result.principal, color: "#0284c7" },
                  { label: "세후 이자", value: result.postTaxInterest, color: "#10b981" },
                  ...(result.totalTax > 0 ? [{ label: "이자 세금", value: result.totalTax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="과세 유형별 만기 세금 및 수령액 비교"
            head={["과세 유형", "세율", "공제 세금", "세후 이자", "만기 수령액"]}
            rows={result.comparisons.map((c) => [
              c.typeLabel,
              c.taxRateLabel,
              `₩${n(c.totalTax)}`,
              `₩${n(c.postTaxInterest)}`,
              `₩${n(c.totalReturn)}`,
            ])}
          />
        </CalculatorShell>

        <KoDepositArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
