/**
 * Concrete estimator — volume by shape, then materials from the mix ratio.
 * Shapes and ratios match the legacy calculator.
 */

export type ConcreteShape = "slab" | "column" | "beam" | "footing" | "staircase" | "circle" | "wall";

/** Cement : sand : aggregate parts, keyed by grade. */
export const MIX_DATA: Record<string, [number, number, number]> = {
  M5: [1, 5, 10],
  // Quoted: a dotted grade cannot be a bare object key.
  "M7.5": [1, 4, 8],
  M10: [1, 3, 6],
  M15: [1, 2, 4],
  M20: [1, 1.5, 3],
  M25: [1, 1, 2],
};

/** Density factors used to convert mix volumes into weights. */
const CEMENT_BAG_KG = 50;
const DENSITY = { cement: 1440, sand: 1600, aggregate: 1600 } as const;

export interface ConcreteInputs {
  shape: ConcreteShape;
  /** All dimensions in metres. */
  length?: number;
  width?: number;
  thickness?: number;
  height?: number;
  depth?: number;
  diameter?: number;
  quantity?: number;
  /** Staircase only. */
  tread?: number;
  riser?: number;
  grade: string;
  /** Custom mix ratio, used when grade === "custom". */
  ratioCement?: number;
  ratioSand?: number;
  ratioAggregate?: number;
  /** Extra material allowance, e.g. 5 for 5%. */
  wastagePercent?: number;
}

export interface ConcreteResult {
  wetVolume: number;
  /** Volume including the wastage allowance, in m³. */
  requiredVolume: number;
  cementBags: number;
  cementWeight: number;
  sandVolume: number;
  sandWeight: number;
  aggregateVolume: number;
  aggregateWeight: number;
  mix: [number, number, number];
  /** Set when the shape cannot be computed from the given dimensions. */
  error?: string;
}

/**
 * Wet volume in m³ for the selected shape.
 * Staircase follows the legacy model: half the tread-riser block per step plus
 * a waist slab of 15% of the total going.
 */
export function concreteVolume(i: ConcreteInputs): number {
  const num = (v: number | undefined) => (Number.isFinite(v) ? (v as number) : 0);
  const qty = num(i.quantity) || 1;

  switch (i.shape) {
    case "slab":
      return num(i.length) * num(i.width) * num(i.thickness);
    case "column":
    case "beam":
    case "footing":
      return num(i.length) * num(i.width) * num(i.depth ?? i.height) * qty;
    case "staircase": {
      const steps = 0.5 * num(i.tread) * num(i.riser) * num(i.width) * num(i.quantity);
      const waist = num(i.length) * num(i.quantity) * num(i.width) * 0.15;
      return steps + waist;
    }
    case "circle":
      return Math.PI * Math.pow(num(i.diameter) / 2, 2) * num(i.height) * qty;
    case "wall":
      return num(i.length) * num(i.height) * num(i.thickness);
    default:
      return 0;
  }
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function calculateConcrete(i: ConcreteInputs): ConcreteResult {
  const wet = concreteVolume(i);

  if (wet <= 0) {
    return {
      wetVolume: 0, requiredVolume: 0, cementBags: 0, cementWeight: 0,
      sandVolume: 0, sandWeight: 0, aggregateVolume: 0, aggregateWeight: 0,
      mix: MIX_DATA.M20, error: "Enter positive dimensions to calculate the mix.",
    };
  }

  const mix: [number, number, number] =
    i.grade === "custom"
      ? [i.ratioCement || 1, i.ratioSand ?? 1.5, i.ratioAggregate ?? 3]
      : (MIX_DATA[i.grade] ?? MIX_DATA.M20);

  // Dry volume is conventionally taken as 1.54× the wet volume.
  const dryVolume = wet * 1.54;
  const wastage = 1 + (i.wastagePercent ?? 0) / 100;
  const total = dryVolume * wastage;

  const parts = mix[0] + mix[1] + mix[2];
  const cementVolume = (total * mix[0]) / parts;
  const sandVolume = (total * mix[1]) / parts;
  const aggregateVolume = (total * mix[2]) / parts;

  return {
    wetVolume: round2(wet),
    requiredVolume: round2(total),
    cementBags: Math.ceil((cementVolume * DENSITY.cement) / CEMENT_BAG_KG),
    cementWeight: round2(cementVolume * DENSITY.cement),
    sandVolume: round2(sandVolume),
    sandWeight: round2(sandVolume * DENSITY.sand),
    aggregateVolume: round2(aggregateVolume),
    aggregateWeight: round2(aggregateVolume * DENSITY.aggregate),
    mix,
  };
}
