"use server";

import { revalidatePath } from "next/cache";
import { send, type ApiResult } from "@/lib/api";
import type { EventPhoto } from "@/lib/types";

/*
 * Ações dos painéis (admin do fã clube, admin master e patrocinador).
 * Todas passam pela API com o token do cookie; a API confere as permissões.
 * Depois de gravar, o cliente chama router.refresh() para buscar os dados novos.
 */

type Res<T = unknown> = ApiResult<T>;

const RESOURCES = new Set(["events", "vendors", "gifts", "tickets", "agencies", "packages", "posts", "products", "tracks", "perks"]);
const CLUB_RESOURCES = new Set(["prizes", "posts"]);
const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const idOk = (s: string) => /^[A-Za-z0-9_-]+$/.test(s);
const bad = (error: string): Res<never> => ({ ok: false, error, status: 400 });

// ---------- conteúdo do fã clube ----------

/** Caminho do CRUD: do ambiente (/manage) ou de um fã clube (/clubs/{club}/manage). */
function managePath(slug: string, resource: string, club?: string): string | null {
  if (!slugOk(slug)) return null;
  if (club) return slugOk(club) && CLUB_RESOURCES.has(resource) ? `/artists/${slug}/clubs/${club}/manage/${resource}` : null;
  return RESOURCES.has(resource) ? `/artists/${slug}/manage/${resource}` : null;
}

export async function saveContent(
  slug: string,
  resource: string,
  id: string | null,
  data: Record<string, unknown>,
  club?: string,
): Promise<Res> {
  const path = managePath(slug, resource, club);
  if (!path || (id && !idOk(id))) return bad("Pedido inválido.");
  const res = id ? await send("PATCH", `${path}/${id}`, data) : await send("POST", path, data);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function deleteContent(slug: string, resource: string, id: string, club?: string): Promise<Res> {
  const path = managePath(slug, resource, club);
  if (!path || !idOk(id)) return bad("Pedido inválido.");
  const res = await send("DELETE", `${path}/${id}`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- membros e equipe ----------

export async function memberAction(slug: string, memberId: string, action: "charge" | "cancel"): Promise<Res> {
  if (!slugOk(slug) || !idOk(memberId)) return bad("Pedido inválido.");
  return send("POST", `/artists/${slug}/members/${memberId}/${action}`);
}

export type InviteResult = { email: string; tempPassword: string | null; emailSent?: boolean };

// ---------- fã clubes do ambiente ----------

export type ClubCreated = { club: { slug: string; name: string }; invite: InviteResult | null };

export async function createClub(
  slug: string,
  data: { name: string; city?: string; description?: string; ownerEmail?: string; ownerName?: string },
): Promise<Res<ClubCreated>> {
  if (!slugOk(slug)) return bad("Pedido inválido.");
  const body = { ...data, ownerEmail: data.ownerEmail || null };
  const res = await send<ClubCreated>("POST", `/artists/${slug}/clubs`, body);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function updateClub(
  slug: string,
  club: string,
  data: { name?: string; city?: string; description?: string; status?: "active" | "setup" },
): Promise<Res> {
  if (!slugOk(slug) || !slugOk(club)) return bad("Pedido inválido.");
  const res = await send("PATCH", `/artists/${slug}/clubs/${club}`, data);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function deleteClub(slug: string, club: string): Promise<Res> {
  if (!slugOk(slug) || !slugOk(club)) return bad("Pedido inválido.");
  const res = await send("DELETE", `/artists/${slug}/clubs/${club}`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function inviteStaff(
  slug: string,
  club: string,
  data: { email: string; name?: string; role: "owner" | "helper"; roleLabel?: string },
): Promise<Res<InviteResult>> {
  if (!slugOk(slug) || !slugOk(club)) return bad("Pedido inválido.");
  return send<InviteResult>("POST", `/artists/${slug}/clubs/${club}/staff`, data);
}

export async function removeStaff(slug: string, club: string, staffId: string): Promise<Res> {
  if (!slugOk(slug) || !slugOk(club) || !idOk(staffId)) return bad("Pedido inválido.");
  return send("DELETE", `/artists/${slug}/clubs/${club}/staff/${staffId}`);
}

export async function removeClubMember(slug: string, club: string, userId: string): Promise<Res> {
  if (!slugOk(slug) || !slugOk(club) || !idOk(userId)) return bad("Pedido inválido.");
  return send("DELETE", `/artists/${slug}/clubs/${club}/members/${userId}`);
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
  // key da vitrine: "home" (ambiente) ou "fa-clube-sp.home" (fã clube)
  if (!slugOk(slug) || !/^[a-z0-9.-]+$/.test(key)) return bad("Pedido inválido.");
  return send("PATCH", `/artists/${slug}/ad-slots/${key}`, data);
}

export async function decideCampaign(id: string, decision: "approve" | "reject"): Promise<Res> {
  if (!idOk(id)) return bad("Pedido inválido.");
  // Aprova quem administra a vitrine (ambiente ou fã clube); a API confere.
  return send("POST", `/campaigns/${id}/${decision}`);
}

export type SponsorInvited = { sponsor: { id: string; email: string }; tempPassword: string | null };

export async function inviteSponsor(data: { email: string; brand?: string }): Promise<Res<SponsorInvited>> {
  return send<SponsorInvited>("POST", "/admin/sponsors/invite", data);
}

/** Troca a foto de perfil de um fã clube (JPG, PNG ou WebP, até 5 MB). */
export async function setClubAvatar(slug: string, club: string, form: FormData): Promise<Res> {
  if (!slugOk(slug) || !slugOk(club)) return bad("Pedido inválido.");
  const res = await send("POST", `/artists/${slug}/clubs/${club}/avatar`, form);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- Photo Finder: fotos do show ----------

export async function uploadEventPhotos(slug: string, eventId: string, form: FormData): Promise<Res<EventPhoto[]>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad("Pedido inválido.");
  const res = await send<EventPhoto[]>("POST", `/artists/${slug}/manage/events/${eventId}/photos`, form);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function indexEventPhotos(slug: string, eventId: string): Promise<Res<EventPhoto[]>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad("Pedido inválido.");
  const res = await send<EventPhoto[]>("POST", `/artists/${slug}/manage/events/${eventId}/photos/index`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

export async function deleteEventPhoto(slug: string, eventId: string, photoId: string): Promise<Res> {
  if (!slugOk(slug) || !idOk(eventId) || !idOk(photoId)) return bad("Pedido inválido.");
  const res = await send("DELETE", `/artists/${slug}/manage/events/${eventId}/photos/${photoId}`);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- Drop News ----------

/** Publica um Drop News (legenda + foto opcional) como oficial do artista. */
export async function publishDrop(slug: string, form: FormData): Promise<Res> {
  if (!slugOk(slug)) return bad("Pedido inválido.");
  const res = await send("POST", `/artists/${slug}/manage/drops`, form);
  if (res.ok) revalidatePath(`/${slug}`, "layout");
  return res;
}

// ---------- patrocinador ----------

export async function createCampaign(form: FormData): Promise<Res> {
  return send("POST", "/sponsor/campaigns", form);
}

// ---------- Ranking Fã Super: conferir o Instagram ----------

export type InstagramSync = { enabled: boolean; found: number; verified: number; error: string | null };

export async function syncInstagram(slug: string): Promise<Res<InstagramSync>> {
  if (!slugOk(slug)) return bad("Pedido inválido.");
  return send<InstagramSync>("POST", `/artists/${slug}/manage/instagram/sync`);
}
