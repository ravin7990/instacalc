import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo";
import type { Locale } from "@/config/site";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell, ResultList } from "@/components/calculator/CalculatorShell";
import { Field, type FieldSpec } from "@/components/calculator/CalculatorField";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { ProjectionTable } from "@/components/calculator/ProjectionTable";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import { symbol } from "@/lib/currency";

/**
 * Declarative calculator page factory.
 *
 * Most tools share one shape: a few numeric inputs, a derived result set and an
 * optional year-wise table. Describing them as data keeps each tool down to its
 * engine plus a spec instead of ~150 lines of repeated JSX.
 *
 * The spec is a function of the locale, so labels, chips and currency symbols
 * are resolved per language at render time.
 */

export interface ResultSpec {
  label: string;
  value: (r: any, state: any) => string;
  emphasis?: boolean;
}

export interface TableSpec {
  caption: string;
  head: string[];
  rows: (r: any, state: any) => string[][];
}

export interface CalculatorSpec {
  appCategory?: string;
  eyebrow?: string;
  points?: string[];
  /** Anchor id for the calculator section, e.g. "sip-planner". */
  anchor?: string;
  /** Overrides the locale's default currency symbol. */
  currencySymbol?: string;
  defaults: Record<string, number>;
  fields: FieldSpec[];
  /** Extra controls revealed by the advanced toggle. */
  advancedFields?: FieldSpec[];
  engine: (state: Record<string, number>) => any;
  results: ResultSpec[];
  table?: TableSpec;
  /** Formats a raw number for display in results and table cells. */
  format: (value: number) => string;
  /** Modes rendered as a segmented control (SIP vs Lumpsum, etc.). */
  modes?: Array<{ href: string; label: string; active?: boolean }>;
  /** Optional editorial guide / reference section rendered above FAQs. */
  guide?: React.ReactNode;
}

export function createCalculatorPage(specFor: (locale: Locale) => CalculatorSpec) {
  return function CalculatorPage({ seo }: { seo: SeoRecord }) {
    const locale = seo.locale;
    const spec = specFor(locale);
    const prefix = spec.currencySymbol ?? symbol(locale);

    const [state, setState] = useState<Record<string, number>>(spec.defaults);
    const [advanced, setAdvanced] = useState(false);

    const result = useMemo(() => spec.engine(state), [spec, state]);
    const set = (key: string) => (v: number) => setState((s) => ({ ...s, [key]: v }));

    // The figure with `emphasis` (else the first) becomes the headline result;
    // the rest render as supporting tiles beneath it.
    const headline = spec.results.find((r) => r.emphasis) ?? spec.results[0];
    const supporting = spec.results.filter((r) => r !== headline);

    // Plain-text version of the output, for the copy action beside the result.
    const summaryText = [
      ...(headline ? [`${headline.label}: ${headline.value(result, state)}`] : []),
      ...supporting.map((r) => `${r.label}: ${r.value(result, state)}`),
    ].join("\n");

    const bind = (f: FieldSpec): FieldSpec => ({
      ...f,
      value: state[f.key] ?? f.value,
      prefix: f.prefix === "\u0000" ? prefix : f.prefix,
      chips: f.chips?.map((c) =>
        c.label === "\u0000" ? { ...c, label: `${prefix}${c.value / 1000}K` } : c,
      ),
    });

    return (
      <>
        <SeoHead seo={seo} appCategory={spec.appCategory} />
        <Layout locale={locale}>
          <CalculatorHero seo={seo} eyebrow={spec.eyebrow} points={spec.points} />

          <CalculatorShell
            locale={locale}
            id={spec.anchor}
            advanced={advanced}
            onToggleAdvanced={spec.advancedFields?.length ? () => setAdvanced((v) => !v) : undefined}
            modes={spec.modes}
            summary={
              headline ? { label: headline.label, value: headline.value(result, state) } : null
            }
            summaryText={summaryText || undefined}
            onReset={() => setState(spec.defaults)}
            inputs={
              <>
                {spec.fields.map((f) => (
                  <Field key={f.key} spec={bind(f)} onChange={set(f.key)} />
                ))}
                {advanced
                  ? (spec.advancedFields ?? []).map((f) => (
                      <Field key={f.key} spec={bind(f)} onChange={set(f.key)} />
                    ))
                  : null}
              </>
            }
            results={
              <ResultList
                items={supporting.map((r) => ({
                  label: r.label,
                  value: r.value(result, state),
                }))}
              />
            }
          >
            {spec.table ? (
              <ProjectionTable
                caption={spec.table.caption}
                head={spec.table.head}
                rows={spec.table.rows(result, state)}
              />
            ) : null}
          </CalculatorShell>

          {spec.guide}

          <FaqAccordion locale={locale} items={extractFaq(seo)} />
        </Layout>
      </>
    );
  };
}
