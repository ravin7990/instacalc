import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateUnemployment, KR_2026 } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoUnemploymentArticle } from "@/components/articles/ko/KoUnemploymentArticle";

export default function UnemploymentCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    last3MonthsPay: 10_500_000,
    insuredYears: 4,
    ageOver50: 0, // 0: under 50, 1: 50 or over / disabled
    weeklyHours: 40,
    involuntary: 1, // 1: involuntary, 0: voluntary
  });

  const result = useMemo(
    () =>
      calculateUnemployment({
        last3MonthsPay: s.last3MonthsPay,
        threeMonthDays: 92,
        insuredYears: s.insuredYears,
        ageOver50OrDisabled: s.ageOver50 === 1,
        weeklyHours: s.weeklyHours,
        involuntary: s.involuntary === 1,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "last3MonthsPay",
      label: "퇴직 전 3개월간 기본급 및 수당 총액 (세전)",
      value: s.last3MonthsPay,
      min: 1_000_000,
      max: 60_000_000,
      step: 100_000,
      slider: { min: 3_000_000, max: 25_000_000, step: 500_000 },
      chips: [6_000_000, 9_000_000, 12_000_000, 15_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "insuredYears",
      label: "고용보험 가입 기간 (근속년수)",
      value: s.insuredYears,
      min: 0.5,
      max: 30,
      step: 0.5,
      slider: { min: 1, max: 20, step: 1 },
      chips: [1, 3, 5, 10, 15].map((v) => ({ label: `${v}년`, value: v })),
    },
    {
      key: "ageOver50",
      label: "퇴직 당시 연령대",
      value: s.ageOver50,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "만 50세 미만", value: 0 },
        { label: "만 50세 이상 또는 장애인", value: 1 },
      ],
    },
    {
      key: "weeklyHours",
      label: "1주일 소정근로시간",
      value: s.weeklyHours,
      min: 1,
      max: 40,
      step: 1,
      chips: [15, 20, 30, 40].map((v) => ({ label: `${v}시간`, value: v })),
    },
    {
      key: "involuntary",
      label: "퇴사 사유",
      value: s.involuntary,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "비자발적 퇴사 (계약만료·권고사직 등)", value: 1 },
        { label: "자발적 퇴사 (개인사정)", value: 0 },
      ],
    },
  ];

  const rows = [
    { k: "실업급여 수급 자격", v: result.eligible ? "✅ 수급 요건 충족 (비자발적 퇴사 & 180일 이상)" : "⚠️ 수급 불가 (자진퇴사는 원칙적 제외)" },
    { k: "1일 구직급여 지급액", v: `₩${n(result.daily)} / 일 ${result.cappedBy === "max" ? "(2026년 법정 상한액 68,100원 적용)" : result.cappedBy === "min" ? "(최저임금 연동 하한액 적용)" : ""}` },
    { k: "소정 급여일수 (지급 일수)", v: `${result.days}일 (약 ${(result.days / 30).toFixed(1)}개월)` },
    { k: "월 환산 예상 수급액 (30일)", v: `₩${n(result.monthly)}` },
    { k: "퇴직 전 1일 평균임금", v: `₩${n(result.avgDailyWage)}` },
    { k: "2026년 법정 상한액", v: `1일 ₩${n(KR_2026.unemploymentDailyMax)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 실업급여 계산기"
          points={["2026 상한액 68,100원 반영", "최저임금 연동 하한액 보호", "연령·근속별 120~270일 자동 산정", "비자발적 퇴사 수급 자격 안내"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="unemployment-calculator"
          title="2026년 구직급여(실업급여) 모의 계산"
          summary={{ label: "예상 총 수급액", value: `₩${n(result.total)}` }}
          onReset={() =>
            setS({
              last3MonthsPay: 10_500_000,
              insuredYears: 4,
              ageOver50: 0,
              weeklyHours: 40,
              involuntary: 1,
            })
          }
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

        <KoUnemploymentArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
