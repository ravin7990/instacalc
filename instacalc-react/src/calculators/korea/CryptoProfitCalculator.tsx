import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCryptoProfit } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoCryptoProfitArticle } from "@/components/articles/ko/KoCryptoProfitArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function CryptoProfitCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    buyPrice: 90_000_000,
    quantity: 0.1,
    sellPrice: 105_000_000,
    exchangeFeeRate: 0.05,
  });

  const result = useMemo(
    () =>
      calculateCryptoProfit({
        buyPrice: s.buyPrice,
        quantity: s.quantity,
        sellPrice: s.sellPrice,
        exchangeFeeRate: s.exchangeFeeRate,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "buyPrice",
      label: "매수 단가 (1개당 원화 가격, KRW)",
      value: s.buyPrice,
      min: 1,
      max: 1_000_000_000,
      step: 10_000,
      slider: { min: 100_000, max: 200_000_000, step: 100_000 },
      chips: [30_000_000, 50_000_000, 80_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "quantity",
      label: "매수 수량 (코인 개수)",
      value: s.quantity,
      min: 0.0001,
      max: 1_000_000,
      step: 0.01,
      slider: { min: 0.01, max: 10, step: 0.01 },
      chips: [0.05, 0.1, 0.5, 1, 2].map((v) => ({ label: `${v}개`, value: v })),
    },
    {
      key: "sellPrice",
      label: "매도 단가 (희망/실제 매도가격, KRW)",
      value: s.sellPrice,
      min: 1,
      max: 1_000_000_000,
      step: 10_000,
      slider: { min: 100_000, max: 200_000_000, step: 100_000 },
      chips: [40_000_000, 70_000_000, 100_000_000, 120_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "exchangeFeeRate",
      label: "거래소 편도 수수료율 (%)",
      value: s.exchangeFeeRate,
      min: 0,
      max: 1,
      step: 0.01,
      chips: [
        { label: "업비트 (0.05%)", value: 0.05 },
        { label: "빗썸 (0.04%)", value: 0.04 },
        { label: "코인원 (0.2%)", value: 0.2 },
        { label: "수수료 무료 (0%)", value: 0 },
      ],
    },
  ];

  const rows = [
    { k: "총 매수 체결금액", v: `₩${n(result.buyTotal)}` },
    { k: "매수 수수료", v: `₩${n(result.buyFee)}` },
    { k: "총 매수 소요원가", v: `₩${n(result.totalBuyCost)}` },
    { k: "총 매도 체결금액", v: `₩${n(result.sellTotal)}` },
    { k: "매도 수수료", v: `₩${n(result.sellFee)}` },
    { k: "총 거래 수수료 합계", v: `₩${n(result.totalFees)}` },
    { k: "손익분기 매도가격", v: `₩${n(result.breakEvenSellPrice)}` },
    { k: "최종 순수익률(ROI)", v: `${result.roiPercent > 0 ? "+" : ""}${result.roiPercent}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="가상자산 수익률 계산기"
          points={["업비트·빗썸 거래 수수료 실시간 반영", "순손익 및 수익률 정밀 산출", "원금 보존 손익분기 매도가격 역산", "목표가별 수익 시뮬레이션 표"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="crypto-profit-calculator"
          title="가상자산(코인) 매매 손익 및 수수료 계산기"
          summary={{
            label: "수수료 차감 후 순손익",
            value: `${result.netProfit >= 0 ? "+" : "-"}₩${n(Math.abs(result.netProfit))}`,
          }}
          onReset={() =>
            setS({
              buyPrice: 90_000_000,
              quantity: 0.1,
              sellPrice: 105_000_000,
              exchangeFeeRate: 0.05,
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
                centerLabel="매도 정산"
                items={[
                  { label: "원금 회수", value: result.totalBuyCost, color: "#0284c7" },
                  ...(result.netProfit > 0
                    ? [{ label: "순수익", value: result.netProfit, color: "#10b981" }]
                    : []),
                  ...(result.totalFees > 0
                    ? [{ label: "거래 수수료", value: result.totalFees, color: "#f59e0b" }]
                    : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="매도 가격대별 순손익 및 수익률 시뮬레이션"
            head={["목표 가격", "변동률", "순손익", "수익률"]}
            rows={result.priceTargets.map((pt) => [
              `₩${n(pt.targetPrice)}`,
              `${pt.pctChange > 0 ? "+" : ""}${pt.pctChange}%`,
              `${pt.netProfit >= 0 ? "+" : "-"}₩${n(Math.abs(pt.netProfit))}`,
              `${pt.roi > 0 ? "+" : ""}${pt.roi}%`,
            ])}
          />
        </CalculatorShell>

        <KoCryptoProfitArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
