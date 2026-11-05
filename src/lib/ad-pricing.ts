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
const DEFAULT_VIEW_MILLI = 12; // R$ 0,012 por view (vitrine sem preço definido)
const DEFAULT_CLICK_MILLI = 800; // R$ 0,80 por clique

const milliText = (n: number) => {
  const t = (n / 1000).toFixed(3).replace(".", ",");
  return `R$ ${t.endsWith("0") ? t.slice(0, -1) : t}`;
};

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

export function adPrice(p: { viewMilli?: number | null; clickMilli?: number | null; radiusKm: number; views: number; clicks: number }) {
  // Preço da vitrine por view e por clique, em milésimos de real (12 = R$ 0,012); sem preço, o padrão.
  const viewMilli = p.viewMilli ?? DEFAULT_VIEW_MILLI;
  const clickMilli = p.clickMilli ?? DEFAULT_CLICK_MILLI;
  const factor = radiusFactor(p.radiusKm);
  const viewsCents = Math.round((p.views * viewMilli) / 10);
  const clicksCents = Math.round((p.clicks * clickMilli) / 10);
  const lines: PriceLine[] = [
    { label: "Visualizações", detail: `${p.views.toLocaleString("pt-BR")} · ${milliText(viewMilli)} por view`, cents: viewsCents },
    { label: "Cliques", detail: `${p.clicks.toLocaleString("pt-BR")} · ${milliText(clickMilli)} por clique`, cents: clicksCents },
    {
      label: "Alcance do raio",
      detail: p.radiusKm > 0 ? `${p.radiusKm} km · ×${factor.toFixed(2).replace(".", ",")}` : `país todo · ×${factor.toFixed(2).replace(".", ",")}`,
      cents: Math.round((viewsCents + clicksCents) * (factor - 1)),
    },
  ];
  return { lines, total: lines.reduce((a, l) => a + l.cents, 0) };
}
