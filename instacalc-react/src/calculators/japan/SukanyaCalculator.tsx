import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSukanya, COURSE_COSTS, type Course } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaSukanyaArticle } from "@/components/articles/ja/JaSukanyaArticle";


const COURSES: Course[] = ["national", "private_arts", "private_science", "medical"];

/** すまいる積立金 — child savings projected to university entry. */
export default function SukanyaCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({ age: 0, monthly: 20_000, rate: 5, course: 1 });

  const result = useMemo(
    () =>
      calculateSukanya({
        childAge: s.age,
        monthlySavings: s.monthly,
        rate: s.rate,
        course: COURSES[s.course] ?? "national",
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const courseLabels = [
    "国公立大学（4年間 約300万円）",
    "私立文系大学（4年間 約450万円）",
    "私立理系大学（4年間 約600万円）",
    "私立医歯薬系（6年間 約2,000万円）",
  ];

  const fields: FieldSpec[] = [
    { key: "age", label: "お子様の現在の年齢", value: s.age, min: 0, max: 17, step: 1,
      chips: [0, 1, 3, 5, 10].map((v) => ({ label: `${v}歳`, value: v })) },
    {
      key: "monthly", label: "毎月の積立額", value: s.monthly,
      min: 0, max: 1_000_000, step: 1000,
      slider: { min: 0, max: 100_000, step: 1000 },
      chips: [5000, 10_000, 20_000, 50_000, 100_000].map((v) => ({ label: `¥${n(v)}`, value: v })),
    },
    { key: "rate", label: "想定年利（運用利回り）", value: s.rate, min: 0, max: 10, step: 0.1, suffix: "%",
      chips: [0, 2, 5, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "course", label: "進学目標コース", value: s.course, min: 0, max: 3, step: 1,
      chips: courseLabels.map((label, i) => ({ label: label.split("（")[0], value: i })) },
  ];

  const rows = [
    // The final amount is the headline and is not repeated as a row.
    { k: "積立元本累計（自己資金）", v: `¥${n(result.totalContributed)}` },
    { k: "運用利益（利息分）", v: `¥${n(result.interestEarned)}` },
    { k: "進学目標コースの想定費用", v: `¥${n(result.courseCost)}` },
    { k: "目標達成に必要な毎月の積立額", v: `¥${n(result.requiredMonthly)}` },
    {
      k: "目標達成判定",
      v: result.sufficient ? "達成見込（充足）" : `目標まであと${result.yearsToSufficient ?? "—"}年`,
    },
  ];


  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow="教育積立" points={["18歳積立額", "必要月額", "進学費用", "利息分"]} />

        <CalculatorShell
          locale={seo.locale}
          id="sukanya-calculator"
          title="18歳時点の積立額"
          summary={{ label: "積立額", value: `¥${n(result.finalAmount)}` }}
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

        <JaSukanyaArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />

      </Layout>
    </>
  );
}

export { COURSE_COSTS };