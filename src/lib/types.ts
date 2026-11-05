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
  avatar?: string | null; // foto de perfil
  verified?: boolean; // dono de fã clube: selo verificado
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
    verified?: boolean; // autor é dono de fã clube: selo verificado ao lado da foto
  };
  timeLabel: string;
  text: string;
  hasImage?: boolean;
  image?: MediaImage | null; // foto do post (a API ainda não manda; ver lib/media.ts)
  quote?: string; // repost de um Drop News
  club?: { slug: string; name: string; avatar?: string | null; isMaster?: boolean } | null; // fã clube do post (vazio = oficial)
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
  soldOut?: boolean; // estoque zerado: não dá para comprar
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
  id?: string;
  sponsor: string;
  title: string;
  text: string;
  cta: string;
  url: string;
  artUrl?: string | null;
};

/** Post patrocinado do feed: aparece depois do 4º, 8º, 12º ou 16º post. */
/** Post patrocinado do feed: entra depois de cada `every` posts (2, no Mural e nos fã clubes). */
export type FeedAdItem = HomeAd & { position: number; every?: number };

export type AdElement = "title" | "text" | "image" | "video";

export type AdSlot = {
  id: string;
  name: string;
  where: string;
  format: string;
  priceLabel: string;
  priceCents?: number | null;
  occupied: boolean;
  occupiedBy?: string | null; // patrocinador que ocupa a vitrine hoje
  viewPriceMilli?: number | null; // preço de cada view, em milésimos de real (12 = R$ 0,012)
  clickPriceMilli?: number | null; // preço de cada clique, em milésimos de real (800 = R$ 0,80)
  elements?: AdElement[]; // o que a vitrine aceita do anúncio
  category?: string; // entrada | feed | roleta | loja | clubes
  categoryLabel?: string;
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
  start?: string | null; // AAAA-MM-DD
  end?: string | null;
  views?: number; // visualizações até hoje
  clicks?: number;
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
  logo?: string | null; // logo / foto de perfil da marca
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
  ownerAvatar?: string | null; // foto de perfil do dono
  members: number;
  newMembersMonth: number;
  posts: number;
  postsMonth: number;
  staff: number;
};

/** Analytics de um fã clube (últimos 30 dias em `series`). */
/** Perfil do dono do fã clube (card do analytics). */
export type OwnerCard = {
  userId: string; name: string; handle: string; email: string; avatar: string | null;
  city: string; state: string; roleLabel: string; since: string;
  posts: number; shares: number; points: number; position: number | null; ranked: number;
};

export type ClubAnalytics = {
  club: ClubOverview;
  owner?: OwnerCard | null;
  subscribers: number;
  likes: number;
  comments: number;
  reposts: number;
  newMembersPrevMonth: number;
  activeSlots: number;
  approvedCampaigns: number;
  series: { day: string; newMembers: number; posts: number }[];
  topCities: { city: string; members: number }[];
  topPosts: { id: string; text: string; author: string; image?: string | null; likes: number; comments: number; reposts: number }[];
  staffNames: string[];
};

/** Admin: lista de assinantes (10 por página) e as ações de cada um. */
export type SubscriberRow = {
  userId: string; name: string; handle: string; email: string; avatar: string | null;
  city: string; state: string; status: string; since: string | null; payment: string;
  luckPoints: number; spinsLeft: number;
};
export type SubscriberPage = { total: number; page: number; pages: number; pageSize: number; items: SubscriberRow[] };
export type ActivityEvent = { at: string; kind: string; title: string; detail: string };
export type SubscriberActivity = {
  profile: SubscriberRow;
  summary: {
    spinsUsed: number; spinsLeft: number; luckPoints: number; rewards: number; rewardsRedeemed: number;
    coupons: number; couponsUsed: number; purchases: number; spentCents: number;
    sharesConfirmed: number; posts: number; comments: number;
  };
  coupons: { code: string; source: string; kind: "percent" | "fixed"; value: number; used: boolean; expiresOn: string | null }[];
  events: ActivityEvent[];
};

