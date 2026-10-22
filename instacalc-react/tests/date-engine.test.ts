import { describe, expect, it } from "vitest";
import {
  calculateAge,
  isoWeek,
  weeksBetween,
  daysBetween,
  businessDaysBetween,
  addToDate,
  addWeeks,
  daysInMonth,
  toIsoDate,
} from "@/engines/dates";

/** Builds a local-time date, avoiding UTC off-by-one surprises in tests. */
const d = (y: number, m: number, day: number, h = 0) => new Date(y, m - 1, day, h);

describe("calculateAge", () => {
  it("computes a whole-year birthday exactly", () => {
    const r = calculateAge(d(1990, 6, 15), d(2026, 6, 15));
    expect(r.years).toBe(36);
    expect(r.months).toBe(0);
    expect(r.days).toBe(0);
    expect(r.label).toBe("36 Years, 0 Months, 0 Days");
  });

  it("borrows the previous month when the day has not been reached", () => {
    // 15 Mar 2026 -> 10 Jan 2026 is 35 years, 9 months, 26 days:
    // Jan has 31 days, so 10 - 15 = -5 -> borrow 31 -> 26 days, month -1.
    const r = calculateAge(d(1990, 3, 15), d(2026, 1, 10));
    expect(r.years).toBe(35);
    expect(r.months).toBe(9);
    expect(r.days).toBe(26);
  });

  it("rolls the year back when the month goes negative", () => {
    const r = calculateAge(d(2000, 12, 25), d(2025, 2, 25));
    expect(r.years).toBe(24);
    expect(r.months).toBe(2);
    expect(r.days).toBe(0);
  });

  it("handles a leap-day birthday", () => {
    // 29 Feb 2000 -> 28 Feb 2026 is 25 years, 11 months, 30 days.
    const r = calculateAge(d(2000, 2, 29), d(2026, 2, 28));
    expect(r.years).toBe(25);
    expect(r.months).toBe(11);
    expect(r.days).toBe(30);
  });

  it("counts total days, weeks and hours", () => {
    const r = calculateAge(d(2026, 1, 1), d(2026, 1, 11));
    expect(r.totalDays).toBe(10);
    expect(r.totalWeeks).toBe(1);
    expect(r.totalHours).toBe(240);
  });

  it("reports zero rather than negatives for a future birth date", () => {
    const r = calculateAge(d(2030, 1, 1), d(2026, 1, 1));
    expect(r.totalDays).toBe(0);
    expect(r.years).toBe(0);
  });

  it("counts days to the next birthday", () => {
    expect(calculateAge(d(1990, 12, 25), d(2026, 12, 20)).daysToNextBirthday).toBe(5);
    expect(calculateAge(d(1990, 6, 15), d(2026, 6, 15)).daysToNextBirthday).toBe(0);
  });

  it("rolls the next birthday to next year once it has passed", () => {
    const r = calculateAge(d(1990, 6, 15), d(2026, 7, 1));
    expect(r.daysToNextBirthday).toBe(349);
    expect(r.nextBirthday.getFullYear()).toBe(2027);
  });

  it("maps birthstones and zodiac signs by month", () => {
    expect(calculateAge(d(2000, 1, 15), d(2026, 1, 1)).birthstone).toBe("Garnet");
    expect(calculateAge(d(2000, 8, 15), d(2026, 1, 1)).zodiac).toBe("Leo");
    expect(calculateAge(d(2000, 1, 5), d(2026, 1, 1)).zodiac).toBe("Capricorn");
  });

  it("counts leap years using the Gregorian rule", () => {
    // 2004..2026 inclusive: 2004,08,12,16,20,24 = 6 (1900-style centuries excluded).
    expect(calculateAge(d(2003, 1, 1), d(2026, 1, 1)).leapYears).toBe(6);
  });
});

describe("isoWeek", () => {
  it("matches known ISO week numbers", () => {
    expect(isoWeek(d(2026, 1, 1)).week).toBe(1);
    // 2024-12-30 is a Monday, always ISO week 1 of the next year.
    const r = isoWeek(d(2024, 12, 30));
    expect(r.week).toBe(1);
    expect(r.year).toBe(2025);
  });

  it("reports mid-year weeks", () => {
    expect(isoWeek(d(2026, 6, 15)).week).toBe(25);
  });
});

describe("date arithmetic", () => {
  it("counts days between dates ignoring time of day", () => {
    expect(daysBetween(d(2026, 1, 1), d(2026, 1, 31))).toBe(30);
    expect(daysBetween(d(2026, 1, 31), d(2026, 1, 1))).toBe(-30);
  });

  it("counts business days across a full week", () => {
    // Mon 6 Jul -> Fri 10 Jul 2026 is 5 weekdays.
    expect(businessDaysBetween(d(2026, 7, 6), d(2026, 7, 10))).toBe(5);
    // Mon -> Sun is 5 weekdays out of 7 days.
    expect(businessDaysBetween(d(2026, 7, 6), d(2026, 7, 12))).toBe(5);
  });

  it("counts weeks between dates", () => {
    expect(weeksBetween(d(2026, 1, 1), d(2026, 2, 1))).toBe(4);
    expect(weeksBetween(d(2026, 2, 1), d(2026, 1, 1))).toBe(-4);
  });

  it("adds weeks", () => {
    expect(toIsoDate(addWeeks(d(2026, 1, 1), 2))).toBe("2026-01-15");
  });

  it("clamps month overflow instead of rolling into the next month", () => {
    // 31 Jan + 1 month must be 28 Feb 2026, not 3 Mar.
    expect(toIsoDate(addToDate(d(2026, 1, 31), { months: 1 }))).toBe("2026-02-28");
    // In a leap year it clamps to the 29th instead.
    expect(toIsoDate(addToDate(d(2028, 1, 31), { months: 1 }))).toBe("2028-02-29");
  });

  it("adds days, months and years together", () => {
    expect(toIsoDate(addToDate(d(2026, 1, 31), { days: 1 }))).toBe("2026-02-01");
    expect(toIsoDate(addToDate(d(2026, 1, 15), { years: 1 }))).toBe("2027-01-15");
  });

  it("knows month lengths including leap years", () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2028, 1)).toBe(29);
    expect(daysInMonth(2026, 0)).toBe(31);
  });
});
