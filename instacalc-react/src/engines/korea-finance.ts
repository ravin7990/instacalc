/**
 * Korean Finance, Investment & Tax engines (2026 update).
 *
 * Implements exact calculation rules and tax guidelines for South Korea:
 * - 15.4% interest/dividend tax (14% national + 1.4% local)
 * - 1.4% agricultural tax for preferential mutual finance (조특법 예탁금)
 * - 250만원 annual capital gains deduction for overseas stocks + 22% tax
 * - Brokerage ISA tax exemption (200만/400만) & 9.9% separate taxation
 * - Pension savings & IRP tax credits (13.2% vs 16.5%)
 * - National Pension (국민연금) progressive replacement model
 * - Year-end credit/debit card tax deduction (신용카드 15% vs 체크 30%)
 * - Car tax (자동차세 배기량별) + 2026 annual prepayment discount + 7% registration tax
 */

const floor10 = (n: number) => Math.floor(n / 10) * 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/* ------------------------------------------------------------------ */
/* 1. 정기예금 계산기 (Fixed Deposit)                                    */
/* ------------------------------------------------------------------ */

export type DepositTaxType = "normal" | "preferential" | "nonTaxable";
export type DepositInterestType = "simple" | "compoundMonthly";

export interface DepositInput {
  principal: number; // 원금 (KRW)
  periodMonths: number; // 예치기간 (개월)
  annualRate: number; // 연이자율 (%)
  taxType: DepositTaxType; // 과세유형
  interestType: DepositInterestType; // 단리/월복리
}

export interface DepositResult {
  principal: number;
  preTaxInterest: number;
  incomeTax: number;
  localTax: number;
  totalTax: number;
  postTaxInterest: number;
  totalReturn: number;
  effectiveRate: number;
  comparisons: Array<{
    typeLabel: string;
    taxRateLabel: string;
    totalTax: number;
    postTaxInterest: number;
    totalReturn: number;
  }>;
}

export function calculateDeposit(input: DepositInput): DepositResult {
  const principal = Math.max(0, input.principal);
  const periodMonths = Math.max(1, input.periodMonths);
  const rate = Math.max(0, input.annualRate) / 100;

  let preTaxInterest = 0;
  if (input.interestType === "compoundMonthly") {
    preTaxInterest = Math.round(principal * (Math.pow(1 + rate / 12, periodMonths) - 1));
  } else {
    preTaxInterest = Math.round(principal * rate * (periodMonths / 12));
  }

  const computeTax = (interest: number, type: DepositTaxType) => {
    if (type === "nonTaxable") return { incomeTax: 0, localTax: 0, totalTax: 0 };
    if (type === "preferential") {
      const totalTax = Math.floor(interest * 0.014);
      return { incomeTax: 0, localTax: totalTax, totalTax };
    }
    const incomeTax = Math.floor(interest * 0.14);
    const localTax = Math.floor(interest * 0.014);
    return { incomeTax, localTax, totalTax: incomeTax + localTax };
  };

  const currentTax = computeTax(preTaxInterest, input.taxType);
  const postTaxInterest = preTaxInterest - currentTax.totalTax;
  const totalReturn = principal + postTaxInterest;
  const effectiveRate = principal > 0 ? (postTaxInterest / principal) * (12 / periodMonths) * 100 : 0;

  const comparisons: DepositResult["comparisons"] = [
    { type: "normal", label: "일반과세 (15.4%)", rateLabel: "15.4%" },
    { type: "preferential", label: "세금우대 (1.4%)", rateLabel: "1.4%" },
    { type: "nonTaxable", label: "비과세 (0%)", rateLabel: "0%" },
  ].map((c) => {
    const t = computeTax(preTaxInterest, c.type as DepositTaxType);
    const post = preTaxInterest - t.totalTax;
    return {
      typeLabel: c.label,
      taxRateLabel: c.rateLabel,
      totalTax: t.totalTax,
      postTaxInterest: post,
      totalReturn: principal + post,
    };
  });

  return {
    principal,
    preTaxInterest,
    incomeTax: currentTax.incomeTax,
    localTax: currentTax.localTax,
    totalTax: currentTax.totalTax,
    postTaxInterest,
    totalReturn,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    comparisons,
  };
}

/* ------------------------------------------------------------------ */
/* 2. 정기적금 계산기 (Installment Savings)                              */
/* ------------------------------------------------------------------ */

export type SavingsTaxType = "normal" | "preferential" | "nonTaxable";
export type SavingsMethod = "fixed" | "compound";

export interface SavingsInput {
  monthlyDeposit: number; // 월 불입액 (KRW)
  periodMonths: number; // 적금 기간 (개월)
  annualRate: number; // 연이율 (%)
  taxType: SavingsTaxType;
  savingsMethod: SavingsMethod;
}

export interface SavingsResult {
  totalPrincipal: number;
  preTaxInterest: number;
  totalTax: number;
  postTaxInterest: number;
  totalReturn: number;
  effectiveRate: number;
  schedule: Array<{
    month: number;
    cumulativePrincipal: number;
    cumulativeInterest: number;
    balance: number;
  }>;
}

