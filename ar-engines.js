/**
 * InstaCalc Arabic Calculations Engine (ar-engines.js) - Complete GCC & Arab Suite
 * 
 * Implements GCC and Arab regulatory, financial, Islamic, and cultural formulas:
 * 1. calculateEndOfService (Saudi Arts 84/85 & UAE Decree 33/2021)
 * 2. calculateSalary (GOSI / GPSSA Net Salary & Deductions)
 * 3. calculateZakat (Zakat on Cash, Gold, Stocks, and Assets with Nisab Check)
 * 4. calculateVAT (Dual 15% KSA / 5% UAE VAT Inclusive/Exclusive)
 * 5. calculateMurabaha (Personal Finance & Murabaha Installments)
 * 6. calculateDBR (SAMA Debt Burden Ratio)
 * 7. calculateRETT (Real Estate Transaction Tax 5% & Brokerage)
 * 8. calculateAge & gregorianToHijri (Umm al-Qura Hijri/Gregorian Age)
 * 9. calculateOvertime (150% Labor Law Overtime Wage)
 * 10. calculateLeaveSettlement (Unused Annual Leave Cash-Out)
 * 11. calculateMortgage (Islamic Home Mortgage & Sakani Subsidy)
 * 12. calculateAutoFinance (Auto Lease-to-Own with Balloon Payment & Insurance)
 * 13. calculateEarlySettlement (Early Loan Payoff & Unearned Profit Rebate)
 * 14. calculateGoldZakat (Dedicated Multi-Karat Gold Zakat)
 * 15. calculateSukukSavings (Government Sukuk & Sahh Savings Plan)
 * 16. calculateCompoundProfit (Halal Compound Profit & Recurring DCA)
 * 17. calculateStockAverage (Tadawul Stock Average Down & Commission)
 * 18. calculateFIRE (Early Retirement & Financial Independence in GCC)
 * 19. hijriToGregorian (Hijri to Gregorian Calendar Conversion)
 * 20. calculateCountdown (Countdown to Ramadan, Eid, National Days)
 * 21. calculateElectricityBill (SEC 18/30 Halalas Tiered Tariff)
 * 22. calculateFuelCost (Aramco Gasoline 91/95 Trip & Tank Cost)
 * 23. convertArea (Sqm, Donum, Feddan, Qirat, Sahm, Hectare)
 * 24. calculateConcrete (Cubic Meters, 50kg Cement Bags, Sand & Gravel)
 * 25. calculateDiagonal (Screen Inchs & 3-4-5 Squaring Corners)
 * 26. calculateTriangle (Trigonometry, Heron's Area & Angles)
 * 27. calculateCatAge (Cat Age in Human Years & Biological Stages)
 */
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.arEngines = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {
  'use strict';

  /* 1. مكافأة نهاية الخدمة */
  function calculateEndOfService(params) {
    const salary = Number(params.salary) || 0;
    const years = Number(params.years) || 0;
    const months = Number(params.months) || 0;
    const days = Number(params.days) || 0;
    const reason = params.reason || 'termination';
    const country = params.country || 'sa';

    const totalYears = years + (months / 12) + (days / 365);
    if (totalYears <= 0 || salary <= 0) {
      return { totalYears: 0, baseAmount: 0, finalAmount: 0, percentage: 0, reasonText: '' };
    }

    if (country === 'sa') {
      let baseAmount = 0;
      if (totalYears <= 5) {
        baseAmount = (salary * 0.5) * totalYears;
      } else {
        baseAmount = (salary * 0.5 * 5) + (salary * 1.0 * (totalYears - 5));
      }

      let percentage = 1.0;
      let reasonText = 'استحقاق كامل (فسخ عقد من جهة العمل أو انتهاء العقد)';

      if (reason === 'resignation') {
        if (totalYears < 2) {
          percentage = 0;
          reasonText = 'استقالة قبل إكمال سنتين (لا يستحق مكافأة)';
        } else if (totalYears < 5) {
          percentage = 1 / 3;
          reasonText = 'استقالة بين سنتين و 5 سنوات (يستحق ثلث المكافأة 33.3%)';
        } else if (totalYears < 10) {
          percentage = 2 / 3;
          reasonText = 'استقالة بين 5 و 10 سنوات (يستحق ثلثي المكافأة 66.7%)';
        } else {
          percentage = 1.0;
          reasonText = 'استقالة بعد 10 سنوات فما فوق (يستحق المكافأة كاملة 100%)';
        }
      }

      const finalAmount = Math.round(baseAmount * percentage);
      return {
        totalYears: Number(totalYears.toFixed(2)),
        baseAmount: Math.round(baseAmount),
        finalAmount,
        percentage: Number((percentage * 100).toFixed(1)),
        reasonText
      };
    } else {
      if (totalYears < 1) {
        return {
          totalYears: Number(totalYears.toFixed(2)),
          baseAmount: 0,
          finalAmount: 0,
          percentage: 0,
          reasonText: 'الخدمة أقل من سنة (لا تستحق مكافأة بموجب القانون الإماراتي)'
        };
      }

      let baseAmount = 0;
      if (totalYears <= 5) {
        baseAmount = (salary * (21 / 30)) * totalYears;
      } else {
        baseAmount = (salary * (21 / 30) * 5) + (salary * (30 / 30) * (totalYears - 5));
      }

      const maxCap = salary * 24;
      const isCapped = baseAmount > maxCap;
      const finalAmount = isCapped ? maxCap : Math.round(baseAmount);

      return {
        totalYears: Number(totalYears.toFixed(2)),
        baseAmount: Math.round(baseAmount),
        finalAmount,
        percentage: 100,
        isCapped,
        reasonText: isCapped ? 'تم تطبيق الحد الأقصى للمكافأة (أجر سنتين)' : 'استحقاق كامل وفق قانون العمل الإماراتي'
      };
    }
  }

  /* 2. صافي الراتب والتأمينات الاجتماعية (GOSI) */
  function calculateSalary(params) {
    const basic = Number(params.basic) || 0;
    const housing = Number(params.housing) || 0;
    const transport = Number(params.transport) || 0;
    const other = Number(params.other) || 0;
    const isSaudi = Boolean(params.isSaudi);

    const grossSalary = basic + housing + transport + other;

    if (!isSaudi) {
      return {
        grossSalary,
        contributoryWage: 0,
        employeePension: 0,
        employeeSaned: 0,
        totalDeductions: 0,
        netSalary: grossSalary,
        employerShare: Math.round(Math.min(basic + housing, 45000) * 0.02)
      };
    }

    const contributoryWage = Math.min(basic + housing, 45000);
    const employeePension = Math.round(contributoryWage * 0.0975);
    const employeeSaned = Math.round(contributoryWage * 0.0075);
    const totalDeductions = employeePension + employeeSaned;
    const netSalary = grossSalary - totalDeductions;

    const employerPension = Math.round(contributoryWage * 0.1175);
    const employerSaned = Math.round(contributoryWage * 0.0075);
    const employerHazards = Math.round(contributoryWage * 0.02);
    const employerShare = employerPension + employerSaned + employerHazards;

    return {
      grossSalary,
      contributoryWage,
      employeePension,
      employeeSaned,
      totalDeductions,
      netSalary,
      employerShare
    };
  }

  /* 3. زكاة المال والمدخرات */
  function calculateZakat(params) {
    const cash = Number(params.cash) || 0;
    const gold24k = Number(params.gold24k) || 0;
    const gold21k = Number(params.gold21k) || 0;
    const gold18k = Number(params.gold18k) || 0;
    const silverGrams = Number(params.silverGrams) || 0;
    const commercialGoods = Number(params.commercialGoods) || 0;
    const tradingStocks = Number(params.tradingStocks) || 0;
    const receivables = Number(params.receivables) || 0;
    const debts = Number(params.debts) || 0;
    const yearType = params.yearType || 'hijri';
    const goldPrice24k = Number(params.goldPrice24k) || 315;

    const equivalentPureGoldGrams = gold24k + (gold21k * (21 / 24)) + (gold18k * (18 / 24));
    const goldMonetaryValue = equivalentPureGoldGrams * goldPrice24k;
    const silverMonetaryValue = silverGrams * 3.8;

    const totalAssets = cash + goldMonetaryValue + silverMonetaryValue + commercialGoods + tradingStocks + receivables;
    const netZakatable = Math.max(0, totalAssets - debts);

    const nisabThreshold = 85 * goldPrice24k;
    const isNisabMet = netZakatable >= nisabThreshold;

    const zakatRate = yearType === 'hijri' ? 0.025 : 0.02577;
    const zakatDue = isNisabMet ? Math.round(netZakatable * zakatRate) : 0;

    return {
      totalAssets: Math.round(totalAssets),
      debts: Math.round(debts),
      netZakatable: Math.round(netZakatable),
      nisabThreshold: Math.round(nisabThreshold),
      isNisabMet,
      equivalentPureGoldGrams: Number(equivalentPureGoldGrams.toFixed(1)),
      zakatRatePercent: yearType === 'hijri' ? 2.5 : 2.577,
      zakatDue
    };
  }

  /* 4. ضريبة القيمة المضافة */
  function calculateVAT(params) {
    const amount = Number(params.amount) || 0;
    const rate = Number(params.rate) || 15;
    const isInclusive = Boolean(params.isInclusive);

    if (amount <= 0) {
      return { netAmount: 0, vatAmount: 0, grossAmount: 0, rate };
    }

    if (isInclusive) {
      const netAmount = amount / (1 + (rate / 100));
      const vatAmount = amount - netAmount;
      return {
        netAmount: Number(netAmount.toFixed(2)),
        vatAmount: Number(vatAmount.toFixed(2)),
        grossAmount: Number(amount.toFixed(2)),
        rate
      };
    } else {
      const vatAmount = amount * (rate / 100);
      const grossAmount = amount + vatAmount;
      return {
        netAmount: Number(amount.toFixed(2)),
        vatAmount: Number(vatAmount.toFixed(2)),
        grossAmount: Number(grossAmount.toFixed(2)),
        rate
      };
    }
  }

  /* 5. التمويل الشخصي والمرابحة */
  function calculateMurabaha(params) {
    const amount = Number(params.amount) || 0;
    const profitRate = Number(params.profitRate) || 0;
    const tenureMonths = Number(params.tenureMonths) || 60;
    const adminFeeRate = Number(params.adminFeeRate) || 1;

    const years = tenureMonths / 12;
    const totalProfit = amount * (profitRate / 100) * years;
    const adminFee = Math.min(amount * (adminFeeRate / 100), 5000);
    const totalPayable = amount + totalProfit + adminFee;
    const monthlyInstallment = tenureMonths > 0 ? totalPayable / tenureMonths : 0;
    const apr = years > 0 ? ((totalProfit + adminFee) / amount / years) * 100 : profitRate;

    return {
      principal: amount,
      totalProfit: Math.round(totalProfit),
      adminFee: Math.round(adminFee),
      totalPayable: Math.round(totalPayable),
      monthlyInstallment: Math.round(monthlyInstallment),
      apr: Number(apr.toFixed(2))
    };
  }

  /* 6. نسبة عبء المديونية SAMA DBR */
  function calculateDBR(params) {
    const netSalary = Number(params.netSalary) || 0;
    const existingLoans = Number(params.existingLoans) || 0;
    const creditCards = Number(params.creditCards) || 0;
    const proposedInstallment = Number(params.proposedInstallment) || 0;
    const maxRatio = Number(params.maxRatio) || 33.33;

    const cardObligation = creditCards * 0.05;
    const totalCurrentObligations = existingLoans + cardObligation;
    const totalObligationsWithProposed = totalCurrentObligations + proposedInstallment;

    const currentDbr = netSalary > 0 ? (totalCurrentObligations / netSalary) * 100 : 0;
    const projectedDbr = netSalary > 0 ? (totalObligationsWithProposed / netSalary) * 100 : 0;

    const maxAllowableMonthly = (maxRatio / 100) * netSalary;
    const remainingInstallmentCapacity = Math.max(0, maxAllowableMonthly - totalCurrentObligations);

    const isEligible = projectedDbr <= maxRatio;

    return {
      netSalary,
      currentDbr: Number(currentDbr.toFixed(1)),
      projectedDbr: Number(projectedDbr.toFixed(1)),
      maxRatio,
      maxAllowableMonthly: Math.round(maxAllowableMonthly),
      remainingInstallmentCapacity: Math.round(remainingInstallmentCapacity),
      isEligible
    };
  }

  /* 7. ضريبة التصرفات العقارية RETT */
  function calculateRETT(params) {
    const propertyValue = Number(params.propertyValue) || 0;
    const isFirstHome = Boolean(params.isFirstHome);
    const brokeragePercent = Number(params.brokeragePercent) || 2.5;

    let rettTax = propertyValue * 0.05;
    let exemptionAmount = 0;

    if (isFirstHome) {
      const exemptValue = Math.min(propertyValue, 1000000);
      exemptionAmount = exemptValue * 0.05;
      rettTax = Math.max(0, rettTax - exemptionAmount);
    }

    const brokerageFee = propertyValue * (brokeragePercent / 100);
    const brokerageVat = brokerageFee * 0.15;
    const totalBrokerage = brokerageFee + brokerageVat;
    const totalClosingCosts = rettTax + totalBrokerage;

    return {
      propertyValue,
      grossRett: Math.round(propertyValue * 0.05),
      exemptionAmount: Math.round(exemptionAmount),
      rettTax: Math.round(rettTax),
      brokerageFee: Math.round(brokerageFee),
      brokerageVat: Math.round(brokerageVat),
      totalBrokerage: Math.round(totalBrokerage),
      totalClosingCosts: Math.round(totalClosingCosts)
    };
  }

  /* 8. التقويم الهجري والميلادي */
  function gregorianToHijri(y, m, d) {
    let jd;
    if ((y > 1582) || ((y === 1582) && (m > 10)) || ((y === 1582) && (m === 10) && (d > 14))) {
      jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4) +
           Math.floor((367 * (m - 2 - 12 * (Math.floor((m - 14) / 12)))) / 12) -
           Math.floor((3 * (Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100))) / 4) +
           d - 32075;
    } else {
      jd = 367 * y - Math.floor((7 * (y + 5001 + Math.floor((m - 9) / 7))) / 4) +
           Math.floor((275 * m) / 9) + d + 1729777;
    }

    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l1 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l1) / 5316)) * (Math.floor((50 * l1) / 17719)) +
              (Math.floor(l1 / 5670)) * (Math.floor((43 * l1) / 15238));
    const l2 = l1 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
               (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    const mH = Math.floor((24 * l2) / 709);
    const dH = l2 - Math.floor((709 * mH) / 24);
    const yH = 30 * n + j - 30;

    return { year: yH, month: mH, day: dH };
  }

  function hijriToGregorian(yH, mH, dH) {
    const jd = Math.floor((11 * yH + 3) / 30) + 354 * yH + 30 * mH - Math.floor((mH - 1) / 2) + dH + 1948440 - 385;
    let l = jd + 68569;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const d = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const m = j + 2 - 12 * l;
    const y = 100 * (n - 49) + i + l;
    return { year: y, month: m, day: d };
  }

  function calculateAge(birthDateString) {
    const birth = new Date(birthDateString);
    if (isNaN(birth.getTime())) return null;

    const today = new Date();
    let gYears = today.getFullYear() - birth.getFullYear();
    let gMonths = today.getMonth() - birth.getMonth();
    let gDays = today.getDate() - birth.getDate();

    if (gDays < 0) {
      gMonths--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      gDays += prevMonth.getDate();
    }
    if (gMonths < 0) {
      gYears--;
      gMonths += 12;
    }

    const totalDays = Math.floor((today - birth) / (1000 * 60 * 60 * 24));
    const bHijri = gregorianToHijri(birth.getFullYear(), birth.getMonth() + 1, birth.getDate());
    const tHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());

    let hYears = tHijri.year - bHijri.year;
    let hMonths = tHijri.month - bHijri.month;
    let hDays = tHijri.day - bHijri.day;

    if (hDays < 0) {
      hMonths--;
      hDays += 30;
    }
    if (hMonths < 0) {
      hYears--;
      hMonths += 12;
    }

    return {
      gregorian: { years: gYears, months: gMonths, days: gDays },
      hijri: { years: hYears, months: hMonths, days: hDays },
      totalDays,
      birthHijri: `${bHijri.day}/${bHijri.month}/${bHijri.year} هـ`,
      todayHijri: `${tHijri.day}/${tHijri.month}/${tHijri.year} هـ`
    };
  }

  /* 9. العمل الإضافي (150% وفق المادة 107) */
  function calculateOvertime(params) {
    const basic = Number(params.basic) || 0;
    const allowances = Number(params.allowances) || 0;
    const normalHours = Number(params.normalHours) || 0;
    const holidayHours = Number(params.holidayHours) || 0;

    const actualSalary = basic + allowances;
    // أجر الساعة = الراتب الفعلي / 240 ساعة (30 يوم * 8 ساعات)
    const hourlyRate = actualSalary > 0 ? actualSalary / 240 : 0;
    const normalOvertimeRate = hourlyRate * 1.5;
    const holidayOvertimeRate = hourlyRate * 2.0;

    const normalPay = normalHours * normalOvertimeRate;
    const holidayPay = holidayHours * holidayOvertimeRate;
    const totalPay = normalPay + holidayPay;

    return {
      actualSalary,
      hourlyRate: Number(hourlyRate.toFixed(2)),
      normalOvertimeRate: Number(normalOvertimeRate.toFixed(2)),
      holidayOvertimeRate: Number(holidayOvertimeRate.toFixed(2)),
      normalPay: Math.round(normalPay),
      holidayPay: Math.round(holidayPay),
      totalPay: Math.round(totalPay)
    };
  }

  /* 10. رصيد ومقابل الإجازات السنوية */
  function calculateLeaveSettlement(params) {
    const salary = Number(params.salary) || 0;
    const leaveDays = Number(params.leaveDays) || 0;

    // أجر اليوم = الراتب الفعلي / 30
    const dailyWage = salary > 0 ? salary / 30 : 0;
    const totalAmount = leaveDays * dailyWage;

    return {
      salary,
      leaveDays,
      dailyWage: Number(dailyWage.toFixed(2)),
      totalAmount: Math.round(totalAmount)
    };
  }

  /* 11. التمويل العقاري والسكني */
  function calculateMortgage(params) {
    const propertyPrice = Number(params.propertyPrice) || 0;
    const downPayment = Number(params.downPayment) || 0;
    const years = Number(params.years) || 25;
    const profitRate = Number(params.profitRate) || 4.5;
    const isSakani = Boolean(params.isSakani);

    const loanAmount = Math.max(0, propertyPrice - downPayment);
    const totalProfit = loanAmount * (profitRate / 100) * years;
    const totalRepayable = loanAmount + totalProfit;
    const totalMonths = years * 12;
    let monthlyInstallment = totalMonths > 0 ? totalRepayable / totalMonths : 0;

    let monthlySubsidy = 0;
    if (isSakani) {
      // دعم سكني: دعم أرباح حتى 500,000 ريال بنسبة تصل إلى 100%
      const subsidizedPrincipal = Math.min(loanAmount, 500000);
      const subsidizedProfitPortion = (subsidizedPrincipal * (profitRate / 100) * years) / totalMonths;
      monthlySubsidy = Math.round(subsidizedProfitPortion);
    }

    const netMonthlyInstallment = Math.max(0, Math.round(monthlyInstallment) - monthlySubsidy);

    return {
      propertyPrice,
      downPayment,
      loanAmount,
      totalProfit: Math.round(totalProfit),
      totalRepayable: Math.round(totalRepayable),
      monthlyInstallment: Math.round(monthlyInstallment),
      monthlySubsidy,
      netMonthlyInstallment
    };
  }

  /* 12. تمويل السيارات والتأجير المنتهي بالتمليك */
  function calculateAutoFinance(params) {
    const carPrice = Number(params.carPrice) || 0;
    const downPayment = Number(params.downPayment) || 0;
    const balloonPayment = Number(params.balloonPayment) || 0;
    const months = Number(params.months) || 60;
    const profitRate = Number(params.profitRate) || 6.5;
    const insuranceRate = Number(params.insuranceRate) || 3.5;

    const financedPrincipal = Math.max(0, carPrice - downPayment);
    const years = months / 12;
    const totalProfit = financedPrincipal * (profitRate / 100) * years;
    const totalInsurance = carPrice * (insuranceRate / 100) * years;
    const totalFinanced = financedPrincipal + totalProfit + totalInsurance;

    const amortizedAmount = Math.max(0, totalFinanced - balloonPayment);
    const monthlyInstallment = months > 0 ? amortizedAmount / months : 0;

    return {
      carPrice,
      downPayment,
      balloonPayment,
      totalProfit: Math.round(totalProfit),
      totalInsurance: Math.round(totalInsurance),
      totalFinanced: Math.round(totalFinanced),
      monthlyInstallment: Math.round(monthlyInstallment)
    };
  }

  /* 13. السداد المبكر وخصم أرباح التمويل */
  function calculateEarlySettlement(params) {
    const originalLoan = Number(params.originalLoan) || 0;
    const months = Number(params.months) || 60;
    const profitRate = Number(params.profitRate) || 5.0;
    const monthsPaid = Number(params.monthsPaid) || 12;

    const years = months / 12;
    const totalProfit = originalLoan * (profitRate / 100) * years;
    const totalPayable = originalLoan + totalProfit;
    const monthlyInstallment = totalPayable / months;

    const monthlyPrincipal = originalLoan / months;
    const monthlyProfit = totalProfit / months;

    const remainingMonths = Math.max(0, months - monthsPaid);
    const remainingPrincipal = monthlyPrincipal * remainingMonths;

    // تعويض البنك وفق ساما: ربح 3 أشهر تالية فقط
    const penaltyProfit = Math.min(remainingMonths, 3) * monthlyProfit;
    const settlementAmount = remainingPrincipal + penaltyProfit;
    const unearnedProfitDiscount = (remainingMonths * monthlyProfit) - penaltyProfit;

    return {
      originalLoan,
      monthsPaid,
      remainingMonths,
      monthlyInstallment: Math.round(monthlyInstallment),
      remainingPrincipal: Math.round(remainingPrincipal),
      settlementAmount: Math.round(settlementAmount),
      unearnedProfitDiscount: Math.max(0, Math.round(unearnedProfitDiscount))
    };
  }

  /* 14. زكاة الذهب والحلي بالأعيرة */
  function calculateGoldZakat(params) {
    const g24 = Number(params.g24) || 0;
    const g22 = Number(params.g22) || 0;
    const g21 = Number(params.g21) || 0;
    const g18 = Number(params.g18) || 0;
    const price24k = Number(params.price24k) || 315;

    const pureGrams = g24 + (g22 * (22 / 24)) + (g21 * (21 / 24)) + (g18 * (18 / 24));
    const totalWeight = g24 + g22 + g21 + g18;
    const isNisabMet = pureGrams >= 85;
    const totalValue = pureGrams * price24k;
    const zakatDue = isNisabMet ? totalValue * 0.025 : 0;
    const zakatGrams = isNisabMet ? pureGrams * 0.025 : 0;

    return {
      totalWeight: Number(totalWeight.toFixed(1)),
      pureGrams: Number(pureGrams.toFixed(2)),
      isNisabMet,
      totalValue: Math.round(totalValue),
      zakatDue: Math.round(zakatDue),
      zakatGrams: Number(zakatGrams.toFixed(2))
    };
  }

  /* 15. الصكوك وخطة الادخار الحكومية */
  function calculateSukukSavings(params) {
    const initial = Number(params.initial) || 0;
    const monthly = Number(params.monthly) || 0;
    const annualRate = Number(params.annualRate) || 5.5;
    const years = Number(params.years) || 5;

    const r = (annualRate / 100) / 12;
    const n = years * 12;

    let balance = initial;
    let totalContributed = initial;

    for (let i = 0; i < n; i++) {
      balance = (balance + monthly) * (1 + r);
      totalContributed += monthly;
    }

    const totalProfit = Math.max(0, balance - totalContributed);

    return {
      totalContributed: Math.round(totalContributed),
      totalProfit: Math.round(totalProfit),
      finalBalance: Math.round(balance)
    };
  }

  /* 16. الأرباح المركبة والاستثمار الدوري */
  function calculateCompoundProfit(params) {
    const initial = Number(params.initial) || 0;
    const monthly = Number(params.monthly) || 0;
    const rate = Number(params.rate) || 8.0;
    const years = Number(params.years) || 10;

    const r = (rate / 100) / 12;
    const n = years * 12;

    let balance = initial;
    let totalDeposited = initial;

    for (let i = 0; i < n; i++) {
      balance = (balance + monthly) * (1 + r);
      totalDeposited += monthly;
    }

    const totalGain = balance - totalDeposited;

    return {
      totalDeposited: Math.round(totalDeposited),
      totalGain: Math.round(totalGain),
      finalBalance: Math.round(balance)
    };
  }

  /* 17. تعديل ومتوسط أسعار الأسهم تداول */
  function calculateStockAverage(params) {
    const shares1 = Number(params.shares1) || 0;
    const price1 = Number(params.price1) || 0;
    const shares2 = Number(params.shares2) || 0;
    const price2 = Number(params.price2) || 0;

    const totalShares = shares1 + shares2;
    const cost1 = shares1 * price1;
    const cost2 = shares2 * price2;
    const totalCost = cost1 + cost2;
    const newAverage = totalShares > 0 ? totalCost / totalShares : 0;

    // عمولة تداول: 0.155% + 15% ضريبة على العمولة
    const commissionRate = 0.00155 * 1.15;
    const totalCommission = totalCost * commissionRate;

    return {
      totalShares,
      totalCost: Math.round(totalCost),
      newAverage: Number(newAverage.toFixed(2)),
      totalCommission: Number(totalCommission.toFixed(2))
    };
  }

  /* 18. التقاعد المبكر والحرية المالية FIRE */
  function calculateFIRE(params) {
    const monthlyExpenses = Number(params.monthlyExpenses) || 15000;
    const withdrawalRate = Number(params.withdrawalRate) || 4.0;
    const currentSavings = Number(params.currentSavings) || 0;
    const monthlySavings = Number(params.monthlySavings) || 5000;
    const annualReturn = Number(params.annualReturn) || 7.0;

    const annualExpenses = monthlyExpenses * 12;
    const fireNumber = annualExpenses / (withdrawalRate / 100);

    let years = 0;
    let netWorth = currentSavings;
    const r = (annualReturn / 100) / 12;

    while (netWorth < fireNumber && years < 60) {
      for (let m = 0; m < 12; m++) {
        netWorth = (netWorth + monthlySavings) * (1 + r);
      }
      years++;
    }

    return {
      annualExpenses: Math.round(annualExpenses),
      fireNumber: Math.round(fireNumber),
      yearsToFire: years,
      projectedNetWorth: Math.round(netWorth)
    };
  }

  /* 19. حاسبة الأيام والعد التنازلي للمناسبات */
  function calculateCountdown(targetDateString) {
    const target = new Date(targetDateString);
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isPassed: false };
  }

  /* 20. فاتورة الكهرباء بشرائح الاستهلاك السعودية */
  function calculateElectricityBill(params) {
    const kwh = Number(params.kwh) || 0;
    const meterFee = Number(params.meterFee) || 10; // 10 ريال لـ <60A

    let energyCharge = 0;
    let tier1Kwh = 0;
    let tier2Kwh = 0;

    if (kwh <= 6000) {
      tier1Kwh = kwh;
      energyCharge = tier1Kwh * 0.18;
    } else {
      tier1Kwh = 6000;
      tier2Kwh = kwh - 6000;
      energyCharge = (6000 * 0.18) + (tier2Kwh * 0.30);
    }

    const subtotal = energyCharge + meterFee;
    const vat = subtotal * 0.15;
    const totalBill = subtotal + vat;

    return {
      kwh,
      tier1Kwh,
      tier2Kwh,
      energyCharge: Number(energyCharge.toFixed(2)),
      meterFee,
      subtotal: Number(subtotal.toFixed(2)),
      vat: Number(vat.toFixed(2)),
      totalBill: Number(totalBill.toFixed(2))
    };
  }

  /* 21. تكلفة الوقود والمشاوير */
  function calculateFuelCost(params) {
    const distanceKm = Number(params.distanceKm) || 0;
    const consumptionPer100Km = Number(params.consumptionPer100Km) || 8.5;
    const fuelType = params.fuelType || '91';

    // أسعار أرامكو الرسمية السارية
    let pricePerLiter = 2.18; // بنزين 91
    if (fuelType === '95') pricePerLiter = 2.33;
    if (fuelType === 'diesel') pricePerLiter = 1.15;

    const litersNeeded = (distanceKm / 100) * consumptionPer100Km;
    const totalCost = litersNeeded * pricePerLiter;

    return {
      distanceKm,
      consumptionPer100Km,
      pricePerLiter,
      litersNeeded: Number(litersNeeded.toFixed(1)),
      totalCost: Number(totalCost.toFixed(2))
    };
  }

  /* 22. محول مساحات الأراضي */
  function convertArea(value, fromUnit, toUnit) {
    const v = Number(value) || 0;
    // Base unit: square meters (m²)
    const toSqm = {
      sqm: 1.0,
      donum: 1000.0,
      feddan: 4200.83,
      qirat: 175.03,
      sahm: 7.29,
      hectare: 10000.0,
      sqft: 0.092903
    };

    const sqm = v * (toSqm[fromUnit] || 1.0);
    const converted = sqm / (toSqm[toUnit] || 1.0);

    return {
      inputValue: v,
      fromUnit,
      toUnit,
      sqm: Number(sqm.toFixed(2)),
      converted: Number(converted.toFixed(4))
    };
  }

  /* 23. الخرسانة والأسمنت بالمتر المكعب */
  function calculateConcrete(params) {
    const length = Number(params.length) || 0;
    const width = Number(params.width) || 0;
    const thickness = Number(params.thickness) || 0; // بالمتر
    const wastage = Number(params.wastage) || 5; // 5% هدر

    const netVolume = length * width * thickness;
    const totalVolume = netVolume * (1 + (wastage / 100));

    // نسب الخلطة القياسية C25/C30:
    // 7 أكياس أسمنت 50 كجم لكل م³ (350 كجم)
    const cementBags = Math.ceil(totalVolume * 7);
    const cementWeightKg = cementBags * 50;
    const sandM3 = Number((totalVolume * 0.45).toFixed(2));
    const gravelM3 = Number((totalVolume * 0.85).toFixed(2));
    const waterLiters = Math.round(totalVolume * 180);

    return {
      netVolume: Number(netVolume.toFixed(2)),
      totalVolume: Number(totalVolume.toFixed(2)),
      cementBags,
      cementWeightKg,
      sandM3,
      gravelM3,
      waterLiters
    };
  }

  /* 24. القطر وزوايا البناء */
  function calculateDiagonal(width, height) {
    const w = Number(width) || 0;
    const h = Number(height) || 0;
    const diagonal = Math.sqrt((w * w) + (h * h));
    const area = w * h;

    return {
      width: w,
      height: h,
      diagonal: Number(diagonal.toFixed(2)),
      area: Number(area.toFixed(2))
    };
  }

  /* 25. المثلثات والزوايا الهندسية */
  function calculateTriangle(a, b, c) {
    const sideA = Number(a) || 0;
    const sideB = Number(b) || 0;
    const sideC = Number(c) || 0;

    if (sideA <= 0 || sideB <= 0 || sideC <= 0 ||
        (sideA + sideB <= sideC) || (sideA + sideC <= sideB) || (sideB + sideC <= sideA)) {
      return { isValid: false };
    }

    const s = (sideA + sideB + sideC) / 2;
    const area = Math.sqrt(s * (s - sideA) * (s - sideB) * (s - sideC));

    // زوايا بالدرجات
    const angleA = Math.acos((sideB * sideB + sideC * sideC - sideA * sideA) / (2 * sideB * sideC)) * (180 / Math.PI);
    const angleB = Math.acos((sideA * sideA + sideC * sideC - sideB * sideB) / (2 * sideA * sideC)) * (180 / Math.PI);
    const angleC = 180 - angleA - angleB;

    let type = 'مختلف الأضلاع';
    if (sideA === sideB && sideB === sideC) type = 'متساوي الأضلاع';
    else if (sideA === sideB || sideB === sideC || sideA === sideC) type = 'متساوي الساقين';

    if (Math.abs(angleA - 90) < 0.1 || Math.abs(angleB - 90) < 0.1 || Math.abs(angleC - 90) < 0.1) {
      type += ' (قائم الزاوية)';
    }

    return {
      isValid: true,
      sideA, sideB, sideC,
      perimeter: Number((sideA + sideB + sideC).toFixed(2)),
      area: Number(area.toFixed(2)),
      angleA: Number(angleA.toFixed(1)),
      angleB: Number(angleB.toFixed(1)),
      angleC: Number(angleC.toFixed(1)),
      type
    };
  }

  /* 26. حاسبة عمر القطط بالسنوات البشرية */
  function calculateCatAge(years, months) {
    const y = Number(years) || 0;
    const m = Number(months) || 0;
    const totalYears = y + (m / 12);

    let humanYears = 0;
    if (totalYears <= 1) {
      humanYears = totalYears * 15;
    } else if (totalYears <= 2) {
      humanYears = 15 + ((totalYears - 1) * 9);
    } else {
      humanYears = 24 + ((totalYears - 2) * 4);
    }

    let stage = 'مرحلة الهريرة (الطفولة المبكرة)';
    let stageDesc = 'مرحلة الطفولة والنمو السريع والاكتشاف.';
    if (totalYears >= 1 && totalYears < 3) {
      stage = 'مرحلة البلوغ والنشاط (قط يافع)';
      stageDesc = 'مرحلة النضج الجسدي الكامل والنشاط العالي.';
    } else if (totalYears >= 3 && totalYears < 7) {
      stage = 'مرحلة ريعان الشباب واكتمال النضج';
      stageDesc = 'قمة الحيوية والاستقرار السلوكي والصحي.';
    } else if (totalYears >= 7 && totalYears < 11) {
      stage = 'مرحلة النضج والاستقرار';
      stageDesc = 'انخفاض تدريجي في النشاط وبدء الحاجة لرعاية وقائية.';
    } else if (totalYears >= 11 && totalYears < 15) {
      stage = 'مرحلة التقدم في السن (كبار السن)';
      stageDesc = 'مرحلة التقدم في السن وتتطلب فحوصات دورية للكلى والمفاصل.';
    } else if (totalYears >= 15) {
      stage = 'مرحلة الشيخوخة المتقدمة';
      stageDesc = 'مرحلة عمرية متقدمة تتطلب رعاية خاصة وهدوءاً.';
    }

    return {
      totalYears: Number(totalYears.toFixed(1)),
      humanYears: Number(humanYears.toFixed(1)),
      stage,
      stageDesc
    };
  }

  return {
    calculateEndOfService,
    calculateSalary,
    calculateZakat,
    calculateVAT,
    calculateMurabaha,
    calculateDBR,
    calculateRETT,
    gregorianToHijri,
    hijriToGregorian,
    calculateAge,
    calculateOvertime,
    calculateLeaveSettlement,
    calculateMortgage,
    calculateAutoFinance,
    calculateEarlySettlement,
    calculateGoldZakat,
    calculateSukukSavings,
    calculateCompoundProfit,
    calculateStockAverage,
    calculateFIRE,
    calculateCountdown,
    calculateElectricityBill,
    calculateFuelCost,
    convertArea,
    calculateConcrete,
    calculateDiagonal,
    calculateTriangle,
    calculateCatAge
  };
});