/** Admin: PicKup (roleta ativa, estoque, ganhadores e histórico de giros). */
export type PickupPerson = { userId: string | null; name: string; handle: string; avatar: string | null };
export type PickupWinner = PickupPerson & { at: string; code: string; status: "" | "available" | "used" | "redeemed" | "expired" };
export type PickupPrize = {
  id: string; label: string; kind: string; percent: number; points: number; isRetry: boolean; position: number;
  stock: number | null; won: number; people: number; remaining: number | null; recent: PickupWinner[];
};
export type PickupWheel = { slug: string; name: string; isMaster: boolean };
export type PickupOverview = {
  wheel: PickupWheel; wheels: PickupWheel[];
  summary: { spins: number; spinners: number; spinsLeft: number; rewards: number; lastSpin: (PickupPerson & { at: string; prize: string }) | null };
  prizes: PickupPrize[];
};
export type PickupSpinRow = PickupPerson & { at: string; prize: string; kind: string };
export type PickupSpinPage = { total: number; page: number; pages: number; pageSize: number; items: PickupSpinRow[] };
export type PickupWinnerPage = { total: number; page: number; pages: number; pageSize: number; items: PickupWinner[] };

/** Admin: detalhes de um post do Drop News e de um hit do Drops Hits. */
export type DetailWho = { userId: string | null; name: string; handle: string; avatar: string | null };
export type ShareRow = DetailWho & { at: string; status: "started" | "claimed" | "verified"; permalink: string };
export type CommentRow = DetailWho & { text: string; at: string };
export type PostDetail = {
  id: string; kind: string; official: boolean; text: string; image: string | null; url: string;
  author: DetailWho | null; club: string | null; createdAt: string;
  likes: number; comments: number; reposts: number; views: number;
  sharesTotal: number; sharesVerified: number; shares: ShareRow[]; commentList: CommentRow[];
};
export type TrackDetail = {
  id: string; title: string; meta: string; releaseLabel: string; durationSec: number;
  likes: number; views: number; sharesTotal: number; sharesVerified: number; shares: ShareRow[];
};

/** Mapa de vitrines (admin e patrocinador): cada vitrine com quem está no ar e quem vem a seguir. */
export type VitrineBooking = {
  brand: string; sponsor: string | null; title: string; text: string; cta: string; url: string;
  art: string | null; video: string | null; start: string | null; end: string | null;
  status: "live" | "scheduled"; mine: boolean;
};
export type VitrineCard = {
  key: string; name: string; where: string; format: string; group: "entrada" | "feed" | "roleta" | "loja" | "outras";
  clubSlug: string | null; clubName: string | null; priceCentsPerWeek: number | null; viewPriceMilli?: number | null; clickPriceMilli?: number | null; elements?: AdElement[]; active: boolean;
  diagramTop: number; diagramHeight: number; live: VitrineBooking | null; next: VitrineBooking | null;
};
export type VitrinesMap = { artist: string; cards: VitrineCard[] };

/** Admin: experiências de um show e quem comprou cada uma. */
export type ExperienceStat = { key: string; label: string; offeredIn: string[]; purchases: number; people: number; soldOut: boolean };
export type ExperiencesOverview = {
  eventId: string; city: string; date: string; purchases: number; people: number; revenueCents: number; experiences: ExperienceStat[];
};
export type ExperienceBuyer = {
  userId: string | null; name: string; handle: string; email: string; avatar: string | null;
  package: string; agency: string; at: string; paidCents: number; coupon: string; experiences: string[];
};
export type ExperienceBuyerPage = { total: number; page: number; pages: number; pageSize: number; label: string; items: ExperienceBuyer[] };

