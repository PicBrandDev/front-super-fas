/**
 * Dados de exemplo da revenda (front sem API_URL). Tudo marcado "Exemplo" nas telas.
 * Prazos relativos a agora para a tela do pedido mostrar contagem e horários vivos.
 */
import type { Eligibility, Identity, Listing, MyListing, Order, ResaleEvent, ResaleEventDetail, Seller, SellerReview } from "./resale";

const inMin = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

export const events: ResaleEvent[] = [
  { id: "sp-07-nov", date: "2026-11-07", city: "São Paulo", venue: "[Local do evento]", time: "23h", listingsCount: 4, fromPriceCents: 18000 },
  { id: "rj-13-nov", date: "2026-11-13", city: "Rio de Janeiro", venue: "[Local do evento]", time: "22h", listingsCount: 2, fromPriceCents: 21000 },
];

const ticketTypes = [
  { id: "pista", label: "Pista", description: "Área geral em frente ao palco", faceCents: 20000, listingsCount: 3 },
  { id: "vip", label: "Pista VIP", description: "Área próxima ao palco com bar exclusivo", faceCents: 38000, listingsCount: 1 },
];

export const eventDetail = (id: string): ResaleEventDetail | null => {
  const event = events.find((e) => e.id === id);
  return event ? { event, ticketTypes } : null;
};

const sellers: Seller[] = [
  {
    userId: "u-ana",
    handle: "@ana.lopes",
    displayName: "Ana L.",
    avatar: null,
    memberSince: "03/02/2026",
    completedSales: 12,
    avgRating: 4.8,
    ratingCount: 9,
    clubs: [{ name: "Fã clube oficial", slug: "oficial", position: "member" }, { name: "Fã Clube Vintage SP", slug: "fa-clube-sp", position: "helper" }],
    isMember: true,
    identityLevel: "declared",
    identityVerified: false,
  },
  {
    userId: "u-caio",
    handle: "@caio.r",
    displayName: "Caio R.",
    avatar: null,
    memberSince: "19/08/2026",
    completedSales: 0,
    avgRating: null,
    ratingCount: 0,
    clubs: [{ name: "Fã clube oficial", slug: "oficial", position: "member" }],
    isMember: false,
    identityLevel: "declared",
    identityVerified: false,
  },
];

export const listings: Listing[] = [
  { id: "l1", eventId: "sp-07-nov", ticketId: "pista", ticketLabel: "Pista", faceCents: 20000, qtyTotal: 3, qtyAvailable: 2, unitPriceCents: 18000, createdAt: "24/10/2026", seller: sellers[0] },
  { id: "l2", eventId: "sp-07-nov", ticketId: "pista", ticketLabel: "Pista", faceCents: 20000, qtyTotal: 1, qtyAvailable: 1, unitPriceCents: 20000, createdAt: "25/10/2026", seller: sellers[1] },
  { id: "l3", eventId: "sp-07-nov", ticketId: "vip", ticketLabel: "Pista VIP", faceCents: 38000, qtyTotal: 2, qtyAvailable: 2, unitPriceCents: 35000, createdAt: "26/10/2026", seller: sellers[0] },
  { id: "l4", eventId: "rj-13-nov", ticketId: "pista", ticketLabel: "Pista", faceCents: 22000, qtyTotal: 2, qtyAvailable: 2, unitPriceCents: 21000, createdAt: "26/10/2026", seller: sellers[1] },
];

export const sellerById = (id: string) => sellers.find((s) => s.userId === id) ?? null;

export const reviews: SellerReview[] = [
  { id: "r1", rating: 5, comment: "Transferiu em 10 minutos, tudo certo na Sympla.", createdAt: "12/10/2026", buyerName: "Bruno M." },
  { id: "r2", rating: 4, comment: "Demorou um pouco, mas avisou e transferiu.", createdAt: "02/09/2026", buyerName: "Júlia P." },
];

