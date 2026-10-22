import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateKoigyoKyosai, type KyosaiPayoutReason } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaKoigyoKyosaiArticle } from "@/components/articles/ja/JaKoigyoKyosaiArticle";

const REASONS: Array<{ key: KyosaiPayoutReason; label: string }> = [
  { key: "kyosai_a", label: "共済金A: 事業廃業・法人解散（退職所得控除・最高利率）" },
  { key: "kyosai_b", label: "共済金B: 役員定年退任・65歳以上の老齢給付" },
  { key: "cancellation", label: "任意解約: 解約手当金（一時所得課税・元本割れ注意）" },
];

/** 小規模企業共済 節税・共済金シミュレーター */
export default function KoigyoKyosaiCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    monthly: 70_000,
    years: 20,
    income: 5_000_000,
    reasonIdx: 0,
  });

  const payoutReason = REASONS[s.reasonIdx]?.key ?? "kyosai_a";

  const result = useMemo(
    () =>
      calculateKoigyoKyosai({
        monthlyAmount: s.monthly,
        durationYears: s.years,
        taxableIncome: s.income,
        payoutReason,
      }),
    [s, payoutReason],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "monthly",
      label: "毎月の掛金額（月1,000円〜7万円）",
      value: s.monthly,
      min: 1_000,
      max: 70_000,
      step: 1_000,
      slider: { min: 1_000, max: 70_000, step: 1_000 },
      chips: [10_000, 30_000, 50_000, 70_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "years",
      label: "加入年数（積立期間）",
      value: s.years,
      min: 1,
      max: 40,
      step: 1,
      slider: { min: 1, max: 40, step: 1 },
      chips: [5, 10, 15, 20, 25, 30].map((v) => ({ label: `${v}年`, value: v })),
    },
    {
      key: "income",
      label: "年間課税所得（売上－経費－各種控除）",
      value: s.income,
      min: 1_000_000,
      max: 30_000_000,
      step: 500_000,
      slider: { min: 1_000_000, max: 20_000_000, step: 500_000 },
      chips: [3_000_000, 5_000_000, 8_000_000, 10_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "reasonIdx",
      label: "将来の受取事由（共済金の区分）",
      value: s.reasonIdx,
      min: 0,
      max: REASONS.length - 1,
      step: 1,
      chips: REASONS.map((r, i) => ({ label: r.label.split(":")[0], value: i })),
    },
  ];

  const rows = [
    { k: "加入期間中の掛金累計（自己資金）", v: `¥${n(result.totalContributed)}` },
    { k: "毎年の掛金全額所得控除による節税額", v: `約 ¥${n(result.annualTaxSaved)} / 年` },
    { k: "加入期間中の掛金節税 累計総額", v: `+¥${n(result.totalTaxSaved)}` },
    { k: "実質的な掛金負担割合（節税考慮後）", v: `約 ${result.effectiveCostRatio}%` },
    { k: "受取共済金＋節税累計の総合メリット", v: `+¥${n(result.netBenefit)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="小規模企業共済"
          points={["満期受取共済金", "掛金全額所得控除", "節税累計総額", "実質掛金負担率"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="koigyo-kyosai-calculator"
          title="小規模企業共済 節税・退職金シミュレーション"
          summary={{ label: "満期受取共済金の目安", value: `¥${n(result.payoutAmount)}` }}
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
          results={
            <ul className="kv-list">
              {rows.map((r) => (
                <li key={r.k}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        />

        <JaKoigyoKyosaiArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
