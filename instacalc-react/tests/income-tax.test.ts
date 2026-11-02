import { describe, expect, it } from "vitest";
import { calculateIncomeTax } from "@/engines/income-tax";

describe("calculateIncomeTax (FY 2026-27)", () => {
  it("yields zero tax for salaried income up to ₹12.75L under new regime (with std deduction & 87A)", () => {
    const res = calculateIncomeTax({ grossIncome: 1200000 });
    // Gross: 12L - 75k std deduction = 11.25L taxable <= 12L => 87A rebate wipes tax to 0
    expect(res.newRegime.totalTax).toBe(0);
    expect(res.winner).toBe("new");
  });

  it("calculates correct tax for ₹20 Lakh gross salary under new regime", () => {
    const res = calculateIncomeTax({ grossIncome: 2000000 });
    // Taxable = 20,00,000 - 75,000 = 19,25,000
    // Slabs:
    // 0-4L: 0
    // 4-8L (4L @ 5%): 20,000
    // 8-12L (4L @ 10%): 40,000
    // 12-16L (4L @ 15%): 60,000
    // 16-19.25L (3.25L @ 20%): 65,000
    // Base Tax = 20k + 40k + 60k + 65k = 1,85,000
    // Cess (4%) = 7,400 => Total = 1,92,400
    expect(res.newRegime.baseTax).toBe(185000);
    expect(res.newRegime.cess).toBe(7400);
    expect(res.newRegime.totalTax).toBe(192400);
  });

  it("calculates old regime correctly with deductions and NPS", () => {
    const res = calculateIncomeTax({
      grossIncome: 1500000,
      extraDeductions: 250000,
      npsDeduction: 50000,
    });
    // Deductions: 50k (std) + 250k (80C/80D/HRA) + 50k (NPS) = 350k
    // Taxable Old: 15,00,000 - 3,50,000 = 11,50,000
    // Slabs Old:
    // 0-2.5L: 0
    // 2.5-5L (2.5L @ 5%): 12,500
    // 5-10L (5L @ 20%): 1,00,000
    // 10-11.5L (1.5L @ 30%): 45,000
    // Base = 1,57,500 + 4% cess (6,300) = 1,63,800
    expect(res.oldRegime.taxableIncome).toBe(1150000);
    expect(res.oldRegime.totalTax).toBe(163800);
  });
});
