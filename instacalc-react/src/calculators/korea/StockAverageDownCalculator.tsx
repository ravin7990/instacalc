import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateAverageDown } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoStockAverageDownArticle } from "@/components/articles/ko/KoStockAverageDownArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function StockAverageDownCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    currentPrice: 70_000,
    currentQuantity: 100,
    additionalPrice: 50_000,
    additionalQuantity: 50,
    targetAveragePrice: 60_000,
  });

  const result = useMemo(
    () =>
      calculateAverageDown({
        currentPrice: s.currentPrice,
        currentQuantity: s.currentQuantity,
        additionalPrice: s.additionalPrice,
        additionalQuantity: s.additionalQuantity,
        targetAveragePrice: s.targetAveragePrice > 0 ? s.targetAveragePrice : undefined,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "currentPrice",
      label: "1차 매수 평단가 (보유 평단가, 원)",
      value: s.currentPrice,
      min: 100,
      max: 10_000_000,
      step: 500,
      slider: { min: 1_000, max: 200_000, step: 1_000 },
      chips: [30_000, 50_000, 70_000, 100_000].map((v) => ({ label: `${v / 10_000}만원`, value: v })),
    },
    {
      key: "currentQuantity",
      label: "현재 보유 주수 (주)",
      value: s.currentQuantity,
      min: 1,
      max: 1_000_000,
      step: 10,
      slider: { min: 10, max: 1_000, step: 10 },
      chips: [10, 50, 100, 200, 500].map((v) => ({ label: `${v}주`, value: v })),
    },
    {
      key: "additionalPrice",
      label: "추가 매수 단가 (현재가/희망 매수가, 원)",
      value: s.additionalPrice,
      min: 100,
      max: 10_000_000,
      step: 500,
      slider: { min: 1_000, max: 200_000, step: 1_000 },
      chips: [20_000, 40_000, 50_000, 80_000].map((v) => ({ label: `${v / 10_000}만원`, value: v })),
    },
    {
      key: "additionalQuantity",
      label: "추가 매수 수량 (주)",
      value: s.additionalQuantity,
      min: 1,
      max: 1_000_000,
      step: 10,
      slider: { min: 10, max: 1_000, step: 10 },
      chips: [20, 50, 100, 200].map((v) => ({ label: `${v}주`, value: v })),
    },
    {
      key: "targetAveragePrice",
      label: "목표 희망 평단가 (선택 입력, 원)",
      value: s.targetAveragePrice,
      min: 0,
      max: 10_000_000,
      step: 500,
      slider: { min: 1_000, max: 200_000, step: 1_000 },
      chips: [45_000, 55_000, 60_000, 65_000].map((v) => ({ label: `${v / 10_000}만원`, value: v })),
    },
  ];

  const rows = [
    { k: "기존 총 매수 투자금", v: `₩${n(result.currentInvestment)}` },
    { k: "추가 매수 소요 자금", v: `₩${n(result.additionalInvestment)}` },
    { k: "물타기 후 총 보유주수", v: `${result.totalQuantity}주` },
    { k: "총 누적 투자금액", v: `₩${n(result.totalInvestment)}` },
    { k: "평단가 인하 효과", v: `-₩${n(result.priceReduction)} (${result.priceReductionPercent}% 절감)` },
    ...(result.targetRequiredQuantity
      ? [
          { k: "목표 평단가 달성 필요 주수", v: `${result.targetRequiredQuantity}주` },
          { k: "목표 달성 필요 추가 자금", v: `₩${n(result.targetRequiredInvestment ?? 0)}` },
        ]
      : []),
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="주식 물타기 계산기"
          points={["추가 매수 후 예상 평단가 즉시 산출", "평단가 인하폭 및 절감률 확인", "희망 목표 평단가 도달 필요 주수 역산", "매수 수량별 시뮬레이션 표 제공"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="stock-average-down-calculator"
          title="주식 물타기 평단가 및 추가 매수 시뮬레이터"
          summary={{ label: "물타기 후 최종 평단가", value: `₩${n(result.finalAveragePrice)}` }}
          onReset={() =>
            setS({
              currentPrice: 70_000,
              currentQuantity: 100,
              additionalPrice: 50_000,
              additionalQuantity: 50,
              targetAveragePrice: 60_000,
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
                centerLabel="총 투자금 구성"
                items={[
                  { label: "기존 투자금", value: result.currentInvestment, color: "#0284c7" },
                  { label: "추가 매수금", value: result.additionalInvestment, color: "#f59e0b" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="추가 매수 수량별 평단가 인하 효과 시뮬레이션"
            head={["추가 매수량", "총 주수", "추가 소요 자금", "예상 평단가", "평단가 인하율"]}
            rows={result.simulations.map((sim) => [
              `+${sim.addQty}주`,
              `${sim.totalQty}주`,
              `₩${n(sim.addCost)}`,
              `₩${n(sim.newAverage)}`,
              `-${sim.discountPercent}%`,
            ])}
          />
        </CalculatorShell>

        <KoStockAverageDownArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
