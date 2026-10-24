import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateOverseasStockTax } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoOverseasStockTaxArticle } from "@/components/articles/ko/KoOverseasStockTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function OverseasStockTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    realizedGain: 10_000_000,
    realizedLoss: 0,
    expenses: 20_000,
  });

  const result = useMemo(
    () =>
      calculateOverseasStockTax({
        realizedGain: s.realizedGain,
        realizedLoss: s.realizedLoss,
        expenses: s.expenses,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "realizedGain",
      label: "연간 실현 매매차익 (원)",
      value: s.realizedGain,
      min: 0,
      max: 1_000_000_000,
      step: 500_000,
      slider: { min: 0, max: 100_000_000, step: 500_000 },
      chips: [2_500_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "realizedLoss",
      label: "연간 실현 매매차손 (손실, 원)",
      value: s.realizedLoss,
      min: 0,
      max: 500_000_000,
      step: 100_000,
      slider: { min: 0, max: 50_000_000, step: 100_000 },
      chips: [0, 1_000_000, 3_000_000, 5_000_000].map((v) => ({
        label: v === 0 ? "손실 없음" : `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "expenses",
      label: "매매 수수료 및 제비용 (원)",
      value: s.expenses,
      min: 0,
      max: 10_000_000,
      step: 10_000,
      chips: [0, 10_000, 30_000, 50_000, 100_000].map((v) => ({
        label: `${v.toLocaleString("ko-KR")}원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "손익 통산 후 순 양도차익", v: `₩${n(result.netProfit)}` },
    { k: "연간 기본공제 적용액", v: `-₩${n(result.basicDeductionApplied)} (연 250만원 한도)` },
    { k: "과세표준", v: `₩${n(result.taxableBase)}` },
    { k: "양도소득세 (국세 20%)", v: `₩${n(result.capitalGainsTax)}` },
    { k: "지방소득세 (지방세 2%)", v: `₩${n(result.localIncomeTax)}` },
    { k: "총 납부 세금 (22%)", v: `₩${n(result.totalTax)}` },
    { k: "실효세율", v: `${result.effectiveTaxRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="해외주식 양도소득세 계산기"
          points={["연 250만원 기본공제 자동 차감", "손익통산(수익-손실 상계) 계산", "국세 20% + 지방세 2% 총 22% 산출", "수익 구간별 실효세율 비교표"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="overseas-stock-tax-calculator"
          title="미국 및 해외주식 양도소득세 모의 계산기"
          summary={{ label: "세후 최종 실수령 수익", value: `₩${n(result.afterTaxProfit)}` }}
          onReset={() =>
            setS({
              realizedGain: 10_000_000,
              realizedLoss: 0,
              expenses: 20_000,
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
                centerLabel="수익 결산"
                items={[
                  { label: "세후 순수익", value: result.afterTaxProfit, color: "#10b981" },
                  ...(result.totalTax > 0 ? [{ label: "양도세(22%)", value: result.totalTax, color: "#ef4444" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="연간 실현 수익 구간별 세금 및 실효세율 비교"
            head={["실현 수익 구간", "과세표준", "총 납부세금 (22%)", "실효세율"]}
            rows={result.tiers.map((tr) => [
              tr.gainLabel,
              `₩${n(tr.taxable)}`,
              `₩${n(tr.tax)}`,
              `${tr.effective}%`,
            ])}
          />
        </CalculatorShell>

        <KoOverseasStockTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
