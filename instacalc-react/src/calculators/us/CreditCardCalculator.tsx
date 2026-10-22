import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateCreditCardPayoff } from "@/engines/us-loans";
import { usCopy } from "@/i18n/us-labels";
import { symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsCreditCardArticle } from "@/components/articles/us/UsCreditCardArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: "US Debt Relief & Credit Cards",
    points: [
      "Months to Debt-Free",
      "Total Interest Saved",
      "Payoff Timeline & Date",
      "Year-by-Year Amortization",
    ],
    anchor: "credit-card-calculator",
    defaults: {
      balance: 5_000,
      apr: 24,
      payment: 200,
      extra: 0,
    },
    fields: [
      {
        key: "balance",
        label: "Credit Card Balance",
        value: 5_000,
        min: 100,
        max: 200_000,
        step: 100,
        slider: { min: 500, max: 50_000, step: 250 },
        prefix: p,
        chips: [2_000, 5_000, 10_000, 15_000, 25_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "apr",
        label: "Annual Percentage Rate (APR)",
        value: 24,
        min: 1,
        max: 40,
        step: 0.1,
        suffix: "%",
        chips: [15, 18.99, 21.99, 24, 27.99, 29.99].map((v) => ({
          label: `${v}%`,
          value: v,
        })),
      },
      {
        key: "payment",
        label: "Planned Monthly Payment",
        value: 200,
        min: 25,
        max: 10_000,
        step: 10,
        slider: { min: 50, max: 2_000, step: 25 },
        prefix: p,
        chips: [100, 150, 200, 300, 500].map((v) => ({
          label: `${p}${v}`,
          value: v,
        })),
      },
    ],
    advancedFields: [
      {
        key: "extra",
        label: "Extra Monthly Payment Toward Principal",
        value: 0,
        min: 0,
        max: 5_000,
        step: 10,
        prefix: p,
        chips: [0, 25, 50, 100, 200].map((v) => ({
          label: `${p}${v}`,
          value: v,
        })),
      },
    ],
    engine: (s) =>
      calculateCreditCardPayoff({
        balance: s.balance,
        apr: s.apr,
        monthlyPayment: s.payment,
        extraMonthly: s.extra,
      }),
    format: money,
    results: [
      {
        label: "Time to Debt-Free",
        value: (r) =>
          r.neverPayoff
            ? "Payment too low (balance grows)"
            : `${r.monthsToPayoff} Months (${r.yearsToPayoff} Years)`,
        emphasis: true,
      },
      {
        label: "Projected Debt-Free Date",
        value: (r) => (r.neverPayoff ? "Never" : r.payoffMonthYear),
      },
      { label: "Total Interest Paid", value: (r) => money(r.totalInterest) },
      { label: "Total Repaid", value: (r) => money(r.totalPaid) },
      {
        label: "Total Monthly Payment",
        value: (_r, s) => money(s.payment + s.extra),
      },
    ],
    table: {
      caption: "Credit Card Debt Payoff Schedule",
      head: ["Year", "Opening Balance", "Payments Made", "Interest Charged", "Ending Balance"],
      rows: (r) =>
        r.rows.map((row: any) => [
          `Year ${row.year}`,
          money(row.opening),
          money(row.paid),
          money(row.interest),
          money(row.closing),
        ]),
    },
    guide: <UsCreditCardArticle />,
  };
});
