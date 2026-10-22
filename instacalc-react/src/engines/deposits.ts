/**
 * Fixed deposit / recurring deposit engine.
 *
 * FD compounds annually on a single principal; RD compounds on the accumulated
 * balance as each instalment is added, which is why RD is modelled as a loop.
 */

export interface DepositRow {
  year: number;
  deposited: number;
  interest: number;
  balance: number;
}

export interface DepositResult {
  maturity: number;
  totalDeposited: number;
  totalInterest: number;
  interestRate: number;
  rows: DepositRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Fixed deposit: one principal compounded annually. */
export function calculateFd(principal: number, annualRate: number, years: number): DepositResult {
  const r = annualRate / 100;
  const maturity = principal * Math.pow(1 + r, years);
  const rows: DepositRow[] = [];
  let balance = principal;

  for (let y = 1; y <= years; y++) {
    const interest = balance * r;
    balance += interest;
    rows.push({ year: y, deposited: round2(principal), interest: round2(interest), balance: round2(balance) });
  }

  return {
    maturity: round2(maturity),
    totalDeposited: round2(principal),
    totalInterest: round2(maturity - principal),
    interestRate: annualRate,
    rows,
  };
}

/** Recurring deposit: equal instalments deposited at the end of each year. */
export function calculateRd(annualDeposit: number, annualRate: number, years: number): DepositResult {
  const r = annualRate / 100;
  let balance = 0;
  let deposited = 0;
  const rows: DepositRow[] = [];

  for (let y = 1; y <= years; y++) {
    balance += annualDeposit;
    deposited += annualDeposit;
    const interest = balance * r;
    balance += interest;
    rows.push({ year: y, deposited: round2(deposited), interest: round2(interest), balance: round2(balance) });
  }

  return {
    maturity: round2(balance),
    totalDeposited: round2(deposited),
    totalInterest: round2(balance - deposited),
    interestRate: annualRate,
    rows,
  };
}

/** Applies a flat percentage tax to the interest earned. */
export function applyTaxOnInterest(totalInterest: number, taxRatePercent: number) {
  const tax = (totalInterest * taxRatePercent) / 100;
  return { tax: round2(tax), netInterest: round2(totalInterest - tax) };
}
