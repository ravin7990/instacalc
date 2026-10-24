/**
 * Korea Extended Financial and Regulatory Calculation Engines
 *
 * Implements 10 high-demand Korean calculators:
 * 1. calculateCapitalGainsTax (부동산 양도소득세)
 * 2. calculateHousingSubscriptionScore (주택청약 가점 84점 만점)
 * 3. calculateAnnualLeavePay (미사용 연차수당)
 * 4. calculateCardDeductionOptimizer (신용카드 vs 체크카드 소득공제 황금비율)
 * 5. calculateInheritanceGiftTax (증여세 및 상속세 누진세율)
 * 6. calculateParentalLeavePay (육아휴직 급여 2026 최신 상한액)
 * 7. calculateLoanPrepaymentPenalty (대출 중도상환수수료 및 대환대출 손익분기)
 * 8. calculateHealthInsuranceDependent (건보 피부양자 자격 및 지역보험료 모의계산)
 * 9. calculateElectricityBill (한전 주택용 저압/고압 누진세 전기요금)
 * 10. calculatePolicyHousingLoan (디딤돌·버팀목 정책금융 대출이자 및 한도)
 */

// ---------------------------------------------------------------------------
// 1. 부동산 양도소득세 (Real Estate Capital Gains Tax)
// ---------------------------------------------------------------------------
export interface CapitalGainsTaxInput {
  salePrice: number; // 양도가액 (KRW)
  purchasePrice: number; // 취득가액 (KRW)
  expenses: number; // 필요경비 (KRW)
  holdingYears: number; // 보유기간 (년)
  residencyYears: number; // 실거주기간 (년)
  isOneHomeowner: boolean; // 1세대 1주택 비과세 대상 여부
  isRegulatedArea: boolean; // 조정대상지역 여부
  multiHomeCount: number; // 주택 수 (1, 2, 3 이상)
}

export interface CapitalGainsTaxResult {
  capitalGain: number; // 양도차익
  taxableGain: number; // 과세대상 양도차익 (1주택 12억 초과분 안분)
  specialDeductionRate: number; // 장기보유특별공제율 (%)
  specialDeductionAmount: number; // 장기보유특별공제액
  basicDeduction: number; // 기본공제 (250만 원)
  taxBase: number; // 과세표준
  baseTaxRate: number; // 적용 세율 (%)
  calculatedTax: number; // 산출세액
  localIncomeTax: number; // 지방소득세 (10%)
  totalTax: number; // 총 납부세액
  effectiveRate: number; // 실효세율 (%)
  netProfit: number; // 세후 실수령 순이익
  isNonTaxable: boolean; // 비과세 여부
}

export function calculateCapitalGainsTax(input: CapitalGainsTaxInput): CapitalGainsTaxResult {
  const {
    salePrice,
    purchasePrice,
    expenses,
    holdingYears,
    residencyYears,
    isOneHomeowner,
    multiHomeCount,
  } = input;

  const capitalGain = Math.max(0, salePrice - purchasePrice - expenses);

  // 1세대 1주택 비과세 요건: 보유 2년 이상 (조정지역은 거주 2년 이상)
  // 양도가액 12억 원 이하는 완전 비과세
  if (isOneHomeowner && holdingYears >= 2) {
    if (salePrice <= 1_200_000_000) {
      return {
        capitalGain,
        taxableGain: 0,
        specialDeductionRate: 0,
        specialDeductionAmount: 0,
        basicDeduction: 0,
        taxBase: 0,
        baseTaxRate: 0,
        calculatedTax: 0,
        localIncomeTax: 0,
        totalTax: 0,
        effectiveRate: 0,
        netProfit: capitalGain,
        isNonTaxable: true,
      };
    }
  }

  // 1세대 1주택 12억 초과분 안분 계산
  let taxableGain = capitalGain;
  if (isOneHomeowner && holdingYears >= 2 && salePrice > 1_200_000_000) {
    taxableGain = Math.round(capitalGain * ((salePrice - 1_200_000_000) / salePrice));
  }

  // 장기보유특별공제 계산
  let specialDeductionRate = 0;
  if (holdingYears >= 3) {
    if (isOneHomeowner && holdingYears >= 2) {
      // 1세대 1주택: 보유기간 연 4% (최대 40%, 10년) + 거주기간 연 4% (최대 40%, 10년, 2년 이상 거주 시)
      const holdRate = Math.min(40, Math.floor(holdingYears) * 4);
      const resideRate = residencyYears >= 2 ? Math.min(40, Math.floor(residencyYears) * 4) : 0;
      specialDeductionRate = holdRate + resideRate;
    } else if (multiHomeCount <= 1) {
      // 일반 (다주택 중과 유예 또는 일반 부동산): 연 2%씩 최대 30% (15년 이상)
      specialDeductionRate = Math.min(30, Math.floor(holdingYears) * 2);
    }
  }

  const specialDeductionAmount = Math.round(taxableGain * (specialDeductionRate / 100));
  const incomeAfterSpecial = taxableGain - specialDeductionAmount;
  const basicDeduction = incomeAfterSpecial > 0 ? 2_500_000 : 0;
  const taxBase = Math.max(0, incomeAfterSpecial - basicDeduction);

  // 종합 누진세율표 (소득세법 제104조)
  let calculatedTax = 0;
  let baseTaxRate = 6;
  if (taxBase <= 14_000_000) {
    calculatedTax = taxBase * 0.06;
    baseTaxRate = 6;
  } else if (taxBase <= 50_000_000) {
    calculatedTax = 840_000 + (taxBase - 14_000_000) * 0.15;
    baseTaxRate = 15;
  } else if (taxBase <= 88_000_000) {
    calculatedTax = 6_240_000 + (taxBase - 50_000_000) * 0.24;
    baseTaxRate = 24;
  } else if (taxBase <= 150_000_000) {
    calculatedTax = 15_360_000 + (taxBase - 88_000_000) * 0.35;
    baseTaxRate = 35;
  } else if (taxBase <= 300_000_000) {
    calculatedTax = 37_060_000 + (taxBase - 150_000_000) * 0.38;
    baseTaxRate = 38;
  } else if (taxBase <= 500_000_000) {
    calculatedTax = 94_060_000 + (taxBase - 300_000_000) * 0.40;
    baseTaxRate = 40;
  } else if (taxBase <= 1_000_000_000) {
    calculatedTax = 174_060_000 + (taxBase - 500_000_000) * 0.42;
    baseTaxRate = 42;
  } else {
    calculatedTax = 384_060_000 + (taxBase - 1_000_000_000) * 0.45;
    baseTaxRate = 45;
  }

  calculatedTax = Math.round(calculatedTax);
  const localIncomeTax = Math.round(calculatedTax * 0.1);
  const totalTax = calculatedTax + localIncomeTax;
  const effectiveRate = capitalGain > 0 ? Number(((totalTax / capitalGain) * 100).toFixed(2)) : 0;
  const netProfit = Math.max(0, capitalGain - totalTax);

  return {
    capitalGain,
    taxableGain,
    specialDeductionRate,
    specialDeductionAmount,
    basicDeduction,
    taxBase,
    baseTaxRate,
    calculatedTax,
    localIncomeTax,
    totalTax,
    effectiveRate,
    netProfit,
    isNonTaxable: false,
  };
}

