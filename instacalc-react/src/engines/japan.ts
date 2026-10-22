/**
 * Japanese salary and child-savings engines.
 *
 * Ported from the legacy Japanese-only pages: the salary calculator follows the
 * Japanese employment-income deduction and income-tax brackets, and the Sukanya
 * Samriddhi calculator projects the account to the child's education years.
 */

const round0 = (n: number) => Math.round(n);

/**
 * 給与所得控除 (employment income deduction), a stepped formula over annual
 * gross pay.
 */
export function employmentDeduction(gross: number): number {
  if (gross <= 1_800_000) return Math.max(550_000, gross * 0.4);
  if (gross <= 3_600_000) return gross * 0.3 + 180_000;
  if (gross <= 6_600_000) return gross * 0.2 + 540_000;
  if (gross <= 8_500_000) return gross * 0.1 + 1_200_000;
  return 1_950_000;
}

/** 所得税 (income tax) brackets plus the 2.1% reconstruction surcharge. */
export function incomeTax(taxable: number): number {
  if (taxable <= 0) return 0;
  let tax: number;
  if (taxable <= 1_950_000) tax = taxable * 0.05;
  else if (taxable <= 3_300_000) tax = taxable * 0.1 - 97_500;
  else if (taxable <= 6_950_000) tax = taxable * 0.2 - 427_500;
  else if (taxable <= 9_000_000) tax = taxable * 0.23 - 636_000;
  else if (taxable <= 18_000_000) tax = taxable * 0.33 - 1_536_000;
  else if (taxable <= 40_000_000) tax = taxable * 0.4 - 2_796_000;
  else tax = taxable * 0.45 - 4_796_000;

  return Math.max(0, tax * 1.021);
}

export type SpouseMode = "none" | "spouse" | "dependent";

export interface SalaryInputs {
  annualGross: number;
  /** Care insurance applies from age 40. */
  isOver40: boolean;
  spouseMode: SpouseMode;
  /** Dependents aged 18-22 (excluding the first year) or 70+. */
  dependents: number;
}

export interface SalaryResult {
  gross: number;
  socialInsurance: number;
  employmentIncome: number;
  incomeTax: number;
  residentTax: number;
  totalDeductions: number;
  /** Take-home pay. */
  net: number;
  effectiveRate: number;
  monthlyNet: number;
}

export function calculateSalary(i: SalaryInputs): SalaryResult {
  const gross = Math.max(0, i.annualGross);

  // Social insurance: national health + care (age dependent), pension, employment.
  const healthRate = i.isOver40 ? 0.0579 : 0.0499;
  const pensionRate = 0.0915;
  const employmentRate = 0.006;

  // Pension is capped on the standard monthly remuneration.
  const cappedPensionGross = Math.min(gross, 650_000 * 12);
  const socialInsurance =
    gross * healthRate + cappedPensionGross * pensionRate + gross * employmentRate;

  const employmentIncome = Math.max(0, gross - employmentDeduction(gross));

  // Basic deductions differ for the income and resident tax bases.
  const BASIC_INCOME = 480_000;
  const BASIC_RESIDENT = 430_000;
  const SPOUSE_INCOME = 380_000;
  const SPOUSE_RESIDENT = 330_000;
  const DEP_INCOME = 380_000;
  const DEP_RESIDENT = 330_000;

  const spouseIncome = i.spouseMode === "dependent" ? SPOUSE_INCOME : 0;
  const spouseResident = i.spouseMode === "dependent" ? SPOUSE_RESIDENT : 0;
  // A "spouse" (not dependent) gets the full amount plus a spouse bonus band.
  const spouseSpecialIncome = i.spouseMode === "spouse" ? 480_000 : 0;

  const taxableIncome = Math.max(
    0,
    employmentIncome - socialInsurance - BASIC_INCOME - spouseIncome - spouseSpecialIncome - i.dependents * DEP_INCOME,
  );
  const taxableResident = Math.max(
    0,
    employmentIncome - socialInsurance - BASIC_RESIDENT - spouseResident - i.dependents * DEP_RESIDENT,
  );

  const tax = incomeTax(taxableIncome);
  const resident = taxableResident * 0.1 + 5_000;

  const net = Math.max(0, gross - socialInsurance - tax - resident);

  return {
    gross: round0(gross),
    socialInsurance: round0(socialInsurance),
    employmentIncome: round0(employmentIncome),
    incomeTax: round0(tax),
    residentTax: round0(resident),
    totalDeductions: round0(socialInsurance + tax + resident),
    net: round0(net),
    effectiveRate: gross > 0 ? round0(((gross - net) / gross) * 1000) / 10 : 0,
    monthlyNet: round0(net / 12),
  };
}

