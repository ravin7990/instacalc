/**
 * Korean calculators - pure engines.
 *
 * All legal values that change year to year live in KR_2026 so they can be
 * updated in one place. Everything is an estimate for reference only; the
 * official sources (국세청, 고용노동부, 국민건강보험공단, 시·도 조례) always win.
 */

export const KR_2026 = {
  updated: "2026-01",
  minWageHourly: 10_320,
  /** 국민연금: worker share and the monthly income band (기준소득월액). */
  pensionRate: 0.0475,
  pensionMin: 400_000,
  pensionMax: 6_370_000,
  /** 건강보험: worker share; 장기요양 is 13.14% of the health premium. */
  healthRate: 0.03595,
  longTermRate: 0.1314,
  employmentRate: 0.009,
  /** Employer-only employment stability contribution (under 150 staff). */
  employerEmploymentExtra: 0.0025,
  mealNonTaxable: 200_000,
  /** 구직급여 daily cap, and floor = 80% of minimum wage x 8h. */
  unemploymentDailyMax: 68_100,
  unemploymentDailyMin: Math.round(10_320 * 8 * 0.8),
  /** 전월세전환율 cap = base rate + 2% (base rate input by the user). */
  conversionSpread: 0.02,
  pyeongToSqm: 400 / 121,
} as const;

const floor10 = (n: number) => Math.floor(n / 10) * 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ------------------------------------------------------------------ */
/* 1. 연봉 실수령액                                                      */
/* ------------------------------------------------------------------ */

/** 근로소득공제 */
export function earnedIncomeDeduction(gross: number): number {
  let d: number;
  if (gross <= 5_000_000) d = gross * 0.7;
  else if (gross <= 15_000_000) d = 3_500_000 + (gross - 5_000_000) * 0.4;
  else if (gross <= 45_000_000) d = 7_500_000 + (gross - 15_000_000) * 0.15;
  else if (gross <= 100_000_000) d = 12_000_000 + (gross - 45_000_000) * 0.05;
  else d = 14_750_000 + (gross - 100_000_000) * 0.02;
  return Math.min(d, 20_000_000);
}

/** 종합소득세 기본세율 (2023~) */
export function progressiveIncomeTax(base: number): number {
  if (base <= 0) return 0;
  if (base <= 14_000_000) return base * 0.06;
  if (base <= 50_000_000) return base * 0.15 - 1_260_000;
  if (base <= 88_000_000) return base * 0.24 - 5_760_000;
  if (base <= 150_000_000) return base * 0.35 - 15_440_000;
  if (base <= 300_000_000) return base * 0.38 - 19_940_000;
  if (base <= 500_000_000) return base * 0.4 - 25_940_000;
  if (base <= 1_000_000_000) return base * 0.42 - 35_940_000;
  return base * 0.45 - 65_940_000;
}

/** 근로소득세액공제 (with the gross-pay based limit) */
export function earnedIncomeTaxCredit(tax: number, gross: number): number {
  const credit = tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;
  let limit: number;
  if (gross <= 33_000_000) limit = 740_000;
  else if (gross <= 70_000_000) limit = Math.max(740_000 - (gross - 33_000_000) * 0.008, 660_000);
  else if (gross <= 120_000_000) limit = Math.max(660_000 - (gross - 70_000_000) * 0.5, 500_000);
  else limit = Math.max(500_000 - (gross - 120_000_000) * 0.5, 200_000);
  return Math.min(credit, limit);
}

/** 자녀세액공제 (children aged 8-20) */
export function childTaxCredit(children: number): number {
  if (children <= 0) return 0;
  if (children === 1) return 250_000;
  if (children === 2) return 550_000;
  return 550_000 + (children - 2) * 400_000;
}

export interface SalaryInput {
  /** 연봉 (annual) or 월급 (monthly), see `basis`. */
  amount: number;
  basis: "annual" | "monthly";
  /** 퇴직금이 연봉에 포함 (annual / 13). */
  severanceIncluded: boolean;
  mealAllowance: number;
  /** 본인 포함 부양가족 수 (min 1). */
  household: number;
  children: number;
}

