import { describe, expect, it } from "vitest";
import {
  KR_2026,
  calculateSalary,
  earnedIncomeDeduction,
  progressiveIncomeTax,
  earnedIncomeTaxCredit,
  childTaxCredit,
  calculateSeverance,
  calculateWeeklyHoliday,
  pyeongToSqm,
  sqmToPyeong,
  calculateKoreanAge,
  zodiacOf,
  calculateBrokerage,
  calculateConversion,
  calculateAcquisitionTax,
  calculateLoan,
  calculateDsr,
  maxLoanForDsr,
  calculateUnemployment,
  benefitDays,
} from "@/engines/korea";

describe("Korean Salary Engine (연봉 실수령액)", () => {
  it("calculates progressive earned income deduction properly", () => {
    expect(earnedIncomeDeduction(4_000_000)).toBe(4_000_000 * 0.7);
    expect(earnedIncomeDeduction(10_000_000)).toBe(3_500_000 + 5_000_000 * 0.4);
    expect(earnedIncomeDeduction(30_000_000)).toBe(7_500_000 + 15_000_000 * 0.15);
    expect(earnedIncomeDeduction(60_000_000)).toBe(12_000_000 + 15_000_000 * 0.05);
    expect(earnedIncomeDeduction(150_000_000)).toBe(14_750_000 + 50_000_000 * 0.02);
  });

  it("calculates progressive income tax brackets accurately", () => {
    expect(progressiveIncomeTax(0)).toBe(0);
    expect(progressiveIncomeTax(10_000_000)).toBe(10_000_000 * 0.06);
    expect(progressiveIncomeTax(20_000_000)).toBe(20_000_000 * 0.15 - 1_260_000);
    expect(progressiveIncomeTax(60_000_000)).toBe(60_000_000 * 0.24 - 5_760_000);
  });

  it("calculates 4대보험 and take-home pay for standard 50M KRW salary", () => {
    const res = calculateSalary({
      amount: 50_000_000,
      basis: "annual",
      severanceIncluded: false,
      mealAllowance: 200_000,
      household: 1,
      children: 0,
    });

    expect(res.annualGross).toBe(50_000_000);
    expect(res.monthlyGross).toBeCloseTo(50_000_000 / 12, 0);
    expect(res.pension).toBeGreaterThan(0);
    expect(res.health).toBeGreaterThan(0);
    expect(res.longTerm).toBeGreaterThan(0);
    expect(res.employment).toBeGreaterThan(0);
    expect(res.incomeTax).toBeGreaterThan(0);
    expect(res.localTax).toBeCloseTo(res.incomeTax * 0.1, -1);
    expect(res.monthlyNet).toBeLessThan(res.monthlyGross);
    expect(res.netRatio).toBeGreaterThan(75);
    expect(res.netRatio).toBeLessThan(95);
    expect(res.employerMonthlyCost).toBeGreaterThan(res.monthlyGross);
  });

  it("gives higher take-home pay for higher dependents and children", () => {
    const single = calculateSalary({
      amount: 60_000_000,
      basis: "annual",
      severanceIncluded: false,
      mealAllowance: 200_000,
      household: 1,
      children: 0,
    });

    const family = calculateSalary({
      amount: 60_000_000,
      basis: "annual",
      severanceIncluded: false,
      mealAllowance: 200_000,
      household: 4,
      children: 2,
    });

    expect(family.incomeTax).toBeLessThan(single.incomeTax);
    expect(family.monthlyNet).toBeGreaterThan(single.monthlyNet);
  });
});

describe("Korean Severance Pay Engine (퇴직금)", () => {
  it("calculates severance for full year employee", () => {
    const res = calculateSeverance({
      start: "2024-01-01",
      end: "2025-01-01",
      last3MonthsPay: 9_000_000,
      annualBonus: 4_000_000,
      annualLeavePay: 1_000_000,
      weeklyHours: 40,
    });

    expect(res.valid).toBe(true);
    expect(res.eligible).toBe(true);
    expect(res.employedDays).toBe(367);
    expect(res.severance).toBeGreaterThan(3_000_000);
  });

  it("flags ineligibility when employed under 1 year or under 15 weekly hours", () => {
    const shortTerm = calculateSeverance({
      start: "2024-01-01",
      end: "2024-06-30",
      last3MonthsPay: 6_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
      weeklyHours: 40,
    });
    expect(shortTerm.eligible).toBe(false);
    expect(shortTerm.reason).toBe("under-1-year");

    const shortHours = calculateSeverance({
      start: "2023-01-01",
      end: "2025-01-01",
      last3MonthsPay: 6_000_000,
      annualBonus: 0,
      annualLeavePay: 0,
      weeklyHours: 14,
    });
    expect(shortHours.eligible).toBe(false);
    expect(shortHours.reason).toBe("under-15-hours");
  });
});

