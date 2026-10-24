import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateParkingAccount } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoParkingAccountArticle } from "@/components/articles/ko/KoParkingAccountArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function ParkingAccountCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    balance: 10_000_000,
    annualRate: 3.5,
    days: 30,
    compoundDaily: 1, // 0: simple, 1: daily compound
    taxType: 0, // 0: normal(15.4%), 1: nonTaxable(0%)
  });

  const result = useMemo(
    () =>
      calculateParkingAccount({
        balance: s.balance,
        annualRate: s.annualRate,
        days: s.days,
        compoundDaily: s.compoundDaily === 1,
        taxType: s.taxType === 0 ? "normal" : "nonTaxable",
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "balance",
      label: "예치 금액 (원)",
      value: s.balance,
      min: 100_000,
      max: 500_000_000,
      step: 500_000,
      slider: { min: 1_000_000, max: 100_000_000, step: 1_000_000 },
      chips: [3_000_000, 5_000_000, 10_000_000, 30_000_000, 50_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "annualRate",
      label: "파킹통장 / CMA 약정 연이율 (%)",
      value: s.annualRate,
      min: 0.1,
      max: 10,
      step: 0.1,
      chips: [
        { label: "2.5%", value: 2.5 },
        { label: "3.0%", value: 3.0 },
        { label: "3.5%", value: 3.5 },
        { label: "4.0%", value: 4.0 },
      ],
    },
    {
      key: "days",
      label: "예치 보관 일수 (일)",
      value: s.days,
      min: 1,
      max: 365,
      step: 1,
      chips: [
        { label: "7일", value: 7 },
        { label: "15일", value: 15 },
        { label: "30일", value: 30 },
        { label: "90일", value: 90 },
        { label: "180일", value: 180 },
      ],
    },
    {
      key: "compoundDaily",
      label: "이자 정산 방식",
      value: s.compoundDaily,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "매일 일복리 (지금 이자받기)", value: 1 },
        { label: "단리 (월 1회 지급)", value: 0 },
      ],
    },
    {
      key: "taxType",
      label: "과세 여부",
      value: s.taxType,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "일반과세 (15.4%)", value: 0 },
        { label: "비과세 (0%)", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "원금 예치액", v: `₩${n(result.balance)}` },
    { k: "예치 기간", v: `${result.days}일` },
    { k: "세전 총 이자", v: `₩${n(result.preTaxInterest)}` },
    { k: "원천징수 세금(15.4%)", v: `₩${n(result.totalTax)}` },
    { k: "세후 순 이자", v: `₩${n(result.postTaxInterest)}` },
    { k: "하루 평균 실수령 이자", v: `약 ₩${n(result.dailyAveragePostTax)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="파킹통장 & CMA 계산기"
          points={["매일 이자받기 일복리 정밀 시뮬레이션", "단기 비상금 이자 수익 즉시 계산", "15.4% 이자과세 자동 공제", "예치 기간별 수익 비교"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="parking-account-calculator"
          title="파킹통장 및 CMA 일복리 이자 계산기"
          summary={{ label: "최종 만기 원리금 합계", value: `₩${n(result.totalReturn)}` }}
          onReset={() =>
            setS({
              balance: 10_000_000,
              annualRate: 3.5,
              days: 30,
              compoundDaily: 1,
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
                centerLabel="수령 총액"
                items={[
                  { label: "예치 원금", value: result.balance, color: "#0284c7" },
                  { label: "세후 이자", value: result.postTaxInterest, color: "#10b981" },
                  ...(result.totalTax > 0 ? [{ label: "이자소득세", value: result.totalTax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="예치 기간별(경과 일수별) 이자 및 수령액 비교"
            head={["보관 기간", "세전 이자", "세후 실수령 이자", "최종 잔액"]}
            rows={result.tiers.map((t) => [
              t.daysLabel,
              `₩${n(t.preTax)}`,
              `₩${n(t.postTax)}`,
              `₩${n(t.total)}`,
            ])}
          />
        </CalculatorShell>

        <KoParkingAccountArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
