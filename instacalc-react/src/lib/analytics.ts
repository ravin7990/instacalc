/**
 * analytics.ts — Unified event tracking across InstaCalc.
 *
 * Dispatches every user interaction to:
 *  1. Google Firebase Analytics via official SDK (instacalc-40640)
 *  2. Google Analytics 4 stream (G-J0ZWXR3T5P) via gtag / dataLayer
 *
 * Includes automatic debouncing for continuous slider drags and fast typing,
 * typed helpers for all calculator and site actions, and safe SSR no-ops.
 */

declare global {
  interface Window {
    __FIREBASE_ANALYTICS__?: any;
    __FIREBASE_LOG_EVENT__?: (analytics: any, eventName: string, params?: Record<string, any>) => void;
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    __IC_ANALYTICS_INITIALIZED__?: boolean;
  }
}

/** Sanitize event names to adhere to Firebase / GA4 40-char limit */
function sanitizeEventName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 40);
}

/** Base dispatcher */
export function trackEvent(name: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  const eventName = sanitizeEventName(name);
  const payload: Record<string, any> = {
    page_path: window.location.pathname,
    page_title: document.title || "",
    ...params,
  };

  // 1. Firebase Analytics SDK
  try {
    if (window.__FIREBASE_ANALYTICS__ && typeof window.__FIREBASE_LOG_EVENT__ === "function") {
      window.__FIREBASE_LOG_EVENT__(window.__FIREBASE_ANALYTICS__, eventName, payload);
    }
  } catch {
    // ignore
  }

  // 2. Google Analytics gtag
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, payload);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...payload });
    }
  } catch {
    // ignore
  }
}

/** Debounced event map for high-frequency events like sliders and typing */
const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function trackDebouncedEvent(
  key: string,
  eventName: string,
  params: Record<string, any> = {},
  waitMs = 500
) {
  if (typeof window === "undefined") return;
  const existing = debounceTimers.get(key);
  if (existing) clearTimeout(existing);

  debounceTimers.set(
    key,
    setTimeout(() => {
      debounceTimers.delete(key);
      trackEvent(eventName, params);
    }, waitMs)
  );
}

// ============================================================================
// Specialized User Action Trackers
// ============================================================================

/** 1. Page View */
export function trackPageView(path = window.location.pathname, title = document.title, locale?: string) {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
    page_locale: locale || "unknown",
  });
}

/** 2. Calculator Number/Date Input Change */
export function trackCalculatorInput(
  calcId: string,
  fieldName: string,
  value: number | string,
  unit?: string
) {
  trackDebouncedEvent(
    `input_${calcId}_${fieldName}`,
    "calc_input_change",
    {
      calc_id: calcId,
      field_name: fieldName,
      value: String(value),
      unit: unit || "",
    },
    600
  );
}

/** 3. Calculator Range Slider Drag/Change */
export function trackCalculatorSlider(calcId: string, fieldName: string, value: number) {
  trackDebouncedEvent(
    `slider_${calcId}_${fieldName}`,
    "calc_slider_change",
    {
      calc_id: calcId,
      field_name: fieldName,
      slider_value: value,
    },
    400
  );
}

/** 4. Calculator Preset Quick-Chip Click */
export function trackCalculatorChip(
  calcId: string,
  fieldName: string,
  chipLabel: string,
  chipValue: number | string
) {
  trackEvent("calc_chip_click", {
    calc_id: calcId,
    field_name: fieldName,
    chip_label: chipLabel,
    chip_value: String(chipValue),
  });
}

/** 5. Calculator Toggle (e.g. Advanced Controls, modes) */
export function trackCalculatorToggle(calcId: string, toggleName: string, value: boolean | string) {
  trackEvent("calc_toggle_change", {
    calc_id: calcId,
    toggle_name: toggleName,
    toggle_state: String(value),
  });
}

/** 6. Calculator Select Dropdown Change */
export function trackCalculatorSelect(calcId: string, selectName: string, selectedValue: string) {
  trackEvent("calc_select_change", {
    calc_id: calcId,
    select_name: selectName,
    selected_value: selectedValue,
  });
}

/** 7. Copy Calculation Results Button Click */
export function trackCalculatorCopy(calcId: string, resultSummary?: string) {
  trackEvent("calc_copy_result", {
    calc_id: calcId,
    summary_preview: resultSummary ? resultSummary.slice(0, 100) : "",
  });
}

/** 8. Reset Calculator to Defaults */
export function trackCalculatorReset(calcId: string) {
  trackEvent("calc_reset", {
    calc_id: calcId,
  });
}

/** 9. Share Calculation Results */
export function trackCalculatorShare(calcId: string, shareMethod: "native" | "clipboard" = "native") {
  trackEvent("calc_share", {
    calc_id: calcId,
    share_method: shareMethod,
  });
}

/** 10. Download / Print A4 PDF Report */
export function trackCalculatorDownloadPdf(calcId: string) {
  trackEvent("calc_download_pdf", {
    calc_id: calcId,
    format: "a4_portrait",
  });
}