describe("Korean Weekly Holiday Pay Engine (주휴수당)", () => {
  it("calculates weekly and monthly holiday allowance for 40-hour worker", () => {
    const res = calculateWeeklyHoliday({
      hourly: 10_320,
      weeklyHours: 40,
      fullAttendance: true,
      deduction: "none",
    });

    expect(res.eligible).toBe(true);
    expect(res.holidayHours).toBe(8);
    expect(res.weeklyHolidayPay).toBe(10_320 * 8);
    // 48 hours * 365 / 7 / 12 = 208.57 ~ 209 hours
    expect(res.monthlyHours).toBeCloseTo(208.57, 1);
    expect(res.monthlyGross).toBeCloseTo(208.57 * 10_320, -2);
    expect(res.belowMinimum).toBe(false);
  });

  it("applies 3.3% tax or 4대보험 deduction correctly", () => {
    const tax33 = calculateWeeklyHoliday({
      hourly: 11_000,
      weeklyHours: 20,
      fullAttendance: true,
      deduction: "3.3",
    });
    expect(tax33.deductionAmount).toBeGreaterThan(0);
    expect(tax33.monthlyNet).toBe(tax33.monthlyGross - tax33.deductionAmount);

    const noHoliday = calculateWeeklyHoliday({
      hourly: 11_000,
      weeklyHours: 12,
      fullAttendance: true,
      deduction: "none",
    });
    expect(noHoliday.eligible).toBe(false);
    expect(noHoliday.weeklyHolidayPay).toBe(0);
  });
});

describe("Pyeong and m2 Converter Engine (평수 계산기)", () => {
  it("converts 1 pyeong to 3.305785... sqm and vice versa", () => {
    expect(pyeongToSqm(1)).toBeCloseTo(3.305785, 4);
    expect(sqmToPyeong(pyeongToSqm(34))).toBeCloseTo(34, 4);
    expect(pyeongToSqm(34)).toBeCloseTo(112.396, 2);
    expect(sqmToPyeong(84)).toBeCloseTo(25.41, 1);
  });
});

describe("Korean Age Engine (만 나이 계산기)", () => {
  it("calculates 만 나이, 연 나이, 세는 나이 correctly", () => {
    // Born 2000-05-15, reference date 2026-10-23
    const res = calculateKoreanAge("2000-05-15", "2026-10-23");
    expect(res.valid).toBe(true);
    expect(res.manAge).toBe(26);
    expect(res.yearAge).toBe(26);
    expect(res.countingAge).toBe(27);
    expect(res.zodiac).toBe("용");
    expect(res.daysLived).toBeGreaterThan(9000);
  });

  it("reduces 만 나이 by 1 before birthday", () => {
    // Born 2000-11-20, reference 2026-10-23 (before birthday)
    const res = calculateKoreanAge("2000-11-20", "2026-10-23");
    expect(res.manAge).toBe(25);
    expect(res.yearAge).toBe(26);
    expect(res.countingAge).toBe(27);
  });
});

describe("Real Estate Brokerage Fee Engine (부동산 중개수수료)", () => {
  it("computes sale brokerage under Seoul ordinance", () => {
    // 500M apartment sale: 0.4%
    const res500m = calculateBrokerage({
      deal: "sale",
      kind: "house",
      price: 500_000_000,
      monthlyRent: 0,
    });
    expect(res500m.rate).toBe(0.004);
    expect(res500m.fee).toBe(2_000_000);
    expect(res500m.vat).toBe(200_000);
    expect(res500m.total).toBe(2_200_000);

    // 40M small sale: 0.6%, cap 250,000
    const res40m = calculateBrokerage({
      deal: "sale",
      kind: "house",
      price: 40_000_000,
      monthlyRent: 0,
    });
    expect(res40m.fee).toBe(240_000); // 40m * 0.006 = 240k <= 250k cap
  });

  it("converts monthly rent with 100x and 70x rules", () => {
    // Deposit 10M, Rent 300K -> 10M + 30M = 40M (<50M) => 10M + 21M = 31M
    const resSmall = calculateBrokerage({
      deal: "rent",
      kind: "house",
      price: 10_000_000,
      monthlyRent: 300_000,
    });
    expect(resSmall.tradeAmount).toBe(31_000_000);
  });
});

