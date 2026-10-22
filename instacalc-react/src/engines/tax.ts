/**
 * GST and sales-tax engine.
 *
 * Handles both directions: deriving the tax-exclusive amount from a tax-inclusive
 * price, and adding tax on top of a base amount.
 */

export interface TaxInputs {
  amount: number;
  ratePercent: number;
  /** When true, `amount` already includes the tax. */
  inclusive: boolean;
}

export interface TaxResult {
  baseAmount: number;
  taxAmount: number;
  totalAmount: number;
  /** Share of the total that is tax, in percent. */
  taxShare: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateTax({ amount, ratePercent, inclusive }: TaxInputs): TaxResult {
  const r = ratePercent / 100;

  if (inclusive) {
    // amount = base * (1 + r)  ->  base = amount / (1 + r)
    const base = r > 0 ? amount / (1 + r) : amount;
    const tax = amount - base;
    return {
      baseAmount: round2(base),
      taxAmount: round2(tax),
      totalAmount: round2(amount),
      taxShare: amount > 0 ? round2((tax / amount) * 100) : 0,
    };
  }

  const tax = amount * r;
  const total = amount + tax;
  return {
    baseAmount: round2(amount),
    taxAmount: round2(tax),
    totalAmount: round2(total),
    taxShare: round2(r * 100),
  };
}

/** Splits a tax-inclusive amount into the rate buckets used by Indian GST. */
export const GST_RATES = [0, 0.25, 3, 5, 12, 18, 28] as const;

export function splitByRate(baseAmount: number, ratePercent: number) {
  const { taxAmount, totalAmount } = calculateTax({ amount: baseAmount, ratePercent, inclusive: false });
  return { baseAmount: round2(baseAmount), taxAmount, totalAmount };
}
