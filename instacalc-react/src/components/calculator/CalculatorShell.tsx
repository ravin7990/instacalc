import { useEffect, useRef, useState, type ReactNode } from "react";
import { ui } from "@/i18n/ui";
import type { Locale } from "@/config/site";
import {
  trackCalculatorCopy,
  trackCalculatorToggle,
  trackCalculatorReset,
  trackCalculatorShare,
  trackCalculatorDownloadPdf,
  trackCalculatorExportCsv,
  trackCalculatorCompare,
  trackCalculatorEmbed,
  trackCalculatorHistory,
  trackNavClick,
} from "@/lib/analytics";
import { exportFinancialWorkbookCsv, exportHistoryBatchCsv, exportTableToCsv, scrapeTableData } from "@/lib/csvExport";
import { computeScenarioDelta } from "@/lib/urlState";
import {
  loadHistoryEntries,
  saveHistoryEntry,
  deleteHistoryEntries,
  clearHistoryEntries,
  applyHistoryEntryToInputs,
  type HistoryEntry,
  type HistoryInputItem,
} from "@/lib/calcHistory";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";

export interface ResultItem {
  label: string;
  value: string;
  /** Rendered as an emphasised headline figure. */
  emphasis?: boolean;
  hint?: string;
}

/**
 * The shared calculator frame: title row, optional mode toggles, inputs on the
 * left and results on the right. Uses container queries so the two columns
 * collapse independently of the viewport (tablets in landscape stay two-up).
 */
interface ScenarioItem {
  label: string;
  value: string;
}

interface ScenarioSnapshot {
  headline: ScenarioItem;
  inputsSummary?: string;
  metrics: ScenarioItem[];
}

