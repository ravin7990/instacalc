import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateConcrete, MIX_DATA, type ConcreteShape } from "@/engines/concrete";
import { CONCRETE_DEFAULTS, concreteFields } from "@/calculators/geometry/concrete-fields";
import { geoCopy } from "@/i18n/geometry-labels";
import { UsConcreteArticle } from "@/components/articles/us/UsConcreteArticle";
import { JaConcreteArticle } from "@/components/articles/ja/JaConcreteArticle";
import { KoConcreteArticle } from "@/components/articles/ko/KoConcreteArticle";
import { RuConcreteArticle } from "@/components/articles/ru/RuConcreteArticle";
import { InConcreteArticle } from "@/components/articles/in/InConcreteArticle";

const SHAPES: Array<[ConcreteShape, "slab" | "column" | "beam" | "footing" | "staircase" | "circle" | "wall"]> = [
  ["slab", "slab"],
  ["column", "column"],
  ["beam", "beam"],
  ["footing", "footing"],
  ["staircase", "staircase"],
  ["circle", "circle"],
  ["wall", "wall"],
];

const GRADES = Object.keys(MIX_DATA);

/** Concrete estimator: volume by shape, then materials from the mix ratio. */
export default function ConcreteCalculator({ seo }: { seo: SeoRecord }) {
  const c = geoCopy(seo.locale);

  const [shape, setShape] = useState<ConcreteShape>("slab");
  const [grade, setGrade] = useState("M20");
  const [wastage, setWastage] = useState(5);
  const [v, setV] = useState<Record<string, number>>({ ...CONCRETE_DEFAULTS });

  const set = (k: string) => (n: number) => setV((s) => ({ ...s, [k]: n }));

  const result = useMemo(
    () => calculateConcrete({ shape, grade, wastagePercent: wastage, ...v }),
    [shape, grade, wastage, v],
  );

  const fields = concreteFields(shape, v, c);

  const isUs = seo.locale === "us";
  const isKo = seo.locale === "ko";
  const isRu = seo.locale === "ru";
  const cuYds = (result.wetVolume * 1.30795).toFixed(2);
  const cuFt = (result.wetVolume * 35.3147).toFixed(1);
  const bags80 = Math.ceil(result.wetVolume * 1.30795 * 45);
  const bags60 = Math.ceil(result.wetVolume * 1.30795 * 60);

  // Korean cement standard: 1 bag = 40 kg (KS L 5201)
  const bags40 = Math.ceil(result.cementWeight / 40);
  const remiconTrucks = (result.wetVolume / 6).toFixed(1);

  // Russian cement standard: 1 bag = 50 kg (ГОСТ 31108)
  const bags50 = Math.ceil(result.cementWeight / 50);
  const mixerTrucks7 = (result.wetVolume / 7).toFixed(1);

  const rows = isUs
    ? [
        { key: "Cubic Yards (yd³)", value: `${cuYds} cu yd` },
        { key: "Cubic Feet (ft³)", value: `${cuFt} cu ft` },
        { key: "80-lb Bags Needed", value: `${bags80} bags` },
        { key: "60-lb Bags Needed", value: `${bags60} bags` },
        { key: "Metric Volume", value: `${result.wetVolume} m³` },
        { key: c.mixRatio, value: result.mix.join(" : ") },
      ]
    : isKo
    ? [
        { key: "타설 체적 (루베)", value: `${result.wetVolume} m³ (루베)` },
        { key: "레미콘 차량 (6루베 기준)", value: `약 ${remiconTrucks} 대` },
        { key: "시멘트 소요량 (40kg 포대)", value: `${bags40} 포대 (${result.cementWeight} kg)` },
        { key: c.sand, value: `${result.sandWeight} kg (${result.sandVolume.toFixed(2)} m³)` },
        { key: c.aggregate, value: `${result.aggregateWeight} kg (${result.aggregateVolume.toFixed(2)} m³)` },
        { key: c.mixRatio, value: result.mix.join(" : ") },
      ]
    : isRu
    ? [
        { key: "Объем бетона (в кубах)", value: `${result.wetVolume} м³` },
        { key: "Цемент (мешки по 50 кг ГОСТ)", value: `${bags50} шт. (${result.cementWeight} кг)` },
        { key: "Автобетоносмеситель (миксер 7 м³)", value: `ок. ${mixerTrucks7} рейс.` },
        { key: "Песок строительный", value: `${result.sandWeight} кг (${result.sandVolume.toFixed(2)} м³)` },
        { key: "Щебень гранитный (5-20 мм)", value: `${result.aggregateWeight} кг (${result.aggregateVolume.toFixed(2)} м³)` },
        { key: "Пропорция смеси (Ц:П:Щ)", value: result.mix.join(" : ") },
      ]
    : [
        { key: c.volume, value: `${result.wetVolume} m³` },
        { key: c.cementBags, value: `${result.cementBags} bags` },
        { key: c.sand, value: `${result.sandWeight} kg` },
        { key: c.aggregate, value: `${result.aggregateWeight} kg` },
        { key: c.mixRatio, value: result.mix.join(" : ") },
      ];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={
            isUs
              ? ["Cubic Yards", "80-lb Bags", "Cubic Feet", "Metric m³"]
              : isKo
              ? ["루베(m³) 체적", "40kg 시멘트 포대", "레미콘 대수", "모래·자갈 배합"]
              : isRu
              ? ["Объем в кубах (м³)", "Мешки цемента по 50 кг", "Рейсы миксера", "Песок и щебень по ГОСТ"]
              : [c.volume, c.cementBags, c.sand, c.aggregate]
          }
        />

        <CalculatorShell
          locale={seo.locale}
          id="concrete-calculator"
          title={isUs ? "Required Concrete" : isKo ? "총 소요 체적 (루베)" : isRu ? "Необходимый объем бетона" : c.dryVolume}
          summary={{
            label: isUs ? "Volume Required" : isKo ? "총 소요 체적 (루베)" : isRu ? "Необходимый объем бетона" : c.dryVolume,
            value: isUs ? `${(result.requiredVolume * 1.30795).toFixed(2)} cu yd` : `${result.requiredVolume} м³`,
          }}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <span id="shape-label">{c.shape}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="shape-label">
                  {SHAPES.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`chip${shape === key ? " active" : ""}`}
                      aria-pressed={shape === key}
                      onClick={() => setShape(key)}
                    >
                      {c[label]}
                    </button>
                  ))}
                </div>
              </div>

              {fields.map((spec) => (
                <Field key={spec.key} spec={spec} onChange={set(spec.key)} />
              ))}

              <div className="field-card">
                <div className="field-head">
                  <span id="grade-label">{c.mixGrade}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="grade-label">
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      className={`chip${grade === g ? " active" : ""}`}
                      aria-pressed={grade === g}
                      onClick={() => setGrade(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <Field
                spec={{
                  key: "wastage",
                  label: c.wastage,
                  value: wastage,
                  min: 0,
                  max: 25,
                  step: 1,
                  suffix: "%",
                  chips: [0, 5, 10, 15].map((n) => ({ label: `${n}%`, value: n })),
                }}
                onChange={setWastage}
              />
            </>
          }
          results={
            result.error ? (
              <p className="helper-text">{result.error}</p>
            ) : (
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.key}>
                    <span className="kv-key">{r.key}</span>
                    <span className="kv-value">{r.value}</span>
                  </li>
                ))}
              </ul>
            )
          }
        />

        {seo.locale === "us" && <UsConcreteArticle />}
        {seo.locale === "ja" && <JaConcreteArticle />}
        {seo.locale === "ko" && <KoConcreteArticle />}
        {seo.locale === "ru" && <RuConcreteArticle />}
        {seo.locale === "en" && <InConcreteArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
