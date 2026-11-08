import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateTax, GST_RATES } from "@/engines/tax";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaGstArticle } from "@/components/articles/ja/JaGstArticle";
import { RuVatArticle } from "@/components/articles/ru/RuVatArticle";
import { InGstArticle } from "@/components/articles/in/InGstArticle";
import { EsVatArticle } from "@/components/articles/es/EsFinanceArticles";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const usLocale = locale === "us";
  const jaLocale = locale === "ja";
  const ruLocale = locale === "ru";
  const esLocale = locale === "es";

  return {
    appCategory: "FinanceApplication",
    eyebrow: ruLocale
      ? "Калькулятор НДС"
      : esLocale
      ? "Calculadora de IVA"
      : usLocale
      ? "Sales Tax"
      : jaLocale
      ? "消費税"
      : "GST",
    points: ruLocale
      ? ["Сумма без НДС", "Сумма НДС (20% / 10%)", "Итоговая сумма с НДС"]
      : [c.baseAmount, c.taxAmount, c.total],
    anchor: "gst-calculator",
    defaults: {
      amount: esLocale ? 1_000 : 10_000,
      rate: ruLocale ? 20 : esLocale ? 21 : jaLocale ? 10 : 18,
      inclusive: 0,
    },
    fields: [
      {
        key: "amount",
        label: ruLocale ? "Сумма операции (руб.)" : jaLocale ? "金額（円）" : c.amount,
        value: esLocale ? 1_000 : 10_000,
        min: 0,
        max: 100_000_000,
        step: esLocale ? 10 : 100,
        slider: { min: esLocale ? 10 : 100, max: esLocale ? 50_000 : 1_000_000, step: esLocale ? 10 : 100 },
        prefix: p,
      },
      {
        key: "rate",
        label: ruLocale
          ? "Ставка НДС (основная 20% / льготная 10%)"
          : jaLocale
          ? "消費税率（標準10%・軽減8%）"
          : c.gstRate,
        value: ruLocale ? 20 : esLocale ? 21 : jaLocale ? 10 : 18,
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
          : esLocale
          ? [0, 4, 10, 16, 19, 21]
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
          : esLocale
          ? "¿El importe ya incluye IVA?"
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
          : esLocale
          ? [
              { label: "No (añadir IVA)", value: 0 },
              { label: "Sí (desglosar IVA)", value: 1 },
            ]
          : [
              { label: "No (add tax)", value: 0 },
              { label: "Yes (remove tax)", value: 1 },
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
    donut: (r) => ({
      items: [
        {
          label: ruLocale ? "Сумма без НДС" : jaLocale ? "税抜本体価格" : c.baseAmount,
          value: r.baseAmount,
          color: "#0284c7",
        },
        {
          label: ruLocale ? "Сумма НДС" : jaLocale ? "消費税額" : c.taxAmount,
          value: r.taxAmount,
          color: "#f59e0b",
        },
      ],
      centerLabel: ruLocale ? "НДС" : esLocale ? "IVA" : jaLocale ? "税率" : "Tax",
    }),
    guide: jaLocale ? <JaGstArticle /> : ruLocale ? <RuVatArticle /> : esLocale ? <EsVatArticle /> : <InGstArticle />,
  };
});
