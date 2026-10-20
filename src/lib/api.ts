/**
 * Camada de dados do front.
 *
 * Hoje, sem NEXT_PUBLIC_API_URL definido, tudo vem de ./mock.
 * Quando o back FastAPI estiver no ar, defina NEXT_PUBLIC_API_URL no .env
 * e estas funções passam a buscar na API, nos caminhos indicados em cada uma.
 * As páginas não precisam mudar.
 */
import * as mock from "./mock";
import type {
  AdSlot,
  Artist,
  Campaign,
  ClubAdmin,
  Gift,
  HomeAd,
  Member,
  MemberPerk,
  Post,
  PostKind,
  Prize,
  Product,
  ShowEvent,
  Sponsor,
  Track,
  Vendor,
  Viewer,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

async function get<T>(path: string, fallback: () => T): Promise<T> {
  if (!API_URL) return fallback();
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  return (await res.json()) as T;
}

// ---------- Ambientes de artista ----------

/** GET /artists */
export const listArtists = () => get<Artist[]>("/artists", () => mock.artists);

/** GET /artists/{slug} */
export async function getArtist(slug: string): Promise<Artist | null> {
  if (!API_URL) return mock.artists.find((a) => a.slug === slug) ?? null;
  const res = await fetch(`${API_URL}/artists/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /artists/${slug} falhou: ${res.status}`);
  return (await res.json()) as Artist;
}

/** GET /me (usuário logado) */
export const getViewer = () => get<Viewer>("/me", () => mock.viewer);

/** GET /me/fandoms */
export const getOtherFandoms = () => get<string[]>("/me/fandoms", () => mock.otherFandoms);

// ---------- Mural ----------

/** GET /artists/{slug}/posts?kind=drop|galera|instagram */
export const getPosts = (slug: string, kind?: PostKind) =>
  get<Post[]>(`/artists/${slug}/posts${kind ? `?kind=${kind}` : ""}`, () =>
    kind ? mock.posts.filter((p) => p.kind === kind) : mock.posts,
  );

// ---------- Agenda e eventos ----------

/** GET /artists/{slug}/events */
export const getEvents = (slug: string) => get<ShowEvent[]>(`/artists/${slug}/events`, () => mock.events);

/** GET /artists/{slug}/events/{id} */
export async function getEvent(slug: string, id: string): Promise<ShowEvent | null> {
  if (!API_URL) return mock.events.find((e) => e.id === id) ?? null;
  const res = await fetch(`${API_URL}/artists/${slug}/events/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET evento falhou: ${res.status}`);
  return (await res.json()) as ShowEvent;
}

/** GET /artists/{slug}/events/{id}/vendors */
export const getVendors = (slug: string, eventId: string) =>
  get<Vendor[]>(`/artists/${slug}/events/${eventId}/vendors`, () => mock.vendors);

/** GET /artists/{slug}/events/{id}/gifts */
export const getGifts = (slug: string, eventId: string) =>
  get<Gift[]>(`/artists/${slug}/events/${eventId}/gifts`, () => mock.gifts);

// ---------- PicKap, Loja, Drops Hits ----------

/** GET /artists/{slug}/pickap/prizes */
export const getPrizes = (slug: string) => get<Prize[]>(`/artists/${slug}/pickap/prizes`, () => mock.prizes);

/** GET /artists/{slug}/products */
export const getProducts = (slug: string) => get<Product[]>(`/artists/${slug}/products`, () => mock.products);

/** GET /artists/{slug}/tracks */
export const getTracks = (slug: string) => get<Track[]>(`/artists/${slug}/tracks`, () => mock.tracks);

// ---------- Mídia e membros ----------

/** GET /artists/{slug}/ads/home — anúncio ativo no card da Home */
export const getHomeAd = (slug: string) => get<HomeAd | null>(`/artists/${slug}/ads/home`, () => mock.homeAd);

/** GET /artists/{slug}/membership/perks */
export const getMemberPerks = (slug: string) =>
  get<MemberPerk[]>(`/artists/${slug}/membership/perks`, () => mock.memberPerks);

/** GET /artists/{slug}/members (admin do fã clube) */
export const getMembers = (slug: string) => get<Member[]>(`/artists/${slug}/members`, () => mock.members);

/** GET /artists/{slug}/admins */
export const getClubAdmins = (slug: string) => get<ClubAdmin[]>(`/artists/${slug}/admins`, () => mock.clubAdmins);

/** GET /artists/{slug}/ad-slots */
export const getAdSlots = (slug: string) => get<AdSlot[]>(`/artists/${slug}/ad-slots`, () => mock.adSlots);

/** GET /admin/campaigns */
export const getCampaigns = () => get<Campaign[]>("/admin/campaigns", () => mock.campaigns);

/** GET /admin/sponsors */
export const getSponsors = () => get<Sponsor[]>("/admin/sponsors", () => mock.sponsors);

// ---------- Utilidades ----------

export { formatBRL, formatCount } from "./format";
