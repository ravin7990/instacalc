import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSalary, type SpouseMode } from "@/engines/japan";
import { formatNumber } from "@/lib/currency";
import { JaSalaryArticle } from "@/components/articles/ja/JaSalaryArticle";


/** Japanese 年収/PR Calculator — salary tax, social insurance and net pay. */
export default function SalaryCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    gross: 5_000_000,
    over40: 1,
    spouse: 0,
    dependents: 0,
  });

  const result = useMemo(
    () =>
      calculateSalary({
        annualGross: s.gross,
        isOver40: s.over40 === 1,
        spouseMode: (["none", "spouse", "dependent"] as SpouseMode[])[s.spouse] ?? "none",
        dependents: s.dependents,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "gross", label: "年収（総支給額・額面）", value: s.gross,
      min: 0, max: 100_000_000, step: 100_000,
      slider: { min: 0, max: 30_000_000, step: 500_000 },
      chips: [3_000_000, 4_000_000, 5_000_000, 8_000_000, 12_000_000].map((v) => ({ label: `${v / 10000}万円`, value: v })),
    },
    { key: "over40", label: "介護保険の対象（40歳以上）", value: s.over40, min: 0, max: 1, step: 1,
      chips: [
        { label: "39歳以下", value: 0 },
        { label: "40歳以上", value: 1 },
      ] },
    { key: "spouse", label: "配偶者控除の有無", value: s.spouse, min: 0, max: 2, step: 1,
      chips: [
        { label: "なし（独身・共働き）", value: 0 },
        { label: "配偶者あり", value: 1 },
        { label: "配偶者控除・扶養親族", value: 2 },
      ] },
    { key: "dependents", label: "扶養親族の人数", value: s.dependents, min: 0, max: 10, step: 1,
      chips: [0, 1, 2, 3].map((v) => ({ label: `${v}人`, value: v })) },
  ];

  const rows = [
    // Net pay is the headline and is not repeated as a row.
    { k: "社会保険料（健康・厚生・雇用）", v: `¥${n(result.socialInsurance)}` },
    { k: "所得税（復興特別所得税含む）", v: `¥${n(result.incomeTax)}` },
    { k: "住民税（都道府県民税・市区町村民税）", v: `¥${n(result.residentTax)}` },
    { k: "給与所得控除後の金額", v: `¥${n(result.employmentIncome)}` },
    { k: "税金・保険料の控除合計", v: `¥${n(result.totalDeductions)}` },
    { k: "毎月の手取り目安", v: `¥${n(result.monthlyNet)}` },
    { k: "実効負担率（税・社会保険料）", v: `${result.effectiveRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow="給与手取り計算" points={["年間手取り額", "社会保険料", "所得税", "住民税"]} />

        <CalculatorShell
          locale={seo.locale}
          id="salary-calculator"
          title="年間手取り目安額"
          summary={{ label: "年間手取り", value: `¥${n(result.net)}` }}
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

        <JaSalaryArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />

      </Layout>
    </>
  );
}