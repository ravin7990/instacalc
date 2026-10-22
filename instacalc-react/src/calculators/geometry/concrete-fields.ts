import type { FieldSpec } from "@/components/calculator/CalculatorField";
import type { ConcreteShape } from "@/engines/concrete";
import type { GeoCopy } from "@/i18n/geometry-labels";

/** Default dimensions, in metres, matching the legacy calculator's defaults. */
export const CONCRETE_DEFAULTS: Record<string, number> = {
  length: 5,
  width: 4,
  thickness: 0.15,
  height: 3,
  depth: 0.45,
  diameter: 0.3,
  quantity: 1,
  tread: 0.3,
  riser: 0.17,
};

/**
 * Builds the input fields for a shape. Each shape exposes different
 * dimensions, so the form is derived rather than fixed.
 */
export function concreteFields(shape: ConcreteShape, v: Record<string, number>, c: GeoCopy): FieldSpec[] {
  switch (shape) {
    case "slab":
      return [
        { key: "length", label: c.length, value: v.length, min: 0.1, max: 100, step: 0.1 },
        { key: "width", label: c.width, value: v.width, min: 0.1, max: 100, step: 0.1 },
        { key: "thickness", label: c.thickness, value: v.thickness, min: 0.05, max: 1, step: 0.025 },
      ];
    case "wall":
      return [
        { key: "length", label: c.length, value: v.length, min: 0.1, max: 200, step: 0.1 },
        { key: "height", label: c.height, value: v.height, min: 0.1, max: 50, step: 0.1 },
        { key: "thickness", label: c.thickness, value: v.thickness, min: 0.05, max: 1, step: 0.025 },
      ];
    case "staircase":
      return [
        { key: "tread", label: c.tread, value: v.tread, min: 0.1, max: 1, step: 0.01 },
        { key: "riser", label: c.riser, value: v.riser, min: 0.1, max: 1, step: 0.01 },
        { key: "width", label: c.width, value: v.width, min: 0.5, max: 5, step: 0.05 },
        { key: "length", label: c.length, value: v.length, min: 0.5, max: 20, step: 0.1 },
        { key: "quantity", label: c.quantity, value: v.quantity, min: 1, max: 100, step: 1 },
      ];
    case "circle":
      return [
        { key: "diameter", label: c.diameter, value: v.diameter, min: 0.05, max: 5, step: 0.025 },
        { key: "height", label: c.height, value: v.height, min: 0.1, max: 20, step: 0.1 },
        { key: "quantity", label: c.quantity, value: v.quantity, min: 1, max: 200, step: 1 },
      ];
    default:
      // column, beam and footing all share a length x width x depth x quantity form.
      return [
        { key: "length", label: c.length, value: v.length, min: 0.1, max: 50, step: 0.05 },
        { key: "width", label: c.width, value: v.width, min: 0.1, max: 50, step: 0.025 },
        { key: "depth", label: c.height, value: v.depth, min: 0.1, max: 5, step: 0.025 },
        { key: "quantity", label: c.quantity, value: v.quantity, min: 1, max: 200, step: 1 },
      ];
  }
}
