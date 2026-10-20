"use server";

import { revalidatePath } from "next/cache";
import { send, type ApiResult } from "@/lib/api";

/*
 * Ações dos painéis (admin do fã clube, admin master e patrocinador).
 * Todas passam pela API com o token do cookie; a API confere as permissões.
 * Depois de gravar, o cliente chama router.refresh() para buscar os dados novos.
 */

type Res<T = unknown> = ApiResult<T>;

const RESOURCES = new Set(["events", "vendors", "gifts", "posts", "prizes", "products", "tracks", "perks"]);
const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const idOk = (s: string) => /^[A-Za-z0-9_-]+$/.test(s);
const bad = (error: string): Res<never> => ({ ok: false, error, status: 400 });

// ---------- conteúdo do fã clube ----------

export async function saveContent(
  slug: string,
  resource: string,
  id: string | null,
  data: Record<string, unknown>,
): Promise<Res> {
  if (!slugOk(slug) || !RESOURCES.has(resource) || (id && !idOk(id))) return bad("Pedido inválido.");
  const path = `/artists/${slug}/manage/${resource}`;
  const res = id ? await send("PATCH", `${path}/${id}`, data) : await send("POST", path, data);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function deleteContent(slug: string, resource: string, id: string): Promise<Res> {
  if (!slugOk(slug) || !RESOURCES.has(resource) || !idOk(id)) return bad("Pedido inválido.");
  const res = await send("DELETE", `/artists/${slug}/manage/${resource}/${id}`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- membros e equipe ----------

export async function memberAction(slug: string, memberId: string, action: "charge" | "cancel"): Promise<Res> {
  if (!slugOk(slug) || !idOk(memberId)) return bad("Pedido inválido.");
  return send("POST", `/artists/${slug}/members/${memberId}/${action}`);
}

export type InviteResult = { email: string; tempPassword: string | null };

export async function inviteClubAdmin(
  slug: string,
  data: { email: string; name?: string; role?: string },
): Promise<Res<InviteResult>> {
  if (!slugOk(slug)) return bad("Pedido inválido.");
  return send<InviteResult>("POST", `/artists/${slug}/admins`, data);
}

export async function removeClubAdmin(slug: string, adminId: string): Promise<Res> {
  if (!slugOk(slug) || !idOk(adminId)) return bad("Pedido inválido.");
  return send("DELETE", `/artists/${slug}/admins/${adminId}`);
}

// ---------- admin master ----------

export type FanClubCreated = { artist: { id: string; slug: string; name: string }; invites: InviteResult[] };

export async function createFanClub(data: {
  name: string;
  instagram: string;
  template: "blank" | "vc";
  invites: string[];
}): Promise<Res<FanClubCreated>> {
  const res = await send<FanClubCreated>("POST", "/admin/fan-clubs", data);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

export async function updateFanClub(slug: string, data: Record<string, unknown>): Promise<Res> {
  if (!slugOk(slug)) return bad("Pedido inválido.");
  const res = await send("PATCH", `/admin/fan-clubs/${slug}`, data);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

export async function updateAdSlot(slug: string, key: string, data: { active?: boolean; priceCents?: number }): Promise<Res> {
  if (!slugOk(slug) || !idOk(key)) return bad("Pedido inválido.");
  return send("PATCH", `/artists/${slug}/ad-slots/${key}`, data);
}

export async function decideCampaign(id: string, decision: "approve" | "reject"): Promise<Res> {
  if (!idOk(id)) return bad("Pedido inválido.");
  return send("POST", `/admin/campaigns/${id}/${decision}`);
}

export type SponsorInvited = { sponsor: { id: string; email: string }; tempPassword: string | null };

export async function inviteSponsor(data: { email: string; brand?: string }): Promise<Res<SponsorInvited>> {
  return send<SponsorInvited>("POST", "/admin/sponsors/invite", data);
}

// ---------- patrocinador ----------

export async function createCampaign(form: FormData): Promise<Res> {
  return send("POST", "/sponsor/campaigns", form);
}
