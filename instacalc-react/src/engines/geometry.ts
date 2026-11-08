/**
 * Geometry engines — diagonals and triangle solving.
 * Formulas match the legacy pages exactly.
 */

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export interface DiagonalResult {
  diagonal: number;
  perimeter: number;
  area: number;
  formula: string;
}

/** Rectangle: d = √(l² + w²) */
export function rectangleDiagonal(length: number, width: number): DiagonalResult {
  return {
    diagonal: Math.hypot(length, width),
    perimeter: 2 * (length + width),
    area: length * width,
    formula: "d = √(l² + w²)",
  };
}

/** Square: d = s × √2 */
export function squareDiagonal(side: number): DiagonalResult {
  return {
    diagonal: side * Math.SQRT2,
    perimeter: 4 * side,
    area: side * side,
    formula: "d = s × √2",
  };
}

/** Right triangle: c = √(a² + b²) */
export function rightTriangleHypotenuse(a: number, b: number) {
  const c = Math.hypot(a, b);
  const angleA = toDeg(Math.atan(a / b));
  const angleB = 90 - angleA;
  return {
    c,
    area: 0.5 * a * b,
    perimeter: a + b + c,
    angleA,
    angleB,
    angleC: 90,
    sinA: a / c,
    cosA: b / c,
    tanA: a / b,
    classification: a === b ? "Right Isosceles (45°-45°-90°)" : "Right Scalene",
  };
}

export type LengthUnit = "cm" | "m" | "mm" | "inch" | "ft" | "yard";

export const LENGTH_UNIT_FACTORS: Record<LengthUnit, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  inch: 0.0254,
  ft: 0.3048,
  yard: 0.9144,
};

export function convertLength(value: number, from: LengthUnit, to: LengthUnit): number {
  if (from === to || value === 0 || !Number.isFinite(value)) return value;
  const inMeters = value * LENGTH_UNIT_FACTORS[from];
  return inMeters / LENGTH_UNIT_FACTORS[to];
}

export interface RightTriangleSolveInput {
  a?: number;
  b?: number;
  c?: number;
  angleY?: number; // Top apex angle opposite to Side B
  angleZ?: number; // Bottom-right base angle opposite to Side A
}

export interface RightTriangleSolveOutput {
  valid: boolean;
  a: number;
  b: number;
  c: number;
  angleX: number; // 90°
  angleY: number;
  angleZ: number;
  area: number;
  perimeter: number;
  sinY: number;
  cosY: number;
  tanY: number;
  sinZ: number;
  cosZ: number;
  tanZ: number;
  classification: string;
  solvedFrom: string;
  error?: string;
}

/**
 * Solves a right triangle from any 2 valid inputs:
 * Side A (vertical), Side B (horizontal base), Side C (hypotenuse),
 * Angle Y (top apex angle opposite to B), Angle Z (bottom-right base angle opposite to A).
 */
