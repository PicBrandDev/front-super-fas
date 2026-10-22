"use server";

import { revalidatePath } from "next/cache";
import { fetchJson, send, type ApiResult } from "@/lib/api";
import type { MyTicket, Prize, SpinCredit, Viewer } from "@/lib/types";

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

export type SpinResult = { prize: Prize; spinsLeft: number; luckPoints: number; credits: SpinCredit[] };

/** Gira a roleta; com `creditId`, gasta aquele giro específico (senão o mais antigo). */
export async function spinPickap(slug: string, club: string, creditId?: string): Promise<ApiResult<SpinResult>> {
  if (!slugOk(slug) || !slugOk(club) || (creditId && !idOk(creditId))) return bad();
  return send<SpinResult>("POST", `/artists/${slug}/clubs/${club}/pickap/spin`, creditId ? { creditId } : undefined);
}

/** Compra de ingresso (simulada): registra o ingresso em Meus ingressos e dá 1 giro da roleta, com o motivo. */
export async function buyTicket(slug: string, eventId: string, packageId: string, item: number): Promise<ApiResult<MyTicket>> {
  if (!slugOk(slug) || !idOk(eventId) || !idOk(packageId) || !Number.isInteger(item) || item < 0) return bad();
  const res = await send<MyTicket>("POST", `/artists/${slug}/events/${eventId}/purchases`, { packageId, item });
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
