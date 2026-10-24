import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateElectricityBill } from "@/engines/korea-extended";
import { formatNumber } from "@/lib/currency";
import { KoElectricityBillArticle } from "@/components/articles/ko/KoElectricityBillArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function ElectricityBillCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    voltageType: "low" as "low" | "high",
    season: "summer" as "summer" | "other",
    kwhUsage: 350,
  });

  const result = useMemo(
    () =>
      calculateElectricityBill({
        voltageType: s.voltageType,
        season: s.season,
        kwhUsage: s.kwhUsage,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "kwhUsage",
      label: "월간 전력 사용량 (kWh)",
      value: s.kwhUsage,
      min: 0,
      max: 2000,
      step: 10,
      slider: { min: 50, max: 800, step: 10 },
      chips: [150, 250, 350, 450, 600].map((k) => ({ label: `${k} kWh`, value: k })),
    },
    {
      key: "voltageType",
      label: "전기 계약 종별 (저압 vs 고압)",
      value: s.voltageType === "low" ? 0 : 1,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "주택용 저압 (단독·다세대·빌라)", value: 0 },
        { label: "주택용 고압 (대단지 아파트)", value: 1 },
      ],
    },
    {
      key: "season",
      label: "계절 구분 (하계 에어컨 누진제 완화)",
      value: s.season === "summer" ? 0 : 1,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "하계 (7월 ~ 8월, 300·450kWh 기준)", value: 0 },
        { label: "기타 계절 (봄·가을·겨울, 200·400kWh 기준)", value: 1 },
      ],
    },
  ];

  const handleFieldChange = (key: string) => (val: number) => {
    if (key === "voltageType") {
      set("voltageType")(val === 0 ? "low" : "high");
    } else if (key === "season") {
      set("season")(val === 0 ? "summer" : "other");
    } else {
      set(key as keyof typeof s)(val);
    }
  };

  const rows = [
    { k: "도달한 누진 단계", v: `${result.tierReached}단계 누진율 적용` },
    { k: "기본요금", v: `₩${n(result.baseFee)}` },
    { k: "전력량요금 (사용량 구간 합산)", v: `₩${n(result.energyFee)}` },
    { k: "기후환경요금 (kWh당 9원)", v: `₩${n(result.climateFee)}` },
    { k: "연료비조정액 (kWh당 5원)", v: `₩${n(result.fuelAdjustmentFee)}` },
    { k: "전기요금 소계", v: `₩${n(result.subtotal)}` },
    { k: "부가가치세 (10%)", v: `₩${n(result.vat)}` },
    { k: "전력산업기반기금 (3.7%)", v: `₩${n(result.fund)}` },
    { k: "최종 청구금액 (10원 미만 절사)", v: `₩${n(result.totalBill)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="한국전력 한전ON 기준"
          points={[
            "하계(7~8월) 300·450kWh 누진 구간 확대 완화 적용",
            "주택용 저압(빌라) vs 고압(아파트) 요율 차등 산출",
            "기후환경요금 및 연료비조정액 정확 합산",
            "부가세(10%)와 전력산업기반기금(3.7%) 법정 요금 반영",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="electricity-bill-calculator"
          title="전기요금 누진세 모의계산"
          summary={{
            label: "예상 최종 청구 요금",
            value: `₩${n(result.totalBill)}`,
          }}
          onReset={() =>
            setS({
              voltageType: "low",
              season: "summer",
              kwhUsage: 350,
            })
          }
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={handleFieldChange(f.key)} />)}
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
                centerLabel="요금 구성"
                items={[
                  { label: "전력량요금", value: result.energyFee, color: "#0284c7" },
                  { label: "기본/기후/연료", value: result.baseFee + result.climateFee + result.fuelAdjustmentFee, color: "#10b981" },
                  { label: "세금 및 기금", value: result.vat + result.fund, color: "#f59e0b" },
                ]}
              />
            </>
          }
        />

        <KoElectricityBillArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
