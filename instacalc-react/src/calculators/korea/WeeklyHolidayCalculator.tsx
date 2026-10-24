import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateWeeklyHoliday, KR_2026, type DeductionMode } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoWeeklyHolidayArticle } from "@/components/articles/ko/KoWeeklyHolidayArticle";

export default function WeeklyHolidayCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    hourly: KR_2026.minWageHourly,
    weeklyHours: 25,
    fullAttendance: 1, // 1: yes, 0: no
    deduction: 0, // 0: none, 1: 3.3%, 2: 4대보험
  });

  const deductionMode: DeductionMode = s.deduction === 1 ? "3.3" : s.deduction === 2 ? "4ins" : "none";

  const result = useMemo(
    () =>
      calculateWeeklyHoliday({
        hourly: s.hourly,
        weeklyHours: s.weeklyHours,
        fullAttendance: s.fullAttendance === 1,
        deduction: deductionMode,
      }),
    [s, deductionMode],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "hourly",
      label: "시급 (원)",
      value: s.hourly,
      min: 5_000,
      max: 100_000,
      step: 10,
      slider: { min: 9_000, max: 25_000, step: 100 },
      chips: [
        { label: `2026 최저(${KR_2026.minWageHourly}원)`, value: KR_2026.minWageHourly },
        { label: "11,000원", value: 11_000 },
        { label: "12,000원", value: 12_000 },
        { label: "15,000원", value: 15_000 },
      ],
    },
    {
      key: "weeklyHours",
      label: "1주일 총 소정근로시간",
      value: s.weeklyHours,
      min: 1,
      max: 52,
      step: 1,
      slider: { min: 5, max: 40, step: 1 },
      chips: [14, 15, 20, 30, 40].map((v) => ({ label: `${v}시간`, value: v })),
    },
    {
      key: "fullAttendance",
      label: "소정근로일 만근(개근) 여부",
      value: s.fullAttendance,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "결근 없음 (개근)", value: 1 },
        { label: "결근 있음", value: 0 },
      ],
    },
    {
      key: "deduction",
      label: "세금 및 보험료 공제 선택",
      value: s.deduction,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "미공제 (세전)", value: 0 },
        { label: "3.3% 프리랜서", value: 1 },
        { label: "4대보험 공제", value: 2 },
      ],
    },
  ];

  const rows = [
    { k: "주휴수당 발생 여부", v: result.eligible ? "발생 대상 (주 15시간 이상 & 만근)" : "미발생 (주 15시간 미만 또는 결근)" },
    { k: "1주일 인정 주휴시간", v: `${result.holidayHours.toFixed(1)}시간` },
    { k: "주간 기본 알바비 (시급 × 시간)", v: `₩${n(result.weeklyBase)}` },
    { k: "주간 총 지급액 (기본급 + 주휴수당)", v: `₩${n(result.weeklyTotal)}` },
    { k: "월 환산 유급 근로시간", v: `${result.monthlyHours.toFixed(1)}시간` },
    { k: "월 환산 총 주휴수당", v: `₩${n(Math.round(result.monthlyHolidayPay))}` },
    { k: "월 공제액 (세금/보험료)", v: `₩${n(result.deductionAmount)}` },
    { k: "예상 월 실수령액 (세후)", v: `₩${n(Math.round(result.monthlyNet))}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 주휴수당 계산기"
          points={["2026 최저시급(10,320원) 반영", "주 15시간 수급 조건 판정", "주휴수당 및 월환산 총액 산정", "3.3%·4대보험 공제 지원"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="weekly-holiday-calculator"
          title="2026년 주휴수당 및 알바 월급 계산"
          summary={{ label: "주간 주휴수당", value: `₩${n(Math.round(result.weeklyHolidayPay))}` }}
          onReset={() =>
            setS({
              hourly: KR_2026.minWageHourly,
              weeklyHours: 25,
              fullAttendance: 1,
              deduction: 0,
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

        <KoWeeklyHolidayArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
