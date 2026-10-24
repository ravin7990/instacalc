import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateConversion, KR_2026 } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoJeonseWolseArticle } from "@/components/articles/ko/KoJeonseWolseArticle";

export default function JeonseWolseCalculator({ seo }: { seo: SeoRecord }) {
  const [s, setS] = useState({
    direction: 0, // 0: jeonseToWolse, 1: wolseToJeonse
    jeonse: 300_000_000,
    deposit: 100_000_000,
    monthlyRent: 800_000,
    ratePercent: 5.0,
    baseRatePercent: 3.5,
  });

  const result = useMemo(
    () =>
      calculateConversion({
        direction: s.direction === 0 ? "jeonseToWolse" : "wolseToJeonse",
        jeonse: s.jeonse,
        deposit: s.deposit,
        monthlyRent: s.monthlyRent,
        ratePercent: s.ratePercent,
        baseRatePercent: s.baseRatePercent,
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const n = (v: number) => formatNumber(seo.locale, v);

  const fields: FieldSpec[] = [
    {
      key: "direction",
      label: "전환 방향 선택",
      value: s.direction,
      min: 0,
      max: 1,
      step: 1,
      chips: [
        { label: "전세 → 월세(반전세) 전환", value: 0 },
        { label: "월세 → 전세 전환", value: 1 },
      ],
    },
    ...(s.direction === 0
      ? [
          {
            key: "jeonse",
            label: "기존 전세보증금",
            value: s.jeonse,
            min: 10_000_000,
            max: 3_000_000_000,
            step: 5_000_000,
            slider: { min: 50_000_000, max: 1_000_000_000, step: 10_000_000 },
            chips: [100_000_000, 200_000_000, 300_000_000, 500_000_000].map((v) => ({
              label: `${v / 100_000_000}억원`,
              value: v,
            })),
          },
          {
            key: "deposit",
            label: "전환 후 변경 보증금",
            value: s.deposit,
            min: 1_000_000,
            max: 3_000_000_000,
            step: 5_000_000,
            slider: { min: 10_000_000, max: 500_000_000, step: 10_000_000 },
            chips: [30_000_000, 50_000_000, 100_000_000, 200_000_000].map((v) => ({
              label: `${v / 10_000_000}천만원`,
              value: v,
            })),
          },
        ]
      : [
          {
            key: "deposit",
            label: "현재 월세보증금",
            value: s.deposit,
            min: 1_000_000,
            max: 1_000_000_000,
            step: 5_000_000,
            slider: { min: 5_000_000, max: 300_000_000, step: 5_000_000 },
            chips: [10_000_000, 30_000_000, 50_000_000, 100_000_000].map((v) => ({
              label: `${v / 10_000_000}천만원`,
              value: v,
            })),
          },
          {
            key: "monthlyRent",
            label: "현재 지불 중인 월세",
            value: s.monthlyRent,
            min: 50_000,
            max: 20_000_000,
            step: 10_000,
            slider: { min: 200_000, max: 3_000_000, step: 50_000 },
            chips: [400_000, 600_000, 800_000, 1_000_000, 1_500_000].map((v) => ({
              label: `${v / 10_000}만원`,
              value: v,
            })),
          },
        ]),
    {
      key: "ratePercent",
      label: "적용 전월세 전환율 (%)",
      value: s.ratePercent,
      min: 1.0,
      max: 15.0,
      step: 0.1,
      chips: [4.5, 5.0, 5.5, 6.0].map((v) => ({ label: `${v}%`, value: v })),
    },
    {
      key: "baseRatePercent",
      label: "한국은행 기준금리 (법정 상한 산정용, %)",
      value: s.baseRatePercent,
      min: 0.5,
      max: 10.0,
      step: 0.25,
      chips: [3.0, 3.25, 3.5].map((v) => ({ label: `${v}%`, value: v })),
    },
  ];

  const rows = [
    { k: "주택임대차보호법 법정 상한선", v: `${result.legalCapPercent.toFixed(2)}% (기준금리 + 2.0%)` },
    { k: "법정 상한율 준수 여부", v: result.overCap ? "⚠️ 법정 상한율을 초과함 (임차인 동의 없이는 무효)" : "✅ 법정 상한율 이내 (적법)" },
    { k: "보증금 차액", v: `₩${n(Math.abs(s.jeonse - s.deposit))}` },
    { k: "연간 총 지출 월세액", v: `₩${n(result.monthlyRent * 12)}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="전월세 전환 계산기"
          points={["전세 ↔ 월세 양방향 계산", "법정 전환율 상한선(기준금리+2%) 자동 판정", "월세액 및 환산 보증금 산출", "임대차보호법 위반 여부 확인"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="jeonse-wolse-calculator"
          title="전세·월세 상호 전환 및 적정 월세 계산"
          summary={{
            label: s.direction === 0 ? "전환 후 예상 월세" : "환산 전세보증금",
            value: s.direction === 0 ? `₩${n(result.monthlyRent)} / 월` : `₩${n(result.jeonse)}`,
          }}
          onReset={() =>
            setS({
              direction: 0,
              jeonse: 300_000_000,
              deposit: 100_000_000,
              monthlyRent: 800_000,
              ratePercent: 5.0,
              baseRatePercent: 3.5,
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

        <KoJeonseWolseArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
