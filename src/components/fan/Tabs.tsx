"use client";

import type { ReactNode } from "react";

export type TabItem<T extends string> = { id: T; label: string };

/**
 * Abas da seção: texto caixa alta, barra âmbar embaixo da ativa, fio 1px.
 * `slot` fica à direita (contador, tag, sacola).
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  slot,
  className = "",
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  slot?: ReactNode;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={`tabs ${className}`}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === value}
          onClick={() => onChange(t.id)}
          className="tab"
        >
          {t.label}
        </button>
      ))}
      {slot && <span className="slot">{slot}</span>}
    </div>
  );
}
