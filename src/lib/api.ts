/**
 * Camada de dados do front (só roda no servidor).
 *
 * Com API_URL definido, tudo vem do back FastAPI, com o token do cookie de login.
 * Sem API_URL, o app usa os dados de exemplo de ./mock e não pede login.
 * As páginas não precisam saber de onde vem.
 */
import { cookies } from "next/headers";
import { normalizeTheme } from "./themes";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Session } from "./auth";
import * as mock from "./mock";
import type {
  ClubMemberRow,
  ClubAnalytics,
  ClubOverview,
  EventPackage,
  EventPhoto,
  EventTicket,
  FanClub,
  FeedItem,
  MyTicket,
  StaffMember,
  StaffPosition,
  AdSlot,
  Artist,
  Campaign,
  Gift,
  HomeAd,
  Member,
  MemberPerk,
  Post,
  PostKind,
  Prize,
  Product,
  ShowEvent,
  Profile,
  Ranking,
  Sponsor,
  SpinCredit,
  SubscribersAnalytics,
  Track,
  Vendor,
  Viewer,
} from "./types";

const API_URL = (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "");

export const apiEnabled = () => !!API_URL;

async function token(): Promise<string | undefined> {
  // Ler os cookies também deixa as páginas dinâmicas (dados sempre frescos).
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

/** Sessão do usuário logado (null sem login ou sem API). */
export async function getSession(): Promise<Session | null> {
  return verifySession(await token());
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const t = await token();
  const headers = new Headers(init.headers);
  if (t) headers.set("Authorization", `Bearer ${t}`);
  return fetch(`${API_URL}${path}`, { ...init, headers, cache: "no-store" });
}

async function get<T>(path: string, fallback: () => T, opts: { notFound?: T } = {}): Promise<T> {
  if (!API_URL) {
    await token();
    return fallback();
  }
  const res = await request(path);
  if (res.status === 401) redirect("/login");
  if (res.status === 404 && "notFound" in opts) return opts.notFound as T;
  if (!res.ok) throw new Error(`GET ${path} falhou: ${res.status}`);
  return (await res.json()) as T;
}

export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; status: number };

/** Escrita na API (usado pelas server actions). Devolve a mensagem de erro da API, pronta para mostrar. */
/** GET numa server action (o `get` do arquivo só roda em páginas e redireciona no 401). */
export async function fetchJson<T = unknown>(path: string): Promise<ApiResult<T>> {
  if (!API_URL) return { ok: false, error: "O front não está ligado à API (API_URL).", status: 0 };
  let res: Response;
  try {
    res = await request(path);
  } catch {
    return { ok: false, error: "Não foi possível falar com o servidor.", status: 0 };
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: errorMessage(data, res.status), status: res.status };
  return { ok: true, data: data as T };
}

export async function send<T = unknown>(
  method: "POST" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
): Promise<ApiResult<T>> {
  if (!API_URL) return { ok: false, error: "O front não está ligado à API (API_URL).", status: 0 };
  const init: RequestInit = { method };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers = { "Content-Type": "application/json" };
  }
  let res: Response;
  try {
    res = await request(path, init);
  } catch {
    return { ok: false, error: "Não foi possível falar com o servidor.", status: 0 };
  }
  if (res.status === 204) return { ok: true, data: undefined as T };
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: errorMessage(data, res.status), status: res.status };
  return { ok: true, data: data as T };
}

function errorMessage(data: unknown, status: number): string {
  const detail = (data as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) {
    const d = detail[0] as { loc?: (string | number)[]; msg: string };
    const field = d.loc?.[d.loc.length - 1];
    return field ? `${field}: ${d.msg}` : d.msg;
  }
  if (status === 401) return "Sua sessão expirou. Entre de novo.";
  if (status === 403) return "Você não tem permissão para isso.";
  return `Erro ${status}.`;
}

// ---------- Ambientes de artista ----------

/** GET /artists */
const withTheme = (a: Artist): Artist => ({ ...a, theme: normalizeTheme(a.theme) });

export const listArtists = () => get<Artist[]>("/artists", () => mock.artists).then((as) => as.map(withTheme));

