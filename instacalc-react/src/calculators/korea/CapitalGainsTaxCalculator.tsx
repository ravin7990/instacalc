import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCapitalGainsTax } from "@/engines/korea-extended";
import { formatNumber, formatKoreanWonText } from "@/lib/currency";
import { KoCapitalGainsTaxArticle } from "@/components/articles/ko/KoCapitalGainsTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function CapitalGainsTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    salePrice: 1_200_000_000,
    purchasePrice: 700_000_000,
    expenses: 20_000_000,
    holdingYears: 5,
    residencyYears: 3,
    isOneHomeowner: 1, // 1: yes, 0: no
    isRegulatedArea: 0,
    multiHomeCount: 1,
  });

  const result = useMemo(
    () =>
      calculateCapitalGainsTax({
        salePrice: s.salePrice,
        purchasePrice: s.purchasePrice,
        expenses: s.expenses,
        holdingYears: s.holdingYears,
        residencyYears: s.residencyYears,
        isOneHomeowner: s.isOneHomeowner === 1,
        isRegulatedArea: s.isRegulatedArea === 1,
        multiHomeCount: s.multiHomeCount,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "salePrice",
      label: "양도가액 (실제 매매 대금)",
      value: s.salePrice,
      min: 10_000_000,
      max: 10_000_000_000,
      step: 10_000_000,
      slider: { min: 100_000_000, max: 3_000_000_000, step: 10_000_000 },
      chips: [600_000_000, 900_000_000, 1_200_000_000, 1_500_000_000, 2_000_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "purchasePrice",
      label: "취득가액 (과거 매수 가격)",
      value: s.purchasePrice,
      min: 10_000_000,
      max: 10_000_000_000,
      step: 10_000_000,
      slider: { min: 50_000_000, max: 2_500_000_000, step: 10_000_000 },
      chips: [300_000_000, 500_000_000, 700_000_000, 1_000_000_000, 1_500_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "expenses",
      label: "필요경비 (중개보수·인테리어 샤시·취득세 등)",
      value: s.expenses,
      min: 0,
      max: 500_000_000,
      step: 1_000_000,
      chips: [5_000_000, 10_000_000, 20_000_000, 30_000_000, 50_000_000].map((v) => ({
        label: `${v / 1_000_000}백만원`,
        value: v,
      })),
    },
    {
      key: "holdingYears",
      label: "주택 보유기간 (년)",
      value: s.holdingYears,
      min: 0,
      max: 30,
      step: 1,
      chips: [1, 2, 3, 5, 10, 15].map((y) => ({ label: `${y}년`, value: y })),
    },
    {
      key: "residencyYears",
      label: "실제 거주기간 (년)",
      value: s.residencyYears,
      min: 0,
      max: 30,
      step: 1,
      chips: [0, 2, 3, 5, 10].map((y) => ({ label: `${y}년`, value: y })),
    },
    {
      key: "isOneHomeowner",
      label: "1세대 1주택 비과세 대상 여부",
      value: s.isOneHomeowner,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "1세대 1주택 (12억 비과세 대상)", value: 1 },
        { label: "다주택자 / 일반", value: 0 },
      ],
    },
  ];

  const rows = [
    { k: "총 양도차익 (매매익)", v: `₩${n(result.capitalGain)} (${formatKoreanWonText(result.capitalGain)})` },
    { k: "과세대상 양도차익 (12억 초과분 안분)", v: `₩${n(result.taxableGain)}` },
    { k: "장기보유특별공제율", v: `${result.specialDeductionRate}% (-₩${n(result.specialDeductionAmount)})` },
    { k: "기본공제액", v: `-₩${n(result.basicDeduction)} (연 250만 원)` },
    { k: "과세표준", v: `₩${n(result.taxBase)}` },
    { k: "적용 한계세율", v: `${result.baseTaxRate}%` },
    { k: "양도소득세 본세", v: `₩${n(result.calculatedTax)}` },
    { k: "지방소득세 (10%)", v: `₩${n(result.localIncomeTax)}` },
    { k: "총 실효세율", v: `${result.effectiveRate}%` },
    { k: "세후 실수령 순이익", v: `₩${n(result.netProfit)} (${formatKoreanWonText(result.netProfit)})` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="부동산 세금 시뮬레이터"
          points={[
            "1세대 1주택 12억 원 비과세 자동 판정",
            "보유·거주기간별 장기보유특별공제(최대 80%) 반영",
            "지방소득세 10% 자동 합산",
            "세후 실수령 순이익 실시간 계산",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="capital-gains-tax-calculator"
          title="부동산 양도소득세 모의계산"
          summary={{
            label: result.isNonTaxable ? "1세대 1주택 전액 비과세" : "예상 총 납부세액 (지방세 포함)",
            value: result.isNonTaxable ? "0원 (비과세)" : `₩${n(result.totalTax)}`,
          }}
          onReset={() =>
            setS({
              salePrice: 1_200_000_000,
              purchasePrice: 700_000_000,
              expenses: 20_000_000,
              holdingYears: 5,
              residencyYears: 3,
              isOneHomeowner: 1,
              isRegulatedArea: 0,
              multiHomeCount: 1,
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
                centerLabel="수익 배분"
                items={[
                  { label: "세후 순이익", value: result.netProfit, color: "#10b981" },
                  { label: "양도소득세", value: result.calculatedTax, color: "#ef4444" },
                  { label: "지방소득세", value: result.localIncomeTax, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoCapitalGainsTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
