import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateCompound } from "@/engines/interest";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsMonthlyInvestmentArticle } from "@/components/articles/us/UsMonthlyInvestmentArticle";

/** Monthly index-fund / DCA projection. */
export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.corpus, c.totalContributed, c.totalGrowth, c.monthlyContribution],
    anchor: "monthly-investment-calculator",
    defaults: { contribution: 500, rate: 8, years: 20 },
    fields: [
      {
        key: "contribution", label: c.monthlyContribution, value: 500,
        min: 10, max: 100_000, step: 10,
        slider: { min: 50, max: 5_000, step: 50 },
        prefix: p,
        chips: [100, 250, 500, 1000, 2000].map((v) => ({ label: `${p}${v}`, value: v })),
      },
      { key: "rate", label: c.expectedReturn, value: 8, min: 1, max: 15, step: 0.5, suffix: "%",
        chips: [5, 7, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "years", label: c.investmentYears, value: 20, min: 1, max: 50, step: 1,
        slider: { min: 5, max: 40, step: 1 },
        suffix: c.year,
        chips: [10, 20, 30, 40].map((v) => ({ label: `${v}`, value: v })) },
    ],
    // The engine compounds monthly, so pass the horizon in years-equivalent.
    engine: (s) =>
      calculateCompound({
        principal: 0,
        ratePercent: s.rate,
        years: s.years,
        frequency: "monthly",
        recurring: s.contribution,
      }),
    format: money,
    results: [
      { label: c.corpus, value: (r) => money(r.maturity), emphasis: true },
      { label: c.totalContributed, value: (r) => money(r.totalInvested) },
      { label: c.totalGrowth, value: (r) => money(r.totalInterest) },
    ],
    donut: (r) => ({
      centerLabel: c.totalGrowth,
      items: [
        { label: c.totalContributed, value: r.totalInvested, color: "#0284c7" },
        { label: c.totalGrowth, value: r.totalInterest, color: "#10b981" },
      ],
    }),
    timeline: (r) => ({
      title: "Wealth Growth Trajectory",
      subtitle: "Monthly investment compound growth and contributions over time",
      labels: r.rows.map((row: any) => `${c.year} ${row.year}`),
      datasets: [
        {
          label: c.corpus,
          data: r.rows.map((row: any) => row.amount),
          color: "#10b981",
          fill: true,
        },
        {
          label: c.totalContributed,
          data: r.rows.map((row: any) => row.invested),
          color: "#0284c7",
          dashed: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: [c.year, c.totalContributed, c.totalGrowth, c.corpus],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.invested),
          money(row.interest),
          money(row.amount),
        ]),
    },
    guide: <UsMonthlyInvestmentArticle />,
  };
});
