/**
 * Revenda de ingressos entre fãs (escrow): tipos da API, textos dos estados e formatação.
 * Sem "use client" de propósito: vale no servidor e no cliente.
 * Contrato: back-super-fas/docs/revenda-ingressos-frontend.md. Preço, taxa e prazos vêm prontos da API.
 */

export type IdentityLevel = "none" | "declared" | "verified";
export type Identity = { hasCpf: boolean; hasPhone: boolean; cpfMasked: string; phoneMasked: string; level: IdentityLevel };

export type MissingStep = "role" | "fandom" | "address" | "cpf" | "phone";
export type Eligibility = { canBuy: boolean; canSell: boolean; missing: MissingStep[] };

export type ClubPosition = { name: string; slug: string; position: "owner" | "helper" | "member" };

/** Cartão de confiança do vendedor: aparece sempre que um vendedor aparece. */
export type Seller = {
  userId: string;
  handle: string;
  displayName: string;
  avatar: string | null;
  memberSince: string;
  completedSales: number;
  avgRating: number | null;
  ratingCount: number;
  clubs: ClubPosition[];
  isMember: boolean;
  identityLevel: IdentityLevel;
  identityVerified: boolean;
};

export type SellerReview = { id: string; rating: number; comment: string; createdAt: string; buyerName: string };

export type ResaleEvent = {
  id: string;
  date: string; // AAAA-MM-DD
  city: string;
  venue: string;
  time: string;
  listingsCount: number;
  fromPriceCents: number | null;
};

export type TicketType = { id: string; label: string; description: string; faceCents: number; listingsCount: number };
export type ResaleEventDetail = { event: ResaleEvent; ticketTypes: TicketType[] };

export type Listing = {
  id: string;
  eventId: string;
  ticketId: string | null;
  ticketLabel: string;
  faceCents: number;
  qtyTotal: number;
  qtyAvailable: number;
  unitPriceCents: number;
  createdAt: string;
  seller: Seller;
};
export type ListingsPage = { items: Listing[]; page: number; hasMore: boolean };

export type ListingStatus = "pending_review" | "live" | "rejected" | "cancelled" | "closed";
export type MyListing = {
  id: string;
  eventId: string;
  eventCity: string;
  eventDate: string;
  ticketLabel: string;
  faceCents: number;
  qtyTotal: number;
  qtyAvailable: number;
  unitPriceCents: number;
  status: ListingStatus;
  reviewReason: string;
  attempts: number;
  canResubmit: boolean;
  canCancel: boolean;
  activeOrders: number;
  createdAt: string;
};

export type DisputeReason = "not_received" | "invalid_ticket" | "wrong_type" | "other";
export type Dispute = {
  id: string;
  orderId: string;
  status: string;
  reasonCode: DisputeReason;
  description: string;
  sellerReply: string;
  resolution: string;
  decisionNote: string;
  createdAt: string;
};

export type OrderStatus =
  | "reserved"
  | "awaiting_transfer"
  | "transferred"
  | "completed"
  | "disputed"
  | "refunded"
  | "expired"
  | "cancelled";

export type Order = {
  id: string;
  status: OrderStatus;
  role: "buyer" | "seller";
  listingId: string;
  eventId: string;
  eventCity: string;
  eventDate: string;
  eventVenue: string;
  ticketLabel: string;
  qty: number;
  unitPriceCents: number;
  grossCents: number;
  feeCents: number;
  sellerNetCents: number;
  reservedUntil: string | null;
  paidAt: string | null;
  transferDeadline: string | null;
  transferredAt: string | null;
  confirmDeadline: string | null;
  closedAt: string | null;
  closeReason: string;
  counterparty: Seller | null;
  buyerHandle: string | null;
  buyerName: string | null;
  dispute: Dispute | null;
  reviewed: boolean;
  canPay: boolean;
  canCancel: boolean;
  canMarkTransferred: boolean;
  canConfirm: boolean;
  canDispute: boolean;
  canReplyDispute: boolean;
  canReview: boolean;
  payment: { provider?: string } | null;
  /** Quando a reserva foi feita. */
  createdAt?: string | null;
  /** Conta do comprador na ticketeira (para onde transferir): o comprador vê sempre; o vendedor depois do pagamento. */
  transferTo?: string | null;
  /** WhatsApp do vendedor (DDD + número, sem +55): só o comprador recebe, e só depois de pagar. */
  sellerPhone?: string | null;
};

