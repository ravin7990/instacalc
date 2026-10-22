import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculatePpf } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { RuInternationalArticle } from "@/components/articles/ru/RuInternationalArticle";
import { InPpfArticle } from "@/components/articles/in/InPpfArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = planCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.maturity, c.totalInvested, c.totalInterest],
    anchor: "ppf-calculator",
    defaults: { investment: 150_000, rate: 7.1, tenure: 15, opening: 0 },
    fields: [
      {
        key: "investment", label: c.investment, value: 150_000,
        min: 500, max: 1_500_000, step: 500,
        slider: { min: 5_000, max: 500_000, step: 1000 },
        prefix: p,
        chips: [50_000, 100_000, 150_000, 300_000, 500_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
      },
      {
        key: "rate", label: c.interestRate, value: 7.1, min: 4, max: 12, step: 0.05, suffix: "%",
        chips: [7, 7.1, 7.5, 8].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "tenure", label: c.tenure, value: 15, min: 1, max: 50, step: 1,
        slider: { min: 5, max: 40, step: 1 },
        suffix: c.years,
        chips: [5, 10, 15, 20, 30].map((v) => ({ label: `${v}`, value: v })),
      },
    ],
    advancedFields: [
      {
        key: "opening", label: c.openingBalance, value: 0,
        min: 0, max: 10_000_000, step: 10_000, prefix: p,
      },
    ],
    // PPF allows at most one deposit per financial year; the monthly mode
    // accumulates a year's worth of instalments before crediting interest.
    engine: (s) =>
      calculatePpf({
        annualInvestment: s.investment,
        rate: s.rate,
        tenure: s.tenure,
        frequency: s.freq === 1 ? "month" : "year",
        openingBalance: s.opening,
      }),
    format: money,
    results: [
      { label: c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: c.totalInvested, value: (r) => money(r.totalInvested) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
    ],
    table: {
      caption: c.yearsTable,
      head: [c.year, c.investment, c.totalInterest, c.balance],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.invested),
          money(row.interest),
          money(row.closing),
        ]),
    },
    guide: locale === "ru" ? <RuInternationalArticle /> : <InPpfArticle />,
  };
});
