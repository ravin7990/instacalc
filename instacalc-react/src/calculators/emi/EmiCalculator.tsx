import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateEmi } from "@/engines/emi";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaEmiArticle } from "@/components/articles/ja/JaEmiArticle";
import { RuEmiArticle } from "@/components/articles/ru/RuEmiArticle";
import { InEmiArticle } from "@/components/articles/in/InEmiArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const isRu = locale === "ru";
  const isJa = locale === "ja";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu ? "Кредитный калькулятор" : isJa ? "住宅ローン・融資" : "Loan Planner",
    points: [c.emi, c.totalPayment, c.totalInterest],
    anchor: "emi-calculator",
    defaults: { principal: 5_000_000, rate: 8.5, years: 20 },
    fields: [
      {
        key: "principal",
        label: c.principal,
        value: 5_000_000,
        min: 50_000,
        max: 200_000_000,
        step: 50_000,
        slider: { min: 100_000, max: 50_000_000, step: 50_000 },
        prefix: p,
        chips: [500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000].map((v) => ({
          label: isJa
            ? `${v / 10000}万円`
            : isRu
            ? v >= 1_000_000
              ? `${v / 1_000_000} млн ₽`
              : `${v / 1_000} тыс. ₽`
            : `${p}${v / 100_000}L`,
          value: v,
        })),
      },

      {
        key: "rate",
        label: c.rate,
        value: 8.5,
        min: 1,
        max: 24,
        step: 0.05,
        suffix: c.percent,
        chips: [7, 8.5, 10, 12].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "years",
        label: c.years,
        value: 20,
        min: 1,
        max: 30,
        step: 1,
        slider: { min: 1, max: 30, step: 1 },
        suffix: c.yearsSuffix,
        chips: [5, 10, 15, 20, 30].map((v) => ({ label: `${v}`, value: v })),
      },
    ],
    engine: (s) => calculateEmi({ principal: s.principal, annualRate: s.rate, years: s.years }),
    format: money,
    results: [
      { label: c.emi, value: (r) => money(r.emi), emphasis: true },
      { label: c.totalPayment, value: (r) => money(r.totalPayment) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
    ],
    donut: (r, s) => ({
      items: [
        { label: c.invested, value: s.principal, color: "#0284c7" },
        { label: c.totalInterest, value: r.totalInterest, color: "#f59e0b" },
      ],
      centerLabel: c.totalInterest,
    }),
    timeline: (r) => ({
      title: isJa ? "住宅ローン・融資返済残高推移" : isRu ? "График погашения кредита" : "Loan Balance Amortization Payoff Curve",
      subtitle: isJa ? "借入残高の年次推移グラフ" : isRu ? "Динамика уменьшения остатка долга" : "Remaining balance over loan tenure",
      labels: r.rows.map((row: any) => `${isJa ? "" : "Yr "}${row.year}${isJa ? "年目" : ""}`),
      datasets: [
        {
          label: isJa ? "返済残高" : isRu ? "Остаток долга" : "Remaining Balance",
          data: r.rows.map((row: any) => row.closing),
          color: "#0284c7",
          fill: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: [c.schedule, c.amount, c.interest, c.invested],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.opening),
          money(row.interestPaid),
          money(row.principalPaid),
        ]),
    },
    guide: isJa ? <JaEmiArticle /> : isRu ? <RuEmiArticle /> : <InEmiArticle />,
  };
});

