import type { AdSlot, Campaign } from "@/lib/types";

/*
 * Textos compartilhados pelo admin da plataforma de mídia e pelo portal do patrocinador.
 * Sem "use client" de propósito: servem em componentes de servidor e de cliente.
 */

/**
 * Preço da vitrine. Com a API, sem preço cadastrado mostra "Sem preço";
 * no modo exemplo o rótulo vem do mock ("R$ [PREÇO] / semana").
 */
export const slotPrice = (slot: Pick<AdSlot, "priceCents" | "priceLabel">, exampleMode: boolean) =>
  slot.priceCents != null || exampleMode ? slot.priceLabel : "Sem preço";

/**
 * Situação de uma vitrine ocupada. A API ainda não informa até quando;
 * no modo exemplo fica o placeholder "[data]" do mock.
 */
export const occupiedLabel = (exampleMode: boolean) => (exampleMode ? "Ocupada até [data]" : "Ocupada");

/** "Onde" de uma campanha: o fã clube ou o ambiente do cantor, e o cantor. */
export const campaignWhere = (c: Pick<Campaign, "club" | "fanClub">) => ({
  place: c.fanClub ? c.fanClub : "Ambiente do cantor",
  artist: c.club ?? null,
});

/** Chave da vitrine: "oficial.pickup_video" ou "pickup_video" → "pickup_video". */
export const slotKey = (slotId: string | null | undefined) => (slotId ?? "").split(".").pop() ?? "";

/** Vitrines que exigem vídeo (o fã assiste antes de girar a roleta). */
export const VIDEO_SLOTS = new Set(["pickup_video"]);
