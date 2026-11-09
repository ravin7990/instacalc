import { useMemo } from "react";
import type { Locale } from "@/config/site";
import { triangleLabels, translateClassification } from "@/i18n/triangle-labels";

export type TriangleVisualMode = "obtuse" | "scalene" | "isosceles" | "any3" | "right" | "trapezoid";

export interface TriangleDiagramData {
  mode: TriangleVisualMode;
  h?: number;
  c?: number;
  w?: number;
  sideA?: number;
  sideB?: number;
  sideC?: number;
  angleA?: number;
  angleB?: number;
  angleC?: number;
  area?: number;
  perimeter?: number;
  classification?: string;
  slant?: number;
  taperAngle?: number;
  unit?: string;
}

export interface ObtuseTriangleDiagramProps {
  data: TriangleDiagramData;
  title?: string;
  locale?: Locale;
}

const formatNum = (n: number | undefined): string => {
  if (n === undefined || isNaN(n)) return "0";
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(3)).toString();
};

export function ObtuseTriangleDiagram({ data, title, locale = "en" }: ObtuseTriangleDiagramProps) {
  const t = triangleLabels(locale);
  const vbW = 490;
  const vbH = 300;

  // Colors matching the purple/indigo mobile app and InstaCalc tokens
  const colShape = "#7c3aed"; // Violet / Purple (triangle outline)
  const colA = "#6366f1"; // Side A (Indigo)
  const colB = "#8b5cf6"; // Side B (Purple)
  const colC = "#0d9488"; // Base C (Teal)
  const colH = "#0284c7"; // Height H (Blue)
  const colW = "#d97706"; // Overhang W (Amber)
  const colAngle = "#e11d48"; // Angles (Rose)
  const colDatum = "#94a3b8"; // Datum / drop lines (Slate)

  const {
    mode,
    h = 10,
    c = 15,
    w = 6,
    sideA = 0,
    sideB = 0,
    sideC = 0,
    angleA = 0,
    angleB = 0,
    angleC = 0,
    area = 0,
    perimeter = 0,
    slant = 0,
    taperAngle = 0,
    unit = "",
  } = data;

  const modeTitle =
    title ??
    (mode === "obtuse"
      ? "Obtuse Triangle (Enter H, C and W)"
      : mode === "scalene"
      ? "Scalene Triangle (Enter H, C and W)"
      : mode === "isosceles"
      ? "Isosceles Triangle (Enter H and C)"
      : mode === "right"
      ? "Right Triangle"
      : mode === "trapezoid"
      ? "Right Trapezoid / Taper Wedge"
      : "Triangle (Enter any 3 values)");

  const uStr = unit ? ` ${unit}` : "";

  const content = useMemo(() => {
    const originX = 55;
    const originY = 40;
    const availW = 310;
    const availH = 175;

    // --- 1. OBTUSE TRIANGLE (Screenshot 3: Apex offset outside base to the left) ---
    if (mode === "obtuse") {
      const totalW = Math.max(0.001, w + c);
      const safeH = Math.max(0.001, h);

      const ratio = totalW / safeH;
      const clamped = Math.max(0.4, Math.min(3.2, ratio));

      let renderW = availW;
      let renderH = availH;
      if (clamped > availW / availH) {
        renderW = availW;
        renderH = availW / clamped;
      } else {
        renderH = availH;
        renderW = availH * clamped;
      }

      const scaleX = renderW / totalW;
      const x0 = originX + (availW - renderW) / 2;
      const y0 = originY + (availH - renderH) / 2;
      const groundY = y0 + renderH;

      const pApex = { x: x0, y: y0 };
      const pDrop = { x: x0, y: groundY };
      const pObtuse = { x: x0 + w * scaleX, y: groundY };
      const pRight = { x: x0 + totalW * scaleX, y: groundY };

      const dimY = groundY + 26;
      const dimHX = pRight.x + 28;
      const sq = 12;
      const arcC_r = Math.min(26, Math.max(14, (pRight.x - pObtuse.x) * 0.25));
      const arcB_r = Math.min(32, Math.max(16, (pRight.x - pObtuse.x) * 0.3));

      return (
        <>
          {/* Height Projection / Datum Lines (Dashed) */}
          <line x1={pApex.x} y1={pApex.y} x2={pDrop.x} y2={pDrop.y} stroke={colDatum} strokeWidth="1.75" strokeDasharray="4 3" />
          <line x1={pDrop.x} y1={groundY} x2={pObtuse.x} y2={groundY} stroke={colDatum} strokeWidth="1.75" strokeDasharray="4 3" />

          {/* Right Angle Square at pDrop */}
          {w > 0.05 && (
            <path
              d={`M ${pDrop.x} ${pDrop.y - sq} L ${pDrop.x + sq} ${pDrop.y - sq} L ${pDrop.x + sq} ${pDrop.y}`}
              fill="none"
              stroke={colDatum}
              strokeWidth="1.5"
            />
          )}

          {/* Height Extension Lines to the Right */}
          <line x1={pApex.x} y1={pApex.y} x2={dimHX + 12} y2={pApex.y} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1={pRight.x} y1={groundY} x2={dimHX + 12} y2={groundY} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />

          {/* Height Dimension Line (H) */}
          <line x1={dimHX} y1={pApex.y + 4} x2={dimHX} y2={groundY - 4} stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${pApex.y + 6} L ${dimHX} ${pApex.y} L ${dimHX + 4} ${pApex.y + 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${groundY - 6} L ${dimHX} ${groundY} L ${dimHX + 4} ${groundY - 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <SvgBadge x={dimHX + 24} y={(pApex.y + groundY) / 2} text={`H = ${formatNum(h)}${uStr}`} color={colH} />

          {/* Triangle Body */}
          <polygon
            points={`${pApex.x},${pApex.y} ${pObtuse.x},${pObtuse.y} ${pRight.x},${pRight.y}`}
            fill="url(#tri-grad)"
            stroke={colShape}
            strokeWidth="2.75"
            strokeLinejoin="round"
          />

          {/* Base Side C Line */}
          <line x1={pObtuse.x} y1={groundY} x2={pRight.x} y2={groundY} stroke={colC} strokeWidth="3.5" />
          {/* Left Side B Line */}
          <line x1={pApex.x} y1={pApex.y} x2={pObtuse.x} y2={pObtuse.y} stroke={colB} strokeWidth="3" />
          {/* Long Side A Line */}
          <line x1={pApex.x} y1={pApex.y} x2={pRight.x} y2={pRight.y} stroke={colA} strokeWidth="3" />

          {/* Dimension Line W (Overhang / Offset) */}
          {w > 0.1 && (
            <>
              <line x1={pDrop.x} y1={groundY} x2={pDrop.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={pObtuse.x} y1={groundY} x2={pObtuse.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
              <line x1={pDrop.x + 3} y1={dimY} x2={pObtuse.x - 3} y2={dimY} stroke={colW} strokeWidth="1.5" />
              <path d={`M ${pDrop.x + 5} ${dimY - 3} L ${pDrop.x} ${dimY} L ${pDrop.x + 5} ${dimY + 3}`} fill="none" stroke={colW} strokeWidth="1.5" />
              <path d={`M ${pObtuse.x - 5} ${dimY - 3} L ${pObtuse.x} ${dimY} L ${pObtuse.x - 5} ${dimY + 3}`} fill="none" stroke={colW} strokeWidth="1.5" />
              <SvgBadge x={(pDrop.x + pObtuse.x) / 2} y={dimY + 16} text={`W = ${formatNum(w)}${uStr}`} color={colW} />
            </>
          )}

          {/* Dimension Line C (Base) */}
          <line x1={pRight.x} y1={groundY} x2={pRight.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pObtuse.x + 3} y1={dimY} x2={pRight.x - 3} y2={dimY} stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pObtuse.x + 5} ${dimY - 3} L ${pObtuse.x} ${dimY} L ${pObtuse.x + 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pRight.x - 5} ${dimY - 3} L ${pRight.x} ${dimY} L ${pRight.x - 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <SvgBadge x={(pObtuse.x + pRight.x) / 2} y={dimY + 16} text={`C = ${formatNum(c)}${uStr}`} color={colC} />

          {/* Side Callouts */}
          <SvgBadge x={(pApex.x + pObtuse.x) / 2 - 28} y={(pApex.y + pObtuse.y) / 2 - 8} text={`b = ${formatNum(sideB)}${uStr}`} color={colB} />
          <SvgBadge x={(pApex.x + pRight.x) / 2 + 10} y={(pApex.y + pRight.y) / 2 - 14} text={`a = ${formatNum(sideA)}${uStr}`} color={colA} />

          {/* Angles */}
          {angleC > 0 && (
            <>
              <path
                d={`M ${pObtuse.x + arcC_r} ${groundY} A ${arcC_r} ${arcC_r} 0 0 0 ${
                  pObtuse.x + arcC_r * Math.cos(((180 - angleC) * Math.PI) / 180)
                } ${groundY - arcC_r * Math.sin(((180 - angleC) * Math.PI) / 180)}`}
                fill="none"
                stroke={colAngle}
                strokeWidth="2"
              />
              <SvgBadge x={pObtuse.x + arcC_r + 20} y={groundY - 14} text={`c: ${angleC.toFixed(1)}°`} color={colAngle} />
            </>
          )}

          {angleB > 0 && (
            <>
              <path
                d={`M ${pRight.x - arcB_r} ${groundY} A ${arcB_r} ${arcB_r} 0 0 0 ${
                  pRight.x - arcB_r * ((totalW * scaleX) / Math.hypot(totalW * scaleX, renderH))
                } ${groundY - arcB_r * (renderH / Math.hypot(totalW * scaleX, renderH))}`}
                fill="none"
                stroke={colAngle}
                strokeWidth="2"
              />
              <SvgBadge x={pRight.x - arcB_r - 20} y={groundY - 12} text={`b: ${angleB.toFixed(1)}°`} color={colAngle} />
            </>
          )}

          {angleA > 0 && <SvgBadge x={pApex.x + 24} y={pApex.y + 20} text={`a: ${angleA.toFixed(1)}°`} color={colAngle} />}

          <circle cx={pApex.x} cy={pApex.y} r="4.5" fill={colShape} />
          <circle cx={pObtuse.x} cy={pObtuse.y} r="4.5" fill={colAngle} />
          <circle cx={pRight.x} cy={pRight.y} r="4.5" fill={colA} />
        </>
      );
    }

    // --- 2. SCALENE TRIANGLE (Screenshot 4: Apex projection is INSIDE base C at distance W) ---
    if (mode === "scalene") {
      const safeC = Math.max(0.001, c);
      const safeH = Math.max(0.001, h);
      const safeW = Math.min(safeC, Math.max(0, w));

      const ratio = safeC / safeH;
      const clamped = Math.max(0.4, Math.min(3.2, ratio));

      let renderW = availW;
      let renderH = availH;
      if (clamped > availW / availH) {
        renderW = availW;
        renderH = availW / clamped;
      } else {
        renderH = availH;
        renderW = availH * clamped;
      }

      const scaleX = renderW / safeC;
      const x0 = originX + (availW - renderW) / 2;
      const y0 = originY + (availH - renderH) / 2;
      const groundY = y0 + renderH;

      const pLeft = { x: x0, y: groundY }; // angle c
      const pApex = { x: x0 + safeW * scaleX, y: y0 }; // angle a
      const pRight = { x: x0 + renderW, y: groundY }; // angle b
      const pDrop = { x: pApex.x, y: groundY }; // altitude drop

      const dimY = groundY + 26;
      const dimHX = pRight.x + 28;
      const dimTopY = y0 - 18;

      return (
        <>
          {/* Dashed Altitude Drop Line inside triangle */}
          <line x1={pApex.x} y1={pApex.y} x2={pDrop.x} y2={pDrop.y} stroke={colDatum} strokeWidth="1.75" strokeDasharray="4 3" />
          <path
            d={`M ${pDrop.x - 10} ${pDrop.y} L ${pDrop.x - 10} ${pDrop.y - 10} L ${pDrop.x} ${pDrop.y - 10}`}
            fill="none"
            stroke={colDatum}
            strokeWidth="1.5"
          />

          {/* Height Dimension Line H on the right */}
          <line x1={pApex.x} y1={pApex.y} x2={dimHX + 12} y2={pApex.y} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1={pRight.x} y1={groundY} x2={dimHX + 12} y2={groundY} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1={dimHX} y1={pApex.y + 4} x2={dimHX} y2={groundY - 4} stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${pApex.y + 6} L ${dimHX} ${pApex.y} L ${dimHX + 4} ${pApex.y + 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${groundY - 6} L ${dimHX} ${groundY} L ${dimHX + 4} ${groundY - 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <SvgBadge x={dimHX + 24} y={(pApex.y + groundY) / 2} text={`H = ${formatNum(h)}${uStr}`} color={colH} />

          {/* Dimension Line W (Offset from left to apex) at top (matching Screenshot 4!) */}
          <line x1={pLeft.x} y1={groundY} x2={pLeft.x} y2={dimTopY - 4} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pApex.x} y1={pApex.y} x2={pApex.x} y2={dimTopY - 4} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pLeft.x + 3} y1={dimTopY} x2={pApex.x - 3} y2={dimTopY} stroke={colW} strokeWidth="1.5" />
          <path d={`M ${pLeft.x + 5} ${dimTopY - 3} L ${pLeft.x} ${dimTopY} L ${pLeft.x + 5} ${dimTopY + 3}`} fill="none" stroke={colW} strokeWidth="1.5" />
          <path d={`M ${pApex.x - 5} ${dimTopY - 3} L ${pApex.x} ${dimTopY} L ${pApex.x - 5} ${dimTopY + 3}`} fill="none" stroke={colW} strokeWidth="1.5" />
          <SvgBadge x={(pLeft.x + pApex.x) / 2} y={dimTopY - 12} text={`W = ${formatNum(w)}${uStr}`} color={colW} />

          {/* Dimension Line C (Full Base) */}
          <line x1={pLeft.x} y1={groundY} x2={pLeft.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pRight.x} y1={groundY} x2={pRight.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pLeft.x + 3} y1={dimY} x2={pRight.x - 3} y2={dimY} stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pLeft.x + 5} ${dimY - 3} L ${pLeft.x} ${dimY} L ${pLeft.x + 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pRight.x - 5} ${dimY - 3} L ${pRight.x} ${dimY} L ${pRight.x - 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <SvgBadge x={(pLeft.x + pRight.x) / 2} y={dimY + 16} text={`C = ${formatNum(c)}${uStr}`} color={colC} />

          {/* Triangle Body */}
          <polygon
            points={`${pLeft.x},${pLeft.y} ${pApex.x},${pApex.y} ${pRight.x},${pRight.y}`}
            fill="url(#tri-grad)"
            stroke={colShape}
            strokeWidth="2.75"
            strokeLinejoin="round"
          />

          {/* Sides */}
          <line x1={pLeft.x} y1={groundY} x2={pRight.x} y2={groundY} stroke={colC} strokeWidth="3.5" />
          <line x1={pLeft.x} y1={groundY} x2={pApex.x} y2={pApex.y} stroke={colB} strokeWidth="3" />
          <line x1={pApex.x} y1={pApex.y} x2={pRight.x} y2={groundY} stroke={colA} strokeWidth="3" />

          {/* Side Callouts */}
          <SvgBadge x={(pLeft.x + pApex.x) / 2 - 24} y={(groundY + pApex.y) / 2} text={`b = ${formatNum(sideB)}${uStr}`} color={colB} />
          <SvgBadge x={(pApex.x + pRight.x) / 2 + 24} y={(pApex.y + groundY) / 2} text={`a = ${formatNum(sideA)}${uStr}`} color={colA} />

          {/* Angles */}
          <SvgBadge x={pLeft.x + 28} y={groundY - 14} text={`c: ${angleC.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pRight.x - 28} y={groundY - 14} text={`b: ${angleB.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pApex.x} y={pApex.y + 20} text={`a: ${angleA.toFixed(1)}°`} color={colAngle} />

          <circle cx={pLeft.x} cy={pLeft.y} r="4.5" fill={colShape} />
          <circle cx={pApex.x} cy={pApex.y} r="4.5" fill={colShape} />
          <circle cx={pRight.x} cy={pRight.y} r="4.5" fill={colShape} />
        </>
      );
    }

    // --- 3. ISOSCELES TRIANGLE (Screenshot 2: Symmetrical with Base C and Height H) ---
    if (mode === "isosceles") {
      const safeC = Math.max(0.001, c);
      const safeH = Math.max(0.001, h);

      const ratio = safeC / safeH;
      const clamped = Math.max(0.4, Math.min(3.2, ratio));

      let renderW = availW;
      let renderH = availH;
      if (clamped > availW / availH) {
        renderW = availW;
        renderH = availW / clamped;
      } else {
        renderH = availH;
        renderW = availH * clamped;
      }

      const x0 = originX + (availW - renderW) / 2;
      const y0 = originY + (availH - renderH) / 2;
      const groundY = y0 + renderH;

      const pLeft = { x: x0, y: groundY };
      const pApex = { x: x0 + renderW / 2, y: y0 };
      const pRight = { x: x0 + renderW, y: groundY };
      const pDrop = { x: pApex.x, y: groundY };

      const dimY = groundY + 26;
      const dimHX = pRight.x + 28;

      return (
        <>
          {/* Central Dashed Altitude Line */}
          <line x1={pApex.x} y1={pApex.y} x2={pDrop.x} y2={pDrop.y} stroke={colDatum} strokeWidth="1.75" strokeDasharray="4 3" />
          <path
            d={`M ${pDrop.x - 10} ${pDrop.y} L ${pDrop.x - 10} ${pDrop.y - 10} L ${pDrop.x} ${pDrop.y - 10}`}
            fill="none"
            stroke={colDatum}
            strokeWidth="1.5"
          />

          {/* Height Dimension Line H on the right */}
          <line x1={pApex.x} y1={pApex.y} x2={dimHX + 12} y2={pApex.y} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1={pRight.x} y1={groundY} x2={dimHX + 12} y2={groundY} stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1={dimHX} y1={pApex.y + 4} x2={dimHX} y2={groundY - 4} stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${pApex.y + 6} L ${dimHX} ${pApex.y} L ${dimHX + 4} ${pApex.y + 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <path d={`M ${dimHX - 4} ${groundY - 6} L ${dimHX} ${groundY} L ${dimHX + 4} ${groundY - 6}`} fill="none" stroke={colH} strokeWidth="1.75" />
          <SvgBadge x={dimHX + 24} y={(pApex.y + groundY) / 2} text={`H = ${formatNum(h)}${uStr}`} color={colH} />

          {/* Base Dimension Line C */}
          <line x1={pLeft.x} y1={groundY} x2={pLeft.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pRight.x} y1={groundY} x2={pRight.x} y2={dimY + 8} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
          <line x1={pLeft.x + 3} y1={dimY} x2={pRight.x - 3} y2={dimY} stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pLeft.x + 5} ${dimY - 3} L ${pLeft.x} ${dimY} L ${pLeft.x + 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <path d={`M ${pRight.x - 5} ${dimY - 3} L ${pRight.x} ${dimY} L ${pRight.x - 5} ${dimY + 3}`} fill="none" stroke={colC} strokeWidth="1.75" />
          <SvgBadge x={(pLeft.x + pRight.x) / 2} y={dimY + 16} text={`C = ${formatNum(c)}${uStr}`} color={colC} />

          {/* Symmetrical Triangle Body */}
          <polygon
            points={`${pLeft.x},${pLeft.y} ${pApex.x},${pApex.y} ${pRight.x},${pRight.y}`}
            fill="url(#tri-grad)"
            stroke={colShape}
            strokeWidth="2.75"
            strokeLinejoin="round"
          />

          {/* Equal Sides Callouts */}
          <SvgBadge x={(pLeft.x + pApex.x) / 2 - 24} y={(groundY + pApex.y) / 2} text={`A = ${formatNum(sideA)}${uStr}`} color={colB} />
          <SvgBadge x={(pApex.x + pRight.x) / 2 + 24} y={(pApex.y + groundY) / 2} text={`A = ${formatNum(sideA)}${uStr}`} color={colA} />

          {/* Equal Base Angles & Apex Angle */}
          <SvgBadge x={pLeft.x + 28} y={groundY - 14} text={`c: ${angleC.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pRight.x - 28} y={groundY - 14} text={`b: ${angleB.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pApex.x} y={pApex.y + 20} text={`a: ${angleA.toFixed(1)}°`} color={colAngle} />

          <circle cx={pLeft.x} cy={pLeft.y} r="4.5" fill={colShape} />
          <circle cx={pApex.x} cy={pApex.y} r="4.5" fill={colShape} />
          <circle cx={pRight.x} cy={pRight.y} r="4.5" fill={colShape} />
        </>
      );
    }

    // --- 4. GENERAL TRIANGLE: Enter any 3 values (Screenshot 1: Sides A, B, C & Angles a, b, c) ---
    if (mode === "any3") {
      const renderW = availW * 0.9;
      const renderH = availH * 0.85;
      const x0 = originX + (availW - renderW) / 2;
      const y0 = originY + (availH - renderH) / 2;
      const groundY = y0 + renderH;

      const pLeft = { x: x0, y: groundY }; // angle a (opposite side A)
      const pRight = { x: x0 + renderW, y: groundY }; // angle b (opposite side B)
      const pApex = { x: x0 + renderW * 0.48, y: y0 }; // angle c (opposite side C)

      return (
        <>
          <polygon
            points={`${pLeft.x},${pLeft.y} ${pApex.x},${pApex.y} ${pRight.x},${pRight.y}`}
            fill="url(#tri-grad)"
            stroke={colShape}
            strokeWidth="2.75"
            strokeLinejoin="round"
          />

          {/* Sides A, B, C */}
          <line x1={pLeft.x} y1={groundY} x2={pRight.x} y2={groundY} stroke={colC} strokeWidth="3.5" />
          <line x1={pLeft.x} y1={groundY} x2={pApex.x} y2={pApex.y} stroke={colB} strokeWidth="3" />
          <line x1={pApex.x} y1={pApex.y} x2={pRight.x} y2={groundY} stroke={colA} strokeWidth="3" />

          {/* Badges matching Screenshot 1 exactly */}
          <SvgBadge x={(pLeft.x + pRight.x) / 2} y={groundY + 22} text={`C = ${formatNum(sideC)}${uStr}`} color={colC} />
          <SvgBadge x={(pLeft.x + pApex.x) / 2 - 24} y={(groundY + pApex.y) / 2} text={`B = ${formatNum(sideB)}${uStr}`} color={colB} />
          <SvgBadge x={(pApex.x + pRight.x) / 2 + 24} y={(pApex.y + groundY) / 2} text={`A = ${formatNum(sideA)}${uStr}`} color={colA} />

          {/* Angles a, b, c matching Screenshot 1 */}
          <SvgBadge x={pLeft.x + 28} y={groundY - 14} text={`a: ${angleA.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pRight.x - 28} y={groundY - 14} text={`b: ${angleB.toFixed(1)}°`} color={colAngle} />
          <SvgBadge x={pApex.x} y={pApex.y + 22} text={`c: ${angleC.toFixed(1)}°`} color={colAngle} />

          <circle cx={pLeft.x} cy={pLeft.y} r="4.5" fill={colShape} />
          <circle cx={pApex.x} cy={pApex.y} r="4.5" fill={colShape} />
          <circle cx={pRight.x} cy={pRight.y} r="4.5" fill={colShape} />
        </>
      );
    }

    // --- 5. RIGHT TRIANGLE (Matching Mobile App Screenshot) ---
    if (mode === "right") {
      const aVal = Math.max(0.001, sideA || h || 3);
      const bVal = Math.max(0.001, sideB || c || 4);
      const ratio = bVal / aVal;
      const clampedRatio = Math.max(0.4, Math.min(2.5, ratio));

      let renderW = availW * 0.85;
      let renderH = availH * 0.85;
      if (clampedRatio > availW / availH) {
        renderW = availW;
        renderH = availW / clampedRatio;
      } else {
        renderH = availH;
        renderW = availH * clampedRatio;
      }

      const x0 = originX + (availW - renderW) / 2;
      const y0 = originY + (availH - renderH) / 2;
      const groundY = y0 + renderH;

      const pCorner = { x: x0, y: groundY }; // Corner X (90°)
      const pTop = { x: x0, y: y0 };          // Top Y
      const pRight = { x: x0 + renderW, y: groundY }; // Right Z

      const sq = 14;
      const uStr = unit ? ` ${unit}` : "";

      return (
        <>
          {/* Subtle Triangle Fill */}
          <polygon
            points={`${pCorner.x},${pCorner.y} ${pTop.x},${pTop.y} ${pRight.x},${pRight.y}`}
            fill="url(#tri-grad)"
            stroke="none"
          />

          {/* 90° Square Marker */}
          <path
            d={`M ${pCorner.x} ${pCorner.y - sq} L ${pCorner.x + sq} ${pCorner.y - sq} L ${pCorner.x + sq} ${pCorner.y}`}
            fill="none"
            stroke="#94a3b8"
            strokeWidth="1.75"
          />

          {/* Side A: Red/Coral Vertical Leg */}
          <line x1={pTop.x} y1={pTop.y} x2={pCorner.x} y2={pCorner.y} stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />

          {/* Side B: Purple/Violet Horizontal Base */}
          <line x1={pCorner.x} y1={pCorner.y} x2={pRight.x} y2={pRight.y} stroke="#8b5cf6" strokeWidth="3.5" strokeLinecap="round" />

          {/* Side C: Amber/Orange Hypotenuse */}
          <line x1={pTop.x} y1={pTop.y} x2={pRight.x} y2={pRight.y} stroke="#f59e0b" strokeWidth="3.5" strokeLinecap="round" />

          {/* Three Blue Vertex Dots matching user screenshot */}
          <circle cx={pTop.x} cy={pTop.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={pCorner.x} cy={pCorner.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
          <circle cx={pRight.x} cy={pRight.y} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

          {/* Side Labels matching user screenshot */}
          <SvgBadge x={pCorner.x - 34} y={(pTop.y + groundY) / 2} text={`A = ${formatNum(sideA || h)}${uStr}`} color="#ef4444" />
          <SvgBadge x={(pCorner.x + pRight.x) / 2} y={groundY + 22} text={`B = ${formatNum(sideB || c)}${uStr}`} color="#8b5cf6" />
          <SvgBadge x={(pTop.x + pRight.x) / 2 + 24} y={(pTop.y + groundY) / 2 - 14} text={`C = ${formatNum(sideC)}${uStr}`} color="#f59e0b" />

          {/* Angle Badges matching user screenshot */}
          <SvgBadge x={pCorner.x + 28} y={groundY - 14} text="X: 90.0°" color="#0284c7" />
          <SvgBadge x={pTop.x + 28} y={pTop.y + 20} text={`Y: ${angleA.toFixed(1)}°`} color="#0284c7" />
          <SvgBadge x={pRight.x - 28} y={groundY - 14} text={`Z: ${angleB.toFixed(1)}°`} color="#0284c7" />
        </>
      );
    }

    // --- 6. RIGHT TRAPEZOID / TAPER WEDGE (Icon 2) ---
    const renderW = availW * 0.85;
    const renderH = availH * 0.8;
    const x0 = originX + (availW - renderW) / 2;
    const y0 = originY + (availH - renderH) / 2;
    const groundY = y0 + renderH;

    const topSpan = renderW * 0.55;
    const pBL = { x: x0, y: groundY };
    const pTL = { x: x0, y: y0 };
    const pTR = { x: x0 + topSpan, y: y0 };
    const pBR = { x: x0 + renderW, y: groundY };

    return (
      <>
        <polygon
          points={`${pBL.x},${pBL.y} ${pTL.x},${pTL.y} ${pTR.x},${pTR.y} ${pBR.x},${pBR.y}`}
          fill="url(#tri-grad)"
          stroke={colShape}
          strokeWidth="2.75"
          strokeLinejoin="round"
        />

        {/* 90° Corner */}
        <path d={`M ${pBL.x} ${groundY - 12} L ${pBL.x + 12} ${groundY - 12} L ${pBL.x + 12} ${groundY}`} fill="none" stroke={colDatum} strokeWidth="1.5" />
        <path d={`M ${pTL.x} ${y0 + 12} L ${pTL.x + 12} ${y0 + 12} L ${pTL.x + 12} ${y0}`} fill="none" stroke={colDatum} strokeWidth="1.5" />

        <SvgBadge x={pBL.x - 30} y={(y0 + groundY) / 2} text={`H = ${formatNum(h)}${uStr}`} color={colH} />
        <SvgBadge x={(pTL.x + pTR.x) / 2} y={y0 - 14} text={`Top = ${formatNum(w)}${uStr}`} color={colW} />
        <SvgBadge x={(pBL.x + pBR.x) / 2} y={groundY + 22} text={`Base = ${formatNum(c)}${uStr}`} color={colC} />
        <SvgBadge x={(pTR.x + pBR.x) / 2 + 28} y={(y0 + groundY) / 2} text={`Slant = ${formatNum(slant)}${uStr}`} color={colA} />
      </>
    );
  }, [mode, h, c, w, sideA, sideB, sideC, angleA, angleB, angleC, slant, taperAngle, unit]);

  const legendItems = useMemo(() => {
    const areaUnitStr = unit ? ` ${unit}²` : ` ${t.results.sqUnits}`;
    if (mode === "obtuse" || mode === "scalene") {
      return [
        { label: t.fields.heightH, val: `${formatNum(h)}${uStr}`, color: colH },
        { label: t.fields.baseC, val: `${formatNum(c)}${uStr}`, color: colC },
        { label: t.fields.offsetW, val: `${formatNum(w)}${uStr}`, color: colW },
        { label: t.fields.sideSmallA, val: `${formatNum(sideA)}${uStr}`, color: colA },
        { label: t.fields.sideSmallB, val: `${formatNum(sideB)}${uStr}`, color: colB },
        { label: t.results.angleA, val: `${angleA.toFixed(1)}°`, color: colAngle },
        { label: t.results.angleB, val: `${angleB.toFixed(1)}°`, color: colAngle },
        { label: t.results.angleC, val: `${angleC.toFixed(1)}°`, color: colAngle },
        { label: t.results.area, val: `${formatNum(area)}${areaUnitStr}`, color: colC },
        { label: t.results.perimeter, val: `${formatNum(perimeter)}${uStr}`, color: colShape },
      ];
    }
    if (mode === "isosceles") {
      return [
        { label: t.results.centralHeight, val: `${formatNum(h)}${uStr}`, color: colH },
        { label: t.results.baseLength, val: `${formatNum(c)}${uStr}`, color: colC },
        { label: t.results.equalLegs, val: `${formatNum(sideA)}${uStr}`, color: colB },
        { label: t.fields.apexAngleA, val: `${angleA.toFixed(1)}°`, color: colAngle },
        { label: t.results.baseAngles, val: `${angleB.toFixed(1)}°`, color: colAngle },
        { label: t.results.area, val: `${formatNum(area)}${areaUnitStr}`, color: colC },
        { label: t.results.perimeter, val: `${formatNum(perimeter)}${uStr}`, color: colShape },
      ];
    }
    if (mode === "right") {
      return [
        { label: t.fields.sideA, val: `${formatNum(sideA || h)}${uStr}`, color: "#ef4444" },
        { label: t.fields.sideB, val: `${formatNum(sideB || c)}${uStr}`, color: "#8b5cf6" },
        { label: t.fields.sideC, val: `${formatNum(sideC)}${uStr}`, color: "#f59e0b" },
        { label: t.results.angleX, val: "90.0°", color: "#0284c7" },
        { label: t.results.angleY, val: `${angleA.toFixed(2)}°`, color: "#0284c7" },
        { label: t.results.angleZ, val: `${angleB.toFixed(2)}°`, color: "#0284c7" },
        { label: t.results.area, val: `${formatNum(area)}${areaUnitStr}`, color: "#8b5cf6" },
        { label: t.results.perimeter, val: `${formatNum(perimeter)}${uStr}`, color: "#0284c7" },
      ];
    }
    if (mode === "trapezoid") {
      return [
        { label: t.fields.heightH, val: `${formatNum(h)}${uStr}`, color: colH },
        { label: t.results.topBase, val: `${formatNum(w)}${uStr}`, color: colW },
        { label: t.results.botBase, val: `${formatNum(c)}${uStr}`, color: colC },
        { label: t.results.slantEdge, val: `${formatNum(slant)}${uStr}`, color: colA },
        { label: t.results.taperAngle, val: `${taperAngle.toFixed(1)}°`, color: colAngle },
        { label: t.results.area, val: `${formatNum(area)}${areaUnitStr}`, color: colC },
        { label: t.results.perimeter, val: `${formatNum(perimeter)}${uStr}`, color: colShape },
      ];
    }
    return [
      { label: t.fields.sideSmallA, val: `${formatNum(sideA)}${uStr}`, color: colA },
      { label: t.fields.sideSmallB, val: `${formatNum(sideB)}${uStr}`, color: colB },
      { label: t.fields.sideSmallC, val: `${formatNum(sideC)}${uStr}`, color: colC },
      { label: t.results.angleA, val: `${angleA.toFixed(1)}°`, color: colAngle },
      { label: t.results.angleB, val: `${angleB.toFixed(1)}°`, color: colAngle },
      { label: t.results.angleC, val: `${angleC.toFixed(1)}°`, color: colAngle },
      { label: t.results.area, val: `${formatNum(area)}${areaUnitStr}`, color: colC },
      { label: t.results.perimeter, val: `${formatNum(perimeter)}${uStr}`, color: colShape },
    ];
  }, [mode, h, c, w, sideA, sideB, sideC, angleA, angleB, angleC, area, perimeter, slant, taperAngle, unit, uStr, t]);

  return (
    <div className="diagram-card" aria-label="Interactive Triangle Diagram">
      <div className="diagram-head">
        <div className="diagram-title">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polygon points="12 2 2 22 22 22" />
          </svg>
          <span>{modeTitle}</span>
        </div>
        <span className="diagram-badge">{data.classification ? translateClassification(data.classification, t) : t.title}</span>
      </div>

      <div className="diagram-svg-wrap">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          role="img"
          aria-label={`${modeTitle} diagram showing dimensions, sides and angles`}
        >
          <defs>
            <linearGradient id="tri-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ede9fe" stopOpacity="0.6" />
            </linearGradient>
            <filter id="tri-badge-shadow" x="-15%" y="-20%" width="130%" height="150%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.12" />
            </filter>
          </defs>

          {content}
        </svg>
      </div>

      <div className="diagram-legend">
        {legendItems.map((item, idx) => (
          <div key={idx} className="diagram-legend-item">
            <span className="diagram-dot" style={{ backgroundColor: item.color }} />
            <span className="diagram-legend-label">{item.label}:</span>
            <span className="diagram-legend-val">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SvgBadge({
  x,
  y,
  text,
  color = "#6366f1",
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
}) {
  const charWidth = 7.6;
  const w = Math.max(52, text.length * charWidth + 16);
  const h = 24;
  const rectX = x - w / 2;
  const rectY = y - h / 2;

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        width={w}
        height={h}
        rx={5}
        fill="#ffffff"
        stroke={color}
        strokeWidth={1.75}
        filter="url(#tri-badge-shadow)"
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12.5}
        fontWeight={700}
        fill="#0f172a"
        fontFamily="var(--ic-font-sans), system-ui, sans-serif"
      >
        {text}
      </text>
    </g>
  );
}