/* ---------------------------------------------------------------- textos */

export const listingStatusLabel: Record<ListingStatus, string> = {
  pending_review: "Em análise",
  live: "No ar",
  rejected: "Rejeitado",
  cancelled: "Cancelado",
  closed: "Encerrado",
};

/** O carimbo do ingresso: uma palavra por etapa. */
export const stampLabel: Record<OrderStatus, string> = {
  reserved: "Reservado",
  awaiting_transfer: "Pago",
  transferred: "Transferido",
  completed: "Confirmado",
  disputed: "Em disputa",
  refunded: "Reembolsado",
  expired: "Expirado",
  cancelled: "Cancelado",
};

export type StampTone = "plain" | "amber" | "sun" | "signal" | "done" | "spent";
export const stampTone: Record<OrderStatus, StampTone> = {
  reserved: "plain",
  awaiting_transfer: "amber",
  transferred: "sun",
  completed: "done",
  disputed: "signal",
  refunded: "spent",
  expired: "spent",
  cancelled: "spent",
};

/** Frase do estado para quem está vendo (comprador ou vendedor). Os prazos entram na tela à parte. */
export function statusLine(o: Pick<Order, "status" | "role">): string {
  const buyer = o.role === "buyer";
  switch (o.status) {
    case "reserved":
      return buyer ? "Reservado para você. Pague antes do tempo acabar." : "Reservado por um comprador. Aguardando o pagamento.";
    case "awaiting_transfer":
      return buyer ? "Pago. O dinheiro está retido até você receber o ingresso." : "Pago pelo comprador. Transfira o ingresso pela ticketeira.";
    case "transferred":
      return buyer ? "O vendedor avisou que transferiu. Confira na ticketeira e confirme." : "Você avisou que transferiu. Aguardando o comprador confirmar.";
    case "completed":
      return buyer ? "Concluído. O ingresso é seu." : "Concluído. O valor foi liberado para você.";
    case "disputed":
      return buyer ? "Em disputa. A equipe vai decidir." : "Em disputa. Responda ao comprador.";
    case "refunded":
      return buyer ? "Reembolsado. O valor volta para você." : "Reembolsado ao comprador.";
    case "expired":
      return "A reserva expirou e o ingresso voltou para o anúncio.";
    case "cancelled":
      return "Pedido cancelado.";
  }
}

export const closeReasonLabel: Record<string, string> = {
  reservation_expired: "A reserva passou de 15 minutos sem pagamento.",
  buyer_cancelled: "O comprador cancelou a reserva.",
  buyer_confirmed: "O comprador confirmou que recebeu.",
  auto_release: "Liberado automaticamente após 48h sem resposta do comprador.",
  seller_no_transfer: "O vendedor não transferiu no prazo: reembolso automático.",
  dispute_refund: "A equipe decidiu a disputa a favor do comprador: reembolso.",
  dispute_release: "A equipe decidiu a disputa a favor do vendedor: valor liberado.",
  admin_refund: "Reembolsado pela equipe.",
  late_payment: "O pagamento chegou depois do prazo da reserva e foi devolvido.",
};

export const disputeReasonLabel: Record<DisputeReason, string> = {
  not_received: "Não recebi o ingresso",
  invalid_ticket: "O ingresso não é válido",
  wrong_type: "Recebi outro tipo de ingresso",
  other: "Outro motivo",
};

/** Para onde levar quem precisa completar o cadastro (`voltar` traz de volta para a tela da revenda). */
export function completeHref(base: string, missing: MissingStep[], back: string): string {
  const q = `?voltar=${encodeURIComponent(back)}`;
  if (missing.includes("address")) return `${base}/revenda/endereco${q}`;
  if (missing.includes("cpf") || missing.includes("phone")) return `${base}/revenda/identidade${q}`;
  return `${base}/perfil`;
}

