import { useEffect, useId, useRef, useState } from "react";
import { trackCalculatorInput, trackCalculatorSlider, trackCalculatorChip } from "@/lib/analytics";
import { readSingleUrlParam, syncSingleUrlParam } from "@/lib/urlState";

/**
 * Config-driven input primitives.
 *
 * Every calculator is described declaratively (see `FieldSpec`) so the same
 * markup serves all locales — labels come from props, not from hardcoded HTML.
 */

export interface FieldSpec {
  key: string;
  label: string;
  /** Number input value. */
  value: number;
  min: number;
  max: number;
  step: number;
  /** Optional slider bounds; defaults to the number input bounds. */
  slider?: { min: number; max: number; step: number };
  /** Quick-pick buttons under the field. */
  chips?: Array<{ label: string; value: number }>;
  prefix?: string;
  suffix?: string;
  /** Rendered only when advanced mode is on. */
  advanced?: boolean;
  hint?: string;
}

export function Field({
  spec,
  onChange,
}: {
  spec: FieldSpec;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const sliderId = `${id}-range`;
  const slider = spec.slider ?? { min: spec.min, max: spec.max, step: spec.step };
  const initialDefaultRef = useRef(spec.value);
  const isFirstRender = useRef(true);

  // Local text buffer decoupled from keystroke clamping so users can backspace and type freely
  const [inputText, setInputText] = useState(String(spec.value));
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // On client mount, hydrate from URL parameter if present
  useEffect(() => {
    const fromUrl = readSingleUrlParam(spec.key, spec.min, spec.max);
    if (fromUrl !== null && fromUrl !== spec.value) {
      onChange(fromUrl);
      setInputText(String(fromUrl));
    }
  }, [spec.key, spec.min, spec.max]);

  // Sync external changes (chips, URL, history load, reset) to local text buffer when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setInputText(String(spec.value));
    }
  }, [spec.value, isFocused]);

  // Sync field value to URL query state only after user modifications
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    syncSingleUrlParam(spec.key, spec.value, initialDefaultRef.current);
  }, [spec.key, spec.value]);

  // Listen for History Load events to restore saved input values directly into state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleLoadHistory = (e: Event) => {
      const customEvent = e as CustomEvent<{ inputs?: Array<{ key: string; rawValue: string }> }>;
      const match = customEvent.detail?.inputs?.find((item) => item.key === spec.key);
      if (match !== undefined) {
        const num = Number(match.rawValue);
        if (Number.isFinite(num)) {
          const clamped = Math.min(spec.max, Math.max(spec.min, num));
          onChange(clamped);
          setInputText(String(clamped));
        }
      }
    };
    window.addEventListener("instacalc:load-history", handleLoadHistory);
    return () => window.removeEventListener("instacalc:load-history", handleLoadHistory);
  }, [spec.key, spec.min, spec.max, onChange]);

  // Real-time typing handler: allows user to type freely without mid-typing clamping
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (raw.trim() === "" || raw === "-") return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;

    // If within bounds, debounce update slightly (120ms) so typing digits does not thrash graphs/tables
    if (n >= spec.min && n <= spec.max) {
      debounceTimerRef.current = setTimeout(() => {
        onChange(n);
        const calcId = typeof window !== "undefined" ? window.location.pathname : "calc";
        trackCalculatorInput(calcId, spec.label, n, spec.suffix);
      }, 120);
    }
  };

  // Blur handler: strictly enforces bounds on blur, clamping out-of-range values and resetting empty fields
  const handleInputBlur = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setIsFocused(false);
    const raw = inputText.trim();
    const n = Number(raw);

    let finalVal = spec.value;
    if (raw === "" || !Number.isFinite(n)) {
      finalVal = spec.value || spec.min;
    } else if (n < spec.min) {
      finalVal = spec.min;
    } else if (n > spec.max) {
      finalVal = spec.max;
    } else {
      finalVal = n;
    }

    setInputText(String(finalVal));
    onChange(finalVal);

    const calcId = typeof window !== "undefined" ? window.location.pathname : "calc";
    trackCalculatorInput(calcId, spec.label, finalVal, spec.suffix);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Escape") {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(slider.max, Math.max(slider.min, n));
    setInputText(String(clamped));
    onChange(clamped);

    const calcId = typeof window !== "undefined" ? window.location.pathname : "calc";
    trackCalculatorSlider(calcId, spec.label, clamped);
  };

  // Check if current typed input is out-of-bounds while focused
  const currentNum = Number(inputText.trim());
  const isTooLow = isFocused && inputText.trim() !== "" && Number.isFinite(currentNum) && currentNum < spec.min;
  const isTooHigh = isFocused && inputText.trim() !== "" && Number.isFinite(currentNum) && currentNum > spec.max;
  const hasBoundsWarning = isTooLow || isTooHigh;

  const displayBadge = formatWithUnit(spec.value, spec.prefix, spec.suffix);
  const minFormatted = formatWithUnit(spec.min, spec.prefix, spec.suffix);
  const maxFormatted = formatWithUnit(spec.max, spec.prefix, spec.suffix);
  const boundsLabels = getBoundsLabels();

  return (
    <div
      className="field-card"
      data-field-key={spec.key}
      data-field-label={spec.label}
      data-field-display={displayBadge}
      data-field-raw={String(spec.value)}
    >
      <div className="field-head">
        <label htmlFor={id}>{spec.label}</label>
        <span className="field-preview-badge" aria-hidden="true">
          {displayBadge}
        </span>
      </div>

      <div className="range-row">
        <input
          type="range"
          id={sliderId}
          min={slider.min}
          max={slider.max}
          step={slider.step}
          value={Math.min(slider.max, Math.max(slider.min, spec.value))}
          onChange={handleSliderChange}
          aria-label={`${spec.label} slider`}
        />
        <div className={`input-with-adornment${hasBoundsWarning ? " has-warning" : ""}`}>
          {spec.prefix ? (
            <span className="input-prefix" aria-hidden="true">
              {spec.prefix}
            </span>
          ) : null}
          <input
            type="number"
            id={id}
            data-field={spec.key}
            inputMode="decimal"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={inputText}
            onFocus={handleFocus}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className={`${spec.prefix ? "has-prefix" : ""}${hasBoundsWarning ? " input-out-of-bounds" : ""}`.trim() || undefined}
            aria-invalid={hasBoundsWarning ? "true" : undefined}
          />
          {spec.suffix ? <span className="input-suffix">{spec.suffix}</span> : null}
        </div>
      </div>

      <div className="field-bounds-warning-slot" aria-live="polite">
        <div
          className={`field-bounds-warning${hasBoundsWarning ? " is-visible" : ""}`}
          role={hasBoundsWarning ? "alert" : undefined}
        >
          {hasBoundsWarning ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{isTooLow ? `${boundsLabels.min}: ${minFormatted}` : `${boundsLabels.max}: ${maxFormatted}`}</span>
            </>
          ) : null}
        </div>
      </div>

      {spec.chips?.length ? (
        <div className="chips-wrap">
          {spec.chips.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`chip${spec.value === c.value ? " active" : ""}`}
              onClick={() => {
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current);
                  debounceTimerRef.current = null;
                }
                setInputText(String(c.value));
                onChange(c.value);
                const calcId = typeof window !== "undefined" ? window.location.pathname : "calc";
                trackCalculatorChip(calcId, spec.label, c.label, c.value);
              }}
              aria-pressed={spec.value === c.value}
            >
              {c.label}
            </button>
          ))}
        </div>
      ) : null}

      {spec.hint ? <p className="field-hint">{spec.hint}</p> : null}
    </div>
  );
}

function getBoundsLabels(): { min: string; max: string } {
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang?.toLowerCase() || "";
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    if (lang.startsWith("es") || path.startsWith("/es/")) {
      return { min: "Mínimo", max: "Máximo" };
    }
    if (lang.startsWith("ja") || path.startsWith("/ja/")) {
      return { min: "最小", max: "最大" };
    }
    if (lang.startsWith("ru") || path.startsWith("/ru/")) {
      return { min: "Минимум", max: "Максимум" };
    }
    if (lang.startsWith("ko") || path.startsWith("/ko/")) {
      return { min: "최소", max: "최대" };
    }
  }
  return { min: "Minimum", max: "Maximum" };
}

function formatWithUnit(value: number, prefix?: string, suffix?: string): string {
  const n = Number.isFinite(value) ? value : 0;
  const formatted = Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}
