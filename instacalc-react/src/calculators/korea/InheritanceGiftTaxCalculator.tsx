import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateInheritanceGiftTax } from "@/engines/korea-extended";
import { formatNumber, formatKoreanWonText } from "@/lib/currency";
import { KoInheritanceGiftTaxArticle } from "@/components/articles/ko/KoInheritanceGiftTaxArticle";
import { BreakdownDonutChart } from "@/components/calculator/FinancialCharts";

export default function InheritanceGiftTaxCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    mode: "gift" as "gift" | "inheritance",
    assetValue: 300_000_000,
    debts: 0,
    relationship: "adultChild" as "spouse" | "adultChild" | "minorChild" | "otherRelative" | "nonRelative",
    priorGifts10Years: 0,
  });

  const result = useMemo(
    () =>
      calculateInheritanceGiftTax({
        mode: s.mode,
        assetValue: s.assetValue,
        debts: s.debts,
        relationship: s.relationship,
        priorGifts10Years: s.priorGifts10Years,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: any) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "mode",
      label: "과세 유형 구분",
      value: s.mode === "gift" ? 0 : 1,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "증여세 (생전 무상 이전)", value: 0 },
        { label: "상속세 (사망 후 상속)", value: 1 },
      ],
    },
    {
      key: "assetValue",
      label: "증여 / 상속 재산가액 (부동산 시가·예금·주식 등)",
      value: s.assetValue,
      min: 10_000_000,
      max: 10_000_000_000,
      step: 10_000_000,
      slider: { min: 50_000_000, max: 2_000_000_000, step: 10_000_000 },
      chips: [100_000_000, 300_000_000, 500_000_000, 1_000_000_000, 2_000_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "relationship",
      label: "수증자(상속인)와의 관계",
      value:
        s.relationship === "spouse"
          ? 0
          : s.relationship === "adultChild"
          ? 1
          : s.relationship === "minorChild"
          ? 2
          : s.relationship === "otherRelative"
          ? 3
          : 4,
      min: 0,
      max: 4,
      step: 1,
      chips: [
        { label: "배우자 (6억 공제)", value: 0 },
        { label: "성인 직계비속(자녀) (5천만 공제)", value: 1 },
        { label: "미성년 자녀 (2천만 공제)", value: 2 },
        { label: "기타 친족 (1천만 공제)", value: 3 },
      ],
    },
    {
      key: "debts",
      label: "채무액 (부담부증여 대출금·임차보증금 등)",
      value: s.debts,
      min: 0,
      max: 5_000_000_000,
      step: 10_000_000,
      chips: [0, 50_000_000, 100_000_000, 200_000_000, 500_000_000].map((v) => ({
        label: v === 0 ? "없음" : `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    {
      key: "priorGifts10Years",
      label: "최근 10년 이내 사전증여 재산가액",
      value: s.priorGifts10Years,
      min: 0,
      max: 2_000_000_000,
      step: 10_000_000,
      chips: [0, 30_000_000, 50_000_000, 100_000_000].map((v) => ({
        label: v === 0 ? "없음" : `${v / 10_000}만원`,
        value: v,
      })),
    },
  ];

  const handleFieldChange = (key: string) => (val: number) => {
    if (key === "mode") {
      set("mode")(val === 0 ? "gift" : "inheritance");
    } else if (key === "relationship") {
      const rels = ["spouse", "adultChild", "minorChild", "otherRelative", "nonRelative"] as const;
      set("relationship")(rels[val] ?? "adultChild");
    } else {
      set(key as keyof typeof s)(val);
    }
  };

  const rows = [
    { k: "과세 대상 재산가액", v: `₩${n(result.taxableAsset)} (${formatKoreanWonText(result.taxableAsset)})` },
    { k: "법정 재산공제액", v: `-₩${n(result.statutoryDeduction)} (${formatKoreanWonText(result.statutoryDeduction)})` },
    { k: "과세표준", v: `₩${n(result.taxBase)}` },
    { k: "적용 누진세율", v: `${result.applicableBracketRate}% (누진공제 ₩${n(result.progressiveDeduction)})` },
    { k: "산출세액", v: `₩${n(result.calculatedTax)}` },
    { k: "신고세액공제 (3% 감면)", v: `-₩${n(result.voluntaryFilingDiscount)}` },
    { k: "최종 납부할 세액", v: `₩${n(result.finalPayableTax)} (${formatKoreanWonText(result.finalPayableTax)})` },
    { k: "실효세율 (재산 대비 세부담)", v: `${result.effectiveRate}%` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="상속·증여 세무 시뮬레이터"
          points={[
            "배우자 6억·자녀 5천만 원 법정 면제한도 자동 반영",
            "10%~50% 5단계 누진세율표 정확 적용",
            "최근 10년 주기 사전증여 합산과세 반영",
            "기한 내 자진신고 3% 세액공제 혜택 산출",
          ]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="inheritance-gift-tax-calculator"
          title="증여세 및 상속세 모의계산"
          summary={{
            label: "최종 납부할 예상 세액",
            value: result.finalPayableTax === 0 ? "0원 (전액 면제)" : `₩${n(result.finalPayableTax)}`,
          }}
          onReset={() =>
            setS({
              mode: "gift",
              assetValue: 300_000_000,
              debts: 0,
              relationship: "adultChild",
              priorGifts10Years: 0,
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
                centerLabel="재산 분배"
                items={[
                  { label: "순수령 재산", value: Math.max(0, result.taxableAsset - result.finalPayableTax), color: "#10b981" },
                  { label: "납부 세액", value: result.finalPayableTax, color: "#ef4444" },
                ]}
              />
            </>
          }
        />

        <KoInheritanceGiftTaxArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
