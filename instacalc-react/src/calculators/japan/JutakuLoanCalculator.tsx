import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateJutakuLoan, type HouseType } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaJutakuLoanArticle } from "@/components/articles/ja/JaJutakuLoanArticle";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";

/** 住宅ローン控除（住宅借入金等特別控除）シミュレーター */
export default function JutakuLoanCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    balance: 35_000_000,
    house: 0, // 0: certified (長期優良住宅等), 1: general (一般住宅)
    income: 6_000_000,
  });

  const houseType: HouseType = s.house === 0 ? "certified" : "general";

  const result = useMemo(
    () =>
      calculateJutakuLoan({
        balance: s.balance,
        houseType,
        income: s.income,
      }),
    [s, houseType],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "balance",
      label: "年末時点の住宅ローン残高（円）",
      value: s.balance,
      min: 1_000_000,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 5_000_000, max: 60_000_000, step: 1_000_000 },
      chips: [20_000_000, 30_000_000, 35_000_000, 45_000_000, 50_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "house",
      label: "住宅の種類・省エネ性能区分",
      value: s.house,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "認定長期優良・低炭素・ZEH水準（上限4,500万円・13年）", value: 0 },
        { label: "一般省エネ基準住宅（上限3,000万円・10年）", value: 1 },
      ],
    },
    {
      key: "income",
      label: "年収（総支給額・額面）",
      value: s.income,
      min: 2_000_000,
      max: 30_000_000,
      step: 100_000,
      slider: { min: 3_000_000, max: 15_000_000, step: 500_000 },
      chips: [4_000_000, 5_000_000, 6_000_000, 8_000_000, 10_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: `${result.years}年間の総減税額（累計控除額）`, v: `¥${n(result.totalDeduction)}` },
    { k: "控除対象限度残高", v: `¥${n(result.cap)}（控除率 0.7%）` },
    { k: "実際に控除対象となる残高", v: `¥${n(result.eligibleBalance)}` },
    { k: "所得税からの年間控除目安", v: `¥${n(result.incomeTaxCredit)}` },
    { k: "住民税からの年間控除目安（上限9.75万円）", v: `¥${n(result.residentTaxCredit)}` },
  ];

  const timelineData = useMemo(() => {
    const labels: string[] = [];
    const cumArr: number[] = [];
    for (let y = 1; y <= result.years; y++) {
      labels.push(`${y}年目`);
      cumArr.push(Math.round(result.annualDeduction * y));
    }
    return {
      labels,
      datasets: [
        { label: "累計減税額（控除総額）", data: cumArr, color: "#10b981", fill: true },
      ],
    };
  }, [result.years, result.annualDeduction]);

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="住宅ローン控除"
          points={["年間最大控除額", "13年間累計減税", "所得税還付", "住民税控除"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="jutaku-loan-calculator"
          title="住宅ローン控除 減税シミュレーション"
          summary={{ label: "初年度の年間控除額", value: `¥${n(result.annualDeduction)}` }}
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
                centerLabel="初年度控除"
                items={[
                  { label: "所得税からの還付", value: result.incomeTaxCredit, color: "#0284c7" },
                  { label: "住民税からの減額", value: result.residentTaxCredit, color: "#10b981" },
                ]}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title="住宅ローン控除 累計減税シミュレーション"
            subtitle={`${result.years}年間の所得税還付・住民税減額の累計推移`}
            labels={timelineData.labels}
            datasets={timelineData.datasets}
            locale={seo.locale}
          />
        </CalculatorShell>

        <JaJutakuLoanArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
