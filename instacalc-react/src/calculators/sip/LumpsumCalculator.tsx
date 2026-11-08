import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo";
import { Layout } from "@/components/layout/Layout";
import { localeOrRoot } from "@/data/pageExists";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { calculateCompound } from "@/engines/interest";
import { formatCompact, formatCurrency, formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import { sipCopy } from "@/i18n/calculator-copy";
import { JaLumpsumArticle } from "@/components/articles/ja/JaLumpsumArticle";
import { InLumpsumArticle } from "@/components/articles/in/InLumpsumArticle";
import { EsLumpsumArticle } from "@/components/articles/es/EsFinanceArticles";
import { BreakdownDonutChart, TimelineGrowthChart } from "@/components/calculator/FinancialCharts";


/** One-time lumpsum investment, mirroring the SIP page's structure and styling. */
export default function LumpsumCalculator({ seo }: { seo: SeoRecord }) {
  const c = sipCopy(seo.locale);
  const p = symbol(seo.locale);
  const isEs = seo.locale === "es";

  const [amount, setAmount] = useState(isEs ? 25_000 : 500_000);
  const [rate, setRate] = useState(isEs ? 8 : 12);
  const [years, setYears] = useState(10);

  const result = useMemo(
    () => calculateCompound({ principal: amount, ratePercent: rate, years, frequency: "yearly" }),
    [amount, rate, years],
  );

  const money = (n: number) => moneyFormat(seo.locale, n);

  const fields: FieldSpec[] = [
    {
      key: "amount",
      label: c.oneTime,
      value: amount,
      min: 1000,
      max: 100_000_000,
      step: 1000,
      slider: { min: isEs ? 1_000 : 10_000, max: isEs ? 500_000 : 10_000_000, step: isEs ? 1_000 : 10_000 },
      prefix: p,
      chips: isEs
        ? [5_000, 10_000, 25_000, 50_000, 100_000].map((v) => ({
            label: `${v / 1000}K €`,
            value: v,
          }))
        : seo.locale === "ja"
        ? [100_000, 250_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
            label: `${v / 10_000}万円`,
            value: v,
          }))
        : [100_000, 250_000, 500_000, 1_000_000, 2_000_000].map((v) => ({
            label: `${p}${v / 100_000}L`,
            value: v,
          })),
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
      chips: [3, 5, 10, 20, 30].map((v) => ({ label: `${v}`, value: v })),
    },
  ];

  // Resolve cross-link to SIP page for locales that ship both.
  const sipHref = localeOrRoot(seo.locale, "sipcalculator.html");

  return (
    <>
      <SeoHead seo={seo} appCategory="FinanceApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={c.advanced}
          points={[c.corpus, c.returns, c.progress]}
          actions={
            sipHref
              ? [
                  {
                    href: sipHref,
                    label: isEs
                      ? "Cambiar a inversión mensual"
                      : seo.locale === "ja"
                      ? "積立投資へ切替"
                      : "Switch to SIP",
                  },
                ]
              : []
          }
        />

        <CalculatorShell
          locale={seo.locale}
          id="lumpsum-calculator"
          title={c.corpus}
          summary={{ label: c.corpus, value: formatCompact(seo.locale, result.maturity) }}
          inputs={
            <>
              {fields.map((f) => (
                <Field
                  key={f.key}
                  spec={{ ...f, value: f.key === "amount" ? amount : f.key === "rate" ? rate : years }}
                  onChange={(v) => (f.key === "amount" ? setAmount(v) : f.key === "rate" ? setRate(v) : setYears(v))}
                />
              ))}
            </>
          }
          results={
            <>
              <ResultList
                // "corpus" is the headline and is not repeated as a tile.
                items={[
                  { label: c.invested, value: money(result.totalInvested) },
                  { label: c.returns, value: money(result.totalInterest) },
                ]}
              />
              <BreakdownDonutChart
                items={[
                  { label: c.invested, value: result.totalInvested, color: "#0284c7" },
                  { label: c.returns, value: result.totalInterest, color: "#10b981" },
                ]}
                centerLabel={c.returns}
                locale={seo.locale}
              />
            </>
          }
        >
          <TimelineGrowthChart
            title={
              seo.locale === "ja"
                ? "一括投資資産形成グラフ"
                : isEs
                ? "Evolución de la inversión de suma global"
                : "Lumpsum Wealth Growth Journey"
            }
            subtitle={
              seo.locale === "ja"
                ? "元本と複利運用の資産推移"
                : isEs
                ? "Capital proyectado frente al desembolso único inicial"
                : "Projected corpus vs initial investment over time"
            }
            labels={result.rows.map((r) =>
              isEs ? `Año ${r.year}` : `${seo.locale === "ja" ? "" : "Yr "}${r.year}${seo.locale === "ja" ? "年目" : ""}`,
            )}
            datasets={[
              {
                label: c.corpus,
                data: result.rows.map((r) => r.amount),
                color: "#0284c7",
                fill: true,
              },
              {
                label: c.invested,
                data: result.rows.map((r) => r.invested),
                color: "#64748b",
                dashed: true,
              },
            ]}
            locale={seo.locale}
          />
          <ProjectionTable
            caption={c.progress}
            head={["#", c.invested, c.corpus, c.returns]}
            rows={result.rows.map((r) => [
              String(r.year),
              formatCurrency(seo.locale, r.invested),
              formatCurrency(seo.locale, r.amount),
              formatCurrency(seo.locale, r.interest),
            ])}
          />
        </CalculatorShell>

        {seo.locale === "ja" && <JaLumpsumArticle />}
        {seo.locale === "es" && <EsLumpsumArticle />}
        {seo.locale === "en" && <InLumpsumArticle />}
        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>

    </>
  );
}