/* -------------------------------------------------- Sukanya Samriddhi */

export type Course = "national" | "private_arts" | "private_science" | "medical";

/** Indicative Japanese university course costs, in yen. */
export const COURSE_COSTS: Record<Course, number> = {
  national: 3_000_000,
  private_arts: 4_500_000,
  private_science: 6_000_000,
  medical: 20_000_000,
};

export interface SukanyaInputs {
  childAge: number;
  /** Monthly contribution. */
  monthlySavings: number;
  /** Annual interest rate, percent. */
  rate: number;
  course: Course;
}

export interface SukanyaResult {
  monthly: number;
  rate: number;
  years: number;
  finalAmount: number;
  totalContributed: number;
  interestEarned: number;
  /** Monthly contribution needed to reach the course cost. */
  requiredMonthly: number;
  courseCost: number;
  /** Whether the current plan covers the course cost. */
  sufficient: boolean;
  yearsToSufficient: number | null;
}

/**
 * Projects the account to university age (18) and solves for the contribution
 * needed to cover the chosen course.
 */
export function calculateSukanya(i: SukanyaInputs): SukanyaResult {
  const years = Math.max(0, 18 - Math.max(0, i.childAge));
  const r = i.rate / 100 / 12;
  const courseCost = COURSE_COSTS[i.course] ?? COURSE_COSTS.national;
  const monthly = Math.max(0, i.monthlySavings);

  // Future value of an ordinary annuity, since deposits are monthly.
  const factor = r === 0 ? years * 12 : ((Math.pow(1 + r, years * 12) - 1) / r);
  const finalAmount = monthly * factor;
  const totalContributed = monthly * years * 12;

  // Bisect the contribution that exactly covers the course cost.
  const requiredMonthly = factor > 0 ? courseCost / factor : 0;

  // Smallest year at which the plan covers the course.
  let yearsToSufficient: number | null = null;
  if (finalAmount >= courseCost) {
    yearsToSufficient = 0;
  } else {
    for (let y = 1; y <= Math.max(1, years + 10); y++) {
      const f = r === 0 ? y * 12 : (Math.pow(1 + r, y * 12) - 1) / r;
      if (monthly * f >= courseCost) {
        yearsToSufficient = y;
        break;
      }
    }
  }

  return {
    monthly,
    rate: i.rate,
    years,
    finalAmount: round0(finalAmount),
    totalContributed: round0(totalContributed),
    interestEarned: round0(Math.max(0, finalAmount - totalContributed)),
    requiredMonthly: round0(requiredMonthly),
    courseCost,
    sufficient: finalAmount >= courseCost,
    yearsToSufficient,
  };
}

/* -------------------------------------------------- ふるさと納税 (Furusato Nouzei) */

export type FurusatoFamily = "single" | "couple" | "coupleboth";

export interface FurusatoInputs {
  annualIncome: number;
  familyType: FurusatoFamily;
  dependents: number;
  donationAmount: number;
}

export interface FurusatoResult {
  limit: number;
  donation: number;
  effectiveContribution: number;
  taxSaved: number;
  excess: number;
  incomeTaxRefund: number;
  residentTaxDeduction: number;
}

