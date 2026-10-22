import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateTaishokukin } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaTaishokukinArticle } from "@/components/articles/ja/JaTaishokukinArticle";

/** 退職金・退職所得控除 手取り計算シミュレーター */
export default function TaishokukinCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    gross: 20_000_000,
    tenure: 38,
    declaration: 1, // 1: submitted, 0: not submitted
  });

  const result = useMemo(
    () =>
      calculateTaishokukin({
        severanceAmount: s.gross,
        tenureYears: s.tenure,
        declarationSubmitted: s.declaration === 1,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "gross",
      label: "退職金の額面（総支給額）",
      value: s.gross,
      min: 500_000,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 2_000_000, max: 50_000_000, step: 1_000_000 },
      chips: [10_000_000, 15_000_000, 20_000_000, 25_000_000, 30_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "tenure",
      label: "勤続年数（1年未満の端数は切り上げ）",
      value: s.tenure,
      min: 1,
      max: 50,
      step: 1,
      slider: { min: 1, max: 45, step: 1 },
      chips: [10, 20, 30, 35, 38, 40].map((v) => ({ label: `${v}年`, value: v })),
    },
    {
      key: "declaration",
      label: "退職所得申告書の提出の有無",
      value: s.declaration,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "提出なし（一律20.42%源泉徴収）", value: 0 },
        { label: "提出あり（退職所得控除＋1/2課税適用）", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "退職所得控除額（非課税枠）", v: `¥${n(result.deductionAmount)}` },
    { k: "課税退職所得金額（1/2優遇後）", v: `¥${n(result.taxableRetirementIncome)}` },
    { k: "所得税（復興特別所得税含む）", v: `¥${n(result.incomeTax)}` },
    { k: "住民税（市町村民税＋道府県民税10%）", v: `¥${n(result.residentTax)}` },
    { k: "税金合計額（源泉徴収税額）", v: `¥${n(result.totalTax)}` },
    { k: "手取り割合（受取率）", v: `${result.takeHomeRatio}%` },
    { k: "実効税率", v: `${result.effectiveTaxRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="退職金・退職所得控除"
          points={["手取り支給額", "退職所得控除枠", "税金内訳", "手取り割合"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="taishokukin-calculator"
          title="退職金手取り・税額シミュレーション"
          summary={{ label: "退職金 手取り支給額", value: `¥${n(result.netSeverance)}` }}
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

        <JaTaishokukinArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
