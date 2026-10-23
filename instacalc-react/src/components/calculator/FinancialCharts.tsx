import { useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  LineController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import type { Locale } from "@/config/site";
import { formatCompact, formatWithUnits } from "@/lib/currency";

// Register Chart.js components once at module evaluation
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  LineController,
  DoughnutController,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  Legend
);

export interface DonutItem {
  label: string;
  value: number;
  color?: string;
}

export interface BreakdownDonutProps {
  items: DonutItem[];
  centerLabel?: string;
  locale: Locale;
  ariaLabel?: string;
}

const DEFAULT_COLORS = [
  "#0284c7", // Blue (primary)
  "#10b981", // Emerald (gain / interest)
  "#f59e0b", // Amber (tax / deduction)
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#0d9488", // Teal
  "#8b5cf6", // Purple
];

/**
 * Reusable breakdown doughnut chart for financial ratios.
 * Handles SSR safely (no canvas operations during SSR) and client hydration.
 */
export function BreakdownDonutChart({
  items,
  centerLabel,
  locale,
  ariaLabel = "Financial breakdown chart",
}: BreakdownDonutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const total = items.reduce((sum, item) => sum + Math.max(0, item.value), 0);

  const decoratedItems = items.map((item, index) => {
    const val = Math.max(0, item.value);
    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
    const color = item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    return { ...item, val, pct, color };
  });

  // Pick highlight metric for the doughnut center
  const highlightItem = decoratedItems[1] ?? decoratedItems[0];
  const centerDisplayVal = highlightItem ? `${highlightItem.pct}%` : "0%";
  const centerDisplaySub = centerLabel ?? highlightItem?.label ?? "";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    chartRef.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: decoratedItems.map((i) => i.label),
        datasets: [
          {
            data: decoratedItems.map((i) => i.val),
            backgroundColor: decoratedItems.map((i) => i.color),
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const val = Number(context.raw) || 0;
                return ` ${context.label}: ${formatWithUnits(locale, val)}`;
              },
            },
            backgroundColor: "#0f172a",
            titleFont: { family: "Public Sans, sans-serif", weight: "bold" },
            bodyFont: { family: "Public Sans, sans-serif" },
            padding: 10,
            cornerRadius: 8,
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [items, locale]);

  if (!items.length || total <= 0) return null;

  return (
    <div className="chart-breakdown-card">
      <div className="chart-wrap-doughnut">
        <canvas ref={canvasRef} aria-label={ariaLabel} role="img" />
        <div className="chart-center-metric" aria-hidden="true">
          <span className="chart-center-val">{centerDisplayVal}</span>
          <span className="chart-center-sub">{centerDisplaySub}</span>
        </div>
      </div>
      <div className="chart-legend-row">
        {decoratedItems.map((item, idx) => (
          <div key={idx} className="chart-legend-item">
            <span className="chart-dot" style={{ backgroundColor: item.color }} />
            <span className="chart-legend-label">
              {item.label} ({item.pct}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface TimelineDataset {
  label: string;
  data: number[];
  color?: string;
  fill?: boolean;
  dashed?: boolean;
}

export interface TimelineGrowthProps {
  title?: string;
  subtitle?: string;
  labels: string[];
  datasets: TimelineDataset[];
  locale: Locale;
  ariaLabel?: string;
}

/**
 * Reusable growth & trajectory chart for loan payoff, deposit growth, and retirement curves.
 */
export function TimelineGrowthChart({
  title = "Growth Trajectory",
  subtitle,
  labels,
  datasets,
  locale,
  ariaLabel = "Growth timeline chart",
}: TimelineGrowthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chartDatasets = datasets.map((ds, index) => {
      const color = ds.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];

      let background: any = "transparent";
      if (ds.fill) {
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, hexToRgba(color, 0.28));
        gradient.addColorStop(1, hexToRgba(color, 0.01));
        background = gradient;
      }

      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: background,
        fill: ds.fill ?? false,
        tension: 0.35,
        borderWidth: ds.dashed ? 2 : 2.5,
        borderDash: ds.dashed ? [5, 4] : undefined,
        pointRadius: labels.length > 25 ? 0 : 2,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: color,
        pointHoverBorderWidth: 2,
      };
    });

    chartRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: chartDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        layout: {
          padding: { top: 8, right: 8, bottom: 4, left: 4 },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 16,
              color: "#475569",
              font: { family: "Public Sans, sans-serif", size: 12 },
            },
          },
          tooltip: {
            backgroundColor: "#0f172a",
            titleFont: { family: "Public Sans, sans-serif", size: 13, weight: "bold" },
            bodyFont: { family: "Public Sans, sans-serif", size: 12 },
            padding: 10,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const val = Number(context.parsed.y) || 0;
                return ` ${context.dataset.label}: ${formatWithUnits(locale, val)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: "#64748b",
              font: { family: "Public Sans, sans-serif", size: 11 },
              maxRotation: 0,
              autoSkip: true,
              autoSkipPadding: 16,
            },
          },
          y: {
            border: { display: false },
            grid: {
              color: "rgba(148, 163, 184, 0.15)",
            },
            ticks: {
              color: "#64748b",
              font: { family: "Public Sans, sans-serif", size: 11 },
              callback: (value) => formatCompact(locale, Number(value)),
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, locale]);

  if (!labels.length || !datasets.length) return null;

  return (
    <div className="growth-timeline-card">
      <div className="growth-timeline-header">
        <div>
          <h3 className="chart-heading">{title}</h3>
          {subtitle ? <p className="chart-subheading">{subtitle}</p> : null}
        </div>
      </div>
      <div className="chart-wrap-timeline">
        <canvas ref={canvasRef} aria-label={ariaLabel} role="img" />
      </div>
    </div>
  );
}

/** Helper to convert hex colors to rgba for gradients */
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return `rgba(2, 132, 199, ${alpha})`;
}
