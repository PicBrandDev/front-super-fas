"use server";

import { revalidatePath } from "next/cache";
import { fetchJson, send, type ApiResult } from "@/lib/api";
import type { MyCoupon, MyTicket, Post, Prize, Quote, Reward, SpinCredit, Viewer } from "@/lib/types";

/*
 * Ações do fã. Sem API (modo exemplo) elas devolvem status 0 e as telas simulam o resultado.
 */

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const idOk = (s: string) => /^[A-Za-z0-9_-]+$/.test(s);
const bad = <T,>(): ApiResult<T> => ({ ok: false, error: "Pedido inválido.", status: 400 });

export async function fanPost(
  slug: string,
  club: string,
  kind: "galera" | "instagram",
  text: string,
  url = "",
): Promise<ApiResult> {
  if (!slugOk(slug) || !slugOk(club)) return bad();
  const res = await send("POST", `/artists/${slug}/clubs/${club}/posts`, { kind, text, url });
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export type SpinResult = { prize: Prize; reward?: Reward | null; spinsLeft: number; luckPoints: number; credits: SpinCredit[] };

/** Gira a roleta; com `creditId`, gasta aquele giro específico (senão o mais antigo). */
export async function spinPickap(slug: string, club: string, creditId?: string): Promise<ApiResult<SpinResult>> {
  if (!slugOk(slug) || !slugOk(club) || (creditId && !idOk(creditId))) return bad();
  return send<SpinResult>("POST", `/artists/${slug}/clubs/${club}/pickap/spin`, creditId ? { creditId } : undefined);
}

const cartOk = (slug: string, eventId: string, packageId: string, item: number, addons: string[], coupon: string) =>
  slugOk(slug) && idOk(eventId) && idOk(packageId) && Number.isInteger(item) && item >= 0 && addons.every((a) => /^[a-z]{2,12}$/.test(a)) && /^[A-Za-z0-9_-]{0,30}$/.test(coupon);

/** Valor do carrinho (ingresso + experiências) e do cupom, calculado pela API, sem comprar. */
export async function quoteTicket(
  slug: string,
  eventId: string,
  packageId: string,
  item: number,
  addons: string[],
  coupon: string,
): Promise<ApiResult<Quote>> {
  if (!cartOk(slug, eventId, packageId, item, addons, coupon)) return bad();
  return send<Quote>("POST", `/artists/${slug}/events/${eventId}/quote`, { packageId, item, addons, coupon });
}

/** Cupons pessoais do fã que ainda valem (lista vazia sem API ou sem login). */
export async function myCoupons(slug: string): Promise<MyCoupon[]> {
  if (!slugOk(slug)) return [];
  const res = await fetchJson<MyCoupon[]>(`/artists/${slug}/me/coupons`);
  return res.ok ? res.data : [];
}

/** Compra de ingresso (simulada): registra o ingresso em Meus ingressos e dá 1 giro da roleta, com o motivo. */
export async function buyTicket(
  slug: string,
  eventId: string,
  packageId: string,
  item: number,
  addons: string[] = [],
  coupon = "",
): Promise<ApiResult<MyTicket>> {
  if (!cartOk(slug, eventId, packageId, item, addons, coupon)) return bad();
  const res = await send<MyTicket>("POST", `/artists/${slug}/events/${eventId}/purchases`, { packageId, item, addons, coupon });
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

/** Entrar ou sair de um fã clube do cantor. */
export async function setClubMembership(slug: string, club: string, join: boolean): Promise<ApiResult> {
  if (!slugOk(slug) || !slugOk(club)) return bad();
  const res = await send("POST", `/artists/${slug}/clubs/${club}/${join ? "join" : "leave"}`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function subscribeMembership(slug: string, method: "pix" | "card"): Promise<ApiResult<Viewer>> {
  if (!slugOk(slug)) return bad();
  const res = await send<Viewer>("POST", `/artists/${slug}/membership/subscribe`, { method });
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function joinEventLuck(slug: string, eventId: string): Promise<ApiResult> {
  if (!slugOk(slug) || !idOk(eventId)) return bad();
  return send("POST", `/artists/${slug}/events/${eventId}/luck/join`);
}

// ---------- Photo Finder ----------

export type FinderStatus = { enabled: boolean; photos: number; eligible: boolean; reason: string | null };
export type FinderResult = { matches: { id: string; src: string }[]; searched: number };

/** O fã pode buscar neste show agora? (depois do show, com ingresso que inclui o Photo Finder). */
export async function getFinderStatus(slug: string, eventId: string): Promise<ApiResult<FinderStatus>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad();
  return fetchJson<FinderStatus>(`/artists/${slug}/events/${eventId}/photo-finder`);
}

/** Procura o rosto da selfie nas fotos do show (AWS Rekognition). A selfie não é guardada. */
export async function searchMyPhotos(slug: string, eventId: string, form: FormData): Promise<ApiResult<FinderResult>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad();
  return send<FinderResult>("POST", `/artists/${slug}/events/${eventId}/photo-finder/search`, form);
}

/** Post só com texto ou texto com foto no mural de um fã clube (JPG, PNG ou WebP, até 5 MB). */
export async function fanPostMedia(slug: string, club: string, form: FormData): Promise<ApiResult<Post>> {
  if (!slugOk(slug) || !slugOk(club)) return bad();
  const res = await send<Post>("POST", `/artists/${slug}/clubs/${club}/posts/media`, form);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

/** Troca a foto de perfil de quem está logado (aparece no ranking e nos posts). */
export async function uploadMyAvatar(form: FormData): Promise<ApiResult> {
  const res = await send("POST", "/auth/avatar", form);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

// ---------- Ranking Fã Super ----------

export type ShareClaim = { spinGranted: boolean; already: boolean };

/** "Já postei": rende 1 giro da roleta na hora (o app ainda é de exemplo); o ranking pontua quando o Instagram confirmar. */
export async function claimInstagramShare(slug: string, shareId: string): Promise<ApiResult<ShareClaim>> {
  if (!slugOk(slug) || !idOk(shareId)) return bad();
  const res = await send<ShareClaim>("POST", `/artists/${slug}/shares/${shareId}/claim`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export type ShareInfo = { shareId: string; hashtag: string; code: string; caption: string };

/** O fã vai compartilhar um post oficial ou um Drop no Instagram: registra a intenção e devolve a legenda pronta. */
export async function startInstagramShare(slug: string, id: string, kind: "post" | "track" = "post"): Promise<ApiResult<ShareInfo>> {
  if (!slugOk(slug) || !idOk(id)) return bad();
  const res = await send<ShareInfo>("POST", `/artists/${slug}/${kind === "track" ? "tracks" : "posts"}/${id}/share`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- Loja ----------

export type StoreCartItem = { productId: string; qty: number; size: string };
export type StoreDelivery = "pickup" | "ship";
export type StoreLine = { productId: string; name: string; category: string; qty: number; size: string; unitCents: number; totalCents: number };
export type StoreQuote = { lines: StoreLine[]; subtotalCents: number; shippingCents: number; totalCents: number; freeShippingFromCents: number };
export type CheckoutResult = { items: number; spinsGranted: number; orderCode: string; totalCents: number; delivery: StoreDelivery };
export type StoreOrder = {
  id: string;
  code: string;
  delivery: StoreDelivery;
  address: string;
  lines: StoreLine[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
};

const storeOk = (slug: string, items: StoreCartItem[]) =>
  slugOk(slug) && items.length > 0 && items.every((i) => idOk(i.productId) && Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= 10 && /^[A-Za-z]{0,4}$/.test(i.size));

/** Valores do carrinho da loja (itens, frete e total), calculados pela API, sem comprar. */
export async function quoteStore(slug: string, items: StoreCartItem[], delivery: StoreDelivery, address: string): Promise<ApiResult<StoreQuote>> {
  if (!storeOk(slug, items)) return bad();
  return send<StoreQuote>("POST", `/artists/${slug}/store/quote`, { items, delivery, address });
}

/** Compra do carrinho (pagamento simulado): grava o pedido com código para retirar e dá 1 giro da roleta por camiseta. */
export async function checkoutStore(slug: string, items: StoreCartItem[], delivery: StoreDelivery, address: string): Promise<ApiResult<CheckoutResult>> {
  if (!storeOk(slug, items)) return bad();
  const res = await send<CheckoutResult>("POST", `/artists/${slug}/store/checkout`, { items, delivery, address });
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

/** Pedidos da loja do fã (lista vazia sem API ou sem login). */
export async function myOrders(slug: string): Promise<StoreOrder[]> {
  if (!slugOk(slug)) return [];
  const res = await fetchJson<StoreOrder[]>(`/artists/${slug}/me/orders`);
  return res.ok ? res.data : [];
}
