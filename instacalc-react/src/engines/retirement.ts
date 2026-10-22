/**
 * Full retirement planner: an accumulation phase to retirement, followed by a
 * drawdown simulation to life expectancy.
 *
 * Ported from the legacy retirement calculator. The required-corpus figure is
 * the present value, at retirement, of every future net withdrawal plus the
 * target bequest — so the user can see whether the projection is sufficient.
 */

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface RetirementInputs {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  /** Today's monthly living costs. */
  currentMonthlyExpense: number;
  /** Monthly income from pensions or other sources in retirement. */
  otherRetirementIncome: number;
  currentSavings: number;
  monthlyContribution: number;
  /** Annual increase to the monthly contribution, percent. */
  annualStepup: number;
  /** Return before retirement, percent. */
  preRetReturn: number;
  /** Return during retirement, percent. */
  postRetReturn: number;
  /** Expected inflation, percent. */
  inflation: number;
  targetBequest: number;
}

export interface RetirementRow {
  year: number;
  age: number;
  annualContribution: number;
  totalInvested: number;
  balance: number;
}

export interface DrawdownRow {
  year: number;
  age: number;
  withdrawal: number;
  balance: number;
}

export interface RetirementResult {
  yearsToRetirement: number;
  retirementYears: number;
  /** Projected balance at retirement. */
  projectedCorpus: number;
  totalInvested: number;
  /** Corpus needed at retirement to fund the plan. */
  requiredCorpus: number;
  shortfall: number;
  /** First-year-of-retirement expense, inflated to retirement. */
  firstYearExpense: number;
  firstYearOtherIncome: number;
  firstYearNetWithdrawal: number;
  /** Present value of the target bequest. */
  bequestPV: number;
  /** Monthly income the projected corpus supports, by the 4% rule. */
  monthlyIncomeAtRetirement: number;
  /** True when the projection covers the full retirement plus the bequest. */
  onTrack: boolean;
  accumulation: RetirementRow[];
  drawdown: DrawdownRow[];
}

/** Present value at retirement of a growing withdrawal stream. */
function presentValueOfWithdrawals(
  firstYearWithdrawal: number,
  years: number,
  rate: number,
  inflation: number,
): number {
  if (years <= 0 || firstYearWithdrawal <= 0) return 0;
  // When the real return is zero the series is simply an annuity.
  if (Math.abs(rate - inflation) < 1e-9) {
    return (firstYearWithdrawal * years) / (1 + rate);
  }
  const ratio = (1 + inflation) / (1 + rate);
  return (firstYearWithdrawal * (1 - Math.pow(ratio, years))) / (rate - inflation);
}

/** Phase 1: grow savings with monthly contributions that step up each year. */
export function accumulate(i: RetirementInputs): {
  corpus: number;
  totalInvested: number;
  rows: RetirementRow[];
} {
  const months = Math.max(0, (i.retirementAge - i.currentAge) * 12);
  const monthlyRate = i.preRetReturn / 1200;
  const rows: RetirementRow[] = [];

  let balance = i.currentSavings;
  let contribution = Math.max(0, i.monthlyContribution);
  let totalInvested = i.currentSavings;

  for (let month = 1; month <= months; month++) {
    // The step-up applies at the start of each new year, not in year one.
    if (month > 1 && (month - 1) % 12 === 0) {
      contribution *= 1 + i.annualStepup / 100;
    }

    // Interest is credited first, then the contribution is added.
    balance *= 1 + monthlyRate;
    balance += contribution;
    totalInvested += contribution;

    if (month % 12 === 0) {
      const year = month / 12;
      rows.push({
        year,
        age: i.currentAge + year,
        annualContribution: round2(contribution * 12),
        totalInvested: round2(totalInvested),
        balance: round2(balance),
      });
    }
  }

  return { corpus: balance, totalInvested, rows };
}

/** Phase 2: draw the corpus down, inflating withdrawals each year. */
export function drawdown(
  i: RetirementInputs,
  startingCorpus: number,
  firstYearExpense: number,
  firstYearOtherIncome: number,
): DrawdownRow[] {
  const years = Math.max(0, i.lifeExpectancy - i.retirementAge);
  const rate = i.postRetReturn / 100;
  const inflation = i.inflation / 100;
  const rows: DrawdownRow[] = [];

  let balance = startingCorpus;
  let expense = firstYearExpense;
  let income = firstYearOtherIncome;

  for (let y = 1; y <= years; y++) {
    // The withdrawal is taken before the year's return is credited.
    const withdrawal = Math.max(0, expense - income);
    balance = Math.max(0, balance - withdrawal) * (1 + rate);

    rows.push({
      year: y,
      age: i.retirementAge + y - 1,
      withdrawal: round2(withdrawal),
      balance: round2(balance),
    });

    expense *= 1 + inflation;
    income *= 1 + inflation;
  }

  return rows;
}

export function planRetirement(i: RetirementInputs): RetirementResult {
  const yearsToRetirement = Math.max(0, i.retirementAge - i.currentAge);
  const retirementYears = Math.max(0, i.lifeExpectancy - i.retirementAge);
  const inflationRate = i.inflation / 100;
  const postRetRate = i.postRetReturn / 100;

  // Inflate today's costs forward to the first retirement year.
  const growth = Math.pow(1 + inflationRate, yearsToRetirement);
  const firstYearExpense = i.currentMonthlyExpense * 12 * growth;
  const firstYearOtherIncome = i.otherRetirementIncome * 12 * growth;
  const firstYearNetWithdrawal = Math.max(0, firstYearExpense - firstYearOtherIncome);

  const pvWithdrawals = presentValueOfWithdrawals(
    firstYearNetWithdrawal, retirementYears, postRetRate, inflationRate,
  );
  const bequestPV =
    retirementYears > 0
      ? i.targetBequest / Math.pow(1 + postRetRate, retirementYears)
      : i.targetBequest;
  const requiredCorpus = Math.max(0, pvWithdrawals + bequestPV);

  const acc = accumulate(i);

  return {
    yearsToRetirement,
    retirementYears,
    projectedCorpus: round2(acc.corpus),
    totalInvested: round2(acc.totalInvested),
    requiredCorpus: round2(requiredCorpus),
    shortfall: round2(Math.max(0, requiredCorpus - acc.corpus)),
    firstYearExpense: round2(firstYearExpense),
    firstYearOtherIncome: round2(firstYearOtherIncome),
    firstYearNetWithdrawal: round2(firstYearNetWithdrawal),
    bequestPV: round2(bequestPV),
    // 4% rule: the monthly spend the projected corpus supports in year one.
    monthlyIncomeAtRetirement: round2((acc.corpus * 0.04) / 12),
    onTrack: acc.corpus >= requiredCorpus,
    accumulation: acc.rows,
    drawdown: drawdown(i, acc.corpus, firstYearExpense, firstYearOtherIncome),
  };
}