export function calculateSavings(input: SavingsInput): SavingsResult {
  const monthly = Math.max(0, input.monthlyDeposit);
  const months = Math.max(1, input.periodMonths);
  const rate = Math.max(0, input.annualRate) / 100;
  const totalPrincipal = monthly * months;

  let preTaxInterest = 0;
  const schedule: SavingsResult["schedule"] = [];

  if (input.savingsMethod === "compound") {
    // 월복리 계산
    let runningBalance = 0;
    let runningInterest = 0;
    for (let m = 1; m <= months; m++) {
      runningBalance = (runningBalance + monthly) * (1 + rate / 12);
      const principalSoFar = monthly * m;
      runningInterest = Math.round(runningBalance - principalSoFar);
      if (m % Math.max(1, Math.floor(months / 6)) === 0 || m === months) {
        schedule.push({
          month: m,
          cumulativePrincipal: principalSoFar,
          cumulativeInterest: runningInterest,
          balance: Math.round(runningBalance),
        });
      }
    }
    preTaxInterest = Math.round(runningBalance - totalPrincipal);
  } else {
    // 정액적립식 단리 공식: P * (r/12) * [n(n+1)/2]
    preTaxInterest = Math.round(monthly * (rate / 12) * ((months * (months + 1)) / 2));
    for (let m = 1; m <= months; m++) {
      const principalSoFar = monthly * m;
      const interestSoFar = Math.round(monthly * (rate / 12) * ((m * (m + 1)) / 2));
      if (m % Math.max(1, Math.floor(months / 6)) === 0 || m === months) {
        schedule.push({
          month: m,
          cumulativePrincipal: principalSoFar,
          cumulativeInterest: interestSoFar,
          balance: principalSoFar + interestSoFar,
        });
      }
    }
  }

  let taxRate = 0.154;
  if (input.taxType === "preferential") taxRate = 0.014;
  if (input.taxType === "nonTaxable") taxRate = 0;

  const totalTax = Math.floor(preTaxInterest * taxRate);
  const postTaxInterest = preTaxInterest - totalTax;
  const totalReturn = totalPrincipal + postTaxInterest;
  const effectiveRate = totalPrincipal > 0 ? (postTaxInterest / totalPrincipal) * (12 / months) * 100 : 0;

  return {
    totalPrincipal,
    preTaxInterest,
    totalTax,
    postTaxInterest,
    totalReturn,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    schedule,
  };
}

/* ------------------------------------------------------------------ */
/* 3. 파킹통장 / CMA 계산기 (Parking Account)                            */
/* ------------------------------------------------------------------ */

export interface ParkingAccountInput {
  balance: number; // 예치금액 (KRW)
  annualRate: number; // 연이율 (%)
  days: number; // 예치일수 (일)
  compoundDaily: boolean; // 일복리 여부
  taxType: "normal" | "nonTaxable";
}

export interface ParkingAccountResult {
  balance: number;
  days: number;
  preTaxInterest: number;
  totalTax: number;
  postTaxInterest: number;
  totalReturn: number;
  dailyAveragePostTax: number;
  tiers: Array<{
    daysLabel: string;
    preTax: number;
    postTax: number;
    total: number;
  }>;
}

export function calculateParkingAccount(input: ParkingAccountInput): ParkingAccountResult {
  const balance = Math.max(0, input.balance);
  const days = Math.max(1, input.days);
  const rate = Math.max(0, input.annualRate) / 100;

  let preTaxInterest = 0;
  if (input.compoundDaily) {
    preTaxInterest = Math.round(balance * (Math.pow(1 + rate / 365, days) - 1));
  } else {
    preTaxInterest = Math.round(balance * rate * (days / 365));
  }

  const taxRate = input.taxType === "normal" ? 0.154 : 0;
  const totalTax = Math.floor(preTaxInterest * taxRate);
  const postTaxInterest = preTaxInterest - totalTax;
  const totalReturn = balance + postTaxInterest;
  const dailyAveragePostTax = Math.round(postTaxInterest / days);

  const sampleDays = [7, 30, 90, 180, 365];
  const tiers = sampleDays.map((d) => {
    let pret = 0;
    if (input.compoundDaily) {
      pret = Math.round(balance * (Math.pow(1 + rate / 365, d) - 1));
    } else {
      pret = Math.round(balance * rate * (d / 365));
    }
    const t = Math.floor(pret * taxRate);
    const post = pret - t;
    return {
      daysLabel: `${d}일`,
      preTax: pret,
      postTax: post,
      total: balance + post,
    };
  });

  return {
    balance,
    days,
    preTaxInterest,
    totalTax,
    postTaxInterest,
    totalReturn,
    dailyAveragePostTax,
    tiers,
  };
}

/* ------------------------------------------------------------------ */
/* 4. 적금 풍차돌리기 계산기 (Windmill Savings)                           */
/* ------------------------------------------------------------------ */

export interface WindmillInput {
  unitMonthlyDeposit: number; // 매월 신규 개설 적금 1계좌당 월 불입액 (KRW, 예: 100,000)
  annualRate: number; // 연이자율 (%)
  taxType: SavingsTaxType;
}

export interface WindmillResult {
  unitMonthlyDeposit: number;
  maxMonthlyDeposit: number; // 12개월차 최고 월 납입금 (unit * 12)
  totalFirstYearPrincipal: number; // 1년 총 저축액
  totalFirstYearInterest: number; // 12개 계좌 총 세후 이자
  monthlyMaturityPayout: number; // 2년차부터 매월 수령하는 만기 원리금
  annualMaturityTotal: number; // 2년차 연간 총 수령액
  timeline: Array<{
    month: number;
    activeAccounts: number;
    monthlyDeposit: number;
    cumulativePrincipal: number;
    monthlyMaturity: number;
  }>;
}

export function calculateWindmillSavings(input: WindmillInput): WindmillResult {
  const unit = Math.max(0, input.unitMonthlyDeposit);
  const rate = Math.max(0, input.annualRate);

  // 단일 1년(12개월) 만기 적금 계산
  const singleSavings = calculateSavings({
    monthlyDeposit: unit,
    periodMonths: 12,
    annualRate: rate,
    taxType: input.taxType,
    savingsMethod: "fixed",
  });

  const maxMonthlyDeposit = unit * 12;
  // 1년 총 납입 원금: unit * (1 + 2 + ... + 12) = unit * 78
  const totalFirstYearPrincipal = unit * 78;
  const totalFirstYearInterest = singleSavings.postTaxInterest * 12;
  const monthlyMaturityPayout = singleSavings.totalReturn;
  const annualMaturityTotal = monthlyMaturityPayout * 12;

  const timeline: WindmillResult["timeline"] = [];
  let cumPrinc = 0;
  for (let m = 1; m <= 12; m++) {
    const monthlyDeposit = unit * m;
    cumPrinc += monthlyDeposit;
    timeline.push({
      month: m,
      activeAccounts: m,
      monthlyDeposit,
      cumulativePrincipal: cumPrinc,
      monthlyMaturity: 0,
    });
  }
  for (let m = 13; m <= 24; m++) {
    timeline.push({
      month: m,
      activeAccounts: 12,
      monthlyDeposit: maxMonthlyDeposit,
      cumulativePrincipal: cumPrinc + maxMonthlyDeposit * (m - 12),
      monthlyMaturity: monthlyMaturityPayout,
    });
  }

  return {
    unitMonthlyDeposit: unit,
    maxMonthlyDeposit,
    totalFirstYearPrincipal,
    totalFirstYearInterest,
    monthlyMaturityPayout,
    annualMaturityTotal,
    timeline,
  };
}

