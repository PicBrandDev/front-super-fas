import type { ShowEvent } from "./types";

/**
 * Regras de leitura de um evento (puras; valem no servidor e no cliente).
 */

/** Evento já aconteceu: `date` (AAAA-MM-DD) anterior a hoje. Sem `date`, é futuro. */
export function isPastEvent(event: Pick<ShowEvent, "date">, now = new Date()): boolean {
  if (!event.date) return false;
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return event.date < today;
}

/** A API ainda não manda o nome do evento: usa "Artista em Cidade". */
export function eventName(artistName: string, event: Pick<ShowEvent, "city">): string {
  return `${artistName} em ${event.city}`;
}

export const statusLabel: Record<ShowEvent["status"], string> = {
  on_sale: "Ingressos à venda",
  last_batches: "Últimos lotes",
  soon: "Em breve",
};

/** Classe da tag de status: vermelha nos últimos lotes, apagada quando ainda não abriu. */
export const statusTagClass: Record<ShowEvent["status"], string> = {
  on_sale: "tag",
  last_batches: "tag tag-hot",
  soon: "tag tag-demo",
};
