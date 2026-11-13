import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateCompound, type Frequency } from "@/engines/interest";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { UsCompoundInterestArticle } from "@/components/articles/us/UsCompoundInterestArticle";
import { JaCompoundInterestArticle } from "@/components/articles/ja/JaCompoundInterestArticle";
import { RuCompoundArticle } from "@/components/articles/ru/RuCompoundArticle";
import { InCompoundArticle } from "@/components/articles/in/InCompoundArticle";
import { EsCompoundArticle } from "@/components/articles/es/EsFinanceArticles";

const FREQUENCIES: Array<{ key: Frequency; label: string; steps: number }> = [
  { key: "yearly", label: "Yearly", steps: 1 },
  { key: "quarterly", label: "Quarterly", steps: 4 },
  { key: "monthly", label: "Monthly", steps: 12 },
  { key: "weekly", label: "Weekly", steps: 52 },
  { key: "daily", label: "Daily", steps: 365 },
];

const RU_FREQ = ["Раз в год", "Раз в квартал", "Ежемесячно", "Еженедельно", "Каждый день"];
const ES_FREQ = ["Anual (1 al año)", "Trimestral (4 al año)", "Mensual (12 al año)", "Semanal (52 al año)", "Diaria (365 al año)"];

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const idx = (v: number) => Math.max(0, FREQUENCIES.findIndex((f) => f.steps === v));
  const isRu = locale === "ru";
  const isEs = locale === "es";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu
      ? "Сложные проценты и капитализация"
      : isEs
      ? "Interés compuesto y capitalización"
      : "Investment Planner",
    points: [c.maturity, c.investedTotal, c.interest],
    anchor: "compound-calculator",
    defaults: { principal: isEs ? 20_000 : 200_000, rate: isEs ? 7 : 10, years: 10, freq: 2, recurring: 0 },
    fields: [
      {
        key: "principal",
        label: isRu ? "Начальный капитал (руб.)" : c.amount,
        value: isEs ? 20_000 : 200_000,
        min: 100,
        max: 100_000_000,
        step: 100,
        slider: { min: 1000, max: isEs ? 500_000 : 10_000_000, step: 1000 },
        prefix: p,
        chips: locale === "us"
          ? [10_000, 25_000, 50_000, 100_000, 250_000].map((v) => ({
              label: `${p}${v / 1000}K`,
              value: v,
            }))
          : isEs
          ? [5_000, 10_000, 20_000, 50_000, 100_000].map((v) => ({
              label: `${v / 1000}K €`,
              value: v,
            }))
          : isRu
          ? [50_000, 100_000, 300_000, 500_000, 1_000_000].map((v) => ({
              label: v >= 1_000_000 ? `${v / 1_000_000} млн ₽` : `${v / 1000} тыс. ₽`,
              value: v,
            }))
          : [50_000, 100_000, 200_000, 500_000, 1_000_000].map((v) => ({
              label: `${p}${v / 100_000}L`,
              value: v,
            })),
      },
      {
        key: "rate",
        label: isRu ? "Годовая процентная ставка" : c.rate,
        value: isEs ? 7 : 10,
        min: 0.1,
        max: 30,
        step: 0.1,
        suffix: c.percent,
        chips: [5, 7, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })),
      },
      {
        key: "years",
        label: isRu ? "Срок инвестирования (лет)" : c.years,
        value: 10,
        min: 1,
        max: 40,
        step: 1,
        slider: { min: 1, max: 30, step: 1 },
        suffix: c.yearsSuffix,
        chips: [1, 5, 10, 20, 30].map((v) => ({ label: `${v}`, value: v })),
      },
      {
        key: "freq",
        label: isRu
          ? "Периодичность капитализации"
          : isEs
          ? "Frecuencia de capitalización"
          : "Compounding Frequency",
        value: 2,
        min: 0,
        max: FREQUENCIES.length - 1,
        step: 1,
        type: "select",
        options: FREQUENCIES.map((f, i) => ({
          label: isRu ? RU_FREQ[i] : isEs ? ES_FREQ[i] : f.label,
          value: i,
        })),
        chips: FREQUENCIES.map((f, i) => ({
          label: isRu ? RU_FREQ[i] : isEs ? (i === 0 ? "Anual" : i === 1 ? "Trimestral" : i === 2 ? "Mensual" : i === 3 ? "Semanal" : "Diaria") : f.label,
          value: i,
        })),
      },
    ],
    advancedFields: [
      {
        key: "recurring",
        label: isRu
          ? "Регулярное пополнение (за каждый период)"
          : isEs
          ? "Aportación periódica (por periodo)"
          : `Recurring Deposit (per ${FREQUENCIES[2].label.toLowerCase()})`,
        value: 0,
        min: 0,
        max: 1_000_000,
        step: 100,
        prefix: p,
      },
    ],
    engine: (s) => {
      const fIndex = typeof s.freq === "number" && s.freq >= 0 && s.freq < FREQUENCIES.length ? s.freq : 2;
      const freqObj = FREQUENCIES[fIndex] ?? FREQUENCIES[2];
      const perYear = freqObj.steps;
      // The recurring amount is entered per compounding period.
      const recurringPerPeriod = s.recurring / perYear;
      return calculateCompound({
        principal: s.principal,
        ratePercent: s.rate,
        years: s.years,
        frequency: freqObj.key,
        recurring: recurringPerPeriod,
      });
    },
    format: money,
    results: [
      { label: isRu ? "Итоговый капитал" : c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: isRu ? "Вложенные средства" : c.investedTotal, value: (r) => money(r.totalInvested) },
      { label: isRu ? "Начисленные проценты" : c.interest, value: (r) => money(r.totalInterest) },
    ],
    donut: (r) => ({
      items: [
        { label: isRu ? "Вложенные средства" : c.investedTotal, value: r.totalInvested, color: "#0284c7" },
        { label: isRu ? "Начисленные проценты" : c.interest, value: r.totalInterest, color: "#10b981" },
      ],
      centerLabel: isRu ? "Доход" : c.interest,
    }),
    timeline: (r) => ({
      title: isRu
        ? "Динамика сложного процента"
        : locale === "ja"
        ? "複利運用による資産推移"
        : isEs
        ? "Evolución del interés compuesto"
        : "Compound Growth Trajectory",
      subtitle: isRu
        ? "Рост баланса капитала по годам"
        : isEs
        ? "Capital acumulado frente al total aportado a lo largo del tiempo"
        : "Accumulated balance vs total invested over time",
      labels: r.rows.map((row: any) =>
        isEs ? `Año ${row.year}` : `${locale === "ja" ? "" : "Yr "}${row.year}${locale === "ja" ? "年目" : ""}`,
      ),
      datasets: [
        {
          label: isRu ? "Итоговый капитал" : c.maturity,
          data: r.rows.map((row: any) => row.amount),
          color: "#0284c7",
          fill: true,
        },
        {
          label: isRu ? "Вложенные средства" : c.investedTotal,
          data: r.rows.map((row: any) => row.invested),
          color: "#64748b",
          dashed: true,
        },
      ],
    }),
    table: {
      caption: c.yearsTable,
      head: isRu
        ? ["Год", "Вложено", "Начислено процентов", "Баланс капитала"]
        : [c.schedule, c.investedTotal, c.interest, c.maturity],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.invested),
          money(row.interest),
          money(row.amount),
        ]),
    },
    guide:
      locale === "us" ? (
        <UsCompoundInterestArticle />
      ) : locale === "ja" ? (
        <JaCompoundInterestArticle />
      ) : locale === "ru" ? (
        <RuCompoundArticle />
      ) : locale === "es" ? (
        <EsCompoundArticle />
      ) : (
        <InCompoundArticle />
      ),
  };
});
