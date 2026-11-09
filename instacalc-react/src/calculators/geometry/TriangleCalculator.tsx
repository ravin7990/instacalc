import {
  triangleLabels,
  translateMethod,
  translateError,
  translateClassification,
} from "@/i18n/triangle-labels";
import { useMemo, useState } from "react";
import type { SeoRecord } from "@/data/seo-types";
import { Layout } from "@/components/layout/Layout";
import { CalculatorHero } from "@/components/layout/CalculatorHero";
import { CalculatorShell } from "@/components/calculator/CalculatorShell";
import { FaqAccordion } from "@/components/calculator/FaqAccordion";
import { SeoHead, extractFaq } from "@/components/seo/SeoHead";
import {
  obtuseTriangleHCW,
  scaleneTriangleHCW,
  rightTrapezoid,
  triangleSSS,
  triangleSAS,
  triangleASA,
  solveRightTriangle,
  solveIsoscelesTriangle,
  convertLength,
  type LengthUnit,
} from "@/engines/geometry";
import {
  ObtuseTriangleDiagram,
  type TriangleDiagramData,
} from "@/calculators/geometry/ObtuseTriangleDiagram";
import { InTriangleArticle } from "@/components/articles/in/InTriangleArticle";
import { UsTriangleArticle } from "@/components/articles/us/UsTriangleArticle";
import { JaTriangleArticle } from "@/components/articles/ja/JaTriangleArticle";
import { KoTriangleArticle } from "@/components/articles/ko/KoTriangleArticle";
import { RuTriangleArticle } from "@/components/articles/ru/RuTriangleArticle";
import { EsTriangleArticle } from "@/components/articles/es/EsGeometryArticles";

export type TriangleSolverMode = "right" | "trapezoid" | "any3" | "isosceles" | "scalene" | "obtuse";
export type Any3Method = "sss" | "sas" | "asa";

const UNITS: LengthUnit[] = ["cm", "m", "mm", "inch", "ft", "yard"];

function ShapeIcon({ shape }: { shape: TriangleSolverMode }) {
  if (shape === "right") {
    return (
      <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3,14 3,2 21,14" />
      </svg>
    );
  }
  if (shape === "trapezoid") {
    return (
      <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3,14 3,2 13,3 21,14" />
      </svg>
    );
  }
  if (shape === "any3") {
    return (
      <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3,14 12,2 21,14" />
      </svg>
    );
  }
  if (shape === "isosceles") {
    return (
      <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="2,14 12,3 22,14" />
      </svg>
    );
  }
  if (shape === "scalene") {
    return (
      <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="3,14 8,3 21,14" />
      </svg>
    );
  }
  // obtuse
  return (
    <svg width="20" height="15" viewBox="0 0 24 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="8,14 2,2 22,14" />
    </svg>
  );
}

