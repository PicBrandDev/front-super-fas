"use server";

import { revalidatePath } from "next/cache";
import { fetchJson, send, type ApiResult } from "@/lib/api";
import type { DisputeReason, Identity, MyListing, Order, SellerReview } from "@/lib/resale";

/*
 * Ações da revenda de ingressos. Sem API (modo exemplo) devolvem status 0 e a tela avisa que é exemplo.
 * Depois de qualquer ação, a tela usa o pedido devolvido pela API (já com as flags novas).
 */

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const idOk = (s: string) => /^[A-Za-z0-9_-]{1,64}$/.test(s);
const bad = <T,>(): ApiResult<T> => ({ ok: false, error: "Pedido inválido.", status: 400 });
const rs = (slug: string) => `/artists/${slug}/resale`;

const refresh = (slug: string) => revalidatePath(`/${slug}/revenda`, "layout");

/** Lê o pedido de novo (polling leve da tela do pedido; prazos vencidos são aplicados pela API ao ler). */
export async function readOrder(slug: string, id: string): Promise<ApiResult<Order>> {
  if (!slugOk(slug) || !idOk(id)) return bad();
  return fetchJson<Order>(`${rs(slug)}/orders/${id}`);
}

/** Reserva `qty` ingressos do anúncio por 15 min. `key` é a chave de idempotência da tentativa (reusada se repetir). */
export async function reserveListing(slug: string, listingId: string, qty: number, key: string, transferTo = ""): Promise<ApiResult<Order>> {
  if (!slugOk(slug) || !idOk(listingId) || !Number.isInteger(qty) || qty < 1 || qty > 10 || !/^[A-Za-z0-9-]{8,80}$/.test(key)) return bad();
  // transferTo: e-mail da conta do comprador na ticketeira (vazio = o do cadastro).
  const res = await send<Order>("POST", `${rs(slug)}/listings/${listingId}/orders`, { qty, transferTo: transferTo.trim().slice(0, 160) }, { "Idempotency-Key": key });
  if (res.ok) refresh(slug);
  return res;
}

type OrderAction = "pay" | "cancel" | "transferred" | "confirm";

/** Pagar (simulado), cancelar a reserva, "já transferi" e "recebi": todas seguras de repetir. */
export async function orderAction(slug: string, id: string, action: OrderAction): Promise<ApiResult<Order>> {
  if (!slugOk(slug) || !idOk(id) || !["pay", "cancel", "transferred", "confirm"].includes(action)) return bad();
  const res = await send<Order>("POST", `${rs(slug)}/orders/${id}/${action}`);
  if (res.ok) refresh(slug);
  return res;
}

export async function openDispute(slug: string, id: string, reasonCode: DisputeReason, description: string): Promise<ApiResult<Order>> {
  if (!slugOk(slug) || !idOk(id) || !["not_received", "invalid_ticket", "wrong_type", "other"].includes(reasonCode)) return bad();
  const res = await send<Order>("POST", `${rs(slug)}/orders/${id}/dispute`, { reasonCode, description: description.slice(0, 1000) });
  if (res.ok) refresh(slug);
  return res;
}

export async function replyDispute(slug: string, id: string, text: string): Promise<ApiResult<unknown>> {
  if (!slugOk(slug) || !idOk(id) || !text.trim()) return bad();
  const res = await send("POST", `${rs(slug)}/orders/${id}/dispute/reply`, { text: text.trim().slice(0, 1000) });
  if (res.ok) refresh(slug);
  return res;
}

export async function reviewSeller(slug: string, id: string, rating: number, comment: string): Promise<ApiResult<SellerReview>> {
  if (!slugOk(slug) || !idOk(id) || !Number.isInteger(rating) || rating < 1 || rating > 5) return bad();
  const res = await send<SellerReview>("POST", `${rs(slug)}/orders/${id}/review`, { rating, comment: comment.trim().slice(0, 500) });
  if (res.ok) refresh(slug);
  return res;
}

/** Cria o anúncio (multipart): ticketId, qty, unitPriceCents, um `codes` por ingresso e a prova. */
export async function createListing(slug: string, eventId: string, form: FormData): Promise<ApiResult<MyListing>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad();
  const res = await send<MyListing>("POST", `${rs(slug)}/events/${eventId}/listings`, form);
  if (res.ok) refresh(slug);
  return res;
}

export async function cancelListing(slug: string, id: string): Promise<ApiResult<MyListing>> {
  if (!slugOk(slug) || !idOk(id)) return bad();
  const res = await send<MyListing>("POST", `${rs(slug)}/listings/${id}/cancel`);
  if (res.ok) refresh(slug);
  return res;
}

/** Reenvia um anúncio rejeitado: novos códigos (um por ingresso) e nova prova. */
export async function resubmitListing(slug: string, id: string, form: FormData): Promise<ApiResult<MyListing>> {
  if (!slugOk(slug) || !idOk(id)) return bad();
  const res = await send<MyListing>("POST", `${rs(slug)}/listings/${id}/resubmit`, form);
  if (res.ok) refresh(slug);
  return res;
}

/** Endereço (a revenda exige endereço completo para comprar e vender). */
export async function saveAddress(
  slug: string,
  a: { zipCode: string; street: string; number: string; complement: string; neighborhood: string; city: string; state: string },
): Promise<ApiResult<unknown>> {
  if (!slugOk(slug)) return bad();
  const res = await send("PUT", "/auth/address", {
    zipCode: a.zipCode.trim(),
    street: a.street.trim(),
    number: a.number.trim(),
    complement: a.complement.trim(),
    neighborhood: a.neighborhood.trim(),
    city: a.city.trim(),
    state: a.state.trim().toUpperCase(),
  });
  if (res.ok) refresh(slug);
  return res;
}

/** CPF e telefone (necessários para vender). A API nunca devolve os dois completos. */
export async function saveIdentity(slug: string, cpf: string, phone: string): Promise<ApiResult<Identity>> {
  if (!slugOk(slug)) return bad();
  const res = await send<Identity>("PUT", "/me/identity", { cpf: cpf.replace(/\D/g, ""), phone: phone.replace(/\D/g, "") });
  if (res.ok) refresh(slug);
  return res;
}
