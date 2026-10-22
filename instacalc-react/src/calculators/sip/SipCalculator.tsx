import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateSip, requiredMonthlySip } from "@/engines/sip";
import { formatCompact, formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { sipCopy } from "@/i18n/calculator-copy";
import { JaSipArticle } from "@/components/articles/ja/JaSipArticle";
import { RuCompoundArticle } from "@/components/articles/ru/RuCompoundArticle";
import { InSipArticle } from "@/components/articles/in/InSipArticle";


export default function SipCalculator({ seo }: { seo: SeoRecord }) {
  const c = sipCopy(seo.locale);
  const prefix = symbol(seo.locale);

  const [monthly, setMonthly] = useState(25000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(0);
  const [inflation, setInflation] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [goalTarget, setGoalTarget] = useState(10_000_000);
  const [goalYears, setGoalYears] = useState(15);

  const result = useMemo(
    () => calculateSip({ monthly, annualRate: rate, years, stepUpPercent: stepUp, inflationPercent: inflation }),
    [monthly, rate, years, stepUp, inflation],
  );
  const required = useMemo(() => requiredMonthlySip(goalTarget, rate, goalYears), [goalTarget, rate, goalYears]);

  const money = (n: number) => moneyFormat(seo.locale, n);

  const setters: Record<string, (v: number) => void> = {
    monthly: setMonthly,
    rate: setRate,
    years: setYears,
    stepUp: setStepUp,
    inflation: setInflation,
  };

  const coreFields: FieldSpec[] = [
    {
      key: "monthly",
      label: c.monthly,
      value: monthly,
      min: 500,
      max: 500000,
      step: 500,
      slider: { min: 500, max: 200000, step: 500 },
      prefix,
      chips: [1000, 5000, 10000, 25000, 50000].map((v) => ({ label: `${prefix}${v / 1000}K`, value: v })),
    },
    {
      key: "rate",
      label: c.rate,
      value: rate,
      min: 1,
      max: 30,
      step: 0.5,
      suffix: c.rateSuffix,
      chips: [6, 8, 10, 12, 14].map((v) => ({ label: `${v}%`, value: v })),
    },
    {
      key: "years",
      label: c.years,
      value: years,
      min: 1,
      max: 40,
      step: 1,
      slider: { min: 1, max: 30, step: 1 },
      suffix: c.yearsSuffix,
      chips: [5, 10, 15, 20, 30].map((v) => ({ label: `${v}`, value: v })),
    },
  ];

  const advancedFields: FieldSpec[] = [
    {
      key: "stepUp",
      label: c.stepUp,
      value: stepUp,
      min: 0,
      max: 25,
      step: 1,
      suffix: "%",
      chips: [0, 5, 10, 15].map((v) => ({ label: `${v}%`, value: v })),
    },
    { key: "inflation", label: c.inflation, value: inflation, min: 0, max: 15, step: 0.5, suffix: "%" },
  ];

  const faq = extractFaq(seo);

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero seo={seo} eyebrow={c.advanced} points={[c.corpus, c.returns, c.realCorpus, c.goal]} />

        <CalculatorShell
          locale={seo.locale}
          id="sip-planner"
          title={c.corpus}
          advanced={advanced}
          onToggleAdvanced={() => setAdvanced((v) => !v)}
          summary={{ label: c.corpus, value: formatCompact(seo.locale, result.corpus) }}
          inputs={
            <>
              {coreFields.map((spec) => (
                <Field key={spec.key} spec={spec} onChange={setters[spec.key]} />
              ))}
              {advanced ? (
                <>
                  {advancedFields.map((spec) => (
                    <Field key={spec.key} spec={spec} onChange={setters[spec.key]} />
                  ))}
                  <GoalPlanner
                    prefix={prefix}
                    locale={seo.locale}
                    target={goalTarget}
                    years={goalYears}
                    required={required}
                    onTarget={setGoalTarget}
                    onYears={setGoalYears}
                  />
                </>
              ) : null}
            </>
          }
          results={
            <ResultList
              // "corpus" is the headline and is not repeated as a tile.
              items={[
                { label: c.invested, value: money(result.totalInvested) },
                { label: c.returns, value: money(result.estimatedReturns) },
                ...(advanced
                  ? [
                      { label: c.realCorpus, value: money(result.inflationAdjustedCorpus) },
                      { label: c.realReturns, value: money(result.realReturns) },
                    ]
                  : []),
              ]}
            />
          }
        >
          <ProjectionTable
            caption={c.progress}
            head={["#", c.invested, c.corpus, c.returns]}
            rows={result.rows.map((r) => [
              String(r.year),
              formatCurrency(seo.locale, r.contributed),
              formatCurrency(seo.locale, r.balance),
              formatCurrency(seo.locale, r.interest),
            ])}
          />
        </CalculatorShell>

        {seo.locale === "ja" && <JaSipArticle />}
        {seo.locale === "ru" && <RuCompoundArticle />}
        {seo.locale === "en" && <InSipArticle />}
        <FaqAccordion locale={seo.locale} items={faq} />
      </Layout>

    </>
  );
}

/** Advanced-only block: solve for the SIP required to hit a target corpus. */
function GoalPlanner({
  prefix,
  locale,
  target,
  years,
  required,
  onTarget,
  onYears,
}: {
  prefix: string;
  locale: SeoRecord["locale"];
  target: number;
  years: number;
  required: number;
  onTarget: (v: number) => void;
  onYears: (v: number) => void;
}) {
  const c = sipCopy(locale);
  return (
    <div className="field-card">
      <div className="field-head">
        <label htmlFor="goalTarget">{c.goalTarget}</label>
      </div>
      <div className="input-with-adornment">
        <span className="input-prefix" aria-hidden="true">
          {prefix}
        </span>
        <input
          id="goalTarget"
          type="number"
          className="has-prefix"
          min={100000}
          max={1000000000}
          step={100000}
          value={target}
          onChange={(e) => onTarget(Number(e.target.value) || 0)}
        />
      </div>
      <Field
        spec={{ key: "goalYears", label: c.goalYears, value: years, min: 1, max: 40, step: 1, suffix: c.yearsSuffix }}
        onChange={onYears}
      />
      <p className="field-result">
        {c.requiredSip}: <strong>{formatCurrency(locale, required)}</strong>
      </p>
    </div>
  );
}
