/**
 * fix-hindi-faqs.mjs
 * Replaces the 12 pages containing legacy Hindi FAQs in src/data/seo.generated.json
 * with comprehensive, professional English FAQs tailored for Indian users.
 * Also adds 10 FAQs for the root homepage (index.html).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEO_PATH = join(__dirname, "..", "src", "data", "seo.generated.json");

const seoData = JSON.parse(readFileSync(SEO_PATH, "utf8"));

const FAQ_REPLACEMENTS = {
  "duration/agecalculator.html": [
    {
      q: "How do I calculate my exact age from date of birth?",
      a: "To calculate your exact age, subtract your birth date from today's date (or a specific reference date). Adjust for leap years and different month lengths. Our online age calculator computes your exact age in years, months, days, hours, and minutes instantly."
    },
    {
      q: "How is age calculated for government job eligibility in India?",
      a: "For Indian government job exams (like UPSC, SSC CGL, Railways, IBPS Banking), eligibility is determined by your age on a specific cutoff date stated in the official exam notification. Enter your date of birth and set the target date to the notification's cutoff date."
    },
    {
      q: "What is the chronological age calculation formula?",
      a: "The chronological age formula is: Age = Target Date - Date of Birth. Subtract years, months, and days separately. If target days are fewer than birth days, borrow days from the preceding month; if target months are fewer than birth months, borrow 12 months from the target year."
    },
    {
      q: "What is the minimum age for school admission in India under RTE and NEP 2020?",
      a: "Under the Right to Education (RTE) Act and National Education Policy (NEP) guidelines in India, the mandated minimum age for admission to Class 1 is 6 years as of the designated cut-off date (usually 31 March or 1 June) of the academic year."
    },
    {
      q: "What is the retirement age for government employees in India?",
      a: "Central government employees in India generally retire at age 60. For EPF pension withdrawal, the eligibility age is 58 years, while NPS subscribers can access their superannuation corpus from age 60."
    },
    {
      q: "What is the minimum age for obtaining a driving licence in India?",
      a: "Under the Indian Motor Vehicles Act, a person can obtain a learner's licence for a gearless two-wheeler (up to 50cc) at age 16 with parental consent. For all other motor vehicles, including cars and geared motorcycles, the minimum age is 18 years."
    },
    {
      q: "At what age does someone qualify as a Senior Citizen for Income Tax in India?",
      a: "Under the Indian Income Tax Act, an individual resident who is 60 years or older during the relevant financial year is classified as a Senior Citizen. Individuals who are 80 years or older are classified as Super Senior Citizens."
    },
    {
      q: "What is the legal voting age in India?",
      a: "The minimum voting age in India is 18 years as of the qualifying date prescribed by the Election Commission of India, enacted under the 61st Constitutional Amendment Act."
    },
    {
      q: "How does a leap year affect exact age calculation?",
      a: "A leap year adds an extra day (February 29), making the year 366 days long. For individuals born on February 29, exact age in non-leap years is legally counted from March 1 or February 28 depending on administrative guidelines."
    },
    {
      q: "Is my date of birth data private and safe on InstaCalc?",
      a: "Yes, completely. All age calculations execute entirely in your web browser using client-side JavaScript. No dates of birth or personal information are sent to or stored on our servers."
    }
  ],

  "moretools/concretecalculator.html": [
    {
      q: "How do I calculate concrete volume for a slab, column, or footing?",
      a: "Calculate the geometric volume: Length × Width × Thickness (in meters) gives cubic meters (m³). For cylinders or circular columns, use π × radius² × height. Always convert all dimensions to the same unit before multiplying."
    },
    {
      q: "What is the 1.54 dry volume factor in concrete calculations?",
      a: "Dry concrete ingredients (cement, sand, stone aggregates) contain roughly 54% air voids. When water is added, the mix compresses. Therefore, 1 m³ of wet finished concrete requires approximately 1.54 m³ of dry materials."
    },
    {
      q: "What are the standard concrete grade mix ratios under IS 456 in India?",
      a: "Common nominal mixes under Indian Standard IS 456 include: M15 (1:2:4 for plain cement concrete), M20 (1:1.5:3 for standard residential slabs, beams, and columns), and M25 (1:1:2 for heavy structural foundations)."
    },
    {
      q: "How many 50 kg cement bags are required for 1 cubic meter of M20 concrete?",
      a: "For M20 grade concrete (1:1.5:3 ratio), 1 cubic meter requires approximately 8.2 bags of 50 kg cement, along with 0.42 m³ of sand and 0.84 m³ of coarse aggregate."
    },
    {
      q: "What is the standard weight and volume of a cement bag in India?",
      a: "In India, standard commercial cement bags (ACC, UltraTech, Ambuja) weigh exactly 50 kg. One 50 kg bag corresponds to approximately 0.035 m³ or 1.25 cubic feet (cft) of cement."
    },
    {
      q: "How do I convert concrete volume to brass in Indian construction?",
      a: "In Indian construction and civil engineering, 1 brass equals 100 cubic feet (cft), which is approximately equal to 2.8317 cubic meters (m³). A 10 m³ concrete pour equals roughly 3.53 brass."
    },
    {
      q: "What is the recommended concrete slab thickness for residential houses?",
      a: "Standard residential roof and floor slabs in India are typically 100 mm to 125 mm (4 to 5 inches) thick. Car parking slabs and driveways usually require 150 mm (6 inches) with reinforced steel rebar mesh."
    },
    {
      q: "How much extra concrete buffer should I order for wastage?",
      a: "Contractors recommend adding a 5% to 10% wastage margin over the theoretical volume. This compensates for uneven ground subgrades, spillage, pump line residue, and formwork deflection."
    },
    {
      q: "What is the recommended water-cement ratio for concrete mixing?",
      a: "The ideal water-cement ratio by weight is between 0.45 and 0.50. This means each 50 kg cement bag requires approximately 23 to 25 liters of clean water. Excessive water weakens compressive strength, while too little causes honeycombing."
    },
    {
      q: "What is the required curing period for concrete in India?",
      a: "Concrete should be continuously cured with water for at least 7 to 14 days (or 21 days for mineral admixtures). Concrete achieves approximately 65% of its strength in 7 days and its full characteristic strength in 28 days."
    }
  ],

  "moretools/diagonalcalculator.html": [
    {
      q: "How is the diagonal of a rectangle calculated?",
      a: "The diagonal is calculated using the Pythagorean theorem: d = √(length² + width²). For example, a rectangle 3 meters long by 4 meters wide has a diagonal of √(3² + 4²) = √(9 + 16) = √25 = 5 meters."
    },
    {
      q: "What is the 3-4-5 rule used by builders and carpenters?",
      a: "The 3-4-5 rule is a practical construction technique to ensure perfect 90-degree right angles. Measure 3 units along one side and 4 units along the perpendicular side. If the diagonal between these marks is exactly 5 units, the corner is perfectly square."
    },
    {
      q: "How do I check if a room or window frame is square?",
      a: "Measure both opposite diagonals from corner to corner. If both diagonal measurements are identical in length, the room or frame is perfectly rectangular with 90-degree corners. Any discrepancy indicates out-of-square walls."
    },
    {
      q: "How is the diagonal of a television or monitor screen measured?",
      a: "Television screen sizes refer strictly to the viewable panel diagonal from top corner to opposite bottom corner, excluding outer bezels and frames. A 55-inch 16:9 TV screen has a display width of ~47.9 inches and height of ~27 inches."
    },
    {
      q: "What is the diagonal formula for a square?",
      a: "The diagonal of a square with side length s is: d = s × √2 (approximately s × 1.4142). For example, a 10 cm square has a diagonal of roughly 14.14 cm."
    },
    {
      q: "How do I calculate the longest object that fits inside a 3D box or room?",
      a: "Use the space diagonal (cuboid diagonal) formula: d = √(length² + width² + height²). This determines whether long items like pipes, poles, or furniture will fit inside a shipping container or room."
    },
    {
      q: "How many diagonals does a polygon have?",
      a: "The total number of diagonals in an n-sided polygon is given by the formula: n × (n - 3) / 2. A quadrilateral (4 sides) has 2 diagonals, a pentagon (5 sides) has 5, and a hexagon (6 sides) has 9 diagonals."
    },
    {
      q: "Why does a triangle have zero diagonals?",
      a: "By definition, a diagonal connects two non-adjacent vertices. Because all three vertices of a triangle are adjacent to one another, a triangle cannot have any diagonals."
    },
    {
      q: "How is the diagonal of a cube calculated?",
      a: "The space diagonal of a cube with side length s is: d = s × √3 (approximately s × 1.732). A 2-meter cube has an internal corner-to-corner diagonal of 3.464 meters."
    },
    {
      q: "Why is cross-measuring diagonals important in tile laying and flooring?",
      a: "Cross-measuring diagonals before fixing floor tiles ensures that reference grid lines are square. If layout diagonals differ, tiles will drift askew, resulting in unsightly wedge cuts along skirting boards."
    }
  ],

  "moretools/trignometrycalculator.html": [
    {
      q: "What do Sine, Cosine, and Tangent represent in a right triangle?",
      a: "Sine (sin) is the ratio of the Opposite side to the Hypotenuse; Cosine (cos) is the ratio of the Adjacent side to the Hypotenuse; Tangent (tan) is the ratio of the Opposite side to the Adjacent side."
    },
    {
      q: "What does the SOH-CAH-TOA mnemonic stand for?",
      a: "SOH-CAH-TOA is a memory aid: SOH = Sine is Opposite over Hypotenuse; CAH = Cosine is Adjacent over Hypotenuse; TOA = Tangent is Opposite over Adjacent."
    },
    {
      q: "What is the fundamental Pythagorean trigonometric identity?",
      a: "The fundamental trigonometric identity is: sin²(θ) + cos²(θ) = 1. This relationship holds true for any real angle θ and forms the basis of analytical trigonometry."
    },
    {
      q: "How do I convert between degrees and radians?",
      a: "To convert degrees to radians, multiply by π / 180 (180° = π radians). To convert radians to degrees, multiply by 180 / π (1 radian ≈ 57.2958°)."
    },
    {
      q: "What are the exact trigonometric values for 30°, 45°, and 60°?",
      a: "sin 30° = 0.5, sin 45° = 1/√2 (≈0.707), sin 60° = √3/2 (≈0.866). cos 30° = √3/2, cos 45° = 1/√2, cos 60° = 0.5. tan 30° = 1/√3 (≈0.577), tan 45° = 1, tan 60° = √3 (≈1.732)."
    },
    {
      q: "What is the difference between a trig function and an inverse trig function?",
      a: "A trigonometric function takes an angle and outputs a ratio of sides. An inverse trigonometric function (arcsin, arccos, arctan) takes a ratio of sides and calculates the corresponding angle in degrees or radians."
    },
    {
      q: "How do civil engineers and surveyors in India use trigonometry?",
      a: "Surveyors use trigonometry to determine elevations, heights of towers, road gradients, and distances across rivers using total stations and theodolites via triangulation and triangulation levelling."
    },
    {
      q: "How is the hypotenuse calculated if only two sides are known?",
      a: "Using the Pythagorean theorem: Hypotenuse c = √(a² + b²), where a and b are the lengths of the two perpendicular legs."
    },
    {
      q: "What are the reciprocal trigonometric functions?",
      a: "The three reciprocal functions are: Cosecant (csc θ = 1/sin θ), Secant (sec θ = 1/cos θ), and Cotangent (cot θ = 1/tan θ)."
    },
    {
      q: "How does the Law of Sines and Law of Cosines work for non-right triangles?",
      a: "The Law of Sines states: a/sin(A) = b/sin(B) = c/sin(C). The Law of Cosines states: c² = a² + b² - 2ab·cos(C). These laws allow you to solve any triangle when given combinations of sides and angles."
    }
  ],

  "duration/birthdaycalculator.html": [
    {
      q: "How does the birthday calculator determine exact age and next birthday?",
      a: "The calculator compares your date of birth against the current date, computing elapsed complete years, months, and days, while simultaneously finding the day count remaining until your next birthday anniversary."
    },
    {
      q: "How are leap year birthdays handled for babies born on February 29?",
      a: "For individuals born on leap day (February 29), non-leap year birthdays are traditionally observed on March 1 (or February 28 in certain legal jurisdictions). Our tool calculates the precise 365 or 366-day cycle."
    },
    {
      q: "Can this calculator determine which day of the week I was born on?",
      a: "Yes. By analyzing the Gregorian calendar day index from your birth date, the tool identifies whether you were born on a Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, or Sunday."
    },
    {
      q: "How many total days and hours have passed since my birth?",
      a: "The calculator converts your chronological age into aggregate units, displaying the total number of days, hours, minutes, and approximate heartbeats elapsed since birth."
    },
    {
      q: "What are significant milestone birthdays celebrated in India?",
      a: "Key milestone birthdays include the 1st birthday, 18th (legal adulthood and voting rights), 21st, 25th (silver jubilee), 50th (golden jubilee), 60th (Shashti Poorthi / Senior Citizen status), and 75th (Amrit Mahotsav)."
    },
    {
      q: "What is a half-birthday and how is it calculated?",
      a: "A half-birthday occurs exactly 6 months after your birthday. For instance, if you were born on January 15, your half-birthday falls on July 15."
    },
    {
      q: "Can I find the exact age difference between two people?",
      a: "Yes, by comparing two birth dates, the tool computes the exact difference in years, months, and days between siblings, spouses, or business partners."
    },
    {
      q: "Why can birthday age calculations differ across international time zones?",
      a: "Because the local midnight rollover differs around the globe, an individual born at 2:00 AM IST on October 15 was technically born on October 14 in UTC/US time zones."
    },
    {
      q: "How many days until my next birthday?",
      a: "The calculator checks today's date against your upcoming birthday in the current or next calendar year, providing a real-time countdown in days and hours."
    },
    {
      q: "Is my birthdate information secure on InstaCalc?",
      a: "Yes. All computations run in-memory within your browser. No birthdate records or user telemetry are stored on our servers."
    }
  ],

  "duration/dayscalculator.html": [
    {
      q: "How does the days calculator count days between two dates?",
      a: "The calculator counts the exact number of calendar days between your specified start date and end date, taking full account of leap years and variable month lengths."
    },
    {
      q: "What is the difference between inclusive and exclusive date counting?",
      a: "Exclusive counting calculates End Date minus Start Date. Inclusive counting adds 1 day so that both the starting date and ending date are counted as full days."
    },
    {
      q: "How are business days (working days) calculated?",
      a: "Business day calculation excludes weekend days (Saturdays and Sundays) and statutory public holidays, showing the net working days available for project execution."
    },
    {
      q: "How do leap years affect day count calculations?",
      a: "A leap year adds February 29 (366 days instead of 365). The tool automatically verifies whether the evaluated date span intersects a leap year."
    },
    {
      q: "How do I calculate notice period days for employment resignation in India?",
      a: "Select your resignation date as the start date and add your contractual notice period (e.g. 30, 60, or 90 days) to identify your official last working day."
    },
    {
      q: "How are interest days calculated for banking loans and deposits?",
      a: "Indian banks calculate interest on a daily product basis using the actual/365 convention: Daily Interest = Principal × Rate / (365 × 100)."
    },
    {
      q: "How many days are in a standard year versus a leap year?",
      a: "A standard Gregorian year has 365 days (52 weeks and 1 day). A leap year has 366 days (52 weeks and 2 days)."
    },
    {
      q: "Can I add or subtract a specific number of days from a date?",
      a: "Yes, you can input a starting date and add or subtract any number of days to find the resulting calendar date instantly."
    },
    {
      q: "How do I count days remaining until an exam or tax filing deadline?",
      a: "Set the start date to today and the target date to the exam date (e.g. UPSC Prelims, CA Final, or July 31 ITR deadline) to see the exact remaining preparation days."
    },
    {
      q: "How are court and legal limitation periods calculated in days in India?",
      a: "Under the Indian Limitation Act, the day from which the period begins is excluded, and if the court is closed on the final day, the act may be done on the reopening day."
    }
  ],

  "duration/hourcalculator.html": [
    {
      q: "How do you convert minutes into decimal hours for payroll?",
      a: "Divide the minute count by 60. For example, 45 minutes ÷ 60 = 0.75 hours. Therefore, 8 hours and 45 minutes equals 8.75 decimal hours."
    },
    {
      q: "How do I calculate work hours for night shifts crossing midnight?",
      a: "When a work shift starts in the evening and ends the next morning (e.g. 10:00 PM to 6:00 AM), the calculator adds 24 hours to the end time before subtracting, yielding 8 hours."
    },
    {
      q: "Can I deduct unpaid lunch and meal breaks from total shift hours?",
      a: "Yes. Subtract the break duration (e.g. 30 or 60 minutes) from total elapsed hours between clock-in and clock-out to determine net payable hours."
    },
    {
      q: "How is overtime pay calculated from total hours?",
      a: "Under Section 59 of the Indian Factories Act, any work exceeding 9 hours in a day or 48 hours in a week must be compensated at double the normal wage rate."
    },
    {
      q: "How many working hours are in a standard Indian 48-hour work week?",
      a: "A standard 48-hour work week consists of 6 working days of 8 hours each, or 5 working days of roughly 9.6 hours each."
    },
    {
      q: "How do I add or subtract hours and minutes from a start time?",
      a: "Enter your starting time and input the hours and minutes to add or subtract. The tool automatically rolls forward or backward across AM/PM and calendar days."
    },
    {
      q: "What is the decimal equivalent of 15, 30, and 45 minutes?",
      a: "15 minutes = 0.25 hours; 30 minutes = 0.50 hours; 45 minutes = 0.75 hours. 10 minutes equals 0.167 hours."
    },
    {
      q: "How do I calculate total billable hours for client invoicing?",
      a: "Multiply total decimal hours worked by your agreed hourly billing rate. For example, 37.5 hours at ₹1,500/hour = ₹56,250."
    },
    {
      q: "Can I sum up cumulative work hours across a weekly or monthly timesheet?",
      a: "Yes. Enter daily start and end times to calculate total accumulated work hours, regular hours, and overtime hours across the pay period."
    },
    {
      q: "How does 24-hour military time conversion work?",
      a: "In 24-hour time, hours after 12:00 PM have 12 added (e.g. 1:00 PM = 13:00, 11:30 PM = 23:30). Midnight is represented as 00:00."
    }
  ],

  "duration/juliandatecalculator.html": [
    {
      q: "What is a Julian Date and how does it work?",
      a: "The Julian Date (JD) is a continuous count of days and fractions of days elapsed since the beginning of the Julian Period on January 1, 4713 BCE at 12:00 PM (noon) UTC."
    },
    {
      q: "Why do astronomers and space scientists use Julian Dates?",
      a: "Because standard calendar months and years have irregular lengths, computing time between astronomical events is complicated. Julian Dates provide a uniform, continuous decimal counter that eliminates calendar irregularities."
    },
    {
      q: "How do food manufacturers in India use 5-digit Julian dates for batch coding?",
      a: "In manufacturing and packaging, an ordinal date format (often called Julian date) uses 5 digits: the first 2 digits represent the year (e.g. 26 for 2026) and the last 3 digits represent the day of the year (001 to 365/366). For example, 26032 is February 1, 2026."
    },
    {
      q: "What is the Modified Julian Date (MJD)?",
      a: "The Modified Julian Date is defined as MJD = JD - 2400000.5. It shifts the epoch to midnight on November 17, 1858, reducing the number of digits and aligning day boundaries with civil midnight."
    },
    {
      q: "Why does the astronomical Julian Day start at noon instead of midnight?",
      a: "Astronomer John Herschel adopted noon boundaries so that an astronomer's entire nighttime observing session falls within a single Julian day, avoiding an inconvenient date rollover at midnight."
    },
    {
      q: "How do I convert a Gregorian calendar date to a Julian Date?",
      a: "Input the year, month, day, and time into our calculator. The algorithm computes the JDN using standard astronomical formulas that adjust for leap centuries."
    },
    {
      q: "What is Unix timestamp compared to Julian Date?",
      a: "A Unix timestamp counts seconds elapsed since January 1, 1970 00:00:00 UTC. The Julian Date for the Unix epoch is exactly JD 2440587.5."
    },
    {
      q: "How is Julian Date used in satellite tracking and GPS systems?",
      a: "Satellite orbital ephemeris models (such as NORAD SGP4/SDP4) require continuous time coordinates in Julian Days to compute celestial positions without calendar anomalies."
    },
    {
      q: "When did the British Empire and India switch from Julian to Gregorian calendar?",
      a: "The British Calendar Act of 1750 adopted the Gregorian calendar in September 1752, omitting 11 days so that September 2 was immediately followed by September 14."
    },
    {
      q: "Can this calculator convert Julian dates back into normal Gregorian dates?",
      a: "Yes. Enter any Julian Day Number or manufacturing ordinal date, and the calculator converts it to the exact year, month, day, and time."
    }
  ],

  "duration/minutes-hourscalculator.html": [
    {
      q: "How do I convert minutes into hours and minutes format?",
      a: "Divide the total minutes by 60. The integer quotient represents the hours, and the remainder represents the minutes. For example, 145 minutes = 2 hours (120 min) and 25 minutes."
    },
    {
      q: "How do I convert minutes into decimal hours?",
      a: "Divide the number of minutes by 60. For example, 90 minutes ÷ 60 = 1.5 hours; 45 minutes ÷ 60 = 0.75 hours; 20 minutes ÷ 60 = 0.333 hours."
    },
    {
      q: "Why is 30 minutes equal to 0.5 hours and not 0.3 hours?",
      a: "Because an hour contains 60 minutes, not 100. 30 minutes is 30/60 of an hour, which simplifies to 1/2 or 0.5 decimal hours."
    },
    {
      q: "What is the formula to convert minutes to hours?",
      a: "Hours = Minutes ÷ 60. To convert hours back to minutes, multiply: Minutes = Hours × 60."
    },
    {
      q: "How many minutes are in an 8-hour workday?",
      a: "An 8-hour workday contains 8 × 60 = 480 minutes. A standard 9-hour workday with a 1-hour lunch break contains 540 total elapsed minutes."
    },
    {
      q: "How do I convert decimal hours back into minutes?",
      a: "Multiply the decimal fraction by 60. For instance, in 4.4 hours, take 0.4 × 60 = 24 minutes, giving 4 hours and 24 minutes."
    },
    {
      q: "What is the 100th-of-an-hour payroll system?",
      a: "Many payroll and HR software systems track time in hundredths of an hour (two decimal places). 6 minutes = 0.10 hr, 12 minutes = 0.20 hr, 18 minutes = 0.30 hr, up to 60 minutes = 1.00 hr."
    },
    {
      q: "How many minutes are in a full day and a week?",
      a: "A 24-hour day has 1,440 minutes (24 × 60). A 7-day week contains 10,080 minutes (7 × 1,440)."
    },
    {
      q: "Can this calculator handle large numbers of minutes?",
      a: "Yes. You can enter values like 50,000 minutes to determine the exact breakdown into days, hours, and remaining minutes."
    },
    {
      q: "How do flight travel times and layover minutes get summed?",
      a: "Input the duration of each flight segment and airport layover in minutes; the calculator totals them and outputs the final flight itinerary time in hours and minutes."
    }
  ],

  "duration/timedurationcalculator.html": [
    {
      q: "How do you calculate exact elapsed time between two timestamps?",
      a: "Subtract the start timestamp from the end timestamp. If start is 09:15 AM and end is 05:45 PM, the elapsed duration is 8 hours and 30 minutes."
    },
    {
      q: "Can I calculate time duration that spans across midnight into the next day?",
      a: "Yes. When the end time is earlier in the clock cycle than the start time (e.g. 10:30 PM to 06:15 AM), the calculator automatically accounts for the overnight rollover, returning 7 hours and 45 minutes."
    },
    {
      q: "How do I add or subtract a specific duration from a given time?",
      a: "Enter your initial time and specify the hours, minutes, and seconds to add or subtract. The tool calculates the resulting arrival or completion time."
    },
    {
      q: "Does this time duration calculator handle 12-hour AM/PM and 24-hour military formats?",
      a: "Yes. You can input times using standard 12-hour AM/PM notation or 24-hour military time (00:00 to 23:59)."
    },
    {
      q: "How is elapsed time converted into total seconds and decimal hours?",
      a: "The calculator provides instant conversions: Total Seconds = (Hours × 3600) + (Minutes × 60) + Seconds; Decimal Hours = Hours + (Minutes / 60) + (Seconds / 3600)."
    },
    {
      q: "How do runners and athletes calculate pace and race splits?",
      a: "Divide total running duration by distance covered. For example, running 10 km in 50 minutes equals a pace of 5 minutes per kilometer."
    },
    {
      q: "Can this tool calculate total travel time including layovers?",
      a: "Yes. Add departure and arrival times across each journey leg to find total travel duration, in-transit hours, and ground waiting periods."
    },
    {
      q: "How do video and audio creators calculate total runtime?",
      a: "Add the durations of individual scene cuts or audio tracks to verify that the final media compilation matches platform length constraints."
    },
    {
      q: "Does time duration calculation get affected by Daylight Saving Time?",
      a: "For clock-to-clock durations within the same day, local clock differences apply. For historical cross-date calculations in DST regions, 1 hour may be gained or lost on transition days."
    },
    {
      q: "Can I export or copy the duration summary?",
      a: "Yes, click the Copy button next to the calculated outcome to copy the duration breakdown to your clipboard."
    }
  ],

  "duration/timezonecalculator.html": [
    {
      q: "Why does Indian Standard Time (IST) have a 30-minute offset (UTC+5:30)?",
      a: "India chose UTC+5:30 based on the 82.5° East longitude meridian passing through Mirzapur near Prayagraj (Allahabad), which lies midway between the nation's eastern and western extremities."
    },
    {
      q: "Does India observe Daylight Saving Time (DST)?",
      a: "No, India does not observe Daylight Saving Time. Indian Standard Time remains constant at UTC+5:30 throughout the entire year."
    },
    {
      q: "What is the time difference between India (IST) and the US Eastern Time (EST/EDT)?",
      a: "During Eastern Standard Time (winter), India is 10 hours and 30 minutes ahead of New York. During Eastern Daylight Time (summer), India is 9 hours and 30 minutes ahead."
    },
    {
      q: "What is the time difference between India (IST) and the United Kingdom (GMT/BST)?",
      a: "During Greenwich Mean Time (winter), India is 5 hours and 30 minutes ahead of London. During British Summer Time (BST), the difference is 4 hours and 30 minutes."
    },
    {
      q: "What is the time difference between India (IST) and Dubai (GST)?",
      a: "Dubai follows Gulf Standard Time (UTC+4:00). India (UTC+5:30) is always exactly 1 hour and 30 minutes ahead of Dubai."
    },
    {
      q: "How do I schedule an international business meeting across multiple time zones?",
      a: "Use our timezone converter to align working windows. For India and US East Coast teams, 6:00 PM to 8:30 PM IST corresponds to 8:30 AM to 11:00 AM EDT, providing optimal overlap."
    },
    {
      q: "What is Coordinated Universal Time (UTC) and how does it relate to GMT?",
      a: "UTC is the primary atomic time standard by which the world regulates clocks. GMT is an older solar time standard based at the Royal Observatory in Greenwich. In practice, UTC and GMT share the same clock time."
    },
    {
      q: "What is the International Date Line and how does crossing it affect calendar dates?",
      a: "The International Date Line roughly follows the 180° meridian in the Pacific Ocean. Crossing it westward advances your calendar by one full day; crossing eastward sets your calendar back by one day."
    },
    {
      q: "What is the time difference between India and Singapore / Malaysia (SGT)?",
      a: "Singapore and Malaysia observe UTC+8:00. Singapore is always exactly 2 hours and 30 minutes ahead of India."
    },
    {
      q: "How do airline flight tickets display departure and arrival times across time zones?",
      a: "Aviation schedules universally display departure and arrival times in the local time of each specific airport. To calculate flight duration, both times must be converted to a common reference like UTC."
    }
  ],

  "duration/weekcalculator.html": [
    {
      q: "How many weeks and remaining days are between two dates?",
      a: "The calculator computes total elapsed calendar days and divides by 7: the integer quotient gives complete weeks, and the remainder gives extra days (e.g. 45 days = 6 weeks and 3 days)."
    },
    {
      q: "What is the ISO 8601 week date standard?",
      a: "Under the international ISO 8601 standard, Monday is the first day of the week, and Week 1 of the year is the week containing the first Thursday of January (or the week containing January 4)."
    },
    {
      q: "How many weeks are in a standard year and a leap year?",
      a: "A standard calendar year of 365 days has 52 weeks and 1 day. A leap year of 366 days has 52 weeks and 2 days."
    },
    {
      q: "How do software development teams use sprint weeks to track milestones?",
      a: "Agile teams commonly plan work in 2-week iterations (sprints). The week calculator helps product managers count business days and planning intervals across sprint quarters."
    },
    {
      q: "How is pregnancy gestation calculated in weeks?",
      a: "Obstetricians calculate pregnancy gestational age in weeks from the first day of the mother's Last Menstrual Period (LMP). Full-term pregnancy averages 40 weeks (280 days)."
    },
    {
      q: "What are the three trimesters of pregnancy in weeks?",
      a: "The first trimester spans Week 1 through Week 12; the second trimester spans Week 13 through Week 27; the third trimester spans Week 28 through delivery (approx. Week 40)."
    },
    {
      q: "How do I convert weeks into total days, business days, and hours?",
      a: "Multiply weeks by 7 to get calendar days, by 5 for standard business days, and by 168 (7 × 24) to get total hours."
    },
    {
      q: "Why do some calendar years have 53 ISO weeks instead of 52?",
      a: "Because 52 weeks equal only 364 days, the extra 1 or 2 days accumulate every 5 to 6 years, resulting in a year with 53 ISO weeks."
    },
    {
      q: "How do fortnightly and bi-weekly pay schedules work in India?",
      a: "A fortnight represents exactly 14 consecutive days (2 weeks). Companies on bi-weekly payrolls distribute 26 salary payments across a 52-week calendar year."
    },
    {
      q: "How do I calculate how many weeks remain until an exam date or vacation?",
      a: "Enter today's date as the start date and your target exam or vacation date as the end date. The tool instantly displays the countdown in weeks and days."
    }
  ],

  "index.html": [
    {
      q: "What is InstaCalc.in?",
      a: "InstaCalc.in is a high-speed, client-side suite of online calculators and unit converters designed for financial planning, construction and geometry estimates, and date/time calculations in India and internationally."
    },
    {
      q: "Are the calculators on InstaCalc free to use?",
      a: "Yes, 100% free with no registration, subscription, or paywalls. All tools are accessible immediately on desktop, tablet, and mobile browsers."
    },
    {
      q: "Does InstaCalc store or share my personal or financial data?",
      a: "No. All calculations run strictly in your web browser using client-side JavaScript. No salaries, loan amounts, bank deposit figures, or dates of birth are uploaded to or stored on our servers."
    },
    {
      q: "Are the financial tools compliant with Indian tax and banking standards?",
      a: "Yes. Our calculators incorporate Indian financial regulations, including RBI banking guidelines, Section 80C tax deduction limits, current EPFO interest rates, and Indian GST tax slabs."
    },
    {
      q: "What construction and civil engineering tools are available?",
      a: "We provide concrete volume and material estimators (cement bags, sand, aggregate under IS 456), diagonal squareness checkers (3-4-5 rule), right-angle trigonometry solvers, and liquid unit converters."
    },
    {
      q: "Can I use InstaCalc to compare home loan and car loan EMIs?",
      a: "Yes. The EMI calculator generates monthly and yearly amortization schedules, showing principal repayment, interest cost, and the interest-saving impact of prepayments."
    },
    {
      q: "How accurate are the SIP and mutual fund investment calculators?",
      a: "The calculators use standard mathematical compound interest and XIRR algorithms. They accurately illustrate potential wealth accumulation based on your assumed rates of return."
    },
    {
      q: "Does InstaCalc support international editions?",
      a: "Yes. In addition to our Indian English edition, InstaCalc provides dedicated regional editions for the United States, Japan, South Korea, and Russia with localized currencies and tax regulations."
    },
    {
      q: "Can I use InstaCalc offline without an active internet connection?",
      a: "Yes. Once the web application loads, core calculation scripts are cached by your browser, allowing you to perform calculations even in low or no-connectivity environments."
    },
    {
      q: "How can I copy or share my calculation results?",
      a: "Every calculator features an instant Copy button next to the primary result, enabling you to copy key figures and schedules directly into WhatsApp, email, or spreadsheets."
    }
  ]
};

let updatedCount = 0;

for (const [pagePath, faqs] of Object.entries(FAQ_REPLACEMENTS)) {
  const page = seoData.pages[pagePath];
  if (!page) {
    console.warn(`Page not found in seo.generated.json: ${pagePath}`);
    continue;
  }

  // Find or create FAQPage JSON-LD
  let faqJsonLd = page.jsonLd?.find((j) => j && j["@type"] === "FAQPage");
  if (!faqJsonLd) {
    faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: []
    };
    if (!page.jsonLd) page.jsonLd = [];
    page.jsonLd.push(faqJsonLd);
  }

  faqJsonLd.mainEntity = faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a
    }
  }));

  updatedCount++;
  console.log(`Updated FAQs for: ${pagePath} (${faqs.length} FAQs)`);
}

writeFileSync(SEO_PATH, JSON.stringify(seoData, null, 2), "utf8");
console.log(`\nSuccessfully updated ${updatedCount} pages in ${SEO_PATH}!`);