export function solveRightTriangle(inputs: RightTriangleSolveInput): RightTriangleSolveOutput {
  const { a, b, c, angleY, angleZ } = inputs;

  const hasA = typeof a === "number" && Number.isFinite(a) && a > 0;
  const hasB = typeof b === "number" && Number.isFinite(b) && b > 0;
  const hasC = typeof c === "number" && Number.isFinite(c) && c > 0;
  const hasY = typeof angleY === "number" && Number.isFinite(angleY) && angleY > 0 && angleY < 90;
  const hasZ = typeof angleZ === "number" && Number.isFinite(angleZ) && angleZ > 0 && angleZ < 90;

  const invalid = (error: string): RightTriangleSolveOutput => ({
    valid: false,
    a: a ?? 0,
    b: b ?? 0,
    c: c ?? 0,
    angleX: 90,
    angleY: angleY ?? 0,
    angleZ: angleZ ?? 0,
    area: 0,
    perimeter: 0,
    sinY: 0, cosY: 0, tanY: 0,
    sinZ: 0, cosZ: 0, tanZ: 0,
    classification: "Invalid",
    solvedFrom: "None",
    error,
  });

  let resA = 0;
  let resB = 0;
  let resC = 0;
  let resY = 0;
  let resZ = 0;
  let method = "";

  if (hasA && hasB) {
    resA = a!;
    resB = b!;
    resC = Math.hypot(resA, resB);
    resZ = toDeg(Math.atan(resA / resB));
    resY = 90 - resZ;
    method = "Legs A and B (Pythagorean theorem)";
  } else if (hasA && hasC) {
    if (c! <= a!) {
      return invalid("Hypotenuse C must be strictly greater than leg A.");
    }
    resA = a!;
    resC = c!;
    resB = Math.sqrt(resC * resC - resA * resA);
    resZ = toDeg(Math.asin(resA / resC));
    resY = 90 - resZ;
    method = "Leg A and Hypotenuse C";
  } else if (hasB && hasC) {
    if (c! <= b!) {
      return invalid("Hypotenuse C must be strictly greater than leg B.");
    }
    resB = b!;
    resC = c!;
    resA = Math.sqrt(resC * resC - resB * resB);
    resZ = toDeg(Math.acos(resB / resC));
    resY = 90 - resZ;
    method = "Leg B and Hypotenuse C";
  } else if (hasA && hasY) {
    resA = a!;
    resY = angleY!;
    resZ = 90 - resY;
    resB = resA * Math.tan(toRad(resY));
    resC = Math.hypot(resA, resB);
    method = "Leg A and Apex Angle Y";
  } else if (hasA && hasZ) {
    resA = a!;
    resZ = angleZ!;
    resY = 90 - resZ;
    resB = resA / Math.tan(toRad(resZ));
    resC = resA / Math.sin(toRad(resZ));
    method = "Leg A and Base Angle Z";
  } else if (hasB && hasY) {
    resB = b!;
    resY = angleY!;
    resZ = 90 - resY;
    resA = resB / Math.tan(toRad(resY));
    resC = resB / Math.sin(toRad(resY));
    method = "Leg B and Apex Angle Y";
  } else if (hasB && hasZ) {
    resB = b!;
    resZ = angleZ!;
    resY = 90 - resZ;
    resA = resB * Math.tan(toRad(resZ));
    resC = Math.hypot(resA, resB);
    method = "Leg B and Base Angle Z";
  } else if (hasC && hasY) {
    resC = c!;
    resY = angleY!;
    resZ = 90 - resY;
    resB = resC * Math.sin(toRad(resY));
    resA = resC * Math.cos(toRad(resY));
    method = "Hypotenuse C and Apex Angle Y";
  } else if (hasC && hasZ) {
    resC = c!;
    resZ = angleZ!;
    resY = 90 - resZ;
    resA = resC * Math.sin(toRad(resZ));
    resB = resC * Math.cos(toRad(resZ));
    method = "Hypotenuse C and Base Angle Z";
  } else if (hasY && hasZ) {
    return invalid("Please enter at least one side length (A, B, or C) to determine the triangle's scale.");
  } else {
    return invalid("Please enter any 2 values to calculate the triangle.");
  }

  const area = 0.5 * resA * resB;
  const perimeter = resA + resB + resC;
  const radY = toRad(resY);
  const radZ = toRad(resZ);

  return {
    valid: true,
    a: resA,
    b: resB,
    c: resC,
    angleX: 90,
    angleY: resY,
    angleZ: resZ,
    area,
    perimeter,
    sinY: Math.sin(radY),
    cosY: Math.cos(radY),
    tanY: Math.tan(radY),
    sinZ: Math.sin(radZ),
    cosZ: Math.cos(radZ),
    tanZ: Math.tan(radZ),
    classification: Math.abs(resA - resB) < 1e-4 ? "Right Isosceles (45°-45°-90°)" : "Right Scalene",
    solvedFrom: method,
  };
}


/** Box cuboid space diagonal: √(l² + w² + h²) */
export function cuboidDiagonal(length: number, width: number, height: number) {
  return {
    diagonal: Math.sqrt(length * length + width * width + height * height),
    faceArea: length * width,
    sideArea: width * height,
    topArea: length * height,
    volume: length * width * height,
    formula: "d = √(l² + w² + h²)",
  };
}

export interface TriangleResult {
  valid: boolean;
  a: number;
  b: number;
  c: number;
  area: number;
  perimeter: number;
  semiPerimeter: number;
  angleA: number;
  angleB: number;
  angleC: number;
  classification: string;
}