/** GET /artists/{slug} */
export const getArtist = (slug: string) =>
  get<Artist | null>(`/artists/${slug}`, () => mock.artists.find((a) => a.slug === slug) ?? null, { notFound: null }).then(
    (a) => a && withTheme(a),
  );

/** GET /me?artist={slug} (usuário logado, com pontos e giros naquele fã clube) */
export const getViewer = (slug?: string) =>
  get<Viewer>(`/me${slug ? `?artist=${slug}` : ""}`, () => mock.viewer);

/** GET /me/fandoms */
export const getOtherFandoms = (slug?: string) =>
  get<string[]>(`/me/fandoms${slug ? `?artist=${slug}` : ""}`, () => mock.otherFandoms);

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
export const getEvent = (slug: string, id: string) =>
  get<ShowEvent | null>(`/artists/${slug}/events/${id}`, () => mock.events.find((e) => e.id === id) ?? null, {
    notFound: null,
  });

/** GET /artists/{slug}/events/{id}/tickets: tipos de ingresso avulsos, cada um com o preço. */
export const getTickets = (slug: string, eventId: string) =>
  get<EventTicket[]>(`/artists/${slug}/events/${eventId}/tickets`, () => [] as EventTicket[]);

/** GET /artists/{slug}/events/{id}/packages: pacotes das agências (ingressos de vários tipos e transfer). */
export const getPackages = (slug: string, eventId: string) =>
  get<EventPackage[]>(`/artists/${slug}/events/${eventId}/packages`, () => [] as EventPackage[]);

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

/** GET /artists/{slug}/ad-slots */
export const getAdSlots = (slug: string) => get<AdSlot[]>(`/artists/${slug}/ad-slots`, () => mock.adSlots);

/** GET /admin/campaigns */
export const getCampaigns = () => get<Campaign[]>("/admin/campaigns", () => mock.campaigns);

/** GET /admin/sponsors */
export const getSponsors = () => get<Sponsor[]>("/admin/sponsors", () => mock.sponsors);

/** GET /sponsor/campaigns (campanhas da marca logada) */
export const getMyCampaigns = () => get<Campaign[]>("/sponsor/campaigns", () => mock.campaigns.slice(0, 2));

/** GET /sponsor/me */
export const getMySponsor = () =>
  get<Sponsor | null>("/sponsor/me", () => mock.sponsors[0] ?? null, { notFound: null });

// ---------- Fã clubes do cantor ----------

/** GET /artists/{slug}/clubs */
export const getClubs = (slug: string) => get<FanClub[]>(`/artists/${slug}/clubs`, () => mock.fanClubs);

/** GET /artists/{slug}/manage/feed: publicações de uma aba, com curtidas, comentários e visualizações. */
export const getFeed = (slug: string, kind: "drop" | "galera") =>
  get<FeedItem[]>(`/artists/${slug}/manage/feed?kind=${kind}`, () => [] as FeedItem[]);

/** GET /artists/{slug}/clubs/{club}/feed: todas as publicações de um fã clube, com os números. */
export const getClubFeed = (slug: string, club: string) =>
  get<FeedItem[]>(`/artists/${slug}/clubs/${club}/feed`, () => [] as FeedItem[]);

/** GET /artists/{slug}/subscribers-analytics */
export const getSubscribersAnalytics = (slug: string) =>
  get<SubscribersAnalytics | null>(`/artists/${slug}/subscribers-analytics`, () => null, { notFound: null });

/** GET /artists/{slug}/manage/events/{id}/photos: fotos oficiais do show. */
export const getEventPhotos = (slug: string, eventId: string) =>
  get<EventPhoto[]>(`/artists/${slug}/manage/events/${eventId}/photos`, () => [] as EventPhoto[]);

/** GET /auth/profile: tudo do perfil de quem está logado. */
export const getProfile = () => get<Profile | null>("/auth/profile", () => null);

/** GET /auth/me: dados de quem está logado (foto de perfil). */
export const getMe = () => get<{ avatar?: string | null } | null>("/auth/me", () => null);

/** GET /artists/{slug}/ranking: ranking Fã Super do Vintage. */
export const getRanking = (slug: string) => get<Ranking | null>(`/artists/${slug}/ranking`, () => null);

/** GET /artists/{slug}/me/tickets: os ingressos que o fã comprou. */
export const getMyTickets = (slug: string) => get<MyTicket[]>(`/artists/${slug}/me/tickets`, () => [] as MyTicket[]);

