/** Cidades para o raio de localização do anúncio. */
export const TARGET_CITIES = [
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Curitiba, PR",
  "Brasília, DF",
  "Porto Alegre, RS",
  "Salvador, BA",
  "Recife, PE",
  "Fortaleza, CE",
  "Goiânia, GO",
] as const;

export const MAX_RADIUS_KM = 500;
export const CPM_CENTS = 1200; // R$ 12,00 a cada mil visualizações
export const CPC_CENTS = 80; // R$ 0,80 por clique
const DEFAULT_WEEK_CENTS = 60000; // vitrine sem preço definido

/** Quanto o raio encarece a vitrine: 0 = o país todo (mais caro), senão sobe devagar com os km. */
export function radiusFactor(radiusKm: number): number {
  if (radiusKm <= 0) return 2.2;
  const r = Math.min(radiusKm, MAX_RADIUS_KM);
  return 0.8 + (0.9 * Math.log(1 + r / 25)) / Math.log(1 + MAX_RADIUS_KM / 25);
}

/** Semanas cobradas pelo período (mínimo 1). */
export function weeksBetween(start: string, end: string): number {
  if (!start || !end) return 2;
  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86400000) + 1;
  return Number.isFinite(days) && days > 0 ? Math.max(1, Math.ceil(days / 7)) : 1;
}

/** Visualizações e cliques que o raio costuma entregar no período (ponto de partida para as metas). */
export function suggestGoals(radiusKm: number, weeks: number) {
  const views = Math.round((weeks * 8000 * Math.pow(radiusFactor(radiusKm), 1.5)) / 500) * 500;
  return { views, clicks: Math.round((views * 0.03) / 10) * 10 };
}

export type PriceLine = { label: string; detail: string; cents: number };

export function adPrice(p: { weeklyCents?: number | null; weeks: number; radiusKm: number; views: number; clicks: number }) {
  const weekly = p.weeklyCents ?? DEFAULT_WEEK_CENTS;
  const base = weekly * p.weeks;
  const factor = radiusFactor(p.radiusKm);
  const lines: PriceLine[] = [
    { label: "Vitrine", detail: `${p.weeks} ${p.weeks === 1 ? "semana" : "semanas"}`, cents: base },
    {
      label: "Alcance do raio",
      detail: p.radiusKm > 0 ? `${p.radiusKm} km · ×${factor.toFixed(2).replace(".", ",")}` : `país todo · ×${factor.toFixed(2).replace(".", ",")}`,
      cents: Math.round(base * (factor - 1)),
    },
    { label: "Visualizações", detail: `${p.views.toLocaleString("pt-BR")} · R$ 12,00 por mil`, cents: Math.round((p.views / 1000) * CPM_CENTS) },
    { label: "Cliques", detail: `${p.clicks.toLocaleString("pt-BR")} · R$ 0,80 por clique`, cents: p.clicks * CPC_CENTS },
  ];
  return { lines, total: lines.reduce((a, l) => a + l.cents, 0) };
}
