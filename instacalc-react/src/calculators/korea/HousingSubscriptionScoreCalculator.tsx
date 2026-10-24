import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateHousingSubscriptionScore } from "@/engines/korea-extended";
import { KoHousingSubscriptionScoreArticle } from "@/components/articles/ko/KoHousingSubscriptionScoreArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function HousingSubscriptionScoreCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    homelessYears: 7,
    dependentsCount: 2,
    accountYears: 8,
  });

  const result = useMemo(
    () =>
      calculateHousingSubscriptionScore({
        homelessYears: s.homelessYears,
        dependentsCount: s.dependentsCount,
        accountYears: s.accountYears,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const fields: FieldSpec[] = [
    {
      key: "homelessYears",
      label: "무주택 기간 (만 30세 또는 혼인신고일 기준)",
      value: s.homelessYears,
      min: 0,
      max: 20,
      step: 1,
      slider: { min: 0, max: 15, step: 1 },
      chips: [0, 1, 3, 5, 10, 15].map((y) => ({
        label: y === 0 ? "1년 미만" : y >= 15 ? "15년 이상" : `${y}년`,
        value: y,
      })),
    },
    {
      key: "dependentsCount",
      label: "부양가족 수 (본인 제외 주민등록등본 등재 세대원)",
      value: s.dependentsCount,
      min: 0,
      max: 6,
      step: 1,
      chips: [0, 1, 2, 3, 4, 5, 6].map((c) => ({
        label: c === 0 ? "0명 (본인 단독)" : c >= 6 ? "6명 이상" : `${c}명`,
        value: c,
      })),
    },
    {
      key: "accountYears",
      label: "청약통장 가입기간 (주택청약종합저축 등)",
      value: s.accountYears,
      min: 0,
      max: 20,
      step: 1,
      slider: { min: 0, max: 15, step: 1 },
      chips: [0.5, 1, 3, 5, 10, 15].map((y) => ({
        label: y < 1 ? "6개월~1년" : y >= 15 ? "15년 이상" : `${y}년`,
        value: y,
      })),
    },
  ];

  const rows = [
    { k: "무주택 기간 가점", v: `${result.homelessScore}점 / 32점 만점` },
    { k: "부양가족 수 가점", v: `${result.dependentsScore}점 / 35점 만점` },
    { k: "청약통장 가입기간 가점", v: `${result.accountScore}점 / 17점 만점` },
    { k: "총 청약 가점 합계", v: `${result.totalScore}점 / 84점 만점` },
    { k: "당첨 가능 권역 진단", v: result.gradeEvaluation },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="주택청약 종합 진단"
          points={[
            "한국부동산원 청약홈 84점 만점 표준 산정식 준수",
            "무주택기간(32점)·부양가족(35점)·통장가입(17점) 실시간 산정",
            "수도권·서울 핵심 단지 당첨 안정권 진단 리포트",
            "특별공급 vs 일반공급 전략 제안",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="housing-subscription-score-calculator"
          title="주택청약 가점 계산 및 당첨권 진단"
          summary={{
            label: "내 청약 가점 총점",
            value: `${result.totalScore}점`,
          }}
          onReset={() =>
            setS({
              homelessYears: 7,
              dependentsCount: 2,
              accountYears: 8,
            })
          }
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
          results={
            <>
              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.k}>
                    <span className="kv-key">{r.k}</span>
                    <span className="kv-value">{r.v}</span>
                  </li>
                ))}
              </ul>
              <BreakdownDonutChart
                locale={seo.locale}
                centerLabel="가점 구성"
                items={[
                  { label: "부양가족", value: result.dependentsScore, color: "#0284c7" },
                  { label: "무주택기간", value: result.homelessScore, color: "#10b981" },
                  { label: "통장가입", value: result.accountScore, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoHousingSubscriptionScoreArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
