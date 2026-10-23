import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateNps } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { JaNpsArticle } from "@/components/articles/ja/JaNpsArticle";
import { RuNpsArticle } from "@/components/articles/ru/RuNpsArticle";
import { InNpsArticle } from "@/components/articles/in/InNpsArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = planCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.corpusAtRetirement, c.lumpsum, c.pension, c.totalInvested],
    anchor: "nps-calculator",
    defaults: { contribution: 10_000, age: 30, return: 10, annuityPct: 40, annuityRate: 6 },
    fields: [
      {
        key: "contribution", label: c.contribution, value: 10_000,
        min: 500, max: 500_000, step: 500,
        slider: { min: 1_000, max: 100_000, step: 500 },
        prefix: p,
        chips: [5_000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
          label: locale === "ja" ? (v >= 10_000 ? `${v / 10_000}万円` : `${v}円`) : `${p}${v / 1000}K`,
          value: v,
        })),
      },
      { key: "age", label: c.currentAge, value: 30, min: 18, max: 59, step: 1, suffix: c.years,
        chips: [25, 30, 35, 40, 45].map((v) => ({ label: `${v}`, value: v })) },
      { key: "return", label: c.returnRate, value: 10, min: 1, max: 20, step: 0.5, suffix: "%",
        chips: [8, 10, 12, 14].map((v) => ({ label: `${v}%`, value: v })) },
    ],
    advancedFields: [
      { key: "annuityPct", label: c.annuityPercent, value: 40, min: 0, max: 100, step: 5, suffix: "%",
        chips: [20, 40, 60, 80, 100].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "annuityRate", label: c.annuityRate, value: 6, min: 3, max: 10, step: 0.25, suffix: "%",
        chips: [4, 6, 8, 9].map((v) => ({ label: `${v}%`, value: v })) },
    ],
    engine: (s) =>
      calculateNps({
        monthlyContribution: s.contribution,
        currentAge: s.age,
        returnRate: s.return,
        annuityPercent: s.annuityPct,
        annuityRate: s.annuityRate,
      }),
    format: money,
    results: [
      { label: c.corpusAtRetirement, value: (r) => money(r.corpus), emphasis: true },
      { label: c.lumpsum, value: (r) => money(r.lumpsum) },
      { label: c.annuityCorpus, value: (r) => money(r.annuityCorpus) },
      { label: c.pension, value: (r) => money(r.monthlyPension) },
      { label: c.totalInvested, value: (r) => money(r.invested) },
    ],
    donut: (r) => ({
      items: [
        { label: c.totalInvested, value: r.invested, color: "#0284c7" },
        { label: locale === "ja" ? "運用益" : locale === "ru" ? "Инвестиционный доход" : "Wealth Gain", value: Math.max(0, r.corpus - r.invested), color: "#10b981" },
      ],
      centerLabel: locale === "ja" ? "収益比率" : "Gain",
    }),
    guide: locale === "ja" ? <JaNpsArticle /> : locale === "ru" ? <RuNpsArticle /> : <InNpsArticle />,
  };
});
