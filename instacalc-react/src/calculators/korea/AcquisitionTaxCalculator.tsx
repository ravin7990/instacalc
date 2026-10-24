import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateAcquisitionTax } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoAcquisitionTaxArticle } from "@/components/articles/ko/KoAcquisitionTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function AcquisitionTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    price: 600_000_000,
    homesAfter: 1,
    regulated: 0, // 0: no, 1: yes
    over85: 0, // 0: under 85m2, 1: over 85m2
    firstTimeBuyer: 0, // 0: no, 1: yes
  });

  const result = useMemo(
    () =>
      calculateAcquisitionTax({
        price: s.price,
        homesAfter: s.homesAfter,
        regulated: s.regulated === 1,
        over85: s.over85 === 1,
        firstTimeBuyer: s.firstTimeBuyer === 1,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "price",
      label: "주택 매매 취득가액",
      value: s.price,
      min: 10_000_000,
      max: 5_000_000_000,
      step: 10_000_000,
      slider: { min: 100_000_000, max: 2_000_000_000, step: 10_000_000 },
      chips: [300_000_000, 600_000_000, 900_000_000, 1_200_000_000, 1_500_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "homesAfter",
      label: "취득 후 세대 총 주택 수 (본 주택 포함)",
      value: s.homesAfter,
      min: 1,
      max: 5,
      step: 1,
      chips: [
        { label: "1주택 (무주택자)", value: 1 },
        { label: "2주택 (일시적 2주택)", value: 2 },
        { label: "3주택", value: 3 },
        { label: "4주택 이상", value: 4 },
      ],
    },
    {
      key: "regulated",
      label: "조정대상지역 여부 (강남3구·용산구 등)",
      value: s.regulated,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "비규제지역 (일반)", value: 0 },
        { label: "조정대상지역", value: 1 },
      ],
    },
    {
      key: "over85",
      label: "주택 전용면적 규모 (85㎡ 기준)",
      value: s.over85,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "85㎡ 이하 (국민주택규모)", value: 0 },
        { label: "85㎡ 초과 (대형)", value: 1 },
      ],
    },
    {
      key: "firstTimeBuyer",
      label: "생애최초 주택 구입 감면 대상 여부",
      value: s.firstTimeBuyer,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "해당 없음 (일반)", value: 0 },
        { label: "생애최초 주택 구입", value: 1 },
      ],
    },
  ];

  const rows = [
    { k: "기본 취득세율", v: `${result.baseRatePercent}% ${result.surcharge ? "(다주택 중과세율 적용)" : "(일반세율)"}` },
    { k: "취득세 본세 (감면 후)", v: `₩${n(result.acquisitionTax)}` },
    { k: "지방교육세", v: `₩${n(result.educationTax)}` },
    { k: "농어촌특별세", v: `₩${n(result.ruralTax)}` },
    { k: "생애최초 감면 혜택", v: result.reduction > 0 ? `₩${n(result.reduction)} 감면 적용 (최대 200만원 한도)` : "감면 없음" },
    { k: "총 실효세율 (부대세 포함)", v: `${result.effectiveRatePercent}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="주택 취득세 계산기"
          points={["1~3% 기본세율 및 8~12% 중과세", "생애최초 200만원 감면 혜택", "지방교육세·농특세 원클릭 합산", "조정대상지역 다주택 규제 반영"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="acquisition-tax-calculator"
          title="주택 매매 취득세 및 부대세액 계산"
          summary={{ label: "총 납부세액 합계", value: `₩${n(result.total)}` }}
          onReset={() =>
            setS({
              price: 600_000_000,
              homesAfter: 1,
              regulated: 0,
              over85: 0,
              firstTimeBuyer: 0,
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
                centerLabel="총 납부세액"
                items={[
                  { label: "취득세", value: result.acquisitionTax, color: "#10b981" },
                  { label: "지방교육세", value: result.educationTax, color: "#0284c7" },
                  ...(result.ruralTax > 0 ? [{ label: "농어촌특별세", value: result.ruralTax, color: "#f59e0b" }] : []),
                ]}
              />
            </>
          }
        />

        <KoAcquisitionTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