export function calculateFurusato(i: FurusatoInputs): FurusatoResult {
  const income = Math.max(0, i.annualIncome);
  const donation = Math.max(0, i.donationAmount);
  const dependents = Math.max(0, i.dependents);

  const empDeduct = employmentDeduction(income);
  const salaryIncome = Math.max(0, income - empDeduct);
  const social = income * 0.145;
  const spouse = i.familyType === "couple" ? 380_000 : 0;
  const dep = dependents * 380_000;

  const taxableIncome = Math.max(0, salaryIncome - social - 480_000 - spouse - dep);
  const taxableResident = Math.max(0, salaryIncome - social - 430_000 - (i.familyType === "couple" ? 330_000 : 0) - dependents * 330_000);
  const residentTaxIncomePart = taxableResident * 0.10;

  let marginalRate = 0.05;
  if (taxableIncome > 40_000_000) marginalRate = 0.45;
  else if (taxableIncome > 18_000_000) marginalRate = 0.40;
  else if (taxableIncome > 9_000_000) marginalRate = 0.33;
  else if (taxableIncome > 6_950_000) marginalRate = 0.23;
  else if (taxableIncome > 3_300_000) marginalRate = 0.20;
  else if (taxableIncome > 1_950_000) marginalRate = 0.10;

  const denom = 0.90 - marginalRate * 1.021;
  const limit = denom > 0 && residentTaxIncomePart > 0
    ? round0((residentTaxIncomePart * 0.20) / denom + 2_000)
    : 0;

  const deductiblePortion = Math.min(donation, limit);
  const excess = Math.max(0, donation - limit);
  const effectiveContribution = donation > 0 ? (donation <= limit ? 2_000 : 2_000 + excess) : 0;
  const taxSaved = Math.max(0, deductiblePortion - 2_000);

  const incomeTaxRefund = round0(taxSaved * (marginalRate * 1.021));
  const residentTaxDeduction = round0(taxSaved - incomeTaxRefund);

  return {
    limit,
    donation,
    effectiveContribution,
    taxSaved,
    excess,
    incomeTaxRefund,
    residentTaxDeduction,
  };
}

/* -------------------------------------------------- 住宅ローン控除 (Jutaku Loan) */

export type HouseType = "certified" | "general";

export interface JutakuLoanInputs {
  balance: number;
  houseType: HouseType;
  income: number;
  years?: number;
}

export interface JutakuLoanResult {
  balance: number;
  cap: number;
  eligibleBalance: number;
  rate: number;
  annualDeduction: number;
  years: number;
  totalDeduction: number;
  incomeTaxCredit: number;
  residentTaxCredit: number;
}

export function calculateJutakuLoan(i: JutakuLoanInputs): JutakuLoanResult {
  const balance = Math.max(0, i.balance);
  const income = Math.max(0, i.income);
  const isCertified = i.houseType === "certified";
  const cap = isCertified ? 45_000_000 : 30_000_000;
  const rate = 0.007; // 0.7% under Reiwa tax reform
  const years = i.years ?? (isCertified ? 13 : 10);

  const eligibleBalance = Math.min(balance, cap);
  const annualDeduction = round0(eligibleBalance * rate);
  const totalDeduction = round0(annualDeduction * years);

  // Approximate income tax paid
  const approxIncomeTax = incomeTax(Math.max(0, income * 0.5 - 1_000_000));
  const incomeTaxCredit = Math.min(annualDeduction, approxIncomeTax);
  // Resident tax credit cap: 97,500 yen/yr
  const residentTaxCredit = Math.min(annualDeduction - incomeTaxCredit, 97_500);

  return {
    balance,
    cap,
    eligibleBalance,
    rate,
    annualDeduction,
    years,
    totalDeduction,
    incomeTaxCredit,
    residentTaxCredit,
  };
}

/* -------------------------------------------------- iDeCo 確定拠出年金 */

export type IdecoJobCategory =
  | "company_none"
  | "company_dc"
  | "company_db"
  | "civil_servant"
  | "self_employed"
  | "housewife";

export const IDECO_CAPS: Record<IdecoJobCategory, number> = {
  company_none: 23_000,
  company_dc: 20_000,
  company_db: 12_000,
  civil_servant: 12_000,
  self_employed: 68_000,
  housewife: 23_000,
};

export interface IdecoInputs {
  jobCategory: IdecoJobCategory;
  monthlyContribution: number;
  currentAge: number;
  targetAge?: number;
  annualReturnRate: number;
  annualGrossIncome: number;
}

export interface IdecoResult {
  maxAllowedMonthly: number;
  monthly: number;
  years: number;
  totalContributed: number;
  finalCorpus: number;
  investmentGains: number;
  taxSavedOnGains: number;
  annualTaxSaved: number;
  lifetimeTaxSaved: number;
  totalBenefit: number;
}

