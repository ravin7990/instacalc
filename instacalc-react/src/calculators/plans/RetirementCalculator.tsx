import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { planRetirement } from "@/engines/retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { UsRetirementArticle } from "@/components/articles/us/UsRetirementArticle";
import { JaRetirementArticle } from "@/components/articles/ja/JaRetirementArticle";
import { RuCompoundArticle } from "@/components/articles/ru/RuCompoundArticle";
import { InCompoundArticle } from "@/components/articles/in/InCompoundArticle";

/**
 * Full retirement planner: accumulation to retirement, then drawdown to life
 * expectancy. Serves the India, US, Japanese and Russian editions — the maths
 * is currency-agnostic, only the labels differ.
 */
export default function RetirementCalculator({ seo }: { seo: SeoRecord }) {
  const c = usCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [s, setS] = useState({
    age: 32, retire: 60, life: 85,
    expense: 4000, otherIncome: 1000, savings: 50_000, contribution: 600,
    stepup: 4, preReturn: 8, postReturn: 5, inflation: 3, bequest: 50_000,
  });

  // The engine uses descriptive names; state uses short keys for compact specs.
  const result = useMemo(
    () =>
      planRetirement({
        currentAge: s.age,
        retirementAge: s.retire,
        lifeExpectancy: s.life,
        currentMonthlyExpense: s.expense,
        otherRetirementIncome: s.otherIncome,
        currentSavings: s.savings,
        monthlyContribution: s.contribution,
        annualStepup: s.stepup,
        preRetReturn: s.preReturn,
        postRetReturn: s.postReturn,
        inflation: s.inflation,
        targetBequest: s.bequest,
      }),
    [s],
  );
  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));

  const isRu = seo.locale === "ru";
  const isJa = seo.locale === "ja";

  const t = {
    lifeExpectancy: isRu ? "Ожидаемая продолжительность жизни" : isJa ? "想定寿命" : "Life Expectancy",
    monthlyExpenses: isRu ? "Текущие ежемесячные расходы" : isJa ? "現在の月間生活費" : "Monthly Expenses Today",
    otherIncome: isRu ? "Другие пенсионные доходы (в месяц)" : isJa ? "その他の年金・月収" : "Other Retirement Income (monthly)",
    stepUp: isRu ? "Ежегодное увеличение взноса" : isJa ? "積立額の年次増額率" : "Annual Contribution Step-Up",
    postReturn: isRu ? "Доходность на пенсии" : isJa ? "リタイア後の想定利回り" : "Post-Retirement Return",
    inflation: isRu ? "Ожидаемая инфляция" : isJa ? "想定インフレ率" : "Expected Inflation",
    bequest: isRu ? "Наследство (целевой остаток)" : isJa ? "目標遺産額" : "Target Bequest",
    targetGoal: isRu ? "Необходимый капитал" : isJa ? "目標必要資金" : seo.locale === "us" ? "Target Nest Egg" : "Required Corpus",
    shortfall: isRu ? "Нехватка капитала" : isJa ? "不足額" : "Shortfall",
    firstYearExpense: isRu ? "Расходы в 1-й год пенсии" : isJa ? "リタイア初年度の生活費" : "First-Year Expense",
    otherIncomeRow: isRu ? "Другой доход" : isJa ? "その他収入" : "Other Income",
    firstYearWithdrawal: isRu ? "Изъятие в 1-й год пенсии" : isJa ? "初年度の取り崩し額" : "First-Year Withdrawal",
    retirementLength: isRu ? "Длительность пенсии" : isJa ? "リタイア期間" : "Retirement Length",
    onTrack: isRu ? "Цель достигнута" : isJa ? "目標達成" : "On track",
    shortBy: (amt: string) => (isRu ? `Не хватает ${amt}` : isJa ? `不足: ${amt}` : `Short by ${amt}`),
  };

  const fields: FieldSpec[] = [
    { key: "age", label: c.currentAge, value: s.age, min: 18, max: 70, step: 1, suffix: c.year,
      chips: [25, 30, 35, 40, 45].map((v) => ({ label: `${v}`, value: v })) },
    { key: "retire", label: c.retireAge, value: s.retire, min: 40, max: 75, step: 1, suffix: c.year,
      chips: [55, 58, 60, 63, 65].map((v) => ({ label: `${v}`, value: v })) },
    { key: "life", label: t.lifeExpectancy, value: s.life, min: 60, max: 100, step: 1, suffix: c.year,
      chips: [75, 80, 85, 90].map((v) => ({ label: `${v}`, value: v })) },
    {
      key: "expense", label: t.monthlyExpenses, value: s.expense,
      min: 0, max: 500_000, step: 500,
      slider: { min: 1_000, max: 50_000, step: 500 },
      prefix: p,
      chips: [1000, 2500, 4000, 7500, 15000].map((v) => ({ label: `${p}${v}`, value: v })),
    },
    { key: "otherIncome", label: t.otherIncome, value: s.otherIncome, min: 0, max: 200_000, step: 100, prefix: p },
    {
      key: "savings", label: c.currentBalance, value: s.savings,
      min: 0, max: 50_000_000, step: 10_000,
      slider: { min: 0, max: 2_000_000, step: 10_000 },
      prefix: p,
      chips: [0, 50_000, 250_000, 1_000_000, 5_000_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    {
      key: "contribution", label: c.annualContribution, value: s.contribution,
      min: 0, max: 200_000, step: 50,
      slider: { min: 0, max: 20_000, step: 100 },
      prefix: p,
      chips: [100, 500, 600, 1500, 5000].map((v) => ({ label: `${p}${v}`, value: v })),
    },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "stepup", label: t.stepUp, value: s.stepup, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [0, 2, 4, 6, 10].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "preReturn", label: c.expectedReturn, value: s.preReturn, min: 1, max: 15, step: 0.5, suffix: "%",
      chips: [5, 7, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "postReturn", label: t.postReturn, value: s.postReturn, min: 0, max: 12, step: 0.5, suffix: "%",
      chips: [3, 4, 5, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "inflation", label: t.inflation, value: s.inflation, min: 0, max: 12, step: 0.5, suffix: "%",
      chips: [2, 3, 4, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "bequest", label: t.bequest, value: s.bequest, min: 0, max: 10_000_000, step: 10_000, prefix: p },
  ];

  const pct = Math.min(100, (result.projectedCorpus / Math.max(1, result.requiredCorpus)) * 100);

  const targetGoalLabel = t.targetGoal;

  const rows: Array<{ k: string; v: string }> = [
    { k: targetGoalLabel, v: money(result.requiredCorpus) },
    { k: t.shortfall, v: money(result.shortfall) },
    { k: c.totalContributed, v: money(result.totalInvested) },
    { k: t.firstYearExpense, v: money(result.firstYearExpense) },
    { k: t.otherIncomeRow, v: money(result.firstYearOtherIncome) },
    { k: t.firstYearWithdrawal, v: money(result.firstYearNetWithdrawal) },
    { k: c.monthlyIncome, v: money(result.monthlyIncomeAtRetirement) },
    { k: t.retirementLength, v: `${result.retirementYears} ${c.year}` },
  ];

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.corpus, c.yearsToFire, c.remaining, c.monthlyIncome]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="retirement-calculator"
          title={c.corpus}
          summary={{ label: c.corpus, value: money(result.projectedCorpus) }}
          inputs={
            <>
              {fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
              {advancedFields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}
              <div className="field-card">
                <p className="field-hint">{c.corpus} vs {targetGoalLabel}</p>
                <div
                  className="progress"
                  role="img"
                  aria-label={`${c.corpus}: ${Math.round(pct)}%`}
                  aria-valuenow={Math.round(pct)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="field-result">
                  {result.onTrack ? t.onTrack : t.shortBy(money(result.shortfall))}
                </p>
              </div>
            </>
          }
          results={
            <ul className="kv-list">
              {/* Projected corpus is the headline; not repeated here. */}
              {rows.map((r) => (
                <li key={r.k}>
                  <span className="kv-key">{r.k}</span>
                  <span className="kv-value">{r.v}</span>
                </li>
              ))}
            </ul>
          }
        >
          <ProjectionTable
            caption={c.yearsTable}
            head={[c.year, "Age", c.annualContribution, c.totalContributed, c.corpus]}
            rows={result.accumulation.map((r) => [
              String(r.year),
              String(r.age),
              formatCurrency(seo.locale, r.annualContribution),
              formatCurrency(seo.locale, r.totalInvested),
              formatCurrency(seo.locale, r.balance),
            ])}
          />
        </CalculatorShell>

        {seo.locale === "us" && <UsRetirementArticle />}
        {seo.locale === "ja" && <JaRetirementArticle />}
        {seo.locale === "ru" && <RuCompoundArticle />}
        {seo.locale === "en" && <InCompoundArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}