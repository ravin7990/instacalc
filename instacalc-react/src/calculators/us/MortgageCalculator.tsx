import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateMortgage } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsMortgageArticle } from "@/components/articles/us/UsMortgageArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.monthlyPayment, c.principalInterest, c.totalInterest, c.pmi],
    anchor: "mortgage-calculator",
    defaults: {
      price: 450_000, down: 20, rate: 6.8, years: 30,
      tax: 1.2, insurance: 1_400, hoa: 0, extra: 0,
    },
    fields: [
      {
        key: "price", label: c.homePrice, value: 450_000,
        min: 50_000, max: 5_000_000, step: 5_000,
        slider: { min: 100_000, max: 2_000_000, step: 25_000 },
        prefix: p,
        chips: [250_000, 350_000, 450_000, 650_000, 900_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
      },
      { key: "down", label: c.downPayment, value: 20, min: 0, max: 100, step: 1, suffix: "%",
        chips: [0, 5, 10, 20, 25].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "rate", label: c.interestRate, value: 6.8, min: 1, max: 15, step: 0.05, suffix: "%",
        chips: [3, 5, 6.5, 6.8, 8].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "years", label: c.loanTerm, value: 30, min: 5, max: 40, step: 5,
        suffix: c.year,
        chips: [15, 20, 30].map((v) => ({ label: `${v}`, value: v })) },
    ],
    advancedFields: [
      { key: "extra", label: "Extra Monthly Principal Payment", value: 0, min: 0, max: 5_000, step: 25, prefix: p,
        chips: [0, 100, 250, 500, 1_000].map((v) => ({ label: `${p}${v}`, value: v })) },
      { key: "tax", label: c.propertyTax, value: 1.2, min: 0, max: 5, step: 0.05, suffix: "%",
        chips: [0.5, 1, 1.2, 2].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "insurance", label: c.insurance, value: 1_400, min: 0, max: 10_000, step: 100, prefix: p },
      { key: "hoa", label: c.hoa, value: 0, min: 0, max: 2_000, step: 25, prefix: p,
        chips: [0, 100, 250, 500].map((v) => ({ label: `${v}`, value: v })) },
    ],
    engine: (s) =>
      calculateMortgage({
        homePrice: s.price,
        downPercent: s.down,
        rate: s.rate,
        years: s.years,
        taxRate: s.tax,
        insurance: s.insurance,
        hoa: s.hoa,
        extraPayment: s.extra,
      }),
    format: money,
    results: [
      { label: c.monthlyPayment, value: (r) => money(r.totalMonthlyPayment), emphasis: true },
      { label: c.principalInterest, value: (r) => money(r.monthlyPI) },
      { label: "Bi-Weekly Payment (1/2 P&I)", value: (r) => money(r.biweeklyPayment) },
      { label: c.pmi, value: (r) => money(r.monthlyPmi) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
      { label: c.downPayment, value: (r) => money(r.downPayment) },
    ],
    table: {
      caption: c.yearsTable,
      head: [c.year, c.principalPaid, c.totalInterest, c.remainingBalance],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.principalPaid),
          money(row.interestPaid),
          money(row.closing),
        ]),
    },
    guide: <UsMortgageArticle />,
  };
});
