import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateFd, applyTaxOnInterest } from "@/engines/deposits";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { JaFdArticle } from "@/components/articles/ja/JaFdArticle";
import { RuDepositArticle } from "@/components/articles/ru/RuDepositArticle";
import { InFdArticle } from "@/components/articles/in/InFdArticle";
import { EsDepositArticle } from "@/components/articles/es/EsFinanceArticles";

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const isRu = locale === "ru";
  const isEs = locale === "es";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu ? "Калькулятор вкладов" : isEs ? "Depósito a plazo fijo" : "Deposit Planner",
    points: [c.maturity, c.interest, c.taxAmount],
    anchor: "fd-calculator",
    defaults: { principal: isEs ? 25_000 : 500_000, rate: isEs ? 3.5 : 7, years: 5, taxRate: isEs ? 19 : 0 },
    fields: [
      {
        key: "principal",
        label: isRu ? "Сумма вклада (руб.)" : c.amount,
        value: isEs ? 25_000 : 500_000,
        min: 1000,
        max: 100_000_000,
        step: 1000,
        slider: { min: isEs ? 1_000 : 10_000, max: isEs ? 500_000 : 10_000_000, step: isEs ? 1_000 : 10_000 },
        prefix: p,
        chips: isRu
          ? [100_000, 300_000, 500_000, 1_000_000, 1_400_000].map((v) => ({
              label: v >= 1_000_000 ? `${v / 1_000_000} млн ₽` : `${v / 1000} тыс. ₽`,
              value: v,
            }))
          : isEs
          ? [5_000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
              label: `${v / 1000}K €`,
              value: v,
            }))
          : [100_000, 250_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
              label: locale === "ja" ? `${v / 10000}万円` : `${p}${v / 100_000}L`,
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
        label: isRu ? "Срок вклада (лет)" : c.years,
        value: 5,
        min: 1,
        max: 30,
        step: 1,
        slider: { min: 1, max: 20, step: 1 },
        suffix: c.yearsSuffix,
        chips: [1, 3, 5, 10, 20].map((v) => ({ label: `${v}`, value: v })),
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
      const base = calculateFd(s.principal, s.rate, s.years);
      const tax = applyTaxOnInterest(base.totalInterest, s.taxRate);
      return { ...base, ...tax };
    },
    format: money,
    results: [
      { label: isRu ? "Сумма к возврату (с процентами)" : c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: isRu ? "Начисленные проценты" : c.interest, value: (r) => money(r.totalInterest) },
      { label: isRu ? "Налог (НДФЛ)" : c.taxAmount, value: (r) => money(r.tax) },
    ],
    donut: (r, s) => ({
      items: [
        { label: isRu ? "Сумма вклада" : c.amount, value: s.principal, color: "#0284c7" },
        { label: isRu ? "Начисленные проценты" : c.interest, value: r.totalInterest, color: "#10b981" },
      ],
      centerLabel: isRu ? "Доход" : c.interest,
    }),
    timeline: (r) => ({
      title:
        locale === "ja"
          ? "定期預金残高推移"
          : isRu
          ? "Динамика роста вклада"
          : isEs
          ? "Evolución del depósito a plazo fijo"
          : "Fixed Deposit Growth Trajectory",
      subtitle:
        locale === "ja"
          ? "元本と利息累計の推移"
          : isRu
          ? "Рост баланса депозита по годам"
          : isEs
          ? "Saldo al vencimiento frente al capital depositado"
          : "Maturity balance vs principal over time",
      labels: r.rows.map((row: any) =>
        isEs ? `Año ${row.year}` : `${locale === "ja" ? "" : "Yr "}${row.year}${locale === "ja" ? "年目" : ""}`,
      ),
      datasets: [
        {
          label: isRu ? "Баланс депозита" : c.maturity,
          data: r.rows.map((row: any) => row.balance),
          color: "#0284c7",
          fill: true,
        },
        {
          label: isRu ? "Сумма вклада" : c.amount,
          data: r.rows.map((row: any) => row.deposited),
          color: "#64748b",
          dashed: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: isRu ? ["Год", "Депозит", "Проценты", "Баланс"] : [c.schedule, c.amount, c.interest, c.maturity],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.deposited),
          money(row.interest),
          money(row.balance),
        ]),
    },
    guide: locale === "ja" ? <JaFdArticle /> : isRu ? <RuDepositArticle /> : isEs ? <EsDepositArticle /> : <InFdArticle />,
  };
});