export interface SalaryResult {
  annualGross: number;
  monthlyGross: number;
  pension: number;
  health: number;
  longTerm: number;
  employment: number;
  incomeTax: number;
  localTax: number;
  totalDeduction: number;
  monthlyNet: number;
  annualNet: number;
  netRatio: number;
  employerInsurance: number;
  employerMonthlyCost: number;
}

export function calculateSalary(i: SalaryInput): SalaryResult {
  const annualGross = i.basis === "annual" ? i.amount : i.amount * 12;
  const monthlyGross = i.basis === "monthly" ? i.amount : i.severanceIncluded ? annualGross / 13 : annualGross / 12;
  const effectiveAnnual = i.basis === "monthly" ? i.amount * 12 : monthlyGross * 12;

  const meal = Math.min(i.mealAllowance, KR_2026.mealNonTaxable, monthlyGross);
  const taxableMonthly = Math.max(0, monthlyGross - meal);

  const pensionBase = clamp(taxableMonthly, KR_2026.pensionMin, KR_2026.pensionMax);
  const pension = floor10(pensionBase * KR_2026.pensionRate);
  const health = floor10(taxableMonthly * KR_2026.healthRate);
  const longTerm = floor10(health * KR_2026.longTermRate);
  const employment = floor10(taxableMonthly * KR_2026.employmentRate);

  const taxableAnnual = taxableMonthly * 12;
  const household = Math.max(1, Math.round(i.household));
  const taxBase = Math.max(
    0,
    taxableAnnual -
      earnedIncomeDeduction(taxableAnnual) -
      household * 1_500_000 -
      pension * 12 -
      (health + longTerm + employment) * 12,
  );
  const calculated = progressiveIncomeTax(taxBase);
  const credits = earnedIncomeTaxCredit(calculated, taxableAnnual) + childTaxCredit(Math.round(i.children));
  const annualTax = Math.max(0, calculated - credits);
  const incomeTax = floor10(annualTax / 12);
  const localTax = floor10(incomeTax * 0.1);

  const totalDeduction = pension + health + longTerm + employment + incomeTax + localTax;
  const monthlyNet = monthlyGross - totalDeduction;

  const employerHealth = health;
  const employerInsurance =
    floor10(pensionBase * KR_2026.pensionRate) +
    employerHealth +
    floor10(employerHealth * KR_2026.longTermRate) +
    floor10(taxableMonthly * (KR_2026.employmentRate + KR_2026.employerEmploymentExtra));

  return {
    annualGross: effectiveAnnual,
    monthlyGross,
    pension,
    health,
    longTerm,
    employment,
    incomeTax,
    localTax,
    totalDeduction,
    monthlyNet,
    annualNet: monthlyNet * 12,
    netRatio: monthlyGross > 0 ? Math.round((monthlyNet / monthlyGross) * 1000) / 10 : 0,
    employerInsurance,
    employerMonthlyCost: monthlyGross + employerInsurance,
  };
}

/* ------------------------------------------------------------------ */
/* 2. 퇴직금                                                            */
/* ------------------------------------------------------------------ */

const DAY = 86_400_000;
export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, (m || 1) - 1, d || 1));
};
export const toIso = (d: Date) => d.toISOString().slice(0, 10);
export const diffDays = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY);

function addMonthsUtc(d: Date, months: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), last)));
}

export interface SeveranceInput {
  start: string;
  end: string;
  /** 퇴직 전 3개월 임금 총액 (기본급 + 수당). */
  last3MonthsPay: number;
  annualBonus: number;
  annualLeavePay: number;
  weeklyHours: number;
}

export interface SeveranceResult {
  valid: boolean;
  employedDays: number;
  years: number;
  eligible: boolean;
  reason: string;
  threeMonthDays: number;
  bonusShare: number;
  leaveShare: number;
  avgDailyWage: number;
  severance: number;
}

