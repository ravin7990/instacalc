import { describe, expect, it } from "vitest";
import {
  rectangleDiagonal,
  squareDiagonal,
  rightTriangleHypotenuse,
  cuboidDiagonal,
  triangleSSS,
  triangleSAS,
  triangleASA,
  equilateralTriangle,
  parallelogramDiagonals,
  polygonDiagonal,
} from "@/engines/geometry";
import { catToHuman, catLifeStage, calculateCatAge, breakDuration, parseTimeString } from "@/engines/life";
import { concreteVolume, calculateConcrete, MIX_DATA } from "@/engines/concrete";

describe("diagonals", () => {
  it("computes a 3-4-5 rectangle", () => {
    const r = rectangleDiagonal(4, 3);
    expect(r.diagonal).toBeCloseTo(5, 10);
    expect(r.perimeter).toBe(14);
    expect(r.area).toBe(12);
  });

  it("computes a square diagonal as s x sqrt(2)", () => {
    const r = squareDiagonal(4);
    expect(r.diagonal).toBeCloseTo(4 * Math.SQRT2, 10);
    expect(r.area).toBe(16);
  });

  it("computes a cuboid space diagonal", () => {
    const r = cuboidDiagonal(2, 3, 6);
    expect(r.diagonal).toBeCloseTo(7, 10);
    expect(r.volume).toBe(36);
  });
});

describe("rightTriangleHypotenuse", () => {
  it("solves 3-4-5", () => {
    const r = rightTriangleHypotenuse(3, 4);
    expect(r.c).toBeCloseTo(5, 10);
    expect(r.area).toBeCloseTo(6, 10);
    expect(r.perimeter).toBeCloseTo(12, 10);
    expect(r.angleA).toBeCloseTo(36.8699, 3);
    expect(r.angleB).toBeCloseTo(53.1301, 3);
    // Angles must total 180 with the fixed right angle.
    expect(r.angleA + r.angleB + r.angleC).toBeCloseTo(180, 6);
  });

  it("classifies an isosceles right triangle", () => {
    expect(rightTriangleHypotenuse(5, 5).classification).toContain("Isosceles");
    expect(rightTriangleHypotenuse(3, 4).classification).toBe("Right Scalene");
  });

  it("produces consistent trigonometric ratios", () => {
    const r = rightTriangleHypotenuse(3, 4);
    expect(r.sinA ** 2 + r.cosA ** 2).toBeCloseTo(1, 10);
  });
});

