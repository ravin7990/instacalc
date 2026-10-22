import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateTax, GST_RATES } from "@/engines/tax";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaGstArticle } from "@/components/articles/ja/JaGstArticle";
import { RuVatArticle } from "@/components/articles/ru/RuVatArticle";
import { InGstArticle } from "@/components/articles/in/InGstArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const usLocale = locale === "us";
  const jaLocale = locale === "ja";
  const ruLocale = locale === "ru";

  return {
    appCategory: "FinanceApplication",
    eyebrow: ruLocale ? "Калькулятор НДС" : usLocale ? "Sales Tax" : jaLocale ? "消費税" : "GST",
    points: ruLocale
      ? ["Сумма без НДС", "Сумма НДС (20% / 10%)", "Итоговая сумма с НДС"]
      : [c.baseAmount, c.taxAmount, c.total],
    anchor: "gst-calculator",
    defaults: { amount: 10_000, rate: ruLocale ? 20 : jaLocale ? 10 : 18, inclusive: 0 },
    fields: [
      {
        key: "amount",
        label: ruLocale ? "Сумма операции (руб.)" : jaLocale ? "金額（円）" : c.amount,
        value: 10_000,
        min: 0,
        max: 100_000_000,
        step: 100,
        slider: { min: 100, max: 1_000_000, step: 100 },
        prefix: p,
      },
      {
        key: "rate",
        label: ruLocale
          ? "Ставка НДС (основная 20% / льготная 10%)"
          : jaLocale
          ? "消費税率（標準10%・軽減8%）"
          : c.gstRate,
        value: ruLocale ? 20 : jaLocale ? 10 : 18,
        min: 0,
        max: 28,
        step: 0.25,
        suffix: c.percent,
        chips: (usLocale
          ? [0, 4, 6, 7, 10]
          : jaLocale
          ? [8, 10]
          : ruLocale
          ? [0, 5, 7, 10, 20]
          : GST_RATES
        ).map((v) => ({
          label: `${v}%`,
          value: v,
        })),
      },
      {
        key: "inclusive",
        label: ruLocale
          ? "Режим расчета НДС"
          : usLocale
          ? "Tax already included?"
          : jaLocale
          ? "計算区分（外税・内税）"
          : "Is tax included in the amount?",
        value: 0,
        min: 0,
        max: 1,
        step: 1,
        chips: ruLocale
          ? [
              { label: "Начислить НДС (сверху)", value: 0 },
              { label: "Выделить НДС (в том числе)", value: 1 },
            ]
          : jaLocale
          ? [
              { label: "税抜価格（外税・消費税を加算）", value: 0 },
              { label: "税込価格（内税・消費税を逆算）", value: 1 },
            ]
          : [
              { label: usLocale ? "No (add tax)" : "いいえ（税を加算）", value: 0 },
              { label: usLocale ? "Yes (remove tax)" : "はい（税を除算）", value: 1 },
            ],
      },
    ],
    engine: (s) => calculateTax({ amount: s.amount, ratePercent: s.rate, inclusive: s.inclusive === 1 }),
    format: money,
    results: [
      {
        label: ruLocale ? "Сумма без НДС" : jaLocale ? "税抜本体価格" : c.baseAmount,
        value: (r) => money(r.baseAmount),
      },
      {
        label: ruLocale ? "Сумма НДС" : jaLocale ? "消費税額" : c.taxAmount,
        value: (r) => money(r.taxAmount),
        emphasis: true,
      },
      {
        label: ruLocale ? "Итоговая сумма с НДС" : jaLocale ? "税込合計金額" : c.total,
        value: (r) => money(r.totalAmount),
      },
    ],
    guide: jaLocale ? <JaGstArticle /> : ruLocale ? <RuVatArticle /> : <InGstArticle />,
  };
});
