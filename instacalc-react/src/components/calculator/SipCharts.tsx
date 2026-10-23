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
import type { SipYearRow } from "@/engines/sip";
import { formatCompact, formatWithUnits } from "@/lib/currency";

// Register Chart.js modules once at module load
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

interface BreakdownLabels {
  invested: string;
  returns: string;
  centerBadge: string;
  ariaLabel: string;
}

const BREAKDOWN_LABELS: Record<Locale, BreakdownLabels> = {
  en: {
    invested: "Total Invested",
    returns: "Estimated Returns",
    centerBadge: "Returns",
    ariaLabel: "Investment versus estimated returns breakdown doughnut chart",
  },
  us: {
    invested: "Total Contributed",
    returns: "Investment Growth",
    centerBadge: "Growth",
    ariaLabel: "Contributions versus growth breakdown doughnut chart",
  },
  ja: {
    invested: "投資合計額",
    returns: "推定収益額",
    centerBadge: "収益比率",
    ariaLabel: "投資額と推定収益の内訳円グラフ",
  },
  ru: {
    invested: "Всего вложено",
    returns: "Доход",
    centerBadge: "Доход",
    ariaLabel: "Круговая диаграмма соотношения вложений и дохода",
  },
  ko: {
    invested: "총 투자액",
    returns: "예상 수익",
    centerBadge: "수익률",
    ariaLabel: "투자액 대비 예상 수익 도넛 차트",
  },
};

/**
 * Doughnut breakdown chart showing proportion of Total Invested vs Estimated Returns.
 * Renders server-safe markup during SSR and hydrates canvas in the browser.
 */
export function SipBreakdownChart({
  invested,
  returns,
  locale,
}: {
  invested: number;
  returns: number;
  locale: Locale;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const t = BREAKDOWN_LABELS[locale] ?? BREAKDOWN_LABELS.en;
  const total = invested + returns;
  const investedPct = total > 0 ? Math.round((invested / total) * 100) : 0;
  const returnsPct = total > 0 ? 100 - investedPct : 0;

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
        labels: [t.invested, t.returns],
        datasets: [
          {
            data: [Math.max(invested, 0), Math.max(returns, 0)],
            backgroundColor: ["#0284c7", "#10b981"],
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
            titleFont: { family: "sans-serif", weight: "bold" },
            bodyFont: { family: "sans-serif" },
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
  }, [invested, returns, locale, t.invested, t.returns]);

  return (
    <div className="chart-breakdown-card">
      <div className="chart-wrap-doughnut">
        <canvas ref={canvasRef} aria-label={t.ariaLabel} role="img" />
        <div className="chart-center-metric" aria-hidden="true">
          <span className="chart-center-val">{returnsPct}%</span>
          <span className="chart-center-sub">{t.centerBadge}</span>
        </div>
      </div>
      <div className="chart-legend-row">
        <div className="chart-legend-item">
          <span className="chart-dot chart-dot-invested" />
          <span className="chart-legend-label">
            {t.invested} ({investedPct}%)
          </span>
        </div>
        <div className="chart-legend-item">
          <span className="chart-dot chart-dot-returns" />
          <span className="chart-legend-label">
            {t.returns} ({returnsPct}%)
          </span>
        </div>
      </div>
    </div>
  );
}

interface GrowthLabels {
  title: string;
  subtitle: string;
  corpus: string;
  invested: string;
  yearPrefix: string;
  yearSuffix: string;
  ariaLabel: string;
}

const GROWTH_LABELS: Record<Locale, GrowthLabels> = {
  en: {
    title: "Wealth Growth Journey",
    subtitle: "Projected corpus vs total invested over time",
    corpus: "Projected Corpus",
    invested: "Total Invested",
    yearPrefix: "Yr ",
    yearSuffix: "",
    ariaLabel: "Area chart showing projected wealth growth over the investment tenure",
  },
  us: {
    title: "Wealth Growth Journey",
    subtitle: "Projected balance vs total contributions over time",
    corpus: "Projected Balance",
    invested: "Total Contributed",
    yearPrefix: "Yr ",
    yearSuffix: "",
    ariaLabel: "Area chart showing projected portfolio growth over time",
  },
  ja: {
    title: "資産形成シミュレーション推移",
    subtitle: "総投資額と資産残高の推移グラフ",
    corpus: "資産総額",
    invested: "投資累計額",
    yearPrefix: "",
    yearSuffix: "年目",
    ariaLabel: "投資累計額と資産総額の推移チャート",
  },
  ru: {
    title: "Динамика роста капитала",
    subtitle: "График накоплений и инвестиционного дохода",
    corpus: "Итоговый капитал",
    invested: "Всего вложено",
    yearPrefix: "",
    yearSuffix: " г.",
    ariaLabel: "График динамики роста инвестированного капитала по годам",
  },
  ko: {
    title: "자산 형성 추이",
    subtitle: "총 투자액 대비 예상 자산 추이",
    corpus: "예상 자산",
    invested: "총 투자액",
    yearPrefix: "",
    yearSuffix: "년",
    ariaLabel: "연도별 총 투자액과 예상 자산 증가 차트",
  },
};

/**
 * Area & Line chart showing the year-wise compounding trajectory of the SIP.
 */
export function SipGrowthChart({
  rows,
  locale,
}: {
  rows: SipYearRow[];
  locale: Locale;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const t = GROWTH_LABELS[locale] ?? GROWTH_LABELS.en;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Linear gradient fill for corpus curve
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, "rgba(2, 132, 199, 0.28)");
    gradient.addColorStop(1, "rgba(2, 132, 199, 0.01)");

    const labels = rows.map((r) => `${t.yearPrefix}${r.year}${t.yearSuffix}`);
    const corpusData = rows.map((r) => r.balance);
    const investedData = rows.map((r) => r.contributed);

    chartRef.current = new ChartJS(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: t.corpus,
            data: corpusData,
            borderColor: "#0284c7",
            backgroundColor: gradient,
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: rows.length > 20 ? 0 : 2,
            pointHoverRadius: 5,
            pointBackgroundColor: "#0284c7",
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: "#0284c7",
            pointHoverBorderWidth: 2,
          },
          {
            label: t.invested,
            data: investedData,
            borderColor: "#64748b",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.1,
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#64748b",
          },
        ],
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
  }, [rows, locale, t.corpus, t.invested, t.yearPrefix, t.yearSuffix]);

  if (!rows.length) return null;

  return (
    <div className="growth-timeline-card">
      <div className="growth-timeline-header">
        <div>
          <h3 className="chart-heading">{t.title}</h3>
          <p className="chart-subheading">{t.subtitle}</p>
        </div>
      </div>
      <div className="chart-wrap-timeline">
        <canvas ref={canvasRef} aria-label={t.ariaLabel} role="img" />
      </div>
    </div>
  );
}
