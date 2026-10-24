import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { DateField } from "@/components/calculator/DateField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateKoreanAge } from "@/engines/korea";
import { formatNumber } from "@/lib/currency";
import { KoKoreanAgeArticle } from "@/components/articles/ko/KoKoreanAgeArticle";

export default function KoreanAgeCalculator({ seo }: { seo: SeoRecord }) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [birth, setBirth] = useState("2000-01-01");
  const [refDate, setRefDate] = useState(todayIso);

  const result = useMemo(() => calculateKoreanAge(birth, refDate), [birth, refDate]);
  const n = (v: number) => formatNumber(seo.locale, v);

  const rows = [
    { k: "연 나이 (현재연도 - 출생연도)", v: `${result.yearAge}세` },
    { k: "세는 나이 (한국식 전통 나이)", v: `${result.countingAge}세` },
    { k: "태어난 해 12간지 띠", v: `${result.zodiac}띠` },
    { k: "살아온 총 일수", v: `${n(result.daysLived)}일 (${n(result.months)}개월)` },
    { k: "다음 생일까지 남은 일수", v: `${result.daysToBirthday}일 (다음 생일: ${result.nextBirthday})` },
    { k: "청소년보호법(술·담배) 기준", v: result.yearAge >= 19 ? "이용 가능 (만 19세 이상 연도 도달)" : "청소년 보호 대상" },
    { k: "운전면허 1종·2종 취득 가능", v: result.manAge >= 18 ? "취득 가능 (만 18세 이상)" : "취득 불가 (만 18세 미만)" },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow="만 나이 통일법 계산기"
          points={["2023년 만 나이 통일법 완벽 적용", "만 나이·연 나이·세는 나이 동시 비교", "12간지 띠 및 다음 생일 D-day", "법적 음주·면허 연령 가이드"]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="korean-age-calculator"
          title="만 나이 및 한국식 나이 계산기"
          summary={{ label: "법정 만 나이", value: `만 ${result.manAge}세` }}
          onReset={() => {
            setBirth("2000-01-01");
            setRefDate(todayIso);
          }}
          inputs={
            <>
              <DateField label="생년월일 선택" value={birth} onChange={setBirth} />
              <DateField label="기준일자 선택 (기본: 오늘)" value={refDate} onChange={setRefDate} />
            </>
          }
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

        <KoKoreanAgeArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
