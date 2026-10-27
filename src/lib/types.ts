import type { ExperienceKey } from "@/lib/experiences";
/**
 * Tipos do domínio. Espelham os schemas que o back (FastAPI) vai expor,
 * então mantenha os nomes dos campos iguais aos da API.
 */
import type { ArtistTheme } from "./themes";

/** Imagem com texto alternativo; `cover` = preencher o quadro em vez de caber nele. */
export type MediaImage = { src: string; alt: string; cover?: boolean };

export type FanClubStatus = "active" | "setup";

export type Artist = {
  id: string;
  slug: string;
  name: string;
  initial: string;
  fanClubName: string; // ex.: "[Nome do fã clube]"
  instagram?: string;
  status: FanClubStatus;
  theme: ArtistTheme;
  memberPriceCents: number; // 1690 = R$ 16,90
  members: string; // número de membros (texto até a API existir)
  adSlotsSummary: string;
  brandColor: string; // cor do avatar no admin
  modules?: Record<string, boolean>; // módulos ligados/desligados pelo admin master
  clubs?: number; // quantos fã clubes o ambiente tem
};

/** Fã clube dentro do ambiente de um cantor (o master e quantos mais o admin criar). */
export type FanClub = {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  isMaster: boolean;
  status: FanClubStatus;
  members: number;
  avatar?: string | null; // foto de perfil
  owner: { name: string; handle?: string } | null;
  joined: boolean; // quem está vendo entrou neste fã clube
  myRole: "owner" | "helper" | null; // quem está vendo é da equipe
};

export type StaffMember = {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "helper";
  roleLabel: string;
  pending: boolean;
};

export type ClubMemberRow = {
  id: string;
  name: string;
  handle: string;
  city: string;
  since: string;
  isSubscriber: boolean;
};

/** Onde a pessoa está na equipe (para escolher o painel). */
export type StaffPosition = {
  artist: string;
  artistName: string;
  club: string;
  clubName: string;
  isMaster: boolean;
  role: "owner" | "helper";
  brandColor: string;
};

export type Viewer = {
  name: string;
  handle: string;
  initial: string;
  luckPoints: number;
  spins: number;
  pendingGifts: number;
  isMember: boolean;
  clubs?: string[]; // fã clubes (slugs) em que entrou neste cantor
};

export type PostKind = "drop" | "galera" | "instagram";

export type Post = {
  id: string;
  kind: PostKind;
  author: {
    name: string;
    handle: string;
    initial: string;
    official?: boolean;
    badge?: string | null;
    id?: string | null; // id do fã autor: abre o perfil público e o chat (vazio no post oficial)
    avatar?: string | null; // foto de perfil do fã autor (/uploads/...)
  };
  timeLabel: string;
  text: string;
  hasImage?: boolean;
  image?: MediaImage | null; // foto do post (a API ainda não manda; ver lib/media.ts)
  quote?: string; // repost de um Drop News
  club?: { slug: string; name: string; avatar?: string | null } | null; // fã clube do post (vazio = oficial)
  url?: string | null; // link do post do Instagram
  likes: number;
  comments: number;
  reposts: number;
  views?: number;
  rewardSpin?: boolean; // esta publicação rendeu 1 giro da roleta (só na resposta da criação)
};

export type EventStatus = "on_sale" | "last_batches" | "soon";

export type ShowEvent = {
  id: string;
  date?: string; // "2026-11-07" (vem da API)
  weekday: string; // "SÁB"
  day: string; // "07"
  month: string; // "NOV"
  monthKey: string; // "nov"
  city: string;
  venue: string;
  time: string;
  address: string;
  doorsOpen: string;
  ageRating: string;
  lineup: string;
  giftsCount: number;
  status: EventStatus;
  ticketingName?: string; // ticketeira oficial (Ingresse)
  ticketingUrl?: string; // link de compra na ticketeira
};

export type Vendor = {
  id: string;
  name: string;
  type: string;
  tag: "Oficial" | "Pacote" | "Excursão";
  priceLabel: string;
  url: string;
};

export type Gift = {
  id: string;
  name: string;
  phase: "before" | "after";
  qtyLabel?: string;
};

export type PrizeKind = "" | "none" | "retry" | "coupon" | "ticket" | "pickup";

export type Prize = { id: string; label: string; isRetry?: boolean; kind?: PrizeKind };

/** Brinde ganho na roleta (Meus brindes): código para retirar, como retirar e a situação. */
export type Reward = {
  id: string;
  label: string;
  kind: PrizeKind;
  code: string;
  instructions: string;
  couponCode: string; // cupom gerado (kind "coupon")
  status: "available" | "redeemed" | "used" | "expired";
  expiresOn: string | null;
  wonAt: string;
};