describe("triangle solving", () => {
  it("solves SSS 3-4-5 and detects a right angle", () => {
    const r = triangleSSS(3, 4, 5);
    expect(r.valid).toBe(true);
    expect(r.area).toBeCloseTo(6, 10);
    expect(r.perimeter).toBe(12);
    expect(r.semiPerimeter).toBe(6);
    expect(r.angleA).toBeCloseTo(36.8699, 3);
    // The longest side is the hypotenuse, so the largest angle is 90 degrees.
    const largest = Math.max(r.angleA, r.angleB, r.angleC);
    expect(largest).toBeCloseTo(90, 3);
  });

  it("rejects a degenerate SSS triangle", () => {
    expect(triangleSSS(1, 2, 3).valid).toBe(false);
    expect(triangleSSS(0, 4, 5).valid).toBe(false);
  });

  it("classifies isosceles and equilateral triangles", () => {
    expect(triangleSSS(5, 5, 5).classification).toBe("Equilateral");
    expect(triangleSSS(5, 5, 6).classification).toBe("Isosceles");
    expect(triangleSSS(3, 4, 5).classification).toBe("Scalene");
  });

  it("solves SAS with a 60 degree included angle", () => {
    // a=b=1, C=60 gives an equilateral triangle.
    const r = triangleSAS(1, 1, 60);
    expect(r.valid).toBe(true);
    expect(r.c).toBeCloseTo(1, 6);
    expect(r.area).toBeCloseTo(Math.sqrt(3) / 4, 6);
    expect(r.angleA + r.angleB + r.angleC).toBeCloseTo(180, 6);
  });

  it("rejects SAS with an out-of-range angle", () => {
    expect(triangleSAS(1, 1, 0).valid).toBe(false);
    expect(triangleSAS(1, 1, 180).valid).toBe(false);
  });

  it("solves ASA", () => {
    // Side 5 with B=53.13 and C=36.87 is a 3-4-5 triangle.
    const r = triangleASA(5, 53.130102, 36.869898);
    expect(r.valid).toBe(true);
    expect(r.angleA).toBeCloseTo(90, 2);
    expect(r.perimeter).toBeCloseTo(12, 2);
  });

  it("rejects ASA when the angles cannot sum to 180", () => {
    expect(triangleASA(5, 100, 100).valid).toBe(false);
  });

  it("always sums angles to 180 across all three solvers", () => {
    for (const r of [triangleSSS(4, 5, 6), triangleSAS(3, 4, 50), triangleASA(6, 70, 40)]) {
      expect(r.angleA + r.angleB + r.angleC).toBeCloseTo(180, 6);
    }
  });

  it("computes equilateral triangle height", () => {
    const r = equilateralTriangle(2);
    expect(r.height).toBeCloseTo(Math.sqrt(3), 6);
    expect(r.area).toBeCloseTo(Math.sqrt(3), 6);
  });

  it("computes parallelogram diagonals that differ for non-right angles", () => {
    const r = parallelogramDiagonals(5, 4, 60);
    expect(r.d1).toBeGreaterThan(r.d2);
    // A 90 degree angle makes the parallelogram a rectangle.
    const rect = parallelogramDiagonals(3, 4, 90);
    expect(rect.d1).toBeCloseTo(5, 10);
    expect(rect.d2).toBeCloseTo(5, 10);
  });

  it("computes a regular hexagon from side length", () => {
    const r = polygonDiagonal(6, 1);
    expect(r.perimeter).toBe(6);
    // A regular hexagon's longest diagonal equals twice its side.
    expect(r.diagonal).toBeCloseTo(2, 6);
  });

  it("enforces a minimum of three sides", () => {
    expect(polygonDiagonal(1, 5).sides).toBe(3);
  });
});

describe("cat age", () => {
  it("uses 15 human years for the first cat year", () => {
    expect(catToHuman(0.5)).toBeCloseTo(7.5, 6);
    expect(catToHuman(1)).toBeCloseTo(15, 6);
  });

  it("uses +9 per year through the second year", () => {
    expect(catToHuman(2)).toBeCloseTo(24, 6);
  });

  it("uses +4 per year beyond two", () => {
    expect(catToHuman(3)).toBeCloseTo(28, 6);
    expect(catToHuman(10)).toBeCloseTo(56, 6);
  });

  it("maps life stages by age band", () => {
    expect(catLifeStage(0.5)).toBe("Kitten");
    expect(catLifeStage(1.5)).toBe("Junior");
    expect(catLifeStage(5)).toBe("Prime Adult");
    expect(catLifeStage(9)).toBe("Mature");
    expect(catLifeStage(12)).toBe("Senior");
    expect(catLifeStage(18)).toBe("Super Senior");
  });

  it("is monotonic across the piecewise boundaries", () => {
    let prev = -1;
    for (let a = 0; a <= 20; a += 0.5) {
      const h = catToHuman(a);
      expect(h).toBeGreaterThanOrEqual(prev);
      prev = h;
    }
  });

  it("reports the share of lifespan consumed", () => {
    const r = calculateCatAge(7.5, 15);
    expect(r.lifePercent).toBeCloseTo(50, 6);
    expect(r.humanYearsRemaining).toBeCloseTo(7.5, 6);
  });

  it("formats to one decimal or whole years", () => {
    expect(calculateCatAge(1.5, 15, "one").humanYearsLabel).toBe("19.5");
    expect(calculateCatAge(1.5, 15, "whole").humanYearsLabel).toBe("20");
  });
});

