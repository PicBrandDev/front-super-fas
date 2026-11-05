"use client";

import type { CSSProperties } from "react";
import type { BrandKey } from "@/lib/brands";
import { useBrand } from "./ArtistContext";
import { MARK_POINTS, MARK_VIEWBOX, markStroke } from "./mark-shape";

/**
 * A marca do artista, o único ornamento do sistema: os três chevrons do Vintage Culture ou o desenho preenchido
 * da pele (`brands.ts > mark`: a estrela de 4 pontas do Departamento, a de 5 pontas da Anitta; ver mark-shape.ts).
 * Dentro da área do fã a marca sai do ambiente; fora dela, de `brand`.
 */
export function Mark({
  size = 24,
  color,
  className = "",
  style,
  label,
  brand,
}: {
  /** Largura em px (define a espessura do traço). */
  size?: number;
  /** Cor do traço; padrão currentColor. */
  color?: string;
  className?: string;
  style?: CSSProperties;
  /** Quando informado, a marca é anunciada por leitores de tela. */
  label?: string;
  /** Força a marca de um artista (fora do ArtistProvider). */
  brand?: BrandKey;
}) {
  const { mark } = useBrand(brand);
  const a11y = {
    "aria-hidden": label ? undefined : true,
    role: label ? "img" : undefined,
    "aria-label": label,
    focusable: "false" as const,
  };
  if (mark !== "chevrons") {
    return (
      <svg width={size} viewBox={mark.viewBox} fill={color ?? "currentColor"} className={className} style={style} {...a11y}>
        <path d={mark.d} fillRule={mark.fillRule} />
      </svg>
    );
  }
  return (
    <svg
      width={size}
      viewBox={MARK_VIEWBOX}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={markStroke(size)}
      strokeLinejoin="miter"
      className={className}
      style={style}
      {...a11y}
    >
      {MARK_POINTS.map((p) => (
        <polygon key={p} points={p} />
      ))}
    </svg>
  );
}