export type ProductCategory = "roupas" | "acessorios" | "musica";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  priceLabel: string;
  priceCents?: number | null; // valor em centavos (a API manda; sem ele o item não entra na conta)
  color: string; // cor de fundo quando não há foto
  image?: MediaImage | null; // foto do produto (a API ainda não manda; ver lib/media.ts)
};

export type Track = {
  id: string;
  num: string;
  title: string;
  meta: string;
  votes: number;
  releaseLabel: string;
  durationSec: number;
};

export type HomeAd = {
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  url: string;
};

export type AdSlot = {
  id: string;
  name: string;
  where: string;
  format: string;
  priceLabel: string;
  priceCents?: number | null;
  occupied: boolean;
  active: boolean;
  diagram: { top: number; height: number }; // posição no mini desenho do celular (px)
};

export type CampaignStatus = "live" | "approved" | "pending" | "rejected";

export type Campaign = {
  id: string;
  sponsor: string;
  slotName: string;
  title: string;
  period: string;
  status: CampaignStatus;
  club?: string; // nome do cantor
  clubSlug?: string; // slug do cantor
  fanClub?: string | null; // fã clube da vitrine (vazio = ambiente do cantor)
  fanClubSlug?: string | null;
  text?: string;
  cta?: string;
  url?: string;
  artUrl?: string | null;
  videoUrl?: string | null; // vitrine "pickup_video": vídeo obrigatório antes do giro
  targetCity?: string; // cidade do raio de alcance (vazio = qualquer lugar)
  targetRadiusKm?: number; // 0 = país todo
  goalViews?: number;
  goalClicks?: number;
  budgetCents?: number; // valor calculado ao anunciar
};

export type Sponsor = {
  id: string;
  brand: string;
  email: string;
  campaigns: number;
  status: "active" | "invited";
};

export type MemberStatus = "active" | "pending" | "canceled";

export type Member = {
  id: string;
  name: string;
  handle: string;
  status: MemberStatus;
  since: string;
  payment: "Pix" | "Cartão";
  points: number;
  city: string;
};

export type ClubAdmin = { id?: string; name: string; email?: string; role: string; pending?: boolean };

export type MemberPerk = { title: string; sub: string };

/** Linha do painel dos fã clubes do ambiente (admin do artista). */
export type ClubOverview = {
  id: string;
  slug: string;
  name: string;
  city: string;
  isMaster: boolean;
  status: FanClubStatus;
  avatar: string | null; // foto de perfil (/uploads/...)
  ownerName: string | null;
  ownerEmail: string | null;
  members: number;
  newMembersMonth: number;
  posts: number;
  postsMonth: number;
  staff: number;
};

/** Analytics de um fã clube (últimos 30 dias em `series`). */
export type ClubAnalytics = {
  club: ClubOverview;
  subscribers: number;
  likes: number;
  comments: number;
  reposts: number;
  newMembersPrevMonth: number;
  activeSlots: number;
  approvedCampaigns: number;
  series: { day: string; newMembers: number; posts: number }[];
  topCities: { city: string; members: number }[];
  topPosts: { id: string; text: string; author: string; likes: number; comments: number; reposts: number }[];
  staffNames: string[];
};

/** Analytics dos assinantes do ambiente (sem listar pessoas). */
export type SubscribersAnalytics = {
  fans: number;
  active: number;
  pending: number;
  canceled: number;
  newSubscribersMonth: number;
  monthlyRevenueCents: number;
  withAddress: number; // assinantes ativos com UF informada
  series: { day: string; newSubscribers: number }[];
  byState: { place: string; subscribers: number }[];
  byCity: { place: string; subscribers: number }[];
};

/** Publicação no feed do admin (Drop News e galera), com as métricas. */
export type FeedItem = {
  id: string;
  kind: PostKind;
  text: string;
  image: string | null; // caminho servido pelo próprio front (/uploads/...)
  author: string;
  handle: string; // @ do autor (vazio para o artista)
  clubName: string | null;
  timeLabel: string;
  date: string;
  likes: number;
  comments: number;
  reposts: number;
  views: number;
  recentComments: { author: string; text: string; timeLabel: string }[]; // os 3 mais recentes
};

/** Item de um pacote: um tipo de ingresso (com preço) ou uma opção de transfer. */
/** Experiência avulsa de um pacote (jantar, camarim, pré-esquenta, after, hotel), com o preço. */
export type PackageAddon = { key: ExperienceKey; label: string; priceCents: number; soldOut: boolean };

