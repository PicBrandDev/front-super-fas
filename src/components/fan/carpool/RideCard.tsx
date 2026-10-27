"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { bookSeats, bookingAction, cancelRide } from "@/app/actions/carpool";
import { PersonAvatar } from "@/components/fan/PersonAvatar";
import { formatBRL } from "@/lib/format";
import type { CarpoolBooking, Ride } from "@/lib/types";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const PAY: Record<string, string> = { pix: "Pix", cartao: "Cartão" };

const STATUS: Record<CarpoolBooking["status"], string> = {
  reserved: "Reservado, falta pagar",
  paid: "Pago, valor retido até a viagem",
  completed: "Viagem concluída",
  cancelled: "Cancelado",
  refunded: "Devolvido",
};

/**
 * Uma viagem. Quem não é o motorista reserva vagas, paga (o valor fica retido) e confirma quando a viagem acontece;
 * o motorista vê os passageiros e pode cancelar. O pagamento é uma simulação enquanto não há gateway.
 */
export function RideCard({ artist, base, ride }: { artist: string; base: string; ride: Ride }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const mb = ride.myBooking;
  const [now] = useState(() => Date.now());
  const departed = new Date(ride.departAt).getTime() <= now;

  const run = (call: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      const res = await call();
      if (!res.ok) return setError(res.error ?? "Não deu certo.");
      setError("");
      router.refresh();
    });

  return (
    <article className="flex flex-col gap-3 border border-line bg-surface p-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <strong className="text-[17px] leading-6">
            {ride.originCity} → {ride.city}
          </strong>
          <span className="mono">{when(ride.departAt)}</span>
          <span className="mt-1 text-[14px] leading-5 text-fg-muted">
            <b className="text-fg">Saída:</b> {ride.meetingPoint}
          </span>
          <span className="text-[14px] leading-5 text-fg-muted">
            <b className="text-fg">Chegada:</b> {[ride.venue, ride.address].filter(Boolean).join(", ") || ride.city}
          </span>
        </div>
        <div className="flex flex-none flex-col items-end">
          <span className="num text-[20px] font-black leading-6">{formatBRL(ride.priceCents)}</span>
          <span className="mono">por vaga</span>
        </div>
      </header>

      <div className="flex items-center gap-3">
        <PersonAvatar src={ride.driver.avatar} name={ride.driver.name} />
        <span className="flex min-w-0 flex-1 flex-col leading-5">
          <Link href={`${base}/fas/${encodeURIComponent(ride.driver.id)}`} className="text-[15px] font-bold text-fg no-underline hover:underline">
            {ride.driver.name}
            {ride.mine ? " (você)" : ""}
          </Link>
          <span className="text-[13px] text-fg-muted">{[ride.car, ride.status === "cancelled" ? "Viagem cancelada" : `${ride.seatsLeft} de ${ride.seatsTotal} vagas livres`].filter(Boolean).join(" · ")}</span>
        </span>
      </div>
      {ride.notes && <p className="m-0 text-[14px] leading-5 text-fg-muted">{ride.notes}</p>}

      {error && (
        <p className="err m-0" role="alert">
          {error}
        </p>
      )}

      {ride.mine ? (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <span className="mono">Passageiros</span>
          {ride.passengers.length === 0 ? (
            <span className="text-[14px] text-fg-muted">Ninguém reservou ainda.</span>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {ride.passengers.map((p) => (
                <li key={p.id} className="flex items-center gap-3 border border-line bg-raised p-3">
                  <PersonAvatar src={p.passenger?.avatar ?? null} name={p.passenger?.name ?? ""} size={48} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <strong className="text-[16px]">{p.passenger?.name}</strong>
                    <span className="text-[14px] text-fg-muted">
                      {p.seats} {p.seats === 1 ? "vaga" : "vagas"} · {formatBRL(p.amountCents)}
                      {p.paymentMethod ? ` · ${PAY[p.paymentMethod]}` : ""}
                    </span>
                    <span className="mono">{STATUS[p.status]}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {ride.status === "open" && (
            <button type="button" className="btn btn-outline btn-sm self-start" disabled={pending} onClick={() => run(() => cancelRide(artist, ride.id))}>
              Cancelar viagem (devolve o valor aos passageiros)
            </button>
          )}
        </div>
      ) : mb ? (
        <div className="flex flex-col gap-2 border-t border-line pt-3">
          <span className="mono">
            {mb.seats} {mb.seats === 1 ? "vaga" : "vagas"} · {formatBRL(mb.amountCents)}{mb.paymentMethod ? ` · ${PAY[mb.paymentMethod]}` : ""} · {STATUS[mb.status]}
          </span>
          <div className="flex flex-wrap gap-2">
            {mb.status === "reserved" && (
              <>
                <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => bookingAction(artist, mb.id, "pay", "pix"))}>
                  Pagar {formatBRL(mb.amountCents)} no Pix
                </button>
                <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={() => run(() => bookingAction(artist, mb.id, "pay", "cartao"))}>
                  Pagar no cartão
                </button>
              </>
            )}
            {mb.status === "paid" && departed && (
              <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => bookingAction(artist, mb.id, "confirm"))}>
                Confirmar que a viagem aconteceu
              </button>
            )}
            {(mb.status === "reserved" || mb.status === "paid") && !departed && (
              <button type="button" className="btn btn-outline btn-sm" disabled={pending} onClick={() => run(() => bookingAction(artist, mb.id, "cancel"))}>
                {mb.status === "paid" ? "Cancelar e receber de volta" : "Cancelar reserva"}
              </button>
            )}
          </div>
        </div>
      ) : (
        ride.status === "open" &&
        ride.seatsLeft > 0 &&
        !departed && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={() => run(() => bookSeats(artist, ride.id, 1))}>
              Reservar 1 vaga · {formatBRL(ride.priceCents)}
            </button>
          </div>
        )
      )}
    </article>
  );
}
