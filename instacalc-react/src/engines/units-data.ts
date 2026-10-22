/**
 * Unit conversion tables.
 *
 * Categories are plain data so adding a unit is a one-line change, and
 * conversion reduces to a factor multiply. Aliases feed the natural-language
 * parser ("15 meter to foot") and the autocomplete list.
 */

export interface Unit {
  id: string;
  /** Names the parser accepts, lowercase. */
  aliases: string[];
  /** Multiplier into the category's base unit. */
  factor: number;
}

export interface Category {
  id: string;
  name: string;
  base: string;
  units: Unit[];
}

const u = (id: string, factor: number, ...aliases: string[]): Unit => ({ id, aliases: [id, ...aliases], factor });

export const CATEGORIES: Category[] = [
  {
    id: "length",
    name: "Length",
    base: "m",
    units: [
      u("mm", 0.001, "millimeter", "millimeters", "millimetre", "millimetres"),
      u("cm", 0.01, "centimeter", "centimeters", "centimetre", "centimetres"),
      u("m", 1, "meter", "meters", "metre", "metres"),
      u("km", 1000, "kilometer", "kilometers", "kilometre", "kilometres"),
      u("in", 0.0254, "inch", "inches"),
      u("ft", 0.3048, "foot", "feet"),
      u("yd", 0.9144, "yard", "yards"),
      u("mi", 1609.344, "mile", "miles"),
      u("nmi", 1852, "nautical mile", "nautical miles"),
    ],
  },
  {
    id: "mass",
    name: "Mass",
    base: "kg",
    units: [
      u("mg", 1e-6, "milligram", "milligrams"),
      u("g", 0.001, "gram", "grams", "gramme", "grammes"),
      u("kg", 1, "kilogram", "kilograms", "kilo", "kilos"),
      u("t", 1000, "tonne", "tonnes", "ton", "tons"),
      u("oz", 0.028349523125, "ounce", "ounces"),
      u("lb", 0.45359237, "lbs", "pound", "pounds"),
      u("st", 6.35029318, "stone", "stones"),
    ],
  },
  {
    id: "temperature",
    name: "Temperature",
    base: "c",
    // Factor is unused for this category; see convertTemperature().
    units: [u("c", 1), u("f", 1), u("k", 1)],
  },
  {
    id: "area",
    name: "Area",
    base: "m2",
    units: [
      u("cm2", 0.0001, "cm^2", "sq cm", "sqcm"),
      u("m2", 1, "m^2", "sq m", "sqm"),
      u("km2", 1e6, "km^2", "sq km", "sqkm"),
      u("ft2", 0.09290304, "ft^2", "sq ft", "sqft"),
      u("yd2", 0.83612736, "yd^2", "sq yd"),
      u("acre", 4046.8564224, "acres"),
      u("ha", 10_000, "hectare", "hectares"),
    ],
  },
  {
    id: "volume",
    name: "Volume",
    base: "l",
    units: [
      u("ml", 0.001, "milliliter", "milliliters", "millilitre", "millilitres"),
      u("l", 1, "liter", "liters", "litre", "litres"),
      u("m3", 1000, "m^3", "cubic meter", "cubic meters"),
      u("tsp", 0.00492892159375, "teaspoon", "teaspoons"),
      u("tbsp", 0.01478676478125, "tablespoon", "tablespoons"),
      u("cup", 0.2365882365, "cups"),
      u("floz", 0.0295735295625, "fl oz", "fluid ounce", "fluid ounces"),
      u("pt", 0.473176473, "pint", "pints"),
      u("qt", 0.946352946, "quart", "quarts"),
      u("gal", 3.785411784, "gallon", "gallons", "us gallon"),
      u("impgal", 4.54609, "imperial gallon", "imp gal"),
      u("drygal", 4.40488377086, "dry gallon", "dry gal"),
    ],
  },
  {
    id: "speed",
    name: "Speed",
    base: "mps",
    units: [
      u("mps", 1, "m/s", "ms"),
      u("kph", 1 / 3.6, "km/h", "kmh", "kilometer per hour"),
      u("mph", 0.44704, "mi/h", "mile per hour"),
      u("knot", 0.514444444444, "knots", "kt"),
      u("fps", 0.3048, "ft/s"),
    ],
  },
  {
    id: "time",
    name: "Time",
    base: "s",
    units: [
      u("ms", 0.001, "millisecond", "milliseconds"),
      u("s", 1, "sec", "secs", "second", "seconds"),
      u("min", 60, "mins", "minute", "minutes"),
      u("h", 3600, "hr", "hrs", "hour", "hours"),
      u("d", 86400, "day", "days"),
      u("wk", 604800, "week", "weeks"),
      u("yr", 31557600, "year", "years"),
    ],
  },
  {
    id: "data",
    name: "Digital Storage",
    base: "b",
    units: [
      u("bit", 1, "b", "bits"),
      u("kbit", 1e3, "kilobit", "kilobits"),
      u("mbit", 1e6, "megabit", "megabits"),
      u("gbit", 1e9, "gigabit", "gigabits"),
      u("byte", 8),
      u("kbyte", 8e3, "kb", "kilobyte", "kilobytes"),
      u("mbyte", 8e6, "mb", "megabyte", "megabytes"),
      u("gbyte", 8e9, "gb", "gigabyte", "gigabytes"),
      u("tbyte", 8e12, "tb", "terabyte", "terabytes"),
    ],
  },
  {
    id: "pressure",
    name: "Pressure",
    base: "pa",
    units: [
      u("pa", 1, "pascal", "pascals"),
      u("kpa", 1000, "kilopascal", "kilopascals"),
      u("bar", 100_000, "bars"),
      u("mbar", 100, "millibar", "millibars"),
      u("psi", 6894.757293168),
      u("atm", 101_325, "atmosphere", "atmospheres"),
      u("mmhg", 133.322387415, "torr"),
    ],
  },
  {
    id: "energy",
    name: "Energy",
    base: "j",
    units: [
      u("j", 1, "joule", "joules"),
      u("kj", 1000, "kilojoule", "kilojoules"),
      u("cal", 4.184, "calorie", "calories"),
      u("kcal", 4184, "kilocalorie", "kilocalories"),
      u("wh", 3600, "watt hour", "watt-hour"),
      u("kwh", 3_600_000, "kilowatt hour", "kilowatt-hour"),
    ],
  },
];
