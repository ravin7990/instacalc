import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateDividendTax } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoDividendTaxArticle } from "@/components/articles/ko/KoDividendTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function DividendTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    shares: 100,
    dividendPerShareUSD: 2.5,
    frequency: 4 as 1 | 4 | 12,
    usdKrwRate: 1_350,
  });

  const result = useMemo(
    () =>
      calculateDividendTax({
        shares: s.shares,
        dividendPerShareUSD: s.dividendPerShareUSD,
        frequency: s.frequency,
        usdKrwRate: s.usdKrwRate,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "shares",
      label: "보유 주식 수 (주)",
      value: s.shares,
      min: 1,
      max: 1_000_000,
      step: 10,
      slider: { min: 10, max: 2_000, step: 10 },
      chips: [50, 100, 200, 500, 1_000].map((v) => ({ label: `${v}주`, value: v })),
    },
    {
      key: "dividendPerShareUSD",
      label: "1회당 주당 배당금 ($ USD)",
      value: s.dividendPerShareUSD,
      min: 0.01,
      max: 100,
      step: 0.1,
      slider: { min: 0.1, max: 10, step: 0.1 },
      chips: [0.5, 1.0, 2.0, 3.0, 5.0].map((v) => ({ label: `$${v}`, value: v })),
    },
    {
      key: "frequency",
      label: "배당 지급 주기",
      value: s.frequency,
      min: 1,
      max: 12,
      step: 1,
      chips: [
        { label: "분기배당 (연 4회, 미국 표준)", value: 4 },
        { label: "월배당 (연 12회, 리얼티인컴 등)", value: 12 },
        { label: "연배당 (연 1회)", value: 1 },
      ],
    },
    {
      key: "usdKrwRate",
      label: "적용 환율 (원/달러, KRW)",
      value: s.usdKrwRate,
      min: 1_000,
      max: 2_000,
      step: 10,
      slider: { min: 1_200, max: 1_500, step: 10 },
      chips: [1_300, 1_350, 1_400, 1_450].map((v) => ({ label: `${v}원`, value: v })),
    },
  ];

  const rows = [
    { k: "회당 세전 배당금 (USD)", v: `$${result.preTaxUsd}` },
    { k: "미국 원천징수세 (15% USD)", v: `$${result.taxUsd}` },
    { k: "회당 세후 실수령액 (USD)", v: `$${result.postTaxUsd}` },
    { k: "회당 원화 환산 세전 배당금", v: `₩${n(result.preTaxKrw)}` },
    { k: "회당 원천징수 배당소득세", v: `₩${n(result.taxKrw)}` },
    { k: "연간 총 세전 배당금액", v: `₩${n(result.annualPreTaxKrw)}` },
    {
      k: "금융소득종합과세(2,000만원) 여부",
      v: result.isFinancialIncomeTaxRisk
        ? "⚠️ 2,000만원 초과 (종합과세 신고 주의)"
        : "✅ 2,000만원 한도 내 (분리과세 종결)",
    },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="미국 배당금 실수령액 계산기"
          points={["미국 현지 15% 원천징수세 자동 계산", "달러(USD) 및 원화(KRW) 환산 동시 제공", "연간 2,000만원 종합과세 기준 검증", "환율 변동 시나리오별 수령액 비교"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="dividend-tax-calculator"
          title="미국 배당금 실수령액 및 원천징수 세금 계산기"
          summary={{ label: "연간 총 원화 실수령액", value: `₩${n(result.annualPostTaxKrw)}` }}
          onReset={() =>
            setS({
              shares: 100,
              dividendPerShareUSD: 2.5,
              frequency: 4,
              usdKrwRate: 1_350,
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
                centerLabel="배당 수령 비중"
                items={[
                  { label: "실수령 배당금", value: result.postTaxKrw, color: "#10b981" },
                  { label: "미국 원천징수세", value: result.taxKrw, color: "#f59e0b" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="환율 시나리오별 배당금 및 연간 실수령액 비교"
            head={["적용 환율", "회당 세전 배당금", "회당 세후 배당금", "연간 총 실수령액"]}
            rows={result.rateScenarios.map((sc) => [
              `${sc.rate}원/$`,
              `₩${n(sc.preTaxKrw)}`,
              `₩${n(sc.postTaxKrw)}`,
              `₩${n(sc.annualPostTaxKrw)}`,
            ])}
          />
        </CalculatorShell>

        <KoDividendTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
