import type { ReactNode } from "react";
import { Icon } from "@/components/icons";

/**
 * Estados reutilizáveis da área do fã: lista vazia, aviso e erro.
 * Só tokens do tema, então servem para qualquer artista.
 */

/** Lista vazia: uma frase em mono, como no protótipo ("Nada por aqui ainda."). */
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
    <div className={`flex flex-col gap-3 py-8 ${className}`}>
      <p className="mono m-0">{title}</p>
      {text && <p className="m-0 max-w-[32ch] text-[15px] leading-[22px] text-fg-muted">{text}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export type NoticeTone = "info" | "ok" | "error";

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
  if (tone === "ok") {
    return (
      <p role="status" className={`ok m-0 ${className}`}>
        <Icon name="check" size={16} className="icon" />
        {children}
      </p>
    );
  }
  if (tone === "error") {
    return (
      <p role="alert" className={`err m-0 ${className}`}>
        {children}
      </p>
    );
  }
  return (
    <p role="status" className={`m-0 border-y border-line py-3 text-[15px] leading-[22px] text-fg-muted ${className}`}>
      {children}
    </p>
  );
}
