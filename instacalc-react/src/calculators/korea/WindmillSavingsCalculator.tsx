import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateWindmillSavings, type SavingsTaxType } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoWindmillSavingsArticle } from "@/components/articles/ko/KoWindmillSavingsArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function WindmillSavingsCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    unitMonthlyDeposit: 100_000,
    annualRate: 4.0,
    taxType: 0, // 0: normal(15.4%), 1: preferential(1.4%), 2: nonTaxable(0%)
  });

  const taxTypeMap: SavingsTaxType[] = ["normal", "preferential", "nonTaxable"];

  const result = useMemo(
    () =>
      calculateWindmillSavings({
        unitMonthlyDeposit: s.unitMonthlyDeposit,
        annualRate: s.annualRate,
        taxType: taxTypeMap[s.taxType],
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "unitMonthlyDeposit",
      label: "매월 신규 개설할 1계좌당 월 납입액",
      value: s.unitMonthlyDeposit,
      min: 10_000,
      max: 2_000_000,
      step: 10_000,
      slider: { min: 10_000, max: 500_000, step: 10_000 },
      chips: [50_000, 100_000, 200_000, 300_000, 500_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "annualRate",
      label: "적금 약정 연이율 (%)",
      value: s.annualRate,
      min: 0.1,
      max: 12,
      step: 0.1,
      chips: [
        { label: "3.5%", value: 3.5 },
        { label: "4.0%", value: 4.0 },
        { label: "4.5%", value: 4.5 },
        { label: "5.0%", value: 5.0 },
      ],
    },
    {
      key: "taxType",
      label: "이자 과세 구분",
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
  ];

  const rows = [
    { k: "1개 계좌 월 납입액", v: `₩${n(result.unitMonthlyDeposit)}` },
    { k: "12개월차 최고 월 납입액", v: `₩${n(result.maxMonthlyDeposit)}` },
    { k: "1년간 총 납입 저축원금", v: `₩${n(result.totalFirstYearPrincipal)}` },
    { k: "12개 계좌 총 세후이자 수익", v: `₩${n(result.totalFirstYearInterest)}` },
    { k: "2년차 연간 총 환급액", v: `₩${n(result.annualMaturityTotal)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="적금 풍차돌리기 계산기"
          points={["12개월 적금 연속 개설 시뮬레이션", "월별 필요 저축액 및 유동성 확인", "2년차 매월 만기 실수령액 산출", "강제 저축 목돈 형성 플랜"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="windmill-savings-calculator"
          title="적금 풍차돌리기 월별 지출 및 만기 수령액 시뮬레이터"
          summary={{ label: "2년차 매월 만기 실수령액", value: `₩${n(result.monthlyMaturityPayout)}` }}
          onReset={() =>
            setS({
              unitMonthlyDeposit: 100_000,
              annualRate: 4.0,
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
                centerLabel="1년차 저축 결산"
                items={[
                  { label: "1년 총 저축원금", value: result.totalFirstYearPrincipal, color: "#0284c7" },
                  { label: "총 세후이자", value: result.totalFirstYearInterest, color: "#10b981" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="풍차돌리기 월차별 납입액 및 2년차 만기 수령 타임라인"
            head={["월차", "운용 계좌수", "해당월 불입액", "누적 납입원금", "해당월 만기 수령액"]}
            rows={result.timeline.slice(0, 15).map((tl) => [
              `${tl.month}개월차`,
              `${tl.activeAccounts}개`,
              `₩${n(tl.monthlyDeposit)}`,
              `₩${n(tl.cumulativePrincipal)}`,
              tl.monthlyMaturity > 0 ? `₩${n(tl.monthlyMaturity)}` : "-",
            ])}
          />
        </CalculatorShell>

        <KoWindmillSavingsArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
