/**
 * Date and time engines.
 *
 * All calculations use local-time `Date` components rather than UTC, because
 * the legacy pages did the same and users expect calendar dates, not instants.
 * Day counts therefore follow the legacy behaviour exactly.
 */

export const MS_PER_DAY = 86_400_000;
export const MS_PER_HOUR = 3_600_000;
export const MS_PER_MIN = 60_000;

/** Whole days in a month; month is 0-indexed to match Date. */
export function daysInMonth(year: number, month0: number): number {
  return new Date(year, month0 + 1, 0).getDate();
}

export interface AgeParts {
  years: number;
  months: number;
  days: number;
  totalMonths: number;
  totalWeeks: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}

export interface AgeResult extends AgeParts {
  /** e.g. "12 Years, 3 Months, 4 Days" */
  label: string;
  weekday: string;
  daysToNextBirthday: number;
  nextBirthday: Date;
  zodiac: string;
  birthstone: string;
  leapYears: number;
}

const BIRTHSTONES = [
  "Garnet", "Amethyst", "Aquamarine", "Diamond", "Emerald", "Pearl",
  "Ruby", "Peridot", "Sapphire", "Opal", "Topaz", "Turquoise",
];

/**
 * Western zodiac cutoffs: [sign, last day of month, month index].
 * Ordered so the first match wins, mirroring the legacy lookup.
 */
const ZODIAC: Array<[string, number, number]> = [
  ["Capricorn", 20, 0], ["Aquarius", 19, 1], ["Pisces", 20, 2], ["Aries", 20, 3],
  ["Taurus", 21, 4], ["Gemini", 21, 5], ["Cancer", 23, 6], ["Leo", 23, 7],
  ["Virgo", 23, 8], ["Libra", 23, 9], ["Scorpio", 22, 10], ["Sagittarius", 22, 11],
  ["Capricorn", 31, 11],
];

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Exact age from a birth date, matching the legacy algorithm: borrow the
 * previous month's length when the day-of-month has not yet been reached.
 */
