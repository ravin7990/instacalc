import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import {
  cuboidDiagonal,
  polygonDiagonal,
  rectangleDiagonal,
  rightTriangleHypotenuse,
  squareDiagonal,
} from "@/engines/geometry";
import { geoCopy } from "@/i18n/geometry-labels";
import { UsDiagonalArticle } from "@/components/articles/us/UsDiagonalArticle";
import { UsTriangleArticle } from "@/components/articles/us/UsTriangleArticle";
import { JaGeometryArticle } from "@/components/articles/ja/JaGeometryArticle";
import { KoDiagonalArticle } from "@/components/articles/ko/KoDiagonalArticle";
import { KoTrigonometryArticle } from "@/components/articles/ko/KoTrigonometryArticle";
import { RuDiagonalArticle } from "@/components/articles/ru/RuDiagonalArticle";
import { RuTrigonometryArticle } from "@/components/articles/ru/RuTrigonometryArticle";
import { InDiagonalArticle } from "@/components/articles/in/InDiagonalArticle";
import { InTrigonometryArticle } from "@/components/articles/in/InTrigonometryArticle";

type Shape = "rectangle" | "square" | "right" | "cuboid" | "polygon";

/** Per-shape inputs. `n` is the polygon side count, `c` the cuboid height. */
const DEFAULTS: Record<Shape, Record<string, number>> = {
  rectangle: { a: 4, b: 3 },
  square: { a: 4, b: 4 },
  right: { a: 3, b: 4 },
  cuboid: { a: 2, b: 3, c: 6 },
  polygon: { a: 1, b: 1, n: 6 },
};

/**
 * Diagonal calculator. Serves /moretools/diagonalcalculator.html and
 * /moretools/trignometrycalculator.html, which share the same underlying maths
 * but lead with different result sets.
 */
