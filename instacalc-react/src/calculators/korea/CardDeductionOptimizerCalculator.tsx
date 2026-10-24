import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCardDeductionOptimizer } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoCardDeductionOptimizerArticle } from "@/components/articles/ko/KoCardDeductionOptimizerArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function CardDeductionOptimizerCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    annualSalary: 50_000_000,
    creditCardSpend: 15_000_000,
    debitCardSpend: 10_000_000,
    publicTransitSpend: 1_200_000,
    traditionalMarketSpend: 800_000,
  });

  const result = useMemo(
    () =>
      calculateCardDeductionOptimizer({
        annualSalary: s.annualSalary,
        creditCardSpend: s.creditCardSpend,
        debitCardSpend: s.debitCardSpend,
        publicTransitSpend: s.publicTransitSpend,
        traditionalMarketSpend: s.traditionalMarketSpend,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "annualSalary",
      label: "연간 총급여액 (세전 연봉)",
      value: s.annualSalary,
      min: 15_000_000,
      max: 200_000_000,
      step: 1_000_000,
      slider: { min: 25_000_000, max: 120_000_000, step: 1_000_000 },
      chips: [35_000_000, 50_000_000, 70_000_000, 85_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "creditCardSpend",
      label: "신용카드 연간 사용액 (15% 공제)",
      value: s.creditCardSpend,
      min: 0,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 0, max: 40_000_000, step: 500_000 },
      chips: [10_000_000, 15_000_000, 20_000_000, 30_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "debitCardSpend",
      label: "체크카드 및 현금영수증 사용액 (30% 공제)",
      value: s.debitCardSpend,
      min: 0,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 0, max: 40_000_000, step: 500_000 },
      chips: [5_000_000, 10_000_000, 15_000_000, 25_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "publicTransitSpend",
      label: "대중교통 이용액 (40% 공제)",
      value: s.publicTransitSpend,
      min: 0,
      max: 10_000_000,
      step: 100_000,
      chips: [600_000, 1_200_000, 1_800_000, 2_400_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "traditionalMarketSpend",
      label: "전통시장 이용액 (40% 공제)",
      value: s.traditionalMarketSpend,
      min: 0,
      max: 10_000_000,
      step: 100_000,
      chips: [0, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "총급여 25% 공제 문턱 금액", v: `₩${n(result.thresholdAmount)} (이 금액까지는 공제액 0원)` },
    { k: "총 카드 및 현금 지출액", v: `₩${n(result.totalSpend)}` },
    { k: "문턱 도달 여부", v: result.isThresholdMet ? "달성 완료 (초과분 공제 적용)" : "미달 (더 지출 필요)" },
    { k: "신용카드 소득공제액", v: `₩${n(result.creditDeduction)}` },
    { k: "체크카드·현금영수증 소득공제액", v: `₩${n(result.debitDeduction)}` },
    { k: "전통시장·대중교통 추가 공제액", v: `₩${n(result.extraDeduction)}` },
    { k: "법정 기본 공제 한도", v: `₩${n(result.maxDeductionLimit)}` },
    { k: "최종 반영 소득공제 합계", v: `₩${n(result.actualDeductionAmount)}` },
    { k: "예상 세금 환급액 (16.5% 기준)", v: `약 ₩${n(result.estimatedTaxRefund)} 환급` },
    { k: "황금비율 맞춤 조언", v: result.optimalAdvice },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="연말정산 절세 시뮬레이터"
          points={[
            "총급여 25% 공제 문턱 도달 여부 실시간 진단",
            "신용카드(15%) vs 체크카드(30%) 2배 공제율 최적화",
            "전통시장·대중교통 40% 추가 공제 한도 반영",
            "세율별 예상 세금 환급액 원클릭 계산",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="card-deduction-optimizer-calculator"
          title="신용카드 vs 체크카드 소득공제 황금비율 계산"
          summary={{
            label: "최종 인정 소득공제액",
            value: `₩${n(result.actualDeductionAmount)}`,
          }}
          onReset={() =>
            setS({
              annualSalary: 50_000_000,
              creditCardSpend: 15_000_000,
              debitCardSpend: 10_000_000,
              publicTransitSpend: 1_200_000,
              traditionalMarketSpend: 800_000,
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
                centerLabel="공제 구성"
                items={[
                  { label: "체크카드(30%)", value: result.debitDeduction, color: "#10b981" },
                  { label: "신용카드(15%)", value: result.creditDeduction, color: "#0284c7" },
                  { label: "전통시장/교통(40%)", value: result.extraDeduction, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoCardDeductionOptimizerArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