/** Caronas por show: o fã oferece vagas e preço; outros reservam e pagam (valor retido até a viagem). */
export type CarpoolWho = { id: string; name: string; handle: string; avatar: string | null };
export type CarpoolBooking = {
  id: string; seats: number; amountCents: number; paymentMethod: "" | "pix" | "cartao"; status: "reserved" | "paid" | "completed" | "cancelled" | "refunded";
  expiresAt: string | null; passenger: CarpoolWho | null;
};
export type Ride = {
  id: string; eventId: string; city: string; venue: string; address: string; originCity: string; meetingPoint: string; departAt: string;
  seatsTotal: number; seatsLeft: number; priceCents: number; car: string; notes: string; status: string;
  driver: CarpoolWho; mine: boolean; myBooking: CarpoolBooking | null; passengers: CarpoolBooking[];
};
export type MyRideBooking = CarpoolBooking & { ride: Ride };
export type MyCarpool = { offered: Ride[]; booked: MyRideBooking[] };
export type CarpoolAdmin = {
  rides: number; seatsBooked: number; heldCents: number; releasedCents: number; refundedCents: number;
  items: { ride: Ride; heldCents: number; releasedCents: number; refundedCents: number }[];
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
  priceCents?: number; // preço da assinatura por mês
  annualRevenueCents?: number; // receita mensal x 12
  newRevenueMonthCents?: number; // novas assinaturas dos últimos 30 dias x preço
  pendingRevenueCents?: number; // o que entra se os pendentes confirmarem
  lostRevenueCents?: number; // o que os cancelados deixaram de pagar por mês
  monthlySeries?: { month: string; label: string; subscribers: number; revenueCents: number }[]; // últimos 6 meses
};

