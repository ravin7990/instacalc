/**
 * Loan EMI engine. Pure functions, shared by the India and US editions.
 */

export interface EmiInputs {
  /** Principal borrowed. */
  principal: number;
  /** Annual interest rate in percent. */
  annualRate: number;
  /** Tenure in years. */
  years: number;
}

export interface AmortisationRow {
  year: number;
  opening: number;
  interestPaid: number;
  principalPaid: number;
  closing: number;
}

export interface EmiResult {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  months: number;
  rows: AmortisationRow[];
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Standard reducing-balance EMI formula. */
export function calculateEmi({ principal, annualRate, years }: EmiInputs): EmiResult {
  const months = Math.max(1, Math.round(years * 12));
  const r = annualRate / 100 / 12;

  const emi =
    r === 0
      ? principal / months
      : (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);

  let balance = principal;
  const rows: AmortisationRow[] = [];
  let yearOpening = principal;
  let yearInterest = 0;
  let yearPrincipal = 0;

  for (let m = 1; m <= months; m++) {
    const interest = balance * r;
    // Never amortise past zero on the final instalment.
    const principalPart = m === months ? balance : Math.min(balance, emi - interest);
    balance -= principalPart;

    yearInterest += interest;
    yearPrincipal += principalPart;

    if (m % 12 === 0 || m === months) {
      rows.push({
        year: Math.ceil(m / 12),
        opening: round2(yearOpening),
        interestPaid: round2(yearInterest),
        principalPaid: round2(yearPrincipal),
        closing: round2(balance),
      });
      yearOpening = balance;
      yearInterest = 0;
      yearPrincipal = 0;
    }
  }

  return {
    emi: round2(emi),
    totalPayment: round2(emi * months),
    totalInterest: round2(emi * months - principal),
    months,
    rows,
  };
}

/** Yearly hand-off for the legacy RD/FD pages, which amortise annually. */
export function annualEmi(principal: number, annualRate: number, years: number): number {
  const r = annualRate / 100;
  const n = Math.max(1, Math.round(years));
  return round2(r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}
