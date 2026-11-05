import type { AdElement, AdSlot, Campaign } from "@/lib/types";

/*
 * Textos compartilhados pelo admin da plataforma de mídia e pelo portal do patrocinador.
 * Sem "use client" de propósito: servem em componentes de servidor e de cliente.
 */

/**
 * Preço da vitrine: por view e por clique (R$ 0,012 por view · R$ 0,80 por clique), não mais por semana.
 * Com a API o texto vem pronto ("Sem preço" quando o admin ainda não definiu); no modo exemplo, o do mock.
 */
export const slotPrice = (slot: Pick<AdSlot, "priceLabel">, _exampleMode?: boolean) => slot.priceLabel || "Sem preço";

/** Milésimos de real → "R$ 0,012" (view) ou "R$ 0,80" (clique). */
export const milliBrl = (n: number) => {
  const t = (n / 1000).toFixed(3).replace(".", ",");
  return `R$ ${t.endsWith("0") ? t.slice(0, -1) : t}`;
};

/** O preço de uma vitrine, por view e por clique ("Preço a definir" se o admin ainda não pôs). */
export const priceByUse = (view?: number | null, click?: number | null) =>
  [view ? `${milliBrl(view)} por view` : "", click ? `${milliBrl(click)} por clique` : ""].filter(Boolean).join(" · ") || "Preço a definir";

/** Milésimos de real → texto de campo ("12" → "0,012"; "800" → "0,80"). */
export const milliToField = (n: number | null | undefined) => {
  if (n == null) return "";
  const t = (n / 1000).toFixed(3).replace(".", ",");
  return t.endsWith("0") ? t.slice(0, -1) : t;
};

/** Texto de campo em reais ("0,012", "R$ 0,80") → milésimos de real; null se não for um valor. */
export const fieldToMilli = (v: string): number | null => {
  const n = Number(v.trim().replace(/[R$\s]/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 1000) : null;
};

/** O que a vitrine pode aceitar do anúncio. */
export const ELEMENTS: { id: AdElement; label: string }[] = [
  { id: "title", label: "Título" },
  { id: "text", label: "Texto" },
  { id: "image", label: "Foto" },
  { id: "video", label: "Vídeo" },
];

/** As categorias das vitrines, na ordem em que aparecem. */
export const CATEGORIES: { id: string; label: string; hint: string }[] = [
  { id: "entrada", label: "Entrada e Início", hint: "O primeiro que o fã vê ao abrir o app" },
  { id: "feed", label: "Feeds", hint: "Anúncios entre os posts do Mural, dos fã clubes e das notícias" },
  { id: "roleta", label: "Roleta", hint: "As camadas da roleta e os vídeos antes de girar e ao pegar o brinde" },
  { id: "loja", label: "Loja", hint: "O topo da loja e a tela depois da compra" },
  { id: "clubes", label: "Fã clubes", hint: "Vitrines de cada fã clube" },
];

/**
 * Situação de uma vitrine ocupada. A API ainda não informa até quando;
 * no modo exemplo fica o placeholder "[data]" do mock.
 */
export const occupiedLabel = (exampleMode: boolean, by?: string | null) =>
  by ? `Ocupada por ${by}` : exampleMode ? "Ocupada até [data]" : "Ocupada";

/** "Onde" de uma campanha: o fã clube ou o ambiente do cantor, e o cantor. */
export const campaignWhere = (c: Pick<Campaign, "club" | "fanClub">) => ({
  place: c.fanClub ? c.fanClub : "Ambiente do cantor",
  artist: c.club ?? null,
});

/** Chave da vitrine: "oficial.pickup_video" ou "pickup_video" → "pickup_video". */
export const slotKey = (slotId: string | null | undefined) => (slotId ?? "").split(".").pop() ?? "";

/** Vitrines que exigem vídeo: o que o fã assiste antes de girar a roleta. (Ao pegar o brinde vale uma arte ou um vídeo.) */
export const VIDEO_SLOTS = new Set(["pickup_video"]);