export function calculateIdeco(i: IdecoInputs): IdecoResult {
  const maxAllowedMonthly = IDECO_CAPS[i.jobCategory] ?? 23_000;
  const monthly = Math.min(Math.max(5_000, i.monthlyContribution), maxAllowedMonthly);
  const targetAge = i.targetAge ?? 60;
  const years = Math.max(1, targetAge - Math.max(20, i.currentAge));
  const r = (i.annualReturnRate / 100) / 12;
  const n = years * 12;

  const totalContributed = monthly * n;
  const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
  const finalCorpus = round0(monthly * factor);
  const investmentGains = Math.max(0, finalCorpus - totalContributed);
  const taxSavedOnGains = round0(investmentGains * 0.20315);

  // Approximate marginal tax rate on income
  const income = Math.max(0, i.annualGrossIncome);
  let marginalRate = 0.10;
  if (income > 9_000_000) marginalRate = 0.33;
  else if (income > 6_500_000) marginalRate = 0.20;
  else if (income > 3_500_000) marginalRate = 0.10;
  else marginalRate = 0.05;

  const annualContribution = monthly * 12;
  const annualTaxSaved = round0(annualContribution * (marginalRate + 0.10)); // Income tax + 10% resident tax
  const lifetimeTaxSaved = round0(annualTaxSaved * years);
  const totalBenefit = investmentGains + lifetimeTaxSaved;

  return {
    maxAllowedMonthly,
    monthly,
    years,
    totalContributed,
    finalCorpus,
    investmentGains,
    taxSavedOnGains,
    annualTaxSaved,
    lifetimeTaxSaved,
    totalBenefit,
  };
}

/* -------------------------------------------------- 退職金・退職所得控除 */

export interface TaishokukinInputs {
  severanceAmount: number;
  tenureYears: number;
  declarationSubmitted: boolean;
}

export interface TaishokukinResult {
  gross: number;
  tenureYears: number;
  deductionAmount: number;
  taxableRetirementIncome: number;
  incomeTax: number;
  residentTax: number;
  totalTax: number;
  netSeverance: number;
  effectiveTaxRate: number;
  takeHomeRatio: number;
}

export function calculateTaishokukin(i: TaishokukinInputs): TaishokukinResult {
  const gross = Math.max(0, i.severanceAmount);
  const tenureYears = Math.max(1, Math.round(i.tenureYears));

  let deductionAmount = 0;
  if (tenureYears <= 20) {
    deductionAmount = Math.max(800_000, 400_000 * tenureYears);
  } else {
    deductionAmount = 8_000_000 + 700_000 * (tenureYears - 20);
  }

  let taxableRetirementIncome = 0;
  let incomeTaxAmt = 0;
  let residentTaxAmt = 0;

  if (i.declarationSubmitted) {
    const over = Math.max(0, gross - deductionAmount);
    taxableRetirementIncome = Math.floor((over * 0.5) / 1000) * 1000;
    incomeTaxAmt = round0(incomeTax(taxableRetirementIncome));
    residentTaxAmt = round0(taxableRetirementIncome * 0.10);
  } else {
    // 申告書未提出の場合は20.42%源泉徴収（控除なし）
    taxableRetirementIncome = gross;
    incomeTaxAmt = round0(gross * 0.2042);
    residentTaxAmt = 0;
  }

  const totalTax = incomeTaxAmt + residentTaxAmt;
  const netSeverance = Math.max(0, gross - totalTax);
  const effectiveTaxRate = gross > 0 ? round0((totalTax / gross) * 1000) / 10 : 0;
  const takeHomeRatio = gross > 0 ? round0((netSeverance / gross) * 1000) / 10 : 100;

  return {
    gross,
    tenureYears,
    deductionAmount,
    taxableRetirementIncome,
    incomeTax: incomeTaxAmt,
    residentTax: residentTaxAmt,
    totalTax,
    netSeverance,
    effectiveTaxRate,
    takeHomeRatio,
  };
}

/* -------------------------------------------------- 学資保険 vs 新NISA */

export interface GakushiHokenInputs {
  course: Course;
  childAge: number;
  monthlySavings: number;
  nisaRate: number;
  gakushiReturnRate: number;
}

export interface GakushiHokenResult {
  childAge: number;
  years: number;
  courseCost: number;
  totalContributed: number;
  nisaFinalAmount: number;
  nisaGains: number;
  gakushiFinalAmount: number;
  gakushiGains: number;
  diffBenefit: number;
  achievementRate: number;
}