/** 11. Export Amortization / Projection to CSV */
export function trackCalculatorExportCsv(calcId: string, rowsCount = 0) {
  trackEvent("calc_export_csv", {
    calc_id: calcId,
    rows_count: rowsCount,
  });
}

/** 12. Compare Scenarios */
export function trackCalculatorCompare(calcId: string, action: "set_a" | "clear") {
  trackEvent("calc_compare", {
    calc_id: calcId,
    compare_action: action,
  });
}

/** 13. Embed Calculator Widget */
export function trackCalculatorEmbed(calcId: string) {
  trackEvent("calc_embed_copy", {
    calc_id: calcId,
  });
}

/** 14. Calculator History Interactions (Save, Load, Export PDF/CSV, Delete, Clear) */
export function trackCalculatorHistory(
  calcId: string,
  action: "save" | "load" | "delete" | "clear" | "export_pdf" | "export_csv",
  count = 1
) {
  trackEvent("calc_history", {
    calc_id: calcId,
    history_action: action,
    item_count: count,
  });
}

/** 9. Homepage Live Search Input */
export function trackSearch(query: string, resultsCount: number) {
  if (!query.trim()) return;
  trackDebouncedEvent(
    "site_search",
    "search",
    {
      search_term: query.trim(),
      results_count: resultsCount,
    },
    800
  );
}

/** 10. Search Result / Suggestion Click */
export function trackSearchResultClick(query: string, toolLabel: string, destinationPath: string) {
  trackEvent("search_result_click", {
    search_term: query,
    tool_label: toolLabel,
    destination_path: destinationPath,
  });
}

/** 11. Popular Tool / Quick Link Click */
export function trackQuickLinkClick(toolLabel: string, destinationPath: string) {
  trackEvent("quick_link_click", {
    tool_label: toolLabel,
    destination_path: destinationPath,
  });
}

/** 12. Smart Unit Converter Query */
export function trackUnitConvert(query: string, success: boolean, fromUnit?: string, toUnit?: string) {
  if (!query.trim()) return;
  trackDebouncedEvent(
    "unit_convert",
    "unit_convert",
    {
      query: query.trim(),
      success,
      from_unit: fromUnit || "",
      to_unit: toUnit || "",
    },
    700
  );
}

/** 13. Language / Region Switcher Click */
export function trackLanguageSwitch(fromLocale: string, toLocale: string) {
  trackEvent("language_switch", {
    from_locale: fromLocale,
    to_locale: toLocale,
  });
}

/** 14. Navigation Link Click (Header / Footer / Drawer) */
export function trackNavClick(navLocation: string, linkText: string, linkHref: string) {
  trackEvent("nav_click", {
    nav_location: navLocation,
    link_text: linkText,
    link_href: linkHref,
  });
}

/** 15. FAQ Accordion Toggle */
export function trackFaqToggle(question: string, isOpen: boolean) {
  trackEvent("faq_toggle", {
    question: question.slice(0, 80),
    is_open: isOpen,
  });
}

/** 16. Cookie Consent Decision */
export function trackCookieConsent(choice: "accept_all" | "essential_only") {
  trackEvent("cookie_consent", {
    consent_choice: choice,
  });
}

// ============================================================================
// Global Delegated Click & Change Auto-Tracker
// ============================================================================

/**
 * Initializes global event delegation on document to catch any uninstrumented
 * clicks, external links, buttons, and form changes automatically.
 */
export function initAutoTracking() {
  if (typeof window === "undefined" || window.__IC_ANALYTICS_INITIALIZED__) return;
  window.__IC_ANALYTICS_INITIALIZED__ = true;

  // Track initial page view
  trackPageView(window.location.pathname, document.title);

  // Global click delegator
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check for anchor link
    const link = target.closest("a");
    if (link && link.href) {
      const isExternal = link.hostname && link.hostname !== window.location.hostname;
      if (isExternal) {
        trackEvent("external_link_click", {
          url: link.href,
          text: (link.textContent || "").trim().slice(0, 50),
        });
      }
      return;
    }

    // Check for button clicks
    const button = target.closest("button");
    if (button) {
      const btnText = (button.textContent || "").trim();
      const btnClass = button.className || "";
      const ariaLabel = button.getAttribute("aria-label") || "";
      const label = btnText || ariaLabel;

      if (label && !button.closest(".chips-wrap")) {
        trackDebouncedEvent(
          `btn_${label}`,
          "button_click",
          {
            button_label: label.slice(0, 50),
            button_class: btnClass.slice(0, 50),
          },
          300
        );
      }
    }
  });

  // Global change delegator for selects and uninstrumented inputs
  document.addEventListener("change", (e) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target instanceof HTMLSelectElement && target.id !== "langSelect") {
      const label = target.getAttribute("aria-label") || target.name || target.id || "select";
      trackEvent("select_change", {
        select_name: label,
        selected_value: target.value,
      });
    }
  });
}