/* ------------------------------------------------------------------ */
/* 5. 청년도약계좌 계산기 (Youth Leap Account)                           */
/* ------------------------------------------------------------------ */

export type YouthIncomeBracket = "under24m" | "under36m" | "under48m" | "under60m" | "under75m";

export interface YouthLeapInput {
  monthlyDeposit: number; // 월 납입금액 (100,000 ~ 700,000원)
  incomeBracket: YouthIncomeBracket;
  annualRate: number; // 연이율 (기본 + 우대, 약 6.0%)
}

export interface YouthLeapResult {
  monthlyDeposit: number;
  totalDeposit: number; // 5년 본인 납입원금
  monthlyGovMatch: number; // 매월 정부 기여금
  totalGovMatch: number; // 5년 정부 기여금 합계
  taxExemptInterest: number; // 비과세 이자
  totalReturn: number; // 만기 실수령액
  generalSavingsReturn: number; // 일반 적금 가입 시 만기 수령액 (비교용)
  benefitDiff: number; // 일반 적금 대비 총 이득 (절세 + 기여금)
  annualProgress: Array<{
    year: number;
    depositSum: number;
    govMatchSum: number;
    interestSum: number;
    balance: number;
  }>;
}

export function calculateYouthLeap(input: YouthLeapInput): YouthLeapResult {
  const monthly = clamp(input.monthlyDeposit, 100_000, 700_000);
  const months = 60; // 5년
  const rate = Math.max(0, input.annualRate) / 100;

  // 정부 기여금 매칭 규칙:
  // 2,400만 이하: 매칭한도 40만원, 6.0% (최대 24,000원)
  // 3,600만 이하: 매칭한도 50만원, 4.6% (최대 23,000원)
  // 4,800만 이하: 매칭한도 60만원, 3.7% (최대 22,000원)
  // 6,000만 이하: 매칭한도 70만원, 3.0% (최대 21,000원)
  // 7,500만 이하: 정부기여금 0원 (비과세만)
  let matchCap = 0;
  let matchRatio = 0;
  if (input.incomeBracket === "under24m") {
    matchCap = 400_000;
    matchRatio = 0.06;
  } else if (input.incomeBracket === "under36m") {
    matchCap = 500_000;
    matchRatio = 0.046;
  } else if (input.incomeBracket === "under48m") {
    matchCap = 600_000;
    matchRatio = 0.037;
  } else if (input.incomeBracket === "under60m") {
    matchCap = 700_000;
    matchRatio = 0.03;
  }

  const eligibleAmount = Math.min(monthly, matchCap);
  const monthlyGovMatch = Math.round(eligibleAmount * matchRatio);
  const totalGovMatch = monthlyGovMatch * months;
  const totalDeposit = monthly * months;

  // 본인 납입금에 대한 비과세 적금 이자 (단리 기준)
  const bankInterest = Math.round(monthly * (rate / 12) * ((months * (months + 1)) / 2));
  // 정부기여금에 부여되는 이자 (정부기여금도 본인계좌에 매월 적립되므로 이자 발생)
  const govInterest = Math.round(monthlyGovMatch * (rate / 12) * ((months * (months + 1)) / 2));
  const taxExemptInterest = bankInterest + govInterest;

  const totalReturn = totalDeposit + totalGovMatch + taxExemptInterest;

  // 일반 적금 (15.4% 과세, 정부기여금 없음) 비교
  const generalInterest = Math.round(bankInterest * (1 - 0.154));
  const generalSavingsReturn = totalDeposit + generalInterest;
  const benefitDiff = totalReturn - generalSavingsReturn;

  const annualProgress: YouthLeapResult["annualProgress"] = [];
  for (let y = 1; y <= 5; y++) {
    const m = y * 12;
    const dep = monthly * m;
    const gov = monthlyGovMatch * m;
    const int = Math.round((monthly + monthlyGovMatch) * (rate / 12) * ((m * (m + 1)) / 2));
    annualProgress.push({
      year: y,
      depositSum: dep,
      govMatchSum: gov,
      interestSum: int,
      balance: dep + gov + int,
    });
  }

  return {
    monthlyDeposit: monthly,
    totalDeposit,
    monthlyGovMatch,
    totalGovMatch,
    taxExemptInterest,
    totalReturn,
    generalSavingsReturn,
    benefitDiff,
    annualProgress,
  };
}

/* ------------------------------------------------------------------ */
/* 6. 주식 물타기 계산기 (Stock Average-Down)                            */
/* ------------------------------------------------------------------ */

export interface AverageDownInput {
  currentPrice: number; // 1차 매수 평단가 (KRW)
  currentQuantity: number; // 보유 주수 (주)
  additionalPrice: number; // 추가 매수 단가 (KRW)
  additionalQuantity: number; // 추가 매수 주수 (주)
  targetAveragePrice?: number; // (선택) 목표 희망 평단가
}

export interface AverageDownResult {
  currentInvestment: number;
  additionalInvestment: number;
  totalQuantity: number;
  totalInvestment: number;
  finalAveragePrice: number;
  priceReduction: number;
  priceReductionPercent: number;
  targetRequiredQuantity?: number;
  targetRequiredInvestment?: number;
  simulations: Array<{
    addQty: number;
    totalQty: number;
    addCost: number;
    newAverage: number;
    discountPercent: number;
  }>;
}

