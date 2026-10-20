"use server";

import { revalidatePath } from "next/cache";
import { send, type ApiResult } from "@/lib/api";
import type { Prize, Viewer } from "@/lib/types";

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

export type SpinResult = { prize: Prize; spinsLeft: number; luckPoints: number };

export async function spinPickap(slug: string, club: string): Promise<ApiResult<SpinResult>> {
  if (!slugOk(slug) || !slugOk(club)) return bad();
  return send<SpinResult>("POST", `/artists/${slug}/clubs/${club}/pickap/spin`);
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