export function CalculatorShell({
  locale,
  id,
  title,
  modes,
  advanced,
  onToggleAdvanced,
  inputs,
  results,
  summary,
  summaryText,
  onReset,
  children,
  path,
}: {
  locale: Locale;
  id?: string;
  title?: string;
  path?: string;
  /** e.g. Monthly SIP / Lumpsum — rendered as a linked segmented control. */
  modes?: Array<{ href: string; label: string; active?: boolean }>;
  advanced?: boolean;
  onToggleAdvanced?: () => void;
  inputs: ReactNode;
  results: ReactNode;
  summary?: { label: string; value: string } | null;
  /** Plain-text result summary, used by the copy button. */
  summaryText?: string;
  /** Restores every input to its default. Omitted hides the reset control. */
  onReset?: () => void;
  children?: ReactNode;
}) {
  const t = ui(locale);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [exportedCsv, setExportedCsv] = useState(false);
  const [scenarioA, setScenarioA] = useState<ScenarioSnapshot | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedTheme, setEmbedTheme] = useState<"light" | "dark">("light");
  const [embedCompact, setEmbedCompact] = useState(false);
  const [embedIncludeParams, setEmbedIncludeParams] = useState(true);
  const [embedCopied, setEmbedCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [printDate, setPrintDate] = useState("");
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savedHistoryToast, setSavedHistoryToast] = useState(false);
  const [loadedHistoryId, setLoadedHistoryId] = useState<string | null>(null);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [printBatchMode, setPrintBatchMode] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  // On narrow screens the headline is duplicated by a sticky pill so the figure
  // stays visible while scrolling through a long input column. That is only
  // useful once the real hero has scrolled away; showing both at once just
  // printed the same number twice.
  const [heroInView, setHeroInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const calcKey = id ?? window.location.pathname;
    setHistoryEntries(loadHistoryEntries(calcKey));
  }, [id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("embed=true")) {
      document.documentElement.classList.add("is-embedded-calc");
      if (window.location.search.includes("theme=dark")) {
        document.documentElement.setAttribute("data-embed-theme", "dark");
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.documentElement.classList.remove("is-embedded-calc");
        document.documentElement.removeAttribute("data-embed-theme");
      }
    };
  }, []);

  useEffect(() => {
    try {
      const dateLocale =
        locale === "ja" ? "ja-JP" : locale === "ko" ? "ko-KR" : locale === "ru" ? "ru-RU" : "en-US";
      setPrintDate(
        new Intl.DateTimeFormat(dateLocale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date()),
      );
    } catch {
      setPrintDate(new Date().toISOString().slice(0, 10));
    }
  }, [locale]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      // rootMargin collapses the observation to a thin band, so the pill takes
      // over as soon as the hero is genuinely off screen rather than at the
      // very edge of the viewport.
      { rootMargin: "-72px 0px -72px 0px" },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  /**
   * Scrapes rendered output figures for plain-text export.
   */
  const getSummaryText = (): string => {
    if (summaryText) return summaryText;
    const root = resultsRef.current;
    if (!root) return summary ? `${summary.label}: ${summary.value}` : "";
    const values = [
      ...root.querySelectorAll<HTMLElement>(
        ".result-hero-value, .result-tile .result-value, .kv-value",
      ),
    ]
      .map((el) => el.textContent?.trim() ?? "")
      .filter(Boolean);
    const labels = [
      ...root.querySelectorAll<HTMLElement>(
        ".result-hero-label, .result-tile .result-label, .kv-key",
      ),
    ]
      .map((el) => el.textContent?.trim() ?? "")
      .filter(Boolean);
    return values
      .map((v, i) => (labels[i] ? `${labels[i]}: ${v}` : v))
      .join("\n");
  };

  /**
   * Copies whatever is currently on screen.
   */
  const copy = async () => {
    const text = getSummaryText();
    if (!text) return;
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    trackCalculatorCopy(calcId, text);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context / denied permission).
    }
  };

  /**
   * Shares calculation results via native Web Share API or falls back to clipboard.
   */
  const handleShare = async () => {
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    const text = getSummaryText();
    const shareTitle = `${title || "InstaCalc"} - ${t.reportTitle}`;
    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://instacalc.in";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: shareTitle,
          text: text ? `${shareTitle}\n\n${text}\n` : shareTitle,
          url: shareUrl,
        });
        trackCalculatorShare(calcId, "native");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    try {
      const copyText = text ? `${shareTitle}\n\n${text}\n\n${shareUrl}` : shareUrl;
      await navigator.clipboard.writeText(copyText);
      trackCalculatorShare(calcId, "clipboard");
      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  /**
   * Launches A4 PDF report generation via browser print.
   */
  const handlePrintPdf = () => {
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    trackCalculatorDownloadPdf(calcId);

    if (typeof window === "undefined") return;

    const originalTitle = document.title;
    const reportDocTitle = `${title || "Calculation"} - InstaCalc Report`;
    document.title = reportDocTitle;

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = originalTitle;
      }, 1500);
    }, 60);
  };

  /**
   * Exports data tables, inputs, and results to a multi-section financial workbook CSV.
   */
  const handleExportCsv = () => {
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    if (typeof window === "undefined") return;

    const root = resultsRef.current;
    const baseName = (title || "instacalc-calculation")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "");

    // 1. Scrape Inputs
    const inputCards = root?.closest(".calculator-shell")?.querySelectorAll<HTMLElement>(".field-card[data-field-label]");
    const inputs: Array<{ label: string; value: string }> = [];
    inputCards?.forEach((card) => {
      const l = card.getAttribute("data-field-label");
      const v = card.getAttribute("data-field-display");
      if (l && v) inputs.push({ label: l, value: v });
    });

    // 2. Scrape Results & Scenario Comparison
    const resultsList: Array<{
      label: string;
      value: string;
      scenarioA?: string;
      scenarioB?: string;
      delta?: string;
    }> = [];

    if (summary) {
      if (scenarioA) {
        const delta = computeScenarioDelta(scenarioA.headline.value, summary.value);
        resultsList.push({
          label: summary.label,
          value: summary.value,
          scenarioA: scenarioA.headline.value,
          scenarioB: summary.value,
          delta: delta ? `${delta.direction === "positive" ? "+" : ""}${delta.diffPct}` : "--",
        });
      } else {
        resultsList.push({ label: summary.label, value: summary.value });
      }
    }

    const tileEls = root?.querySelectorAll<HTMLElement>(".result-tile");
    tileEls?.forEach((tile, idx) => {
      const l = tile.querySelector<HTMLElement>(".result-label")?.textContent?.trim() ?? "";
      const v = tile.querySelector<HTMLElement>(".result-value")?.textContent?.trim() ?? "";
      if (l && v && (!summary || l !== summary.label)) {
        if (scenarioA && scenarioA.metrics[idx]) {
          const delta = computeScenarioDelta(scenarioA.metrics[idx].value, v);
          resultsList.push({
            label: l,
            value: v,
            scenarioA: scenarioA.metrics[idx].value,
            scenarioB: v,
            delta: delta ? `${delta.direction === "positive" ? "+" : ""}${delta.diffPct}` : "--",
          });
        } else {
          resultsList.push({ label: l, value: v });
        }
      }
    });

    // 3. Scrape Amortization Schedule Table if present
    const tableEl = root?.querySelector("table") || document.querySelector(".calculator-shell table");
    let schedule: { title?: string; headers: string[]; rows: (string | number)[][] } | undefined;
    if (tableEl) {
      const scraped = scrapeTableData(tableEl as HTMLTableElement);
      if (scraped.rows.length > 0) {
        schedule = {
          title: "PROJECTION / AMORTIZATION SCHEDULE",
          headers: scraped.headers,
          rows: scraped.rows,
        };
      }
    }

    const rowsCount = resultsList.length + (schedule ? schedule.rows.length : 0);
    trackCalculatorExportCsv(calcId, rowsCount);

    exportFinancialWorkbookCsv({
      filename: `${baseName}-report.csv`,
      calcTitle: title || t.reportTitle,
      timestamp: printDate || new Date().toISOString().slice(0, 10),
      pageUrl: window.location.href,
      inputs,
      results: resultsList,
      schedule,
    });

    setExportedCsv(true);
    window.setTimeout(() => setExportedCsv(false), 1800);
  };

  /**
   * Toggles Scenario Comparison mode snapshotting current results & inputs as Scenario A.
   */
  const handleToggleCompare = () => {
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    if (!scenarioA) {
      if (summary) {
        const root = resultsRef.current;
        const inputCards = root?.closest(".calculator-shell")?.querySelectorAll<HTMLElement>(".field-card[data-field-label]");
        const inputList: string[] = [];
        inputCards?.forEach((card) => {
          const l = card.getAttribute("data-field-label");
          const v = card.getAttribute("data-field-display");
          if (l && v) inputList.push(`${l}: ${v}`);
        });

        const tileEls = root?.querySelectorAll<HTMLElement>(".result-tile");
        const metrics: ScenarioItem[] = [];
        tileEls?.forEach((tile) => {
          const l = tile.querySelector<HTMLElement>(".result-label")?.textContent?.trim() ?? "";
          const v = tile.querySelector<HTMLElement>(".result-value")?.textContent?.trim() ?? "";
          if (l && v) metrics.push({ label: l, value: v });
        });

        setScenarioA({
          headline: { label: summary.label, value: summary.value },
          inputsSummary: inputList.slice(0, 3).join(" • "),
          metrics,
        });
        trackCalculatorCompare(calcId, "set_a");
      }
    } else {
      setScenarioA(null);
      trackCalculatorCompare(calcId, "clear");
    }
  };

  const getEmbedSnippet = (): string => {
    if (typeof window === "undefined") return "";
    let targetUrl: URL;
    if (embedIncludeParams) {
      targetUrl = new URL(window.location.href);
    } else {
      targetUrl = new URL(window.location.origin + window.location.pathname);
    }
    targetUrl.searchParams.set("embed", "true");
    if (embedTheme === "dark") {
      targetUrl.searchParams.set("theme", "dark");
    } else {
      targetUrl.searchParams.delete("theme");
    }
    const height = embedCompact ? 540 : 720;
    return `<iframe src="${targetUrl.toString()}" width="100%" height="${height}" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 12px; max-width: 800px; width: 100%;" title="${title || "Calculator"}"></iframe>`;
  };

  const handleOpenEmbed = () => {
    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    trackCalculatorEmbed(calcId);
    setShowEmbed(true);
  };

  const handleCopyEmbed = async () => {
    const snippet = getEmbedSnippet();
    if (!snippet) return;
    try {
      await navigator.clipboard.writeText(snippet);
      setEmbedCopied(true);
      window.setTimeout(() => setEmbedCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  };

  const isThemeLight = embedTheme === "light";
  const isThemeDark = embedTheme === "dark";
  const isStandardSize = !embedCompact;
  const isCompactSize = embedCompact;

  const scrapeCurrentInputs = (): HistoryInputItem[] => {
    const root = shellRef.current || resultsRef.current?.closest<HTMLElement>(".calculator-shell");
    if (!root) return [];
    const items: HistoryInputItem[] = [];

    const cards = root.querySelectorAll<HTMLElement>(".field-card[data-field-key]");
    cards.forEach((card) => {
      const key = card.getAttribute("data-field-key") || "";
      const label = card.getAttribute("data-field-label") || key;
      const raw =
        card.getAttribute("data-field-raw") ||
        card.querySelector<HTMLInputElement>("input[type='number']")?.value ||
        "";
      const display = card.getAttribute("data-field-display") || raw;
      if (key && raw !== "") {
        items.push({ key, label, rawValue: raw, displayValue: display });
      }
    });

    const bespokeInputs = root.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "input.date-input, .calc-inputs select"
    );
    bespokeInputs.forEach((el) => {
      const key = el.getAttribute("data-field") || el.name || el.id;
      const label = el.getAttribute("aria-label") || el.previousElementSibling?.textContent?.trim() || key;
      if (key && !items.some((i) => i.key === key)) {
        items.push({ key, label, rawValue: el.value, displayValue: el.value });
      }
    });

    return items;
  };

  const scrapeCurrentMetrics = (): Array<{ label: string; value: string }> => {
    const root = resultsRef.current;
    if (!root) return [];
    const metrics: Array<{ label: string; value: string }> = [];

    const tileEls = root.querySelectorAll<HTMLElement>(".result-tile");
    tileEls.forEach((tile) => {
      const l = tile.querySelector<HTMLElement>(".result-label")?.textContent?.trim() ?? "";
      const v = tile.querySelector<HTMLElement>(".result-value")?.textContent?.trim() ?? "";
      if (l && v && (!summary || l !== summary.label)) {
        metrics.push({ label: l, value: v });
      }
    });

    const kvEls = root.querySelectorAll<HTMLElement>(".kv-list li");
    kvEls.forEach((li) => {
      const l = li.querySelector<HTMLElement>(".kv-key")?.textContent?.trim() ?? "";
      const v = li.querySelector<HTMLElement>(".kv-value")?.textContent?.trim() ?? "";
      if (l && v && (!summary || l !== summary.label)) {
        metrics.push({ label: l, value: v });
      }
    });

    return metrics;
  };

  const scrapeCurrentCharts = (): { chartImage?: string; growthChartImage?: string } => {
    const root = shellRef.current || resultsRef.current?.closest<HTMLElement>(".calculator-shell");
    if (!root || typeof document === "undefined") return {};

    const canvases = root.querySelectorAll<HTMLCanvasElement>("canvas");
    if (!canvases.length) return {};

    const captureCanvas = (
      canvas: HTMLCanvasElement,
      maxWidth = 400,
      drawCenterText = false
    ): string | undefined => {
      try {
        const w = canvas.width || canvas.clientWidth || 300;
        const h = canvas.height || canvas.clientHeight || 150;
        if (!w || !h) return undefined;
        const ratio = Math.min(1, maxWidth / w);
        const targetW = Math.max(140, Math.round(w * ratio));
        const targetH = Math.max(90, Math.round(h * ratio));

        const temp = document.createElement("canvas");
        temp.width = targetW;
        temp.height = targetH;
        const ctx = temp.getContext("2d");
        if (!ctx) return undefined;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(canvas, 0, 0, targetW, targetH);

        if (drawCenterText) {
          const wrapper = canvas.closest(".chart-wrap-doughnut, .chart-breakdown-card");
          const centerVal = wrapper?.querySelector(".chart-center-val")?.textContent?.trim();
          const centerSub = wrapper?.querySelector(".chart-center-sub")?.textContent?.trim();
          if (centerVal) {
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 18px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
            ctx.fillText(centerVal, targetW / 2, targetH / 2 - (centerSub ? 7 : 0));
            if (centerSub) {
              ctx.font = "10px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
              ctx.fillStyle = "#64748b";
              ctx.fillText(centerSub, targetW / 2, targetH / 2 + 12);
            }
          }
        }

        return temp.toDataURL("image/jpeg", 0.85);
      } catch {
        return undefined;
      }
    };

    let chartImage: string | undefined;
    let growthChartImage: string | undefined;

    // Check for breakdown doughnut canvas
    const breakdownCanvas =
      root.querySelector<HTMLCanvasElement>(".chart-wrap-doughnut canvas, .chart-breakdown-card canvas") ||
      canvases[0];
    if (breakdownCanvas) {
      chartImage = captureCanvas(breakdownCanvas, 360, true);
    }

    // Check for timeline growth canvas
    const timelineCanvas = root.querySelector<HTMLCanvasElement>(
      ".chart-wrap-timeline canvas, .chart-timeline-card canvas, .growth-timeline-card canvas"
    );
    if (timelineCanvas && timelineCanvas !== breakdownCanvas) {
      growthChartImage = captureCanvas(timelineCanvas, 600, false);
    } else if (canvases.length > 1 && canvases[1] !== breakdownCanvas) {
      growthChartImage = captureCanvas(canvases[1], 600, false);
    }

    return { chartImage, growthChartImage };
  };

  const handleSaveHistory = () => {
    if (typeof window === "undefined") return;
    const calcKey = id ?? window.location.pathname;
    const headline = summary
      ? { label: summary.label, value: summary.value }
      : {
          label: t.resultsHeadline,
          value: resultsRef.current?.querySelector(".result-hero-value, .kv-value")?.textContent?.trim() ?? "--",
        };
    const inputs = scrapeCurrentInputs();
    const metrics = scrapeCurrentMetrics();
    const { chartImage, growthChartImage } = scrapeCurrentCharts();

    const updated = saveHistoryEntry(calcKey, {
      calcId: calcKey,
      calcTitle: title || t.reportTitle,
      timestamp: printDate || new Date().toISOString().slice(0, 10),
      headline,
      inputs,
      metrics,
      queryUrl: window.location.href,
      chartImage,
      growthChartImage,
    });

    setHistoryEntries(updated);
    setShowHistory(true);
    setSavedHistoryToast(true);
    window.setTimeout(() => setSavedHistoryToast(false), 1800);
    trackCalculatorHistory(calcKey, "save");
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    applyHistoryEntryToInputs(entry, shellRef.current);
    setLoadedHistoryId(entry.id);
    const calcKey = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    trackCalculatorHistory(calcKey, "load");
  };

  const handleToggleSelectHistory = (entryId: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(entryId) ? prev.filter((i) => i !== entryId) : [...prev, entryId]
    );
  };

  const isAllSelected = historyEntries.length > 0 && selectedHistoryIds.length === historyEntries.length;

  const handleSelectAllHistory = () => {
    if (isAllSelected) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(historyEntries.map((e) => e.id));
    }
  };

  const handleExportHistoryCsv = () => {
    const selected = historyEntries.filter((e) => selectedHistoryIds.includes(e.id));
    if (!selected.length) return;
    const baseName = (title || "instacalc-calculation")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "");
    const calcKey = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    trackCalculatorHistory(calcKey, "export_csv", selected.length);

    exportHistoryBatchCsv({
      filename: `${baseName}-history-comparison.csv`,
      calcTitle: title || t.reportTitle,
      timestamp: printDate || new Date().toISOString().slice(0, 10),
      entries: selected,
    });
  };

  const handlePrintHistoryPdf = () => {
    const selected = historyEntries.filter((e) => selectedHistoryIds.includes(e.id));
    if (!selected.length || typeof window === "undefined") return;
    const calcKey = id ?? window.location.pathname;
    trackCalculatorHistory(calcKey, "export_pdf", selected.length);

    const originalTitle = document.title;
    document.title = `${title || "History"} - Batch Report (${selected.length} Calculations)`;
    setPrintBatchMode(true);

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.title = originalTitle;
        setPrintBatchMode(false);
      }, 1500);
    }, 60);
  };

  const handleDeleteSelectedHistory = () => {
    const calcKey = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    const updated = deleteHistoryEntries(calcKey, selectedHistoryIds);
    setHistoryEntries(updated);
    setSelectedHistoryIds([]);
    trackCalculatorHistory(calcKey, "delete", selectedHistoryIds.length);
  };

  const handleDeleteSingleHistory = (entryId: string) => {
    const calcKey = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    const updated = deleteHistoryEntries(calcKey, [entryId]);
    setHistoryEntries(updated);
    setSelectedHistoryIds((prev) => prev.filter((i) => i !== entryId));
  };

  const handleClearAllHistory = () => {
    const calcKey = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
    clearHistoryEntries(calcKey);
    setHistoryEntries([]);
    setSelectedHistoryIds([]);
    trackCalculatorHistory(calcKey, "clear");
  };

  return (
    <section id={id} className="section">
      <div className="container">
        <div
          ref={shellRef}
          className="calculator-shell"
          data-advanced={advanced ? "on" : "off"}
          data-print-mode={printBatchMode ? "history-batch" : undefined}
        >
          {/* A4 Print Document Header */}
          <div className="print-report-header" aria-hidden="true">
            <div className="print-brand-row">
              <div className="print-brand-left">
                <div className="print-logo-mark">
                  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                    <rect width="32" height="32" rx="7" fill="#0284c7" />
                    <path d="M9 16h14M16 9v14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <span className="print-brand-name">InstaCalc</span>
                </div>
                <span className="print-brand-sub">instacalc.in • {t.reportVerified}</span>
              </div>
              <div className="print-brand-right">
                <span className="print-calc-title">{title || t.reportTitle}</span>
                {printDate ? (
                  <span className="print-timestamp">
                    {t.reportGenerated}: {printDate}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Full-width Hero Banner in A4 Print */}
          {summary ? (
            <div className="print-report-hero" aria-hidden="true">
              <span className="print-hero-label">{summary.label}</span>
              <strong className="print-hero-value">{summary.value}</strong>
            </div>
          ) : null}

          <div className="calculator-header-row">
            {modes?.length ? (
              <div className="toggle-group" aria-label={t.results}>
                {modes.map((m) => (
                  <a
                    key={m.href}
                    href={m.href}
                    className={`toggle-btn${m.active ? " active" : ""}`}
                    aria-current={m.active ? "page" : undefined}
                    onClick={() => trackNavClick("calc_modes", m.label, m.href)}
                  >
                    {m.label}
                  </a>
                ))}
              </div>
            ) : (
              <span />
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {!isOnline && (
                <div className="offline-ready-pill" role="status">
                  <span className="offline-dot" aria-hidden="true" />
                  <span>Offline Ready</span>
                </div>
              )}

              {onToggleAdvanced ? (
                <button
                  id="toggleViewBtn"
                  type="button"
                  className={`btn btn-ghost btn-sm${advanced ? " active" : ""}`}
                  aria-pressed={advanced}
                  onClick={() => {
                    const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
                    trackCalculatorToggle(calcId, "advanced_controls", !advanced);
                    onToggleAdvanced();
                  }}
                >
                  {advanced ? t.advancedOn : t.advancedOff}
                </button>
              ) : null}
            </div>
          </div>

          {/* Mobile-only sticky headline result. Position: sticky (not fixed) so
              it never creates layout shift when it appears. */}
          {summary ? (
            <div
              className={`mobile-summary-pill${heroInView ? " is-suppressed" : ""}`}
              aria-live="polite"
            >
              <span className="metric-label">{summary.label}</span>
              <span className="metric-val">{summary.value}</span>
            </div>
          ) : null}

          <div className="calc-grid">
            <div className="calc-inputs">
              <div className="print-section-title" aria-hidden="true">
                {t.reportInputs}
              </div>
              {inputs}
            </div>
            <div className="calc-results" ref={resultsRef} aria-live="polite">
              <h2 className="sr-only">{title ?? t.results}</h2>
              <div className="print-section-title" aria-hidden="true">
                {t.reportResults}
              </div>

              {/* Scenario Comparison Card (Scenario A vs B) */}
              {scenarioA && summary ? (() => {
                const delta = computeScenarioDelta(scenarioA.headline.value, summary.value);
                return (
                  <div className="compare-card" aria-live="polite">
                    <div className="compare-head">
                      <div className="compare-badge-group">
                        <span className="compare-status-dot" aria-hidden="true" />
                        <span className="compare-title">{t.comparing}</span>
                        {delta ? (
                          <span className={`compare-delta-badge is-${delta.direction}`}>
                            {delta.direction === "positive" ? "▲" : delta.direction === "negative" ? "▼" : "•"} {delta.diffPct}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost compare-clear-btn"
                        onClick={() => setScenarioA(null)}
                      >
                        {t.clearCompare}
                      </button>
                    </div>
                    <div className="compare-grid">
                      <div className="compare-item is-scenario-a">
                        <span className="compare-item-tag">{t.scenarioA}</span>
                        <strong className="compare-item-val">{scenarioA.headline.value}</strong>
                        <span className="compare-item-sub">{scenarioA.headline.label}</span>
                        {scenarioA.inputsSummary ? (
                          <span className="compare-inputs-tag">{scenarioA.inputsSummary}</span>
                        ) : null}
                      </div>
                      <div className="compare-item is-scenario-b">
                        <span className="compare-item-tag">{t.scenarioB}</span>
                        <strong className="compare-item-val">{summary.value}</strong>
                        <span className="compare-item-sub">{summary.label}</span>
                      </div>
                    </div>
                    {scenarioA.metrics && scenarioA.metrics.length > 0 ? (
                      <div className="compare-metrics-list">
                        {scenarioA.metrics.map((item) => (
                          <div key={item.label} className="compare-metric-row">
                            <span className="compare-metric-label">{item.label}</span>
                            <span className="compare-metric-a">{item.value}</span>
                            <span className="compare-metric-b">--</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })() : null}

              {/* The headline figure is the single most important thing on the
                  page, so it gets its own prominent card rather than sitting
                  in a list beside its secondary figures. This mirrors the
                  pattern used by NerdWallet, Bankrate and Google. */}
              {summary ? (
                <div className="result-hero" ref={heroRef}>
                  <span className="result-hero-label">{summary.label}</span>
                  <strong className="result-hero-value">{summary.value}</strong>
                </div>
              ) : null}

              {results}

              {/* Actions: Copy, Share, Compare, CSV, Embed, Download PDF, and Reset */}
              {summary || onReset ? (
                <div className="calc-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={copy}>
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    {copied ? t.copied : t.copySummary}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={handleShare}>
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
                      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
                    </svg>
                    {shared ? t.shared : t.share}
                  </button>
                  {summary ? (
                    <button
                      type="button"
                      className={`btn btn-ghost btn-sm${scenarioA ? " active" : ""}`}
                      onClick={handleToggleCompare}
                      aria-pressed={!!scenarioA}
                    >
                      <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M16 3h5v5" />
                        <path d="M4 20L21 3" />
                        <path d="M21 16v5h-5" />
                        <path d="M15 15l6 6" />
                        <path d="M4 4l5 5" />
                      </svg>
                      {scenarioA ? t.comparing : t.compare}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleExportCsv}
                  >
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {exportedCsv ? t.exportedCsv : t.exportCsv}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleOpenEmbed}
                  >
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    {t.embed}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={handleSaveHistory}
                    title={t.saveHistory}
                  >
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    {savedHistoryToast ? t.savedHistory : t.saveHistory}
                  </button>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-sm${showHistory ? " active" : ""}`}
                    onClick={() => setShowHistory((prev) => !prev)}
                    aria-pressed={showHistory}
                  >
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {t.history}
                    {historyEntries.length > 0 ? (
                      <span className="history-toggle-badge">{historyEntries.length}</span>
                    ) : null}
                  </button>
                  <button type="button" className="btn btn-primary btn-sm calc-pdf-btn" onClick={handlePrintPdf}>
                    <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 9V2h12v7" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect width="12" height="8" x="6" y="14" />
                    </svg>
                    {t.downloadPdf}
                  </button>
                  {onReset ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        const calcId = id ?? (typeof window !== "undefined" ? window.location.pathname : "calc");
                        trackCalculatorReset(calcId);
                        onReset();
                      }}
                    >
                      <svg className="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                      {t.reset}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {/* Interactive Calculation History Panel */}
              {showHistory && (
                <div className="history-card" aria-live="polite">
                  <div className="history-head">
                    <div className="history-title">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{t.historyTitle}</span>
                      <span className="history-badge-count">{historyEntries.length}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm history-close-btn"
                      aria-label={t.closeMenu}
                      onClick={() => setShowHistory(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {historyEntries.length === 0 ? (
                    <div className="history-empty">{t.historyEmpty}</div>
                  ) : (
                    <>
                      <div className="history-toolbar">
                        <label className="history-select-label">
                          <input
                            type="checkbox"
                            className="history-select-all"
                            checked={isAllSelected}
                            onChange={handleSelectAllHistory}
                          />
                          <span>{t.selectAll} ({selectedHistoryIds.length}/{historyEntries.length})</span>
                        </label>
                        <div className="history-batch-actions">
                          {selectedHistoryIds.length > 0 ? (
                            <>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm history-batch-btn"
                                onClick={handlePrintHistoryPdf}
                              >
                                {t.exportSelectedPdf} ({selectedHistoryIds.length})
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm history-batch-btn"
                                onClick={handleExportHistoryCsv}
                              >
                                {t.exportSelectedCsv} ({selectedHistoryIds.length})
                              </button>
                              <button
                                type="button"
                                className="btn btn-ghost btn-sm history-batch-btn"
                                onClick={handleDeleteSelectedHistory}
                              >
                                {t.deleteSelected}
                              </button>
                            </>
                          ) : null}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm history-clear-btn"
                            onClick={handleClearAllHistory}
                          >
                            {t.clearHistory}
                          </button>
                        </div>
                      </div>

                      <ul className="history-list">
                        {historyEntries.map((item, idx) => {
                          const isChecked = selectedHistoryIds.includes(item.id);
                          const isLoaded = loadedHistoryId === item.id;
                          return (
                            <li key={item.id} className="history-item">
                              <div className="history-item-check">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleSelectHistory(item.id)}
                                  aria-label={`Select run #${idx + 1}`}
                                />
                              </div>
                              {item.chartImage && (
                                <div className="history-item-chart" aria-hidden="true">
                                  <img src={item.chartImage} alt="Chart preview" />
                                </div>
                              )}
                              <div className="history-item-main">
                                <div className="history-item-top">
                                  <strong className="history-item-headline">{item.headline.value}</strong>
                                  <span className="history-item-time">#{idx + 1} • {item.timestamp}</span>
                                </div>
                                <div className="history-item-inputs">
                                  {item.inputs.map((inp) => `${inp.label}: ${inp.displayValue}`).join(" • ")}
                                </div>
                                {item.metrics.length > 0 ? (
                                  <div className="history-item-metrics">
                                    {item.metrics.map((m) => `${m.label}: ${m.value}`).join(" | ")}
                                  </div>
                                ) : null}
                              </div>
                              <div className="history-item-actions">
                                <button
                                  type="button"
                                  className={`btn btn-ghost btn-sm history-load-btn${isLoaded ? " active" : ""}`}
                                  onClick={() => handleLoadHistory(item)}
                                  title={t.loadHistory}
                                >
                                  {isLoaded ? t.loadedHistory : t.loadHistory}
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-ghost btn-sm history-delete-btn"
                                  onClick={() => handleDeleteSingleHistory(item.id)}
                                  aria-label="Delete"
                                >
                                  ✕
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              )}

              <div className="calc-disclaimer-note">
                <small>
                  {locale === "ja"
                    ? "※ 本ツールの試算結果はシミュレーションであり、将来の運用成果や実際の税額・支払額を保証するものではありません。金融・税務判断は専門家にご相談ください。"
                    : locale === "ru"
                    ? "Внимание: расчет носит информационно-ознакомительный характер и не является индивидуальной финансовой, налоговой или инвестиционной рекомендацией."
                    : locale === "ko"
                    ? "※ 본 계산 결과는 단순 모의 시뮬레이션용 수치이며 실제 지급액이나 공제액과 차이가 있을 수 있습니다. 공인 재무·세무 전문가와 상담하시기 바랍니다."
                    : "Disclaimer: Calculations and projections are for educational and illustrative purposes only and do not constitute certified financial, tax, or investment advice."}
                </small>
              </div>
            </div>
          </div>

          {!printBatchMode && children}

          {/* Batch A4 History PDF Report */}
          {printBatchMode && (
            <div className="print-history-batch" aria-hidden="true">
              <div className="print-history-summary-page">
                <div className="print-section-title">
                  Executive Summary — Multi-Calculation Comparison ({selectedHistoryIds.length} Selected Plans)
                </div>
                <table className="print-history-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Date</th>
                      <th>Headline Result</th>
                      <th>Key Inputs</th>
                      <th>Key Metrics</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyEntries
                      .filter((e) => selectedHistoryIds.includes(e.id))
                      .map((e, idx) => (
                        <tr key={e.id}>
                          <td><strong>Plan #{idx + 1}</strong></td>
                          <td>{e.timestamp}</td>
                          <td><strong>{e.headline.value}</strong> ({e.headline.label})</td>
                          <td>{e.inputs.map((i) => `${i.label}: ${i.displayValue}`).join("; ")}</td>
                          <td>{e.metrics.map((m) => `${m.label}: ${m.value}`).join("; ") || "--"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {historyEntries
                .filter((e) => selectedHistoryIds.includes(e.id))
                .map((e, idx, arr) => (
                  <div key={e.id} className="print-plan-full-card">
                    <div className="print-plan-head">
                      <div className="print-plan-badge-group">
                        <span className="print-plan-num">Plan #{idx + 1} of {arr.length}</span>
                        <span className="print-plan-title">{e.calcTitle || title || t.reportTitle}</span>
                      </div>
                      <span className="print-plan-date">{e.timestamp}</span>
                    </div>

                    {/* Headline Hero Banner for this Plan */}
                    <div className="print-plan-hero">
                      <span className="print-hero-label">{e.headline.label}</span>
                      <strong className="print-hero-value">{e.headline.value}</strong>
                    </div>

                    {/* 2-Column Body: Inputs on left, Breakdown & Chart on right */}
                    <div className="print-plan-body-grid">
                      <div className="print-plan-inputs-col">
                        <div className="print-section-title">{t.reportInputs}</div>
                        <div className="print-plan-inputs-list">
                          {e.inputs.map((inp) => (
                            <div key={inp.key} className="print-plan-input-row">
                              <span className="print-plan-input-label">{inp.label}</span>
                              <strong className="print-plan-input-val">{inp.displayValue}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="print-plan-results-col">
                        <div className="print-section-title">{t.reportResults}</div>
                        <div className="print-plan-tiles-grid">
                          {e.metrics.map((m) => (
                            <div key={m.label} className="print-plan-tile">
                              <span className="print-plan-tile-label">{m.label}</span>
                              <strong className="print-plan-tile-val">{m.value}</strong>
                            </div>
                          ))}
                        </div>

                        {/* Dedicated Breakdown Graph for this Plan */}
                        {e.chartImage && (
                          <div className="print-plan-chart-box">
                            <div className="print-plan-chart-label">Breakdown Graph</div>
                            <img
                              src={e.chartImage}
                              alt={`Chart for Plan #${idx + 1}`}
                              className="print-plan-chart-img"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Growth Chart if captured */}
                    {e.growthChartImage && (
                      <div className="print-plan-growth-box">
                        <div className="print-section-title">Growth Timeline</div>
                        <img
                          src={e.growthChartImage}
                          alt={`Growth chart for Plan #${idx + 1}`}
                          className="print-plan-growth-img"
                        />
                      </div>
                    )}

                    <div className="print-plan-page-footer">
                      <span>Plan #{idx + 1} • {e.headline.value}</span>
                      <span>InstaCalc Verified Calculation Report</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* A4 Print Document Footer */}
          <div className="print-report-footer" aria-hidden="true">
            <div className="print-footer-grid">
              <div className="print-footer-left">
                <p className="print-footer-disclaimer">{t.reportDisclaimer}</p>
              </div>
              <div className="print-footer-right">
                <span className="print-footer-badge">instacalc.in</span>
                <span className="print-footer-page">A4 Document</span>
              </div>
            </div>
          </div>

          {/* Micro Attribution Bar in Embedded Mode */}
          <div className="embed-attribution-bar" aria-hidden="true">
            <a href={typeof window !== "undefined" ? window.location.pathname : "/"} target="_blank" rel="noopener noreferrer">
              Powered by <strong>InstaCalc</strong> ↗
            </a>
          </div>
        </div>

        {!printBatchMode && (
          <RelatedCalculators locale={locale} currentPath={path} />
        )}
      </div>

      {showEmbed && (
        <div
          className="embed-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="embed-dialog-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEmbed(false);
          }}
        >
          <div className="embed-modal">
            <div className="embed-modal-head">
              <h3 id="embed-dialog-title" className="embed-modal-title">
                {t.embedTitle}
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-sm embed-close-btn"
                aria-label={t.closeMenu}
                onClick={() => setShowEmbed(false)}
              >
                ✕
              </button>
            </div>
            <p className="embed-modal-desc">{t.embedDesc}</p>

            {/* Embed Customizer Options */}
            <div className="embed-options-row">
              <div className="embed-option-group">
                <span className="embed-option-label">Theme:</span>
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm embed-option-btn${isThemeLight ? " active" : ""}`}
                  onClick={() => setEmbedTheme("light")}
                >
                  Light
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm embed-option-btn${isThemeDark ? " active" : ""}`}
                  onClick={() => setEmbedTheme("dark")}
                >
                  Dark
                </button>
              </div>

              <div className="embed-option-group">
                <span className="embed-option-label">Size:</span>
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm embed-option-btn${isStandardSize ? " active" : ""}`}
                  onClick={() => setEmbedCompact(false)}
                >
                  Standard
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost btn-sm embed-option-btn${isCompactSize ? " active" : ""}`}
                  onClick={() => setEmbedCompact(true)}
                >
                  Compact
                </button>
              </div>

              <label className="embed-checkbox-label">
                <input
                  type="checkbox"
                  checked={embedIncludeParams}
                  onChange={(e) => setEmbedIncludeParams(e.target.checked)}
                />
                <span>Include current values</span>
              </label>
            </div>

            <div className="embed-code-wrap">
              <textarea
                className="embed-code-box"
                rows={3}
                readOnly
                value={getEmbedSnippet()}
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
            </div>
            <div className="embed-modal-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setShowEmbed(false)}
              >
                {t.closeMenu}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCopyEmbed}
              >
                {embedCopied ? t.embedCopied : t.copySummary}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Secondary figures, rendered as a grid of tiles.
 *
 * A flat label/value list makes every figure carry equal weight. Competitors
 * lead with one big number and group the supporting figures into scannable
 * cards, so the user can tell at a glance which number answers their question.
 */
export function ResultList({ items }: { items: ResultItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="result-grid">
      {items.map((r) => (
        <li key={r.label} className={`result-tile${r.emphasis ? " is-primary" : ""}`}>
          <span className="result-label">{r.label}</span>
          <span className="result-value">{r.value}</span>
          {r.hint ? <span className="result-hint">{r.hint}</span> : null}
        </li>
      ))}
    </ul>
  );
}
