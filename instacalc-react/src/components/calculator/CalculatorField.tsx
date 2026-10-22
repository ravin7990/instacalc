import { useId } from "react";

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

  // Ignore intermediate/garbage values instead of writing NaN into state.
  const commit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange(Math.min(spec.max, Math.max(spec.min, n)));
  };

  return (
    <div className="field-card">
      <div className="field-head">
        <label htmlFor={id}>{spec.label}</label>
        <span className="field-preview-badge" aria-hidden="true">
          {formatWithUnit(spec.value, spec.prefix, spec.suffix)}
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
          onChange={(e) => commit(e.target.value)}
          aria-label={`${spec.label} slider`}
        />
        <div className="input-with-adornment">
          {spec.prefix ? (
            <span className="input-prefix" aria-hidden="true">
              {spec.prefix}
            </span>
          ) : null}
          <input
            type="number"
            id={id}
            inputMode="decimal"
            min={spec.min}
            max={spec.max}
            step={spec.step}
            value={spec.value}
            onChange={(e) => commit(e.target.value)}
            className={spec.prefix ? "has-prefix" : undefined}
          />
          {spec.suffix ? <span className="input-suffix">{spec.suffix}</span> : null}
        </div>
      </div>

      {spec.chips?.length ? (
        <div className="chips-wrap">
          {spec.chips.map((c) => (
            <button
              key={c.value}
              type="button"
              className={`chip${spec.value === c.value ? " active" : ""}`}
              onClick={() => onChange(c.value)}
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
  const formatted = Math.abs(n) >= 1000 ? n.toLocaleString("en-US") : String(n);
  return `${prefix ?? ""}${formatted}${suffix ?? ""}`;
}