export function calculateSeverance(i: SeveranceInput): SeveranceResult {
  const start = parseDate(i.start);
  const end = parseDate(i.end);
  const employedDays = diffDays(start, end) + 1;
  const empty: SeveranceResult = {
    valid: false,
    employedDays: 0,
    years: 0,
    eligible: false,
    reason: "invalid-dates",
    threeMonthDays: 0,
    bonusShare: 0,
    leaveShare: 0,
    avgDailyWage: 0,
    severance: 0,
  };
  if (!(employedDays > 0)) return empty;

  const threeMonthDays = diffDays(addMonthsUtc(end, -3), end) || 90;
  const bonusShare = (i.annualBonus * 3) / 12;
  const leaveShare = (i.annualLeavePay * 3) / 12;
  const avgDailyWage = (i.last3MonthsPay + bonusShare + leaveShare) / threeMonthDays;
  const eligibleDays = employedDays >= 365;
  const eligibleHours = i.weeklyHours >= 15;
  const eligible = eligibleDays && eligibleHours;
  const severance = avgDailyWage * 30 * (employedDays / 365);

  return {
    valid: true,
    employedDays,
    years: employedDays / 365,
    eligible,
    reason: !eligibleDays ? "under-1-year" : !eligibleHours ? "under-15-hours" : "ok",
    threeMonthDays,
    bonusShare,
    leaveShare,
    avgDailyWage,
    severance: Math.round(severance),
  };
}

/* ------------------------------------------------------------------ */
/* 3. 주휴수당                                                          */
/* ------------------------------------------------------------------ */

export type DeductionMode = "none" | "3.3" | "4ins";

export interface WeeklyHolidayInput {
  hourly: number;
  weeklyHours: number;
  fullAttendance: boolean;
  deduction: DeductionMode;
}

export interface WeeklyHolidayResult {
  eligible: boolean;
  holidayHours: number;
  weeklyBase: number;
  weeklyHolidayPay: number;
  weeklyTotal: number;
  monthlyHours: number;
  monthlyBase: number;
  monthlyHolidayPay: number;
  monthlyGross: number;
  deductionRate: number;
  deductionAmount: number;
  monthlyNet: number;
  annualGross: number;
  belowMinimum: boolean;
}

/** 4대보험 worker share used by the part-time estimate (pension + health + LTC + employment). */
export const FOUR_INS_RATE =
  KR_2026.pensionRate +
  KR_2026.healthRate +
  KR_2026.healthRate * KR_2026.longTermRate +
  KR_2026.employmentRate;

export function calculateWeeklyHoliday(i: WeeklyHolidayInput): WeeklyHolidayResult {
  const eligible = i.weeklyHours >= 15 && i.fullAttendance;
  const holidayHours = eligible ? (Math.min(i.weeklyHours, 40) / 40) * 8 : 0;
  const weeksPerMonth = 365 / 7 / 12;

  const weeklyBase = i.hourly * i.weeklyHours;
  const weeklyHolidayPay = holidayHours * i.hourly;
  const monthlyBase = weeklyBase * weeksPerMonth;
  const monthlyHolidayPay = weeklyHolidayPay * weeksPerMonth;
  const monthlyGross = monthlyBase + monthlyHolidayPay;
  const deductionRate = i.deduction === "3.3" ? 0.033 : i.deduction === "4ins" ? FOUR_INS_RATE : 0;
  const deductionAmount = floor10(monthlyGross * deductionRate);

  return {
    eligible,
    holidayHours,
    weeklyBase,
    weeklyHolidayPay,
    weeklyTotal: weeklyBase + weeklyHolidayPay,
    monthlyHours: (i.weeklyHours + holidayHours) * weeksPerMonth,
    monthlyBase,
    monthlyHolidayPay,
    monthlyGross,
    deductionRate,
    deductionAmount,
    monthlyNet: monthlyGross - deductionAmount,
    annualGross: monthlyGross * 12,
    belowMinimum: i.hourly < KR_2026.minWageHourly,
  };
}

