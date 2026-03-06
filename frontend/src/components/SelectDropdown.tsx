import React from "react";

export type Option = { value: string | number; label: string };

type Props = {
  label: string;
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  name?: string;
};

export function SelectDropdown({ label, value, onChange, options, placeholder = "Select", disabled, name }: Props) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        name={name}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-secondary/60 bg-light/80 px-3 py-2 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default SelectDropdown;
