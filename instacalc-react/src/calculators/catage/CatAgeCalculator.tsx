import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCatAge, catAgeProjection } from "@/engines/life";
import { fieldCopy } from "@/i18n/field-labels";
import { formatNumber } from "@/lib/currency";
import { catCopy } from "@/i18n/life-labels";
import { JaCatAgeArticle } from "@/components/articles/ja/JaCatAgeArticle";
import { RuCatAgeArticle } from "@/components/articles/ru/RuCatAgeArticle";
import { InCatAgeArticle } from "@/components/articles/in/InCatAgeArticle";

export default function CatAgeCalculator({ seo }: { seo: SeoRecord }) {
  const c = catCopy(seo.locale);
  const f = fieldCopy(seo.locale);

  const [catYears, setCatYears] = useState(5);
  const [lifeExpectancy, setLifeExpectancy] = useState(15);
  const [rounding, setRounding] = useState(0);

  const result = useMemo(
    () => calculateCatAge(catYears, lifeExpectancy, rounding === 1 ? "whole" : "one"),
    [catYears, lifeExpectancy, rounding],
  );
  const rows = useMemo(() => catAgeProjection(catYears), [catYears]);

  const fields: FieldSpec[] = [
    {
      key: "catYears",
      label: c.catAge,
      value: catYears,
      min: 0.1,
      max: 30,
      step: 0.5,
      slider: { min: 0.5, max: 25, step: 0.5 },
      suffix: c.yearsSuffix,
      chips: [1, 2, 5, 10, 15].map((v) => ({ label: `${v}`, value: v })),
    },
    {
      key: "lifeExpectancy",
      label: c.lifeExpectancy,
      value: lifeExpectancy,
      min: 12,
      max: 25,
      step: 1,
      suffix: c.yearsSuffix,
      chips: [12, 15, 18, 20].map((v) => ({ label: `${v}`, value: v })),
    },
    {
      key: "rounding",
      label: c.rounding,
      value: rounding,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: c.oneDecimal, value: 0 },
        { label: c.wholeYears, value: 1 },
      ],
    },
  ];

  const pct = Math.round(result.lifePercent);

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.humanAge, c.lifeStage, c.projection]} />

        <CalculatorShell
          locale={seo.locale}
          id="cat-age-calculator"
          title={c.humanAge}
          summary={{ label: c.humanAge, value: `${result.humanYearsLabel} ${c.yearsSuffix}` }}
          inputs={
            <>
              {fields.map((spec) => (
                <Field
                  key={spec.key}
                  spec={spec}
                  onChange={(v) => {
                    if (spec.key === "catYears") setCatYears(v);
                    else if (spec.key === "lifeExpectancy") setLifeExpectancy(v);
                    else setRounding(v);
                  }}
                />
              ))}
              <div className="field-card">
                <p className="field-hint">{c.lifespanUsed}</p>
                <div
                  className="progress"
                  role="img"
                  aria-label={`${c.lifespanUsed}: ${pct}%`}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="field-result">
                  {pct}% {c.lifespanUsed}
                </p>
              </div>
            </>
          }
          results={
            <ResultList
              // The shell renders human age as the headline, so it is not repeated
              // here as a tile.
              items={[
                {
                  label: c.lifeStage,
                  value:
                    seo.locale === "ru"
                      ? result.lifeStage === "Kitten" ? "Котёнок (до 1 года)"
                        : result.lifeStage === "Junior" ? "Юниор (1-2 года)"
                        : result.lifeStage === "Prime Adult" ? "Взрослая кошка (3-6 лет)"
                        : result.lifeStage === "Mature" ? "Зрелая кошка (7-10 лет)"
                        : result.lifeStage === "Senior" ? "Пожилая кошка (11-14 лет)"
                        : "Долгожитель (от 15 лет)"
                      : seo.locale === "ja"
                      ? result.lifeStage === "Kitten" ? "子猫期（1歳未満）"
                        : result.lifeStage === "Junior" ? "若猫期（1〜2歳）"
                        : result.lifeStage === "Prime Adult" ? "成猫期（3〜6歳）"
                        : result.lifeStage === "Mature" ? "壮年期（7〜10歳）"
                        : result.lifeStage === "Senior" ? "シニア期（11〜14歳）"
                        : "スーパーシニア（15歳以上）"
                      : result.lifeStage,
                },
                { label: c.remainingYears, value: `${result.humanYearsRemaining} ${c.yearsSuffix}` },
                { label: c.catAge, value: `${result.catYears} ${c.yearsSuffix}` },
              ]}
            />
          }
        >
          <ProjectionTable
            caption={c.projection}
            head={[f.schedule, c.humanAge, c.lifeStage]}
            rows={rows.map((r) => [
              String(r.catAge),
              `${r.humanAge} ${c.yearsSuffix}`,
              seo.locale === "ru"
                ? r.stage === "Kitten" ? "Котёнок"
                  : r.stage === "Junior" ? "Юниор"
                  : r.stage === "Prime Adult" ? "Взрослая"
                  : r.stage === "Mature" ? "Зрелая"
                  : r.stage === "Senior" ? "Пожилая"
                  : "Долгожитель"
                : seo.locale === "ja"
                ? r.stage === "Kitten" ? "子猫"
                  : r.stage === "Junior" ? "若猫"
                  : r.stage === "Prime Adult" ? "成猫"
                  : r.stage === "Mature" ? "壮年"
                  : r.stage === "Senior" ? "シニア"
                  : "スーパーシニア"
                : r.stage,
            ])}
          />
        </CalculatorShell>

        {seo.locale === "ja" && <JaCatAgeArticle />}
        {seo.locale === "ru" && <RuCatAgeArticle />}
        {seo.locale === "en" && <InCatAgeArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
