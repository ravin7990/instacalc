import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateYouthLeap, type YouthIncomeBracket } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoYouthLeapArticle } from "@/components/articles/ko/KoYouthLeapArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function YouthLeapCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    monthlyDeposit: 700_000,
    incomeBracket: 0, // 0: under24m, 1: under36m, 2: under48m, 3: under60m, 4: under75m
    annualRate: 6.0,
  });

  const bracketMap: YouthIncomeBracket[] = ["under24m", "under36m", "under48m", "under60m", "under75m"];

  const result = useMemo(
    () =>
      calculateYouthLeap({
        monthlyDeposit: s.monthlyDeposit,
        incomeBracket: bracketMap[s.incomeBracket],
        annualRate: s.annualRate,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "monthlyDeposit",
      label: "월 납입 금액 (10만 ~ 70만원)",
      value: s.monthlyDeposit,
      min: 100_000,
      max: 700_000,
      step: 50_000,
      slider: { min: 100_000, max: 700_000, step: 50_000 },
      chips: [300_000, 400_000, 500_000, 700_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "incomeBracket",
      label: "개인소득 총급여 구간",
      value: s.incomeBracket,
      min: 0,
      max: 4,
      step: 1,
      chips: [
        { label: "2,400만 이하 (최대 2.4만)", value: 0 },
        { label: "3,600만 이하 (최대 2.3만)", value: 1 },
        { label: "4,800만 이하 (최대 2.2만)", value: 2 },
        { label: "6,000만 이하 (최대 2.1만)", value: 3 },
        { label: "7,500만 이하 (비과세만)", value: 4 },
      ],
    },
    {
      key: "annualRate",
      label: "은행 약정금리 (기본+우대, %)",
      value: s.annualRate,
      min: 3.0,
      max: 8.0,
      step: 0.1,
      chips: [
        { label: "5.0%", value: 5.0 },
        { label: "5.5%", value: 5.5 },
        { label: "6.0%", value: 6.0 },
      ],
    },
  ];

  const rows = [
    { k: "5년 총 본인 납입원금", v: `₩${n(result.totalDeposit)}` },
    { k: "매월 정부 매칭 기여금", v: `₩${n(result.monthlyGovMatch)}` },
    { k: "5년 총 정부 기여금", v: `₩${n(result.totalGovMatch)}` },
    { k: "비과세 이자 합계", v: `₩${n(result.taxExemptInterest)}` },
    { k: "일반 과세 적금 대비 추가 이득", v: `+₩${n(result.benefitDiff)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 청년도약계좌 계산기"
          points={["소득구간별 정부기여금 매칭 계산", "15.4% 비과세 혜택 자동 반영", "5년 만기 5,000만원 형성 플랜", "일반 적금 대비 추가 수혜액 비교"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="youth-leap-calculator"
          title="2026년 청년도약계좌 만기 예상 수령액 및 혜택 계산기"
          summary={{ label: "5년 만기 예상 실수령액", value: `₩${n(result.totalReturn)}` }}
          onReset={() =>
            setS({
              monthlyDeposit: 700_000,
              incomeBracket: 0,
              annualRate: 6.0,
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
                centerLabel="만기 자산 구성"
                items={[
                  { label: "본인 납입금", value: result.totalDeposit, color: "#0284c7" },
                  { label: "비과세 이자", value: result.taxExemptInterest, color: "#10b981" },
                  ...(result.totalGovMatch > 0 ? [{ label: "정부 기여금", value: result.totalGovMatch, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="청년도약계좌 연차별 누적 자산 형성 스케줄"
            head={["경과 기간", "본인 납입 누계", "정부기여금 누계", "이자 누계", "총 형성 자산"]}
            rows={result.annualProgress.map((ap) => [
              `${ap.year}년차`,
              `₩${n(ap.depositSum)}`,
              `₩${n(ap.govMatchSum)}`,
              `₩${n(ap.interestSum)}`,
              `₩${n(ap.balance)}`,
            ])}
          />
        </CalculatorShell>

        <KoYouthLeapArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
