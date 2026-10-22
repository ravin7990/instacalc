import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateGakushiHoken, type Course, COURSE_COSTS } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaGakushiHokenArticle } from "@/components/articles/ja/JaGakushiHokenArticle";

const COURSES: Array<{ key: Course; label: string }> = [
  { key: "national", label: "国公立大学（目安 300万円）" },
  { key: "private_arts", label: "私立文系大学（目安 450万円）" },
  { key: "private_science", label: "私立理系大学（目安 600万円）" },
  { key: "medical", label: "私立医歯薬系大学（目安 2,000万円）" },
];

/** 学資保険 vs 新NISA 教育資金積立シミュレーター */
export default function GakushiHokenCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    courseIdx: 1,
    childAge: 0,
    monthly: 20_000,
    nisaRate: 5.0,
    gakushiRate: 105,
  });

  const course = COURSES[s.courseIdx]?.key ?? "private_arts";

  const result = useMemo(
    () =>
      calculateGakushiHoken({
        course,
        childAge: s.childAge,
        monthlySavings: s.monthly,
        nisaRate: s.nisaRate,
        gakushiReturnRate: s.gakushiRate,
      }),
    [course, s.childAge, s.monthly, s.nisaRate, s.gakushiRate],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "courseIdx",
      label: "目標進路コース（大学4年間の目安学費）",
      value: s.courseIdx,
      min: 0,
      max: COURSES.length - 1,
      step: 1,
      chips: COURSES.map((c, i) => ({ label: c.label.split("（")[0], value: i })),
    },
    {
      key: "childAge",
      label: "お子様の現在の年齢（18歳大学進学まで）",
      value: s.childAge,
      min: 0,
      max: 15,
      step: 1,
      slider: { min: 0, max: 15, step: 1 },
      chips: [0, 1, 3, 5, 7, 10].map((v) => ({ label: `${v}歳`, value: v })),
    },
    {
      key: "monthly",
      label: "毎月の教育積立額（円）",
      value: s.monthly,
      min: 5_000,
      max: 100_000,
      step: 5_000,
      slider: { min: 5_000, max: 80_000, step: 5_000 },
      chips: [10_000, 15_000, 20_000, 30_000, 50_000].map((v) => ({
        label: `${v / 10000}万円`,
        value: v,
      })),
    },
    {
      key: "nisaRate",
      label: "新NISA 想定運用利回り（年利％）",
      value: s.nisaRate,
      min: 1.0,
      max: 12.0,
      step: 0.5,
      chips: [3, 4, 5, 7].map((v) => ({ label: `${v}%`, value: v })),
    },
    {
      key: "gakushiRate",
      label: "学資保険 返戻率（％）",
      value: s.gakushiRate,
      min: 95,
      max: 115,
      step: 1,
      chips: [100, 103, 105, 108].map((v) => ({ label: `${v}%`, value: v })),
    },
  ];

  const rows = [
    { k: "18歳までの積立元本累計", v: `¥${n(result.totalContributed)}` },
    { k: "目標大学の目安学費", v: `¥${n(result.courseCost)}` },
    { k: "新NISA 運用利益（非課税）", v: `¥${n(result.nisaGains)}` },
    { k: "学資保険 満期受取見込額", v: `¥${n(result.gakushiFinalAmount)}` },
    { k: "学資保険 増加益", v: `¥${n(result.gakushiGains)}` },
    { k: "新NISA vs 学資保険 差額メリット", v: `+¥${n(result.diffBenefit)} (新NISA優位)` },
    { k: "目標学費に対する達成率", v: `${result.achievementRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="学資保険・新NISA"
          points={["18歳満期準備額", "新NISA運用益", "学資保険返戻金", "差額メリット比較"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="gakushihoken-calculator"
          title="学資保険 vs 新NISA 教育資金シミュレーション"
          summary={{ label: "新NISA 18歳到達時想定資産", value: `¥${n(result.nisaFinalAmount)}` }}
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

        <JaGakushiHokenArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