/** GET /artists/{slug}/pickap/spins: os giros do fã, cada um com o motivo. */
export const getSpinCredits = (slug: string) => get<SpinCredit[]>(`/artists/${slug}/pickap/spins`, () => [] as SpinCredit[]);

/** GET /artists/{slug}/clubs-overview: todos os fã clubes do ambiente, com o dono e os números. */
export const getClubsOverview = (slug: string) =>
  get<ClubOverview[]>(`/artists/${slug}/clubs-overview`, () =>
    mock.fanClubs.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      city: c.city,
      isMaster: c.isMaster,
      status: c.status,
      avatar: c.avatar ?? null,
      ownerName: c.owner?.name ?? null,
      ownerEmail: null,
      members: c.members,
      newMembersMonth: 0,
      posts: 0,
      postsMonth: 0,
      staff: 1,
    })),
  );

/** GET /artists/{slug}/clubs/{club}/analytics */
export const getClubAnalytics = (slug: string, club: string) =>
  get<ClubAnalytics | null>(`/artists/${slug}/clubs/${club}/analytics`, () => null, { notFound: null });

/** GET /artists/{slug}/clubs/{club} */
export const getClub = (slug: string, club: string) =>
  get<FanClub | null>(`/artists/${slug}/clubs/${club}`, () => mock.fanClubs.find((c) => c.slug === club) ?? null, {
    notFound: null,
  });

/** GET /artists/{slug}/clubs/{club}/posts */
export const getClubPosts = (slug: string, club: string) =>
  get<Post[]>(`/artists/${slug}/clubs/${club}/posts`, () => mock.posts.filter((p) => p.kind !== "drop"));

/** GET /artists/{slug}/clubs/{club}/pickap/prizes */
export const getClubPrizes = (slug: string, club: string) =>
  get<Prize[]>(`/artists/${slug}/clubs/${club}/pickap/prizes`, () => mock.prizes);

/** GET /artists/{slug}/clubs/{club}/ad-slots */
export const getClubAdSlots = (slug: string, club: string) =>
  get<AdSlot[]>(`/artists/${slug}/clubs/${club}/ad-slots`, () => []);

/** GET /artists/{slug}/clubs/{club}/ads/home */
export const getClubHomeAd = (slug: string, club: string) =>
  get<HomeAd | null>(`/artists/${slug}/clubs/${club}/ads/home`, () => null);

/** GET /artists/{slug}/clubs/{club}/members (equipe do clube) */
export const getClubMembers = (slug: string, club: string) =>
  get<ClubMemberRow[]>(`/artists/${slug}/clubs/${club}/members`, () => []);

/** GET /artists/{slug}/clubs/{club}/staff (equipe do clube) */
export const getClubStaff = (slug: string, club: string) =>
  get<StaffMember[]>(`/artists/${slug}/clubs/${club}/staff`, () => []);

/** GET /artists/{slug}/clubs/{club}/campaigns (equipe do clube) */
export const getClubCampaigns = (slug: string, club: string) =>
  get<Campaign[]>(`/artists/${slug}/clubs/${club}/campaigns`, () => []);

/** GET /artists/{slug}/campaigns (administração do ambiente) */
export const getEnvCampaigns = (slug: string) => get<Campaign[]>(`/artists/${slug}/campaigns`, () => mock.campaigns);

/** GET /me/staff — onde a pessoa está na equipe */
export const getMyStaff = () => get<StaffPosition[]>("/me/staff", () => []);

/** GET /artists/{slug}/clubs/{club}/manage/{recurso} (prizes, posts) */
export const getClubManaged = <T>(slug: string, club: string, resource: string) =>
  get<T[]>(`/artists/${slug}/clubs/${club}/manage/${resource}`, () => [] as T[]);

// ---------- Conteúdo para o admin do fã clube (campos editáveis) ----------

/** GET /artists/{slug}/manage/{recurso} */
export const getManaged = <T>(slug: string, resource: string, query = "") =>
  get<T[]>(`/artists/${slug}/manage/${resource}${query}`, () => [] as T[]);

// ---------- Utilidades ----------

export { formatBRL, formatCount } from "./format";
