"use server";

import { revalidatePath } from "next/cache";
import { send, type ApiResult } from "@/lib/api";
import type { CarpoolBooking, Ride } from "@/lib/types";

/* Ações das caronas (fã e administração). A API confere as permissões; aqui só se valida o formato dos ids. */

const slugOk = (s: string) => /^[a-z0-9-]+$/.test(s);
const idOk = (s: string) => /^[A-Za-z0-9_-]+$/.test(s);
const bad = (error: string): ApiResult<never> => ({ ok: false, error, status: 400 });
const done = (slug: string) => revalidatePath(`/${slug}`, "layout");

export type RideForm = { originCity: string; meetingPoint: string; departAt: string; seats: number; priceCents: number; car: string; notes: string };

export async function offerRide(slug: string, eventId: string, form: RideForm): Promise<ApiResult<Ride>> {
  if (!slugOk(slug) || !idOk(eventId)) return bad("Pedido inválido.");
  const res = await send<Ride>("POST", `/artists/${slug}/carpool/events/${eventId}/rides`, form);
  if (res.ok) done(slug);
  return res;
}

export async function bookSeats(slug: string, rideId: string, seats: number): Promise<ApiResult<CarpoolBooking>> {
  if (!slugOk(slug) || !idOk(rideId) || !Number.isInteger(seats) || seats < 1) return bad("Pedido inválido.");
  const res = await send<CarpoolBooking>("POST", `/artists/${slug}/carpool/rides/${rideId}/bookings`, { seats });
  if (res.ok) done(slug);
  return res;
}

/** Ações sobre uma reserva: pagar (valor retido), confirmar a viagem, cancelar; e do motorista: cancelar a viagem. */
export async function bookingAction(slug: string, id: string, action: "pay" | "confirm" | "cancel"): Promise<ApiResult<CarpoolBooking>> {
  if (!slugOk(slug) || !idOk(id)) return bad("Pedido inválido.");
  const res = await send<CarpoolBooking>("POST", `/artists/${slug}/carpool/bookings/${id}/${action}`);
  if (res.ok) done(slug);
  return res;
}

export async function cancelRide(slug: string, rideId: string): Promise<ApiResult<Ride>> {
  if (!slugOk(slug) || !idOk(rideId)) return bad("Pedido inválido.");
  const res = await send<Ride>("POST", `/artists/${slug}/carpool/rides/${rideId}/cancel`);
  if (res.ok) done(slug);
  return res;
}

/** Suporte (administração): devolve ou libera o valor retido de uma reserva paga. */
export async function carpoolSupport(slug: string, bookingId: string, action: "refund" | "release"): Promise<ApiResult<CarpoolBooking>> {
  if (!slugOk(slug) || !idOk(bookingId)) return bad("Pedido inválido.");
  const res = await send<CarpoolBooking>("POST", `/artists/${slug}/manage/carpool/bookings/${bookingId}/${action}`);
  if (res.ok) done(slug);
  return res;
}
