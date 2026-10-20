import type { CSSProperties, ReactNode } from "react";

/** Faixa listrada retrô usada abaixo dos cabeçalhos. */
export function StripeBand({ className = "h-3" }: { className?: string }) {
  return <div aria-hidden="true" className={`stripes ${className}`} />;
}

/**
 * Anéis concêntricos "pôr do sol". `inner` é a cor do miolo (normalmente o
 * fundo onde os anéis estão) e `stops` define onde cada anel começa (%).
 */
export function Rings({
  className = "",
  style,
  inner = "var(--fc-ink)",
  start = 28,
  step = 13,
}: {
  className?: string;
  style?: CSSProperties;
  inner?: string;
  start?: number;
  step?: number;
}) {
  const s = (i: number) => `${start + step * i}%`;
  const background = `radial-gradient(circle at center, ${inner} 0 ${s(0)}, var(--fc-accent-2) ${s(0)} ${s(1)}, var(--fc-accent-3) ${s(1)} ${s(2)}, var(--fc-accent) ${s(2)} ${s(3)}, var(--fc-deep) ${s(3)} ${s(4)}, transparent ${s(4)})`;
  return <div aria-hidden="true" className={`pointer-events-none absolute rounded-full ${className}`} style={{ background, ...style }} />;
}

/** Espaço reservado para imagem (até existirem fotos reais). */
export function PhotoPlaceholder({
  label = "[Foto]",
  className = "h-40",
  tone = "deep",
  align = "end",
}: {
  label?: string;
  className?: string;
  tone?: "deep" | "accent" | "warm" | "paper";
  align?: "end" | "center";
}) {
  const tones = {
    deep: "bg-deep halftone-light",
    accent: "bg-accent halftone-light",
    warm: "bg-accent-3 halftone-dark",
    paper: "bg-paper-2 halftone-dark",
  } as const;
  return (
    <div
      role="img"
      aria-label={label}
      className={`flex p-2.5 ${align === "center" ? "items-center justify-center" : "items-end"} ${tones[tone]} ${className}`}
    >
      <span className="rounded-md bg-ink px-2 py-1 font-label text-[11px] font-bold text-cream">{label}</span>
    </div>
  );
}

/** Rótulo pequeno em caixa alta (fonte de etiqueta). */
export function Eyebrow({ children, className = "text-accent-2" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-label text-[11px] font-bold uppercase tracking-[0.12em] ${className}`}>{children}</span>
  );
}

/** Título de seção com link opcional à direita. */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="m-0 font-body text-[22px] font-extrabold">{children}</h2>
      {action}
    </div>
  );
}
