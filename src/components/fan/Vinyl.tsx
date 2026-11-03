"use client";

import type { BrandKey } from "@/lib/brands";
import { useBrand } from "./ArtistContext";
import { STAR_D } from "./mark-shape";

/**
 * Vinil plano, decorativo. Vintage: disco ink, sulcos line-strong, selo sun.
 * Departamento: 7" cobalt chapado, sulcos em fio, rótulo branco com a estrela azul.
 */
export function Vinyl({ className = "", brand }: { className?: string; brand?: BrandKey }) {
  const { key } = useBrand(brand);
  if (key === "departamento") {
    const grooves: number[] = [];
    for (let r = 94; r > 36; r -= 8) grooves.push(r);
    return (
      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true" focusable="false" className={className}>
        <circle cx="100" cy="100" r="99" fill="var(--fc-lagoon-deep)" />
        {grooves.map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--fc-paper)" strokeOpacity=".28" strokeWidth="1" />
        ))}
        <circle cx="100" cy="100" r="30" fill="var(--fc-paper)" />
        <g transform="translate(84 92) scale(.32)" fill="var(--fc-lagoon-deep)">
          <path d={STAR_D} />
        </g>
        <circle cx="100" cy="100" r="3.5" fill="var(--fc-lagoon-deep)" />
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
