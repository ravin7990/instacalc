import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateFire, type FireTier, type FireTiming } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { UsFireArticle } from "@/components/articles/us/UsFireArticle";

const TIERS: FireTier[] = ["lean", "standard", "fat"];
const TIMINGS: FireTiming[] = ["monthly", "start", "end"];

/** FIRE number: annual expenses divided by the safe withdrawal rate. */
export default function FireCalculator({ seo }: { seo: SeoRecord }) {
  const c = usCopy(seo.locale);
  const p = symbol(seo.locale);
  const money = (n: number) => moneyFormat(seo.locale, n);

  const [s, setS] = useState({
    expenses: 60_000, netWorth: 150_000, savings: 30_000,
    swr: 4, ret: 7, tier: 1, timing: 0,
  });

  const result = useMemo(
    () =>
      calculateFire({
        annualExpenses: s.expenses,
        currentNetWorth: s.netWorth,
        annualSavings: s.savings,
        safeWithdrawalRate: s.swr,
        realReturn: s.ret,
        tier: TIERS[s.tier] ?? "standard",
        timing: TIMINGS[s.timing] ?? "monthly",
      }),
    [s],
  );

  const set = (k: keyof typeof s) => (v: number) => setS((x) => ({ ...x, [k]: v }));
  const tierLabel = [c.leanFire, c.standardFire, c.fatFire];

  const fields: FieldSpec[] = [
    {
      key: "expenses", label: c.annualExpenses, value: s.expenses,
      min: 10_000, max: 1_000_000, step: 1_000,
      slider: { min: 20_000, max: 300_000, step: 5_000 },
      prefix: p,
      chips: [30_000, 45_000, 60_000, 90_000, 120_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    { key: "netWorth", label: c.netWorth, value: s.netWorth, min: 0, max: 20_000_000, step: 5_000, prefix: p },
    {
      key: "savings", label: c.annualSavings, value: s.savings,
      min: 0, max: 1_000_000, step: 1_000,
      slider: { min: 5_000, max: 200_000, step: 5_000 },
      prefix: p,
      chips: [10_000, 20_000, 30_000, 50_000, 100_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
    },
    { key: "swr", label: c.safeWithdrawalRate, value: s.swr, min: 1, max: 10, step: 0.5, suffix: "%",
      chips: [3, 3.5, 4, 4.5, 5].map((v) => ({ label: `${v}%`, value: v })) },
    { key: "ret", label: c.realReturn, value: s.ret, min: 1, max: 15, step: 0.5, suffix: "%",
      chips: [4, 6, 7, 8].map((v) => ({ label: `${v}%`, value: v })) },
  ];

  const pct = Math.round(result.progressPercent);
  const years = result.yearsToFire === null ? "—" : result.yearsToFire === 0 ? "Reached" : `${result.yearsToFire} ${c.year}`;

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.eyebrow}
          points={[c.fireTarget, c.yearsToFire, c.monthlyIncome, c.multiple]}
        />

        <CalculatorShell
          locale={seo.locale}
          id="fire-calculator"
          title={c.fireTarget}
          summary={{ label: c.fireTarget, value: money(result.target) }}
          inputs={
            <>
              <div className="field-card">
                <div className="field-head">
                  <span id="tier-label">{c.fireTarget}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="tier-label">
                  {TIERS.map((t, i) => (
                    <button
                      key={t}
                      type="button"
                      className={`chip${s.tier === i ? " active" : ""}`}
                      aria-pressed={s.tier === i}
                      onClick={() => setS((x) => ({ ...x, tier: i }))}
                    >
                      {tierLabel[i]}
                    </button>
                  ))}
                </div>
              </div>

              {fields.map((f) => <Field key={f.key} spec={f} onChange={set(f.key as keyof typeof s)} />)}

              <div className="field-card">
                <p className="field-hint">{c.netWorth} → {c.fireTarget}</p>
                <div
                  className="progress"
                  role="img"
                  aria-label={`${c.netWorth}: ${pct}%`}
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <p className="field-result">{pct}% of {c.fireTarget}</p>
              </div>
            </>
          }
          results={
            <ul className="kv-list">
              {/* FIRE target is the headline; not repeated here. */}
              <li>
                <span className="kv-key">{c.leanFire}</span>
                <span className="kv-value">{money(result.leanTarget)}</span>
              </li>
              <li>
                <span className="kv-key">{c.standardFire}</span>
                <span className="kv-value">{money(result.standardTarget)}</span>
              </li>
              <li>
                <span className="kv-key">{c.fatFire}</span>
                <span className="kv-value">{money(result.fatTarget)}</span>
              </li>
              <li>
                <span className="kv-key">{c.yearsToFire}</span>
                <span className="kv-value">{years}</span>
              </li>
              <li>
                <span className="kv-key">{c.remaining}</span>
                <span className="kv-value">{money(result.remaining)}</span>
              </li>
              <li>
                <span className="kv-key">{c.monthlyIncome}</span>
                <span className="kv-value">{money(result.safeMonthlyIncome)}</span>
              </li>
              <li>
                <span className="kv-key">{c.multiple}</span>
                <span className="kv-value">{result.multiple}x</span>
              </li>
            </ul>
          }
        />

        <UsFireArticle />

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
