import { createCalculatorPage } from "@/calculators/createCalculatorPage";
import { calculateMortgage } from "@/engines/us-retirement";
import { usCopy } from "@/i18n/us-labels";
import { formatWithUnits, symbol, money as moneyFormat } from "@/lib/currency";
import type { Locale } from "@/config/site";
import { UsMortgageArticle } from "@/components/articles/us/UsMortgageArticle";
import { EsMortgageArticle } from "@/components/articles/es/EsFinanceArticles";

export default createCalculatorPage((locale: Locale) => {
  const c = usCopy(locale);
  const p = symbol(locale);
  const money = (n: number) => moneyFormat(locale, n);
  const isEs = locale === "es";

  return {
    appCategory: "FinanceApplication",
    eyebrow: c.eyebrow,
    points: [c.monthlyPayment, c.principalInterest, c.totalInterest, c.pmi],
    anchor: "mortgage-calculator",
    defaults: {
      price: isEs ? 250_000 : 450_000,
      down: 20,
      rate: isEs ? 3.5 : 6.8,
      years: 30,
      tax: isEs ? 0.6 : 1.2,
      insurance: isEs ? 400 : 1_400,
      hoa: 0,
      extra: 0,
    },
    fields: [
      {
        key: "price", label: c.homePrice, value: isEs ? 250_000 : 450_000,
        min: 50_000, max: 5_000_000, step: 5_000,
        slider: { min: 100_000, max: 2_000_000, step: 25_000 },
        prefix: p,
        chips: (isEs ? [150_000, 200_000, 250_000, 350_000, 500_000] : [250_000, 350_000, 450_000, 650_000, 900_000]).map((v) => ({
          label: isEs ? `${v / 1000}K €` : `${p}${v / 1000}K`,
          value: v,
        })),
      },
      { key: "down", label: c.downPayment, value: 20, min: 0, max: 100, step: 1, suffix: "%",
        chips: [0, 5, 10, 20, 25].map((v) => ({ label: `${v}%`, value: v })) },
      { key: "rate", label: c.interestRate, value: isEs ? 3.5 : 6.8, min: 1, max: 15, step: 0.05, suffix: "%",
        chips: (isEs ? [2.5, 3, 3.5, 4.5, 6] : [3, 5, 6.5, 6.8, 8]).map((v) => ({ label: `${v}%`, value: v })) },
      { key: "years", label: c.loanTerm, value: 30, min: 5, max: 40, step: 5,
        suffix: c.year,
        chips: [15, 20, 25, 30].map((v) => ({ label: `${v}`, value: v })) },
    ],
    advancedFields: [
      {
        key: "extra",
        label: isEs ? "Amortización anticipada mensual" : "Extra Monthly Principal Payment",
        value: 0,
        min: 0,
        max: 5_000,
        step: 25,
        prefix: p,
        chips: [0, 100, 250, 500, 1_000].map((v) => ({ label: isEs ? `${v} €` : `${p}${v}`, value: v })),
      },
      { key: "tax", label: c.propertyTax, value: isEs ? 0.6 : 1.2, min: 0, max: 5, step: 0.05, suffix: "%",
        chips: (isEs ? [0.4, 0.6, 0.8, 1.1] : [0.5, 1, 1.2, 2]).map((v) => ({ label: `${v}%`, value: v })) },
      { key: "insurance", label: c.insurance, value: isEs ? 400 : 1_400, min: 0, max: 10_000, step: 100, prefix: p },
      { key: "hoa", label: c.hoa, value: 0, min: 0, max: 2_000, step: 25, prefix: p,
        chips: [0, 60, 100, 200].map((v) => ({ label: `${v}`, value: v })) },
    ],
    engine: (s) =>
      calculateMortgage({
        homePrice: s.price,
        downPercent: s.down,
        rate: s.rate,
        years: s.years,
        taxRate: s.tax,
        insurance: s.insurance,
        hoa: s.hoa,
        extraPayment: s.extra,
      }),
    format: money,
    results: [
      { label: c.monthlyPayment, value: (r) => money(r.totalMonthlyPayment), emphasis: true },
      { label: c.principalInterest, value: (r) => money(r.monthlyPI) },
      { label: isEs ? "Pago quincenal (1/2 C+I)" : "Bi-Weekly Payment (1/2 P&I)", value: (r) => money(r.biweeklyPayment) },
      { label: c.pmi, value: (r) => money(r.monthlyPmi) },
      { label: c.totalInterest, value: (r) => money(r.totalInterest) },
      { label: c.downPayment, value: (r) => money(r.downPayment) },
    ],
    donut: (r, s) => ({
      centerLabel: c.principalInterest,
      items: [
        { label: isEs ? "Capital del préstamo" : "Loan Principal", value: r.principal, color: "#0284c7" },
        { label: c.totalInterest, value: r.totalInterest, color: "#f59e0b" },
        { label: c.propertyTax, value: r.monthlyTax * 12 * s.years, color: "#6366f1" },
        { label: c.insurance, value: s.insurance * s.years, color: "#10b981" },
      ],
    }),
    timeline: (r) => {
      let cumPrincipal = 0;
      let cumInterest = 0;
      const principalArr: number[] = [];
      const interestArr: number[] = [];
      const balanceArr: number[] = [];
      r.rows.forEach((row: any) => {
        cumPrincipal += row.principalPaid;
        cumInterest += row.interestPaid;
        principalArr.push(cumPrincipal);
        interestArr.push(cumInterest);
        balanceArr.push(row.closing);
      });
      return {
        title: isEs ? "Evolución de la amortización hipotecaria" : "Mortgage Amortization Trajectory",
        subtitle: isEs
          ? "Saldo vivo pendiente frente al capital e intereses acumulados"
          : "Loan balance payoff versus cumulative principal and interest",
        labels: r.rows.map((row: any) => (isEs ? `Año ${row.year}` : `${c.year} ${row.year}`)),
        datasets: [
          { label: c.remainingBalance, data: balanceArr, color: "#0284c7", fill: true },
          { label: c.principalPaid, data: principalArr, color: "#10b981" },
          { label: c.totalInterest, data: interestArr, color: "#f59e0b" },
        ],
      };
    },
    table: {
      caption: c.yearsTable,
      head: [c.year, c.principalPaid, c.totalInterest, c.remainingBalance],
      rows: (r) =>
        r.rows.map((row: any) => [
          String(row.year),
          money(row.principalPaid),
          money(row.interestPaid),
          money(row.closing),
        ]),
    },
    guide: isEs ? <EsMortgageArticle /> : <UsMortgageArticle />,
  };
});
