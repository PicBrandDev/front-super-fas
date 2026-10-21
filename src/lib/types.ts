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

/** Fã clube dentro do ambiente de um cantor (até 10: 1 master + 9). */
export type FanClub = {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  isMaster: boolean;
  status: FanClubStatus;
  members: number;
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
  author: { name: string; handle: string; initial: string; official?: boolean };
  timeLabel: string;
  text: string;
  hasImage?: boolean;
  image?: MediaImage | null; // foto do post (a API ainda não manda; ver lib/media.ts)
  quote?: string; // repost de um Drop News
  club?: { slug: string; name: string } | null; // fã clube do post (vazio = oficial)
  url?: string | null; // link do post do Instagram
  likes: number;
  comments: number;
  reposts: number;
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

export type Prize = { id: string; label: string; isRetry?: boolean };

export type ProductCategory = "roupas" | "acessorios" | "musica";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  priceLabel: string;
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
