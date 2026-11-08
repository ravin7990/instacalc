import { useMemo } from "react";
import type { GeoCopy } from "@/i18n/geometry-labels";
import type { Locale } from "@/config/site";

export interface GeometryDiagramProps {
  shape: "rectangle" | "square" | "right" | "cuboid" | "polygon";
  values: { a?: number; b?: number; c?: number; n?: number };
  result: { diagonal: number; perimeter: number; area: number; formula: string };
  right?: {
    c: number;
    angleA: number;
    angleB: number;
    angleC: number;
    area: number;
    perimeter: number;
  } | null;
  labels: GeoCopy;
  locale?: Locale;
}

const formatNum = (n: number | undefined): string => {
  if (n === undefined || isNaN(n)) return "0";
  if (Number.isInteger(n)) return n.toString();
  return Number(n.toFixed(3)).toString();
};

export function GeometryDiagram({ shape, values, result, right, labels, locale }: GeometryDiagramProps) {
  const isEs = locale === "es";
  const vbW = 460;
  const vbH = 280;

  // Primary palette tokens
  const colA = "#0284c7"; // Side A (Blue)
  const colB = "#0d9488"; // Side B (Teal)
  const colC = "#6366f1"; // Side C / Diagonal (Indigo)
  const colAngle = "#f59e0b"; // Angles (Amber)
  const colShape = "#3b82f6";

  const content = useMemo(() => {
    const originX = 65;
    const originY = 35;
    const availW = 320;
    const availH = 180;

    if (shape === "right") {
      const aVal = values.a ?? 3; // vertical leg
      const bVal = values.b ?? 4; // horizontal leg
      const cVal = right ? right.c : Math.hypot(aVal, bVal);
      const angleA = right ? right.angleA : (Math.atan(aVal / bVal) * 180) / Math.PI;
      const angleB = right ? right.angleB : 90 - angleA;

      // Aspect ratio = base / height
      const ratio = bVal / Math.max(0.001, aVal);
      const clampedRatio = Math.max(0.35, Math.min(2.8, ratio));

      let w = availW;
      let h = availH;
      if (clampedRatio > availW / availH) {
        w = availW;
        h = availW / clampedRatio;
      } else {
        h = availH;
        w = availH * clampedRatio;
      }

      const xBL = originX + (availW - w) / 2;
      const yBL = originY + availH;
      const xTL = xBL;
      const yTL = yBL - h;
      const xBR = xBL + w;
      const yBR = yBL;

      const sq = Math.min(18, Math.min(w, h) * 0.22);
      const arcARad = Math.min(34, w * 0.35);
      const arcBRad = Math.min(34, h * 0.35);

      // Hypotenuse normal for label placement
      const hypLen = Math.hypot(w, h);
      const nx = -h / hypLen;
      const ny = -w / hypLen;
      const midHypX = (xTL + xBR) / 2 - nx * 18;
      const midHypY = (yTL + yBR) / 2 + ny * 18;

      return (
        <>
          {/* Triangle Fill */}
          <polygon
            points={`${xTL},${yTL} ${xBR},${yBR} ${xBL},${yBL}`}
            fill="url(#triangle-grad)"
            stroke={colShape}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Right Angle Marker at BL */}
          <path
            d={`M ${xBL} ${yBL - sq} L ${xBL + sq} ${yBL - sq} L ${xBL + sq} ${yBL}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="2"
          />
          <text
            x={xBL + sq + 14}
            y={yBL - 6}
            fontSize="10"
            fontWeight="700"
            fill={colAngle}
            textAnchor="middle"
          >
            90°
          </text>

          {/* Angle A Arc at BR (between horizontal base and hypotenuse) */}
          <path
            d={`M ${xBR - arcARad} ${yBR} A ${arcARad} ${arcARad} 0 0 0 ${
              xBR - arcARad * (w / hypLen)
            } ${yBR - arcARad * (h / hypLen)}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="2"
          />
          <SvgBadge
            x={Math.max(xBL + 75, xBR - arcARad - 28)}
            y={yBR - 14}
            text={`∠A: ${angleA.toFixed(1)}°`}
            color={colAngle}
          />

          {/* Angle B Arc at TL (between vertical leg and hypotenuse) */}
          <path
            d={`M ${xTL} ${yTL + arcBRad} A ${arcBRad} ${arcBRad} 0 0 1 ${
              xTL + arcBRad * (w / hypLen)
            } ${yTL + arcBRad * (h / hypLen)}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="2"
          />
          <SvgBadge
            x={xTL + arcBRad + 32}
            y={Math.min(yBL - 20, yTL + arcBRad + 12)}
            text={`∠B: ${angleB.toFixed(1)}°`}
            color={colAngle}
          />

          {/* Side A (Vertical, Left) */}
          <line x1={xTL} y1={yTL} x2={xBL} y2={yBL} stroke={colA} strokeWidth="3" />
          <SvgBadge
            x={xBL - 44}
            y={yBL - h / 2}
            text={`Side A = ${formatNum(aVal)}`}
            color={colA}
          />

          {/* Side B (Horizontal, Bottom) */}
          <line x1={xBL} y1={yBL} x2={xBR} y2={yBR} stroke={colB} strokeWidth="3" />
          <SvgBadge
            x={xBL + w / 2}
            y={yBL + 24}
            text={`Side B = ${formatNum(bVal)}`}
            color={colB}
          />

          {/* Side C (Hypotenuse, Diagonal) */}
          <line
            x1={xTL}
            y1={yTL}
            x2={xBR}
            y2={yBR}
            stroke={colC}
            strokeWidth="3.5"
            strokeDasharray="6 3"
          />
          <SvgBadge
            x={midHypX}
            y={midHypY}
            text={`Side C = ${formatNum(cVal)}`}
            color={colC}
          />

          {/* Vertex Dots */}
          <circle cx={xTL} cy={yTL} r="4.5" fill={colC} />
          <circle cx={xBR} cy={yBR} r="4.5" fill={colC} />
          <circle cx={xBL} cy={yBL} r="4.5" fill={colShape} />
        </>
      );
    }

    if (shape === "rectangle" || shape === "square") {
      const aVal = values.a ?? 4;
      const bVal = shape === "square" ? aVal : values.b ?? 3;
      const diagVal = Math.hypot(aVal, bVal);
      const theta1 = (Math.atan(bVal / Math.max(0.001, aVal)) * 180) / Math.PI;
      const theta2 = 90 - theta1;

      const ratio = aVal / Math.max(0.001, bVal);
      const clampedRatio = shape === "square" ? 1.0 : Math.max(0.35, Math.min(2.8, ratio));

      let w = availW;
      let h = availH;
      if (clampedRatio > availW / availH) {
        w = availW;
        h = availW / clampedRatio;
      } else {
        h = availH;
        w = availH * clampedRatio;
      }

      const x0 = originX + (availW - w) / 2;
      const y0 = originY + (availH - h) / 2;
      const xBL = x0;
      const yBL = y0 + h;
      const xBR = x0 + w;
      const yBR = y0 + h;
      const xTR = x0 + w;
      const yTR = y0;
      const xTL = x0;
      const yTL = y0;

      const sq = Math.min(16, Math.min(w, h) * 0.2);
      const arcR = Math.min(28, Math.min(w, h) * 0.35);
      const hypLen = Math.hypot(w, h);

      return (
        <>
          {/* Rectangle Body */}
          <rect
            x={x0}
            y={y0}
            width={w}
            height={h}
            fill="url(#rect-grad)"
            stroke={colShape}
            strokeWidth="2.5"
            rx="4"
          />

          {/* Right Angle Squares */}
          <path
            d={`M ${xBL} ${yBL - sq} L ${xBL + sq} ${yBL - sq} L ${xBL + sq} ${yBL}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="1.75"
          />
          <path
            d={`M ${xTR - sq} ${yTR} L ${xTR - sq} ${yTR + sq} L ${xTR} ${yTR + sq}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="1.75"
          />
          <text x={xBL + sq + 12} y={yBL - 5} fontSize="9" fontWeight="700" fill={colAngle}>
            90°
          </text>

          {/* Diagonal Line (BL to TR) */}
          <line
            x1={xBL}
            y1={yBL}
            x2={xTR}
            y2={yTR}
            stroke={colC}
            strokeWidth="3"
            strokeDasharray="6 3"
          />

          {/* Diagonal Angle Arc at BL */}
          <path
            d={`M ${xBL + arcR} ${yBL} A ${arcR} ${arcR} 0 0 0 ${
              xBL + arcR * (w / hypLen)
            } ${yBL - arcR * (h / hypLen)}`}
            fill="none"
            stroke={colAngle}
            strokeWidth="2"
          />
          <SvgBadge
            x={Math.min(xBR - 40, xBL + arcR + 32)}
            y={yBL - 16}
            text={`θ: ${theta1.toFixed(1)}°`}
            color={colAngle}
          />

          {/* Side A (Bottom / Length) */}
          <line x1={xBL} y1={yBL} x2={xBR} y2={yBR} stroke={colA} strokeWidth="3" />
          <SvgBadge
            x={x0 + w / 2}
            y={yBL + 24}
            text={`Side A = ${formatNum(aVal)}`}
            color={colA}
          />

          {/* Side B (Right / Width) */}
          <line x1={xBR} y1={yTR} x2={xBR} y2={yBR} stroke={colB} strokeWidth="3" />
          <SvgBadge
            x={xBR + 46}
            y={y0 + h / 2}
            text={`Side B = ${formatNum(bVal)}`}
            color={colB}
          />

          {/* Diagonal Callout along the line */}
          <SvgBadge
            x={x0 + w / 2 - 12}
            y={y0 + h / 2 - 20}
            text={`Diagonal C = ${formatNum(diagVal)}`}
            color={colC}
          />

          {/* Vertex Dots */}
          <circle cx={xBL} cy={yBL} r="4" fill={colC} />
          <circle cx={xTR} cy={yTR} r="4" fill={colC} />
          <circle cx={xBR} cy={yBR} r="3.5" fill={colShape} />
          <circle cx={xTL} cy={yTL} r="3.5" fill={colShape} />
        </>
      );
    }

    if (shape === "cuboid") {
      const aVal = values.a ?? 2; // length (Side A)
      const bVal = values.b ?? 3; // width / depth (Side B)
      const cVal = values.c ?? 6; // height (Side C)

      const dFace = Math.hypot(aVal, bVal);
      const dSpace = Math.hypot(aVal, bVal, cVal);
      const elevAngle = (Math.atan(cVal / Math.max(0.001, dFace)) * 180) / Math.PI;

      const maxDim = Math.max(aVal, bVal, cVal, 0.001);
      const wFront = Math.max(65, Math.min(180, (aVal / maxDim) * 180));
      const hFront = Math.max(55, Math.min(130, (cVal / maxDim) * 130));
      const depthP = Math.max(45, Math.min(105, (bVal / maxDim) * 105));

      const dx = depthP * 0.82;
      const dy = depthP * 0.48;

      const x0 = originX + (availW - (wFront + dx)) / 2;
      const y0 = originY + (availH - (hFront + dy)) / 2 + dy;

      // Front Face
      const fBL = { x: x0, y: y0 + hFront };
      const fBR = { x: x0 + wFront, y: y0 + hFront };
      const fTR = { x: x0 + wFront, y: y0 };
      const fTL = { x: x0, y: y0 };

      // Back Face
      const bBL = { x: x0 + dx, y: y0 + hFront - dy };
      const bBR = { x: x0 + wFront + dx, y: y0 + hFront - dy };
      const bTR = { x: x0 + wFront + dx, y: y0 - dy };
      const bTL = { x: x0 + dx, y: y0 - dy };

      return (
        <>
          {/* Back Hidden Edges (Dashed) */}
          <line
            x1={bBL.x}
            y1={bBL.y}
            x2={fBL.x}
            y2={fBL.y}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <line
            x1={bBL.x}
            y1={bBL.y}
            x2={bBR.x}
            y2={bBR.y}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <line
            x1={bBL.x}
            y1={bBL.y}
            x2={bTL.x}
            y2={bTL.y}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Base Face Diagonal (B_BL to F_BR) */}
          <line
            x1={bBL.x}
            y1={bBL.y}
            x2={fBR.x}
            y2={fBR.y}
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Visible Back/Top/Side Faces */}
          <polygon
            points={`${fTL.x},${fTL.y} ${bTL.x},${bTL.y} ${bTR.x},${bTR.y} ${fTR.x},${fTR.y}`}
            fill="#e0f2fe"
            fillOpacity="0.45"
            stroke={colShape}
            strokeWidth="1.75"
          />
          <polygon
            points={`${fTR.x},${fTR.y} ${bTR.x},${bTR.y} ${bBR.x},${bBR.y} ${fBR.x},${fBR.y}`}
            fill="#bae6fd"
            fillOpacity="0.35"
            stroke={colShape}
            strokeWidth="1.75"
          />

          {/* Front Face (Solid) */}
          <polygon
            points={`${fBL.x},${fBL.y} ${fBR.x},${fBR.y} ${fTR.x},${fTR.y} ${fTL.x},${fTL.y}`}
            fill="url(#rect-grad)"
            stroke={colShape}
            strokeWidth="2.5"
          />

          {/* 3D Space Diagonal (B_BL to F_TR) */}
          <line
            x1={bBL.x}
            y1={bBL.y}
            x2={fTR.x}
            y2={fTR.y}
            stroke={colC}
            strokeWidth="3.5"
            strokeDasharray="6 3"
          />

          {/* Dimension Side A (Length, Front Horizontal) */}
          <line x1={fBL.x} y1={fBL.y} x2={fBR.x} y2={fBR.y} stroke={colA} strokeWidth="3" />
          <SvgBadge
            x={fBL.x + wFront / 2}
            y={fBL.y + 24}
            text={`Side A = ${formatNum(aVal)}`}
            color={colA}
          />

          {/* Dimension Side B (Width / Depth, Angled Top/Right) */}
          <line x1={fTR.x} y1={fTR.y} x2={bTR.x} y2={bTR.y} stroke={colB} strokeWidth="3" />
          <SvgBadge
            x={fTR.x + dx / 2 + 34}
            y={fTR.y - dy / 2 - 12}
            text={`Side B = ${formatNum(bVal)}`}
            color={colB}
          />

          {/* Dimension Side C (Height, Front Vertical) */}
          <line x1={fBL.x} y1={fBL.y} x2={fTL.x} y2={fTL.y} stroke={colShape} strokeWidth="3" />
          <SvgBadge
            x={fBL.x - 44}
            y={fBL.y - hFront / 2}
            text={`Side C = ${formatNum(cVal)}`}
            color={colShape}
          />

          {/* Space Diagonal Callout */}
          <SvgBadge
            x={(bBL.x + fTR.x) / 2}
            y={(bBL.y + fTR.y) / 2 - 20}
            text={`Space Diag = ${formatNum(dSpace)}`}
            subText={`(θ: ${elevAngle.toFixed(1)}°)`}
            color={colC}
          />

          {/* Vertex Highlights */}
          <circle cx={bBL.x} cy={bBL.y} r="4.5" fill={colC} />
          <circle cx={fTR.x} cy={fTR.y} r="4.5" fill={colC} />
        </>
      );
    }

    // Polygon Mode
    const n = Math.max(3, Math.min(30, values.n ?? 6));
    const sideLen = values.b ?? 1;
    const diag = result.diagonal;
    const intAngle = ((n - 2) * 180) / n;

    const cx = originX + availW / 2;
    const cy = originY + availH / 2;
    const R = Math.min(availW, availH) * 0.44;

    // Offset angle so bottom edge is horizontal
    const offset = Math.PI / 2 + Math.PI / n;
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < n; i++) {
      const a = offset + (i * 2 * Math.PI) / n;
      pts.push({
        x: cx + R * Math.cos(a),
        y: cy + R * Math.sin(a),
      });
    }

    const pointsStr = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

    // Diagonal between vertex 0 and vertex 2 (or opposite vertex for even)
    const targetIdx = n % 2 === 0 ? n / 2 : Math.min(2, n - 1);
    const pStart = pts[0];
    const pEnd = pts[targetIdx];
    const pNext = pts[1];

    return (
      <>
        {/* Polygon Body */}
        <polygon
          points={pointsStr}
          fill="url(#triangle-grad)"
          stroke={colShape}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Diagonal Line */}
        <line
          x1={pStart.x}
          y1={pStart.y}
          x2={pEnd.x}
          y2={pEnd.y}
          stroke={colC}
          strokeWidth="3"
          strokeDasharray="6 3"
        />

        {/* Highlighted Bottom Edge (Side Length) */}
        <line
          x1={pStart.x}
          y1={pStart.y}
          x2={pNext.x}
          y2={pNext.y}
          stroke={colA}
          strokeWidth="3.5"
        />
        <SvgBadge
          x={(pStart.x + pNext.x) / 2}
          y={Math.max(pStart.y, pNext.y) + 24}
          text={`Side = ${formatNum(sideLen)}`}
          color={colA}
        />

        {/* Diagonal Badge */}
        <SvgBadge
          x={(pStart.x + pEnd.x) / 2}
          y={(pStart.y + pEnd.y) / 2 - 16}
          text={`Diag = ${formatNum(diag)}`}
          color={colC}
        />

        {/* Interior Angle Callout */}
        <SvgBadge
          x={pStart.x - 38}
          y={pStart.y - 14}
          text={`θ: ${intAngle.toFixed(1)}°`}
          color={colAngle}
        />

        {/* Center Side Count Badge */}
        <text
          x={cx}
          y={cy + 4}
          fontSize="11"
          fontWeight="700"
          fill="#475569"
          textAnchor="middle"
        >
          {n} Sides
        </text>

        {/* Vertices */}
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === 0 || i === targetIdx ? "4.5" : "3"}
            fill={i === 0 || i === targetIdx ? colC : colShape}
          />
        ))}
      </>
    );
  }, [shape, values, result, right, colA, colB, colC, colAngle, colShape]);

  // Dynamic legend metrics based on current shape
  const legendItems = useMemo(() => {
    if (shape === "right") {
      const aVal = values.a ?? 3;
      const bVal = values.b ?? 4;
      const cVal = right ? right.c : Math.hypot(aVal, bVal);
      const angleA = right ? right.angleA : (Math.atan(aVal / bVal) * 180) / Math.PI;
      const angleB = right ? right.angleB : 90 - angleA;
      return [
        { label: isEs ? "Cateto A" : "Side A", val: formatNum(aVal), color: colA },
        { label: isEs ? "Cateto B" : "Side B", val: formatNum(bVal), color: colB },
        { label: isEs ? "Hipotenusa C" : "Side C", val: formatNum(cVal), color: colC },
        { label: isEs ? "Ángulos" : "Angles", val: `90° | ${angleA.toFixed(1)}° | ${angleB.toFixed(1)}°`, color: colAngle },
      ];
    }
    if (shape === "rectangle") {
      const aVal = values.a ?? 4;
      const bVal = values.b ?? 3;
      const dVal = Math.hypot(aVal, bVal);
      const theta = (Math.atan(bVal / Math.max(0.001, aVal)) * 180) / Math.PI;
      return [
        { label: isEs ? "Largo (A)" : "Side A (L)", val: formatNum(aVal), color: colA },
        { label: isEs ? "Ancho (B)" : "Side B (W)", val: formatNum(bVal), color: colB },
        { label: "Diagonal (d)", val: formatNum(dVal), color: colC },
        { label: isEs ? "Ángulo (θ)" : "Angle (θ)", val: `${theta.toFixed(1)}° (90°${isEs ? " esquina" : " corner"})`, color: colAngle },
      ];
    }
    if (shape === "square") {
      const aVal = values.a ?? 4;
      const dVal = aVal * Math.SQRT2;
      return [
        { label: isEs ? "Lados (A=B)" : "Sides (A=B)", val: formatNum(aVal), color: colA },
        { label: "Diagonal (d)", val: formatNum(dVal), color: colC },
        { label: isEs ? "Esquinas" : "Corners", val: "90°", color: colAngle },
        { label: isEs ? "Áng. diagonal" : "Diag Angle", val: "45.0°", color: colAngle },
      ];
    }
    if (shape === "cuboid") {
      const aVal = values.a ?? 2;
      const bVal = values.b ?? 3;
      const cVal = values.c ?? 6;
      const dSpace = Math.hypot(aVal, bVal, cVal);
      const dFace = Math.hypot(aVal, bVal);
      return [
        { label: isEs ? "Largo (A)" : "Length (A)", val: formatNum(aVal), color: colA },
        { label: isEs ? "Ancho (B)" : "Width (B)", val: formatNum(bVal), color: colB },
        { label: isEs ? "Alto (C)" : "Height (C)", val: formatNum(cVal), color: colShape },
        { label: isEs ? "Diag. espacial" : "Space Diag", val: formatNum(dSpace), color: colC },
      ];
    }
    // Polygon
    const n = values.n ?? 6;
    const bVal = values.b ?? 1;
    const intAngle = ((n - 2) * 180) / n;
    return [
      { label: isEs ? "Lado (s)" : "Side (s)", val: formatNum(bVal), color: colA },
      { label: "Diagonal", val: formatNum(result.diagonal), color: colC },
      { label: isEs ? "Lados (n)" : "Sides (n)", val: `${n}`, color: colShape },
      { label: isEs ? "Áng. interior" : "Int Angle", val: `${intAngle.toFixed(1)}°`, color: colAngle },
    ];
  }, [shape, values, result, right, colA, colB, colC, colAngle, colShape, isEs]);

  const shapeTitle =
    shape === "right"
      ? labels.rightTriangle
      : shape === "square"
      ? labels.square
      : shape === "cuboid"
      ? labels.cuboid
      : shape === "polygon"
      ? labels.polygon
      : labels.rectangle;

  return (
    <div className="diagram-card" aria-label="Interactive Geometry Diagram">
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
          <span>{isEs ? "Diagrama interactivo de figura y dimensiones" : "Interactive Shape & Dimension Diagram"}</span>
        </div>
        <span className="diagram-badge">{shapeTitle}</span>
      </div>

      <div className="diagram-svg-wrap">
        <svg
          viewBox={`0 0 ${vbW} ${vbH}`}
          role="img"
          aria-label={`${shapeTitle} diagram showing sides, angles, and diagonal`}
        >
          <defs>
            <linearGradient id="triangle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="rect-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.5" />
            </linearGradient>
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
  subText,
  color = "#0284c7",
}: {
  x: number;
  y: number;
  text: string;
  subText?: string;
  color?: string;
}) {
  const fullText = subText ? `${text} ${subText}` : text;
  const charWidth = 6.8;
  const w = Math.max(54, fullText.length * charWidth + 14);
  const h = 20;
  const rectX = x - w / 2;
  const rectY = y - h / 2;

  return (
    <g>
      <rect
        x={rectX}
        y={rectY}
        width={w}
        height={h}
        rx={4}
        fill="#ffffff"
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        fill="#0f172a"
        fontFamily="var(--ic-font-sans), system-ui, sans-serif"
      >
        {text}
        {subText && (
          <tspan fill="#64748b" fontWeight={500}>
            {" "}
            {subText}
          </tspan>
        )}
      </text>
    </g>
  );
}
