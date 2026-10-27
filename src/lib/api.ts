/**
 * Camada de dados do front (só roda no servidor).
 *
 * Com API_URL definido, tudo vem do back FastAPI, com o token do cookie de login.
 * Sem API_URL, o app usa os dados de exemplo de ./mock e não pede login.
 * As páginas não precisam saber de onde vem.
 */
import { cookies } from "next/headers";
import { normalizeTheme } from "./themes";
import { redirect, unstable_rethrow } from "next/navigation";
import { SESSION_COOKIE, verifySession, type Session } from "./auth";
import * as mock from "./mock";
import { exampleInAppAds, type InAppAds } from "./ads";
import * as resaleMock from "./resale-mock";
import { CHAT_PAGE } from "./chat";
import * as chatMock from "./chat-mock";
import type {
  Eligibility,
  Identity,
  Listing,
  ListingsPage,
  MyListing,
  Order,
  ResaleEvent,
  ResaleEventDetail,
  Seller,
  SellerReview,
} from "./resale";
import type {
  ClubMemberRow,
  ClubAnalytics,
  ClubOverview,
  EventPackage,
  EventPhoto,
  Reward,
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
  FeedAdItem,
  HomeAd,
  Member,
  MemberPerk,
  Post,
  PostKind,
  Prize,
  Product,
  ShowEvent,
  Profile,
  ClubHighlight,
  PersonHistory,
  PickupOverview,
  PickupSpinPage,
  PickupWinnerPage,
  PostDetail,
  ExperienceBuyerPage,
  ExperiencesOverview,
  Ranking,
  VitrinesMap,
  TrackDetail,
  SubscriberActivity,
  SubscriberPage,
  RankingFan,
  RankingScope,
  Rental,
  Sponsor,
  SpinCredit,
  SubscribersAnalytics,
  Track,
  Vendor,
  Viewer,
  ChatMessage,
  ChatUser,
  Conversation,
  PublicFan,
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

/** `code` vem quando a API manda um código de máquina (ex.: revenda: "QTY_UNAVAILABLE"). */
export type ApiResult<T = unknown> = { ok: true; data: T } | { ok: false; error: string; status: number; code?: string };

const errorCode = (data: unknown) => {
  const code = (data as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
};

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
  if (!res.ok) return { ok: false, error: errorMessage(data, res.status), status: res.status, code: errorCode(data) };
  return { ok: true, data: data as T };
}

export async function send<T = unknown>(
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<ApiResult<T>> {
  if (!API_URL) return { ok: false, error: "O front não está ligado à API (API_URL).", status: 0 };
  const headers = new Headers(extraHeaders);
  const init: RequestInit = { method, headers };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    headers.set("Content-Type", "application/json");
  }
  let res: Response;
  try {
    res = await request(path, init);
  } catch {
    return { ok: false, error: "Não foi possível falar com o servidor.", status: 0 };
  }
  if (res.status === 204) return { ok: true, data: undefined as T };
  const data = await res.json().catch(() => null);
  if (!res.ok) return { ok: false, error: errorMessage(data, res.status), status: res.status, code: errorCode(data) };
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

// ---------- PicKup, Loja, Drops Hits ----------

/** GET /artists/{slug}/pickup/prizes */
export const getPrizes = (slug: string) => get<Prize[]>(`/artists/${slug}/pickup/prizes`, () => mock.prizes);

/** GET /artists/{slug}/products */
export const getProducts = (slug: string) => get<Product[]>(`/artists/${slug}/products`, () => mock.products);

/** GET /artists/{slug}/tracks */
export const getTracks = (slug: string) => get<Track[]>(`/artists/${slug}/tracks`, () => mock.tracks);

// ---------- Mídia e membros ----------

/** GET /artists/{slug}/ads/home — anúncio ativo no card da Home */
export const getHomeAd = (slug: string) => get<HomeAd | null>(`/artists/${slug}/ads/home`, () => mock.homeAd);

/** GET /artists/{slug}/ads/feed — posts patrocinados do feed do cantor (posições 4, 8, 12 e 16) */
export async function getFeedAds(slug: string): Promise<FeedAdItem[]> {
  try {
    return await get<FeedAdItem[]>(`/artists/${slug}/ads/feed`, () => [], { notFound: [] });
  } catch (e) {
    unstable_rethrow(e);
    return []; // anúncio nunca derruba a página
  }
}

/** GET /artists/{slug}/clubs/{club}/ads/feed — posts patrocinados do feed do fã clube (posições 4, 8 e 12) */
export async function getClubFeedAds(slug: string, club: string): Promise<FeedAdItem[]> {
  try {
    return await get<FeedAdItem[]>(`/artists/${slug}/clubs/${club}/ads/feed`, () => [], { notFound: [] });
  } catch (e) {
    unstable_rethrow(e);
    return [];
  }
}

/**
 * GET /artists/{slug}/ads/in-app — criativos do modal de entrada, da roleta e do Mural.
 * Enquanto o back não tem a rota (ou ela falha), usa os exemplos de ./ads: anúncio nunca derruba a página.
 */
export async function getInAppAds(slug: string): Promise<InAppAds> {
  try {
    return await get<InAppAds>(`/artists/${slug}/ads/in-app`, () => exampleInAppAds(), {
      notFound: exampleInAppAds(),
    });
  } catch (e) {
    unstable_rethrow(e); // o redirect do 401 continua valendo
    return exampleInAppAds();
  }
}

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

/** GET /artists/{slug}/manage/ranking/people/{id}: histórico de um fã no ranking. */
export async function getPersonHistory(slug: string, userId: string): Promise<PersonHistory | null> {
  if (!API_URL) return null;
  const res = await request(`/artists/${slug}/manage/ranking/people/${userId}`);
  return res.ok ? ((await res.json()) as PersonHistory) : null;
}

/** GET /artists/{slug}/clubs-highlights: comparação dos fã clubes. */
export const getClubsHighlights = (slug: string) => get<ClubHighlight[]>(`/artists/${slug}/clubs-highlights`, () => []);

/** GET /artists/{slug}/manage/ranking: quem lidera o ranking geral e o de cada fã clube. */
export const getRankingLeaders = (slug: string) => get<RankingScope[]>(`/artists/${slug}/manage/ranking`, () => []);

/** Busca fãs do ambiente para escolher quem fica em 1º (usada pela ação do admin). */
export async function searchRankingFans(slug: string, q: string, club?: string): Promise<RankingFan[]> {
  if (!API_URL) return [];
  const qs = new URLSearchParams({ q, ...(club ? { club } : {}) });
  const res = await request(`/artists/${slug}/manage/ranking/fans?${qs}`);
  return res.ok ? ((await res.json()) as RankingFan[]) : [];
}

/** GET /artists/{slug}/subscribers: assinantes, do mais recente ao mais antigo, 10 por página. */
export async function getSubscribers(slug: string, q = "", page = 1): Promise<SubscriberPage | null> {
  if (!API_URL) return null;
  const qs = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
  const res = await request(`/artists/${slug}/subscribers?${qs}`);
  return res.ok ? ((await res.json()) as SubscriberPage) : null;
}

/** GET /artists/{slug}/subscribers/{id}/activity: ações de um assinante. */
export async function getSubscriberActivity(slug: string, userId: string): Promise<SubscriberActivity | null> {
  if (!API_URL) return null;
  const res = await request(`/artists/${slug}/subscribers/${userId}/activity`);
  return res.ok ? ((await res.json()) as SubscriberActivity) : null;
}

/** GET /artists/{slug}/manage/pickup: a roleta ativa, estoque e ganhadores de cada brinde. */
export const getPickup = (slug: string, club?: string) =>
  get<PickupOverview | null>(`/artists/${slug}/manage/pickup${club ? `?club=${encodeURIComponent(club)}` : ""}`, () => null, { notFound: null });

/** GET /artists/{slug}/manage/pickup/history: quem girou, do último para o primeiro (10 por página). */
export async function getPickupHistory(slug: string, club: string | undefined, q: string, page: number): Promise<PickupSpinPage | null> {
  if (!API_URL) return null;
  const qs = new URLSearchParams({ page: String(page), ...(q ? { q } : {}), ...(club ? { club } : {}) });
  const res = await request(`/artists/${slug}/manage/pickup/history?${qs}`);
  return res.ok ? ((await res.json()) as PickupSpinPage) : null;
}

/** GET /artists/{slug}/manage/pickup/prizes/{id}/winners: quem ganhou uma fatia (10 por página). */
export async function getPrizeWinners(slug: string, prizeId: string, page: number): Promise<PickupWinnerPage | null> {
  if (!API_URL) return null;
  const res = await request(`/artists/${slug}/manage/pickup/prizes/${prizeId}/winners?page=${page}`);
  return res.ok ? ((await res.json()) as PickupWinnerPage) : null;
}

/** GET /artists/{slug}/manage/posts/{id}/detail: foto, números, comentários e quem compartilhou. */
export async function getPostDetail(slug: string, id: string): Promise<PostDetail | null> {
  if (!API_URL) return null;
  const res = await request(`/artists/${slug}/manage/posts/${id}/detail`);
  return res.ok ? ((await res.json()) as PostDetail) : null;
}

/** GET /artists/{slug}/manage/tracks/{id}/detail: curtidas, visualizações e quem compartilhou o hit. */
export async function getTrackDetail(slug: string, id: string): Promise<TrackDetail | null> {
  if (!API_URL) return null;
  const res = await request(`/artists/${slug}/manage/tracks/${id}/detail`);
  return res.ok ? ((await res.json()) as TrackDetail) : null;
}

/** GET /artists/{slug}/vitrines-map: todas as vitrines, com quem está no ar (admin). */
export const getVitrinesMap = (slug: string) => get<VitrinesMap | null>(`/artists/${slug}/vitrines-map`, () => null, { notFound: null });

/** GET /sponsor/vitrines-map: todas as vitrines de um cantor (portal do patrocinador). */
export const getSponsorVitrinesMap = (slug: string) => get<VitrinesMap | null>(`/sponsor/vitrines-map?artist=${encodeURIComponent(slug)}`, () => null, { notFound: null });

/** GET /artists/{slug}/manage/events/{id}/experiences: quantas compras e pessoas cada experiência do show tem. */
export const getExperiencesOverview = (slug: string, eventId: string) =>
  get<ExperiencesOverview | null>(`/artists/${slug}/manage/events/${eventId}/experiences`, () => null, { notFound: null });

/** GET .../experiences/{key}/buyers: quem comprou uma experiência, 10 por página. */
export async function getExperienceBuyers(slug: string, eventId: string, key: string, q: string, page: number): Promise<ExperienceBuyerPage | null> {
  if (!API_URL) return null;
  const qs = new URLSearchParams({ page: String(page), ...(q ? { q } : {}) });
  const res = await request(`/artists/${slug}/manage/events/${eventId}/experiences/${key}/buyers?${qs}`);
  return res.ok ? ((await res.json()) as ExperienceBuyerPage) : null;
}

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

/** GET /artists/{slug}/pickup/spins: os giros do fã, cada um com o motivo. */
export const getSpinCredits = (slug: string) => get<SpinCredit[]>(`/artists/${slug}/pickup/spins`, () => [] as SpinCredit[]);

/** GET /artists/{slug}/me/rewards: os brindes que o fã ganhou na roleta. */
export const getMyRewards = (slug: string) => get<Reward[]>(`/artists/${slug}/me/rewards`, () => [] as Reward[]);

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

/** GET /artists/{slug}/clubs/{club}/pickup/prizes */
export const getClubPrizes = (slug: string, club: string) =>
  get<Prize[]>(`/artists/${slug}/clubs/${club}/pickup/prizes`, () => mock.prizes);

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

/** GET /artists/{slug}/rentals: vitrines alugadas (ambiente e fã clubes), com o patrocinador e o período. */
export const getRentals = (slug: string) => get<Rental[]>(`/artists/${slug}/rentals`, () => [] as Rental[]);

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

// ---------- Revenda de ingressos (escrow entre fãs) ----------

/**
 * Leitura da revenda que pode falhar com motivo (ex.: 409 RESALE_CLOSED, 403 NOT_ELIGIBLE): a página mostra o `detail`.
 * Sem API, devolve os dados de exemplo.
 */
async function resaleGet<T>(path: string, fallback: () => T | null): Promise<ApiResult<T>> {
  if (!API_URL) {
    await token();
    const data = fallback();
    return data == null ? { ok: false, error: "Não encontrado.", status: 404 } : { ok: true, data };
  }
  const res = await fetchJson<T>(path);
  if (!res.ok && res.status === 401) redirect("/login");
  return res;
}

const rs = (slug: string) => `/artists/${slug}/resale`;

export const getResaleEligibility = (slug: string) => resaleGet<Eligibility>(`${rs(slug)}/me/eligibility`, () => resaleMock.eligibility);
export const getResaleEvents = (slug: string) => resaleGet<ResaleEvent[]>(`${rs(slug)}/events`, () => resaleMock.events);
export const getResaleEvent = (slug: string, id: string) =>
  resaleGet<ResaleEventDetail>(`${rs(slug)}/events/${encodeURIComponent(id)}`, () => resaleMock.eventDetail(id));
export const getResaleListings = (slug: string, eventId: string, q: { ticketId?: string; sort?: "price" | "recent"; page?: number } = {}) => {
  const p = new URLSearchParams();
  if (q.ticketId) p.set("ticketId", q.ticketId);
  if (q.sort) p.set("sort", q.sort);
  if (q.page && q.page > 1) p.set("page", String(q.page));
  const qs = p.toString();
  return resaleGet<ListingsPage>(`${rs(slug)}/events/${encodeURIComponent(eventId)}/listings${qs ? `?${qs}` : ""}`, () => {
    let items = resaleMock.listings.filter((l) => l.eventId === eventId && (!q.ticketId || l.ticketId === q.ticketId));
    if (q.sort !== "recent") items = [...items].sort((a, b) => a.unitPriceCents - b.unitPriceCents);
    return { items, page: 1, hasMore: false };
  });
};
export const getResaleListing = (slug: string, id: string) =>
  resaleGet<Listing>(`${rs(slug)}/listings/${encodeURIComponent(id)}`, () => resaleMock.listings.find((l) => l.id === id) ?? null);
export const getMyResaleListings = (slug: string) => resaleGet<MyListing[]>(`${rs(slug)}/me/listings`, () => resaleMock.myListings);
export const getMyResaleOrders = (slug: string, role: "buyer" | "seller" | "all" = "all") =>
  resaleGet<Order[]>(`${rs(slug)}/me/orders?role=${role}`, () => resaleMock.orders().filter((o) => role === "all" || o.role === role));
export const getResaleOrder = (slug: string, id: string) =>
  resaleGet<Order>(`${rs(slug)}/orders/${encodeURIComponent(id)}`, () => resaleMock.orders().find((o) => o.id === id) ?? null);
export const getResaleSeller = (slug: string, userId: string) =>
  resaleGet<Seller>(`${rs(slug)}/sellers/${encodeURIComponent(userId)}`, () => resaleMock.sellerById(userId));
export const getResaleSellerReviews = (slug: string, userId: string) =>
  resaleGet<SellerReview[]>(`${rs(slug)}/sellers/${encodeURIComponent(userId)}/reviews`, () => resaleMock.reviews);
export const getIdentity = () => resaleGet<Identity>("/me/identity", () => resaleMock.identity);

// ---------- Chat privado entre fãs (docs/chat-api.md do back) ----------

type Raw = Record<string, unknown>;
const str = (v: unknown) => (v == null ? null : String(v));

/** O back responde em camelCase; aceita snake_case também, por segurança. */
export const toChatUser = (r: Raw | null | undefined): ChatUser => ({
  id: String(r?.id ?? ""),
  name: String(r?.name ?? "Fã"),
  handle: str(r?.handle),
  avatar: str(r?.avatar),
});

export const toChatMessage = (r: Raw): ChatMessage => ({
  id: Number(r.id),
  conversationId: Number(r.conversationId ?? r.conversation_id),
  senderId: String(r.senderId ?? r.sender_id ?? ""),
  body: String(r.body ?? ""),
  createdAt: String(r.createdAt ?? r.created_at ?? ""),
  readAt: str(r.readAt ?? r.read_at),
  mine: !!r.mine,
});

export const toConversation = (r: Raw): Conversation => {
  const last = (r.lastMessage ?? r.last_message) as Raw | null | undefined;
  return {
    id: Number(r.id),
    other: toChatUser(r.other as Raw),
    lastMessage: last ? toChatMessage(last) : null,
    lastMessageAt: str(r.lastMessageAt ?? r.last_message_at),
    unread: Number(r.unread ?? 0),
  };
};

const chat = (slug: string) => `/artists/${slug}/chat`;

/** GET /artists/{slug}/chat/conversations (mais recente primeiro). */
export const getConversations = (slug: string) =>
  get<Raw[]>(`${chat(slug)}/conversations`, () => chatMock.listConversations() as unknown as Raw[]).then((rs) =>
    rs.map(toConversation),
  );

/** GET /artists/{slug}/chat/conversations/{id}. null se não existe ou não é sua (404/403). */
export async function getConversation(slug: string, id: number): Promise<Conversation | null> {
  if (!API_URL) {
    await token();
    return chatMock.getConversation(id);
  }
  const res = await fetchJson<Raw>(`${chat(slug)}/conversations/${id}`);
  if (res.ok) return toConversation(res.data);
  if (res.status === 401) redirect("/login");
  if (res.status === 404 || res.status === 403) return null;
  throw new Error(`GET conversa ${id} falhou: ${res.status}`);
}

/** GET /artists/{slug}/chat/conversations/{id}/messages (últimas 50, da mais antiga para a mais nova). */
export const getMessages = (slug: string, id: number) =>
  get<Raw[]>(`${chat(slug)}/conversations/${id}/messages?limit=${CHAT_PAGE}`, () => (chatMock.listMessages(id) ?? []) as unknown as Raw[], {
    notFound: [],
  }).then((rs) => rs.map(toChatMessage));

/** GET /artists/{slug}/fans/{id}: perfil público do fã. null se não existe. */
export async function getPublicFan(slug: string, id: string): Promise<PublicFan | null> {
  const r = await get<Raw | null>(`/artists/${slug}/fans/${encodeURIComponent(id)}`, () => chatMock.publicFan(id) as unknown as Raw | null, {
    notFound: null,
  });
  if (!r) return null;
  const club = r.club as Raw | null | undefined;
  return {
    ...toChatUser(r),
    club: club ? { slug: String(club.slug ?? ""), name: String(club.name ?? ""), avatar: str(club.avatar) } : null,
    points: r.points == null ? null : Number(r.points),
    rank: r.rank == null ? null : Number(r.rank),
    isMe: !!(r.isMe ?? r.is_me),
    posts: Array.isArray(r.posts) ? (r.posts as Post[]) : [],
  };
}

// ---------- Utilidades ----------

export { formatBRL, formatCount } from "./format";
