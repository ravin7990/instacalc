import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculatePensionIrpTaxCredit } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoPensionSavingsIrpArticle } from "@/components/articles/ko/KoPensionSavingsIrpArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function PensionSavingsIrpCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    grossSalary: 50_000_000,
    pensionSavingsDeposit: 6_000_000,
    irpDeposit: 3_000_000,
  });

  const result = useMemo(
    () =>
      calculatePensionIrpTaxCredit({
        grossSalary: s.grossSalary,
        pensionSavingsDeposit: s.pensionSavingsDeposit,
        irpDeposit: s.irpDeposit,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "grossSalary",
      label: "연간 총급여액 (근로자) / 종합소득금액",
      value: s.grossSalary,
      min: 10_000_000,
      max: 300_000_000,
      step: 1_000_000,
      slider: { min: 20_000_000, max: 120_000_000, step: 1_000_000 },
      chips: [35_000_000, 50_000_000, 55_000_000, 70_000_000, 100_000_000].map((v) => ({
        label: `${v / 10_000_000}천만원`,
        value: v,
      })),
    },
    {
      key: "pensionSavingsDeposit",
      label: "연금저축(펀드/신탁/보험) 연간 납입액 (한도 600만)",
      value: s.pensionSavingsDeposit,
      min: 0,
      max: 10_000_000,
      step: 500_000,
      slider: { min: 0, max: 6_000_000, step: 500_000 },
      chips: [0, 2_000_000, 4_000_000, 6_000_000].map((v) => ({
        label: v === 0 ? "0원" : `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "irpDeposit",
      label: "개인형 퇴직연금(IRP) 연간 납입액 (합산 900만 한도)",
      value: s.irpDeposit,
      min: 0,
      max: 10_000_000,
      step: 500_000,
      slider: { min: 0, max: 9_000_000, step: 500_000 },
      chips: [0, 3_000_000, 6_000_000, 9_000_000].map((v) => ({
        label: v === 0 ? "0원" : `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "연금저축 공제 인정액", v: `₩${n(result.pensionSavingsEligible)} (최대 600만원)` },
    { k: "IRP 공제 인정액", v: `₩${n(result.irpEligible)} (합산 한도 내)` },
    { k: "총 세액공제 대상 인정금액", v: `₩${n(result.totalEligible)} (최대 900만원)` },
    { k: "적용 세액공제율", v: `${result.creditRate}% (${s.grossSalary <= 55_000_000 ? "5,500만원 이하 우대" : "5,500만원 초과"})` },
    { k: "실질 자부담 납입액", v: `₩${n(result.netContribution)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="연금저축 & IRP 세액공제 계산기"
          points={["연 900만원(연금저축 600만+IRP 300만) 한도 반영", "16.5% vs 13.2% 소득별 세액공제율 자동 적용", "연말정산 13월의 월급 환급액 즉시 산출", "납입 구간별 절세 시뮬레이션 표"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="pension-savings-irp-calculator"
          title="연금저축 및 IRP 연말정산 세액공제 환급금 계산기"
          summary={{ label: "연말정산 예상 세액공제 환급액", value: `₩${n(result.taxRefund)}` }}
          onReset={() =>
            setS({
              grossSalary: 50_000_000,
              pensionSavingsDeposit: 6_000_000,
              irpDeposit: 3_000_000,
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
                centerLabel="납입금 결산"
                items={[
                  { label: "실질 부담액", value: result.netContribution, color: "#0284c7" },
                  { label: "세액공제 환급액", value: result.taxRefund, color: "#10b981" },
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="납입액별 급여 구간에 따른 연말정산 환급액 비교"
            head={["총 납입액", "총급여 5,500만 이하 (16.5%)", "총급여 5,500만 초과 (13.2%)"]}
            rows={result.depositTiers.map((dt) => [
              dt.depositLabel,
              `₩${n(dt.lowIncomeRefund)}`,
              `₩${n(dt.highIncomeRefund)}`,
            ])}
          />
        </CalculatorShell>

        <KoPensionSavingsIrpArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
