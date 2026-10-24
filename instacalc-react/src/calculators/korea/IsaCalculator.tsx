import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateIsaSavings, type IsaAccountType } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoIsaArticle } from "@/components/articles/ko/KoIsaArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function IsaCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    netProfit: 10_000_000,
    accountType: 0, // 0: general (200만), 1: ruralOrLowIncome (400만)
  });

  const accountTypeMap: IsaAccountType[] = ["general", "ruralOrLowIncome"];

  const result = useMemo(
    () =>
      calculateIsaSavings({
        netProfit: s.netProfit,
        accountType: accountTypeMap[s.accountType],
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "netProfit",
      label: "계좌 내 순 투자수익 (배당+이자+차익, 원)",
      value: s.netProfit,
      min: 0,
      max: 500_000_000,
      step: 500_000,
      slider: { min: 500_000, max: 50_000_000, step: 500_000 },
      chips: [2_000_000, 4_000_000, 10_000_000, 20_000_000, 30_000_000].map((v) => ({
        label: `${v / 10_000}만원`,
        value: v,
      })),
    },
    {
      key: "accountType",
      label: "ISA 계좌 가입 유형",
      value: s.accountType,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "일반형 (비과세 200만원)", value: 0 },
        { label: "서민형 / 농어민형 (비과세 400만원)", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "총 투자 순수익", v: `₩${n(result.netProfit)}` },
    { k: "비과세 인정 수익", v: `₩${n(result.taxExemptProfit)} (한도 ₩${n(result.exemptionLimit)})` },
    { k: "분리과세 대상 초과수익", v: `₩${n(result.taxableExcess)}` },
    { k: "ISA 계좌 세금 (9.9% 분리과세)", v: `₩${n(result.isaTax)}` },
    { k: "일반 계좌 세금 (15.4% 배당소득세)", v: `₩${n(result.regularTax)}` },
    { k: "세금 절감 비율", v: `${result.taxSavedRatio}% 절세` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="중개형 ISA 절세 계산기"
          points={["일반형 200만 vs 서민형 400만 비과세 자동 적용", "초과분 9.9% 분리과세(금융소득종합과세 제외)", "일반 위탁계좌 대비 절세 금액 즉시 비교", "수익 구간별 절세 시뮬레이션 표"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="isa-calculator"
          title="중개형 ISA 비과세 및 절세 혜택 계산기"
          summary={{ label: "총 절약한 세금 (절세액)", value: `₩${n(result.taxSaved)}` }}
          onReset={() =>
            setS({
              netProfit: 10_000_000,
              accountType: 0,
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
                centerLabel="수익 배분"
                items={[
                  { label: "비과세 수익", value: result.taxExemptProfit, color: "#10b981" },
                  { label: "분리과세 순수익", value: Math.max(0, result.taxableExcess - result.isaTax), color: "#0284c7" },
                  ...(result.isaTax > 0 ? [{ label: "ISA 세금(9.9%)", value: result.isaTax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="수익 규모별 일반 위탁계좌 vs ISA 절세액 비교"
            head={["투자 순수익", "일반계좌 세금 (15.4%)", "ISA 세금 (9.9%)", "절약한 세금"]}
            rows={result.profitTiers.map((pt) => [
              pt.profitLabel,
              `₩${n(pt.regularTax)}`,
              `₩${n(pt.isaTax)}`,
              `₩${n(pt.savings)}`,
            ])}
          />
        </CalculatorShell>

        <KoIsaArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
