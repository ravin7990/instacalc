import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateBrokerage, type DealType, type PropertyKind } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoBrokerageArticle } from "@/components/articles/ko/KoBrokerageArticle";

export default function BrokerageCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    deal: 0, // 0: 매매, 1: 전세, 2: 월세
    kind: 0, // 0: 주택, 1: 오피스텔, 2: 기타
    price: 500_000_000,
    monthlyRent: 0,
  });

  const dealType: DealType = s.deal === 0 ? "sale" : s.deal === 1 ? "lease" : "rent";
  const propertyKind: PropertyKind = s.kind === 0 ? "house" : s.kind === 1 ? "officetel" : "other";

  const result = useMemo(
    () =>
      calculateBrokerage({
        deal: dealType,
        kind: propertyKind,
        price: s.price,
        monthlyRent: s.deal === 2 ? s.monthlyRent : 0,
      }),
    [s, dealType, propertyKind],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "deal",
      label: "거래 유형 선택",
      value: s.deal,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "매매·교환", value: 0 },
        { label: "전세 임대차", value: 1 },
        { label: "월세 임대차", value: 2 },
      ],
    },
    {
      key: "kind",
      label: "부동산 종류 선택",
      value: s.kind,
      min: 0,
      max: 2,
      step: 1,
      chips: [
        { label: "주택 (아파트·빌라)", value: 0 },
        { label: "주거용 오피스텔", value: 1 },
        { label: "토지·상가 등 기타", value: 2 },
      ],
    },
    {
      key: "price",
      label: s.deal === 0 ? "매매 금액" : "임대차 보증금 (전세금)",
      value: s.price,
      min: 1_000_000,
      max: 5_000_000_000,
      step: 1_000_000,
      slider: { min: 10_000_000, max: 2_000_000_000, step: 10_000_000 },
      chips: [50_000_000, 200_000_000, 500_000_000, 900_000_000, 1_500_000_000].map((v) => ({
        label: `${v / 100_000_000}억원`,
        value: v,
      })),
    },
    ...(s.deal === 2
      ? [
          {
            key: "monthlyRent",
            label: "월 임차료 (월세)",
            value: s.monthlyRent,
            min: 0,
            max: 50_000_000,
            step: 50_000,
            slider: { min: 100_000, max: 5_000_000, step: 50_000 },
            chips: [300_000, 500_000, 1_000_000, 1_500_000, 2_000_000].map((v) => ({
              label: `${v / 10_000}만원`,
              value: v,
            })),
          },
        ]
      : []),
  ];

  const rows = [
    { k: "거래 인정 환산금액", v: `₩${n(result.tradeAmount)}` },
    { k: "법정 상한요율", v: `${(result.rate * 100).toFixed(2)}%` },
    { k: "법정 한도액 적용 여부", v: result.cap !== null ? `적용됨 (한도: ₩${n(result.cap)})` : "한도액 없음 (산출금액 그대로)" },
    { k: "부가가치세 (VAT 10%)", v: `₩${n(result.vat)}` },
    { k: "부가세 포함 총 지급액", v: `₩${n(result.total)}` },
    { k: "상한요율 안내", v: "본 금액은 법정 상한액이며, 의뢰인과 중개사가 협의하여 결정합니다." },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="부동산 중개수수료 계산기"
          points={["2021 개정 법정 상한요율 완벽 반영", "매매·전세·월세 자동 환산", "주거용 오피스텔 0.4~0.5% 특례", "부가세(10%) 포함 금액 안내"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="brokerage-calculator"
          title="부동산 중개보수(복비) 상한액 계산"
          summary={{ label: "법정 중개보수 상한액", value: `₩${n(result.fee)}` }}
          onReset={() =>
            setS({
              deal: 0,
              kind: 0,
              price: 500_000_000,
              monthlyRent: 0,
            })
          }
          inputs={fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
          results={
            <ul className="kv-list">
              {rows.map((r) => (
                <li key={r.k}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        />

        <KoBrokerageArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
