import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculatePaycheck, type PayFrequency, FREQ_PERIODS } from "@/engines/us-loans";
import { usCopy } from "@/i18n/us-labels";
import { symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsPaycheckArticle } from "@/components/articles/us/UsPaycheckArticle";

const FREQUENCIES: Array<{ label: string; value: PayFrequency }> = [
  { label: "Bi-Weekly (26)", value: "biweekly" },
  { label: "Weekly (52)", value: "weekly" },
  { label: "Semi-Monthly (24)", value: "semimonthly" },
  { label: "Monthly (12)", value: "monthly" },
];

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: "US Salary and Taxes",
    points: [
      "Per Paycheck Take-Home",
      "2026 Federal Tax Brackets",
      "FICA Social Security & Medicare",
      "Pre-Tax 401(k) & Health Deductions",
    ],
    anchor: "paycheck-calculator",
    defaults: {
      salary: 85_000,
      freqIdx: 0,
      statusIdx: 0,
      k401: 6,
      health: 120,
      stateTax: 0,
    },
    fields: [
      {
        key: "salary",
        label: "Annual Gross Salary",
        value: 85_000,
        min: 10_000,
        max: 2_000_000,
        step: 1_000,
        slider: { min: 20_000, max: 300_000, step: 2_500 },
        prefix: p,
        chips: [45_000, 65_000, 85_000, 120_000, 175_000].map((v) => ({
          label: `${p}${v / 1000}K`,
          value: v,
        })),
      },
      {
        key: "freqIdx",
        label: "Pay Frequency",
        value: 0,
        min: 0,
        max: FREQUENCIES.length - 1,
        step: 1,
        chips: FREQUENCIES.map((f, i) => ({ label: f.label, value: i })),
      },
      {
        key: "statusIdx",
        label: "Filing Status",
        value: 0,
        min: 0,
        max: 1,
        step: 1,
        chips: [
          { label: "Single", value: 0 },
          { label: "Married Filing Jointly", value: 1 },
        ],
      },
    ],
    advancedFields: [
      {
        key: "k401",
        label: "401(k) Contribution (Pre-Tax)",
        value: 6,
        min: 0,
        max: 50,
        step: 1,
        suffix: "%",
        chips: [0, 3, 6, 10, 15].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "health",
        label: "Health Insurance (per paycheck)",
        value: 120,
        min: 0,
        max: 2_000,
        step: 10,
        prefix: p,
        chips: [0, 50, 100, 150, 250].map((v) => ({ label: `${p}${v}`, value: v })),
      },
      {
        key: "stateTax",
        label: "State Income Tax Rate (0% for TX/FL/WA/NV)",
        value: 0,
        min: 0,
        max: 15,
        step: 0.1,
        suffix: "%",
        chips: [
          { label: "0% (TX/FL/WA)", value: 0 },
          { label: "3.07% (PA)", value: 3.07 },
          { label: "5% (Avg)", value: 5 },
          { label: "6% (GA/NC)", value: 6 },
          { label: "9.3% (CA)", value: 9.3 },
        ],
      },
    ],
    engine: (s) =>
      calculatePaycheck({
        annualSalary: s.salary,
        frequency: FREQUENCIES[s.freqIdx]?.value ?? "biweekly",
        filingStatus: s.statusIdx === 1 ? "married" : "single",
        k401Percent: s.k401,
        healthPerPeriod: s.health,
        stateTaxRate: s.stateTax,
      }),
    format: money,
    results: [
      {
        label: "Take-Home Pay (Per Paycheck)",
        value: (r) => money(r.netPerPaycheck),
        emphasis: true,
      },
      { label: "Annual Take-Home Net", value: (r) => money(r.annualNet) },
      { label: "Federal Income Tax (Annual)", value: (r) => money(r.federalTax) },
      { label: "State Income Tax (Annual)", value: (r) => money(r.stateTax) },
      { label: "Social Security (Annual)", value: (r) => money(r.socialSecurity) },
      { label: "Medicare (Annual)", value: (r) => money(r.medicare + r.additionalMedicare) },
      { label: "Effective Tax Rate", value: (r) => `${r.effectiveTaxRate.toFixed(1)}%` },
    ],
    table: {
      caption: "Paycheck Deduction Breakdown",
      head: ["Item", "Per Paycheck", "Annual Amount"],
      rows: (r) =>
        r.deductions.map((d: any) => [
          d.name,
          money(d.perPaycheck),
          money(d.annual),
        ]),
    },
    guide: <UsPaycheckArticle />,
  };
});
