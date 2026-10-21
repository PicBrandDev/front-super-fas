import type { ReactNode } from "react";

/**
 * Estados reutilizáveis da área do fã: lista vazia, aviso e erro.
 * Só tokens do tema (paper, ink, accent...), então servem para qualquer artista.
 */

/** Caixa tracejada para listas vazias ("Nenhum show por enquanto"). */
export function EmptyState({
  title,
  text,
  action,
  className = "",
}: {
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-2 rounded-[14px] border-2 border-dashed border-ink-soft px-4 py-6 text-center ${className}`}
    >
      <strong className="font-body text-base font-extrabold text-ink">{title}</strong>
      {text && <p className="m-0 max-w-[320px] text-sm leading-snug text-ink-soft">{text}</p>}
      {action && <div className="mt-1.5">{action}</div>}
    </div>
  );
}

export type NoticeTone = "info" | "ok" | "error";

const noticeTone: Record<NoticeTone, string> = {
  info: "bg-cream text-ink",
  ok: "bg-accent-2 text-ink",
  error: "bg-accent text-accent-fg",
};

/** Aviso curto dentro da página (erro da API, confirmação, dica). */
export function Notice({
  tone = "info",
  children,
  className = "",
}: {
  tone?: NoticeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`m-0 rounded-xl border-2 border-ink px-3.5 py-2.5 text-sm font-semibold leading-snug ${noticeTone[tone]} ${className}`}
    >
      {children}
    </p>
  );
}
