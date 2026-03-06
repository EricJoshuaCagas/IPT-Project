import React from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
};

export function DateInput({ label, value, onChange, min, max, disabled }: Props) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-secondary/60 bg-light/80 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition"
      />
    </label>
  );
}

export default DateInput;
