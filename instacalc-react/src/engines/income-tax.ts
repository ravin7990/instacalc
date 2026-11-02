/**
 * Indian Income Tax Engine (FY 2026-27 / AY 2027-28)
 *
 * Compares the New Tax Regime (Section 115BAC default) vs Old Tax Regime
 * for resident individuals (< 60 years), incorporating:
 * - Standard Deduction (₹75,000 for New Regime, ₹50,000 for Old Regime)
 * - Section 87A Rebate (up to ₹60,000 for New Regime on taxable income <= ₹12L; ₹12,500 for Old Regime on <= ₹5L)
 * - Marginal Relief on New Regime around ₹12 Lakh threshold
 * - 4% Health and Education Cess
 */

export interface IncomeTaxInputs {
  grossIncome: number;
  extraDeductions?: number;
  npsDeduction?: number;
}

export interface RegimeResult {
  taxableIncome: number;
  standardDeduction: number;
  baseTax: number;
  rebate87A: number;
  cess: number;
  totalTax: number;
}

export interface IncomeTaxResult {
  grossIncome: number;
  newRegime: RegimeResult;
  oldRegime: RegimeResult;
  difference: number;
  winner: "new" | "old" | "equal";
}

export function calculateIncomeTax(inputs: IncomeTaxInputs): IncomeTaxResult {
  const income = Math.max(0, inputs.grossIncome);
  const extraDeduct = Math.max(0, inputs.extraDeductions ?? 0);
  const nps = Math.max(0, Math.min(50000, inputs.npsDeduction ?? 0));

  // --- New Regime (FY 2026-27) ---
  const stdNew = Math.min(income, 75000);
  const taxableNew = Math.max(0, income - stdNew);
  let taxNew = 0;

  // New Regime slabs:
  // 0 - 4L: 0%
  // 4L - 8L: 5%
  // 8L - 12L: 10%
  // 12L - 16L: 15%
  // 16L - 20L: 20%
  // 20L - 24L: 25%
  // Above 24L: 30%
  const slabsNew: Array<[number, number, number]> = [
    [0, 400000, 0.00],
    [400000, 800000, 0.05],
    [800000, 1200000, 0.10],
    [1200000, 1600000, 0.15],
    [1600000, 2000000, 0.20],
    [2000000, 2400000, 0.25],
  ];

  for (const [lo, hi, rate] of slabsNew) {
    if (taxableNew > lo) {
      taxNew += (Math.min(taxableNew, hi) - lo) * rate;
    }
  }
  if (taxableNew > 2400000) {
    taxNew += (taxableNew - 2400000) * 0.30;
  }

  // Section 87A rebate under New Regime (up to ₹60,000 for taxable income <= ₹12L)
  let rebateNew = 0;
  if (taxableNew <= 1200000) {
    rebateNew = Math.min(taxNew, 60000);
  }

  // Marginal relief: tax should not exceed the excess income over ₹12 Lakh
  if (taxableNew > 1200000) {
    const taxAt12L = 0.05 * 400000 + 0.10 * 400000; // ₹60,000
    const excessIncome = taxableNew - 1200000;
    taxNew = Math.min(taxNew, taxAt12L + excessIncome);
  }

  taxNew = Math.max(0, taxNew - rebateNew);
  const cessNew = Math.round(taxNew * 0.04);
  const totalTaxNew = Math.round(taxNew + cessNew);

  // --- Old Regime (FY 2026-27 for residents < 60) ---
  const stdOld = Math.min(income, 50000);
  const totalDeductionsOld = Math.min(income, stdOld + extraDeduct + nps);
  const taxableOld = Math.max(0, income - totalDeductionsOld);
  let taxOld = 0;

  if (taxableOld > 1000000) {
    taxOld = 0.05 * 250000 + 0.20 * 500000 + 0.30 * (taxableOld - 1000000);
  } else if (taxableOld > 500000) {
    taxOld = 0.05 * 250000 + 0.20 * (taxableOld - 500000);
  } else if (taxableOld > 250000) {
    taxOld = 0.05 * (taxableOld - 250000);
  }

  let rebateOld = 0;
  if (taxableOld <= 500000) {
    rebateOld = Math.min(taxOld, 12500);
  }
  taxOld = Math.max(0, taxOld - rebateOld);
  const cessOld = Math.round(taxOld * 0.04);
  const totalTaxOld = Math.round(taxOld + cessOld);

  const diff = totalTaxOld - totalTaxNew;
  const winner = diff > 0 ? "new" : diff < 0 ? "old" : "equal";

  return {
    grossIncome: income,
    newRegime: {
      taxableIncome: taxableNew,
      standardDeduction: stdNew,
      baseTax: Math.round(taxNew),
      rebate87A: Math.round(rebateNew),
      cess: cessNew,
      totalTax: totalTaxNew,
    },
    oldRegime: {
      taxableIncome: taxableOld,
      standardDeduction: stdOld,
      baseTax: Math.round(taxOld),
      rebate87A: Math.round(rebateOld),
      cess: cessOld,
      totalTax: totalTaxOld,
    },
    difference: Math.abs(diff),
    winner,
  };
}
