import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateAutoLoan } from "@/engines/us-loans";
import { usCopy } from "@/i18n/us-labels";
import { symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsAutoLoanArticle } from "@/components/articles/us/UsAutoLoanArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: "US Auto Financing & Car Buying",
    points: [
      "Estimated Monthly Car Payment",
      "Trade-In & Down Payment Credit",
      "State & Local Sales Tax Inclusion",
      "36 to 84-Month Financing Terms",
    ],
    anchor: "auto-loan-calculator",
    defaults: {
      price: 35_000,
      down: 5_000,
      tradeIn: 2_000,
      rate: 6.5,
      term: 60,
      tax: 7.0,
    },
    fields: [
      {
        key: "price",
        label: "Vehicle Purchase Price",
        value: 35_000,
        min: 2_000,
        max: 200_000,
        step: 500,
        slider: { min: 5_000, max: 100_000, step: 1_000 },
        prefix: p,
        chips: [20_000, 30_000, 40_000, 50_000, 70_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "down",
        label: "Cash Down Payment",
        value: 5_000,
        min: 0,
        max: 100_000,
        step: 250,
        slider: { min: 0, max: 30_000, step: 500 },
        prefix: p,
        chips: [1_000, 3_000, 5_000, 8_000, 12_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "tradeIn",
        label: "Trade-In Value (Net)",
        value: 2_000,
        min: 0,
        max: 80_000,
        step: 250,
        slider: { min: 0, max: 30_000, step: 500 },
        prefix: p,
        chips: [0, 2_000, 5_000, 10_000, 15_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "rate",
        label: "Interest Rate (APR)",
        value: 6.5,
        min: 0.1,
        max: 25,
        step: 0.1,
        suffix: "%",
        chips: [3.9, 4.9, 6.5, 7.9, 9.9, 12.9].map((v) => ({
          label: `${v}%`,
          value: v,
        })),
      },
      {
        key: "term",
        label: "Loan Term",
        value: 60,
        min: 12,
        max: 84,
        step: 12,
        suffix: c.monthsSuffix,
        chips: [36, 48, 60, 72, 84].map((v) => ({
          label: `${v} mo (${v / 12} yr)`,
          value: v,
        })),
      },
    ],
    advancedFields: [
      {
        key: "tax",
        label: "Sales Tax Rate",
        value: 7.0,
        min: 0,
        max: 15,
        step: 0.1,
        suffix: "%",
        chips: [0, 4.5, 6.25, 7.0, 8.25, 9.5].map((v) => ({
          label: `${v}%`,
          value: v,
        })),
      },
    ],
    engine: (s) =>
      calculateAutoLoan({
        vehiclePrice: s.price,
        downPayment: s.down,
        tradeInValue: s.tradeIn,
        salesTaxRate: s.tax,
        interestRate: s.rate,
        termMonths: s.term,
      }),
    format: money,
    results: [
      {
        label: "Estimated Monthly Payment",
        value: (r) => `${money(r.monthlyPayment)} / mo`,
        emphasis: true,
      },
      { label: "Total Loan Amount", value: (r) => money(r.loanAmount) },
      { label: "Total Interest Paid", value: (r) => money(r.totalInterest) },
      { label: "Sales Tax (Financed)", value: (r) => money(r.salesTaxAmount) },
      { label: "Total Purchase Cost", value: (r) => money(r.totalCost) },
    ],
    table: {
      caption: "Auto Loan Amortization Schedule",
      head: ["Year", "Opening Balance", "Payments Made", "Interest Paid", "Ending Balance"],
      rows: (r) =>
        r.rows.map((row: any) => [
          `Year ${row.year}`,
          money(row.opening),
          money(row.paid),
          money(row.interest),
          money(row.closing),
        ]),
    },
    guide: <UsAutoLoanArticle />,
  };
});