const classify = (a: number, b: number, c: number) => {
  if (a === b && b === c) return "Equilateral";
  if (a === b || b === c || a === c) return "Isosceles";
  return "Scalene";
};

/** Side-Side-Side via Heron's formula. */
export function triangleSSS(a: number, b: number, c: number): TriangleResult {
  if (a <= 0 || b <= 0 || c <= 0 || a + b <= c || a + c <= b || b + c <= a) {
    return {
      valid: false, a, b, c, area: 0, perimeter: 0, semiPerimeter: 0,
      angleA: 0, angleB: 0, angleC: 0, classification: "Invalid",
    };
  }
  const s = (a + b + c) / 2;
  const angleA = toDeg(Math.acos((b * b + c * c - a * a) / (2 * b * c)));
  const angleB = toDeg(Math.acos((a * a + c * c - b * b) / (2 * a * c)));
  return {
    valid: true, a, b, c,
    semiPerimeter: s,
    area: Math.sqrt(s * (s - a) * (s - b) * (s - c)),
    perimeter: a + b + c,
    angleA,
    angleB,
    angleC: 180 - angleA - angleB,
    classification: classify(a, b, c),
  };
}

/** Side-Angle-Side: law of cosines then law of sines. */
export function triangleSAS(a: number, b: number, angleC: number): TriangleResult {
  if (a <= 0 || b <= 0 || angleC <= 0 || angleC >= 180) {
    return {
      valid: false, a, b, c: 0, area: 0, perimeter: 0, semiPerimeter: 0,
      angleA: 0, angleB: 0, angleC, classification: "Invalid",
    };
  }
  const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(toRad(angleC)));
  const angleA = toDeg(Math.asin((a * Math.sin(toRad(angleC))) / c));
  const angleB = 180 - angleA - angleC;
  return {
    valid: true, a, b, c,
    semiPerimeter: (a + b + c) / 2,
    area: 0.5 * a * b * Math.sin(toRad(angleC)),
    perimeter: a + b + c,
    angleA,
    angleB,
    angleC,
    classification: classify(a, b, c),
  };
}

/** Angle-Side-Angle: SAS with the remaining angle derived first. */
export function triangleASA(a: number, angleB: number, angleC: number): TriangleResult {
  if (a <= 0 || angleB <= 0 || angleC <= 0 || angleB + angleC >= 180) {
    return {
      valid: false, a, b: 0, c: 0, area: 0, perimeter: 0, semiPerimeter: 0,
      angleA: 0, angleB, angleC, classification: "Invalid",
    };
  }
  const angleA = 180 - angleB - angleC;
  const sinA = Math.sin(toRad(angleA));
  const b = (a * Math.sin(toRad(angleB))) / sinA;
  const c = (a * Math.sin(toRad(angleC))) / sinA;
  return {
    valid: true, a, b, c,
    semiPerimeter: (a + b + c) / 2,
    area: 0.5 * b * c * Math.sin(toRad(angleA)),
    perimeter: a + b + c,
    angleA,
    angleB,
    angleC,
    classification: classify(a, b, c),
  };
}

/** Equilateral triangle: height = (√3 / 2) × s */
export function equilateralTriangle(side: number) {
  return {
    height: (Math.sqrt(3) / 2) * side,
    area: (Math.sqrt(3) / 4) * side * side,
    perimeter: 3 * side,
  };
}

/** Parallelogram: d = √(a² + b² ± 2ab·cos θ) */
export function parallelogramDiagonals(a: number, b: number, angleDeg: number) {
  const cos = Math.cos(toRad(angleDeg));
  return {
    d1: Math.sqrt(a * a + b * b + 2 * a * b * cos),
    d2: Math.sqrt(a * a + b * b - 2 * a * b * cos),
    area: a * b * Math.sin(toRad(angleDeg)),
  };
}

/**
 * Regular polygon: side, perimeter, area and the longest diagonal.
 * The longest diagonal spans (n - 2) / 2 triangle centres, which is what the
 * sine-ratio below encodes.
 */
export function polygonDiagonal(sides: number, sideLength: number) {
  const n = Math.max(3, Math.round(sides));
  // Circumradius from the chord formula: s = 2R·sin(π/n)
  const radius = sideLength / (2 * Math.sin(Math.PI / n));
  // Longest diagonal subtends (n-2)·π/n radians.
  const steps = Math.floor((n - 2) / 2) + 1;
  return {
    sides: n,
    radius,
    diagonal: 2 * radius * Math.sin((steps * Math.PI) / n),
    perimeter: n * sideLength,
    area: (n * sideLength * sideLength) / (4 * Math.tan(Math.PI / n)),
  };
}

