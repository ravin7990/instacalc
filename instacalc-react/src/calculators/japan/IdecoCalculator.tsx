import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateIdeco, type IdecoJobCategory, IDECO_CAPS } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaIdecoArticle } from "@/components/articles/ja/JaIdecoArticle";

const CATEGORIES: Array<{ key: IdecoJobCategory; label: string }> = [
  { key: "company_none", label: "会社員（企業年金なし・上限2.3万円/月）" },
  { key: "company_dc", label: "会社員（企業型DCのみ・上限2.0万円/月）" },
  { key: "company_db", label: "会社員（確定給付DBあり・上限1.2万円/月）" },
  { key: "civil_servant", label: "公務員（上限1.2万円/月）" },
  { key: "self_employed", label: "自営業・フリーランス（上限6.8万円/月）" },
  { key: "housewife", label: "専業主婦・主夫（上限2.3万円/月）" },
];

/** iDeCo（個人型確定拠出年金）資産形成・節税シミュレーター */
export default function IdecoCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    categoryIdx: 0,
    monthly: 23_000,
    currentAge: 30,
    rate: 5.0,
    income: 5_000_000,
  });

  const jobCategory = CATEGORIES[s.categoryIdx]?.key ?? "company_none";
  const maxAllowed = IDECO_CAPS[jobCategory] ?? 23_000;

  const result = useMemo(
    () =>
      calculateIdeco({
        jobCategory,
        monthlyContribution: Math.min(s.monthly, maxAllowed),
        currentAge: s.currentAge,
        annualReturnRate: s.rate,
        annualGrossIncome: s.income,
      }),
    [jobCategory, s.monthly, maxAllowed, s.currentAge, s.rate, s.income],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "categoryIdx",
      label: "ご職業・年金加入区分（上限掛金の設定）",
      value: s.categoryIdx,
      min: 0,
      max: CATEGORIES.length - 1,
      step: 1,
      chips: CATEGORIES.map((c, i) => ({ label: c.label.split("（")[0], value: i })),
    },
    {
      key: "monthly",
      label: `毎月の掛金額（上限: ¥${n(maxAllowed)}）`,
      value: Math.min(s.monthly, maxAllowed),
      min: 5_000,
      max: maxAllowed,
      step: 1_000,
      slider: { min: 5_000, max: maxAllowed, step: 1_000 },
      chips: [5_000, 10_000, 12_000, 20_000, 23_000, 68_000]
        .filter((v) => v <= maxAllowed)
        .map((v) => ({ label: `${v / 1000}千円`, value: v })),
    },
    {
      key: "currentAge",
      label: "現在の年齢（60歳受取開始まで）",
      value: s.currentAge,
      min: 20,
      max: 59,
      step: 1,
      slider: { min: 20, max: 59, step: 1 },
      chips: [25, 30, 35, 40, 50].map((v) => ({ label: `${v}歳`, value: v })),
    },
    {
      key: "rate",
      label: "想定運用利回り（年利％）",
      value: s.rate,
      min: 0.1,
      max: 15.0,
      step: 0.1,
      slider: { min: 1.0, max: 10.0, step: 0.5 },
      chips: [3, 5, 7, 8].map((v) => ({ label: `${v}%`, value: v })),
    },
    {
      key: "income",
      label: "現在の年収（掛金所得控除の計算用）",
      value: s.income,
      min: 1_000_000,
      max: 30_000_000,
      step: 500_000,
      slider: { min: 2_000_000, max: 15_000_000, step: 500_000 },
      chips: [3_000_000, 5_000_000, 7_000_000, 10_000_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "拠出元本累計（自己資金）", v: `¥${n(result.totalContributed)}` },
    { k: "想定運用益（非課税）", v: `¥${n(result.investmentGains)}` },
    { k: "運用益非課税メリット（20.315%相当）", v: `¥${n(result.taxSavedOnGains)}` },
    { k: "毎年の所得控除による節税額（所得税＋住民税）", v: `¥${n(result.annualTaxSaved)}` },
    { k: "60歳までの掛金節税 累計総額", v: `¥${n(result.lifetimeTaxSaved)}` },
    { k: "iDeCoトータル経済効果（運用益＋節税累計）", v: `¥${n(result.totalBenefit)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="iDeCo・確定拠出年金"
          points={["60歳受取総額", "運用益非課税", "掛金所得控除", "トータル節税効果"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="ideco-calculator"
          title="iDeCo資産形成・節税シミュレーション"
          summary={{ label: "60歳時点の想定資産総額", value: `¥${n(result.finalCorpus)}` }}
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

        <JaIdecoArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
