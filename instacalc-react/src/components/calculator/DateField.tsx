import { useId } from "react";

/**
 * Native date/time input.
 *
 * Uses <input type="date"> so mobile browsers get their own picker — a custom
 * calendar widget would be far more code and much worse for accessibility.
 */
export function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  /** ISO date string, YYYY-MM-DD. */
  value: string;
  onChange: (iso: string) => void;
  min?: string;
  max?: string;
}) {
  const id = useId();
  return (
    <div className="field-card">
      <div className="field-head">
        <label htmlFor={id}>{label}</label>
      </div>
      <input
        type="date"
        id={id}
        className="date-input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

/** Quick-pick buttons for common relative dates ("Today", "-25 years"). */
export function DatePresets({
  presets,
  onPick,
}: {
  presets: Array<{ label: string; iso: string }>;
  onPick: (iso: string) => void;
}) {
  return (
    <div className="chips-wrap" role="group">
      {presets.map((p) => (
        <button key={p.label} type="button" className="chip" onClick={() => onPick(p.iso)}>
          {p.label}
        </button>
      ))}
    </div>
  );
}