export type PackageItem = { kind: "ticket" | "transfer" | "seal" | "photo"; label: string; priceCents: number; soldOut: boolean };

/** Pacote de uma agência para um show, como o fã vê. */
export type EventPackage = {
  id: string;
  name: string;
  description: string;
  agencyName: string;
  agencyContact: string;
  agencyUrl: string;
  url: string; // link de venda do pacote
  transferDetails: string;
  hasTransfer: boolean;
  addons: PackageAddon[]; // experiências que o fã adiciona ao ingresso
  fromPriceCents: number | null; // menor preço disponível
  items: PackageItem[];
};

/** Agência parceira e pacote, como o admin gerencia. */
export type AgencyAdmin = { id: string; name: string; contact: string; url: string; active: boolean };
export type PackageAdmin = {
  id: string;
  eventId: string;
  agencyId: string;
  name: string;
  description: string;
  transferDetails: string;
  url: string;
  items: PackageItem[];
  addons: { key: ExperienceKey; priceCents: number; soldOut: boolean }[];
  active: boolean;
  position: number;
};

/** Tipo de ingresso avulso do show (ticketeira), com o preço. */
export type EventTicket = { id: string; label: string; description: string; priceCents: number; soldOut: boolean };

/** Um giro da roleta do fã e o motivo de ele existir (compra de ingresso, boas-vindas...). */
export type SpinCredit = { id: string; reason: string; used: boolean; prizeLabel: string | null; date: string };

/** Valor do carrinho calculado pela API: ingresso + experiências, com o cupom. */
export type Quote = { subtotalCents: number; discountCents: number; totalCents: number; coupon: string; couponLabel: string };

/** Cupom pessoal do fã (ex.: o de 10% que ganhou na roleta). */
export type MyCoupon = { code: string; label: string; source: string; expiresOn: string | null };

/** Ingresso que o fã comprou (Meus ingressos na Agenda). */
export type MyTicket = {
  id: string;
  eventId: string;
  event: ShowEvent;
  packageName: string;
  agencyName: string;
  label: string;
  kind: "ticket" | "transfer" | "seal" | "photo" | "extras"; // "extras": compra só de experiências (ingresso na Ingresse)
  priceCents: number;
  includesTransfer: boolean;
  includesSeal: boolean;
  includesPhotoFinder: boolean;
  bought: string;
};

/** Foto oficial de um show (Photo Finder). */
export type EventPhoto = { id: string; src: string; indexed: boolean; faces: number };

/** Ranking "Fã Super do Vintage" (compartilhamentos no Instagram com a hashtag). */
type RankRow = { position: number; name: string; handle: string; avatar?: string | null; shares: number; me: boolean };
type MyRank = { position: number | null; shares: number; pending: number };

export type Ranking = {
  hashtag: string;
  myCode: string;
  autoVerify: boolean; // a conferência no Instagram está ligada no servidor
  me: MyRank;
  top: RankRow[]; // geral: todos os fã clubes juntos
  clubs: { slug: string; name: string; avatar?: string | null; ranked: number; me: MyRank | null; top: RankRow[] }[]; // um ranking por fã clube
};

/** Perfil de quem está logado (tela Perfil). */
export type Profile = {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: string;
  avatar: string | null;
  city: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  state: string;
  since: string;
};

/** Vitrine alugada por um patrocinador (admin do ambiente). */
export type Rental = {
  slotName: string;
  where: string;
  diagramTop: number; // posição da vitrine no desenho do celular
  diagramHeight: number;
  fanClub: string | null; // null = vitrine do ambiente
  sponsor: string;
  title: string;
  start: string | null; // AAAA-MM-DD
  end: string | null;
  days: number | null;
  status: "live" | "scheduled" | "ended";
  priceCentsPerWeek: number | null;
  estimatedTotalCents: number | null;
};

// ---------- Chat privado entre fãs ----------

/** A outra pessoa de uma conversa (ou o autor de um post). */
export type ChatUser = { id: string; name: string; handle: string | null; avatar: string | null };

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: string;
  body: string;
  createdAt: string; // ISO 8601
  readAt: string | null; // quando o outro leu
  mine: boolean; // enviada por quem está vendo
};

export type Conversation = {
  id: number;
  other: ChatUser;
  lastMessage: ChatMessage | null;
  lastMessageAt: string | null;
  unread: number; // mensagens do outro ainda não lidas
};

/** Perfil público de um fã neste ambiente (aberto ao tocar no autor de um post). */
export type PublicFan = ChatUser & {
  club: { slug: string; name: string; avatar: string | null } | null;
  points: number | null;
  rank: number | null;
  isMe: boolean;
  posts: Post[];
};
