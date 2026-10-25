/**
 * csvExport.ts — Universal table, schedule, and multi-section financial workbook export to CSV.
 *
 * Emits UTF-8 with BOM (\uFEFF) so Microsoft Excel, Apple Numbers, and
 * Google Sheets across all languages (English, Japanese, Korean, Russian)
 * correctly render currency symbols and regional scripts without garbled text.
 */

function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  // If the cell contains quotes, commas, or line breaks, quote it and escape internal quotes
  if (str.includes('"') || str.includes(",") || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export function exportTableToCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
) {
  if (typeof window === "undefined") return;

  const csvRows: string[] = [];

  if (headers && headers.length > 0) {
    csvRows.push(headers.map(escapeCsvCell).join(","));
  }

  for (const row of rows) {
    csvRows.push(row.map(escapeCsvCell).join(","));
  }

  downloadCsvBlob(filename, csvRows);
}

export interface FinancialWorkbookOptions {
  filename: string;
  calcTitle: string;
  timestamp: string;
  pageUrl: string;
  inputs?: Array<{ label: string; value: string }>;
  results?: Array<{
    label: string;
    value: string;
    scenarioA?: string;
    scenarioB?: string;
    delta?: string;
  }>;
  schedule?: {
    title?: string;
    headers: string[];
    rows: (string | number)[][];
  };
}

/**
 * Exports a structured multi-section financial workbook CSV containing:
 * 1. Report Metadata (Title, Date, Deep-Link URL)
 * 2. Input Parameters
 * 3. Calculation Summary (and Scenario Comparison if active)
 * 4. Year-by-Year Schedule / Amortization Table
 */
export function exportFinancialWorkbookCsv(opts: FinancialWorkbookOptions) {
  if (typeof window === "undefined") return;

  const csvRows: string[] = [];

  // Section 1: Report Metadata
  csvRows.push([escapeCsvCell("INSTACALC FINANCIAL REPORT"), escapeCsvCell(opts.calcTitle)].join(","));
  csvRows.push([escapeCsvCell("Generated Date"), escapeCsvCell(opts.timestamp)].join(","));
  csvRows.push([escapeCsvCell("Interactive URL"), escapeCsvCell(opts.pageUrl)].join(","));
  csvRows.push("");

  // Section 2: Input Parameters
  if (opts.inputs && opts.inputs.length > 0) {
    csvRows.push([escapeCsvCell("--- INPUT PARAMETERS ---")].join(","));
    csvRows.push([escapeCsvCell("Parameter"), escapeCsvCell("Value")].join(","));
    for (const inp of opts.inputs) {
      csvRows.push([escapeCsvCell(inp.label), escapeCsvCell(inp.value)].join(","));
    }
    csvRows.push("");
  }

  // Section 3: Results & Comparison
  if (opts.results && opts.results.length > 0) {
    const hasComparison = opts.results.some((r) => r.scenarioA !== undefined);
    if (hasComparison) {
      csvRows.push([escapeCsvCell("--- SCENARIO COMPARISON ---")].join(","));
      csvRows.push(
        [
          escapeCsvCell("Metric"),
          escapeCsvCell("Scenario A"),
          escapeCsvCell("Scenario B (Current)"),
          escapeCsvCell("Difference (Δ)"),
        ].join(",")
      );
      for (const res of opts.results) {
        csvRows.push(
          [
            escapeCsvCell(res.label),
            escapeCsvCell(res.scenarioA ?? res.value),
            escapeCsvCell(res.scenarioB ?? res.value),
            escapeCsvCell(res.delta ?? "--"),
          ].join(",")
        );
      }
    } else {
      csvRows.push([escapeCsvCell("--- CALCULATION SUMMARY ---")].join(","));
      csvRows.push([escapeCsvCell("Metric"), escapeCsvCell("Calculated Result")].join(","));
      for (const res of opts.results) {
        csvRows.push([escapeCsvCell(res.label), escapeCsvCell(res.value)].join(","));
      }
    }
    csvRows.push("");
  }

  // Section 4: Schedule / Table
  if (opts.schedule && opts.schedule.headers.length > 0 && opts.schedule.rows.length > 0) {
    csvRows.push([escapeCsvCell(`--- ${opts.schedule.title || "PROJECTION / AMORTIZATION SCHEDULE"} ---`)].join(","));
    csvRows.push(opts.schedule.headers.map(escapeCsvCell).join(","));
    for (const row of opts.schedule.rows) {
      csvRows.push(row.map(escapeCsvCell).join(","));
    }
    csvRows.push("");
  }

  // Footer Disclaimer
  csvRows.push(
    [
      escapeCsvCell("Disclaimer"),
      escapeCsvCell(
        "Calculations are for educational and illustrative simulation purposes only. Consult certified financial and tax professionals for binding decisions."
      ),
    ].join(",")
  );

  downloadCsvBlob(opts.filename, csvRows);
}

export interface HistoryBatchCsvOptions {
  filename: string;
  calcTitle: string;
  timestamp: string;
  entries: Array<{
    id: string;
    timestamp: string;
    headline: { label: string; value: string };
    inputs: Array<{ key: string; label: string; rawValue: string; displayValue: string }>;
    metrics: Array<{ label: string; value: string }>;
    queryUrl: string;
  }>;
}