export function calculateGakushiHoken(i: GakushiHokenInputs): GakushiHokenResult {
  const childAge = Math.max(0, Math.min(17, i.childAge));
  const years = Math.max(1, 18 - childAge);
  const monthly = Math.max(0, i.monthlySavings);
  const courseCost = COURSE_COSTS[i.course] ?? COURSE_COSTS.private_arts;
  const totalContributed = monthly * years * 12;

  const r = (i.nisaRate / 100) / 12;
  const n = years * 12;
  const factor = r === 0 ? n : (Math.pow(1 + r, n) - 1) / r;
  const nisaFinalAmount = round0(monthly * factor);
  const nisaGains = Math.max(0, nisaFinalAmount - totalContributed);

  const gakushiRate = (i.gakushiReturnRate || 105) / 100;
  const gakushiFinalAmount = round0(totalContributed * gakushiRate);
  const gakushiGains = Math.max(0, gakushiFinalAmount - totalContributed);

  const diffBenefit = nisaFinalAmount - gakushiFinalAmount;
  const achievementRate = courseCost > 0 ? round0((nisaFinalAmount / courseCost) * 1000) / 10 : 100;

  return {
    childAge,
    years,
    courseCost,
    totalContributed,
    nisaFinalAmount,
    nisaGains,
    gakushiFinalAmount,
    gakushiGains,
    diffBenefit,
    achievementRate,
  };
}

/* -------------------------------------------------- 小規模企業共済 */

export type KyosaiPayoutReason = "kyosai_a" | "kyosai_b" | "cancellation";

export interface KoigyoKyosaiInputs {
  monthlyAmount: number;
  durationYears: number;
  taxableIncome: number;
  payoutReason: KyosaiPayoutReason;
}

export interface KoigyoKyosaiResult {
  monthly: number;
  durationYears: number;
  totalContributed: number;
  annualTaxSaved: number;
  totalTaxSaved: number;
  payoutAmount: number;
  netBenefit: number;
  effectiveCostRatio: number;
}

export function calculateKoigyoKyosai(i: KoigyoKyosaiInputs): KoigyoKyosaiResult {
  const monthly = Math.min(70_000, Math.max(1_000, i.monthlyAmount));
  const durationYears = Math.max(1, i.durationYears);
  const totalContributed = monthly * 12 * durationYears;

  // Marginal income tax rate based on taxable income
  const income = Math.max(0, i.taxableIncome);
  let marginalRate = 0.10;
  if (income > 18_000_000) marginalRate = 0.40;
  else if (income > 9_000_000) marginalRate = 0.33;
  else if (income > 6_950_000) marginalRate = 0.23;
  else if (income > 3_300_000) marginalRate = 0.20;
  else if (income > 1_950_000) marginalRate = 0.10;
  else marginalRate = 0.05;

  const annualContribution = monthly * 12;
  const annualTaxSaved = round0(annualContribution * (marginalRate + 0.10));
  const totalTaxSaved = round0(annualTaxSaved * durationYears);

  // Payout multiplier based on reason
  let payoutMultiplier = 1.15; // standard ~1.0% compound over 20 years for Kyosai A
  if (i.payoutReason === "kyosai_a") {
    payoutMultiplier = durationYears >= 20 ? 1.18 : 1.08;
  } else if (i.payoutReason === "kyosai_b") {
    payoutMultiplier = durationYears >= 20 ? 1.12 : 1.04;
  } else {
    // 任意解約: 20年未満は元本割れ (80%〜95%)
    payoutMultiplier = durationYears >= 20 ? 1.0 : Math.max(0.80, 0.80 + (durationYears / 20) * 0.15);
  }

  const payoutAmount = round0(totalContributed * payoutMultiplier);
  const netBenefit = (payoutAmount - totalContributed) + totalTaxSaved;
  const effectiveCostRatio = totalContributed > 0
    ? round0(((totalContributed - totalTaxSaved) / totalContributed) * 1000) / 10
    : 0;

  return {
    monthly,
    durationYears,
    totalContributed,
    annualTaxSaved,
    totalTaxSaved,
    payoutAmount,
    netBenefit,
    effectiveCostRatio,
  };
}
