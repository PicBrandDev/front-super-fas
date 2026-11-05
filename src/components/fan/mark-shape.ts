/**
 * Desenhos das marcas (sem React, para servir também a componentes de servidor).
 *
 * Vintage Culture: três chevrons empilhados em linha fina, vértice para baixo.
 * Nunca preencher, girar, engrossar acima de 48px nem aplicar efeito.
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

/**
 * DEPARTAMENTO: estrela de 4 pontas assimétrica (braço direito longo e fino, superior
 * inclinado à direita, inferior à esquerda, miolo côncavo). Preenchida na cor da tinta
 * do campo; nunca girar, engrossar nem aplicar efeito.
 * TODO oficial: traço aproximado de foto (departamento-star.approx.svg, GAPS G-01).
 */
export const STAR_D =
  "M99.88 29.61C95.00 28.85 72.85 27.33 66.34 26.54C59.83 25.74 62.10 25.70 60.81 24.82C59.52 23.94 59.01 22.58 58.60 21.25C58.19 19.92 58.09 18.82 58.35 16.83C58.62 14.84 59.19 11.96 60.20 9.34C61.20 6.72 63.80 2.66 64.37 1.11C64.95 -0.45 65.99 -2.58 63.64 0.00C61.28 2.58 53.93 12.67 50.25 16.58C46.56 20.50 44.53 21.70 41.52 23.46C38.51 25.23 38.80 25.90 32.19 27.15C25.57 28.40 7.21 30.10 1.84 30.96C-3.52 31.82 -4.16 31.72 0.00 32.31C4.16 32.90 21.40 33.76 26.78 34.52C32.17 35.28 31.27 35.65 32.31 36.86C33.35 38.06 34.07 37.71 33.05 41.77C32.02 45.82 27.23 57.74 26.17 61.18C25.10 64.62 24.00 65.23 26.66 62.41C29.32 59.58 38.02 48.32 42.14 44.23C46.25 40.13 47.05 39.54 51.35 37.84C55.65 36.14 60.57 35.16 67.94 34.03C75.31 32.90 90.25 31.82 95.58 31.08C100.90 30.34 104.75 30.36 99.88 29.61Z";

export const STAR_VIEWBOX = "-5 -3 110 68";

/**
 * Monograma D do Departamento: listras horizontais em degraus com a estrela no canto superior
 * esquerdo. Uso: ícone/avatar do ambiente. TODO oficial: monogram-D-speedlines.approx.svg (GAPS G-01).
 */
export const MONO_D =
  "M3.65 85.16L55.09 86.04L62.14 85.03L69.06 82.26L24.40 81.64L23.40 83.27L13.71 83.27L13.08 84.28L4.03 84.40ZM6.29 76.73L76.60 77.86L80.63 74.21L26.92 73.33L26.04 75.09L16.23 74.97L15.72 75.97L6.54 76.10ZM62.01 69.18L64.65 69.43L84.91 69.56L86.67 67.17L87.04 66.04L66.54 65.79L64.53 67.55ZM49.81 65.66L48.93 65.28L29.81 64.91L28.93 66.54L18.99 66.54L18.36 67.55L9.31 67.55L8.93 68.43L48.55 69.18ZM69.69 60.88L69.81 61.13L89.56 61.51L90.31 60.38L91.19 57.86L71.32 57.48ZM52.58 57.36L52.20 56.98L32.33 56.60L31.45 58.24L21.64 58.11L20.88 59.25L12.20 59.12L11.57 59.87L51.32 60.75ZM73.08 52.58L73.33 52.83L92.70 53.21L93.21 52.45L93.84 49.56L73.96 49.06L73.58 49.43ZM55.09 48.81L34.97 48.18L34.09 49.94L24.28 49.69L23.52 50.82L14.47 50.69L14.09 51.45L53.84 52.45ZM71.19 40.63L72.70 42.26L73.46 44.03L73.96 44.40L94.59 44.78L94.84 44.40L94.97 41.38L94.59 41.01ZM57.86 40.38L37.61 39.75L36.86 41.38L26.92 41.26L26.29 42.26L17.36 42.14L16.73 43.02L56.73 44.03ZM19.37 34.21L19.75 34.84L93.96 36.23L92.96 33.21L91.70 32.45L40.25 31.45L39.37 33.08L29.43 32.83L28.81 33.96ZM21.89 26.04L87.92 27.67L84.40 25.66L79.37 24.15L43.02 23.02L42.14 24.65L32.20 24.40L31.57 25.41L22.26 25.28ZM34.84 18.11L22.52 16.23L21.64 15.09L21.51 13.46L23.40 8.43L18.62 13.84L15.22 15.97L3.27 17.86L4.15 18.36L12.08 18.74L13.46 19.75L13.46 21.89L11.32 27.55L16.60 21.76L19.25 20.13L22.77 19.25L34.47 18.49Z";