/**
 * Exports multiple selected calculation history runs into a multi-section comparison CSV.
 * Section 1: Report Metadata
 * Section 2: Side-by-Side Comparison Matrix across all selected runs
 * Section 3: Chronological History Log Table
 */
export function exportHistoryBatchCsv(opts: HistoryBatchCsvOptions) {
  if (typeof window === "undefined" || !opts.entries.length) return;

  const csvRows: string[] = [];

  // Section 1: Report Metadata
  csvRows.push([escapeCsvCell("INSTACALC CALCULATION HISTORY REPORT"), escapeCsvCell(opts.calcTitle)].join(","));
  csvRows.push([escapeCsvCell("Export Date"), escapeCsvCell(opts.timestamp)].join(","));
  csvRows.push([escapeCsvCell("Total Selected Runs"), escapeCsvCell(String(opts.entries.length))].join(","));
  csvRows.push("");

  // Section 2: Side-by-Side Comparison Matrix
  csvRows.push([escapeCsvCell("--- SIDE-BY-SIDE RUN COMPARISON MATRIX ---")].join(","));
  const matrixHeaders = [
    escapeCsvCell("Parameter / Metric"),
    ...opts.entries.map((e, idx) => escapeCsvCell(`Run #${idx + 1} (${e.timestamp})`)),
  ];
  csvRows.push(matrixHeaders.join(","));

  // Headline Result Row
  const headlineRow = [
    escapeCsvCell(`Headline Result (${opts.entries[0]?.headline.label || "Result"})`),
    ...opts.entries.map((e) => escapeCsvCell(e.headline.value)),
  ];
  csvRows.push(headlineRow.join(","));

  // Collect unique input labels in order
  const inputLabels: string[] = [];
  opts.entries.forEach((e) => {
    e.inputs.forEach((inp) => {
      if (!inputLabels.includes(inp.label)) inputLabels.push(inp.label);
    });
  });

  inputLabels.forEach((label) => {
    const row = [
      escapeCsvCell(label),
      ...opts.entries.map((e) => {
        const found = e.inputs.find((i) => i.label === label);
        return escapeCsvCell(found?.displayValue || "--");
      }),
    ];
    csvRows.push(row.join(","));
  });

  // Collect unique metric labels in order
  const metricLabels: string[] = [];
  opts.entries.forEach((e) => {
    e.metrics.forEach((m) => {
      if (!metricLabels.includes(m.label)) metricLabels.push(m.label);
    });
  });

  metricLabels.forEach((label) => {
    const row = [
      escapeCsvCell(label),
      ...opts.entries.map((e) => {
        const found = e.metrics.find((m) => m.label === label);
        return escapeCsvCell(found?.value || "--");
      }),
    ];
    csvRows.push(row.join(","));
  });
  csvRows.push("");

  // Section 3: History Log Table
  csvRows.push([escapeCsvCell("--- CHRONOLOGICAL HISTORY LOG ---")].join(","));
  csvRows.push(
    [
      escapeCsvCell("Run #"),
      escapeCsvCell("Timestamp"),
      escapeCsvCell("Headline Result"),
      escapeCsvCell("Input Summary"),
      escapeCsvCell("Breakdown Metrics"),
      escapeCsvCell("Interactive Link"),
    ].join(",")
  );

  opts.entries.forEach((e, idx) => {
    const inputsSummary = e.inputs.map((i) => `${i.label}: ${i.displayValue}`).join(" | ");
    const metricsSummary = e.metrics.map((m) => `${m.label}: ${m.value}`).join(" | ");
    csvRows.push(
      [
        escapeCsvCell(String(idx + 1)),
        escapeCsvCell(e.timestamp),
        escapeCsvCell(`${e.headline.label}: ${e.headline.value}`),
        escapeCsvCell(inputsSummary),
        escapeCsvCell(metricsSummary),
        escapeCsvCell(e.queryUrl),
      ].join(",")
    );
  });
  csvRows.push("");

  // Disclaimer
  csvRows.push(
    [
      escapeCsvCell("Disclaimer"),
      escapeCsvCell(
        "Calculations are for educational and simulation purposes only. Consult certified professionals for financial decisions."
      ),
    ].join(",")
  );

  downloadCsvBlob(opts.filename, csvRows);
}

function downloadCsvBlob(filename: string, lines: string[]) {
  // Prepend \uFEFF BOM for Excel UTF-8 recognition
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", cleanFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Extracts headers and rows from any rendered HTML table element.
 */
export function scrapeTableData(tableEl: HTMLTableElement): { headers: string[]; rows: string[][] } {
  const headers: string[] = [];
  const rows: string[][] = [];

  // 1. Extract headers from <thead> or first <tr>
  const thEls = tableEl.querySelectorAll("thead th, tr:first-child th");
  thEls.forEach((th) => {
    headers.push(th.textContent?.trim() ?? "");
  });

  // 2. Extract data rows
  const rowEls = tableEl.querySelectorAll("tbody tr, tr:not(:first-child)");
  rowEls.forEach((tr) => {
    const cells = tr.querySelectorAll("td, th[scope='row']");
    if (cells.length > 0) {
      const rowData: string[] = [];
      cells.forEach((cell) => {
        rowData.push(cell.textContent?.trim() ?? "");
      });
      rows.push(rowData);
    }
  });

  return { headers, rows };
}
