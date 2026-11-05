"use client";

import type { BrandKey } from "@/lib/brands";
import { useBrand } from "./ArtistContext";
import { DEPARTAMENTO_STAR, markBox } from "./mark-shape";

/**
 * Vinil plano, decorativo. Vintage: disco ink, sulcos line-strong, selo sun.
 * Peles com `vinyl` (brands.ts): 7" chapado com sulcos em fio e a marca do cantor no rótulo
 * (Departamento: cobalt com rótulo branco e estrela azul; Anitta: azul-noite com rótulo vermelho e estrela ouro).
 */
export function Vinyl({ className = "", brand }: { className?: string; brand?: BrandKey }) {
  const { vinyl, mark } = useBrand(brand);
  if (vinyl) {
    const grooves: number[] = [];
    for (let r = 94; r > 36; r -= 8) grooves.push(r);
    // A marca no rótulo: 21.76 de altura (a medida da estrela do Departamento), centrada na largura.
    const shape = mark === "chevrons" ? DEPARTAMENTO_STAR : mark;
    const b = markBox(shape.viewBox);
    const h = 21.76;
    const w = h * b.ratio;
    return (
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" className={className}>
        <circle cx="100" cy="100" r="99" fill={vinyl.disc} />
        {grooves.map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke={vinyl.groove} strokeOpacity={vinyl.grooveOpacity} strokeWidth="1" />
        ))}
        <circle cx="100" cy="100" r="30" fill={vinyl.label} />
        <svg x={+(100 - w / 2).toFixed(2)} y={91.04} width={+w.toFixed(2)} height={h} viewBox={shape.viewBox} fill={vinyl.labelInk}>
          <path d={shape.d} fillRule={shape.fillRule} />
        </svg>
        <circle cx="100" cy="100" r="3.5" fill={vinyl.disc} />
      </svg>
    );
  }
  const grooves: number[] = [];
  for (let r = 96; r > 40; r -= 7) grooves.push(r);
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" className={className}>
      <circle cx="100" cy="100" r="99" fill="var(--fc-ink)" />
      {grooves.map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--fc-line-strong)" strokeWidth=".6" opacity=".55" />
      ))}
      <circle cx="100" cy="100" r="34" fill="var(--fc-sun)" />
      <circle cx="100" cy="100" r="27" fill="none" stroke="var(--fc-ink)" strokeWidth=".8" />
      <circle cx="100" cy="100" r="3.5" fill="var(--fc-ink)" />
    </svg>
  );
}
