import { describe, expect, it } from "vitest";
import {
  calculateDeposit,
  calculateSavings,
  calculateParkingAccount,
  calculateWindmillSavings,
  calculateYouthLeap,
  calculateAverageDown,
  calculateCompoundInvestment,
  calculateOverseasStockTax,
  calculateDividendTax,
  calculateCryptoProfit,
  calculateIsaSavings,
  calculatePensionIrpTaxCredit,
  calculateNationalPension,
  calculateYearEndTax,
  calculateCarTax,
} from "../src/engines/korea-finance";

describe("Korean Finance Engines", () => {
  it("1. calculateDeposit handles simple and compound interest with 15.4% tax", () => {
    // 10,000,000원, 12개월, 4.0%, 단리, 일반과세(15.4%)
    const res = calculateDeposit({
      principal: 10_000_000,
      periodMonths: 12,
      annualRate: 4.0,
      taxType: "normal",
      interestType: "simple",
    });
    expect(res.principal).toBe(10_000_000);
    expect(res.preTaxInterest).toBe(400_000);
    // 400,000 * 0.14 = 56,000 (소득세), 400,000 * 0.014 = 5,600 (지방소득세), 총 61,600
    expect(res.incomeTax).toBe(56_000);
    expect(res.localTax).toBe(5_600);
    expect(res.totalTax).toBe(61_600);
    expect(res.postTaxInterest).toBe(338_400);
    expect(res.totalReturn).toBe(10_338_400);
    expect(res.comparisons).toHaveLength(3);
  });

  it("2. calculateSavings computes installment savings correctly", () => {
    // 500,000원 x 12개월, 4.0%, 정액적립식 단리, 일반과세
    const res = calculateSavings({
      monthlyDeposit: 500_000,
      periodMonths: 12,
      annualRate: 4.0,
      taxType: "normal",
      savingsMethod: "fixed",
    });
    expect(res.totalPrincipal).toBe(6_000_000);
    // 500,000 * (0.04 / 12) * (12 * 13 / 2) = 130,000
    expect(res.preTaxInterest).toBe(130_000);
    // 130,000 * 0.154 = 20,020
    expect(res.totalTax).toBe(20_020);
    expect(res.postTaxInterest).toBe(109_980);
    expect(res.totalReturn).toBe(6_109_980);
    expect(res.schedule.length).toBeGreaterThan(0);
  });

  it("3. calculateParkingAccount calculates daily compound/simple interest", () => {
    // 20,000,000원, 3.5%, 30일, 일복리, 일반과세
    const res = calculateParkingAccount({
      balance: 20_000_000,
      annualRate: 3.5,
      days: 30,
      compoundDaily: true,
      taxType: "normal",
    });
    expect(res.balance).toBe(20_000_000);
    expect(res.preTaxInterest).toBeGreaterThan(57_000);
    expect(res.totalTax).toBeGreaterThan(0);
    expect(res.postTaxInterest).toBe(res.preTaxInterest - res.totalTax);
    expect(res.tiers).toHaveLength(5);
  });

  it("4. calculateWindmillSavings simulates 12-month savings windmill", () => {
    // 매월 100,000원 신규 가입, 4.0%, 일반과세
    const res = calculateWindmillSavings({
      unitMonthlyDeposit: 100_000,
      annualRate: 4.0,
      taxType: "normal",
    });
    expect(res.maxMonthlyDeposit).toBe(1_200_000); // 12개월차 월 120만원 납입
    expect(res.totalFirstYearPrincipal).toBe(7_800_000); // 10만 * 78
    expect(res.monthlyMaturityPayout).toBeGreaterThan(1_200_000);
    expect(res.timeline).toHaveLength(24);
  });

  it("5. calculateYouthLeap computes youth leap government match and tax exemption", () => {
    // 700,000원, 2400만 이하 소득구간 (최대 24,000원 기여금), 6.0% 금리
    const res = calculateYouthLeap({
      monthlyDeposit: 700_000,
      incomeBracket: "under24m",
      annualRate: 6.0,
    });
    expect(res.totalDeposit).toBe(42_000_000);
    expect(res.monthlyGovMatch).toBe(24_000);
    expect(res.totalGovMatch).toBe(24_000 * 60); // 1,440,000
    expect(res.taxExemptInterest).toBeGreaterThan(6_000_000);
    expect(res.totalReturn).toBeGreaterThan(49_000_000); // 목돈 약 5,000만원 형성
    expect(res.benefitDiff).toBeGreaterThan(2_000_000);
  });

  it("6. calculateAverageDown calculates new average price and target stock count", () => {
    // 1차: 10,000원 100주, 2차: 5,000원 100주
    const res = calculateAverageDown({
      currentPrice: 10_000,
      currentQuantity: 100,
      additionalPrice: 5_000,
      additionalQuantity: 100,
      targetAveragePrice: 6_000,
    });
    expect(res.currentInvestment).toBe(1_000_000);
    expect(res.additionalInvestment).toBe(500_000);
    expect(res.totalQuantity).toBe(200);
    expect(res.finalAveragePrice).toBe(7_500); // (100만 + 50만) / 200 = 7,500원
    expect(res.priceReduction).toBe(2_500);
    expect(res.priceReductionPercent).toBe(25);
    // 목표 6,000원 도달 위해: (1,000,000 + 5000*X)/(100+X) = 6000 => 400,000 = 1000*X => X = 400주
    expect(res.targetRequiredQuantity).toBe(400);
  });

  it("7. calculateCompoundInvestment calculates multi-year compounding and tax", () => {
    const res = calculateCompoundInvestment({
      initialInvestment: 10_000_000,
      monthlyContribution: 500_000,
      annualReturn: 8.0,
      years: 5,
      taxType: "normal",
    });
    expect(res.totalPrincipal).toBe(10_000_000 + 500_000 * 60); // 40,000_000
    expect(res.finalBalance).toBeGreaterThan(45_000_000);
    expect(res.annualHistory).toHaveLength(5);
  });

  it("8. calculateOverseasStockTax handles 2.5m basic deduction and 22% tax", () => {
    // 차익 10,000,000원, 손실 1,000,000원, 수수료 50,000원
    const res = calculateOverseasStockTax({
      realizedGain: 10_000_000,
      realizedLoss: 1_000_000,
      expenses: 50_000,
    });
    expect(res.netProfit).toBe(8_950_000);
    expect(res.basicDeductionApplied).toBe(2_500_000);
    expect(res.taxableBase).toBe(6_450_000);
    // 6,450,000 * 0.2 = 1,290,000 (국세), 지방세 129,000, 총 1,419,000 (22%)
    expect(res.capitalGainsTax).toBe(1_290_000);
    expect(res.localIncomeTax).toBe(129_000);
    expect(res.totalTax).toBe(1_419_000);
    expect(res.afterTaxProfit).toBe(8_950_000 - 1_419_000);
  });

  it("9. calculateDividendTax calculates 15% US withholding and 20m warning", () => {
    const res = calculateDividendTax({
      shares: 100,
      dividendPerShareUSD: 5.0, // 총 500 USD
      frequency: 4, // 분기배당 -> 연간 2,000 USD
      usdKrwRate: 1_350,
    });
    expect(res.preTaxUsd).toBe(500);
    expect(res.taxUsd).toBe(75); // 15%
    expect(res.postTaxUsd).toBe(425);
    expect(res.preTaxKrw).toBe(675_000);
    expect(res.annualPreTaxKrw).toBe(2_700_000);
    expect(res.isFinancialIncomeTaxRisk).toBe(false);
  });

  it("10. calculateCryptoProfit computes buy/sell fees, ROI and break-even", () => {
    // 50,000,000원에 0.1개 매수(500만원), 60,000,000원에 매도(600만원), 수수료 0.05%
    const res = calculateCryptoProfit({
      buyPrice: 50_000_000,
      quantity: 0.1,
      sellPrice: 60_000_000,
      exchangeFeeRate: 0.05,
    });
    expect(res.buyTotal).toBe(5_000_000);
    expect(res.buyFee).toBe(2_500);
    expect(res.sellTotal).toBe(6_000_000);
    expect(res.sellFee).toBe(3_000);
    expect(res.totalFees).toBe(5_500);
    expect(res.netProfit).toBe(6_000_000 - 3_000 - 5_002_500);
    expect(res.breakEvenSellPrice).toBeGreaterThan(50_000_000);
  });

  it("11. calculateIsaSavings calculates 200m/400m tax exemption and 9.9% separate tax", () => {
    // 5,000,000원 순수익, 일반형(200만원 비과세)
    const res = calculateIsaSavings({
      netProfit: 5_000_000,
      accountType: "general",
    });
    expect(res.exemptionLimit).toBe(2_000_000);
    expect(res.taxExemptProfit).toBe(2_000_000);
    expect(res.taxableExcess).toBe(3_000_000);
    // 3,000,000 * 9.9% = 297,000원
    expect(res.isaTax).toBe(297_000);
    // 일반 계좌 5,000,000 * 15.4% = 770,000원
    expect(res.regularTax).toBe(770_000);
    expect(res.taxSaved).toBe(770_000 - 297_000);
  });

  it("12. calculatePensionIrpTaxCredit calculates 16.5% vs 13.2% tax refunds up to 9m", () => {
    // 5,000만원 연봉 (16.5%), 연금저축 600만 + IRP 300만 = 900만 풀 납입
    const res = calculatePensionIrpTaxCredit({
      grossSalary: 50_000_000,
      pensionSavingsDeposit: 6_000_000,
      irpDeposit: 3_000_000,
    });
    expect(res.totalEligible).toBe(9_000_000);
    expect(res.creditRate).toBe(16.5);
    // 9,000,000 * 16.5% = 1,485,000원 환급
    expect(res.taxRefund).toBe(1_485_000);
    expect(res.netContribution).toBe(9_000_000 - 1_485_000);
  });

  it("13. calculateNationalPension estimates pension based on income and duration", () => {
    // 월 소득 3,500,000원, 25년 납부
    const res = calculateNationalPension({
      monthlyIncome: 3_500_000,
      yearsEnrolled: 25,
      isEmployee: true,
    });
    expect(res.monthlyPremium).toBe(157_500); // 350만 * 4.5%
    expect(res.totalPremiumsPaid).toBe(157_500 * 25 * 12);
    expect(res.estimatedMonthlyPension).toBeGreaterThan(600_000);
    expect(res.breakEvenMonths).toBeGreaterThan(0);
    expect(res.yearsSchedule).toHaveLength(7);
  });

  it("14. calculateYearEndTax computes card deductions beyond 25% threshold", () => {
    // 총급여 50,000,000원, 문턱 = 12,500,000원
    // 신용카드 15,000,000원, 체크카드 5,000,000원
    const res = calculateYearEndTax({
      annualGrossSalary: 50_000_000,
      creditCard: 15_000_000,
      debitCard: 5_000_000,
    });
    expect(res.minimumThreshold).toBe(12_500_000);
    expect(res.totalUsage).toBe(20_000_000);
    expect(res.excessUsage).toBe(7_500_000);
    expect(res.totalDeduction).toBeGreaterThan(0);
    expect(res.estimatedTaxSaved).toBeGreaterThan(0);
  });

  it("15. calculateCarTax computes engine displacement tax, aging discount & prepayment", () => {
    // 1998cc, 3년차 (5% 할인), 1월 연납 (5% 할인), 차량가액 30,000,000원
    const res = calculateCarTax({
      displacementCc: 1998,
      carAgeYears: 3,
      prepayMonth: 1,
      vehiclePrice: 30_000_000,
    });
    expect(res.baseAnnualTax).toBe(1998 * 200); // 399,600
    expect(res.ageDiscountRate).toBe(5);
    expect(res.prepayDiscountRate).toBe(5);
    expect(res.prepayDiscountAmount).toBeGreaterThan(0);
    expect(res.registrationTax).toBe(2_100_000); // 30,000,000 * 7%
    expect(res.prepayComparison).toHaveLength(5);
  });
});