/** Publicação no feed do admin (Drop News e galera), com as métricas. */
export type FeedItem = {
  id: string;
  kind: PostKind;
  text: string;
  image: string | null; // caminho servido pelo próprio front (/uploads/...)
  author: string;
  handle: string; // @ do autor (vazio para o artista)
  authorAvatar?: string | null; // foto de perfil do autor
  authorVerified?: boolean; // autor é dono de fã clube
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
type RankRow = { position: number; userId?: string | null; name: string; handle: string; avatar?: string | null; shares: number; points?: number; me: boolean };
type MyRank = { position: number | null; shares: number; points?: number; pending: number };

export type Ranking = {
  hashtag: string;
  myCode: string;
  autoVerify: boolean; // a conferência no Instagram está ligada no servidor
  me: MyRank;
  top: RankRow[]; // geral: todos os fã clubes juntos
  clubs: { slug: string; name: string; avatar?: string | null; isMaster?: boolean; ranked: number; me: MyRank | null; top: RankRow[] }[]; // um ranking por fã clube
};

/** Admin: números que comparam os fã clubes (30 dias, exceto totais). */
export type ClubHighlight = {
  slug: string; name: string; city: string; isMaster: boolean; avatar?: string | null;
  posts: number; postsWithPhoto: number; prizes: number; content: number;
  postsMonth: number; likes: number; comments: number; reposts: number; views: number; buzz: number;
  members: number; newMembersMonth: number; subscribers: number; activeMembers: number; activeRate: number;
};

/** Admin: funil e gráficos da loja no período. */
export type StoreProductFunnel = {
  productId: string; name: string; views: number; carts: number; removes: number; purchases: number; buyers: number;
  revenueCents: number; viewToCart: number; cartToBuy: number; abandoned: number;
};
export type StoreInsights = {
  days: number; viewers: number; cartPeople: number; buyers: number; views: number; carts: number; removes: number;
  units: number; orders: number; revenueCents: number; avgTicketCents: number; itemsPerOrder: number;
  viewToCart: number; cartToBuy: number; abandoned: number; pickup: number; ship: number;
  series: { day: string; views: number; carts: number; purchases: number; revenueCents: number }[];
  products: StoreProductFunnel[]; bySize: Record<string, number>; byWeekday: number[]; byHour: number[];
};

/** Admin: vendas da loja (por produto, com o estoque e quem comprou). */
export type StoreBuyer = {
  userId: string | null; name: string; handle: string; email: string; avatar: string | null;
  size: string; qty: number; paidCents: number; orderCode: string; delivery: "" | "pickup" | "ship"; at: string;
};
export type ProductSales = {
  productId: string; name: string; category: string; sold: number; revenueCents: number; buyers: number;
  stock: number | null; bySize: Record<string, number>; lastSale: string | null; history: StoreBuyer[];
};
export type StoreAnalytics = { revenueCents: number; units: number; orders: number; buyers: number; products: ProductSales[] };

/** Admin: quem usou a hashtag do ranking, de onde veio e o que mais foi compartilhado. */
export type TopShared = { kind: "post" | "drop"; id: string; text: string; image: string | null; shares: number; people: number; waiting: number };
export type HashtagAnalytics = {
  hashtag: string; autoVerify: boolean; people: number; verified: number; waiting: number; started: number;
  verifiedMonth: number; peopleMonth: number; fromOfficialPost: number; fromDrop: number; fromFree: number;
  series: { day: string; value: number }[]; top: TopShared[];
};

/** Admin: quem lidera o ranking geral (clubSlug nulo) e o de cada fã clube. */
export type RankingFan = { userId: string; name: string; handle: string; avatar?: string | null; verified?: boolean };
export type PersonShare = {
  id: string; what: string; status: "started" | "claimed" | "verified";
  startedAt: string; verifiedAt: string | null; permalink: string;
  rankingPoints: number; spins: number; totalPoints: number; // pontos com casas decimais
};
export type PersonPost = {
  id: string; kind: string; club: string | null; text: string; hasImage: boolean; image: string | null;
  likes: number; comments: number; reposts: number; createdAt: string;
};
/** Admin: histórico de um fã (posts, compartilhamentos da hashtag e pontos de cada um). */
export type PersonHistory = {
  userId: string; name: string; handle: string; avatar: string | null; position: number | null;
  points: number; sharesConfirmed: number; pending: number; shares: PersonShare[]; posts: PersonPost[];
};
export type RankingPerson = { userId: string; position: number; name: string; handle: string; avatar?: string | null; verified?: boolean; shares: number; points: number };
export type RankingScope = {
  clubSlug: string | null; isMaster?: boolean; name: string; leader: RankingFan | null; top: RankingFan | null;
  people: RankingPerson[]; // os 10 primeiros, com o ajuste da administração
  ranked: number; // quantas pessoas já pontuam
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
  campaignId?: string;
  sponsorAvatar?: string | null; // foto de perfil do patrocinador
  views?: number; // visualizações desta compra
  clicks?: number;
  ctr?: number; // cliques / visualizações, em %
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
  viewPriceMilli?: number | null;
  clickPriceMilli?: number | null;
  estimatedTotalCents: number | null; // o que a campanha já consumiu (views e cliques até hoje pelo preço da vitrine)
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

/** Um dia de visualizações e cliques de anúncio. */
export type AdsPoint = { day: string; views: number; clicks: number };

export type AdsCampaignStats = {
  id: string;
  title: string;
  artist?: string | null; // cantor da vitrine (visão geral da plataforma)
  artistSlug?: string | null;
  slotName: string;
  where: string;
  fanClub: string | null;
  text?: string;
  cta?: string;
  url?: string;
  artUrl?: string | null; // banner do anúncio
  videoUrl?: string | null;
  status: "live" | "scheduled" | "ended";
  start: string | null;
  end: string | null;
  views: number;
  clicks: number;
  ctr: number;
  spentCents?: number;
  goalViews: number;
  goalClicks: number;
  series: AdsPoint[];
};

/** GET /artists/{slug}/ads-analytics: desempenho dos anúncios por patrocinador (admin do ambiente). */
export type AdsAnalytics = {
  days: number;
  views: number;
  clicks: number;
  ctr: number;
  spentCents?: number;
  series: AdsPoint[];
  sponsors: { name: string; email?: string; avatar?: string | null; views: number; clicks: number; ctr: number; campaigns: AdsCampaignStats[]; spentCents?: number }[];
};
