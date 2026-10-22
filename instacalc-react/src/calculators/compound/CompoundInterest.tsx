import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateCompound, type Frequency } from "@/engines/interest";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { fieldCopy } from "@/i18n/field-labels";
import type { Locale } from "@/config/site";
import { UsCompoundInterestArticle } from "@/components/articles/us/UsCompoundInterestArticle";
import { JaCompoundInterestArticle } from "@/components/articles/ja/JaCompoundInterestArticle";
import { RuCompoundArticle } from "@/components/articles/ru/RuCompoundArticle";
import { InCompoundArticle } from "@/components/articles/in/InCompoundArticle";

const FREQUENCIES: Array<{ key: Frequency; label: string; steps: number }> = [
  { key: "yearly", label: "Yearly", steps: 1 },
  { key: "quarterly", label: "Quarterly", steps: 4 },
  { key: "monthly", label: "Monthly", steps: 12 },
  { key: "weekly", label: "Weekly", steps: 52 },
  { key: "daily", label: "Daily", steps: 365 },
];

const RU_FREQ = ["Раз в год", "Раз в квартал", "Ежемесячно", "Еженедельно", "Каждый день"];

export default createCalculatorPage((locale: Locale) => {
  const c = fieldCopy(locale);
  const p = symbol(locale);
  const money = (v: number) => moneyFormat(locale, v);
  const idx = (v: number) => Math.max(0, FREQUENCIES.findIndex((f) => f.steps === v));
  const isRu = locale === "ru";

  return {
    appCategory: "FinanceApplication",
    eyebrow: isRu ? "Сложные проценты и капитализация" : "Investment Planner",
    points: [c.maturity, c.investedTotal, c.interest],
    anchor: "compound-calculator",
    defaults: { principal: 200_000, rate: 10, years: 10, freq: 2, recurring: 0 },
    fields: [
      {
        key: "principal",
        label: isRu ? "Начальный капитал (руб.)" : c.amount,
        value: 200_000,
        min: 100,
        max: 100_000_000,
        step: 100,
        slider: { min: 1000, max: 10_000_000, step: 1000 },
        prefix: p,
        chips: locale === "us"
          ? [10_000, 25_000, 50_000, 100_000, 250_000].map((v) => ({
              label: `${p}${v / 1000}K`,
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
        value: 10,
        min: 0.1,
        max: 30,
        step: 0.1,
        suffix: c.percent,
        chips: [5, 8, 10, 12, 15].map((v) => ({ label: `${v}%`, value: v })),
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
        label: isRu ? "Периодичность капитализации" : "Compounding Frequency",
        value: 2,
        min: 0,
        max: FREQUENCIES.length - 1,
        step: 1,
        chips: FREQUENCIES.map((f, i) => ({ label: isRu ? RU_FREQ[i] : f.label, value: i })),
      },
    ],
    advancedFields: [
      {
        key: "recurring",
        label: isRu ? "Регулярное пополнение (за каждый период)" : `Recurring Deposit (per ${FREQUENCIES[2].label.toLowerCase()})`,
        value: 0,
        min: 0,
        max: 1_000_000,
        step: 100,
        prefix: p,
      },
    ],
    engine: (s) => {
      const perYear = FREQUENCIES[idx(s.freq)].steps;
      // The recurring amount is entered per compounding period.
      const recurringPerPeriod = s.recurring / perYear;
      const years = s.years / perYear;
      return calculateCompound({
        principal: s.principal,
        ratePercent: s.rate,
        years,
        frequency: FREQUENCIES[idx(s.freq)].key,
        recurring: recurringPerPeriod,
      });
    },
    format: money,
    results: [
      { label: isRu ? "Итоговый капитал" : c.maturity, value: (r) => money(r.maturity), emphasis: true },
      { label: isRu ? "Вложенные средства" : c.investedTotal, value: (r) => money(r.totalInvested) },
      { label: isRu ? "Начисленные проценты" : c.interest, value: (r) => money(r.totalInterest) },
    ],
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
      ) : (
        <InCompoundArticle />
      ),
  };
});

