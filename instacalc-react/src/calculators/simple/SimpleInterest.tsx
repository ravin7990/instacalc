import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateSimple } from "@/engines/interest";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { UsSimpleInterestArticle } from "@/components/articles/us/UsSimpleInterestArticle";
import { JaSimpleInterestArticle } from "@/components/articles/ja/JaSimpleInterestArticle";
import { InCompoundArticle } from "@/components/articles/in/InCompoundArticle";


export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);

  return {
    appCategory: "FinanceApplication",
    eyebrow: "Investment Planner",
    points: [c.maturity, c.investedTotal, c.interest],
    anchor: "simple-interest-calculator",
    defaults: { principal: 200_000, rate: 8, years: 10, recurring: 0 },
    fields: [
      {
        key: "principal",
        label: c.amount,
        value: 200_000,
        min: 100,
        max: 100_000_000,
        step: 100,
        slider: { min: 1000, max: 10_000_000, step: 1000 },
        prefix: p,
        chips: locale === "us"
          ? [10_000, 25_000, 50_000, 100_000, 250_000].map((v) => ({
              label: `${p}${v / 1000}K`,
              value: v,
            }))
          : [50_000, 100_000, 200_000, 500_000, 1_000_000].map((v) => ({
              label: `${p}${v / 100_000}L`,
              value: v,
            })),
      },
      {
        key: "rate",
        label: c.rate,
        value: 8,
        min: 0.1,
        max: 30,
        step: 0.1,
        suffix: c.percent,
        chips: [4, 6, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "years",
        label: c.years,
        value: 10,
        min: 1,
        max: 40,
        step: 1,
        slider: { min: 1, max: 30, step: 1 },
        suffix: c.yearsSuffix,
        chips: [1, 5, 10, 20, 30].map((v) => ({ label: `${v}`, value: v })),
      },
    ],
    advancedFields: [
      { key: "recurring", label: c.annual, value: 0, min: 0, max: 1_000_000, step: 100, prefix: p },
    ],
    engine: (s) =>
      calculateSimple({ principal: s.principal, ratePercent: s.rate, years: s.years, recurring: s.recurring }),
    format: money,
    results: [
      { label: c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: c.investedTotal, value: (r) => money(r.totalInvested) },
      { label: c.interest, value: (r) => money(r.totalInterest) },
    ],
    donut: (r) => ({
      items: [
        { label: c.investedTotal, value: r.totalInvested, color: "#0284c7" },
        { label: c.interest, value: r.totalInterest, color: "#10b981" },
      ],
      centerLabel: c.interest,
    }),
    timeline: (r) => ({
      title: locale === "ja" ? "単利運用による資産推移" : "Simple Interest Growth Trajectory",
      subtitle: locale === "ja" ? "投資元本と利息の推移グラフ" : "Accumulated balance vs principal over time",
      labels: r.rows.map((row: any) => `${locale === "ja" ? "" : "Yr "}${row.year}${locale === "ja" ? "年目" : ""}`),
      datasets: [
        {
          label: c.maturity,
          data: r.rows.map((row: any) => row.amount),
          color: "#0284c7",
          fill: true,
        },
        {
          label: c.investedTotal,
          data: r.rows.map((row: any) => row.invested),
          color: "#64748b",
          dashed: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: [c.schedule, c.investedTotal, c.interest, c.maturity],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.invested),
          money(row.interest),
          money(row.amount),
        ]),
    },
    guide:
      locale === "us" ? (
        <UsSimpleInterestArticle />
      ) : locale === "ja" ? (
        <JaSimpleInterestArticle />
      ) : (
        <InCompoundArticle />
      ),
  };
});