export const MONO_D_VIEWBOX = "0 0 100 88.68";

/** Marca desenhada como um caminho preenchido (as estrelas): o que a pele de um cantor guarda em `brands.ts > mark`. */
export type FilledMark = { d: string; viewBox: string; fillRule?: "evenodd" };

export const DEPARTAMENTO_STAR: FilledMark = { d: STAR_D, viewBox: STAR_VIEWBOX };

/**
 * ANITTA: estrela de 5 pontas de flancos levemente côncavos, como as estrelas do céu de anitta.com.br.
 * Preenchida na cor da tinta; é o ornamento-base (avatar oficial, ponteiro da roleta, capa de drop sem foto).
 * TODO oficial: desenho nosso (anitta-fanzone-refs/00-brand/logos/ornamento-estrela.svg); vetor e autorização vêm da Rodamoinho.
 */
export const ANITTA_STAR: FilledMark = {
  d: "M0 -48Q4.8 -27.25 11.17 -15.37Q24.43 -12.99 45.65 -14.83Q27.4 -3.85 18.07 5.87Q19.9 19.22 28.21 38.83Q12.13 24.87 0 19Q-12.13 24.87 -28.21 38.83Q-19.9 19.22 -18.07 5.87Q-27.4 -3.85 -45.65 -14.83Q-24.43 -12.99 -11.17 -15.37Q-4.8 -27.25 0 -48Z",
  viewBox: "-50 -50 100 100",
};

/**
 * ANITTA: sol radiante chapado (derivado da estampa da camiseta EQUILIBRIVM SUN), só no centro da Roda da Fortuna.
 * TODO oficial: desenho nosso (anitta-fanzone-refs/00-brand/logos/ornamento-sol.svg), sem rosto; não é logo oficial.
 */
export const ANITTA_SUN: FilledMark = {
  d: "M-15 0A15 15 0 1 0 15 0A15 15 0 1 0 -15 0ZM-1.63 -17.93L0 -48L1.63 -17.93ZM5.65 -17.09L12.63 -30.49L8.09 -16.08ZM11.52 -13.83L33.94 -33.94L13.83 -11.52ZM16.08 -8.09L30.49 -12.63L17.09 -5.65ZM17.93 -1.63L48 0L17.93 1.63ZM17.09 5.65L30.49 12.63L16.08 8.09ZM13.83 11.52L33.94 33.94L11.52 13.83ZM8.09 16.08L12.63 30.49L5.65 17.09ZM1.63 17.93L0 48L-1.63 17.93ZM-5.65 17.09L-12.63 30.49L-8.09 16.08ZM-11.52 13.83L-33.94 33.94L-13.83 11.52ZM-16.08 8.09L-30.49 12.63L-17.09 5.65ZM-17.93 1.63L-48 0L-17.93 -1.63ZM-17.09 -5.65L-30.49 -12.63L-16.08 -8.09ZM-13.83 -11.52L-33.94 -33.94L-11.52 -13.83ZM-8.09 -16.08L-12.63 -30.49L-5.65 -17.09ZM-17.6 0A17.6 17.6 0 1 0 17.6 0A17.6 17.6 0 1 0 -17.6 0ZM-16.6 0A16.6 16.6 0 1 1 16.6 0A16.6 16.6 0 1 1 -16.6 0Z",
  viewBox: "-50 -50 100 100",
};

/** Caixa (x, y, largura) do viewBox de uma marca, para encaixá-la num <svg> aninhado de altura conhecida. */
export function markBox(viewBox: string) {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  return { x, y, w, h, ratio: w / h };
}