const baseOrder = {
  listingId: "l1",
  eventId: "sp-07-nov",
  eventCity: "São Paulo",
  eventDate: "2026-11-07",
  eventVenue: "[Local do evento]",
  ticketLabel: "Pista",
  qty: 2,
  unitPriceCents: 18000,
  grossCents: 36000,
  feeCents: 3600,
  sellerNetCents: 32400,
  reservedUntil: null,
  paidAt: null,
  transferDeadline: null,
  transferredAt: null,
  confirmDeadline: null,
  closedAt: null,
  closeReason: "",
  counterparty: sellers[0],
  buyerHandle: null,
  buyerName: null,
  dispute: null,
  reviewed: false,
  canPay: false,
  canCancel: false,
  canMarkTransferred: false,
  canConfirm: false,
  canDispute: false,
  canReplyDispute: false,
  canReview: false,
  payment: { provider: "fake" },
  createdAt: inMin(-30),
  transferTo: "marina.costa@exemplo.com",
} satisfies Omit<Order, "id" | "status" | "role">;

export const orders = (): Order[] => [
  { ...baseOrder, id: "o-reservado-7a21", status: "reserved", role: "buyer", reservedUntil: inMin(14), canPay: true, canCancel: true },
  {
    ...baseOrder,
    id: "o-transferido-3c90",
    status: "transferred",
    role: "buyer",
    qty: 1,
    grossCents: 18000,
    feeCents: 1800,
    sellerNetCents: 16200,
    paidAt: inMin(-300),
    transferDeadline: inMin(1140),
    transferredAt: inMin(-20),
    confirmDeadline: inMin(2860),
    sellerPhone: "11912345678",
    canConfirm: true,
    canDispute: true,
  },
  {
    ...baseOrder,
    id: "o-concluido-5e14",
    status: "completed",
    role: "buyer",
    listingId: "l4",
    eventId: "rj-13-nov",
    eventCity: "Rio de Janeiro",
    eventDate: "2026-11-13",
    qty: 1,
    unitPriceCents: 21000,
    grossCents: 21000,
    feeCents: 2100,
    sellerNetCents: 18900,
    counterparty: sellers[1],
    paidAt: inMin(-4000),
    transferredAt: inMin(-3800),
    closedAt: inMin(-3700),
    closeReason: "buyer_confirmed",
    sellerPhone: "21998765432",
    canReview: true,
  },
  {
    ...baseOrder,
    id: "o-vendendo-9b02",
    status: "awaiting_transfer",
    role: "seller",
    listingId: "l3",
    ticketLabel: "Pista VIP",
    qty: 1,
    unitPriceCents: 35000,
    grossCents: 35000,
    feeCents: 3500,
    sellerNetCents: 31500,
    counterparty: null,
    buyerHandle: "@leo.vintage",
    buyerName: "Léo S.",
    paidAt: inMin(-45),
    transferDeadline: inMin(1395),
    canMarkTransferred: true,
  },
];

export const myListings: MyListing[] = [
  { id: "l3", eventId: "sp-07-nov", eventCity: "São Paulo", eventDate: "2026-11-07", ticketLabel: "Pista VIP", faceCents: 38000, qtyTotal: 2, qtyAvailable: 1, unitPriceCents: 35000, status: "live", reviewReason: "", attempts: 1, canResubmit: false, canCancel: false, activeOrders: 1, createdAt: "26/10/2026" },
  { id: "l9", eventId: "rj-13-nov", eventCity: "Rio de Janeiro", eventDate: "2026-11-13", ticketLabel: "Pista", faceCents: 22000, qtyTotal: 1, qtyAvailable: 1, unitPriceCents: 22000, status: "rejected", reviewReason: "A prova não mostra o código do ingresso. Envie o print da tela do ingresso na ticketeira.", attempts: 1, canResubmit: true, canCancel: true, activeOrders: 0, createdAt: "25/10/2026" },
];

export const identity: Identity = { hasCpf: true, hasPhone: true, cpfMasked: "***.***.***-25", phoneMasked: "(**) *****-1234", level: "declared" };
export const eligibility: Eligibility = { canBuy: true, canSell: true, missing: [] };
