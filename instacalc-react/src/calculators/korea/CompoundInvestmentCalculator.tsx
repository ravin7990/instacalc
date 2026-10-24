import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCompoundInvestment } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoCompoundInvestmentArticle } from "@/components/articles/ko/KoCompoundInvestmentArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function CompoundInvestmentCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    initialInvestment: 10_000_000,
    monthlyContribution: 500_000,
    annualReturn: 8.0,
    years: 10,
    taxType: 0, // 0: nonTaxable(0%), 1: normal(15.4%)
  });

  const result = useMemo(
    () =>
      calculateCompoundInvestment({
        initialInvestment: s.initialInvestment,
        monthlyContribution: s.monthlyContribution,
        annualReturn: s.annualReturn,
        years: s.years,
        taxType: s.taxType === 0 ? "nonTaxable" : "normal",
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "initialInvestment",
      label: "초기 투자금 (원)",
      value: s.initialInvestment,
      min: 0,
      max: 500_000_000,
      step: 1_000_000,
      slider: { min: 0, max: 100_000_000, step: 1_000_000 },
      chips: [0, 5_000_000, 10_000_000, 30_000_000, 50_000_000].map((v) => ({
        label: v === 0 ? "0원" : `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "monthlyContribution",
      label: "매월 적립 투자금 (원)",
      value: s.monthlyContribution,
      min: 0,
      max: 10_000_000,
      step: 50_000,
      slider: { min: 100_000, max: 3_000_000, step: 50_000 },
      chips: [300_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "annualReturn",
      label: "예상 연평균 수익률 (%)",
      value: s.annualReturn,
      min: 1,
      max: 30,
      step: 0.5,
      chips: [
        { label: "5.0%", value: 5.0 },
        { label: "7.0% (S&P500)", value: 7.0 },
        { label: "10.0%", value: 10.0 },
        { label: "15.0%", value: 15.0 },
      ],
    },
    {
      key: "years",
      label: "투자 거치 기간 (년)",
      value: s.years,
      min: 1,
      max: 40,
      step: 1,
      chips: [
        { label: "3년", value: 3 },
        { label: "5년", value: 5 },
        { label: "10년", value: 10 },
        { label: "20년", value: 20 },
      ],
    },
    {
      key: "taxType",
      label: "과세 계좌 여부",
      value: s.taxType,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "비과세 계좌 (ISA/국내주식)", value: 0 },
        { label: "일반 과세 (15.4% 배당소득세)", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "총 투자 원금", v: `₩${n(result.totalPrincipal)}` },
    { k: "순 투자 수익금", v: `₩${n(result.totalGains)}` },
    ...(result.tax > 0 ? [{ k: "공제 세금(15.4%)", v: `₩${n(result.tax)}` }] : []),
    { k: "총 누적 수익률(ROI)", v: `+${result.roiPercent}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="적립식 복리 투자 계산기"
          points={["매월 적립식 DCA 장기 복리 시뮬레이션", "연도별 자산 성장 그래프", "ISA 및 연금저축 비과세 효과 비교", "72의 법칙 자산 배증 추정"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="compound-investment-calculator"
          title="적립식 복리 투자 자산 증식 계산기"
          summary={{ label: "만기 최종 평가 자산", value: `₩${n(result.finalBalance)}` }}
          onReset={() =>
            setS({
              initialInvestment: 10_000_000,
              monthlyContribution: 500_000,
              annualReturn: 8.0,
              years: 10,
              taxType: 0,
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
                centerLabel="최종 자산 구성"
                items={[
                  { label: "투자 원금", value: result.totalPrincipal, color: "#0284c7" },
                  { label: "복리 순수익", value: result.totalGains, color: "#10b981" },
                  ...(result.tax > 0 ? [{ label: "세금", value: result.tax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="연도별 누적 투자원금 및 복리 자산 성장 추이"
            head={["경과 연차", "누적 원금", "누적 수익금", "총 평가 자산"]}
            rows={result.annualHistory.map((ah) => [
              `${ah.year}년차`,
              `₩${n(ah.cumulativePrincipal)}`,
              `₩${n(ah.interestGained)}`,
              `₩${n(ah.totalBalance)}`,
            ])}
          />
        </CalculatorShell>

        <KoCompoundInvestmentArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
