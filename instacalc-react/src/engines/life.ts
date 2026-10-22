/**
 * Cat age conversion — piecewise, matching the legacy calculator exactly:
 *   0-1 yr   -> 15 human-years per cat-year
 *   1-2 yrs  -> 15 + 9 per additional year
 *   2+ yrs   -> 24 + 4 per additional year
 */
export interface CatAgeResult {
  catYears: number;
  humanYears: number;
  humanYearsLabel: string;
  lifeStage: string;
  /** Share of the typical lifespan consumed, 0-100. */
  lifePercent: number;
  humanYearsRemaining: number;
}

export function catToHuman(catYears: number): number {
  if (catYears <= 0) return 0;
  if (catYears <= 1) return catYears * 15;
  if (catYears <= 2) return 15 + (catYears - 1) * 9;
  return 24 + (catYears - 2) * 4;
}

export function catLifeStage(catYears: number): string {
  if (catYears < 1) return "Kitten";
  if (catYears < 2) return "Junior";
  if (catYears < 7) return "Prime Adult";
  if (catYears < 11) return "Mature";
  if (catYears < 15) return "Senior";
  return "Super Senior";
}

export function calculateCatAge(
  catYears: number,
  lifeExpectancy = 15,
  rounding: "one" | "whole" = "one",
): CatAgeResult {
  const human = catToHuman(catYears);
  const label = rounding === "whole" ? String(Math.round(human)) : human.toFixed(1);
  const humanYearsRemaining = Math.max(0, lifeExpectancy - catYears);
  return {
    catYears,
    humanYears: human,
    humanYearsLabel: label,
    lifeStage: catLifeStage(catYears),
    lifePercent: lifeExpectancy > 0 ? Math.min(100, (catYears / lifeExpectancy) * 100) : 0,
    humanYearsRemaining,
  };
}

/** Year-by-year conversion table for the projection chart. */
export function catAgeProjection(catYears: number) {
  const maxYear = Math.max(1, Math.ceil(catYears));
  const rows: Array<{ catAge: number; humanAge: number; stage: string }> = [];
  for (let year = 1; year <= maxYear; year++) {
    rows.push({ catAge: year, humanAge: catToHuman(year), stage: catLifeStage(year) });
  }
  return rows;
}

/**
 * Time arithmetic: breaks a total number of minutes into days/hours/minutes/
 * seconds and back into decimal hours. Powers the hours and time-duration tools.
 */
export interface DurationBreakdown {
  totalMinutes: number;
  totalHours: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  decimalHours: number;
  /** "HH:MM:SS" form. */
  hms: string;
}

export function breakDuration(totalMinutes: number): DurationBreakdown {
  const safe = Math.max(0, totalMinutes);
  const totalSeconds = Math.round(safe * 60);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    totalMinutes: safe,
    totalHours: safe / 60,
    days,
    hours,
    minutes,
    seconds,
    decimalHours: safe / 60,
    hms: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
}

/** Converts an "HH:MM" / "HH:MM:SS" string to minutes. Returns null if invalid. */
export function parseTimeString(input: string): number | null {
  const m = input.trim().match(/^(\d{1,3})(?::(\d{1,2}))?(?::(\d{1,2}))?$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2] ?? 0);
  const sec = Number(m[3] ?? 0);
  if (min > 59 || sec > 59) return null;
  return h * 60 + min + sec / 60;
}
