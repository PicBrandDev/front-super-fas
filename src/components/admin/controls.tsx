"use client";

import { Icon } from "@/components/icons";

/** Interruptor liga/desliga acessível. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-none cursor-pointer rounded-full transition-colors ${checked ? "bg-adm-blue" : "bg-adm-input"}`}
    >
      <span
        className={`absolute top-[3px] size-[22px] rounded-full bg-white transition-[left] ${checked ? "left-[23px]" : "left-[3px]"}`}
      />
    </button>
  );
}

/** Grupo de filtros em pílula. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={on}
            className={`min-h-11 cursor-pointer rounded-full border px-3.5 text-[13px] font-medium ${
              on ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-[1_1_280px] items-center gap-2 rounded-lg border border-adm-line bg-white px-3">
      <Icon name="search" size={16} strokeWidth={2.2} className="text-adm-muted" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[42px] min-w-0 flex-1 border-0 bg-transparent text-sm text-adm-ink outline-none"
      />
    </div>
  );
}
