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
