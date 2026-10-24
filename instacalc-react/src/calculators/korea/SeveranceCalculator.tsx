import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { DateField } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSeverance } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoSeveranceArticle } from "@/components/articles/ko/KoSeveranceArticle";

export default function SeveranceCalculator({ seo }: { seo: SeoRecord }) {
  const [dates, setDates] = useState({
    start: "2023-01-01",
    end: "2026-01-01",
  });

  const [s, setS] = useState({
    last3MonthsPay: 10_500_000,
    annualBonus: 4_000_000,
    annualLeavePay: 1_000_000,
    weeklyHours: 40,
  });

  const result = useMemo(
    () =>
      calculateSeverance({
        start: dates.start,
        end: dates.end,
        last3MonthsPay: s.last3MonthsPay,
        annualBonus: s.annualBonus,
        annualLeavePay: s.annualLeavePay,
        weeklyHours: s.weeklyHours,
      }),
    [dates, s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "last3MonthsPay",
      label: "퇴직 전 3개월 기본급 및 고정수당 총액",
      value: s.last3MonthsPay,
      min: 0,
      max: 100_000_000,
      step: 100_000,
      slider: { min: 3_000_000, max: 30_000_000, step: 500_000 },
      chips: [6_000_000, 9_000_000, 12_000_000, 15_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "annualBonus",
      label: "연간 정기 상여금 총액 (3/12 안분 반영)",
      value: s.annualBonus,
      min: 0,
      max: 100_000_000,
      step: 100_000,
      chips: [0, 2_000_000, 4_000_000, 6_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "annualLeavePay",
      label: "미사용 연차유급휴가 수당 (3/12 안분 반영)",
      value: s.annualLeavePay,
      min: 0,
      max: 20_000_000,
      step: 100_000,
      chips: [0, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "weeklyHours",
      label: "1주일 소정근로시간",
      value: s.weeklyHours,
      min: 1,
      max: 60,
      step: 1,
      chips: [15, 20, 30, 40].map((v) => ({ label: `${v}시간`, value: v })),
    },
  ];

  const rows = [
    { k: "총 계속근로일수", v: `${result.employedDays}일 (약 ${result.years.toFixed(2)}년)` },
    { k: "법정 퇴직금 수급 자격", v: result.eligible ? "수급 요건 충족 (1년 이상 & 주 15시간 이상)" : "수급 요건 미달" },
    { k: "1일 평균임금 산정액", v: `₩${n(Math.round(result.avgDailyWage))}` },
    { k: "상여금 안분액 (3개월분)", v: `₩${n(Math.round(result.bonusShare))}` },
    { k: "연차수당 안분액 (3개월분)", v: `₩${n(Math.round(result.leaveShare))}` },
    { k: "30일분 법정 평균임금", v: `₩${n(Math.round(result.avgDailyWage * 30))}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="법정 퇴직금 계산기"
          points={["1일 평균임금 자동 산정", "상여금·연차수당 3/12 안분", "재직일수 및 수급 자격 검증", "노동청 기준 계산식 적용"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="severance-calculator"
          title="근로기준법 기준 퇴직금 계산"
          summary={{ label: "예상 법정 퇴직금", value: `₩${n(result.severance)}` }}
          onReset={() => {
            setDates({ start: "2023-01-01", end: "2026-01-01" });
            setS({
              last3MonthsPay: 10_500_000,
              annualBonus: 4_000_000,
              annualLeavePay: 1_000_000,
              weeklyHours: 40,
            });
          }}
          inputs={
            <>
              <DateField
                label="입사일 (근로 시작일)"
                value={dates.start}
                onChange={(iso) => setDates((d) => ({ ...d, start: iso }))}
              />
              <DateField
                label="퇴사일 (마지막 근무일 다음 날)"
                value={dates.end}
                onChange={(iso) => setDates((d) => ({ ...d, end: iso }))}
              />
              {fields.map((f) => (
                <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />
              ))}
            </>
          }
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

        <KoSeveranceArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
