import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateRd, applyTaxOnInterest } from "@/engines/deposits";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaRdArticle } from "@/components/articles/ja/JaRdArticle";
import { RuDepositArticle } from "@/components/articles/ru/RuDepositArticle";
import { InFdArticle } from "@/components/articles/in/InFdArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const isRu = locale === "ru";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu ? "Калькулятор пополняемого вклада" : "Deposit Planner",
    points: [c.maturity, c.investedTotal, c.interest],
    anchor: "rd-calculator",
    defaults: { deposit: 50_000, rate: 7, years: 10, taxRate: 0 },
    fields: [
      {
        key: "deposit",
        label: isRu ? "Регулярный взнос (руб.)" : c.annual,
        value: 50_000,
        min: 500,
        max: 10_000_000,
        step: 500,
        slider: { min: 1000, max: 500_000, step: 1000 },
        prefix: p,
        chips: isRu
          ? [5000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
              label: `${v / 1000} тыс. ₽`,
              value: v,
            }))
          : [5000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
              label: locale === "ja" ? (v >= 10000 ? `${v / 10000}万円` : `${v / 1000}千円`) : `${p}${v / 1000}K`,
              value: v,
            })),
      },

      {
        key: "rate",
        label: isRu ? "Процентная ставка по вкладу" : c.rate,
        value: 7,
        min: 1,
        max: 20,
        step: 0.1,
        suffix: c.percent,
        chips: [4, 6, 7, 8, 10].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "years",
        label: isRu ? "Срок накопления (лет)" : c.years,
        value: 10,
        min: 1,
        max: 30,
        step: 1,
        slider: { min: 1, max: 25, step: 1 },
        suffix: c.yearsSuffix,
        chips: [3, 5, 10, 15, 20].map((v) => ({ label: `${v}`, value: v })),
      },
    ],
    advancedFields: [
      {
        key: "taxRate",
        label: isRu ? "Ставка налога на процентный доход (НДФЛ)" : c.taxRate,
        value: 0,
        min: 0,
        max: 50,
        step: 0.5,
        suffix: c.percent,
        chips: (isRu ? [0, 13, 15] : [0, 15, 20, 30]).map((v) => ({ label: `${v}%`, value: v })),
      },
    ],
    engine: (s) => {
      const base = calculateRd(s.deposit, s.rate, s.years);
      const tax = applyTaxOnInterest(base.totalInterest, s.taxRate);
      return { ...base, ...tax };
    },
    format: money,
    results: [
      { label: isRu ? "Итоговая сумма накоплений" : c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: isRu ? "Всего внесено" : c.investedTotal, value: (r) => money(r.totalDeposited) },
      { label: isRu ? "Начисленные проценты" : c.interest, value: (r) => money(r.totalInterest) },
      { label: isRu ? "Налог (НДФЛ)" : c.taxAmount, value: (r) => money(r.tax) },
    ],
    donut: (r) => ({
      items: [
        { label: isRu ? "Всего внесено" : c.investedTotal, value: r.totalDeposited, color: "#0284c7" },
        { label: isRu ? "Начисленные проценты" : c.interest, value: r.totalInterest, color: "#10b981" },
      ],
      centerLabel: isRu ? "Доход" : c.interest,
    }),
    timeline: (r) => ({
      title: locale === "ja" ? "積立預金残高推移" : isRu ? "Динамика накоплений на вкладе" : "Recurring Deposit Growth Trajectory",
      subtitle: locale === "ja" ? "積立累計額と利息の推移グラフ" : isRu ? "Рост баланса пополняемого вклада" : "Accumulated balance vs total deposited over time",
      labels: r.rows.map((row: any) => `${locale === "ja" ? "" : "Yr "}${row.year}${locale === "ja" ? "年目" : ""}`),
      datasets: [
        {
          label: isRu ? "Итоговый баланс" : c.maturity,
          data: r.rows.map((row: any) => row.balance),
          color: "#0284c7",
          fill: true,
        },
        {
          label: isRu ? "Всего внесено" : c.investedTotal,
          data: r.rows.map((row: any) => row.deposited),
          color: "#64748b",
          dashed: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: isRu ? ["Год", "Внесено", "Проценты", "Баланс"] : [c.schedule, c.investedTotal, c.interest, c.maturity],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.deposited),
          money(row.interest),
          money(row.balance),
        ]),
    },
    guide: locale === "ja" ? <JaRdArticle /> : isRu ? <RuDepositArticle /> : <InFdArticle />,
  };
});
