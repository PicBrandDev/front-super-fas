import type { ReactNode } from "react";
import { Rings, StripeBand } from "./decor";

/**
 * Cabeçalho escuro padrão das telas do fã clube:
 * rótulo pequeno + título display + ação à direita + conteúdo extra (abas, filtros).
 */
export function PageHeader({
  eyebrow,
  title,
  action,
  children,
  rings = true,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
  children?: ReactNode;
  rings?: boolean;
}) {
  return (
    <>
      <header className="relative overflow-hidden bg-ink px-4 pb-4 pt-[18px] text-paper lg:px-8 lg:pt-8">
        {rings && <Rings className="-right-10 -top-16 size-[180px]" start={30} step={14} />}
        <div className="relative flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">{eyebrow}</span>
            <h1 className="m-0 font-display text-[34px] font-normal leading-none text-cream lg:text-5xl">{title}</h1>
          </div>
          {action}
        </div>
        {children && <div className="relative mt-3.5">{children}</div>}
      </header>
      <StripeBand className="h-2.5" />
    </>
  );
}