export interface ObtuseTriangleResult {
  valid: boolean;
  h: number;
  c: number;
  w: number;
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  semiPerimeter: number;
  inradius: number;
  circumradius: number;
  classification: string;
}

/**
 * Obtuse triangle solved from height H, horizontal base C, and overhang/offset W.
 * Derives sides a and b from Pythagorean projections, and angles a, b, c via trigonometry.
 */
export function obtuseTriangleHCW(h: number, c: number, w: number): ObtuseTriangleResult {
  if (h <= 0 || c <= 0 || w < 0) {
    return {
      valid: false,
      h, c, w,
      sideA: 0, sideB: 0, sideC: c,
      angleA: 0, angleB: 0, angleC: 0,
      area: 0, perimeter: 0, semiPerimeter: 0,
      inradius: 0, circumradius: 0,
      classification: "Invalid",
    };
  }

  const sideB = Math.hypot(w, h);
  const sideA = Math.hypot(w + c, h);
  const sideC = c;

  const angleB = toDeg(Math.atan(h / (w + c)));
  const angleC = w === 0 ? 90 : 180 - toDeg(Math.atan(h / w));
  const angleA = Math.max(0, 180 - angleB - angleC);

  const area = 0.5 * c * h;
  const perimeter = sideA + sideB + sideC;
  const s = perimeter / 2;
  const inradius = area / s;
  const circumradius = (sideA * sideB * sideC) / (4 * area);

  return {
    valid: true,
    h, c, w,
    sideA,
    sideB,
    sideC,
    angleA,
    angleB,
    angleC,
    area,
    perimeter,
    semiPerimeter: s,
    inradius,
    circumradius,
    classification:
      angleC > 90
        ? Math.abs(sideB - sideC) < 1e-4
          ? "Obtuse Isosceles Triangle"
          : "Obtuse Scalene Triangle"
        : angleC === 90
        ? "Right-Angled Triangle"
        : "Acute Triangle",
  };
}

export interface ScaleneTriangleResult {
  valid: boolean;
  h: number;
  c: number;
  w: number;
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  semiPerimeter: number;
  inradius: number;
  circumradius: number;
  classification: string;
}

/**
 * Scalene triangle where apex projection falls inside the base (0 <= W <= C).
 * W is measured from left vertex to apex projection.
 */
export function scaleneTriangleHCW(h: number, c: number, w: number): ScaleneTriangleResult {
  if (h <= 0 || c <= 0 || w < 0 || w > c) {
    return {
      valid: false,
      h, c, w,
      sideA: 0, sideB: 0, sideC: c,
      angleA: 0, angleB: 0, angleC: 0,
      area: 0, perimeter: 0, semiPerimeter: 0,
      inradius: 0, circumradius: 0,
      classification: "Invalid",
    };
  }

  const sideB = Math.hypot(w, h);
  const sideA = Math.hypot(c - w, h);
  const sideC = c;

  const angleC = w === 0 ? 90 : toDeg(Math.atan(h / w));
  const angleB = c === w ? 90 : toDeg(Math.atan(h / (c - w)));
  const angleA = Math.max(0, 180 - angleB - angleC);

  const area = 0.5 * c * h;
  const perimeter = sideA + sideB + sideC;
  const s = perimeter / 2;
  const inradius = area / s;
  const circumradius = (sideA * sideB * sideC) / (4 * area);

  return {
    valid: true,
    h, c, w,
    sideA,
    sideB,
    sideC,
    angleA,
    angleB,
    angleC,
    area,
    perimeter,
    semiPerimeter: s,
    inradius,
    circumradius,
    classification:
      Math.abs(sideA - sideB) < 1e-4
        ? "Isosceles Triangle"
        : angleA > 90 || angleB > 90 || angleC > 90
        ? "Obtuse Scalene Triangle"
        : angleA === 90 || angleB === 90 || angleC === 90
        ? "Right-Angled Triangle"
        : "Acute Scalene Triangle",
  };
}

