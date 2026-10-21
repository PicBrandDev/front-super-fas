import type { CSSProperties } from "react";

/**
 * A marca: três chevrons empilhados em linha fina, vértice para baixo.
 * Nunca preencher, girar, engrossar acima de 48px nem aplicar efeito.
 * É o único ornamento do sistema.
 */
export const MARK_POINTS = [
  "162,300 700,468 1008,342 829,654 705,752 394,620",
  "162,383 700,551 1008,425 829,737 705,835 394,703",
  "162,466 700,634 1008,508 829,820 705,918 394,786",
];

export const MARK_VIEWBOX = "146 288 880 640";

/** Espessura do traço em unidades do viewBox para a marca ter `size` px de largura. */
export function markStroke(size: number) {
  const px = Math.max(1.5, size * 0.01);
  return +((px * 880) / size).toFixed(1);
}

export function Mark({
  size = 24,
  color,
  className = "",
  style,
  label,
}: {
  /** Largura em px (define a espessura do traço). */
  size?: number;
  /** Cor do traço; padrão currentColor. */
  color?: string;
  className?: string;
  style?: CSSProperties;
  /** Quando informado, a marca é anunciada por leitores de tela. */
  label?: string;
}) {
  return (
    <svg
      width={size}
      viewBox={MARK_VIEWBOX}
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={markStroke(size)}
      strokeLinejoin="miter"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      focusable="false"
      className={className}
      style={style}
    >
      {MARK_POINTS.map((p) => (
        <polygon key={p} points={p} />
      ))}
    </svg>
  );
}