export default function GeometryTools({ seo }: { seo: SeoRecord }) {
  const c = geoCopy(seo.locale);
  const isTriangle = /trig|triangle/.test(seo.path);

  const [shape, setShape] = useState<Shape>(isTriangle ? "right" : "rectangle");
  const [v, setV] = useState(DEFAULTS[isTriangle ? "right" : "rectangle"]);

  const set = (k: string) => (n: number) => setV((s) => ({ ...s, [k]: n }));
  const pick = (s: Shape) => {
    setShape(s);
    setV(DEFAULTS[s]);
  };

  const right = useMemo(
    () => (shape === "right" ? rightTriangleHypotenuse(v.a, v.b) : null),
    [shape, v.a, v.b],
  );

  // Every shape normalises to the same four figures the results panel renders.
  const result = useMemo<{ diagonal: number; perimeter: number; area: number; formula: string }>(() => {
    if (shape === "rectangle") return rectangleDiagonal(v.a, v.b);
    if (shape === "square") return squareDiagonal(v.a);
    if (shape === "right") {
      const r = rightTriangleHypotenuse(v.a, v.b);
      return { diagonal: r.c, perimeter: r.perimeter, area: r.area, formula: "c = √(a² + b²)" };
    }
    if (shape === "cuboid") {
      const b = cuboidDiagonal(v.a, v.b, v.c);
      // For a cuboid the "perimeter" shown is the face diagonal's companion sum,
      // and the "area" is the largest face.
      return {
        diagonal: b.diagonal,
        perimeter: 2 * (v.a + v.b),
        area: Math.max(b.faceArea, b.sideArea, b.topArea),
        formula: b.formula,
      };
    }
    const p = polygonDiagonal(v.n, v.b);
    return { diagonal: p.diagonal, perimeter: p.perimeter, area: p.area, formula: "d = 2R·sin(kπ/n)" };
  }, [shape, v]);

  const modes: Array<[Shape, string]> = [
    ["rectangle", c.rectangle],
    ["square", c.square],
    ["right", c.rightTriangle],
    ["cuboid", c.cuboid],
    ["polygon", c.polygon],
  ];

  const fields: FieldSpec[] =
    shape === "cuboid"
      ? [
          { key: "a", label: c.length, value: v.a, min: 0.1, max: 1000, step: 0.1 },
          { key: "b", label: c.width, value: v.b, min: 0.1, max: 1000, step: 0.1 },
          { key: "c", label: c.height, value: v.c, min: 0.1, max: 1000, step: 0.1 },
        ]
      : shape === "polygon"
        ? [
            {
              key: "n", label: c.sides, value: v.n, min: 3, max: 30, step: 1,
              chips: [3, 4, 5, 6, 8, 12].map((n) => ({ label: `${n}`, value: n })),
            },
            { key: "b", label: c.sideLength, value: v.b, min: 0.1, max: 1000, step: 0.1 },
          ]
        : shape === "square"
          ? [{ key: "a", label: c.side, value: v.a, min: 0.1, max: 1000, step: 0.1 }]
          : [
              { key: "a", label: shape === "right" ? c.sideA : c.length, value: v.a, min: 0.1, max: 1000, step: 0.1 },
              { key: "b", label: shape === "right" ? c.sideB : c.width, value: v.b, min: 0.1, max: 1000, step: 0.1 },
            ];

  // No row needs emphasis styling: the shell already renders the headline.
  const rows: Array<{ key: string; value: string }> =
    isTriangle && right
      ? [
          // For a right triangle the headline diagonal IS the hypotenuse
          // (result.diagonal === right.c), so listing it again duplicated it.
          { key: c.area, value: `${right.area.toFixed(4)} ${c.squareUnits}` },
          { key: c.perimeter, value: `${right.perimeter.toFixed(4)} ${c.units}` },
          { key: c.angleA, value: `${right.angleA.toFixed(2)}°` },
          { key: c.angleB, value: `${right.angleB.toFixed(2)}°` },
          {
            key: c.trigRatios,
            value: `sin=${right.sinA.toFixed(3)} cos=${right.cosA.toFixed(3)} tan=${right.tanA.toFixed(3)}`,
          },
          {
            key: c.classification,
            value:
              seo.locale === "ru"
                ? right.classification.includes("Isosceles")
                  ? "Равнобедренный прямоугольный (45°-45°-90°)"
                  : "Разносторонний прямоугольный"
                : seo.locale === "ja"
                ? right.classification.includes("Isosceles")
                  ? "直角二等辺三角形 (45°-45°-90°)"
                  : "不等辺直角三角形"
                : seo.locale === "ko"
                ? right.classification.includes("Isosceles")
                  ? "직각이등변삼각형 (45°-45°-90°)"
                  : "부등변 직각삼각형"
                : right.classification,
          },
        ]
      : [
          // No diagonal row: the shell already leads with it. In right-triangle
          // mode the hypotenuse row stays, because it is a distinct label the
          // headline does not use.
          { key: c.perimeter, value: `${result.perimeter.toFixed(4)} ${c.units}` },
          { key: c.area, value: `${result.area.toFixed(4)} ${c.squareUnits}` },
          { key: c.formula, value: result.formula },
        ];

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.eyebrow} points={[c.diagonal, c.area, c.perimeter]} />

        <CalculatorShell
          locale={seo.locale}
          id={isTriangle ? "triangle-calculator" : "diagonal-calculator"}
          title={c.diagonal}
          summary={{ label: c.diagonal, value: `${result.diagonal.toFixed(3)} ${c.units}` }}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <span id="shape-label">{c.shape}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="shape-label">
                  {modes.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`chip${shape === key ? " active" : ""}`}
                      aria-pressed={shape === key}
                      onClick={() => pick(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {fields.map((spec) => (
                <Field key={spec.key} spec={spec} onChange={set(spec.key)} />
              ))}
            </>
          }
          results={
            <ul className="kv-list">
              {rows.map((r) => (
                <li key={r.key}>
                  <span className="kv-key">{r.key}</span>
                  <span className="kv-value">{r.value}</span>
                </li>
              ))}
            </ul>
          }
        />

        {seo.locale === "us" && !isTriangle && <UsDiagonalArticle />}
        {seo.locale === "us" && isTriangle && <UsTriangleArticle />}
        {seo.locale === "ja" && <JaGeometryArticle />}
        {seo.locale === "ko" && !isTriangle && <KoDiagonalArticle />}
        {seo.locale === "ko" && isTriangle && <KoTrigonometryArticle />}
        {seo.locale === "ru" && !isTriangle && <RuDiagonalArticle />}
        {seo.locale === "ru" && isTriangle && <RuTrigonometryArticle />}
        {seo.locale === "en" && !isTriangle && <InDiagonalArticle />}
        {seo.locale === "en" && isTriangle && <InTrigonometryArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}