/* ------------------------------------------------------------------ */
/* 4. 평 <-> m2                                                         */
/* ------------------------------------------------------------------ */

export const pyeongToSqm = (p: number) => p * KR_2026.pyeongToSqm;
export const sqmToPyeong = (m: number) => m / KR_2026.pyeongToSqm;

/* ------------------------------------------------------------------ */
/* 5. 만 나이                                                           */
/* ------------------------------------------------------------------ */

export const ZODIAC = ["원숭이", "닭", "개", "돼지", "쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양"] as const;
export const zodiacOf = (year: number) => ZODIAC[((year % 12) + 12) % 12];

export interface KoreanAgeResult {
  valid: boolean;
  manAge: number;
  yearAge: number;
  countingAge: number;
  zodiac: string;
  daysLived: number;
  daysToBirthday: number;
  nextBirthday: string;
  months: number;
}

export function calculateKoreanAge(birth: string, ref: string): KoreanAgeResult {
  const b = parseDate(birth);
  const r = parseDate(ref);
  const none: KoreanAgeResult = {
    valid: false,
    manAge: 0,
    yearAge: 0,
    countingAge: 0,
    zodiac: "",
    daysLived: 0,
    daysToBirthday: 0,
    nextBirthday: "",
    months: 0,
  };
  if (!(r.getTime() >= b.getTime())) return none;

  const by = b.getUTCFullYear();
  const bm = b.getUTCMonth();
  const bd = b.getUTCDate();
  const ry = r.getUTCFullYear();

  /** Birthday in a given year; Feb 29 falls back to Feb 28 (민법 제160조). */
  const birthdayIn = (y: number) => {
    const last = new Date(Date.UTC(y, bm + 1, 0)).getUTCDate();
    return new Date(Date.UTC(y, bm, Math.min(bd, last)));
  };

  let manAge = ry - by;
  if (r.getTime() < birthdayIn(ry).getTime()) manAge -= 1;
  let next = birthdayIn(ry);
  if (next.getTime() < r.getTime()) next = birthdayIn(ry + 1);

  let months = (ry - by) * 12 + (r.getUTCMonth() - bm);
  if (r.getUTCDate() < bd) months -= 1;

  return {
    valid: true,
    manAge,
    yearAge: ry - by,
    countingAge: ry - by + 1,
    zodiac: zodiacOf(by),
    daysLived: diffDays(b, r),
    daysToBirthday: diffDays(r, next),
    nextBirthday: toIso(next),
    months,
  };
}

/* ------------------------------------------------------------------ */
/* 6. 부동산 중개수수료                                                  */
/* ------------------------------------------------------------------ */

export type DealType = "sale" | "lease" | "rent";
export type PropertyKind = "house" | "officetel" | "other";

interface Tier {
  below: number;
  rate: number;
  cap?: number;
}

/** 서울특별시 주택 중개보수 조례 (2021 개정) */
const SALE_TIERS: Tier[] = [
  { below: 50_000_000, rate: 0.006, cap: 250_000 },
  { below: 200_000_000, rate: 0.005, cap: 800_000 },
  { below: 900_000_000, rate: 0.004 },
  { below: 1_200_000_000, rate: 0.005 },
  { below: 1_500_000_000, rate: 0.006 },
  { below: Infinity, rate: 0.007 },
];
const LEASE_TIERS: Tier[] = [
  { below: 50_000_000, rate: 0.005, cap: 200_000 },
  { below: 100_000_000, rate: 0.004, cap: 300_000 },
  { below: 600_000_000, rate: 0.003 },
  { below: 1_200_000_000, rate: 0.004 },
  { below: 1_500_000_000, rate: 0.005 },
  { below: Infinity, rate: 0.006 },
];