export interface IsoscelesTriangleResult {
  valid: boolean;
  h: number;
  c: number;
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  classification: string;
}

/**
 * Isosceles triangle solved from central height H and base C.
 * Apex is centered above the base (W = C / 2).
 */

export interface IsoscelesTriangleSolveInput {
  h?: number;          // Central height
  c?: number;          // Base length
  a?: number;          // Equal leg length
  angleA?: number;     // Apex angle in degrees (0 < angleA < 180)
  angleB?: number;     // Base angle in degrees (0 < angleB < 90)
}

export interface IsoscelesTriangleSolveOutput {
  valid: boolean;
  h: number;
  c: number;
  sideA: number;
  sideB: number;
  sideC: number;
  angleA: number;
  angleB: number;
  angleC: number;
  area: number;
  perimeter: number;
  classification: string;
  solvedFrom: string;
  error?: string;
}

/**
 * Solves an isosceles triangle from any 2 valid inputs:
 * Height (H), Base (C), Equal Leg (A), Apex Angle (a°), or Base Angle (b°).
 */
export function solveIsoscelesTriangle(inputs: IsoscelesTriangleSolveInput): IsoscelesTriangleSolveOutput {
  const { h, c, a, angleA, angleB } = inputs;

  const hasH = typeof h === "number" && Number.isFinite(h) && h > 0;
  const hasC = typeof c === "number" && Number.isFinite(c) && c > 0;
  const hasA = typeof a === "number" && Number.isFinite(a) && a > 0;
  const hasAngA = typeof angleA === "number" && Number.isFinite(angleA) && angleA > 0 && angleA < 180;
  const hasAngB = typeof angleB === "number" && Number.isFinite(angleB) && angleB > 0 && angleB < 90;

  const invalid = (error: string): IsoscelesTriangleSolveOutput => ({
    valid: false,
    h: h ?? 0,
    c: c ?? 0,
    sideA: a ?? 0,
    sideB: a ?? 0,
    sideC: c ?? 0,
    angleA: angleA ?? 0,
    angleB: angleB ?? 0,
    angleC: angleB ?? 0,
    area: 0,
    perimeter: 0,
    classification: "Invalid",
    solvedFrom: "None",
    error,
  });

  let resH = 0;
  let resC = 0;
  let resA = 0;
  let resAngA = 0;
  let resAngB = 0;
  let method = "";

  if (hasH && hasC) {
    resH = h!;
    resC = c!;
    resA = Math.hypot(resC / 2, resH);
    resAngB = toDeg(Math.atan((2 * resH) / resC));
    resAngA = 180 - 2 * resAngB;
    method = "Height (H) & Base (C)";
  } else if (hasA && hasC) {
    if (a! <= c! / 2) {
      return invalid("Equal leg A must be strictly greater than half of base C.");
    }
    resA = a!;
    resC = c!;
    resH = Math.sqrt(resA * resA - (resC / 2) * (resC / 2));
    resAngB = toDeg(Math.acos((resC / 2) / resA));
    resAngA = 180 - 2 * resAngB;
    method = "Equal Leg (A) & Base (C)";
  } else if (hasA && hasH) {
    if (a! <= h!) {
      return invalid("Equal leg A must be strictly greater than height H.");
    }
    resA = a!;
    resH = h!;
    resC = 2 * Math.sqrt(resA * resA - resH * resH);
    resAngB = toDeg(Math.asin(resH / resA));
    resAngA = 180 - 2 * resAngB;
    method = "Equal Leg (A) & Height (H)";
  } else if (hasC && hasAngB) {
    resC = c!;
    resAngB = angleB!;
    resAngA = 180 - 2 * resAngB;
    resH = (resC / 2) * Math.tan(toRad(resAngB));
    resA = (resC / 2) / Math.cos(toRad(resAngB));
    method = "Base (C) & Base Angle (B)";
  } else if (hasC && hasAngA) {
    resC = c!;
    resAngA = angleA!;
    resAngB = (180 - resAngA) / 2;
    resH = (resC / 2) * Math.tan(toRad(resAngB));
    resA = (resC / 2) / Math.cos(toRad(resAngB));
    method = "Base (C) & Apex Angle (A)";
  } else if (hasH && hasAngB) {
    resH = h!;
    resAngB = angleB!;
    resAngA = 180 - 2 * resAngB;
    resC = (2 * resH) / Math.tan(toRad(resAngB));
    resA = resH / Math.sin(toRad(resAngB));
    method = "Height (H) & Base Angle (B)";
  } else if (hasH && hasAngA) {
    resH = h!;
    resAngA = angleA!;
    resAngB = (180 - resAngA) / 2;
    resC = (2 * resH) / Math.tan(toRad(resAngB));
    resA = resH / Math.sin(toRad(resAngB));
    method = "Height (H) & Apex Angle (A)";
  } else if (hasA && hasAngB) {
    resA = a!;
    resAngB = angleB!;
    resAngA = 180 - 2 * resAngB;
    resH = resA * Math.sin(toRad(resAngB));
    resC = 2 * resA * Math.cos(toRad(resAngB));
    method = "Equal Leg (A) & Base Angle (B)";
  } else if (hasA && hasAngA) {
    resA = a!;
    resAngA = angleA!;
    resAngB = (180 - resAngA) / 2;
    resH = resA * Math.sin(toRad(resAngB));
    resC = 2 * resA * Math.cos(toRad(resAngB));
    method = "Equal Leg (A) & Apex Angle (A)";
  } else if (hasAngA && hasAngB) {
    return invalid("Please provide at least one length (H, C, or A) to determine the triangle's scale.");
  } else {
    return invalid("Please enter any 2 values to calculate the isosceles triangle.");
  }

  const area = 0.5 * resC * resH;
  const perimeter = 2 * resA + resC;

  return {
    valid: true,
    h: resH,
    c: resC,
    sideA: resA,
    sideB: resA,
    sideC: resC,
    angleA: resAngA,
    angleB: resAngB,
    angleC: resAngB,
    area,
    perimeter,
    classification:
      Math.abs(resAngA - 60) < 1e-3
        ? "Equilateral Triangle"
        : resAngA > 90
        ? "Obtuse Isosceles Triangle"
        : Math.abs(resAngA - 90) < 1e-3
        ? "Right Isosceles Triangle (45°-45°-90°)"
        : "Acute Isosceles Triangle",
    solvedFrom: method,
  };
}