export default function TriangleCalculator({ seo }: { seo: SeoRecord }) {
  const t = triangleLabels(seo.locale);
  const [mode, setMode] = useState<TriangleSolverMode>("right");
  const [any3Method, setAny3Method] = useState<Any3Method>("sss");
  const [unit, setUnit] = useState<LengthUnit>("cm");

  // Per-mode input states with string values for clean clearing
  const [rightInputs, setRightInputs] = useState<{ a: string; b: string; c: string; angleY: string; angleZ: string }>({
    a: "6",
    b: "8",
    c: "",
    angleY: "",
    angleZ: "",
  });

  const [isoInputs, setIsoInputs] = useState<{ h: string; c: string; a: string; angleA: string; angleB: string }>({
    h: "12",
    c: "18",
    a: "",
    angleA: "",
    angleB: "",
  });

  const [obtuseInputs, setObtuseInputs] = useState<{ h: string; c: string; w: string }>({
    h: "10",
    c: "15",
    w: "6",
  });

  const [scaleneInputs, setScaleneInputs] = useState<{ h: string; c: string; w: string }>({
    h: "12",
    c: "20",
    w: "7",
  });

  const [any3Inputs, setAny3Inputs] = useState<{ a: string; b: string; c: string; angleB: string; angleC: string }>({
    a: "12",
    b: "15",
    c: "20",
    angleB: "45",
    angleC: "75",
  });

  const [trapInputs, setTrapInputs] = useState<{ h: string; w: string; c: string }>({
    h: "10",
    w: "8",
    c: "16",
  });

  // Global unit conversion handler converting all stored lengths
  const changeUnit = (nextUnit: LengthUnit) => {
    if (nextUnit === unit) return;
    const conv = (val: string) => {
      const num = parseFloat(val);
      if (isNaN(num) || num <= 0) return val;
      const res = convertLength(num, unit, nextUnit);
      return Number(res.toFixed(4)).toString();
    };

    setRightInputs((s) => ({ ...s, a: conv(s.a), b: conv(s.b), c: conv(s.c) }));
    setIsoInputs((s) => ({ ...s, h: conv(s.h), c: conv(s.c), a: conv(s.a) }));
    setObtuseInputs((s) => ({ h: conv(s.h), c: conv(s.c), w: conv(s.w) }));
    setScaleneInputs((s) => ({ h: conv(s.h), c: conv(s.c), w: conv(s.w) }));
    setAny3Inputs((s) => ({ ...s, a: conv(s.a), b: conv(s.b), c: conv(s.c) }));
    setTrapInputs((s) => ({ h: conv(s.h), w: conv(s.w), c: conv(s.c) }));
    setUnit(nextUnit);
  };

  // Reset defaults for current mode
  const resetCurrentDefaults = () => {
    if (mode === "right") setRightInputs({ a: "6", b: "8", c: "", angleY: "", angleZ: "" });
    else if (mode === "isosceles") setIsoInputs({ h: "12", c: "18", a: "", angleA: "", angleB: "" });
    else if (mode === "obtuse") setObtuseInputs({ h: "10", c: "15", w: "6" });
    else if (mode === "scalene") setScaleneInputs({ h: "12", c: "20", w: "7" });
    else if (mode === "any3") setAny3Inputs({ a: "12", b: "15", c: "20", angleB: "45", angleC: "75" });
    else if (mode === "trapezoid") setTrapInputs({ h: "10", w: "8", c: "16" });
  };

  // Clear all fields for current mode
  const clearCurrentFields = () => {
    if (mode === "right") setRightInputs({ a: "", b: "", c: "", angleY: "", angleZ: "" });
    else if (mode === "isosceles") setIsoInputs({ h: "", c: "", a: "", angleA: "", angleB: "" });
    else if (mode === "obtuse") setObtuseInputs({ h: "", c: "", w: "" });
    else if (mode === "scalene") setScaleneInputs({ h: "", c: "", w: "" });
    else if (mode === "any3") setAny3Inputs({ a: "", b: "", c: "", angleB: "", angleC: "" });
    else if (mode === "trapezoid") setTrapInputs({ h: "", w: "", c: "" });
  };

  // 1. Right Triangle Solver (Any 2 inputs: Side A, B, C or Angles Y, Z)
  const rightSolved = useMemo(() => {
    if (mode !== "right") return null;
    const a = parseFloat(rightInputs.a);
    const b = parseFloat(rightInputs.b);
    const c = parseFloat(rightInputs.c);
    const angleY = parseFloat(rightInputs.angleY);
    const angleZ = parseFloat(rightInputs.angleZ);

    return solveRightTriangle({
      a: !isNaN(a) && a > 0 ? a : undefined,
      b: !isNaN(b) && b > 0 ? b : undefined,
      c: !isNaN(c) && c > 0 ? c : undefined,
      angleY: !isNaN(angleY) && angleY > 0 && angleY < 90 ? angleY : undefined,
      angleZ: !isNaN(angleZ) && angleZ > 0 && angleZ < 90 ? angleZ : undefined,
    });
  }, [mode, rightInputs]);

  // 2. Isosceles Triangle Solver (Any 2 inputs: H, C, A, Apex Angle, Base Angle)
  const isoSolved = useMemo(() => {
    if (mode !== "isosceles") return null;
    const h = parseFloat(isoInputs.h);
    const c = parseFloat(isoInputs.c);
    const a = parseFloat(isoInputs.a);
    const angleA = parseFloat(isoInputs.angleA);
    const angleB = parseFloat(isoInputs.angleB);

    return solveIsoscelesTriangle({
      h: !isNaN(h) && h > 0 ? h : undefined,
      c: !isNaN(c) && c > 0 ? c : undefined,
      a: !isNaN(a) && a > 0 ? a : undefined,
      angleA: !isNaN(angleA) && angleA > 0 && angleA < 180 ? angleA : undefined,
      angleB: !isNaN(angleB) && angleB > 0 && angleB < 90 ? angleB : undefined,
    });
  }, [mode, isoInputs]);

  // 3. Obtuse Triangle Solver (H, C, W)
  const obtuseSolved = useMemo(() => {
    if (mode !== "obtuse") return null;
    const h = parseFloat(obtuseInputs.h);
    const c = parseFloat(obtuseInputs.c);
    const w = parseFloat(obtuseInputs.w);
    if (isNaN(h) || isNaN(c) || isNaN(w) || h <= 0 || c <= 0) return null;
    return obtuseTriangleHCW(h, c, w);
  }, [mode, obtuseInputs]);

  // 4. Scalene Triangle Solver (H, C, W where 0 <= W <= C)
  const scaleneSolved = useMemo(() => {
    if (mode !== "scalene") return null;
    const h = parseFloat(scaleneInputs.h);
    const c = parseFloat(scaleneInputs.c);
    const w = parseFloat(scaleneInputs.w);
    if (isNaN(h) || isNaN(c) || isNaN(w) || h <= 0 || c <= 0) return null;
    return scaleneTriangleHCW(h, c, w);
  }, [mode, scaleneInputs]);

  // 5. General Triangle Solver (Any 3 values: SSS, SAS, ASA)
  const any3Solved = useMemo(() => {
    if (mode !== "any3") return null;
    const a = parseFloat(any3Inputs.a);
    const b = parseFloat(any3Inputs.b);
    const c = parseFloat(any3Inputs.c);
    const angleB = parseFloat(any3Inputs.angleB);
    const angleC = parseFloat(any3Inputs.angleC);

    if (any3Method === "sss") {
      if (isNaN(a) || isNaN(b) || isNaN(c) || a <= 0 || b <= 0 || c <= 0) return null;
      return triangleSSS(a, b, c);
    }
    if (any3Method === "sas") {
      if (isNaN(a) || isNaN(b) || isNaN(angleC) || a <= 0 || b <= 0 || angleC <= 0 || angleC >= 180) return null;
      return triangleSAS(a, b, angleC);
    }
    if (isNaN(a) || isNaN(angleB) || isNaN(angleC) || a <= 0 || angleB <= 0 || angleC <= 0 || angleB + angleC >= 180) return null;
    return triangleASA(a, angleB, angleC);
  }, [mode, any3Method, any3Inputs]);

  // 6. Right Trapezoid Solver (H, W, C)
  const trapSolved = useMemo(() => {
    if (mode !== "trapezoid") return null;
    const h = parseFloat(trapInputs.h);
    const w = parseFloat(trapInputs.w);
    const c = parseFloat(trapInputs.c);
    if (isNaN(h) || isNaN(w) || isNaN(c) || h <= 0 || w <= 0 || c <= 0) return null;
    return rightTrapezoid(h, w, c);
  }, [mode, trapInputs]);

  // Calculate action: Populates empty derived fields
  const handleCalculate = () => {
    if (mode === "right" && rightSolved && rightSolved.valid) {
      setRightInputs({
        a: Number(rightSolved.a.toFixed(4)).toString(),
        b: Number(rightSolved.b.toFixed(4)).toString(),
        c: Number(rightSolved.c.toFixed(4)).toString(),
        angleY: Number(rightSolved.angleY.toFixed(2)).toString(),
        angleZ: Number(rightSolved.angleZ.toFixed(2)).toString(),
      });
    } else if (mode === "isosceles" && isoSolved && isoSolved.valid) {
      setIsoInputs({
        h: Number(isoSolved.h.toFixed(4)).toString(),
        c: Number(isoSolved.c.toFixed(4)).toString(),
        a: Number(isoSolved.sideA.toFixed(4)).toString(),
        angleA: Number(isoSolved.angleA.toFixed(2)).toString(),
        angleB: Number(isoSolved.angleB.toFixed(2)).toString(),
      });
    }
  };

  // Unified diagram data passed to ObtuseTriangleDiagram (always guaranteed to produce stable diagram)
  const diagramData: TriangleDiagramData = useMemo(() => {
    if (mode === "right") {
      const r = rightSolved && rightSolved.valid ? rightSolved : null;
      return {
        mode: "right",
        sideA: r ? r.a : parseFloat(rightInputs.a) || 6,
        sideB: r ? r.b : parseFloat(rightInputs.b) || 8,
        sideC: r ? r.c : parseFloat(rightInputs.c) || 10,
        angleA: r ? r.angleY : 53.13,
        angleB: r ? r.angleZ : 36.87,
        angleC: 90,
        area: r ? r.area : 24,
        perimeter: r ? r.perimeter : 24,
        unit,
        classification: r ? r.classification : "Right Triangle",
      };
    }
    if (mode === "isosceles") {
      const r = isoSolved && isoSolved.valid ? isoSolved : null;
      return {
        mode: "isosceles",
        h: r ? r.h : parseFloat(isoInputs.h) || 12,
        c: r ? r.c : parseFloat(isoInputs.c) || 18,
        sideA: r ? r.sideA : parseFloat(isoInputs.a) || 15,
        sideB: r ? r.sideB : parseFloat(isoInputs.a) || 15,
        sideC: r ? r.sideC : parseFloat(isoInputs.c) || 18,
        angleA: r ? r.angleA : 73.74,
        angleB: r ? r.angleB : 53.13,
        angleC: r ? r.angleC : 53.13,
        area: r ? r.area : 108,
        perimeter: r ? r.perimeter : 48,
        unit,
        classification: r ? r.classification : "Isosceles Triangle",
      };
    }
    if (mode === "obtuse") {
      const h = parseFloat(obtuseInputs.h) || 10;
      const c = parseFloat(obtuseInputs.c) || 15;
      const w = parseFloat(obtuseInputs.w) || 6;
      if (obtuseSolved && obtuseSolved.valid) {
        return {
          mode: "obtuse",
          h: obtuseSolved.h,
          c: obtuseSolved.c,
          w: obtuseSolved.w,
          sideA: obtuseSolved.sideA,
          sideB: obtuseSolved.sideB,
          sideC: obtuseSolved.sideC,
          angleA: obtuseSolved.angleA,
          angleB: obtuseSolved.angleB,
          angleC: obtuseSolved.angleC,
          area: obtuseSolved.area,
          perimeter: obtuseSolved.perimeter,
          unit,
          classification: obtuseSolved.classification,
        };
      }
      return {
        mode: "obtuse",
        h,
        c,
        w,
        sideA: Math.hypot(h, w),
        sideB: Math.hypot(h, c + w),
        sideC: c,
        angleA: 30,
        angleB: 25,
        angleC: 125,
        area: (c * h) / 2,
        perimeter: c + Math.hypot(h, w) + Math.hypot(h, c + w),
        unit,
        classification: t.classifications.obtuse,
      };
    }
    if (mode === "scalene") {
      const h = parseFloat(scaleneInputs.h) || 12;
      const c = parseFloat(scaleneInputs.c) || 20;
      const w = parseFloat(scaleneInputs.w) || 7;
      if (scaleneSolved && scaleneSolved.valid) {
        return {
          mode: "scalene",
          h: scaleneSolved.h,
          c: scaleneSolved.c,
          w: scaleneSolved.w,
          sideA: scaleneSolved.sideA,
          sideB: scaleneSolved.sideB,
          sideC: scaleneSolved.sideC,
          angleA: scaleneSolved.angleA,
          angleB: scaleneSolved.angleB,
          angleC: scaleneSolved.angleC,
          area: scaleneSolved.area,
          perimeter: scaleneSolved.perimeter,
          unit,
          classification: scaleneSolved.classification,
        };
      }
      return {
        mode: "scalene",
        h,
        c,
        w,
        sideA: Math.hypot(h, w),
        sideB: Math.hypot(h, Math.abs(c - w)),
        sideC: c,
        angleA: 60,
        angleB: 50,
        angleC: 70,
        area: (c * h) / 2,
        perimeter: c + Math.hypot(h, w) + Math.hypot(h, Math.abs(c - w)),
        unit,
        classification: t.classifications.scalene,
      };
    }
    if (mode === "any3") {
      const a = parseFloat(any3Inputs.a) || 12;
      const b = parseFloat(any3Inputs.b) || 15;
      const c = parseFloat(any3Inputs.c) || 20;
      if (any3Solved && any3Solved.valid) {
        return {
          mode: "any3",
          sideA: any3Solved.a,
          sideB: any3Solved.b,
          sideC: any3Solved.c,
          angleA: any3Solved.angleA,
          angleB: any3Solved.angleB,
          angleC: any3Solved.angleC,
          area: any3Solved.area,
          perimeter: any3Solved.perimeter,
          unit,
          classification: any3Solved.classification,
        };
      }
      return {
        mode: "any3",
        sideA: a,
        sideB: b,
        sideC: c,
        angleA: any3Solved?.angleA || 36.8,
        angleB: any3Solved?.angleB || 48.2,
        angleC: any3Solved?.angleC || 95.0,
        area: any3Solved?.area || 0,
        perimeter: any3Solved?.perimeter || (a + b + c),
        unit,
        classification: any3Solved?.classification || (seo.locale === "es" ? "Triángulo (3 datos)" : "Triangle (3 values)"),
      };
    }
    // trapezoid
    const h = parseFloat(trapInputs.h) || 10;
    const w = parseFloat(trapInputs.w) || 8;
    const c = parseFloat(trapInputs.c) || 16;
    if (trapSolved && trapSolved.valid) {
      return {
        mode: "trapezoid",
        h: trapSolved.h,
        w: trapSolved.cTop,
        c: trapSolved.cBot,
        slant: trapSolved.slant,
        taperAngle: trapSolved.taperAngle,
        area: trapSolved.area,
        perimeter: trapSolved.perimeter,
        unit,
        classification: "Right Trapezoid",
      };
    }
    const slant = Math.hypot(h, Math.abs(c - w));
    return {
      mode: "trapezoid",
      h,
      w,
      c,
      slant,
      taperAngle: Math.atan2(Math.abs(c - w), h) * (180 / Math.PI),
      area: ((w + c) / 2) * h,
      perimeter: h + w + c + slant,
      unit,
      classification: "Right Trapezoid",
    };
  }, [mode, rightSolved, rightInputs, isoSolved, isoInputs, obtuseSolved, obtuseInputs, scaleneSolved, scaleneInputs, any3Solved, any3Inputs, trapSolved, trapInputs, unit, t, seo.locale]);

  // Mode selection definitions matching the mobile app
  const modeButtons: Array<[TriangleSolverMode, string]> = [
    ["right", t.modes.right],
    ["trapezoid", t.modes.trapezoid],
    ["any3", t.modes.any3],
    ["isosceles", t.modes.isosceles],
    ["scalene", t.modes.scalene],
    ["obtuse", t.modes.obtuse],
  ];

  const any3Methods: Array<[Any3Method, string]> = [
    ["sss", t.any3Methods.sss],
    ["sas", t.any3Methods.sas],
    ["asa", t.any3Methods.asa],
  ];

  // Key-value results table with fixed row stability across all input states
  const rows = useMemo(() => {
    const uStr = ` ${unit}`;
    const sqStr = ` ${unit}²`;

    if (mode === "right") {
      const isValid = rightSolved && rightSolved.valid;
      return [
        { key: t.results.sideA, value: isValid ? `${rightSolved.a.toFixed(3)}${uStr}` : (rightInputs.a ? `${rightInputs.a}${uStr}` : "—") },
        { key: t.results.sideB, value: isValid ? `${rightSolved.b.toFixed(3)}${uStr}` : (rightInputs.b ? `${rightInputs.b}${uStr}` : "—") },
        { key: t.results.hypotenuse, value: isValid ? `${rightSolved.c.toFixed(3)}${uStr}` : (rightInputs.c ? `${rightInputs.c}${uStr}` : "—") },
        { key: t.results.angleX, value: "90.00°" },
        { key: t.results.angleY, value: isValid ? `${rightSolved.angleY.toFixed(2)}°` : (rightInputs.angleY ? `${rightInputs.angleY}°` : "—") },
        { key: t.results.angleZ, value: isValid ? `${rightSolved.angleZ.toFixed(2)}°` : (rightInputs.angleZ ? `${rightInputs.angleZ}°` : "—") },
        { key: t.results.area, value: isValid ? `${rightSolved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${rightSolved.perimeter.toFixed(3)}${uStr}` : "—" },
        {
          key: `${t.results.trigRatios} (Y)`,
          value: isValid ? `sin=${rightSolved.sinY.toFixed(3)} cos=${rightSolved.cosY.toFixed(3)} tan=${rightSolved.tanY.toFixed(3)}` : "—",
        },
        {
          key: `${t.results.trigRatios} (Z)`,
          value: isValid ? `sin=${rightSolved.sinZ.toFixed(3)} cos=${rightSolved.cosZ.toFixed(3)} tan=${rightSolved.tanZ.toFixed(3)}` : "—",
        },
        {
          key: t.results.classification,
          value: isValid ? t.classifications.right : (translateError(rightSolved?.error, seo.locale) || t.results.enter2Values),
        },
        { key: t.results.solvedFrom, value: isValid ? translateMethod(rightSolved.solvedFrom, seo.locale) : "—" },
      ];
    }

    if (mode === "isosceles") {
      const isValid = isoSolved && isoSolved.valid;
      return [
        { key: t.results.centralHeight, value: isValid ? `${isoSolved.h.toFixed(3)}${uStr}` : (isoInputs.h ? `${isoInputs.h}${uStr}` : "—") },
        { key: t.results.baseLength, value: isValid ? `${isoSolved.c.toFixed(3)}${uStr}` : (isoInputs.c ? `${isoInputs.c}${uStr}` : "—") },
        { key: t.results.equalLegs, value: isValid ? `${isoSolved.sideA.toFixed(3)}${uStr}` : (isoInputs.a ? `${isoInputs.a}${uStr}` : "—") },
        { key: t.results.angleA, value: isValid ? `${isoSolved.angleA.toFixed(2)}°` : (isoInputs.angleA ? `${isoInputs.angleA}°` : "—") },
        { key: t.results.baseAngles, value: isValid ? `${isoSolved.angleB.toFixed(2)}°` : (isoInputs.angleB ? `${isoInputs.angleB}°` : "—") },
        { key: t.results.area, value: isValid ? `${isoSolved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${isoSolved.perimeter.toFixed(3)}${uStr}` : "—" },
        { key: t.results.altitudeBaseRatio, value: isValid ? (isoSolved.h / isoSolved.c).toFixed(3) : "—" },
        {
          key: t.results.classification,
          value: isValid ? t.classifications.isosceles : (translateError(isoSolved?.error, seo.locale) || t.results.enter2Values),
        },
        { key: t.results.solvedFrom, value: isValid ? translateMethod(isoSolved.solvedFrom, seo.locale) : "—" },
      ];
    }

    if (mode === "obtuse") {
      const isValid = obtuseSolved && obtuseSolved.valid;
      return [
        { key: t.results.angleC, value: isValid ? `${obtuseSolved.angleC.toFixed(2)}°` : "—" },
        { key: t.results.angleA, value: isValid ? `${obtuseSolved.angleA.toFixed(2)}°` : "—" },
        { key: t.results.angleB, value: isValid ? `${obtuseSolved.angleB.toFixed(2)}°` : "—" },
        { key: `${t.results.sideA} (a)`, value: isValid ? `${obtuseSolved.sideA.toFixed(3)}${uStr}` : "—" },
        { key: `${t.results.sideB} (b)`, value: isValid ? `${obtuseSolved.sideB.toFixed(3)}${uStr}` : "—" },
        { key: `${t.results.sideC} (c)`, value: isValid ? `${obtuseSolved.sideC.toFixed(3)}${uStr}` : (obtuseInputs.c ? `${obtuseInputs.c}${uStr}` : "—") },
        { key: t.results.area, value: isValid ? `${obtuseSolved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${obtuseSolved.perimeter.toFixed(3)}${uStr}` : "—" },
        { key: t.results.semiPerimeter, value: isValid ? `${obtuseSolved.semiPerimeter.toFixed(3)}${uStr}` : "—" },
        { key: t.results.inradius, value: isValid ? `${obtuseSolved.inradius.toFixed(3)}${uStr}` : "—" },
        { key: t.results.circumradius, value: isValid ? `${obtuseSolved.circumradius.toFixed(3)}${uStr}` : "—" },
        {
          key: t.results.classification,
          value: isValid
            ? t.classifications.obtuse
            : (seo.locale === "es" ? "Introduce H, C y W para calcular" : "Enter H, C and W to calculate"),
        },
      ];
    }

    if (mode === "scalene") {
      const isValid = scaleneSolved && scaleneSolved.valid;
      return [
        { key: t.results.angleA, value: isValid ? `${scaleneSolved.angleA.toFixed(2)}°` : "—" },
        { key: `${t.results.angleB} (b°)`, value: isValid ? `${scaleneSolved.angleB.toFixed(2)}°` : "—" },
        { key: `${t.results.angleC} (c°)`, value: isValid ? `${scaleneSolved.angleC.toFixed(2)}°` : "—" },
        { key: `${t.results.sideA} (a)`, value: isValid ? `${scaleneSolved.sideA.toFixed(3)}${uStr}` : "—" },
        { key: `${t.results.sideB} (b)`, value: isValid ? `${scaleneSolved.sideB.toFixed(3)}${uStr}` : "—" },
        { key: `${t.results.sideC} (c)`, value: isValid ? `${scaleneSolved.sideC.toFixed(3)}${uStr}` : (scaleneInputs.c ? `${scaleneInputs.c}${uStr}` : "—") },
        { key: t.results.area, value: isValid ? `${scaleneSolved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${scaleneSolved.perimeter.toFixed(3)}${uStr}` : "—" },
        { key: t.results.semiPerimeter, value: isValid ? `${scaleneSolved.semiPerimeter.toFixed(3)}${uStr}` : "—" },
        { key: t.results.inradius, value: isValid ? `${scaleneSolved.inradius.toFixed(3)}${uStr}` : "—" },
        { key: t.results.circumradius, value: isValid ? `${scaleneSolved.circumradius.toFixed(3)}${uStr}` : "—" },
        {
          key: t.results.classification,
          value: isValid
            ? t.classifications.scalene
            : (seo.locale === "es" ? "Introduce H, C y W (0 ≤ W ≤ C)" : "Enter H, C and W (0 ≤ W ≤ C)"),
        },
      ];
    }

    if (mode === "any3") {
      const isValid = any3Solved && any3Solved.valid;
      return [
        { key: t.results.sideA, value: isValid ? `${any3Solved.a.toFixed(3)}${uStr}` : (any3Inputs.a ? `${any3Inputs.a}${uStr}` : "—") },
        { key: t.results.sideB, value: isValid ? `${any3Solved.b.toFixed(3)}${uStr}` : (any3Inputs.b ? `${any3Inputs.b}${uStr}` : "—") },
        { key: t.results.sideC, value: isValid ? `${any3Solved.c.toFixed(3)}${uStr}` : (any3Inputs.c ? `${any3Inputs.c}${uStr}` : "—") },
        { key: t.results.angleA, value: isValid ? `${any3Solved.angleA.toFixed(2)}°` : "—" },
        { key: t.results.angleB, value: isValid ? `${any3Solved.angleB.toFixed(2)}°` : "—" },
        { key: t.results.angleC, value: isValid ? `${any3Solved.angleC.toFixed(2)}°` : (any3Inputs.angleC ? `${any3Inputs.angleC}°` : "—") },
        { key: t.results.area, value: isValid ? `${any3Solved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${any3Solved.perimeter.toFixed(3)}${uStr}` : "—" },
        {
          key: t.results.classification,
          value: isValid
            ? translateClassification(any3Solved.classification, t)
            : any3Solved && !any3Solved.valid
            ? (seo.locale === "es"
                ? "Valores no forman un triángulo válido"
                : "Invalid triangle (sides do not form a triangle)")
            : (seo.locale === "es" ? "Introduce 3 valores válidos" : "Enter 3 valid values"),
        },
      ];
    }

    if (mode === "trapezoid") {
      const isValid = trapSolved && trapSolved.valid;
      return [
        { key: t.results.slantEdge, value: isValid ? `${trapSolved.slant.toFixed(3)}${uStr}` : "—" },
        { key: t.results.taperAngle, value: isValid ? `${trapSolved.taperAngle.toFixed(2)}°` : "—" },
        { key: t.results.centralHeight, value: isValid ? `${trapSolved.h.toFixed(3)}${uStr}` : (trapInputs.h ? `${trapInputs.h}${uStr}` : "—") },
        { key: t.results.topBase, value: isValid ? `${trapSolved.cTop.toFixed(3)}${uStr}` : (trapInputs.w ? `${trapInputs.w}${uStr}` : "—") },
        { key: t.results.botBase, value: isValid ? `${trapSolved.cBot.toFixed(3)}${uStr}` : (trapInputs.c ? `${trapInputs.c}${uStr}` : "—") },
        { key: t.results.baseDiff, value: isValid ? `${Math.abs(trapSolved.cBot - trapSolved.cTop).toFixed(3)}${uStr}` : "—" },
        { key: t.results.area, value: isValid ? `${trapSolved.area.toFixed(3)}${sqStr}` : "—" },
        { key: t.results.perimeter, value: isValid ? `${trapSolved.perimeter.toFixed(3)}${uStr}` : "—" },
        {
          key: t.results.classification,
          value: isValid
            ? t.classifications.trapezoid
            : (seo.locale === "es" ? "Introduce altura y bases válidas" : "Enter valid height and bases"),
        },
      ];
    }

    return [];
  }, [mode, rightSolved, rightInputs, isoSolved, isoInputs, obtuseSolved, obtuseInputs, scaleneSolved, scaleneInputs, any3Solved, any3Inputs, trapSolved, trapInputs, unit, t, seo.locale]);

  // Primary summary highlight badge
  const summary = useMemo(() => {
    if (mode === "right" && rightSolved && rightSolved.valid) {
      return {
        label: `${t.summaries.right} (${unit})`,
        value: `${rightSolved.c.toFixed(3)} ${unit}  •  ${rightSolved.area.toFixed(2)} ${unit}²`,
      };
    }
    if (mode === "isosceles" && isoSolved && isoSolved.valid) {
      return {
        label: `${t.summaries.isosceles} (${unit})`,
        value: `${isoSolved.sideA.toFixed(2)} ${unit}  •  ${isoSolved.area.toFixed(2)} ${unit}²`,
      };
    }
    if (mode === "obtuse" && obtuseSolved && obtuseSolved.valid) {
      return {
        label: `${t.summaries.obtuse} (${unit})`,
        value: `${obtuseSolved.angleC.toFixed(2)}°  •  ${obtuseSolved.area.toFixed(2)} ${unit}²`,
      };
    }
    if (mode === "scalene" && scaleneSolved && scaleneSolved.valid) {
      return {
        label: `${t.summaries.scalene} (${unit})`,
        value: `${scaleneSolved.area.toFixed(2)} ${unit}²  •  a=${scaleneSolved.angleA.toFixed(1)}°`,
      };
    }
    if (mode === "any3") {
      if (any3Solved && any3Solved.valid) {
        return {
          label: `${t.summaries.any3} (${unit})`,
          value: `${any3Solved.area.toFixed(2)} ${unit}²  •  P=${any3Solved.perimeter.toFixed(2)} ${unit}`,
        };
      }
      return {
        label: `${t.summaries.any3} (${unit})`,
        value: seo.locale === "es" ? "Completar 3 valores" : "Enter 3 values",
      };
    }
    if (mode === "trapezoid" && trapSolved && trapSolved.valid) {
      return {
        label: `${t.summaries.trapezoid} (${unit})`,
        value: `${trapSolved.slant.toFixed(3)} ${unit}  •  ${trapSolved.area.toFixed(2)} ${unit}²`,
      };
    }
    return { label: t.summaries.result, value: "0" };
  }, [mode, rightSolved, isoSolved, obtuseSolved, scaleneSolved, any3Solved, trapSolved, unit, t, seo.locale]);

  return (
    <>
      <SeoHead seo={seo} appCategory="UtilitiesApplication" />
      <Layout locale={seo.locale}>
        <CalculatorHero
          seo={seo}
          eyebrow={t.eyebrow}
          points={t.heroPoints}
        />

        <CalculatorShell
          locale={seo.locale}
          id="triangle-calculator"
          title={t.title}
          hasDiagram={true}
          summary={summary}
          inputs={
            <>
              {/* 1. Shape Selection Bar with Icons matching mobile app */}
              <div className="field-card">
                <div className="field-head">
                  <span id="triangle-mode-label">{t.selectType}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="triangle-mode-label">
                  {modeButtons.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`chip${mode === key ? " active" : ""}`}
                      aria-pressed={mode === key}
                      onClick={() => setMode(key)}
                    >
                      <ShapeIcon shape={key} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Universal Measurement Unit Selector across ALL modes */}
              <div className="field-card">
                <div className="field-head">
                  <span id="unit-select-label">{t.unit}</span>
                </div>
                <div className="chips-scroll" role="group" aria-labelledby="unit-select-label">
                  {UNITS.map((u) => (
                    <button
                      key={u}
                      type="button"
                      className={`chip${unit === u ? " active" : ""}`}
                      aria-pressed={unit === u}
                      onClick={() => changeUnit(u)}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Shape-Specific Inputs with Individual Clear Buttons */}

              {/* MODE: Right Triangle (Sides vs Angles 2-Column Grid) */}
              {mode === "right" && (
                <div className="age-dates-grid">
                  <div className="age-date-group">
                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-side-a">{t.fields.sideA}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-side-a"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.sideA} (${unit})`}
                          value={rightInputs.a}
                          onChange={(e) => setRightInputs((s) => ({ ...s, a: e.target.value }))}
                        />
                        {rightInputs.a ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.sideA}`}
                            onClick={() => setRightInputs((s) => ({ ...s, a: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-side-b">{t.fields.sideB}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-side-b"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.sideB} (${unit})`}
                          value={rightInputs.b}
                          onChange={(e) => setRightInputs((s) => ({ ...s, b: e.target.value }))}
                        />
                        {rightInputs.b ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.sideB}`}
                            onClick={() => setRightInputs((s) => ({ ...s, b: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-side-c">{t.fields.sideC}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-side-c"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.sideC} (${unit})`}
                          value={rightInputs.c}
                          onChange={(e) => setRightInputs((s) => ({ ...s, c: e.target.value }))}
                        />
                        {rightInputs.c ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.sideC}`}
                            onClick={() => setRightInputs((s) => ({ ...s, c: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="age-date-group">
                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-angle-y">{t.fields.angleY}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-angle-y"
                          type="number"
                          step="any"
                          min="0.1"
                          max="89.9"
                          placeholder={t.fields.angleY}
                          value={rightInputs.angleY}
                          onChange={(e) => setRightInputs((s) => ({ ...s, angleY: e.target.value }))}
                        />
                        {rightInputs.angleY ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.angleY}`}
                            onClick={() => setRightInputs((s) => ({ ...s, angleY: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">°</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-angle-z">{t.fields.angleZ}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-angle-z"
                          type="number"
                          step="any"
                          min="0.1"
                          max="89.9"
                          placeholder={t.fields.angleZ}
                          value={rightInputs.angleZ}
                          onChange={(e) => setRightInputs((s) => ({ ...s, angleZ: e.target.value }))}
                        />
                        {rightInputs.angleZ ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.angleZ}`}
                            onClick={() => setRightInputs((s) => ({ ...s, angleZ: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">°</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="rt-angle-x">{t.fields.angleX}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="rt-angle-x"
                          type="text"
                          readOnly
                          value="90.0"
                          aria-label={t.fields.angleX}
                        />
                        <span className="input-suffix">° (90°)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE: Isosceles Triangle (Flexible 2-Value Solver) */}
              {mode === "isosceles" && (
                <div className="age-dates-grid">
                  <div className="age-date-group">
                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="iso-h">{t.fields.heightH}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="iso-h"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.heightH} (${unit})`}
                          value={isoInputs.h}
                          onChange={(e) => setIsoInputs((s) => ({ ...s, h: e.target.value }))}
                        />
                        {isoInputs.h ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.heightH}`}
                            onClick={() => setIsoInputs((s) => ({ ...s, h: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="iso-c">{t.fields.baseC}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="iso-c"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.baseC} (${unit})`}
                          value={isoInputs.c}
                          onChange={(e) => setIsoInputs((s) => ({ ...s, c: e.target.value }))}
                        />
                        {isoInputs.c ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.baseC}`}
                            onClick={() => setIsoInputs((s) => ({ ...s, c: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="iso-a">{t.fields.equalLegA}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="iso-a"
                          type="number"
                          step="any"
                          min="0"
                          placeholder={`${t.fields.equalLegA} (${unit})`}
                          value={isoInputs.a}
                          onChange={(e) => setIsoInputs((s) => ({ ...s, a: e.target.value }))}
                        />
                        {isoInputs.a ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.equalLegA}`}
                            onClick={() => setIsoInputs((s) => ({ ...s, a: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">{unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="age-date-group">
                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="iso-ang-a">{t.fields.apexAngleA}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="iso-ang-a"
                          type="number"
                          step="any"
                          min="0.1"
                          max="179.9"
                          placeholder={t.fields.apexAngleA}
                          value={isoInputs.angleA}
                          onChange={(e) => setIsoInputs((s) => ({ ...s, angleA: e.target.value }))}
                        />
                        {isoInputs.angleA ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.apexAngleA}`}
                            onClick={() => setIsoInputs((s) => ({ ...s, angleA: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">°</span>
                      </div>
                    </div>

                    <div className="field-card">
                      <div className="field-head">
                        <label htmlFor="iso-ang-b">{t.fields.baseAngleB}</label>
                      </div>
                      <div className="input-with-adornment">
                        <input
                          id="iso-ang-b"
                          type="number"
                          step="any"
                          min="0.1"
                          max="89.9"
                          placeholder={t.fields.baseAngleB}
                          value={isoInputs.angleB}
                          onChange={(e) => setIsoInputs((s) => ({ ...s, angleB: e.target.value }))}
                        />
                        {isoInputs.angleB ? (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            aria-label={`${t.fields.clearField} ${t.fields.baseAngleB}`}
                            onClick={() => setIsoInputs((s) => ({ ...s, angleB: "" }))}
                          >
                            ✕
                          </button>
                        ) : null}
                        <span className="input-suffix">°</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MODE: Obtuse Triangle (H, C, W) */}
              {mode === "obtuse" && (
                <>
                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="obt-h">{t.fields.heightH}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="obt-h"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.heightH} (${unit})`}
                        value={obtuseInputs.h}
                        onChange={(e) => setObtuseInputs((s) => ({ ...s, h: e.target.value }))}
                      />
                      {obtuseInputs.h ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.heightH}`}
                          onClick={() => setObtuseInputs((s) => ({ ...s, h: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="obt-c">{t.fields.baseC}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="obt-c"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.baseC} (${unit})`}
                        value={obtuseInputs.c}
                        onChange={(e) => setObtuseInputs((s) => ({ ...s, c: e.target.value }))}
                      />
                      {obtuseInputs.c ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.baseC}`}
                          onClick={() => setObtuseInputs((s) => ({ ...s, c: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="obt-w">{t.fields.offsetW}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="obt-w"
                        type="number"
                        step="any"
                        min="0"
                        placeholder={`${t.fields.offsetW} (${unit})`}
                        value={obtuseInputs.w}
                        onChange={(e) => setObtuseInputs((s) => ({ ...s, w: e.target.value }))}
                      />
                      {obtuseInputs.w ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.offsetW}`}
                          onClick={() => setObtuseInputs((s) => ({ ...s, w: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>
                </>
              )}

              {/* MODE: Scalene Triangle (H, C, W) */}
              {mode === "scalene" && (
                <>
                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="scl-h">{t.fields.heightH}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="scl-h"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.heightH} (${unit})`}
                        value={scaleneInputs.h}
                        onChange={(e) => setScaleneInputs((s) => ({ ...s, h: e.target.value }))}
                      />
                      {scaleneInputs.h ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.heightH}`}
                          onClick={() => setScaleneInputs((s) => ({ ...s, h: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="scl-c">{t.fields.baseC}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="scl-c"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.baseC} (${unit})`}
                        value={scaleneInputs.c}
                        onChange={(e) => setScaleneInputs((s) => ({ ...s, c: e.target.value }))}
                      />
                      {scaleneInputs.c ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.baseC}`}
                          onClick={() => setScaleneInputs((s) => ({ ...s, c: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="scl-w">{t.fields.offsetW}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="scl-w"
                        type="number"
                        step="any"
                        min="0"
                        placeholder={`${t.fields.offsetW} (${unit})`}
                        value={scaleneInputs.w}
                        onChange={(e) => setScaleneInputs((s) => ({ ...s, w: e.target.value }))}
                      />
                      {scaleneInputs.w ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.offsetW}`}
                          onClick={() => setScaleneInputs((s) => ({ ...s, w: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>
                </>
              )}

              {/* MODE: General Triangle (Enter Any 3 Values) */}
              {mode === "any3" && (
                <>
                  <div className="field-card">
                    <div className="field-head">
                      <span>{t.methodLabel}</span>
                    </div>
                    <div className="chips-wrap" role="group" aria-label={t.methodLabel}>
                      {any3Methods.map(([methodKey, methodLabel]) => (
                        <button
                          key={methodKey}
                          type="button"
                          className={`chip${any3Method === methodKey ? " active" : ""}`}
                          onClick={() => setAny3Method(methodKey)}
                        >
                          {methodLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="any-a">{t.fields.sideSmallA}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="any-a"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.sideSmallA} (${unit})`}
                        value={any3Inputs.a}
                        onChange={(e) => setAny3Inputs((s) => ({ ...s, a: e.target.value }))}
                      />
                      {any3Inputs.a ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.sideSmallA}`}
                          onClick={() => setAny3Inputs((s) => ({ ...s, a: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  {any3Method === "sss" && (
                    <>
                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-b">{t.fields.sideSmallB}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-b"
                            type="number"
                            step="any"
                            min="0.1"
                            placeholder={`${t.fields.sideSmallB} (${unit})`}
                            value={any3Inputs.b}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, b: e.target.value }))}
                          />
                          {any3Inputs.b ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.sideSmallB}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, b: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">{unit}</span>
                        </div>
                      </div>

                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-c">{t.fields.sideSmallC}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-c"
                            type="number"
                            step="any"
                            min="0.1"
                            placeholder={`${t.fields.sideSmallC} (${unit})`}
                            value={any3Inputs.c}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, c: e.target.value }))}
                          />
                          {any3Inputs.c ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.sideSmallC}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, c: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">{unit}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {any3Method === "sas" && (
                    <>
                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-b">{t.fields.sideSmallB}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-b"
                            type="number"
                            step="any"
                            min="0.1"
                            placeholder={`${t.fields.sideSmallB} (${unit})`}
                            value={any3Inputs.b}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, b: e.target.value }))}
                          />
                          {any3Inputs.b ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.sideSmallB}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, b: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">{unit}</span>
                        </div>
                      </div>

                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-ang-c">{t.fields.angleC}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-ang-c"
                            type="number"
                            step="any"
                            min="0.1"
                            max="179.9"
                            placeholder={t.fields.angleC}
                            value={any3Inputs.angleC}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, angleC: e.target.value }))}
                          />
                          {any3Inputs.angleC ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.angleC}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, angleC: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">°</span>
                        </div>
                      </div>
                    </>
                  )}

                  {any3Method === "asa" && (
                    <>
                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-ang-b">{t.fields.angleB}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-ang-b"
                            type="number"
                            step="any"
                            min="0.1"
                            max="178.9"
                            placeholder={t.fields.angleB}
                            value={any3Inputs.angleB}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, angleB: e.target.value }))}
                          />
                          {any3Inputs.angleB ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.angleB}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, angleB: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">°</span>
                        </div>
                      </div>

                      <div className="field-card">
                        <div className="field-head">
                          <label htmlFor="any-ang-c">{t.fields.angleC}</label>
                        </div>
                        <div className="input-with-adornment">
                          <input
                            id="any-ang-c"
                            type="number"
                            step="any"
                            min="0.1"
                            max="178.9"
                            placeholder={t.fields.angleC}
                            value={any3Inputs.angleC}
                            onChange={(e) => setAny3Inputs((s) => ({ ...s, angleC: e.target.value }))}
                          />
                          {any3Inputs.angleC ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              aria-label={`${t.fields.clearField} ${t.fields.angleC}`}
                              onClick={() => setAny3Inputs((s) => ({ ...s, angleC: "" }))}
                            >
                              ✕
                            </button>
                          ) : null}
                          <span className="input-suffix">°</span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* MODE: Right Trapezoid (H, W, C) */}
              {mode === "trapezoid" && (
                <>
                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="trp-h">{t.fields.heightH}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="trp-h"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.heightH} (${unit})`}
                        value={trapInputs.h}
                        onChange={(e) => setTrapInputs((s) => ({ ...s, h: e.target.value }))}
                      />
                      {trapInputs.h ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.heightH}`}
                          onClick={() => setTrapInputs((s) => ({ ...s, h: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="trp-w">{t.fields.topBaseW}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="trp-w"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.topBaseW} (${unit})`}
                        value={trapInputs.w}
                        onChange={(e) => setTrapInputs((s) => ({ ...s, w: e.target.value }))}
                      />
                      {trapInputs.w ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.topBaseW}`}
                          onClick={() => setTrapInputs((s) => ({ ...s, w: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>

                  <div className="field-card">
                    <div className="field-head">
                      <label htmlFor="trp-c">{t.fields.botBaseC}</label>
                    </div>
                    <div className="input-with-adornment">
                      <input
                        id="trp-c"
                        type="number"
                        step="any"
                        min="0.1"
                        placeholder={`${t.fields.botBaseC} (${unit})`}
                        value={trapInputs.c}
                        onChange={(e) => setTrapInputs((s) => ({ ...s, c: e.target.value }))}
                      />
                      {trapInputs.c ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          aria-label={`${t.fields.clearField} ${t.fields.botBaseC}`}
                          onClick={() => setTrapInputs((s) => ({ ...s, c: "" }))}
                        >
                          ✕
                        </button>
                      ) : null}
                      <span className="input-suffix">{unit}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Status Warning if Invalid (for Right and Isosceles) */}
              {mode === "right" && !rightSolved?.valid && rightSolved?.error && (
                <div className="field-card">
                  <p className="field-bounds-warning">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{translateError(rightSolved.error, seo.locale)}</span>
                  </p>
                </div>
              )}

              {mode === "isosceles" && !isoSolved?.valid && isoSolved?.error && (
                <div className="field-card">
                  <p className="field-bounds-warning">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{translateError(isoSolved.error, seo.locale)}</span>
                  </p>
                </div>
              )}

              {/* Universal Action Buttons: Calculate, Clear All, Reset Defaults */}
              <div className="field-card">
                <div className="chips-wrap">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleCalculate}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>{t.calculate}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={clearCurrentFields}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>{t.clearAll}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={resetCurrentDefaults}
                  >
                    {t.resetDefaults}
                  </button>
                </div>
              </div>
            </>
          }
          results={
            <>
              <ObtuseTriangleDiagram
                data={diagramData}
                locale={seo.locale}
                title={
                  mode === "obtuse"
                    ? t.diagramTitles.obtuse
                    : mode === "scalene"
                    ? t.diagramTitles.scalene
                    : mode === "isosceles"
                    ? t.diagramTitles.isosceles
                    : mode === "any3"
                    ? t.diagramTitles.any3
                    : mode === "right"
                    ? t.diagramTitles.right
                    : t.diagramTitles.trapezoid
                }
              />

              <ul className="kv-list">
                {rows.map((r) => (
                  <li key={r.key}>
                    <span className="kv-key">{r.key}</span>
                    <span className="kv-value">{r.value}</span>
                  </li>
                ))}
              </ul>
            </>
          }
        />

        {seo.locale === "us" && <UsTriangleArticle />}
        {seo.locale === "ja" && <JaTriangleArticle />}
        {seo.locale === "ko" && <KoTriangleArticle />}
        {seo.locale === "ru" && <RuTriangleArticle />}
        {seo.locale === "es" && <EsTriangleArticle />}
        {(seo.locale === "en" || !["us", "ja", "ko", "ru", "es"].includes(seo.locale)) && <InTriangleArticle />}

        <FaqAccordion locale={seo.locale} items={extractFaq(seo)} />
      </Layout>
    </>
  );
}