// ---------------------------------------------------------------------------
// 2. 주택청약 가점 (Housing Subscription Score 84 Pts)
// ---------------------------------------------------------------------------
export interface HousingSubscriptionScoreInput {
  homelessYears: number; // 무주택 기간 (년, 0~15+)
  dependentsCount: number; // 부양가족 수 (명, 본인 제외 0~6+)
  accountYears: number; // 청약통장 가입기간 (년, 0~15+)
}

export interface HousingSubscriptionScoreResult {
  homelessScore: number; // 무주택 기간 점수 (0~32점)
  dependentsScore: number; // 부양가족 수 점수 (5~35점)
  accountScore: number; // 청약통장 가입기간 점수 (1~17점)
  totalScore: number; // 총 가점 (최대 84점)
  gradeEvaluation: string; // 진단 평가 및 당첨 권역 가이드
}

export function calculateHousingSubscriptionScore(
  input: HousingSubscriptionScoreInput,
): HousingSubscriptionScoreResult {
  const { homelessYears, dependentsCount, accountYears } = input;

  // 1. 무주택 기간 (최대 32점)
  let homelessScore = 0;
  if (homelessYears < 1) {
    homelessScore = 2; // 1년 미만은 2점 (유주택자는 0점 처리 가능하나 표준표 1년미만 2점)
  } else if (homelessYears >= 15) {
    homelessScore = 32;
  } else {
    homelessScore = 2 + Math.floor(homelessYears) * 2;
  }

  // 2. 부양가족 수 (최대 35점, 본인 제외 0명부터 기본 5점)
  let dependentsScore = 5;
  if (dependentsCount >= 6) {
    dependentsScore = 35;
  } else {
    dependentsScore = 5 + Math.max(0, Math.floor(dependentsCount)) * 5;
  }

  // 3. 청약통장 가입기간 (최대 17점)
  let accountScore = 1;
  if (accountYears < 0.5) {
    accountScore = 1; // 6개월 미만 1점
  } else if (accountYears < 1) {
    accountScore = 2; // 6개월 이상 1년 미만 2점
  } else if (accountYears >= 15) {
    accountScore = 17;
  } else {
    accountScore = 2 + Math.floor(accountYears);
  }

  const totalScore = homelessScore + dependentsScore + accountScore;

  let gradeEvaluation = "";
  if (totalScore >= 69) {
    gradeEvaluation = "서울 인기 선호단지(강남·마용성) 및 수도권 최상급지 당첨 유력권 (상위 5% 이내)";
  } else if (totalScore >= 58) {
    gradeEvaluation = "서울 일반단지 및 수도권 택지지구(과천·분당·동탄 등) 당첨 안정권";
  } else if (totalScore >= 45) {
    gradeEvaluation = "수도권 비규제 단지 및 경기·인천 역세권 당첨 가능권 (추첨제 병행 추천)";
  } else {
    gradeEvaluation = "추첨제 비율이 높은 전용 85㎡ 초과 평형이나 생애최초·신혼부부 특별공급 공략 권장";
  }

  return {
    homelessScore,
    dependentsScore,
    accountScore,
    totalScore,
    gradeEvaluation,
  };
}