export function calculateAverageDown(input: AverageDownInput): AverageDownResult {
  const curPrice = Math.max(0, input.currentPrice);
  const curQty = Math.max(0, input.currentQuantity);
  const addPrice = Math.max(0, input.additionalPrice);
  const addQty = Math.max(0, input.additionalQuantity);

  const currentInvestment = curPrice * curQty;
  const additionalInvestment = addPrice * addQty;
  const totalQuantity = curQty + addQty;
  const totalInvestment = currentInvestment + additionalInvestment;

  const finalAveragePrice = totalQuantity > 0 ? Math.round(totalInvestment / totalQuantity) : curPrice;
  const priceReduction = curPrice - finalAveragePrice;
  const priceReductionPercent = curPrice > 0 ? (priceReduction / curPrice) * 100 : 0;

  let targetRequiredQuantity: number | undefined;
  let targetRequiredInvestment: number | undefined;

  if (input.targetAveragePrice && input.targetAveragePrice > addPrice && input.targetAveragePrice < curPrice) {
    const target = input.targetAveragePrice;
    // target = (curPrice * curQty + addPrice * X) / (curQty + X)
    // X = curQty * (curPrice - target) / (target - addPrice)
    const needed = Math.ceil((curQty * (curPrice - target)) / (target - addPrice));
    targetRequiredQuantity = needed;
    targetRequiredInvestment = needed * addPrice;
  }

  // 매수 수량별 시뮬레이션 표
  const baseSteps = [10, 20, 50, 100, 200, 500];
  const simulations = baseSteps.map((qty) => {
    const tQty = curQty + qty;
    const tInv = currentInvestment + addPrice * qty;
    const avg = tQty > 0 ? Math.round(tInv / tQty) : curPrice;
    const disc = curPrice > 0 ? ((curPrice - avg) / curPrice) * 100 : 0;
    return {
      addQty: qty,
      totalQty: tQty,
      addCost: addPrice * qty,
      newAverage: avg,
      discountPercent: Math.round(disc * 10) / 10,
    };
  });

  return {
    currentInvestment,
    additionalInvestment,
    totalQuantity,
    totalInvestment,
    finalAveragePrice,
    priceReduction,
    priceReductionPercent: Math.round(priceReductionPercent * 10) / 10,
    targetRequiredQuantity,
    targetRequiredInvestment,
    simulations,
  };
}

/* ------------------------------------------------------------------ */
/* 7. 적립식 복리 투자 계산기 (Compound Investment / Korean SIP)           */
/* ------------------------------------------------------------------ */

export interface CompoundInvestmentInput {
  initialInvestment: number; // 초기 투자금 (KRW)
  monthlyContribution: number; // 매월 추가 적립금 (KRW)
  annualReturn: number; // 예상 연 수익률 (%)
  years: number; // 투자 기간 (년)
  taxType: "nonTaxable" | "normal"; // 비과세/국내주식 vs 일반 과세 (15.4%)
}

export interface CompoundInvestmentResult {
  totalPrincipal: number;
  totalGains: number;
  tax: number;
  finalBalance: number;
  roiPercent: number;
  annualHistory: Array<{
    year: number;
    cumulativePrincipal: number;
    totalBalance: number;
    interestGained: number;
  }>;
}

export function calculateCompoundInvestment(input: CompoundInvestmentInput): CompoundInvestmentResult {
  const init = Math.max(0, input.initialInvestment);
  const monthly = Math.max(0, input.monthlyContribution);
  const r = Math.max(0, input.annualReturn) / 100;
  const years = clamp(input.years, 1, 50);
  const monthlyRate = r / 12;

  let balance = init;
  const annualHistory: CompoundInvestmentResult["annualHistory"] = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      balance = (balance + monthly) * (1 + monthlyRate);
    }
    const princ = init + monthly * y * 12;
    annualHistory.push({
      year: y,
      cumulativePrincipal: princ,
      totalBalance: Math.round(balance),
      interestGained: Math.round(balance - princ),
    });
  }

  const totalPrincipal = init + monthly * years * 12;
  const grossGains = Math.round(balance - totalPrincipal);
  const taxRate = input.taxType === "normal" ? 0.154 : 0;
  const tax = Math.floor(grossGains * taxRate);
  const netGains = grossGains - tax;
  const finalBalance = totalPrincipal + netGains;
  const roiPercent = totalPrincipal > 0 ? (netGains / totalPrincipal) * 100 : 0;

  return {
    totalPrincipal,
    totalGains: netGains,
    tax,
    finalBalance,
    roiPercent: Math.round(roiPercent * 10) / 10,
    annualHistory,
  };
}

/* ------------------------------------------------------------------ */
/* 8. 해외주식 양도소득세 계산기 (Overseas Stock Tax)                     */
/* ------------------------------------------------------------------ */

export interface OverseasStockTaxInput {
  realizedGain: number; // 연간 실현 차익 (KRW)
  realizedLoss?: number; // 연간 실현 손실 (손익통산)
  expenses?: number; // 제비용 및 매매 수수료
  basicDeduction?: number; // 기본공제 (기본 2,500,000원)
}

export interface OverseasStockTaxResult {
  netProfit: number; // 손익 통산 후 순차익
  basicDeductionApplied: number;
  taxableBase: number; // 과세표준
  capitalGainsTax: number; // 국세 20%
  localIncomeTax: number; // 지방세 2%
  totalTax: number; // 총 세금 (22%)
  afterTaxProfit: number; // 세후 순수익
  effectiveTaxRate: number; // 실효세율 (%)
  tiers: Array<{
    gainLabel: string;
    taxable: number;
    tax: number;
    effective: number;
  }>;
}

