import { describe, it, expect } from "vitest";
import {
  calculateCapitalGainsTax,
  calculateHousingSubscriptionScore,
  calculateAnnualLeavePay,
  calculateCardDeductionOptimizer,
  calculateInheritanceGiftTax,
  calculateParentalLeavePay,
  calculateLoanPrepaymentPenalty,
  calculateHealthInsuranceDependent,
  calculateElectricityBill,
  calculatePolicyHousingLoan,
} from "../src/engines/korea-extended";

describe("Korea Extended Calculation Engine", () => {
  it("calculates real estate capital gains tax accurately (1-house non-taxable threshold & taxable)", () => {
    // 1-houseowner under 12억 non-taxable
    const nonTaxable = calculateCapitalGainsTax({
      salePrice: 1_100_000_000,
      purchasePrice: 600_000_000,
      expenses: 20_000_000,
      holdingYears: 5,
      residencyYears: 3,
      isOneHomeowner: true,
      isRegulatedArea: false,
      multiHomeCount: 1,
    });
    expect(nonTaxable.isNonTaxable).toBe(true);
    expect(nonTaxable.totalTax).toBe(0);

    // 1-houseowner over 12억 with special deduction
    const taxableHighEnd = calculateCapitalGainsTax({
      salePrice: 1_600_000_000,
      purchasePrice: 800_000_000,
      expenses: 30_000_000,
      holdingYears: 10,
      residencyYears: 10,
      isOneHomeowner: true,
      isRegulatedArea: false,
      multiHomeCount: 1,
    });
    expect(taxableHighEnd.isNonTaxable).toBe(false);
    expect(taxableHighEnd.capitalGain).toBe(770_000_000);
    expect(taxableHighEnd.specialDeductionRate).toBe(80); // 40% hold + 40% reside
    expect(taxableHighEnd.totalTax).toBeGreaterThan(0);
    expect(taxableHighEnd.netProfit).toBeGreaterThan(0);
  });

  it("calculates housing subscription score out of 84 points", () => {
    // Max score test: 15y homeless (32), 6 dependents (35), 15y account (17) = 84
    const maxScore = calculateHousingSubscriptionScore({
      homelessYears: 16,
      dependentsCount: 6,
      accountYears: 16,
    });
    expect(maxScore.homelessScore).toBe(32);
    expect(maxScore.dependentsScore).toBe(35);
    expect(maxScore.accountScore).toBe(17);
    expect(maxScore.totalScore).toBe(84);

    // Young single person: 2y homeless (6), 0 dependents (5), 3y account (5) = 16
    const single = calculateHousingSubscriptionScore({
      homelessYears: 2,
      dependentsCount: 0,
      accountYears: 3,
    });
    expect(single.homelessScore).toBe(6);
    expect(single.dependentsScore).toBe(5);
    expect(single.accountScore).toBe(5);
    expect(single.totalScore).toBe(16);
  });

  it("calculates annual leave pay based on 209-hour standard", () => {
    const res = calculateAnnualLeavePay({
      monthlyBaseSalary: 3_500_000,
      monthlyFixedAllowance: 200_000,
      weeklyHours: 40,
      unusedDays: 5,
    });
    expect(res.monthlyOrdinaryWage).toBe(3_700_000);
    expect(res.monthlyStandardHours).toBe(209);
    expect(res.hourlyOrdinaryWage).toBe(17703);
    expect(res.dailyOrdinaryWage).toBe(141624);
    expect(res.totalAnnualLeavePay).toBe(708120);
    expect(res.netAnnualLeavePay).toBeGreaterThan(0);
  });

  it("optimizes credit vs debit card deduction ratio", () => {
    const res = calculateCardDeductionOptimizer({
      annualSalary: 50_000_000,
      creditCardSpend: 15_000_000,
      debitCardSpend: 10_000_000,
      publicTransitSpend: 1_000_000,
      traditionalMarketSpend: 500_000,
    });
    expect(res.thresholdAmount).toBe(12_500_000); // 25% of 50M
    expect(res.isThresholdMet).toBe(true);
    expect(res.creditDeduction).toBeGreaterThan(0);
    expect(res.actualDeductionAmount).toBeGreaterThan(0);
    expect(res.actualDeductionAmount).toBeLessThanOrEqual(5_000_000);
  });

  it("calculates gift tax and inheritance tax brackets", () => {
    // Gift to adult child with 50M exemption
    const giftChild = calculateInheritanceGiftTax({
      mode: "gift",
      assetValue: 150_000_000,
      debts: 0,
      relationship: "adultChild",
      priorGifts10Years: 0,
    });
    expect(giftChild.statutoryDeduction).toBe(50_000_000);
    expect(giftChild.taxBase).toBe(100_000_000);
    expect(giftChild.calculatedTax).toBe(10_000_000); // 10%
    expect(giftChild.voluntaryFilingDiscount).toBe(300_000); // 3%
    expect(giftChild.finalPayableTax).toBe(9_700_000);
  });

  it("calculates parental leave pay with 2026 revised upper limits", () => {
    const res = calculateParentalLeavePay({
      ordinaryMonthlyWage: 3_000_000,
      durationMonths: 12,
      isBothParentsLeave: false,
    });
    expect(res.monthlyBreakdown).toHaveLength(12);
    expect(res.monthlyBreakdown[0].monthlyCap).toBe(2_500_000);
    expect(res.monthlyBreakdown[0].paidAmount).toBe(2_500_000); // month 1 capped at 2.5M
    expect(res.monthlyBreakdown[3].monthlyCap).toBe(2_000_000); // month 4 capped at 2.0M
    expect(res.monthlyBreakdown[6].monthlyCap).toBe(1_600_000); // month 7 capped at 1.6M
    expect(res.totalPaidAmount).toBeGreaterThan(0);
    expect(res.capBenefitGain).toBeGreaterThan(0);
  });

  it("calculates loan prepayment penalty sliding schedule and break-even", () => {
    const res = calculateLoanPrepaymentPenalty({
      prepaymentAmount: 200_000_000,
      feeRatePercent: 1.2,
      loanTermDays: 1095,
      elapsedDays: 365, // 1 year elapsed out of 3 years
      currentInterestRate: 4.8,
      newInterestRate: 3.5,
    });
    expect(res.prepaymentPenalty).toBeGreaterThan(0);
    expect(res.remainingPenaltyDays).toBe(730);
    expect(res.monthlyInterestSavings).toBeGreaterThan(0);
    expect(res.breakEvenMonths).toBeGreaterThan(0);
  });

  it("diagnoses health insurance dependent status accurately", () => {
    // Safe
    const safe = calculateHealthInsuranceDependent({
      financialIncome: 12_000_000,
      otherIncome: 0,
      propertyTaxBase: 300_000_000,
      hasBusinessRegistration: false,
      businessIncomeAmount: 0,
    });
    expect(safe.isEligible).toBe(true);

    // Income over 20M KRW
    const disqualified = calculateHealthInsuranceDependent({
      financialIncome: 25_000_000,
      otherIncome: 0,
      propertyTaxBase: 200_000_000,
      hasBusinessRegistration: false,
      businessIncomeAmount: 0,
    });
    expect(disqualified.isEligible).toBe(false);
    expect(disqualified.estimatedRegionalMonthlyPremium).toBeGreaterThan(0);
  });

  it("calculates KEPCO progressive electricity bill", () => {
    const res = calculateElectricityBill({
      voltageType: "low",
      season: "summer",
      kwhUsage: 350,
    });
    expect(res.tierReached).toBe(2);
    expect(res.baseFee).toBe(1600);
    expect(res.climateFee).toBe(350 * 9);
    expect(res.totalBill).toBeGreaterThan(0);
  });

  it("calculates government policy housing loans (Didimdol & Beotimmok)", () => {
    const didimdol = calculatePolicyHousingLoan({
      loanType: "didimdol",
      householdType: "newlywed",
      annualIncome: 70_000_000,
      housePriceOrDeposit: 500_000_000,
      requestedLoanAmount: 300_000_000,
      loanTermYears: 30,
    });
    expect(didimdol.isEligible).toBe(true);
    expect(didimdol.approvedLoanAmount).toBe(300_000_000);
    expect(didimdol.monthlyPayment).toBeGreaterThan(0);
    expect(didimdol.monthlyInterestSavings).toBeGreaterThan(0);
  });
});