export function isoscelesTriangleHC(h: number, c: number): IsoscelesTriangleResult {
  if (h <= 0 || c <= 0) {
    return {
      valid: false,
      h, c,
      sideA: 0, sideB: 0, sideC: c,
      angleA: 0, angleB: 0, angleC: 0,
      area: 0, perimeter: 0,
      classification: "Invalid",
    };
  }

  const leg = Math.hypot(c / 2, h);
  const baseAngle = toDeg(Math.atan((2 * h) / c));
  const apexAngle = 180 - 2 * baseAngle;

  return {
    valid: true,
    h, c,
    sideA: leg,
    sideB: leg,
    sideC: c,
    angleA: apexAngle,
    angleB: baseAngle,
    angleC: baseAngle,
    area: 0.5 * c * h,
    perimeter: 2 * leg + c,
    classification:
      apexAngle === 60
        ? "Equilateral Triangle"
        : apexAngle > 90
        ? "Obtuse Isosceles Triangle"
        : apexAngle === 90
        ? "Right Isosceles Triangle"
        : "Acute Isosceles Triangle",
  };
}

export interface RightTrapezoidResult {
  valid: boolean;
  h: number;
  cTop: number;
  cBot: number;
  slant: number;
  taperAngle: number;
  area: number;
  perimeter: number;
}

/**
 * Right trapezoid / taper / wedge: height H, top base, bottom base.
 */
export function rightTrapezoid(h: number, cTop: number, cBot: number): RightTrapezoidResult {
  if (h <= 0 || cTop <= 0 || cBot <= 0) {
    return {
      valid: false,
      h, cTop, cBot,
      slant: 0, taperAngle: 0, area: 0, perimeter: 0,
    };
  }

  const diff = Math.abs(cBot - cTop);
  const slant = Math.hypot(diff, h);
  const taperAngle = toDeg(Math.atan(diff / h));
  const area = 0.5 * (cTop + cBot) * h;
  const perimeter = h + cTop + cBot + slant;

  return {
    valid: true,
    h, cTop, cBot,
    slant,
    taperAngle,
    area,
    perimeter,
  };
}

