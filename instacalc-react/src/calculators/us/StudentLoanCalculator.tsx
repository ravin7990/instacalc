import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateStudentLoan } from "@/engines/us-loans";
import { usCopy } from "@/i18n/us-labels";
import { symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsStudentLoanArticle } from "@/components/articles/us/UsStudentLoanArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: "US Higher Education & Loans",
    points: [
      "Standard 10-Year & Extended Plans",
      "Extra Payment Interest Savings",
      "Payoff Timeline Accelerators",
      "Annual Amortization Schedule",
    ],
    anchor: "student-loan-calculator",
    defaults: {
      balance: 35_000,
      rate: 5.5,
      years: 10,
      extra: 0,
    },
    fields: [
      {
        key: "balance",
        label: "Student Loan Balance",
        value: 35_000,
        min: 1_000,
        max: 500_000,
        step: 500,
        slider: { min: 5_000, max: 150_000, step: 1_000 },
        prefix: p,
        chips: [15_000, 25_000, 35_000, 50_000, 80_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "rate",
        label: "Interest Rate (Fixed)",
        value: 5.5,
        min: 1,
        max: 18,
        step: 0.1,
        suffix: "%",
        chips: [3.5, 4.5, 5.5, 6.5, 7.5, 9].map((v) => ({
          label: `${v}%`,
          value: v,
        })),
      },
      {
        key: "years",
        label: "Repayment Term",
        value: 10,
        min: 1,
        max: 30,
        step: 1,
        suffix: c.year,
        chips: [5, 10, 15, 20, 25].map((v) => ({
          label: `${v} Years`,
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
        max: 2_000,
        step: 25,
        prefix: p,
        chips: [0, 50, 100, 200, 300].map((v) => ({
          label: `${p}${v}`,
          value: v,
        })),
      },
    ],
    engine: (s) =>
      calculateStudentLoan({
        balance: s.balance,
        rate: s.rate,
        years: s.years,
        extraMonthly: s.extra,
      }),
    format: money,
    results: [
      {
        label: "Standard Monthly Payment",
        value: (r) => `${money(r.monthlyPayment)} / mo`,
        emphasis: true,
      },
      { label: "Total Interest", value: (r) => money(r.totalInterest) },
      { label: "Total Loan Cost", value: (r) => money(r.totalRepaid) },
      {
        label: "Interest Saved with Extra Payment",
        value: (r) => (r.savingsWithExtra > 0 ? money(r.savingsWithExtra) : "$0"),
      },
      {
        label: "Payoff Time with Extra Payment",
        value: (r) =>
          r.extraMonthly > 0
            ? `${r.monthsWithExtra} Months (${(r.monthsWithExtra / 12).toFixed(1)} Yrs)`
            : "Standard schedule",
      },
    ],
    table: {
      caption: "Student Loan Repayment Schedule",
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
    guide: <UsStudentLoanArticle />,
  };
});