export interface BrokerageInput {
  deal: DealType;
  kind: PropertyKind;
  /** 매매가 or 보증금 (전세금). */
  price: number;
  /** 월세 (rent only). */
  monthlyRent: number;
}

export interface BrokerageResult {
  tradeAmount: number;
  rate: number;
  cap: number | null;
  fee: number;
  vat: number;
  total: number;
  note: string;
}

export function calculateBrokerage(i: BrokerageInput): BrokerageResult {
  let amount = i.price;
  let note = "";
  if (i.deal === "rent") {
    amount = i.price + i.monthlyRent * 100;
    if (amount < 50_000_000) {
      amount = i.price + i.monthlyRent * 70;
      note = "월세 환산 시 5천만원 미만이면 월세×70을 적용합니다.";
    }
  }

  let rate: number;
  let cap: number | null = null;
  if (i.kind === "officetel") {
    rate = i.deal === "sale" ? 0.005 : 0.004;
  } else if (i.kind === "other") {
    rate = 0.009;
    note = "토지·상가 등은 거래금액의 0.9% 이내에서 협의합니다.";
  } else {
    const tier = (i.deal === "sale" ? SALE_TIERS : LEASE_TIERS).find((t) => amount < t.below)!;
    rate = tier.rate;
    cap = tier.cap ?? null;
  }

  let fee = amount * rate;
  if (cap !== null) fee = Math.min(fee, cap);
  fee = Math.round(fee);
  const vat = Math.round(fee * 0.1);
  return { tradeAmount: amount, rate, cap, fee, vat, total: fee + vat, note };
}

/* ------------------------------------------------------------------ */
/* 7. 전월세 전환                                                        */
/* ------------------------------------------------------------------ */

export interface ConversionInput {
  direction: "jeonseToWolse" | "wolseToJeonse";
  jeonse: number;
  deposit: number;
  monthlyRent: number;
  /** 전환율 (%), e.g. 5. */
  ratePercent: number;
  /** 한국은행 기준금리 (%), for the legal cap. */
  baseRatePercent: number;
}

export interface ConversionResult {
  legalCapPercent: number;
  overCap: boolean;
  monthlyRent: number;
  jeonse: number;
  impliedRatePercent: number;
}

export function calculateConversion(i: ConversionInput): ConversionResult {
  const legalCapPercent = i.baseRatePercent + KR_2026.conversionSpread * 100;
  const r = i.ratePercent / 100;
  if (i.direction === "jeonseToWolse") {
    const monthly = r > 0 ? Math.max(0, ((i.jeonse - i.deposit) * r) / 12) : 0;
    return {
      legalCapPercent,
      overCap: i.ratePercent > legalCapPercent,
      monthlyRent: Math.round(monthly),
      jeonse: i.jeonse,
      impliedRatePercent: i.ratePercent,
    };
  }
  const jeonse = r > 0 ? (i.monthlyRent * 12) / r + i.deposit : i.deposit;
  const implied = i.jeonse - i.deposit > 0 ? ((i.monthlyRent * 12) / (i.jeonse - i.deposit)) * 100 : 0;
  return {
    legalCapPercent,
    overCap: i.ratePercent > legalCapPercent,
    monthlyRent: i.monthlyRent,
    jeonse: Math.round(jeonse),
    impliedRatePercent: Math.round(implied * 100) / 100,
  };
}

/* ------------------------------------------------------------------ */
/* 8. 취득세 (주택 매매)                                                 */
/* ------------------------------------------------------------------ */

export interface AcquisitionInput {
  price: number;
  /** 취득 후 세대 보유 주택 수 (본인 취득 주택 포함). */
  homesAfter: number;
  regulated: boolean;
  /** 전용면적 85㎡ 초과 → 농어촌특별세 부과. */
  over85: boolean;
  firstTimeBuyer: boolean;
}

export interface AcquisitionResult {
  baseRatePercent: number;
  surcharge: boolean;
  acquisitionTax: number;
  educationTax: number;
  ruralTax: number;
  reduction: number;
  total: number;
  effectiveRatePercent: number;
}