// ---------------------------------------------------------------------------
// 3. 미사용 연차수당 (Unused Annual Leave Pay)
// ---------------------------------------------------------------------------
export interface AnnualLeavePayInput {
  monthlyBaseSalary: number; // 월 통상 기본급 (KRW)
  monthlyFixedAllowance: number; // 월 고정 직책/직무 수당 등 통상임금 포함분 (KRW)
  weeklyHours: number; // 주 소정근로시간 (기본 40시간)
  unusedDays: number; // 미사용 연차 일수 (일)
}

export interface AnnualLeavePayResult {
  monthlyOrdinaryWage: number; // 월 통상임금
  monthlyStandardHours: number; // 월 소정근로시간 (기본 209시간)
  hourlyOrdinaryWage: number; // 시간당 통상임금
  dailyOrdinaryWage: number; // 1일 통상임금 (8시간 기준)
  totalAnnualLeavePay: number; // 총 미사용 연차수당 (세전)
  estimatedTaxAndDeductions: number; // 예상 근로소득세 및 4대보험 공제 (약 10%)
  netAnnualLeavePay: number; // 실수령 예상액
}

export function calculateAnnualLeavePay(input: AnnualLeavePayInput): AnnualLeavePayResult {
  const { monthlyBaseSalary, monthlyFixedAllowance, weeklyHours = 40, unusedDays } = input;

  const monthlyOrdinaryWage = Math.max(0, monthlyBaseSalary + monthlyFixedAllowance);
  // 월 소정근로시간 = (주 소정근로시간 + 주휴시간 8) * (365 / 7 / 12)
  const monthlyStandardHours = weeklyHours === 40 ? 209 : Math.round(((weeklyHours + (weeklyHours / 40) * 8) * 365) / 7 / 12);

  const hourlyOrdinaryWage = monthlyStandardHours > 0 ? Math.round(monthlyOrdinaryWage / monthlyStandardHours) : 0;
  const dailyOrdinaryWage = hourlyOrdinaryWage * 8;
  const totalAnnualLeavePay = Math.round(dailyOrdinaryWage * Math.max(0, unusedDays));

  // 연차수당은 당월 급여에 합산되어 근로소득세가 과세됨 (평균 공제율 약 10% 추산)
  const estimatedTaxAndDeductions = Math.round(totalAnnualLeavePay * 0.098);
  const netAnnualLeavePay = Math.max(0, totalAnnualLeavePay - estimatedTaxAndDeductions);

  return {
    monthlyOrdinaryWage,
    monthlyStandardHours,
    hourlyOrdinaryWage,
    dailyOrdinaryWage,
    totalAnnualLeavePay,
    estimatedTaxAndDeductions,
    netAnnualLeavePay,
  };
}

// ---------------------------------------------------------------------------
// 4. 신용카드 vs 체크카드 소득공제 황금비율 (Card Deduction Optimizer)
// ---------------------------------------------------------------------------
export interface CardDeductionOptimizerInput {
  annualSalary: number; // 연간 총급여액 (KRW)
  creditCardSpend: number; // 신용카드 연간 사용액 (KRW)
  debitCardSpend: number; // 체크카드/현금영수증 사용액 (KRW)
  publicTransitSpend: number; // 대중교통 이용액 (KRW, 40% 공제)
  traditionalMarketSpend: number; // 전통시장 이용액 (KRW, 40% 공제)
}

export interface CardDeductionOptimizerResult {
  thresholdAmount: number; // 총급여 25% 공제 문턱 (KRW)
  totalSpend: number; // 총 카드/현금 지출액
  isThresholdMet: boolean; // 문턱 달성 여부
  creditDeduction: number; // 신용카드 공제액
  debitDeduction: number; // 체크카드 공제액
  extraDeduction: number; // 전통시장/대중교통 추가 공제액
  maxDeductionLimit: number; // 법정 기본 공제한도 (300만 또는 250만 원)
  actualDeductionAmount: number; // 최종 적용 소득공제액
  estimatedTaxRefund: number; // 세율별 예상 절세/환급액 (15% 한계세율 기준)
  optimalAdvice: string; // 황금비율 맞춤 조언
}

