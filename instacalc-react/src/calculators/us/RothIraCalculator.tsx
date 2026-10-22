import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateRothIra } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsRothIraArticle } from "@/components/articles/us/UsRothIraArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.corpus, c.totalContributed, c.totalGrowth, c.annualContribution],
    anchor: "roth-ira-calculator",
    defaults: { contribution: 7_000, rate: 8.5, years: 30, balance: 0, timing: 0 },
    fields: [
      {
        key: "contribution", label: c.annualContribution, value: 7_000,
        min: 500, max: 100_000, step: 100,
        slider: { min: 1_000, max: 50_000, step: 500 },
        prefix: p,
        chips: [2_000, 3_000, 5_000, 6_000, 7_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
      },
      { key: "rate", label: c.expectedReturn, value: 8.5, min: 1, max: 15, step: 0.5, suffix: "%",
        chips: [5, 7, 8.5, 10].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "years", label: c.investmentYears, value: 30, min: 1, max: 50, step: 1,
        slider: { min: 5, max: 40, step: 1 },
        suffix: c.year,
        chips: [10, 20, 30, 40].map((v) => ({ label: `${v}`, value: v })) },
    ],
    advancedFields: [
      { key: "timing", label: c.timing, value: 0, min: 0, max: 2, step: 1,
        chips: [
          { label: c.startOfYear, value: 0 },
          { label: c.monthlyDca, value: 1 },
          { label: c.endOfYear, value: 2 },
        ] },
      { key: "balance", label: c.currentBalance, value: 0, min: 0, max: 5_000_000, step: 1_000, prefix: p },
    ],
    // timing: 0 = start of year, 1 = monthly, 2 = end of year
    engine: (s) =>
      calculateRothIra({
        annualContribution: s.contribution,
        returnRate: s.rate,
        years: s.years,
        currentBalance: s.balance,
        timing: s.timing === 0 ? "start" : s.timing === 1 ? "monthly" : "end",
      }),
    format: money,
    results: [
      { label: c.corpus, value: (r) => money(r.corpus), emphasis: true },
      { label: c.totalContributed, value: (r) => money(r.totalContributed) },
      { label: c.totalGrowth, value: (r) => money(r.totalGrowth) },
    ],
    table: {
      caption: c.yearsTable,
      head: [c.year, c.annualContribution, c.totalGrowth, c.corpus],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.contribution),
          money(row.growth),
          money(row.closing),
        ]),
    },
    guide: <UsRothIraArticle />,
  };
});
