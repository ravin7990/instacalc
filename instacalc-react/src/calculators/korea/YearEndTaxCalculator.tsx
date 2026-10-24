import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateYearEndTax } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoYearEndTaxArticle } from "@/components/articles/ko/KoYearEndTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function YearEndTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    annualGrossSalary: 50_000_000,
    creditCard: 15_000_000,
    debitCard: 7_000_000,
    traditionalMarketTransit: 1_000_000,
  });

  const result = useMemo(
    () =>
      calculateYearEndTax({
        annualGrossSalary: s.annualGrossSalary,
        creditCard: s.creditCard,
        debitCard: s.debitCard,
        traditionalMarketTransit: s.traditionalMarketTransit,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "annualGrossSalary",
      label: "연간 총급여액 (근로소득, 원)",
      value: s.annualGrossSalary,
      min: 10_000_000,
      max: 300_000_000,
      step: 1_000_000,
      slider: { min: 20_000_000, max: 120_000_000, step: 1_000_000 },
      chips: [30_000_000, 45_000_000, 50_000_000, 70_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "creditCard",
      label: "신용카드 연간 사용액 (원)",
      value: s.creditCard,
      min: 0,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 0, max: 40_000_000, step: 500_000 },
      chips: [5_000_000, 10_000_000, 15_000_000, 20_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "debitCard",
      label: "체크카드 및 현금영수증 사용액 (원)",
      value: s.debitCard,
      min: 0,
      max: 100_000_000,
      step: 500_000,
      slider: { min: 0, max: 40_000_000, step: 500_000 },
      chips: [3_000_000, 5_000_000, 7_000_000, 10_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "traditionalMarketTransit",
      label: "전통시장 및 대중교통 이용액 (원)",
      value: s.traditionalMarketTransit,
      min: 0,
      max: 20_000_000,
      step: 100_000,
      slider: { min: 0, max: 5_000_000, step: 100_000 },
      chips: [0, 500_000, 1_000_000, 2_000_000].map((v) => ({
        label: v === 0 ? "0원" : `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "총 카드 및 현금 지출액", v: `₩${n(result.totalUsage)}` },
    { k: "소득공제 문턱 (총급여의 25%)", v: `₩${n(result.minimumThreshold)}` },
    { k: "문턱 초과 공제대상 사용액", v: `₩${n(result.excessUsage)}` },
    { k: "신용카드 공제분 (15%)", v: `₩${n(result.creditCardDeduction)}` },
    { k: "체크카드·현금 공제분 (30%)", v: `₩${n(result.debitCardDeduction)}` },
    { k: "전통시장·교통 공제분 (40%)", v: `₩${n(result.marketTransitDeduction)}` },
    { k: "적용 추정 소득세율", v: `약 ${result.marginalTaxRate}% 구간` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="연말정산 카드 소득공제 계산기"
          points={["총급여 25% 공제 문턱 자동 산정", "신용카드 15% vs 체크카드 30% 차등 반영", "전통시장 및 대중교통 40% 추가 공제", "예상 소득공제액 및 절세 환급액 산출"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="year-end-tax-calculator"
          title="연말정산 신용카드·체크카드 소득공제 및 환급금 계산기"
          summary={{ label: "최종 인정 소득공제 금액", value: `₩${n(result.totalDeduction)}` }}
          onReset={() =>
            setS({
              annualGrossSalary: 50_000_000,
              creditCard: 15_000_000,
              debitCard: 7_000_000,
              traditionalMarketTransit: 1_000_000,
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
                centerLabel="소득공제 인정액"
                items={[
                  ...(result.creditCardDeduction > 0
                    ? [{ label: "신용카드(15%)", value: result.creditCardDeduction, color: "#0284c7" }]
                    : []),
                  ...(result.debitCardDeduction > 0
                    ? [{ label: "체크·현금(30%)", value: result.debitCardDeduction, color: "#10b981" }]
                    : []),
                  ...(result.marketTransitDeduction > 0
                    ? [{ label: "전통시장·교통(40%)", value: result.marketTransitDeduction, color: "#f59e0b" }]
                    : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="결제 수단별 사용 금액 및 소득공제율 비교"
            head={["결제 수단", "소득공제율", "사용 금액", "공제 계산금액"]}
            rows={result.methodsComparison.map((m) => [
              m.method,
              m.rateLabel,
              `₩${n(m.amount)}`,
              `₩${n(m.deduction)}`,
            ])}
          />
        </CalculatorShell>

        <KoYearEndTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
