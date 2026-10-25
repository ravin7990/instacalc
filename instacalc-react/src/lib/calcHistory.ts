/**
 * calcHistory.ts — Persistent per-calculator history storage, restoration, and management.
 *
 * Stores calculation runs in localStorage under `instacalc_history_v1:<calcId>`,
 * allowing users to review past scenarios, restore ("Load") any past calculation
 * directly back into the active calculator inputs, and select multiple runs for
 * batch A4 PDF or Excel CSV export.
 */

export interface HistoryInputItem {
  key: string;
  label: string;
  rawValue: string;
  displayValue: string;
}

export interface HistoryMetricItem {
  label: string;
  value: string;
}

export interface HistoryEntry {
  id: string;
  calcId: string;
  calcTitle: string;
  timestamp: string;
  createdAt: number;
  headline: {
    label: string;
    value: string;
  };
  inputs: HistoryInputItem[];
  metrics: HistoryMetricItem[];
  queryUrl: string;
  chartImage?: string;
  growthChartImage?: string;
}

const STORAGE_PREFIX = "instacalc_history_v1:";
const MAX_ENTRIES_PER_CALC = 50;

function getStorageKey(calcId: string): string {
  const normalized = (calcId || "default").trim().toLowerCase();
  return `${STORAGE_PREFIX}${normalized}`;
}

/**
 * Loads saved calculation history entries for a specific calculator.
 */
export function loadHistoryEntries(calcId: string): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(calcId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function writeHistoryEntries(calcId: string, entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      getStorageKey(calcId),
      JSON.stringify(entries.slice(0, MAX_ENTRIES_PER_CALC))
    );
  } catch {
    // Ignore storage quota errors in private browsing
  }
}

/**
 * Saves a new calculation snapshot to history.
 * If the most recent entry has identical input parameters and headline value,
 * updates its timestamp instead of creating a duplicate row.
 */
export function saveHistoryEntry(
  calcId: string,
  payload: Omit<HistoryEntry, "id" | "createdAt">
): HistoryEntry[] {
  const current = loadHistoryEntries(calcId);
  const now = Date.now();

  const inputsSignature = (inputs: HistoryInputItem[]) =>
    inputs.map((i) => `${i.key}=${i.rawValue}`).join("&");

  const newSig = inputsSignature(payload.inputs);

  if (
    current.length > 0 &&
    inputsSignature(current[0].inputs) === newSig &&
    current[0].headline.value === payload.headline.value
  ) {
    const updatedFirst: HistoryEntry = {
      ...current[0],
      timestamp: payload.timestamp,
      createdAt: now,
      queryUrl: payload.queryUrl,
      metrics: payload.metrics,
      chartImage: payload.chartImage ?? current[0].chartImage,
      growthChartImage: payload.growthChartImage ?? current[0].growthChartImage,
    };
    const updated = [updatedFirst, ...current.slice(1)];
    writeHistoryEntries(calcId, updated);
    return updated;
  }

  const entry: HistoryEntry = {
    ...payload,
    id: `hist_${now}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
  };

  const next = [entry, ...current].slice(0, MAX_ENTRIES_PER_CALC);
  writeHistoryEntries(calcId, next);
  return next;
}

/**
 * Deletes one or more history entries by ID.
 */
export function deleteHistoryEntries(calcId: string, idsToDelete: string[]): HistoryEntry[] {
  const idSet = new Set(idsToDelete);
  const current = loadHistoryEntries(calcId);
  const next = current.filter((item) => !idSet.has(item.id));
  writeHistoryEntries(calcId, next);
  return next;
}

/**
 * Clears all history entries for a specific calculator.
 */
export function clearHistoryEntries(calcId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(getStorageKey(calcId));
  } catch {
    // Ignore
  }
}

/**
 * Restores a saved HistoryEntry directly into the active calculator inputs:
 * 1. Updates URL query parameters via history.replaceState
 * 2. Dispatches `instacalc:load-history` event so all <Field> components hydrate immediately
 * 3. Updates any bespoke non-<Field> inputs/selects inside `.calculator-shell`
 */
export function applyHistoryEntryToInputs(
  entry: HistoryEntry,
  shellEl?: HTMLElement | null
): void {
  if (typeof window === "undefined") return;

  // 1. Update URL query string with saved input values
  try {
    const currentUrl = new URL(window.location.href);
    for (const inp of entry.inputs) {
      if (inp.key && inp.rawValue !== undefined && inp.rawValue !== "") {
        currentUrl.searchParams.set(inp.key, String(inp.rawValue));
      }
    }
    window.history.replaceState(null, "", currentUrl.pathname + currentUrl.search + currentUrl.hash);
  } catch {
    // Ignore URL errors
  }

  // 2. Dispatch universal custom event for <Field> components
  window.dispatchEvent(
    new CustomEvent("instacalc:load-history", {
      detail: { inputs: entry.inputs, entryId: entry.id },
    })
  );

  // 3. Fallback for bespoke inputs (e.g. date inputs, selects, custom number fields)
  if (shellEl) {
    for (const inp of entry.inputs) {
      const target =
        shellEl.querySelector<HTMLInputElement | HTMLSelectElement>(
          `[data-field="${CSS.escape(inp.key)}"], #${CSS.escape(inp.key)}, [name="${CSS.escape(inp.key)}"]`
        );
      if (target && target.value !== String(inp.rawValue)) {
        try {
          const proto =
            target instanceof HTMLSelectElement
              ? window.HTMLSelectElement.prototype
              : window.HTMLInputElement.prototype;
          const nativeSetter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
          if (nativeSetter) {
            nativeSetter.call(target, String(inp.rawValue));
            target.dispatchEvent(new Event("input", { bubbles: true }));
            target.dispatchEvent(new Event("change", { bubbles: true }));
          }
        } catch {
          // Ignore if controlled by Field event listener
        }
      }
    }
  }
}