export function calculateOverseasStockTax(input: OverseasStockTaxInput): OverseasStockTaxResult {
  const gain = Math.max(0, input.realizedGain);
  const loss = Math.max(0, input.realizedLoss ?? 0);
  const exp = Math.max(0, input.expenses ?? 0);
  const basicDeduction = input.basicDeduction ?? 2_500_000;

  const netProfit = Math.max(0, gain - loss - exp);
  const basicDeductionApplied = Math.min(netProfit, basicDeduction);
  const taxableBase = Math.max(0, netProfit - basicDeductionApplied);

  const capitalGainsTax = Math.floor(taxableBase * 0.2);
  const localIncomeTax = Math.floor(capitalGainsTax * 0.1);
  const totalTax = capitalGainsTax + localIncomeTax;
  const afterTaxProfit = netProfit - totalTax;
  const effectiveTaxRate = netProfit > 0 ? (totalTax / netProfit) * 100 : 0;

  const sampleGains = [2_500_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000];
  const tiers = sampleGains.map((g) => {
    const base = Math.max(0, g - basicDeduction);
    const tax = Math.floor(base * 0.22);
    const eff = g > 0 ? (tax / g) * 100 : 0;
    return {
      gainLabel: `${Math.round(g / 10_000).toLocaleString("ko-KR")}만 원`,
      taxable: base,
      tax,
      effective: Math.round(eff * 10) / 10,
    };
  });

  return {
    netProfit,
    basicDeductionApplied,
    taxableBase,
    capitalGainsTax,
    localIncomeTax,
    totalTax,
    afterTaxProfit,
    effectiveTaxRate: Math.round(effectiveTaxRate * 10) / 10,
    tiers,
  };
}

/* ------------------------------------------------------------------ */
/* 9. 미국 배당금 실수령액 계산기 (Dividend Tax)                           */
/* ------------------------------------------------------------------ */

export interface DividendTaxInput {
  shares: number; // 보유 주식 수
  dividendPerShareUSD: number; // 1회당 주당 배당금 (USD)
  frequency: 1 | 4 | 12; // 연간/분기/월 배당
  usdKrwRate: number; // 환율 (원/달러, 예: 1,350)
  usTaxRate?: number; // 미국 원천징수세율 (% 기본 15%)
}

export interface DividendTaxResult {
  preTaxUsd: number;
  taxUsd: number;
  postTaxUsd: number;
  preTaxKrw: number;
  taxKrw: number;
  postTaxKrw: number;
  annualPreTaxKrw: number;
  annualPostTaxKrw: number;
  isFinancialIncomeTaxRisk: boolean; // 2,000만원 초과 금융소득종합과세 주의 여부
  rateScenarios: Array<{
    rate: number;
    preTaxKrw: number;
    postTaxKrw: number;
    annualPostTaxKrw: number;
  }>;
}

export function calculateDividendTax(input: DividendTaxInput): DividendTaxResult {
  const shares = Math.max(0, input.shares);
  const divUSD = Math.max(0, input.dividendPerShareUSD);
  const rate = Math.max(1, input.usdKrwRate);
  const usTaxRate = (input.usTaxRate ?? 15) / 100;
  const freq = input.frequency;

  const preTaxUsd = shares * divUSD;
  const taxUsd = preTaxUsd * usTaxRate;
  const postTaxUsd = preTaxUsd - taxUsd;

  const preTaxKrw = Math.round(preTaxUsd * rate);
  const taxKrw = Math.floor(taxUsd * rate);
  const postTaxKrw = preTaxKrw - taxKrw;

  const annualPreTaxKrw = preTaxKrw * freq;
  const annualPostTaxKrw = postTaxKrw * freq;
  const isFinancialIncomeTaxRisk = annualPreTaxKrw > 20_000_000;

  const deltaRates = [rate - 50, rate, rate + 50];
  const rateScenarios = deltaRates.map((r) => {
    const pret = Math.round(preTaxUsd * r);
    const tx = Math.floor(taxUsd * r);
    const post = pret - tx;
    return {
      rate: r,
      preTaxKrw: pret,
      postTaxKrw: post,
      annualPostTaxKrw: post * freq,
    };
  });

  return {
    preTaxUsd: Math.round(preTaxUsd * 100) / 100,
    taxUsd: Math.round(taxUsd * 100) / 100,
    postTaxUsd: Math.round(postTaxUsd * 100) / 100,
    preTaxKrw,
    taxKrw,
    postTaxKrw,
    annualPreTaxKrw,
    annualPostTaxKrw,
    isFinancialIncomeTaxRisk,
    rateScenarios,
  };
}

/* ------------------------------------------------------------------ */
/* 10. 가상자산(코인) 수익률 계산기 (Crypto Profit)                        */
/* ------------------------------------------------------------------ */

export interface CryptoProfitInput {
  buyPrice: number; // 매수 단가 (KRW)
  quantity: number; // 매수 수량
  sellPrice: number; // 매도 단가 (KRW)
  exchangeFeeRate: number; // 편도 거래 수수료율 (% 예: 0.05)
}

export interface CryptoProfitResult {
  buyTotal: number;
  buyFee: number;
  totalBuyCost: number;
  sellTotal: number;
  sellFee: number;
  netSellProceeds: number;
  totalFees: number;
  netProfit: number;
  roiPercent: number;
  breakEvenSellPrice: number;
  priceTargets: Array<{
    targetPrice: number;
    pctChange: number;
    netProfit: number;
    roi: number;
  }>;
}

export function calculateCryptoProfit(input: CryptoProfitInput): CryptoProfitResult {
  const buyPrice = Math.max(0, input.buyPrice);
  const qty = Math.max(0, input.quantity);
  const sellPrice = Math.max(0, input.sellPrice);
  const feeRate = Math.max(0, input.exchangeFeeRate) / 100;

  const buyTotal = Math.round(buyPrice * qty);
  const buyFee = Math.floor(buyTotal * feeRate);
  const totalBuyCost = buyTotal + buyFee;

  const sellTotal = Math.round(sellPrice * qty);
  const sellFee = Math.floor(sellTotal * feeRate);
  const netSellProceeds = sellTotal - sellFee;

  const totalFees = buyFee + sellFee;
  const netProfit = netSellProceeds - totalBuyCost;
  const roiPercent = totalBuyCost > 0 ? (netProfit / totalBuyCost) * 100 : 0;

  // 손익분기 매도가: (buyTotal + buyFee) / (qty * (1 - feeRate))
  const breakEvenSellPrice = qty > 0 ? Math.ceil(totalBuyCost / (qty * (1 - feeRate))) : 0;

  const targetSteps = [-20, -10, -5, 0, 5, 10, 20, 30];
  const priceTargets = targetSteps.map((pct) => {
    const tgtPrice = Math.round(buyPrice * (1 + pct / 100));
    const sTotal = Math.round(tgtPrice * qty);
    const sFee = Math.floor(sTotal * feeRate);
    const profit = sTotal - sFee - totalBuyCost;
    const roi = totalBuyCost > 0 ? (profit / totalBuyCost) * 100 : 0;
    return {
      targetPrice: tgtPrice,
      pctChange: pct,
      netProfit: profit,
      roi: Math.round(roi * 10) / 10,
    };
  });

  return {
    buyTotal,
    buyFee,
    totalBuyCost,
    sellTotal,
    sellFee,
    netSellProceeds,
    totalFees,
    netProfit,
    roiPercent: Math.round(roiPercent * 10) / 10,
    breakEvenSellPrice,
    priceTargets,
  };
}

