"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "@/components/icons";

/**
 * Folha de baixo (dialog): escurece a tela, sobe da borda inferior.
 * Fecha com Esc, clique fora ou qualquer botão com `data-close`.
 * Título em serifa âmbar; opções com `SheetOption`.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const sheet = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const first = sheet.current?.querySelector<HTMLElement>("[data-autofocus], button");
    first?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      (lastFocus.current as HTMLElement | null)?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="scrim"
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t === e.currentTarget || t.closest("[data-close]")) onClose();
      }}
    >
      <div ref={sheet} className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <h2 id="sheet-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}

/** Linha de opção dentro da folha (abre fora da fanzone, escolhe um item...). */
export function SheetOption({
  title,
  sub,
  href,
  onClick,
  external = true,
}: {
  title: string;
  sub?: string;
  href?: string;
  onClick?: () => void;
  external?: boolean;
}) {
  const inner = (
    <>
      <span>
        <strong>{title}</strong>
        {sub && <span className="mono">{sub}</span>}
      </span>
      {external && <Icon name="external" size={20} />}
    </>
  );
  if (href) {
    return (
      <a className="opt" href={href} target="_blank" rel="noopener noreferrer" data-close onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button className="opt" type="button" data-close onClick={onClick}>
      {inner}
    </button>
  );
}
