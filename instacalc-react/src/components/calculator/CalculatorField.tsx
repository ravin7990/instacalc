import { useEffect, useId, useRef, useState } from "react";
import { trackCalculatorInput, trackCalculatorSlider, trackCalculatorChip } from "@/lib/analytics";
import { useCurrency } from "@/app/CurrencyContext";
import { isCurrencySymbol, hasCurrencySymbol, replaceCurrencySymbol } from "@/lib/currency";

/**
 * Config-driven input primitives.
 *
 * Every calculator is described declaratively (see `FieldSpec`) so the same
 * markup serves all locales — labels come from props, not from hardcoded HTML.
 */

export interface FieldOption {
  label: string;
  value: number;
}

export interface FieldSpec {
  key: string;
  label: string;
  /** Number input value. */
  value: number;
  min: number;
  max: number;
  step: number;
  /** When type is "select" or options is provided, renders a clean dropdown select or segmented buttons */
  type?: "number" | "select" | "segmented";
  options?: FieldOption[];
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

  const { symbol: activeSym } = useCurrency();
  const isCur = Boolean(spec.prefix && isCurrencySymbol(spec.prefix));
  const effectivePrefix = isCur ? activeSym : (spec.prefix === "\u0000" ? activeSym : spec.prefix);

  const displayChips = spec.chips?.map((c) => {
    if (c.label === "\u0000") {
      return { ...c, label: `${activeSym}${c.value / 1000}K` };
    }
    if (c.label && (hasCurrencySymbol(c.label) || isCur)) {
      return { ...c, label: replaceCurrencySymbol(c.label, activeSym) };
    }
    return c;
  });

  // Local text buffer decoupled from keystroke clamping so users can backspace and type freely
  const [inputText, setInputText] = useState(String(spec.value));
  const [isFocused, setIsFocused] = useState(false);

  // Sync external changes (chips, URL, history load, reset) to local text buffer when not actively editing
  useEffect(() => {
    if (!isFocused) {
      setInputText(String(spec.value));
    }
  }, [spec.value, isFocused]);

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

  // Handle discrete option / select fields (e.g. Compounding Frequency)
  if (spec.type === "select" || (spec.options && !spec.slider)) {
    const selectedOption = spec.options?.find((o) => o.value === spec.value);
    const displayBadge = selectedOption ? selectedOption.label : String(spec.value);

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

        <div className="field-select-wrap">
          <select
            id={id}
            data-field={spec.key}
            value={spec.value}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange(val);
              const calcId = typeof window !== "undefined" ? window.location.pathname : "calc";
              trackCalculatorInput(calcId, spec.label, val);
            }}
            className="field-select"
          >
            {spec.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {spec.chips?.length ? (
          <div className="chips-wrap">
            {spec.chips.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`chip${spec.value === c.value ? " active" : ""}`}
                onClick={() => {
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

  // Real-time typing handler: allows user to type freely without mid-typing clamping
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);

    if (raw.trim() === "" || raw === "-") return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;

    // Immediately update in lockstep if within valid bounds, matching the Indian version
    if (n >= spec.min && n <= spec.max) {
      onChange(n);
    }
  };

  // Blur handler: strictly enforces bounds on blur, clamping out-of-range values and resetting empty fields
  const handleInputBlur = () => {
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

  const displayBadge = formatWithUnit(spec.value, effectivePrefix, spec.suffix);

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
          {effectivePrefix ? (
            <span className="input-prefix" aria-hidden="true">
              {effectivePrefix}
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
            className={`${effectivePrefix ? "has-prefix" : ""}${hasBoundsWarning ? " input-out-of-bounds" : ""}`.trim() || undefined}
            aria-invalid={hasBoundsWarning ? "true" : undefined}
          />
          {spec.suffix ? <span className="input-suffix">{spec.suffix}</span> : null}
        </div>
      </div>

      {displayChips?.length ? (
        <div className="chips-wrap">
          {displayChips.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`chip${spec.value === c.value ? " active" : ""}`}
              onClick={() => {
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

function formatWithUnit(value: number, prefix?: string, suffix?: string): string {
  const n = Number.isFinite(value) ? value : 0;
  let formatted = String(n);
  if (typeof document !== "undefined") {
    const lang = document.documentElement.lang?.toLowerCase() || "";
    const path = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
    const locale = (lang.startsWith("es") || path.startsWith("/es/"))
      ? "es-ES"
      : (lang.startsWith("ja") || path.startsWith("/ja/"))
      ? "ja-JP"
      : (lang.startsWith("ko") || path.startsWith("/ko/"))
      ? "ko-KR"
      : (lang.startsWith("ru") || path.startsWith("/ru/"))
      ? "ru-RU"
      : "en-US";
    formatted = Math.abs(n) >= 1000 ? n.toLocaleString(locale) : String(n);
  } else {
    formatted = Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
  }
  let suf = "";
  if (suffix) {
    suf = (suffix.startsWith("%") || suffix.startsWith("°") || suffix.startsWith(" ") || suffix.startsWith("/"))
      ? suffix
      : ` ${suffix}`;
  }
  return `${prefix ?? ""}${formatted}${suf}`;
}