/* ------------------------------------------------------------------ */
/* 11. 중개형 ISA 절세 계산기 (Brokerage ISA)                             */
/* ------------------------------------------------------------------ */

export type IsaAccountType = "general" | "ruralOrLowIncome";

export interface IsaInput {
  netProfit: number; // 계좌 내 순 수익 (KRW)
  accountType: IsaAccountType; // 일반형(200만) vs 서민형(400만)
}

export interface IsaResult {
  netProfit: number;
  exemptionLimit: number;
  taxExemptProfit: number;
  taxableExcess: number;
  isaTax: number; // 9.9% 분리과세
  regularTax: number; // 15.4% 일반 계좌 과세
  taxSaved: number;
  taxSavedRatio: number;
  profitTiers: Array<{
    profitLabel: string;
    regularTax: number;
    isaTax: number;
    savings: number;
  }>;
}

export function calculateIsaSavings(input: IsaInput): IsaResult {
  const netProfit = Math.max(0, input.netProfit);
  const exemptionLimit = input.accountType === "ruralOrLowIncome" ? 4_000_000 : 2_000_000;

  const taxExemptProfit = Math.min(netProfit, exemptionLimit);
  const taxableExcess = Math.max(0, netProfit - exemptionLimit);

  // ISA 초과분 9.9% 분리과세
  const isaTax = Math.floor(taxableExcess * 0.099);
  // 일반 위탁계좌 15.4% 배당소득세 과세
  const regularTax = Math.floor(netProfit * 0.154);
  const taxSaved = Math.max(0, regularTax - isaTax);
  const taxSavedRatio = regularTax > 0 ? (taxSaved / regularTax) * 100 : 0;

  const samples = [2_000_000, 4_000_000, 10_000_000, 20_000_000, 30_000_000, 50_000_000];
  const profitTiers = samples.map((p) => {
    const reg = Math.floor(p * 0.154);
    const excess = Math.max(0, p - exemptionLimit);
    const isat = Math.floor(excess * 0.099);
    return {
      profitLabel: `${Math.round(p / 10_000).toLocaleString("ko-KR")}만 원`,
      regularTax: reg,
      isaTax: isat,
      savings: reg - isat,
    };
  });

  return {
    netProfit,
    exemptionLimit,
    taxExemptProfit,
    taxableExcess,
    isaTax,
    regularTax,
    taxSaved,
    taxSavedRatio: Math.round(taxSavedRatio * 10) / 10,
    profitTiers,
  };
}

/* ------------------------------------------------------------------ */
/* 12. 연금저축 & IRP 세액공제 계산기 (Pension & IRP)                      */
/* ------------------------------------------------------------------ */

export interface PensionIrpInput {
  grossSalary: number; // 총급여액 (KRW, 5,500만원 기준)
  pensionSavingsDeposit: number; // 연금저축 납입액 (원, 한도 600만원)
  irpDeposit: number; // IRP 납입액 (원, 합산 900만원 한도)
}

export interface PensionIrpResult {
  pensionSavingsEligible: number;
  irpEligible: number;
  totalEligible: number;
  creditRate: number; // 16.5% or 13.2%
  taxRefund: number;
  netContribution: number; // 실부담금 = 납입액 - 환급액
  depositTiers: Array<{
    depositLabel: string;
    lowIncomeRefund: number; // 16.5%
    highIncomeRefund: number; // 13.2%
  }>;
}

export function calculatePensionIrpTaxCredit(input: PensionIrpInput): PensionIrpResult {
  const salary = Math.max(0, input.grossSalary);
  const pensionDeposit = Math.max(0, input.pensionSavingsDeposit);
  const irpDeposit = Math.max(0, input.irpDeposit);

  // 연금저축 단독 한도: 600만원
  const pensionSavingsEligible = Math.min(pensionDeposit, 6_000_000);
  // IRP 포함 합산 한도: 900만원
  const remainingCap = Math.max(0, 9_000_000 - pensionSavingsEligible);
  const irpEligible = Math.min(irpDeposit, remainingCap);
  const totalEligible = pensionSavingsEligible + irpEligible;

  // 총급여 5,500만원 이하 16.5%, 초과 13.2%
  const creditRate = salary <= 55_000_000 ? 0.165 : 0.132;
  const taxRefund = Math.floor(totalEligible * creditRate);
  const totalDeposit = pensionDeposit + irpDeposit;
  const netContribution = totalDeposit - taxRefund;

  const samples = [1_000_000, 3_000_000, 6_000_000, 9_000_000];
  const depositTiers = samples.map((d) => {
    const elig = Math.min(d, 9_000_000);
    return {
      depositLabel: `${Math.round(d / 10_000).toLocaleString("ko-KR")}만 원`,
      lowIncomeRefund: Math.floor(elig * 0.165),
      highIncomeRefund: Math.floor(elig * 0.132),
    };
  });

  return {
    pensionSavingsEligible,
    irpEligible,
    totalEligible,
    creditRate: Math.round(creditRate * 1000) / 10,
    taxRefund,
    netContribution,
    depositTiers,
  };
}