export function calculateAcquisitionTax(i: AcquisitionInput): AcquisitionResult {
  const heavy = i.regulated
    ? i.homesAfter >= 3
      ? 12
      : i.homesAfter === 2
        ? 8
        : 0
    : i.homesAfter >= 4
      ? 12
      : i.homesAfter === 3
        ? 8
        : 0;

  let rate: number;
  let education: number;
  let rural: number;
  if (heavy) {
    rate = heavy;
    education = 0.4;
    rural = heavy === 8 ? 0.6 : 1.0;
  } else {
    if (i.price <= 600_000_000) rate = 1;
    else if (i.price < 900_000_000) rate = ((i.price * 2) / 300_000_000 - 3) * 1;
    else rate = 3;
    education = rate * 0.5;
    rural = i.over85 ? 0.2 : 0;
  }
  rate = Math.round(rate * 10000) / 10000;

  let acquisitionTax = Math.round((i.price * rate) / 100);
  const educationTax = Math.round((i.price * education) / 100);
  const ruralTax = heavy ? Math.round((i.price * rural) / 100) : i.over85 ? Math.round((i.price * rural) / 100) : 0;

  let reduction = 0;
  if (i.firstTimeBuyer && !heavy) {
    reduction = Math.min(acquisitionTax, 2_000_000);
    acquisitionTax -= reduction;
  }

  const total = acquisitionTax + educationTax + ruralTax;
  return {
    baseRatePercent: rate,
    surcharge: heavy > 0,
    acquisitionTax,
    educationTax,
    ruralTax,
    reduction,
    total,
    effectiveRatePercent: i.price > 0 ? Math.round((total / i.price) * 10000) / 100 : 0,
  };
}

/* ------------------------------------------------------------------ */
/* 9. 대출이자 / DSR                                                    */
/* ------------------------------------------------------------------ */

export type RepayType = "equalPayment" | "equalPrincipal" | "bullet";

export interface LoanInput {
  principal: number;
  /** 연 금리 (%). */
  ratePercent: number;
  years: number;
  type: RepayType;
}

export interface LoanRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  firstPayment: number;
  lastPayment: number;
  totalInterest: number;
  totalPayment: number;
  rows: LoanRow[];
  /** First-year principal + interest, used for DSR. */
  firstYearPayment: number;
}

export function calculateLoan(i: LoanInput): LoanResult {
  const n = Math.max(1, Math.round(i.years * 12));
  const r = i.ratePercent / 100 / 12;
  const rows: LoanRow[] = [];
  let balance = i.principal;

  if (i.type === "equalPayment") {
    const pay = r === 0 ? i.principal / n : (i.principal * r * (1 + r) ** n) / ((1 + r) ** n - 1);
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      const principal = m === n ? balance : pay - interest;
      balance -= principal;
      rows.push({ month: m, payment: principal + interest, principal, interest, balance: Math.max(0, balance) });
    }
  } else if (i.type === "equalPrincipal") {
    const pr = i.principal / n;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      balance -= pr;
      rows.push({ month: m, payment: pr + interest, principal: pr, interest, balance: Math.max(0, balance) });
    }
  } else {
    for (let m = 1; m <= n; m++) {
      const interest = i.principal * r;
      const principal = m === n ? i.principal : 0;
      rows.push({ month: m, payment: principal + interest, principal, interest, balance: m === n ? 0 : i.principal });
    }
  }

  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  return {
    firstPayment: rows[0].payment,
    lastPayment: rows[rows.length - 1].payment,
    totalInterest,
    totalPayment: i.principal + totalInterest,
    rows,
    firstYearPayment: rows.slice(0, 12).reduce((s, x) => s + x.payment, 0),
  };
}

export interface DsrInput {
  annualIncome: number;
  /** 신규 대출 first-year principal + interest. */
  newLoanAnnualPayment: number;
  /** 기존 대출의 연간 원리금 상환액. */
  existingAnnualPayment: number;
}

