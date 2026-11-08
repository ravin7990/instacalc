import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateRd, applyTaxOnInterest } from "@/engines/deposits";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaRdArticle } from "@/components/articles/ja/JaRdArticle";
import { RuDepositArticle } from "@/components/articles/ru/RuDepositArticle";
import { InRdArticle } from "@/components/articles/in/InRdArticle";
import { EsRdArticle } from "@/components/articles/es/EsFinanceArticles";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const isRu = locale === "ru";
  const isEs = locale === "es";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu
      ? "Калькулятор пополняемого вклада"
      : isEs
      ? "Plan de ahorro programado"
      : "Deposit Planner",
    points: [c.maturity, c.investedTotal, c.interest],
    anchor: "rd-calculator",
    defaults: { deposit: isEs ? 3_600 : 50_000, rate: isEs ? 3.5 : 7, years: 10, taxRate: isEs ? 19 : 0 },
    fields: [
      {
        key: "deposit",
        label: isRu ? "Регулярный взнос (руб.)" : c.annual,
        value: isEs ? 3_600 : 50_000,
        min: isEs ? 100 : 500,
        max: 10_000_000,
        step: isEs ? 100 : 500,
        slider: { min: isEs ? 500 : 1000, max: isEs ? 50_000 : 500_000, step: isEs ? 500 : 1000 },
        prefix: p,
        chips: isRu
          ? [5000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
              label: `${v / 1000} тыс. ₽`,
              value: v,
            }))
          : isEs
          ? [1_200, 2_400, 3_600, 6_000, 12_000].map((v) => ({
              label: `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K €`,
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
        value: isEs ? 3.5 : 7,
        min: 0.5,
        max: 20,
        step: 0.1,
        suffix: c.percent,
        chips: (isEs ? [2.5, 3, 3.5, 4, 5] : [4, 6, 7, 8, 10]).map((v) => ({ label: `${v}%`, value: v })),
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
        value: isEs ? 19 : 0,
        min: 0,
        max: 50,
        step: 0.5,
        suffix: c.percent,
        chips: (isRu ? [0, 13, 15] : isEs ? [0, 19, 21, 23] : [0, 15, 20, 30]).map((v) => ({
          label: `${v}%`,
          value: v,
        })),
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
      title:
        locale === "ja"
          ? "積立預金残高推移"
          : isRu
          ? "Динамика накоплений на вкладе"
          : isEs
          ? "Evolución del ahorro programado"
          : "Recurring Deposit Growth Trajectory",
      subtitle:
        locale === "ja"
          ? "積立累計額と利息の推移グラフ"
          : isRu
          ? "Рост баланса пополняемого вклада"
          : isEs
          ? "Saldo acumulado frente al total aportado a lo largo del plazo"
          : "Accumulated balance vs total deposited over time",
      labels: r.rows.map((row: any) =>
        isEs ? `Año ${row.year}` : `${locale === "ja" ? "" : "Yr "}${row.year}${locale === "ja" ? "年目" : ""}`,
      ),
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
    guide: locale === "ja" ? <JaRdArticle /> : isRu ? <RuDepositArticle /> : isEs ? <EsRdArticle /> : <InRdArticle />,
  };
});