export function calculateAge(dob: Date, target: Date): AgeResult {
  const rawMs = target.getTime() - dob.getTime();
  // A birth date in the future means "not born yet": every figure is zero.
  const notBorn = rawMs < 0;
  const diffMs = Math.max(0, rawMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  const totalWeeks = Math.floor(totalDays / 7);

  let years = target.getFullYear() - dob.getFullYear();
  let months = target.getMonth() - dob.getMonth();
  let days = target.getDate() - dob.getDate();

  if (days < 0) {
    months -= 1;
    // Borrow the length of the month before the target date.
    days += daysInMonth(target.getFullYear(), target.getMonth() - 1);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (notBorn) {
    years = 0;
    months = 0;
    days = 0;
  }

  let nextBirthday = new Date(target.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBirthday.getTime() < target.getTime()) {
    nextBirthday = new Date(target.getFullYear() + 1, dob.getMonth(), dob.getDate());
  }

  let zodiac = "Capricorn";
  for (const [sign, lastDay, month] of ZODIAC) {
    if (dob.getMonth() < month || (dob.getMonth() === month && dob.getDate() <= lastDay)) {
      zodiac = sign;
      break;
    }
  }

  return {
    years,
    months,
    days,
    totalMonths: years * 12 + months,
    totalWeeks,
    totalDays,
    totalHours,
    totalMinutes,
    totalSeconds,
    label: `${years} Years, ${months} Months, ${days} Days`,
    weekday: WEEKDAYS[dob.getDay()],
    daysToNextBirthday: Math.ceil((nextBirthday.getTime() - target.getTime()) / MS_PER_DAY),
    nextBirthday,
    zodiac,
    birthstone: BIRTHSTONES[dob.getMonth()] ?? "—",
    leapYears: countLeapYears(dob, target),
  };
}

/** Leap years after the birth year up to and including the target year. */
function countLeapYears(dob: Date, target: Date): number {
  const start = dob.getFullYear() + 1;
  const end = target.getFullYear();
  if (end < start) return 0;
  let n = 0;
  for (let y = start; y <= end; y++) {
    if ((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) n++;
  }
  return n;
}

/** ISO 8601 week number and week-based year. */
export function isoWeek(date: Date): { week: number; year: number } {
  // The Thursday of the current week determines the ISO year.
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / MS_PER_DAY + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

/** Whole weeks between two dates (signed). */
export function weeksBetween(a: Date, b: Date): number {
  const from = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const to = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.trunc((to - from) / (7 * MS_PER_DAY));
}

/** Adds (or subtracts) whole weeks, returning a new date. */
export function addWeeks(date: Date, weeks: number): Date {
  const out = new Date(date.getTime());
  out.setDate(out.getDate() + weeks * 7);
  return out;
}

/** Calendar days between two dates, ignoring time-of-day. */
export function daysBetween(a: Date, b: Date): number {
  const from = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const to = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((to - from) / MS_PER_DAY);
}

/** Weekdays (Mon-Fri) in the inclusive range. */
export function businessDaysBetween(a: Date, b: Date): number {
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  const step = start <= end ? 1 : -1;
  let count = 0;
  for (let t = start; step > 0 ? t <= end : t >= end; t += step * MS_PER_DAY) {
    const dow = new Date(t).getUTCDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

/** Adds (or subtracts) days/months/years, returning a new date. */
export function addToDate(date: Date, { days = 0, months = 0, years = 0 }): Date {
  const out = new Date(date.getTime());
  const targetDay = out.getDate();
  out.setDate(1);
  out.setMonth(out.getMonth() + months);
  out.setFullYear(out.getFullYear() + years);
  // Clamp so 31 Jan + 1 month lands on 28/29 Feb rather than overflowing.
  out.setDate(Math.min(targetDay, daysInMonth(out.getFullYear(), out.getMonth())));
  out.setDate(out.getDate() + days);
  return out;
}

/** ISO date string (YYYY-MM-DD) for <input type="date">. */
export function toIsoDate(date: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/* -------------------------------------------------------------- Birthday */

export interface BirthdayResult {
  age: number;
  daysToNext: number;
  nextBirthday: Date;
  /** Day of the week the person was born. */
  bornWeekday: string;
  weekday: string;
  /** Whole days since birth. */
  daysLived: number;
  /** Age at the halfway point of life expectancy, for the "half birthday". */
  halfLifeDays: number;
}

/** Counts down to the next birthday and reports the milestone details. */
export function birthdayInfo(dob: Date, target: Date): BirthdayResult {
  const age = calculateAge(dob, target);
  const daysToNext = age.daysToNextBirthday;
  const halfLifeDays = Math.round(age.totalDays / 2);

  const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    age: age.years,
    daysToNext,
    nextBirthday: age.nextBirthday,
    bornWeekday: WEEKDAY[dob.getDay()],
    weekday: WEEKDAY[age.nextBirthday.getDay()],
    daysLived: age.totalDays,
    halfLifeDays,
  };
}

/* --------------------------------------------------------- Julian dates */

export interface JulianResult {
  /** Astronomical Julian Day. */
  julianDay: number;
  /** Modified Julian Day. */
  modifiedJulianDay: number;
  /** Integer Julian Day Number. */
  julianDayNumber: number;
  /** Rata Die / ordinal day within the year. */
  dayOfYear: number;
}

/**
 * Gregorian calendar to Julian Day.
 * The standard Meeus algorithm, valid for all dates the site deals with.
 */
export function toJulianDay(date: Date): JulianResult {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  const d = date.getDate();

  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  // Gregorian correction: drop the Julian leap year for dates after 1582-10-15.
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;

  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear =
    Math.floor((date.getTime() - start.getTime()) / MS_PER_DAY) + 1;

  return {
    julianDay: Math.round(jd * 100) / 100,
    modifiedJulianDay: Math.round((jd - 2400000.5) * 100) / 100,
    julianDayNumber: Math.floor(jd + 0.5),
    dayOfYear,
  };
}

/** Julian Day back to a calendar date. */
export function fromJulianDay(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const dd = Math.floor(365.25 * c);
  const e = Math.floor((b - dd) / 30.6001);

  const day = b - dd - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  return new Date(year, month - 1, Math.floor(day));
}

/**
 * Converts a wall-clock time in one IANA time zone to another.
 * Uses Intl so it honours real daylight-saving rules.
 */
export function convertTimeZone(
  date: Date,
  fromZone: string,
  toZone: string,
): { iso: string; display: string } {
  const iso = new Date(date.toLocaleString("en-US", { timeZone: fromZone })).toISOString();
  const display = new Intl.DateTimeFormat("en-US", {
    timeZone: toZone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
  return { iso, display };
}