describe("duration", () => {
  it("breaks minutes into days, hours and seconds", () => {
    const b = breakDuration(510);
    expect(b.hours).toBe(8);
    expect(b.minutes).toBe(30);
    expect(b.decimalHours).toBeCloseTo(8.5, 6);
    expect(b.hms).toBe("08:30:00");
  });

  it("rolls over into days", () => {
    const b = breakDuration(60 * 24 + 90);
    expect(b.days).toBe(1);
    expect(b.hours).toBe(1);
    expect(b.minutes).toBe(30);
  });

  it("clamps negatives to zero", () => {
    expect(breakDuration(-50).totalMinutes).toBe(0);
  });

  it("parses time strings", () => {
    expect(parseTimeString("8:30")).toBeCloseTo(510, 6);
    expect(parseTimeString("2:00:00")).toBeCloseTo(120, 6);
    // A bare number is hours, so "10" is ten hours = 600 minutes.
    expect(parseTimeString("10")).toBeCloseTo(600, 6);
    expect(parseTimeString("8:75")).toBeNull();
    expect(parseTimeString("nonsense")).toBeNull();
  });
});

describe("concrete", () => {
  it("computes slab volume", () => {
    expect(concreteVolume({ shape: "slab", length: 5, width: 4, thickness: 0.15 })).toBeCloseTo(3, 6);
  });

  it("computes circular column volume", () => {
    const v = concreteVolume({ shape: "circle", diameter: 0.3, height: 3, quantity: 4 });
    expect(v).toBeCloseTo(Math.PI * 0.15 ** 2 * 3 * 4, 6);
  });

  it("computes wall volume", () => {
    expect(concreteVolume({ shape: "wall", length: 10, height: 3, thickness: 0.1 })).toBeCloseTo(3, 6);
  });

  it("computes staircase volume from treads and risers plus waist", () => {
    const v = concreteVolume({
      shape: "staircase", tread: 0.3, riser: 0.17, width: 1.2, quantity: 15, length: 4.5,
    });
    const steps = 0.5 * 0.3 * 0.17 * 1.2 * 15;
    const waist = 4.5 * 15 * 1.2 * 0.15;
    expect(v).toBeCloseTo(steps + waist, 6);
  });

  it("splits the mix ratio into material volumes that sum to the total", () => {
    const r = calculateConcrete({ shape: "slab", length: 5, width: 4, thickness: 0.15, grade: "M20" });
    const sum = r.cementWeight / 1440 + r.sandVolume + r.aggregateVolume;
    expect(sum).toBeCloseTo(r.requiredVolume, 1);
  });

  it("uses the documented M20 ratio of 1 : 1.5 : 3", () => {
    expect(calculateConcrete({ shape: "slab", length: 5, width: 4, thickness: 0.15, grade: "M20" }).mix)
      .toEqual([1, 1.5, 3]);
    expect(MIX_DATA.M25).toEqual([1, 1, 2]);
  });

  it("rounds cement up to whole bags", () => {
    const r = calculateConcrete({ shape: "slab", length: 5, width: 4, thickness: 0.15, grade: "M20" });
    expect(Number.isInteger(r.cementBags)).toBe(true);
  });

  it("applies the wastage allowance", () => {
    const base = calculateConcrete({ shape: "slab", length: 5, width: 4, thickness: 0.15, grade: "M20" });
    const withWaste = calculateConcrete({
      shape: "slab", length: 5, width: 4, thickness: 0.15, grade: "M20", wastagePercent: 10,
    });
    expect(withWaste.requiredVolume).toBeCloseTo(base.requiredVolume * 1.1, 2);
  });

  it("reports an error instead of dividing by zero on empty input", () => {
    const r = calculateConcrete({ shape: "slab", grade: "M20" });
    expect(r.error).toBeTruthy();
    expect(r.requiredVolume).toBe(0);
  });
});

