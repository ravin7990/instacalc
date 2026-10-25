/**
 * urlState.ts — Universal query parameter state synchronization & numeric delta parser.
 *
 * Allows calculator inputs across all 139 calculators (both declarative and bespoke)
 * to be encoded into the URL query string so users can share or bookmark exact
 * customized calculations (e.g. ?monthly=35000&rate=15&years=25).
 * Safe for SSR and client-side hydration.
 */

const RESERVED_PARAMS = new Set(["embed", "theme", "lang", "utm_source", "utm_medium", "utm_campaign"]);

let pendingSyncTimer: ReturnType<typeof setTimeout> | null = null;
const activeFieldState = new Map<string, { value: number; defaultValue: number }>();

/**
 * Reads a single field's numeric parameter from the current URL query string,
 * clamped safely to [min, max]. Returns null if not present or invalid.
 */
export function readSingleUrlParam(key: string, min: number, max: number): number | null {
  if (typeof window === "undefined" || !window.location.search || !key) {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has(key)) return null;
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") return null;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return null;
    return Math.min(max, Math.max(min, parsed));
  } catch {
    return null;
  }
}

/**
 * Synchronizes a single field's value into the browser URL query string (debounced).
 * Preserves reserved parameters (like ?embed=true&theme=dark) and omits values
 * that match their initial default to keep URLs concise.
 */
export function syncSingleUrlParam(key: string, value: number, defaultValue: number) {
  if (typeof window === "undefined" || typeof window.history === "undefined" || !key) return;

  activeFieldState.set(key, { value, defaultValue });

  if (pendingSyncTimer) {
    clearTimeout(pendingSyncTimer);
  }

  pendingSyncTimer = setTimeout(() => {
    try {
      const currentParams = new URLSearchParams(window.location.search);
      const nextParams = new URLSearchParams();

      // Preserve reserved parameters (e.g. embed=true, theme=dark)
      for (const [k, v] of currentParams.entries()) {
        if (RESERVED_PARAMS.has(k)) {
          nextParams.set(k, v);
        }
      }

      // Apply all non-default field values
      for (const [fieldKey, entry] of activeFieldState.entries()) {
        if (Number.isFinite(entry.value) && entry.value !== entry.defaultValue) {
          nextParams.set(fieldKey, String(entry.value));
        }
      }

      const queryStr = nextParams.toString();
      const nextUrl = `${window.location.pathname}${queryStr ? `?${queryStr}` : ""}${window.location.hash}`;
      const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

      if (nextUrl !== currentUrl) {
        window.history.replaceState(null, "", nextUrl);
      }
    } catch {
      // Ignore history security restrictions in sandboxed contexts
    }
  }, 150);
}

/**
 * Reads query parameters matching known state keys.
 * Returns only parameters that differ from defaults and parse into valid numbers.
 */
export function readUrlParams(defaults: Record<string, number>): Record<string, number> {
  if (typeof window === "undefined" || !window.location.search) {
    return defaults;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const result: Record<string, number> = { ...defaults };
    let hasCustom = false;

    for (const key of Object.keys(defaults)) {
      if (params.has(key)) {
        const val = Number(params.get(key));
        if (Number.isFinite(val)) {
          result[key] = val;
          hasCustom = true;
        }
      }
    }

    return hasCustom ? result : defaults;
  } catch {
    return defaults;
  }
}

/**
 * Encodes non-default state keys into a clean URL query string,
 * preserving reserved query parameters such as ?embed=true.
 */
export function buildQueryString(
  state: Record<string, number>,
  defaults: Record<string, number>
): string {
  const params = new URLSearchParams();

  if (typeof window !== "undefined" && window.location.search) {
    try {
      const current = new URLSearchParams(window.location.search);
      for (const [k, v] of current.entries()) {
        if (RESERVED_PARAMS.has(k)) {
          params.set(k, v);
        }
      }
    } catch {
      // ignore
    }
  }

  for (const [key, value] of Object.entries(state)) {
    if (defaults[key] !== undefined && Number.isFinite(value) && value !== defaults[key]) {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Updates the browser URL without reloading the page or creating unnecessary history entries.
 */
export function syncUrlState(state: Record<string, number>, defaults: Record<string, number>) {
  if (typeof window === "undefined" || typeof window.history === "undefined") return;

  try {
    for (const [k, v] of Object.entries(state)) {
      if (defaults[k] !== undefined) {
        activeFieldState.set(k, { value: v, defaultValue: defaults[k] });
      }
    }
    const query = buildQueryString(state, defaults);
    const newUrl = `${window.location.pathname}${query}${window.location.hash}`;
    if (newUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, "", newUrl);
    }
  } catch {
    // ignore
  }
}

/**
 * Generates a full shareable URL with the current customized parameters.
 */
export function getShareableUrl(state?: Record<string, number>, defaults?: Record<string, number>): string {
  if (typeof window === "undefined") return "https://instacalc.in";

  const baseUrl = `${window.location.origin}${window.location.pathname}`;
  if (!state || !defaults) {
    return window.location.href;
  }

  const query = buildQueryString(state, defaults);
  return `${baseUrl}${query}`;
}

/**
 * Parses a human-formatted currency or metric string into a raw number,
 * handling regional unit multipliers (Cr, L/Lakh, K, M, B, 億, 万, 억, 만).
 */
export function parseNumericFromFormatted(display: string): number | null {
  if (!display) return null;
  const text = display.trim();

  // Detect regional multipliers
  let multiplier = 1;
  if (/\bCr\b/i.test(text) || /Crore/i.test(text)) {
    multiplier = 1e7;
  } else if (/\bL\b/i.test(text) || /Lakh/i.test(text)) {
    multiplier = 1e5;
  } else if (/\bB\b/i.test(text)) {
    multiplier = 1e9;
  } else if (/\bM\b/i.test(text)) {
    multiplier = 1e6;
  } else if (/\bK\b/i.test(text)) {
    multiplier = 1e3;
  } else if (text.includes("億") || text.includes("억")) {
    multiplier = 1e8;
  } else if (text.includes("万") || text.includes("만")) {
    multiplier = 1e4;
  }

  // Extract first floating-point number (handling commas and spaces)
  const cleaned = text.replace(/[, \u00A0]/g, "");
  const match = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;

  const num = Number(match[0]);
  return Number.isFinite(num) ? num * multiplier : null;
}

/**
 * Computes percentage delta between Scenario A and Scenario B formatted strings.
 */
export function computeScenarioDelta(
  valA: string,
  valB: string
): { diffPct: string; direction: "positive" | "negative" | "neutral" } | null {
  const numA = parseNumericFromFormatted(valA);
  const numB = parseNumericFromFormatted(valB);

  if (numA === null || numB === null || numA === 0) return null;

  const delta = ((numB - numA) / Math.abs(numA)) * 100;
  if (!Number.isFinite(delta)) return null;

  if (Math.abs(delta) < 0.05) {
    return { diffPct: "0.0%", direction: "neutral" };
  }

  const sign = delta > 0 ? "+" : "";
  return {
    diffPct: `${sign}${delta.toFixed(1)}%`,
    direction: delta > 0 ? "positive" : "negative",
  };
}
