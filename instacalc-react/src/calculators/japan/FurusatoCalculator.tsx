import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateFurusato, type FurusatoFamily } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaFurusatoArticle } from "@/components/articles/ja/JaFurusatoArticle";

/** ふるさと納税 控除上限額・実質負担2,000円シミュレーター */
export default function FurusatoCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    income: 6_000_000,
    family: 1, // 0: single, 1: couple (片働き), 2: coupleboth (共働き)
    dependents: 0,
    donation: 60_000,
  });

  const familyType: FurusatoFamily = s.family === 0 ? "single" : s.family === 1 ? "couple" : "coupleboth";

  const result = useMemo(
    () =>
      calculateFurusato({
        annualIncome: s.income,
        familyType,
        dependents: s.dependents,
        donationAmount: s.donation,
      }),
    [s, familyType],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "income",
      label: "年収（総支給額・額面）",
      value: s.income,
      min: 1_000_000,
      max: 50_000_000,
      step: 100_000,
      slider: { min: 2_000_000, max: 20_000_000, step: 500_000 },
      chips: [3_000_000, 5_000_000, 6_000_000, 8_000_000, 10_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "family",
      label: "配偶者の有無・世帯構成",
      value: s.family,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "独身", value: 0 },
        { label: "配偶者あり（片働き）", value: 1 },
        { label: "配偶者あり（共働き）", value: 2 },
      ],
    },
    {
      key: "dependents",
      label: "扶養親族の人数（高校生以上・70歳以上など）",
      value: s.dependents,
      min: 0,
      max: 5,
      step: 1,
      chips: [0, 1, 2, 3].map((v) => ({ label: `${v}人`, value: v })),
    },
    {
      key: "donation",
      label: "寄付予定の年間総額",
      value: s.donation,
      min: 2_000,
      max: 1_000_000,
      step: 1_000,
      slider: { min: 2_000, max: 300_000, step: 5_000 },
      chips: [30_000, 50_000, 70_000, 100_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "実質自己負担額", v: `¥${n(result.effectiveContribution)}` },
    { k: "控除・節税効果（還付＋減額）", v: `¥${n(result.taxSaved)}` },
    { k: "所得税からの還付目安（確定申告時）", v: `¥${n(result.incomeTaxRefund)}` },
    { k: "住民税からの税額控除目安（翌年度）", v: `¥${n(result.residentTaxDeduction)}` },
    {
      k: "上限超過額（全額自己負担となる部分）",
      v: result.excess > 0 ? `⚠️ ¥${n(result.excess)} (上限超過)` : "¥0（範囲内）",
    },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="ふるさと納税"
          points={["控除上限額の目安", "自己負担2,000円", "所得税還付", "住民税控除"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="furusato-calculator"
          title="ふるさと納税 控除限度額シミュレーション"
          summary={{ label: "控除上限額の目安", value: `¥${n(result.limit)}` }}
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

        <JaFurusatoArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
