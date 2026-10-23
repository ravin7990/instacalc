import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateCd } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsCdArticle } from "@/components/articles/us/UsCdArticle";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.netPayout, c.apy, c.totalInterest, c.earlyPenalty],
    anchor: "cd-calculator",
    // frequency: 0 = daily (365), 1 = monthly (12)
    defaults: { deposit: 25_000, apy: 5, months: 12, freq: 0, penalty: 0 },
    fields: [
      {
        key: "deposit", label: c.amount, value: 25_000,
        min: 100, max: 10_000_000, step: 100,
        slider: { min: 1_000, max: 500_000, step: 1_000 },
        prefix: p,
        chips: [5_000, 10_000, 25_000, 50_000, 100_000].map((v) => ({ label: `${p}${v / 1000}K`, value: v })),
      },
      { key: "apy", label: c.apy, value: 5, min: 0.1, max: 15, step: 0.05, suffix: "%",
        chips: [0.5, 1, 3, 4.5, 5].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "months", label: c.term, value: 12, min: 1, max: 84, step: 1,
        slider: { min: 3, max: 60, step: 1 },
        suffix: c.monthsSuffix,
        chips: [6, 12, 18, 24, 36, 60].map((v) => ({ label: `${v} mo`, value: v })) },
    ],
    advancedFields: [
      { key: "freq", label: c.compounding, value: 0, min: 0, max: 1, step: 1,
        chips: [
          { label: c.daily, value: 0 },
          { label: c.monthlyCompounding, value: 1 },
        ] },
      { key: "penalty", label: c.earlyPenalty, value: 0, min: 0, max: 24, step: 1,
        suffix: c.monthsSuffix,
        chips: [0, 3, 6, 12].map((v) => ({ label: `${v} mo`, value: v })) },
    ],
    engine: (s) =>
      calculateCd({
        principal: s.deposit,
        apy: s.apy,
        months: s.months,
        frequency: s.freq === 0 ? 365 : 12,
        penaltyMonths: s.penalty,
      }),
    format: money,
    results: [
      { label: c.netPayout, value: (r) => money(r.netPayout), emphasis: true },
      { label: c.amount, value: (_r, s) => money(s.deposit) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
      { label: c.apy, value: (r) => `${r.nominalRate.toFixed(3)}% nominal` },
    ],
    donut: (r, s) => ({
      centerLabel: c.totalInterest,
      items: [
        { label: c.amount, value: s.deposit, color: "#0284c7" },
        { label: c.totalInterest, value: r.totalInterest, color: "#10b981" },
        ...(r.penaltyAmount > 0
          ? [{ label: c.earlyPenalty, value: r.penaltyAmount, color: "#f59e0b" }]
          : []),
      ],
    }),
    timeline: (r, s) => {
      const totalMonths = Math.max(1, Math.round(s.months));
      const step = totalMonths <= 12 ? 1 : totalMonths <= 36 ? 3 : 6;
      const labels: string[] = [];
      const balanceData: number[] = [];
      const interestData: number[] = [];
      const n = s.freq === 0 ? 365 : 12;
      const nominal = r.nominalRate / 100;

      for (let m = 0; m <= totalMonths; m += step) {
        labels.push(`Mo ${m}`);
        const bal = Math.round(s.deposit * Math.pow(1 + nominal / n, n * (m / 12)));
        balanceData.push(bal);
        interestData.push(Math.max(0, bal - s.deposit));
      }
      if (totalMonths % step !== 0) {
        labels.push(`Mo ${totalMonths}`);
        balanceData.push(r.balance);
        interestData.push(r.totalInterest);
      }

      return {
        title: "Certificate of Deposit Growth",
        subtitle: "Compound balance accumulation over the CD term",
        labels,
        datasets: [
          { label: c.netPayout, data: balanceData, color: "#10b981", fill: true },
          { label: c.totalInterest, data: interestData, color: "#0284c7" },
        ],
      };
    },
    guide: <UsCdArticle />,
  };
});