describe("Jeonse-Wolse Conversion Engine (전월세 전환)", () => {
  it("converts jeonse to wolse and checks legal cap", () => {
    // 300M jeonse to 100M deposit, spread 2% + base 3.5% = 5.5% cap
    const res = calculateConversion({
      direction: "jeonseToWolse",
      jeonse: 300_000_000,
      deposit: 100_000_000,
      monthlyRent: 0,
      ratePercent: 5.0,
      baseRatePercent: 3.5,
    });

    expect(res.legalCapPercent).toBe(5.5);
    expect(res.overCap).toBe(false);
    // (200,000,000 * 0.05) / 12 = 833,333
    expect(res.monthlyRent).toBeCloseTo(833_333, -1);
  });
});

describe("Acquisition Tax Engine (주택 취득세)", () => {
  it("calculates basic 1-home acquisition tax", () => {
    const res500m = calculateAcquisitionTax({
      price: 500_000_000,
      homesAfter: 1,
      regulated: false,
      over85: false,
      firstTimeBuyer: false,
    });
    expect(res500m.baseRatePercent).toBe(1);
    expect(res500m.acquisitionTax).toBe(5_000_000);
    expect(res500m.surcharge).toBe(false);
  });

  it("applies first-time buyer discount up to 2M KRW", () => {
    const resFirst = calculateAcquisitionTax({
      price: 400_000_000,
      homesAfter: 1,
      regulated: false,
      over85: false,
      firstTimeBuyer: true,
    });
    expect(resFirst.reduction).toBe(2_000_000);
    expect(resFirst.acquisitionTax).toBe(4_000_000 - 2_000_000);
  });

  it("applies multi-home surcharge in regulated area", () => {
    const resHeavy = calculateAcquisitionTax({
      price: 1_000_000_000,
      homesAfter: 2,
      regulated: true,
      over85: false,
      firstTimeBuyer: false,
    });
    expect(resHeavy.surcharge).toBe(true);
    expect(resHeavy.baseRatePercent).toBe(8);
  });
});

describe("Loan and DSR Engine (대출이자 및 DSR)", () => {
  it("calculates equal payment loan amortization", () => {
    const res = calculateLoan({
      principal: 300_000_000,
      ratePercent: 4.0,
      years: 30,
      type: "equalPayment",
    });

    expect(res.firstPayment).toBeCloseTo(res.lastPayment, 0);
    expect(res.totalPayment).toBeGreaterThan(300_000_000);
    expect(res.rows.length).toBe(360);
  });

  it("evaluates DSR limit and max borrowing power", () => {
    const dsr = calculateDsr({
      annualIncome: 70_000_000,
      newLoanAnnualPayment: 20_000_000,
      existingAnnualPayment: 5_000_000,
    });
    // (25M / 70M) * 100 = 35.71%
    expect(dsr.dsrPercent).toBeCloseTo(35.71, 1);
    expect(dsr.ok).toBe(true);

    const maxLoan = maxLoanForDsr(
      { ratePercent: 4.0, years: 30, type: "equalPayment" },
      70_000_000,
      5_000_000,
      40,
    );
    expect(maxLoan).toBeGreaterThan(100_000_000);
  });
});

describe("Unemployment Benefit Engine (실업급여)", () => {
  it("applies daily cap and benefit days for over 50 employee", () => {
    const res = calculateUnemployment({
      last3MonthsPay: 12_000_000,
      threeMonthDays: 92,
      insuredYears: 6,
      ageOver50OrDisabled: true,
      weeklyHours: 40,
      involuntary: true,
    });

    expect(res.eligible).toBe(true);
    expect(res.cappedBy).toBe("max");
    expect(res.daily).toBe(KR_2026.unemploymentDailyMax);
    expect(res.days).toBe(240); // 5~10 years & over 50
    expect(res.total).toBe(KR_2026.unemploymentDailyMax * 240);
  });

  it("flags ineligibility for voluntary retirement", () => {
    const voluntary = calculateUnemployment({
      last3MonthsPay: 9_000_000,
      threeMonthDays: 92,
      insuredYears: 2,
      ageOver50OrDisabled: false,
      weeklyHours: 40,
      involuntary: false,
    });
    expect(voluntary.eligible).toBe(false);
    expect(voluntary.reason).toBe("voluntary");
  });
});