export const missingLabel: Record<MissingStep, string> = {
  role: "Sua conta não pode usar a revenda.",
  fandom: "Entre no fã clube deste artista.",
  address: "Complete seu endereço no perfil.",
  cpf: "Informe seu CPF.",
  phone: "Informe seu telefone.",
};

/** O que falta para comprar (conta, fã clube, endereço). CPF e telefone só valem para vender. */
export const buyMissing = (e: Eligibility) => e.missing.filter((m) => m === "role" || m === "fandom" || m === "address");
export const sellOnlyMissing = (e: Eligibility) => e.missing.filter((m) => m === "cpf" || m === "phone");

export const positionLabel: Record<ClubPosition["position"], string> = { owner: "Dono", helper: "Ajudante", member: "Membro" };

/** Quem age agora e até quando, numa linha (carteira de pedidos). */
export function nextStep(o: Order): string | null {
  const buyer = o.role === "buyer";
  if (o.status === "reserved" && o.reservedUntil) return buyer ? `Pague até ${formatDeadline(o.reservedUntil)}` : "Aguardando o pagamento do comprador";
  if (o.status === "awaiting_transfer" && o.transferDeadline)
    return buyer ? `Vendedor transfere até ${formatDeadline(o.transferDeadline)}` : `Transfira até ${formatDeadline(o.transferDeadline)}`;
  if (o.status === "transferred" && o.confirmDeadline)
    return buyer ? `Confirme até ${formatDeadline(o.confirmDeadline)}` : `Comprador confirma até ${formatDeadline(o.confirmDeadline)}`;
  if (o.status === "disputed") return buyer ? "A equipe vai decidir" : "Responda ao comprador";
  return null;
}

/** "faltam 23h 41min", "faltam 12 min", "prazo encerrado". */
export function timeLeft(sec: number): string {
  if (sec <= 0) return "prazo encerrado";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h >= 24) return `faltam ${Math.floor(h / 24)}d ${h % 24}h`;
  if (h > 0) return `faltam ${h}h ${String(m).padStart(2, "0")}min`;
  return `faltam ${Math.max(1, m)} min`;
}

/** Pedido aberto (ainda tem algo a fazer) ou encerrado. */
export const isOpenOrder = (s: OrderStatus) => s === "reserved" || s === "awaiting_transfer" || s === "transferred" || s === "disputed";

/* ---------------------------------------------------------------- formatação */

const TZ = "America/Sao_Paulo";

/** "sáb., 12 set., 22:14" em horário de Brasília. */
export function formatDeadline(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "short" });
  const time = d.toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
  return `${day.replace(/\./g, "")} · ${time}`;
}

const WEEK = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTH = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

/** Data do show (AAAA-MM-DD) em partes para o ingresso: { weekday: "SÁB", day: "12", month: "SET", year: "2031" }. */
export function showDateParts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { weekday: WEEK[wd], day: String(d).padStart(2, "0"), month: MONTH[m - 1], year: String(y) };
}

/** Número curto e legível de um id ("8f3a…" → "8F3A-91C2"). */
export function shortRef(id: string): string {
  const clean = id.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const tail = clean.slice(-8).padStart(8, "0");
  return `${tail.slice(0, 4)}-${tail.slice(4)}`;
}

/** "★ 4,8 (9)" ou "Sem avaliações". */
export const ratingText = (s: Pick<Seller, "avgRating" | "ratingCount">) =>
  s.avgRating != null && s.ratingCount > 0
    ? `${s.avgRating.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} (${s.ratingCount})`
    : "Sem avaliações";

/** Campo de cor do ingresso de um show: fixo por evento, sempre um dos campos do tema do artista. */
export type TicketField = "amber" | "sun" | "lagoon-deep" | "poster-grey";
const FIELDS: TicketField[] = ["amber", "lagoon-deep", "sun", "poster-grey"];
export function ticketField(eventId: string): TicketField {
  let h = 0;
  for (const ch of eventId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return FIELDS[h % FIELDS.length];
}

/** Chave de idempotência para uma tentativa de compra (8 a 80 caracteres). */
export const newIdempotencyKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
