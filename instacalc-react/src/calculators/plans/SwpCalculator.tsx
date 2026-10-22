import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateSwp } from "@/engines/retirement-plans";
import { planCopy } from "@/i18n/retirement-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { JaSwpArticle } from "@/components/articles/ja/JaSwpArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = planCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.withdrawal, c.corpusAtRetirement, c.totalWithdrawal, c.totalInterest],
    anchor: "swp-calculator",
    defaults: { corpus: 20_000_000, withdrawal: 50_000, rate: 8, years: 20, inflation: 6 },
    fields: [
      {
        key: "corpus", label: c.corpusAtRetirement, value: 20_000_000,
        min: 100_000, max: 1_000_000_000, step: 100_000,
        slider: { min: 500_000, max: 100_000_000, step: 500_000 },
        prefix: p,
        chips: [5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000].map((v) => ({
          label: locale === "ja" ? (v >= 100_000_000 ? `${v / 100_000_000}億円` : `${v / 10_000}万円`) : `${p}${v / 10_000_000}Cr`,
          value: v,
        })),
      },
      {
        key: "withdrawal", label: c.withdrawal, value: 50_000,
        min: 1_000, max: 5_000_000, step: 1_000,
        slider: { min: 5_000, max: 500_000, step: 5_000 },
        prefix: p,
        chips: [20_000, 50_000, 100_000, 200_000, 300_000].map((v) => ({
          label: locale === "ja" ? `${v / 10_000}万円` : `${p}${v / 1000}K`,
          value: v,
        })),
      },
      { key: "rate", label: c.returnRate, value: 8, min: 0, max: 20, step: 0.5, suffix: "%",
        chips: [6, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "years", label: c.years, value: 20, min: 1, max: 50, step: 1,
        slider: { min: 5, max: 40, step: 1 },
        suffix: c.years,
        chips: [10, 15, 20, 25, 30].map((v) => ({ label: `${v}`, value: v })) },
    ],
    advancedFields: [
      { key: "inflation", label: c.inflation, value: 6, min: 0, max: 15, step: 0.5, suffix: "%",
        chips: [0, 4, 6, 8].map((v) => ({ label: `${v}%`, value: v })) },
    ],
    engine: (s) =>
      calculateSwp({
        initialCorpus: s.corpus,
        monthlyWithdrawal: s.withdrawal,
        rate: s.rate,
        years: s.years,
        withdrawalInflation: s.inflation,
      }),
    format: money,
    results: [
      // The final balance is the headline: it is zero when the corpus ran out.
      { label: c.balance, value: (r) => money(r.rows.length ? r.rows[r.rows.length - 1].closing : 0), emphasis: true },
      { label: c.totalWithdrawal, value: (r) => money(r.totalWithdrawal) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
      {
        label: c.exhaustedYear,
        value: (r) => (r.sustainable ? c.sustainable : `${r.exhaustedYear} ${c.years} — ${c.unsustainable}`),
      },
    ],
    table: {
      caption: c.yearsTable,
      head: [c.year, c.withdrawal, c.totalInterest, c.balance],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.withdrawn),
          money(row.interest),
          money(row.closing),
        ]),
    },
    guide: locale === "ja" ? <JaSwpArticle /> : undefined,
  };
});
