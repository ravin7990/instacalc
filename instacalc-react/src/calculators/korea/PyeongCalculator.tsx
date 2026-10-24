import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { pyeongToSqm, sqmToPyeong } from "@/engines/korea";
import { KoPyeongArticle } from "@/components/articles/ko/KoPyeongArticle";

export default function PyeongCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    mode: 0, // 0: 평 -> m2, 1: m2 -> 평
    value: 34,
  });

  const converted = useMemo(() => {
    if (s.mode === 0) {
      const sqm = pyeongToSqm(s.value);
      return {
        mainLabel: "환산 제곱미터(㎡)",
        mainValue: `${sqm.toFixed(2)} ㎡`,
        unitDesc: `${s.value}평 = ${sqm.toFixed(2)}㎡`,
        sqm,
        pyeong: s.value,
      };
    } else {
      const pyeong = sqmToPyeong(s.value);
      return {
        mainLabel: "환산 평수(평)",
        mainValue: `${pyeong.toFixed(2)} 평`,
        unitDesc: `${s.value}㎡ = ${pyeong.toFixed(2)}평`,
        sqm: s.value,
        pyeong,
      };
    }
  }, [s]);

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const fields: FieldSpec[] = [
    {
      key: "mode",
      label: "변환 방향 선택",
      value: s.mode,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "평(坪) → 제곱미터(㎡)", value: 0 },
        { label: "제곱미터(㎡) → 평(坪)", value: 1 },
      ],
    },
    {
      key: "value",
      label: s.mode === 0 ? "면적 입력 (평)" : "면적 입력 (㎡)",
      value: s.value,
      min: 0.1,
      max: 100_000,
      step: 1,
      slider: s.mode === 0 ? { min: 1, max: 100, step: 1 } : { min: 10, max: 330, step: 1 },
      chips:
        s.mode === 0
          ? [10, 20, 25, 30, 34, 45].map((v) => ({ label: `${v}평`, value: v }))
          : [59, 74, 84, 102, 114].map((v) => ({ label: `${v}㎡`, value: v })),
    },
  ];

  const rows = [
    { k: "환산 면적 요약", v: converted.unitDesc },
    { k: "법정 환산 계수", v: "1평 = 400/121 ㎡ (약 3.305785 ㎡)" },
    { k: "1㎡ 당 평수", v: "1㎡ ≈ 0.3025 평" },
    { k: "아파트 공급면적 기준 추정", v: `약 ${Math.round(converted.pyeong)}평형대` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="부동산 면적 변환기"
          points={["평 ↔ 제곱미터(㎡) 양방향 환산", "아파트 전용 59·84㎡ 프리셋", "소수점 정밀 계산", "국민평형 면적 정보"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="pyeong-calculator"
          title="평수 ↔ 제곱미터(㎡) 면적 계산기"
          summary={{ label: converted.mainLabel, value: converted.mainValue }}
          onReset={() => setS({ mode: 0, value: 34 })}
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

        <KoPyeongArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