export function calculateCardDeductionOptimizer(
  input: CardDeductionOptimizerInput,
): CardDeductionOptimizerResult {
  const {
    annualSalary,
    creditCardSpend,
    debitCardSpend,
    publicTransitSpend,
    traditionalMarketSpend,
  } = input;

  const thresholdAmount = Math.round(annualSalary * 0.25);
  const totalSpend = creditCardSpend + debitCardSpend + publicTransitSpend + traditionalMarketSpend;
  const isThresholdMet = totalSpend >= thresholdAmount;

  let creditDeduction = 0;
  let debitDeduction = 0;
  let extraDeduction = 0;

  if (isThresholdMet) {
    // 25% 문턱은 공제율이 낮은 신용카드부터 우선 차감 충족시키는 것이 세법상/사용자에게 가장 유리
    let remainingThreshold = thresholdAmount;

    // 1) 신용카드로 문턱 채우기
    let effectiveCreditSpend = 0;
    if (creditCardSpend >= remainingThreshold) {
      effectiveCreditSpend = creditCardSpend - remainingThreshold;
      remainingThreshold = 0;
    } else {
      remainingThreshold -= creditCardSpend;
    }

    // 2) 신용카드로 다 못 채운 문턱은 체크카드로 차감
    let effectiveDebitSpend = 0;
    if (debitCardSpend >= remainingThreshold) {
      effectiveDebitSpend = debitCardSpend - remainingThreshold;
      remainingThreshold = 0;
    } else {
      remainingThreshold -= debitCardSpend;
    }

    // 공제 계산
    creditDeduction = Math.round(effectiveCreditSpend * 0.15);
    debitDeduction = Math.round(effectiveDebitSpend * 0.30);
    extraDeduction = Math.round((publicTransitSpend + traditionalMarketSpend) * 0.40);
  }

  // 기본 공제한도: 총급여 7천만 이하 300만 원, 초과 250만 원
  const maxDeductionLimit = annualSalary <= 70_000_000 ? 3_000_000 : 2_500_000;
  const baseDeductions = Math.min(maxDeductionLimit, creditDeduction + debitDeduction);
  // 추가공제한도 (전통시장 100만, 대중교통 100만 한도)
  const cappedExtra = Math.min(2_000_000, extraDeduction);
  const actualDeductionAmount = baseDeductions + cappedExtra;

  // 총급여에 따른 예상 소득세 한계세율 (과표 구간별 평균 15%~24% 가정, 지방세 포함 16.5%)
  const marginalRate = annualSalary <= 50_000_000 ? 0.165 : 0.264;
  const estimatedTaxRefund = Math.round(actualDeductionAmount * marginalRate);

  let optimalAdvice = "";
  if (!isThresholdMet) {
    const shortage = thresholdAmount - totalSpend;
    optimalAdvice = `현재 총 지출이 총급여 25% 문턱에 약 ₩${shortage.toLocaleString()} 미달합니다. 문턱까지는 포인트·할인 혜택이 많은 신용카드를 집중 사용하세요.`;
  } else if (creditCardSpend < thresholdAmount) {
    optimalAdvice = `총급여 25% 문턱을 체크카드로 일부 채웠습니다. 문턱(₩${thresholdAmount.toLocaleString()})까지는 신용카드로 결제해 부가혜택을 챙기고, 초과분부터 체크카드(30%)를 쓰는 것이 황금비율입니다.`;
  } else {
    optimalAdvice = `문턱 달성 후 체크카드 및 현금영수증 공제율(30%)이 신용카드(15%)의 2배입니다. 한도(최대 ₩${maxDeductionLimit.toLocaleString()}) 채울 때까지 체크카드를 적극 사용하세요.`;
  }

  return {
    thresholdAmount,
    totalSpend,
    isThresholdMet,
    creditDeduction,
    debitDeduction,
    extraDeduction,
    maxDeductionLimit,
    actualDeductionAmount,
    estimatedTaxRefund,
    optimalAdvice,
  };
}

// ---------------------------------------------------------------------------
// 5. 상속세 및 증여세 (Inheritance & Gift Tax)
// ---------------------------------------------------------------------------
export interface InheritanceGiftTaxInput {
  mode: "gift" | "inheritance"; // 증여 vs 상속
  assetValue: number; // 재산가액 (KRW)
  debts: number; // 채무액 / 공과금 (KRW)
  relationship: "spouse" | "adultChild" | "minorChild" | "otherRelative" | "nonRelative"; // 수증자와의 관계
  priorGifts10Years: number; // 10년 이내 사전증여 재산가산액 (KRW)
}

export interface InheritanceGiftTaxResult {
  taxableAsset: number; // 순 과세가액 (재산가액 - 채무액 + 사전증여)
  statutoryDeduction: number; // 법정 재산공제액 (배우자, 자녀 등)
  taxBase: number; // 과세표준
  applicableBracketRate: number; // 적용 세율 (10%~50%)
  progressiveDeduction: number; // 누진공제액
  calculatedTax: number; // 산출세액
  voluntaryFilingDiscount: number; // 자진신고 세액공제 (3%)
  finalPayableTax: number; // 최종 납부세액
  effectiveRate: number; // 실효세율 (%)
}