/* ------------------------------------------------------------------ */
/* 13. 국민연금 예상수령액 계산기 (National Pension)                       */
/* ------------------------------------------------------------------ */

export interface NationalPensionInput {
  monthlyIncome: number; // 월 소득액 (기준소득월액 39만 ~ 617만)
  yearsEnrolled: number; // 가입기간 (년수, 10~40년)
  isEmployee: boolean; // 직장인 (4.5%) vs 지역가입자 (9.0%)
}

export interface NationalPensionResult {
  standardMonthlyIncome: number;
  monthlyPremium: number;
  totalPremiumsPaid: number;
  estimatedMonthlyPension: number; // 만 65세 개시 예상 월 연금액
  estimatedAnnualPension: number;
  breakEvenMonths: number; // 원금 회수 소요 개월수
  breakEvenYears: number;
  yearsSchedule: Array<{
    years: number;
    monthlyPension: number;
    annualPension: number;
    totalPaid: number;
  }>;
}

export function calculateNationalPension(input: NationalPensionInput): NationalPensionResult {
  // 2026 기준소득월액 상·하한 (하한 39만, 상한 617만)
  const income = clamp(input.monthlyIncome, 390_000, 6_170_000);
  const years = clamp(input.yearsEnrolled, 10, 45);

  const premiumRate = input.isEmployee ? 0.045 : 0.09;
  const monthlyPremium = floor10(income * premiumRate);
  const totalPremiumsPaid = monthlyPremium * years * 12;

  // 국민연금 기본 공식 근사치: A값(가입자 평균소득 2024~2026 약 298만원)과 B값(본인 소득)
  // 20년 가입 기준 소득대체율 40% 모델
  const aVal = 2_989_237;
  const bVal = income;
  const baseRate = (aVal + bVal) * 0.2; // 20년 기준 연금액 월액
  const estimatedMonthlyPension = Math.round((baseRate * (years / 20)) / 100) * 100;
  const estimatedAnnualPension = estimatedMonthlyPension * 12;

  const breakEvenMonths = estimatedMonthlyPension > 0 ? Math.ceil(totalPremiumsPaid / estimatedMonthlyPension) : 0;
  const breakEvenYears = Math.round((breakEvenMonths / 12) * 10) / 10;

  const sampleYears = [10, 15, 20, 25, 30, 35, 40];
  const yearsSchedule = sampleYears.map((y) => {
    const mPen = Math.round((baseRate * (y / 20)) / 100) * 100;
    return {
      years: y,
      monthlyPension: mPen,
      annualPension: mPen * 12,
      totalPaid: monthlyPremium * y * 12,
    };
  });

  return {
    standardMonthlyIncome: income,
    monthlyPremium,
    totalPremiumsPaid,
    estimatedMonthlyPension,
    estimatedAnnualPension,
    breakEvenMonths,
    breakEvenYears,
    yearsSchedule,
  };
}

/* ------------------------------------------------------------------ */
/* 14. 연말정산 신용카드 소득공제 계산기 (Year-End Tax Settlement)           */
/* ------------------------------------------------------------------ */

export interface YearEndTaxInput {
  annualGrossSalary: number; // 총급여액 (KRW)
  creditCard: number; // 신용카드 사용액
  debitCard: number; // 체크카드 / 현금영수증 사용액
  traditionalMarketTransit?: number; // 전통시장 및 대중교통 사용액
}

export interface YearEndTaxResult {
  totalUsage: number;
  minimumThreshold: number; // 총급여의 25% (공제 문턱)
  excessUsage: number; // 문턱 초과 사용액
  creditCardDeduction: number;
  debitCardDeduction: number;
  marketTransitDeduction: number;
  totalDeduction: number; // 실제 소득공제 인정 금액
  estimatedTaxSaved: number; // 한계세율 적용 예상 환급액
  marginalTaxRate: number; // 적용된 한계세율 (%)
  methodsComparison: Array<{
    method: string;
    rateLabel: string;
    amount: number;
    deduction: number;
  }>;
}

export function calculateYearEndTax(input: YearEndTaxInput): YearEndTaxResult {
  const salary = Math.max(0, input.annualGrossSalary);
  const credit = Math.max(0, input.creditCard);
  const debit = Math.max(0, input.debitCard);
  const market = Math.max(0, input.traditionalMarketTransit ?? 0);

  const totalUsage = credit + debit + market;
  const minimumThreshold = Math.round(salary * 0.25);
  const excessUsage = Math.max(0, totalUsage - minimumThreshold);

  // 공제 문턱 채우기: 신용카드(15%)를 먼저 채워 문턱을 소진하는 것이 근로자에게 가장 유리
  let thresholdRemaining = minimumThreshold;

  const creditUsedForThreshold = Math.min(credit, thresholdRemaining);
  thresholdRemaining -= creditUsedForThreshold;
  const creditEligible = credit - creditUsedForThreshold;

  const debitUsedForThreshold = Math.min(debit, thresholdRemaining);
  thresholdRemaining -= debitUsedForThreshold;
  const debitEligible = debit - debitUsedForThreshold;

  const marketUsedForThreshold = Math.min(market, thresholdRemaining);
  thresholdRemaining -= marketUsedForThreshold;
  const marketEligible = market - marketUsedForThreshold;

  // 공제율: 신용카드 15%, 체크카드 30%, 전통시장/대중교통 40%
  const creditCardDeductionRaw = Math.floor(creditEligible * 0.15);
  const debitCardDeductionRaw = Math.floor(debitEligible * 0.3);
  const marketTransitDeductionRaw = Math.floor(marketEligible * 0.4);

  // 공제 한도: 총급여 7,000만원 이하 300만원, 초과 250만원
  const baseCap = salary <= 70_000_000 ? 3_000_000 : 2_500_000;
  const standardDeduction = Math.min(creditCardDeductionRaw + debitCardDeductionRaw, baseCap);
  // 전통시장/대중교통 추가 한도: 최대 100만원
  const additionalMarketDeduction = Math.min(marketTransitDeductionRaw, 1_000_000);

  const totalDeduction = standardDeduction + additionalMarketDeduction;

  // 한계세율 추정 (총급여 기준 간이 구간)
  let marginalRate = 0.06;
  if (salary > 88_000_000) marginalRate = 0.35;
  else if (salary > 50_000_000) marginalRate = 0.24;
  else if (salary > 14_000_000) marginalRate = 0.15;

  const estimatedTaxSaved = Math.floor(totalDeduction * marginalRate * 1.1); // 지방세 10% 포함

  const methodsComparison = [
    { method: "신용카드", rateLabel: "15%", amount: credit, deduction: creditCardDeductionRaw },
    { method: "체크카드 / 현금영수증", rateLabel: "30%", amount: debit, deduction: debitCardDeductionRaw },
    { method: "전통시장 / 대중교통", rateLabel: "40%", amount: market, deduction: marketTransitDeductionRaw },
  ];

  return {
    totalUsage,
    minimumThreshold,
    excessUsage,
    creditCardDeduction: creditCardDeductionRaw,
    debitCardDeduction: debitCardDeductionRaw,
    marketTransitDeduction: marketTransitDeductionRaw,
    totalDeduction,
    estimatedTaxSaved,
    marginalTaxRate: Math.round(marginalRate * 100),
    methodsComparison,
  };
}

