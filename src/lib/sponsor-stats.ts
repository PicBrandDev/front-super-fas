import type { Campaign } from "@/lib/types";

/** Cidades de onde vem o público (de exemplo) e o peso de cada uma. */
const CITIES: [string, number][] = [
  ["São Paulo, SP", 31],
  ["Rio de Janeiro, RJ", 17],
  ["Belo Horizonte, MG", 12],
  ["Curitiba, PR", 10],
  ["Brasília, DF", 9],
  ["Porto Alegre, RS", 7],
  ["Salvador, BA", 6],
  ["Outras cidades", 8],
];

export type CampaignStats = { views: number; clicks: number; ctr: number; cities: { label: string; value: number }[] };

const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);

/**
 * Números de exemplo de uma campanha (visualizações, cliques e cidades do público), estáveis para o mesmo anúncio.
 * Só campanhas no ar ou aprovadas têm números; a medição real entra quando houver rastreio dos anúncios.
 */
export function campaignStats(c: Pick<Campaign, "id" | "status">): CampaignStats {
  if (c.status !== "live" && c.status !== "approved") return { views: 0, clicks: 0, ctr: 0, cities: [] };
  const h = hash(c.id);
  const views = 18000 + (h % 22000);
  const ctr = 2.1 + ((h >> 4) % 18) / 10; // 2,1% a 3,8%
  const clicks = Math.round((views * ctr) / 100);
  const cities = CITIES.map(([label, w], i) => ({ label, value: Math.round((views * (w + ((h >> i) % 3))) / 100) }));
  return { views, clicks, ctr, cities };
}

/** Soma os números de várias campanhas (o público é somado cidade a cidade). */
export function sumStats(list: CampaignStats[]): CampaignStats {
  const views = list.reduce((a, s) => a + s.views, 0);
  const clicks = list.reduce((a, s) => a + s.clicks, 0);
  const byCity = new Map<string, number>();
  for (const s of list) for (const c of s.cities) byCity.set(c.label, (byCity.get(c.label) ?? 0) + c.value);
  const cities = [...byCity].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  return { views, clicks, ctr: views ? (clicks / views) * 100 : 0, cities };
}