export function calculateInheritanceGiftTax(input: InheritanceGiftTaxInput): InheritanceGiftTaxResult {
  const { mode, assetValue, debts, relationship, priorGifts10Years } = input;

  const netAsset = Math.max(0, assetValue - debts);
  const taxableAsset = netAsset + priorGifts10Years;

  // 법정 공제액 산출
  let statutoryDeduction = 0;
  if (mode === "gift") {
    switch (relationship) {
      case "spouse":
        statutoryDeduction = 600_000_000; // 6억 원
        break;
      case "adultChild":
        statutoryDeduction = 50_000_000; // 5천만 원
        break;
      case "minorChild":
        statutoryDeduction = 20_000_000; // 2천만 원
        break;
      case "otherRelative":
        statutoryDeduction = 10_000_000; // 1천만 원
        break;
      default:
        statutoryDeduction = 0;
    }
  } else {
    // 상속세: 일괄공제 5억 원 + 배우자 상속공제 최소 5억 원 (기본 10억 공제 기준)
    statutoryDeduction = relationship === "spouse" ? 1_000_000_000 : 500_000_000;
  }

  const taxBase = Math.max(0, taxableAsset - statutoryDeduction);

  // 5단계 누진세율표 (상속세 및 증여세법 제26조)
  let applicableBracketRate = 10;
  let progressiveDeduction = 0;

  if (taxBase <= 100_000_000) {
    applicableBracketRate = 10;
    progressiveDeduction = 0;
  } else if (taxBase <= 500_000_000) {
    applicableBracketRate = 20;
    progressiveDeduction = 10_000_000;
  } else if (taxBase <= 1_000_000_000) {
    applicableBracketRate = 30;
    progressiveDeduction = 60_000_000;
  } else if (taxBase <= 3_000_000_000) {
    applicableBracketRate = 40;
    progressiveDeduction = 160_000_000;
  } else {
    applicableBracketRate = 50;
    progressiveDeduction = 460_000_000;
  }

  const calculatedTax = Math.max(
    0,
    Math.round(taxBase * (applicableBracketRate / 100) - progressiveDeduction),
  );

  // 기한 내 자진신고 세액공제 (3%)
  const voluntaryFilingDiscount = Math.round(calculatedTax * 0.03);
  const finalPayableTax = Math.max(0, calculatedTax - voluntaryFilingDiscount);
  const effectiveRate =
    taxableAsset > 0 ? Number(((finalPayableTax / taxableAsset) * 100).toFixed(2)) : 0;

  return {
    taxableAsset,
    statutoryDeduction,
    taxBase,
    applicableBracketRate,
    progressiveDeduction,
    calculatedTax,
    voluntaryFilingDiscount,
    finalPayableTax,
    effectiveRate,
  };
}

// ---------------------------------------------------------------------------
// 6. 육아휴직 급여 (Parental Leave Pay 2026 Revised)
// ---------------------------------------------------------------------------
export interface ParentalLeavePayInput {
  ordinaryMonthlyWage: number; // 통상임금 (월급, KRW)
  durationMonths: number; // 휴직 개월 수 (1~12)
  isBothParentsLeave: boolean; // 6+6 부모육아휴직제 적용 여부
}

export interface MonthPayDetail {
  month: number;
  ratePercent: number;
  monthlyCap: number;
  paidAmount: number;
}

export interface ParentalLeavePayResult {
  totalPaidAmount: number; // 총 지급액
  averageMonthlyPay: number; // 월평균 수령액
  monthlyBreakdown: MonthPayDetail[]; // 월별 상세 내역
  capBenefitGain: number; // 개정 전(150만 원 한도) 대비 증액된 수혜금액
}

export function calculateParentalLeavePay(input: ParentalLeavePayInput): ParentalLeavePayResult {
  const { ordinaryMonthlyWage, durationMonths, isBothParentsLeave } = input;
  const months = Math.min(12, Math.max(1, Math.floor(durationMonths)));
  const monthlyBreakdown: MonthPayDetail[] = [];

  let totalPaidAmount = 0;
  let oldTotalCap = 0;

  // 2026년 고용노동부 개정 기준:
  // 1~3개월: 통상임금 100% (상한 250만 원, 하한 70만 원)
  // 4~6개월: 통상임금 100% (상한 200만 원, 하한 70만 원)
  // 7~12개월: 통상임금 80% (상한 160만 원, 하한 70만 원)
  // 6+6 부모휴직의 경우 첫 6개월간 매월 상한액이 200만~450만원까지 차등 상향 지원
  for (let m = 1; m <= months; m++) {
    let ratePercent = 100;
    let monthlyCap = 2_500_000;
    const monthlyFloor = 700_000;

    if (isBothParentsLeave && m <= 6) {
      // 6+6 부모육아휴직제 특례: 1개월차 200만 ~ 6개월차 450만 원 상한
      ratePercent = 100;
      monthlyCap = 2_000_000 + (m - 1) * 500_000;
    } else {
      if (m <= 3) {
        ratePercent = 100;
        monthlyCap = 2_500_000;
      } else if (m <= 6) {
        ratePercent = 100;
        monthlyCap = 2_000_000;
      } else {
        ratePercent = 80;
        monthlyCap = 1_600_000;
      }
    }

    const calculated = Math.round(ordinaryMonthlyWage * (ratePercent / 100));
    const paidAmount = Math.min(monthlyCap, Math.max(monthlyFloor, calculated));

    // 구 기준(월 상한 150만 원 일괄 적용)
    const oldPaid = Math.min(1_500_000, Math.max(700_000, Math.round(ordinaryMonthlyWage * 0.8)));
    oldTotalCap += oldPaid;

    totalPaidAmount += paidAmount;
    monthlyBreakdown.push({
      month: m,
      ratePercent,
      monthlyCap,
      paidAmount,
    });
  }

  const averageMonthlyPay = Math.round(totalPaidAmount / months);
  const capBenefitGain = Math.max(0, totalPaidAmount - oldTotalCap);

  return {
    totalPaidAmount,
    averageMonthlyPay,
    monthlyBreakdown,
    capBenefitGain,
  };
}