/* ------------------------------------------------------------------ */
/* 15. 자동차세 연납 & 취등록세 계산기 (Car Tax)                          */
/* ------------------------------------------------------------------ */

export interface CarTaxInput {
  displacementCc: number; // 배기량 (cc, 예: 1598, 1998, 2497)
  carAgeYears: number; // 차령 (연식, 1~15년)
  isCommercial?: boolean; // 비영업용(기본) vs 영업용
  prepayMonth: 0 | 1 | 3 | 6 | 9; // 연납 신청 월 (0: 정기분 분납, 1: 1월 5% 할인)
  vehiclePrice?: number; // 차량 취득가액 (원, 취등록세 7% 계산용)
}

export interface CarTaxResult {
  displacementCc: number;
  baseAnnualTax: number; // 차령 경감 전 본세
  ageDiscountRate: number; // 차령 할인율 (%)
  discountedBaseTax: number; // 차령 경감 후 본세
  educationTax: number; // 지방교육세 (본세의 30%)
  regularTotalTax: number; // 정상 연간 자동차세 합계
  prepayDiscountRate: number; // 연납 할인율 (%)
  prepayDiscountAmount: number; // 연납 할인 절약액
  finalCarTax: number; // 최종 납부 자동차세
  registrationTax: number; // 취등록세 (7%, 경차 혜택 반영)
  totalInitialExpense: number; // 자동차세 + 취등록세
  prepayComparison: Array<{
    monthLabel: string;
    discountRateLabel: string;
    finalTax: number;
    saved: number;
  }>;
}

export function calculateCarTax(input: CarTaxInput): CarTaxResult {
  const cc = Math.max(0, input.displacementCc);
  const age = clamp(input.carAgeYears, 1, 20);
  const price = Math.max(0, input.vehiclePrice ?? 0);

  // 배기량별 cc당 세액 (비영업용 승용차 기준)
  let ratePerCc = 200;
  if (cc <= 1000) ratePerCc = 80;
  else if (cc <= 1600) ratePerCc = 140;

  const baseAnnualTax = cc * ratePerCc;

  // 차령 경감: 3년차부터 매년 5%씩 최대 50% 감면
  const ageDiscountRate = Math.min(0.5, Math.max(0, (age - 2) * 0.05));
  const discountedBaseTax = Math.floor(baseAnnualTax * (1 - ageDiscountRate));
  const educationTax = Math.floor(discountedBaseTax * 0.3); // 비영업용 승용 30%
  const regularTotalTax = discountedBaseTax + educationTax;

  // 2026 지방세법 연납 할인율: 1월 5%, 3월 3.75%, 6월 2.5%, 9월 1.25%
  let prepayDiscountRate = 0;
  if (input.prepayMonth === 1) prepayDiscountRate = 0.05;
  else if (input.prepayMonth === 3) prepayDiscountRate = 0.0375;
  else if (input.prepayMonth === 6) prepayDiscountRate = 0.025;
  else if (input.prepayMonth === 9) prepayDiscountRate = 0.0125;

  const prepayDiscountAmount = Math.floor(regularTotalTax * prepayDiscountRate);
  const finalCarTax = regularTotalTax - prepayDiscountAmount;

  // 취등록세: 일반 승용차 7%, 1000cc 이하 경차는 최대 75만원 감면 혜택
  let regTax = Math.floor(price * 0.07);
  if (cc <= 1000 && price > 0) {
    regTax = Math.max(0, regTax - 750_000);
  }
  const registrationTax = regTax;
  const totalInitialExpense = finalCarTax + registrationTax;

  const months: Array<{ m: 1 | 3 | 6 | 9 | 0; label: string; rate: string; r: number }> = [
    { m: 1, label: "1월 연납", rate: "5%", r: 0.05 },
    { m: 3, label: "3월 연납", rate: "3.75%", r: 0.0375 },
    { m: 6, label: "6월 연납", rate: "2.5%", r: 0.025 },
    { m: 9, label: "9월 연납", rate: "1.25%", r: 0.0125 },
    { m: 0, label: "정기분 (6월·12월)", rate: "0%", r: 0 },
  ];

  const prepayComparison = months.map((mo) => {
    const disc = Math.floor(regularTotalTax * mo.r);
    return {
      monthLabel: mo.label,
      discountRateLabel: mo.rate,
      finalTax: regularTotalTax - disc,
      saved: disc,
    };
  });

  return {
    displacementCc: cc,
    baseAnnualTax,
    ageDiscountRate: Math.round(ageDiscountRate * 100),
    discountedBaseTax,
    educationTax,
    regularTotalTax,
    prepayDiscountRate: Math.round(prepayDiscountRate * 1000) / 10,
    prepayDiscountAmount,
    finalCarTax,
    registrationTax,
    totalInitialExpense,
    prepayComparison,
  };
}
