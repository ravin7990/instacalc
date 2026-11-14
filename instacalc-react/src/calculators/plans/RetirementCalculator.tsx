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
import { useCurrency } from "@/app/CurrencyContext";
import { UsRetirementArticle } from "@/components/articles/us/UsRetirementArticle";
import { JaRetirementArticle } from "@/components/articles/ja/JaRetirementArticle";
import { RuRetirementArticle } from "@/components/articles/ru/RuRetirementArticle";
import { InRetirementArticle } from "@/components/articles/in/InRetirementArticle";
import { EsRetirementArticle } from "@/components/articles/es/EsFinanceArticles";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";

/**
 * Full retirement planner: accumulation to retirement, then drawdown to life
 * expectancy. Serves the India, US, Japanese, Russian and Spanish editions —
 * the maths is currency-agnostic, only the labels differ.
 */
export default function RetirementCalculator({ seo }: { seo: SeoRecord }) {
  const { symbol: activeSym } = useCurrency();
  const c = usCopy(seo.locale);
  const p = activeSym;
  const money = (n: number) => moneyFormat(seo.locale, n);
  const isRu = seo.locale === "ru";
  const isJa = seo.locale === "ja";
  const isEs = seo.locale === "es";

  const [s, setS] = useState({
    age: 32,
    retire: isEs ? 65 : 60,
    life: 85,
    expense: isEs ? 2000 : 4000,
    otherIncome: 1000,
    savings: isEs ? 40_000 : 50_000,
    contribution: isEs ? 400 : 600,
    stepup: isEs ? 3 : 4,
    preReturn: isEs ? 7 : 8,
    postReturn: 5,
    inflation: 3,
    bequest: isEs ? 30_000 : 50_000,
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

  const t = {
    lifeExpectancy: isRu
      ? "Ожидаемая продолжительность жизни"
      : isJa
      ? "想定寿命"
      : isEs
      ? "Esperanza de vida"
      : "Life Expectancy",
    monthlyExpenses: isRu
      ? "Текущие ежемесячные расходы"
      : isJa
      ? "現在の月間生活費"
      : isEs
      ? "Gastos mensuales actuales"
      : "Monthly Expenses Today",
    otherIncome: isRu
      ? "Другие пенсионные доходы (в месяц)"
      : isJa
      ? "その他の年金・月収"
      : isEs
      ? "Otros ingresos en la jubilación (mensual)"
      : "Other Retirement Income (monthly)",
    stepUp: isRu
      ? "Ежегодное увеличение взноса"
      : isJa
      ? "積立額の年次増額率"
      : isEs
      ? "Incremento anual de la aportación"
      : "Annual Contribution Step-Up",
    postReturn: isRu
      ? "Доходность на пенсии"
      : isJa
      ? "リタイア後の想定利回り"
      : isEs
      ? "Rentabilidad tras la jubilación"
      : "Post-Retirement Return",
    inflation: isRu
      ? "Ожидаемая инфляция"
      : isJa
      ? "想定インフレ率"
      : isEs
      ? "Inflación esperada"
      : "Expected Inflation",
    bequest: isRu
      ? "Наследство (целевой остаток)"
      : isJa
      ? "目標遺産額"
      : isEs
      ? "Herencia / saldo objetivo"
      : "Target Bequest",
    targetGoal: isRu
      ? "Необходимый капитал"
      : isJa
      ? "目標必要資金"
      : isEs
      ? "Capital necesario"
      : seo.locale === "us"
      ? "Target Nest Egg"
      : "Required Corpus",
    shortfall: isRu ? "Нехватка капитала" : isJa ? "不足額" : isEs ? "Déficit de capital" : "Shortfall",
    firstYearExpense: isRu
      ? "Расходы в 1-й год пенсии"
      : isJa
      ? "リタイア初年度の生活費"
      : isEs
      ? "Gastos en el 1.er año de jubilación"
      : "First-Year Expense",
    otherIncomeRow: isRu ? "Другой доход" : isJa ? "その他収入" : isEs ? "Otros ingresos" : "Other Income",
    firstYearWithdrawal: isRu
      ? "Изъятие в 1-й год пенсии"
      : isJa
      ? "初年度の取り崩し額"
      : isEs
      ? "Retiro neto en el 1.er año"
      : "First-Year Withdrawal",
    retirementLength: isRu
      ? "Длительность пенсии"
      : isJa
      ? "リタイア期間"
      : isEs
      ? "Duración de la jubilación"
      : "Retirement Length",
    onTrack: isRu ? "Цель достигнута" : isJa ? "目標達成" : isEs ? "En camino al objetivo" : "On track",
    shortBy: (amt: string) =>
      isRu ? `Не хватает ${amt}` : isJa ? `不足: ${amt}` : isEs ? `Faltan ${amt}` : `Short by ${amt}`,
  };

  const fields: FieldSpec[] = [
    { key: "age", label: c.currentAge, value: s.age, min: 18, max: 70, step: 1, suffix: c.year,
      chips: [25, 30, 35, 40, 45].map((v) => ({ label: `${v}`, value: v })) },
    { key: "retire", label: c.retireAge, value: s.retire, min: 40, max: 75, step: 1, suffix: c.year,
      chips: [55, 60, 63, 65, 67].map((v) => ({ label: `${v}`, value: v })) },
    { key: "life", label: t.lifeExpectancy, value: s.life, min: 60, max: 100, step: 1, suffix: c.year,
      chips: [75, 80, 85, 90].map((v) => ({ label: `${v}`, value: v })) },
    {
      key: "expense", label: t.monthlyExpenses, value: s.expense,
      min: 0, max: 500_000, step: isEs ? 100 : 500,
      slider: { min: isEs ? 500 : 1_000, max: isEs ? 15_000 : 50_000, step: isEs ? 100 : 500 },
      prefix: p,
      chips: (isEs ? [1200, 2000, 3000, 4500, 6000] : [1000, 2500, 4000, 7500, 15000]).map((v) => ({
        label: isEs ? `${v} €` : `${p}${v}`,
        value: v,
      })),
    },
    { key: "otherIncome", label: t.otherIncome, value: s.otherIncome, min: 0, max: 200_000, step: 100, prefix: p },
    {
      key: "savings", label: c.currentBalance, value: s.savings,
      min: 0, max: 50_000_000, step: isEs ? 2_500 : 10_000,
      slider: { min: 0, max: isEs ? 1_000_000 : 2_000_000, step: isEs ? 5_000 : 10_000 },
      prefix: p,
      chips: (isEs ? [0, 20_000, 50_000, 150_000, 300_000] : [0, 50_000, 250_000, 1_000_000, 5_000_000]).map((v) => ({
        label: isEs ? `${v / 1000}K €` : `${p}${v / 1000}K`,
        value: v,
      })),
    },
    {
      key: "contribution", label: c.annualContribution, value: s.contribution,
      min: 0, max: 200_000, step: 50,
      slider: { min: 0, max: 20_000, step: 100 },
      prefix: p,
      chips: (isEs ? [100, 250, 400, 800, 1500] : [100, 500, 600, 1500, 5000]).map((v) => ({
        label: isEs ? `${v} €` : `${p}${v}`,
        value: v,
      })),
    },
  ];

  const advancedFields: FieldSpec[] = [
    { key: "stepup", label: t.stepUp, value: s.stepup, min: 0, max: 15, step: 0.5, suffix: "%",
      chips: [0, 2, 3, 4, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "preReturn", label: c.expectedReturn, value: s.preReturn, min: 1, max: 15, step: 0.5, suffix: "%",
      chips: [5, 7, 8, 10, 12].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "postReturn", label: t.postReturn, value: s.postReturn, min: 0, max: 12, step: 0.5, suffix: "%",
      chips: [3, 4, 5, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "inflation", label: t.inflation, value: s.inflation, min: 0, max: 12, step: 0.5, suffix: "%",
      chips: [2, 3, 4, 6].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "bequest", label: t.bequest, value: s.bequest, min: 0, max: 10_000_000, step: isEs ? 5_000 : 10_000, prefix: p },
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
            <>
              <ul className="kv-list">
                {/* Projected corpus is the headline; not repeated here. */}
                {rows.map((r) => (
                  <li key={r.k}>
                    <span className="kv-key">{r.k}</span>
                    <span className="kv-value">{r.v}</span>
                  </li>
                ))}
              </ul>
              <BreakdownDonutChart
                items={[
                  { label: c.totalContributed, value: result.totalInvested, color: "#0284c7" },
                  { label: c.totalGrowth, value: Math.max(0, result.projectedCorpus - result.totalInvested), color: "#10b981" },
                ]}
                centerLabel={c.totalGrowth}
                locale={seo.locale}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title={
              seo.locale === "ja"
                ? "老後資産形成シミュレーション推移"
                : seo.locale === "ru"
                ? "Динамика формирования пенсионного капитала"
                : isEs
                ? "Acumulación del patrimonio para la jubilación"
                : "Retirement Corpus Accumulation"
            }
            subtitle={
              seo.locale === "ja"
                ? "退職までの積立額と予想資産残高の推移"
                : isEs
                ? "Ahorro proyectado frente a las aportaciones acumuladas hasta la edad de retiro"
                : "Projected retirement savings vs cumulative contributions"
            }
            labels={result.accumulation.map((r) => (isEs ? `Edad ${r.age}` : `Age ${r.age}`))}
            datasets={[
              {
                label: c.corpus,
                data: result.accumulation.map((r) => r.balance),
                color: "#0284c7",
                fill: true,
              },
              {
                label: c.totalContributed,
                data: result.accumulation.map((r) => r.totalInvested),
                color: "#64748b",
                dashed: true,
              },
            ]}
            locale={seo.locale}
          />
          <ProjectionTable
            caption={c.yearsTable}
            head={[c.year, isEs ? "Edad" : "Age", c.annualContribution, c.totalContributed, c.corpus]}
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
        {seo.locale === "ru" && <RuRetirementArticle />}
        {seo.locale === "es" && <EsRetirementArticle />}
        {seo.locale === "en" && <InRetirementArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
