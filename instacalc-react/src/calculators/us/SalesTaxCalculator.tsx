import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateTax } from "@/engines/tax";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsSalesTaxArticle } from "@/components/articles/us/UsSalesTaxArticle";

/** US sales tax, either added to or extracted from a price. */
export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.taxAmount, c.salesTax, c.netAmount],
    anchor: "sales-tax-calculator",
    // inclusive: 0 = tax added on top, 1 = tax already included in the price
    defaults: { amount: 100, rate: 8, inclusive: 0 },
    fields: [
      {
        key: "amount", label: c.amount, value: 100,
        min: 0, max: 10_000_000, step: 1,
        slider: { min: 10, max: 5_000, step: 10 },
        prefix: p,
        chips: [25, 50, 100, 500, 1000].map((v) => ({ label: `${p}${v}`, value: v })),
      },
      { key: "rate", label: c.taxRate, value: 8, min: 0, max: 20, step: 0.25, suffix: "%",
        chips: [4, 6, 7, 8, 10].map((v) => ({ label: `${v}%`, value: v })) },
      {
        key: "inclusive", label: c.salesTax, value: 0, min: 0, max: 1, step: 1,
        chips: [
          { label: "Add tax", value: 0 },
          { label: "Remove tax", value: 1 },
        ],
      },
    ],
    engine: (s) => calculateTax({ amount: s.amount, ratePercent: s.rate, inclusive: s.inclusive === 1 }),
    format: money,
    results: [
      { label: c.netAmount, value: (r) => money(r.totalAmount), emphasis: true },
      { label: c.amount, value: (r) => money(r.baseAmount) },
      { label: c.taxAmount, value: (r) => money(r.taxAmount) },
    ],
    guide: <UsSalesTaxArticle />,
  };
});