// ---------------------------------------------------------------------------
// 7. 대출 중도상환수수료 및 대환대출 손익분기 (Loan Prepayment Penalty)
// ---------------------------------------------------------------------------
export interface LoanPrepaymentPenaltyInput {
  prepaymentAmount: number; // 중도상환 원금 (KRW)
  feeRatePercent: number; // 수수료율 (%, 주담대 1.2%~1.4%, 신용 0.5%~1.0%)
  loanTermDays: number; // 총 약정 기간 일수 (보통 3년=1,095일 기준 상환)
  elapsedDays: number; // 대출 실행 후 경과 일수
  currentInterestRate: number; // 현재 대출 금리 (%)
  newInterestRate: number; // 갈아타려는 신규 대출 금리 (%)
}

export interface LoanPrepaymentPenaltyResult {
  prepaymentPenalty: number; // 실제 부과되는 중도상환수수료 (KRW)
  statutoryMaxDays: number; // 법정 수수료 면제 시점 (1,095일 / 3년)
  remainingPenaltyDays: number; // 수수료 소멸까지 남은 일수
  monthlyInterestSavings: number; // 대환 시 매월 아끼는 이자 금액 (KRW)
  breakEvenMonths: number; // 수수료를 뽑는 손익분기 개월 수
  isWorthRefinancing: boolean; // 갈아타기 추천 여부
}

export function calculateLoanPrepaymentPenalty(
  input: LoanPrepaymentPenaltyInput,
): LoanPrepaymentPenaltyResult {
  const {
    prepaymentAmount,
    feeRatePercent,
    loanTermDays = 1095,
    elapsedDays,
    currentInterestRate,
    newInterestRate,
  } = input;

  const statutoryMaxDays = 1095; // 3년
  const effectiveTerm = Math.min(statutoryMaxDays, loanTermDays);

  let prepaymentPenalty = 0;
  let remainingPenaltyDays = 0;

  if (elapsedDays < effectiveTerm) {
    remainingPenaltyDays = effectiveTerm - elapsedDays;
    const slidingRatio = remainingPenaltyDays / effectiveTerm;
    prepaymentPenalty = Math.round(prepaymentAmount * (feeRatePercent / 100) * slidingRatio);
  } else {
    prepaymentPenalty = 0;
    remainingPenaltyDays = 0;
  }

  // 대환 시 월 이자 절감액 = 원금 * (현재금리 - 신규금리) / 12
  const interestDiff = Math.max(0, currentInterestRate - newInterestRate);
  const monthlyInterestSavings = Math.round((prepaymentAmount * (interestDiff / 100)) / 12);

  const breakEvenMonths =
    monthlyInterestSavings > 0 ? Number((prepaymentPenalty / monthlyInterestSavings).toFixed(1)) : 0;

  const isWorthRefinancing =
    interestDiff > 0 && (prepaymentPenalty === 0 || breakEvenMonths <= 12);

  return {
    prepaymentPenalty,
    statutoryMaxDays,
    remainingPenaltyDays,
    monthlyInterestSavings,
    breakEvenMonths,
    isWorthRefinancing,
  };
}

// ---------------------------------------------------------------------------
// 8. 건강보험 피부양자 자격 및 지역보험료 (Health Insurance Dependent Eligibility)
// ---------------------------------------------------------------------------
export interface HealthInsuranceDependentInput {
  financialIncome: number; // 연간 금융소득 (이자·배당, KRW)
  otherIncome: number; // 연간 사업/연금/근로소득 (KRW)
  propertyTaxBase: number; // 보유 부동산 재산세 과세표준 (KRW)
  hasBusinessRegistration: boolean; // 사업자등록증 보유 여부
  businessIncomeAmount: number; // 사업소득금액 (KRW)
}

export interface HealthInsuranceDependentResult {
  isEligible: boolean; // 피부양자 자격 유지 여부
  disqualificationReason: string; // 탈락 사유
  estimatedRegionalMonthlyPremium: number; // 탈락 시 부과되는 예상 월 지역건보료
  totalAnnualIncome: number; // 총 연간 합산소득
}

