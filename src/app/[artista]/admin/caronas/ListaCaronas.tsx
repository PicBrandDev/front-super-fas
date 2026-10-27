"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { carpoolSupport } from "@/app/actions/carpool";
import { PersonAvatar } from "@/components/fan/PersonAvatar";
import { formatBRL } from "@/lib/format";
import type { CarpoolAdmin, CarpoolBooking } from "@/lib/types";

type Row = CarpoolAdmin["items"][number];

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const PAY: Record<string, string> = { pix: "Pix", cartao: "Cartão" };
const STATUS: Record<CarpoolBooking["status"], string> = {
  reserved: "Reservado, falta pagar",
  paid: "Pago, valor retido",
  completed: "Viagem concluída, valor liberado",
  cancelled: "Cancelado",
  refunded: "Pago e devolvido",
};

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-adm-mono text-xs font-semibold text-adm-muted">{label}</dt>
      <dd className="m-0 break-words text-[15px]">{children}</dd>
    </div>
  );
}

function Passageiro({ artist, booking }: { artist: string; booking: CarpoolBooking }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const act = (a: "refund" | "release") =>
    start(async () => {
      const res = await carpoolSupport(artist, booking.id, a);
      if (!res.ok) return setError(res.error);
      setError("");
      router.refresh();
    });
  const p = booking.passenger;
  return (
    <li className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white p-3">
      <div className="flex items-center gap-3">
        <PersonAvatar src={p?.avatar ?? null} name={p?.name ?? ""} size={48} />
        <span className="flex min-w-0 flex-1 flex-col leading-5">
          <strong className="text-[16px]">{p?.name}</strong>
          <span className="text-[13px] text-adm-muted">{p?.handle}</span>
        </span>
        <strong className="flex-none">{formatBRL(booking.amountCents)}</strong>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-adm-muted">
        <span>
          {booking.seats} {booking.seats === 1 ? "vaga" : "vagas"}
          {booking.paymentMethod ? ` · ${PAY[booking.paymentMethod]}` : ""} · {STATUS[booking.status]}
        </span>
        {booking.status === "paid" && (
          <span className="flex gap-2">
            <button type="button" disabled={pending} onClick={() => act("refund")} className="cursor-pointer rounded-lg border border-adm-line px-3 py-1.5 text-[13px] font-semibold text-adm-ink">
              Devolver
            </button>
            <button type="button" disabled={pending} onClick={() => act("release")} className="cursor-pointer rounded-lg border border-adm-line px-3 py-1.5 text-[13px] font-semibold text-adm-ink">
              Liberar ao motorista
            </button>
          </span>
        )}
      </div>
      {error && (
        <span role="alert" className="text-[13px] text-red-700">
          {error}
        </span>
      )}
    </li>
  );
}

function Detalhe({ artist, row, onClose }: { artist: string; row: Row; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  const { ride } = row;
  return (
    <dialog
      ref={ref}
      aria-labelledby="carona-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90vh] w-[min(760px,94vw)] overflow-y-auto rounded-2xl border border-adm-line bg-adm-bg p-0 text-adm-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-start gap-3">
          <PersonAvatar src={ride.driver.avatar} name={ride.driver.name} size={56} />
          <div className="min-w-0 flex-1">
            <h2 id="carona-title" className="m-0 font-display text-2xl font-black leading-7">
              {ride.originCity} → {ride.city}
            </h2>
            <span className="text-[14px] text-adm-muted">
              Oferecida por {ride.driver.name} {ride.driver.handle && `(${ride.driver.handle})`}
            </span>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-sm font-semibold text-adm-ink">
            Fechar
          </button>
        </div>

        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          <Info label="Saída">{ride.meetingPoint}</Info>
          <Info label="Chegada (show)">{[ride.venue, ride.address].filter(Boolean).join(", ") || ride.city}</Info>
          <Info label="Dia e hora da saída">{when(ride.departAt)}</Info>
          <Info label="Situação">{ride.status === "cancelled" ? "Viagem cancelada" : "Aberta"}</Info>
          <Info label="Preço por vaga">{formatBRL(ride.priceCents)}</Info>
          <Info label="Vagas">
            {ride.seatsTotal - ride.seatsLeft} ocupadas de {ride.seatsTotal} ({ride.seatsLeft} livres)
          </Info>
          <Info label="Carro">{ride.car || "Não informado"}</Info>
          <Info label="Observações">{ride.notes || "Nenhuma"}</Info>
          <Info label="Valores">
            Retido {formatBRL(row.heldCents)} · liberado {formatBRL(row.releasedCents)} · devolvido {formatBRL(row.refundedCents)}
          </Info>
        </dl>

        <section className="flex flex-col gap-2" aria-label="Passageiros">
          <h3 className="m-0 text-lg font-bold">Quem reservou ({ride.passengers.length})</h3>
          {ride.passengers.length === 0 ? (
            <p className="m-0 text-[14px] text-adm-muted">Ninguém reservou esta carona ainda.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {ride.passengers.map((p) => (
                <Passageiro key={p.id} artist={artist} booking={p} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </dialog>
  );
}

/** Todas as caronas oferecidas, com a foto de quem oferece; clicar abre os dados da carona e quem reservou. */
export function ListaCaronas({ artist, items }: { artist: string; items: Row[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.ride.id === openId);
  return (
    <>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map(({ ride }) => (
          <li key={ride.id}>
            <button
              type="button"
              onClick={() => setOpenId(ride.id)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-adm-line bg-white p-3 text-left text-adm-ink hover:border-adm-ink"
            >
              <PersonAvatar src={ride.driver.avatar} name={ride.driver.name} size={48} />
              <span className="flex min-w-0 flex-1 flex-col leading-5">
                <strong className="text-[16px]">{ride.driver.name}</strong>
                <span className="text-[14px]">
                  {ride.originCity} → {ride.city} · {when(ride.departAt)}
                </span>
                <span className="text-[13px] text-adm-muted">
                  {formatBRL(ride.priceCents)}/vaga · {ride.seatsTotal - ride.seatsLeft}/{ride.seatsTotal} vagas · {ride.passengers.length} {ride.passengers.length === 1 ? "reserva" : "reservas"}
                  {ride.status === "cancelled" ? " · cancelada" : ""}
                </span>
              </span>
              <span className="flex-none text-[13px] font-semibold text-adm-muted">Ver →</span>
            </button>
          </li>
        ))}
      </ul>
      {open && <Detalhe key={open.ride.id} artist={artist} row={open} onClose={() => setOpenId(null)} />}
    </>
  );
}
