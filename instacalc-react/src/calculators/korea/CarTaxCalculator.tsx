import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCarTax } from "@/engines/korea-finance";
import { formatNumber } from "@/lib/currency";
import { KoCarTaxArticle } from "@/components/articles/ko/KoCarTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";

export default function CarTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    displacementCc: 1998,
    carAgeYears: 3,
    prepayMonth: 1 as 0 | 1 | 3 | 6 | 9,
    vehiclePrice: 35_000_000,
  });

  const result = useMemo(
    () =>
      calculateCarTax({
        displacementCc: s.displacementCc,
        carAgeYears: s.carAgeYears,
        prepayMonth: s.prepayMonth,
        vehiclePrice: s.vehiclePrice,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "displacementCc",
      label: "엔진 배기량 (cc)",
      value: s.displacementCc,
      min: 500,
      max: 6_000,
      step: 50,
      slider: { min: 800, max: 3_500, step: 50 },
      chips: [
        { label: "998cc (경차)", value: 998 },
        { label: "1,598cc (아반떼/코나)", value: 1598 },
        { label: "1,998cc (쏘나타/스포티지)", value: 1998 },
        { label: "2,497cc (그랜저)", value: 2497 },
        { label: "3,470cc (카니발/G80)", value: 3470 },
      ],
    },
    {
      key: "carAgeYears",
      label: "차령 (차량 연식, 년수)",
      value: s.carAgeYears,
      min: 1,
      max: 20,
      step: 1,
      chips: [
        { label: "1년 (신차, 0% 경감)", value: 1 },
        { label: "3년 (5% 경감)", value: 3 },
        { label: "5년 (15% 경감)", value: 5 },
        { label: "7년 (25% 경감)", value: 7 },
        { label: "12년 이상 (최대 50% 경감)", value: 12 },
      ],
    },
    {
      key: "prepayMonth",
      label: "연납 신청 시기 (할인율)",
      value: s.prepayMonth,
      min: 0,
      max: 9,
      step: 1,
      chips: [
        { label: "1월 연납 (5% 할인)", value: 1 },
        { label: "3월 연납 (3.75% 할인)", value: 3 },
        { label: "6월 연납 (2.5% 할인)", value: 6 },
        { label: "정기분 납부 (0% 할인)", value: 0 },
      ],
    },
    {
      key: "vehiclePrice",
      label: "차량 취득가격 (취등록세 7% 계산용, 원)",
      value: s.vehiclePrice,
      min: 0,
      max: 300_000_000,
      step: 1_000_000,
      slider: { min: 0, max: 100_000_000, step: 1_000_000 },
      chips: [0, 20_000_000, 35_000_000, 50_000_000, 80_000_000].map((v) => ({
        label: v === 0 ? "차세만 계산" : `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const rows = [
    { k: "배기량 기준 연간 기본본세", v: `₩${n(result.baseAnnualTax)}` },
    { k: "차령 경감 할인율", v: `${result.ageDiscountRate}% 감면` },
    { k: "차령 경감 후 연간 본세", v: `₩${n(result.discountedBaseTax)}` },
    { k: "지방교육세 (본세의 30%)", v: `₩${n(result.educationTax)}` },
    { k: "정상 연간 자동차세 합계", v: `₩${n(result.regularTotalTax)}` },
    { k: "연납 신청 할인 절약액", v: `-₩${n(result.prepayDiscountAmount)} (${result.prepayDiscountRate}% 할인)` },
    ...(result.registrationTax > 0 ? [{ k: "차량 취등록세 (7%)", v: `₩${n(result.registrationTax)}` }] : []),
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="2026 자동차세 연납 계산기"
          points={["배기량별 본세 및 지방교육세 30% 산출", "1월 연납 신청 시 5% 할인 세액 반영", "차령 3년차부터 매년 5% 최대 50% 경감", "차량 구매 취등록세(7%) 동시 계산"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="car-tax-calculator"
          title="2026년 자동차세 연납 할인 및 취등록세 계산기"
          summary={{ label: "연납 할인 적용 최종 자동차세", value: `₩${n(result.finalCarTax)}` }}
          onReset={() =>
            setS({
              displacementCc: 1998,
              carAgeYears: 3,
              prepayMonth: 1,
              vehiclePrice: 35_000_000,
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
                centerLabel="연간 자동차세"
                items={[
                  { label: "최종 납부 자동차세", value: result.finalCarTax, color: "#0284c7" },
                  ...(result.prepayDiscountAmount > 0
                    ? [{ label: "연납 할인액", value: result.prepayDiscountAmount, color: "#10b981" }]
                    : []),
                ]}
              />
            </>
          }
        >
          <ProjectionTable
            caption="연납 신청 월별 할인율 및 최종 납부세액 비교"
            head={["신청 월", "할인율", "납부 세액", "절약 금액"]}
            rows={result.prepayComparison.map((pc) => [
              pc.monthLabel,
              pc.discountRateLabel,
              `₩${n(pc.finalTax)}`,
              pc.saved > 0 ? `₩${n(pc.saved)}` : "-",
            ])}
          />
        </CalculatorShell>

        <KoCarTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