export function calculateHealthInsuranceDependent(
  input: HealthInsuranceDependentInput,
): HealthInsuranceDependentResult {
  const {
    financialIncome,
    otherIncome,
    propertyTaxBase,
    hasBusinessRegistration,
    businessIncomeAmount,
  } = input;

  const totalAnnualIncome = financialIncome + otherIncome + businessIncomeAmount;
  let isEligible = true;
  let disqualificationReason = "피부양자 자격 유지 요건을 모두 충족합니다.";

  // 탈락 기준 체크 (국민건강보험법 시행규칙 제2조)
  if (hasBusinessRegistration && businessIncomeAmount > 0) {
    isEligible = false;
    disqualificationReason = "사업자등록이 있는 상태에서 사업소득이 1원 이상 발생하여 피부양자에서 제외됩니다.";
  } else if (!hasBusinessRegistration && businessIncomeAmount > 5_000_000) {
    isEligible = false;
    disqualificationReason = "사업자등록이 없는 프리랜서 사업소득이 연 500만 원을 초과하여 제외됩니다.";
  } else if (totalAnnualIncome > 20_000_000) {
    isEligible = false;
    disqualificationReason = `연간 합산소득(₩${(totalAnnualIncome / 10_000).toLocaleString()}만 원)이 기준선인 2,000만 원을 초과하여 피부양자에서 탈락합니다.`;
  } else if (propertyTaxBase > 900_000_000) {
    isEligible = false;
    disqualificationReason = `재산세 과세표준(₩${(propertyTaxBase / 100_000_000).toFixed(1)}억 원)이 9억 원을 초과하여 피부양자에서 탈락합니다.`;
  } else if (propertyTaxBase > 540_000_000 && totalAnnualIncome > 10_000_000) {
    isEligible = false;
    disqualificationReason = `재산세 과표가 5.4억 원을 초과하고 연소득이 1,000만 원을 초과하여 피부양자에서 탈락합니다.`;
  }

  // 탈락 시 예상 월 지역보험료 모의계산 (소득 부과 + 재산 부과)
  let estimatedRegionalMonthlyPremium = 0;
  if (!isEligible) {
    // 소득 점수 추산 (연소득 약 7.09% 부과 + 재산점수 약 208.4원/점)
    const incomeMonthlyPart = Math.round((totalAnnualIncome * 0.0709) / 12);
    // 재산 과표 5.4억 기준 약 500점 (약 10만 원)
    const propertyMonthlyPart = Math.min(250_000, Math.round((propertyTaxBase / 100_000_000) * 20_000));
    const baseRegional = Math.max(25_000, incomeMonthlyPart + propertyMonthlyPart);
    const longTermCare = Math.round(baseRegional * 0.1295); // 장기요양보험 12.95%
    estimatedRegionalMonthlyPremium = baseRegional + longTermCare;
  }

  return {
    isEligible,
    disqualificationReason,
    estimatedRegionalMonthlyPremium,
    totalAnnualIncome,
  };
}

// ---------------------------------------------------------------------------
// 9. 전기요금 누진세 (Electricity Bill Progressive Tariff)
// ---------------------------------------------------------------------------
export interface ElectricityBillInput {
  voltageType: "low" | "high"; // 주택용 저압(단독/빌라) vs 고압(아파트)
  season: "summer" | "other"; // 하계(7~8월) vs 기타계절
  kwhUsage: number; // 월간 전력 사용량 (kWh)
}

export interface ElectricityBillResult {
  baseFee: number; // 기본요금 (KRW)
  energyFee: number; // 전력량요금 (KRW)
  climateFee: number; // 기후환경요금 (KRW, kWh당 9원)
  fuelAdjustmentFee: number; // 연료비조정요금 (KRW, kWh당 5원)
  subtotal: number; // 전기요금계
  vat: number; // 부가가치세 (10%)
  fund: number; // 전력산업기반기금 (3.7%, 10원 미만 절사)
  totalBill: number; // 최종 청구금액
  tierReached: number; // 도달한 누진 단계 (1, 2, 3단계)
}

export function calculateElectricityBill(input: ElectricityBillInput): ElectricityBillResult {
  const { voltageType, season, kwhUsage } = input;
  const kwh = Math.max(0, kwhUsage);

  // 한국전력공사 주택용 전기요금표 (저압 vs 고압)
  // 하계(7~8월): 1구간 300kWh 이하, 2구간 301~450kWh, 3구간 450kWh 초과
  // 기타계절: 1구간 200kWh 이하, 2구간 201~400kWh, 3구간 400kWh 초과
  const isSummer = season === "summer";
  const tier1Limit = isSummer ? 300 : 200;
  const tier2Limit = isSummer ? 450 : 400;

  // 요율표
  const baseFees =
    voltageType === "low"
      ? { t1: 910, t2: 1600, t3: 7300 }
      : { t1: 730, t2: 1260, t3: 6060 };

  const unitRates =
    voltageType === "low"
      ? { t1: 120.0, t2: 214.6, t3: 307.3 }
      : { t1: 105.0, t2: 174.0, t3: 242.3 };

  let baseFee = baseFees.t1;
  let energyFee = 0;
  let tierReached = 1;

  if (kwh <= tier1Limit) {
    baseFee = baseFees.t1;
    energyFee = kwh * unitRates.t1;
    tierReached = 1;
  } else if (kwh <= tier2Limit) {
    baseFee = baseFees.t2;
    energyFee = tier1Limit * unitRates.t1 + (kwh - tier1Limit) * unitRates.t2;
    tierReached = 2;
  } else {
    baseFee = baseFees.t3;
    energyFee =
      tier1Limit * unitRates.t1 +
      (tier2Limit - tier1Limit) * unitRates.t2 +
      (kwh - tier2Limit) * unitRates.t3;
    tierReached = 3;
  }

  energyFee = Math.round(energyFee);
  const climateFee = Math.round(kwh * 9); // 기후환경요금: kWh당 9.0원
  const fuelAdjustmentFee = Math.round(kwh * 5); // 연료비조정액: kWh당 +5원
  const subtotal = baseFee + energyFee + climateFee + fuelAdjustmentFee;

  const vat = Math.round(subtotal * 0.1);
  const fund = Math.floor((subtotal * 0.037) / 10) * 10; // 전력산업기반기금 3.7% (10원 미만 절사)
  const totalBill = Math.floor((subtotal + vat + fund) / 10) * 10; // 10원 미만 절사

  return {
    baseFee,
    energyFee,
    climateFee,
    fuelAdjustmentFee,
    subtotal,
    vat,
    fund,
    totalBill,
    tierReached,
  };
}