export interface DsrResult {
  dsrPercent: number;
  limitPercent: number;
  ok: boolean;
  headroomAnnual: number;
}

export function calculateDsr(i: DsrInput, limitPercent = 40): DsrResult {
  const dsr = i.annualIncome > 0 ? ((i.newLoanAnnualPayment + i.existingAnnualPayment) / i.annualIncome) * 100 : 0;
  return {
    dsrPercent: Math.round(dsr * 100) / 100,
    limitPercent,
    ok: dsr <= limitPercent,
    headroomAnnual: Math.round((i.annualIncome * limitPercent) / 100 - i.existingAnnualPayment - i.newLoanAnnualPayment),
  };
}

/** Largest principal whose first-year payment fits the DSR limit (binary search). */
export function maxLoanForDsr(
  base: Omit<LoanInput, "principal">,
  annualIncome: number,
  existingAnnualPayment: number,
  limitPercent = 40,
): number {
  const budget = (annualIncome * limitPercent) / 100 - existingAnnualPayment;
  if (budget <= 0) return 0;
  let lo = 0;
  let hi = 10_000_000_000;
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    const y = calculateLoan({ ...base, principal: mid }).firstYearPayment;
    if (y > budget) hi = mid;
    else lo = mid;
  }
  return Math.floor(lo / 10_000) * 10_000;
}

/* ------------------------------------------------------------------ */
/* 10. 실업급여                                                         */
/* ------------------------------------------------------------------ */

/** 소정급여일수 table (구직급여). */
export function benefitDays(ageOver50OrDisabled: boolean, insuredYears: number): number {
  if (insuredYears < 1) return 120;
  if (ageOver50OrDisabled) {
    if (insuredYears < 3) return 180;
    if (insuredYears < 5) return 210;
    if (insuredYears < 10) return 240;
    return 270;
  }
  if (insuredYears < 3) return 150;
  if (insuredYears < 5) return 180;
  if (insuredYears < 10) return 210;
  return 240;
}

export interface UnemploymentInput {
  last3MonthsPay: number;
  /** 퇴직 전 3개월 일수 (default 92). */
  threeMonthDays: number;
  insuredYears: number;
  ageOver50OrDisabled: boolean;
  weeklyHours: number;
  /** 비자발적 퇴사 (and available to work). */
  involuntary: boolean;
}

export interface UnemploymentResult {
  eligible: boolean;
  reason: string;
  avgDailyWage: number;
  rawDaily: number;
  daily: number;
  cappedBy: "max" | "min" | "none";
  days: number;
  monthly: number;
  total: number;
}

export function calculateUnemployment(i: UnemploymentInput): UnemploymentResult {
  const avg = i.last3MonthsPay / Math.max(1, i.threeMonthDays);
  const raw = avg * 0.6;
  let daily = raw;
  let cappedBy: UnemploymentResult["cappedBy"] = "none";
  if (raw > KR_2026.unemploymentDailyMax) {
    daily = KR_2026.unemploymentDailyMax;
    cappedBy = "max";
  } else if (raw < KR_2026.unemploymentDailyMin) {
    daily = KR_2026.unemploymentDailyMin;
    cappedBy = "min";
  }
  daily = Math.round(daily);
  const days = benefitDays(i.ageOver50OrDisabled, i.insuredYears);
  const enoughPeriod = i.insuredYears * 365 >= 180;
  const enoughHours = i.weeklyHours >= 15;
  const eligible = enoughPeriod && enoughHours && i.involuntary;
  return {
    eligible,
    reason: !enoughPeriod ? "short-period" : !enoughHours ? "short-hours" : !i.involuntary ? "voluntary" : "ok",
    avgDailyWage: Math.round(avg),
    rawDaily: Math.round(raw),
    daily,
    cappedBy,
    days,
    monthly: daily * 30,
    total: daily * days,
  };
}
