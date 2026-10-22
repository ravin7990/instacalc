import { CATEGORIES, type Category, type Unit } from "@/engines/units-data";

export { CATEGORIES };
export type { Category, Unit };

/**
 * Unit conversion engine: pure lookup + multiply, with temperature handled
 * separately because it is affine rather than a simple factor.
 */

export interface Conversion {
  from: Unit;
  to: Unit;
  category: Category;
  value: number;
  result: number;
}

/** alias -> owning category + unit. First registration wins on collisions. */
const ALIAS_INDEX = new Map<string, { cat: Category; unit: Unit }>();
for (const cat of CATEGORIES) {
  for (const unit of cat.units) {
    for (const a of unit.aliases) {
      if (!ALIAS_INDEX.has(a)) ALIAS_INDEX.set(a, { cat, unit });
    }
  }
}

function convertTemperature(value: number, from: Unit, to: Unit): number {
  const kelvin = from.id === "k" ? value : from.id === "c" ? value + 273.15 : ((value - 32) * 5) / 9 + 273.15;
  if (to.id === "k") return kelvin;
  if (to.id === "c") return kelvin - 273.15;
  return ((kelvin - 273.15) * 9) / 5 + 32;
}

export function convert(value: number, fromId: string, toId: string): Conversion | null {
  const from = ALIAS_INDEX.get(fromId.toLowerCase().trim());
  const to = ALIAS_INDEX.get(toId.toLowerCase().trim());
  if (!from || !to || from.cat.id !== to.cat.id) return null;

  const result =
    from.cat.id === "temperature"
      ? convertTemperature(value, from.unit, to.unit)
      : (value * from.unit.factor) / to.unit.factor;

  return { from: from.unit, to: to.unit, category: from.cat, value, result };
}

export interface ParsedConversion {
  value: number;
  from: string;
  to: string;
}

/**
 * Parses natural input such as "15 meter to foot" or "100 c to f".
 * Returns null when the phrase is not a recognisable conversion.
 */
export function parseConversion(input: string): ParsedConversion | null {
  const cleaned = input.trim().toLowerCase().replace(/,/g, "");
  const match = cleaned.match(
    /^(-?\d+(?:\.\d+)?)\s*([a-z]+(?:\^?\d)?)\s*(?:to|in|as|into|>|→)\s*([a-z]+(?:\^?\d)?)$/,
  );
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;
  return { value, from: match[2], to: match[3] };
}

export interface Suggestion {
  alias: string;
  category: Category;
  unit: Unit;
}

/** Prefix matches for the autocomplete list, shortest alias first. */
export function searchUnits(query: string, limit = 8): Suggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: Suggestion[] = [];
  for (const [alias, entry] of ALIAS_INDEX) {
    if (alias.startsWith(q)) out.push({ alias, category: entry.cat, unit: entry.unit });
  }
  out.sort((a, b) => a.alias.length - b.alias.length);
  return out.slice(0, limit);
}

/** Rounds to a sensible number of significant digits for display. */
export function formatResult(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-4 || abs >= 1e12)) return n.toExponential(4);
  return Number(n.toPrecision(8)).toLocaleString("en-US");
}