// ---------------------------------------------------------------------------
// 10. 디딤돌·버팀목 대출 (Policy Housing Loan)
// ---------------------------------------------------------------------------
export interface PolicyHousingLoanInput {
  loanType: "didimdol" | "beotimmok"; // 디딤돌(구입) vs 버팀목(전세)
  householdType: "general" | "newlywed" | "youth"; // 가구 형태
  annualIncome: number; // 부부합산 연소득 (KRW)
  housePriceOrDeposit: number; // 매매가 또는 전세보증금 (KRW)
  requestedLoanAmount: number; // 희망 대출 신청액 (KRW)
  loanTermYears: number; // 대출 만기 (년: 10, 15, 20, 30)
}

export interface PolicyHousingLoanResult {
  maxEligibleLimit: number; // 정책상 최대 대출 한도 (KRW)
  approvedLoanAmount: number; // 최종 승인 가능 대출액
  appliedInterestRate: number; // 적용 정책 우대금리 (%)
  monthlyPayment: number; // 월 원리금 균등 상환액 (KRW)
  commercialBankMonthlyPayment: number; // 시중은행(4.5% 가정) 대비 월 상환액
  monthlyInterestSavings: number; // 매달 절감되는 이자 혜택
  isEligible: boolean; // 소득 및 조건 충족 여부
  ineligibilityReason?: string;
}

export function calculatePolicyHousingLoan(input: PolicyHousingLoanInput): PolicyHousingLoanResult {
  const {
    loanType,
    householdType,
    annualIncome,
    housePriceOrDeposit,
    requestedLoanAmount,
    loanTermYears = 20,
  } = input;

  let maxEligibleLimit = 250_000_000;
  let appliedInterestRate = 2.7;
  let isEligible = true;
  let ineligibilityReason = "";

  if (loanType === "didimdol") {
    // 디딤돌 구입자금 대출
    const incomeLimit = householdType === "newlywed" ? 85_000_000 : 60_000_000;
    if (annualIncome > incomeLimit) {
      isEligible = false;
      ineligibilityReason = `소득 기준(연 ₩${(incomeLimit / 10_000).toLocaleString()}만 원)을 초과했습니다.`;
    }
    if (housePriceOrDeposit > 500_000_000 && householdType !== "newlywed") {
      isEligible = false;
      ineligibilityReason = "디딤돌 주택 매매가격 상한 5억 원을 초과했습니다.";
    }

    // 한도 설정
    if (householdType === "newlywed") {
      maxEligibleLimit = 400_000_000;
      appliedInterestRate = annualIncome <= 50_000_000 ? 2.45 : 2.85;
    } else if (householdType === "youth") {
      maxEligibleLimit = 300_000_000;
      appliedInterestRate = 2.65;
    } else {
      maxEligibleLimit = 250_000_000;
      appliedInterestRate = annualIncome <= 40_000_000 ? 2.70 : 3.15;
    }

    // LTV 최대 70% (생애최초 80%)
    const ltvCap = Math.round(housePriceOrDeposit * 0.7);
    maxEligibleLimit = Math.min(maxEligibleLimit, ltvCap);
  } else {
    // 버팀목 전세자금 대출
    const incomeLimit = householdType === "newlywed" ? 75_000_000 : 50_000_000;
    if (annualIncome > incomeLimit) {
      isEligible = false;
      ineligibilityReason = `소득 기준(연 ₩${(incomeLimit / 10_000).toLocaleString()}만 원)을 초과했습니다.`;
    }

    if (householdType === "newlywed") {
      maxEligibleLimit = 300_000_000;
      appliedInterestRate = annualIncome <= 40_000_000 ? 2.1 : 2.7;
    } else if (householdType === "youth") {
      maxEligibleLimit = 200_000_000;
      appliedInterestRate = 2.1;
    } else {
      maxEligibleLimit = 120_000_000;
      appliedInterestRate = 2.4;
    }

    // 전세보증금의 최대 80%
    const depositCap = Math.round(housePriceOrDeposit * 0.8);
    maxEligibleLimit = Math.min(maxEligibleLimit, depositCap);
  }

  const approvedLoanAmount = Math.min(requestedLoanAmount, maxEligibleLimit);

  // 월 원리금 균등 상환 계산
  const n = loanTermYears * 12;
  const r = appliedInterestRate / 100 / 12;
  const monthlyPayment =
    approvedLoanAmount > 0 && r > 0
      ? Math.round((approvedLoanAmount * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1))
      : 0;

  // 시중은행(4.5% 기준) 비교
  const rBank = 0.045 / 12;
  const commercialBankMonthlyPayment =
    approvedLoanAmount > 0 && rBank > 0
      ? Math.round((approvedLoanAmount * (rBank * Math.pow(1 + rBank, n))) / (Math.pow(1 + rBank, n) - 1))
      : 0;

  const monthlyInterestSavings = Math.max(0, commercialBankMonthlyPayment - monthlyPayment);

  return {
    maxEligibleLimit,
    approvedLoanAmount,
    appliedInterestRate,
    monthlyPayment,
    commercialBankMonthlyPayment,
    monthlyInterestSavings,
    isEligible,
    ineligibilityReason: isEligible ? undefined : ineligibilityReason,
  };
}
