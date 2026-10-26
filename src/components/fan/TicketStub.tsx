"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { isPastEvent } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import { shortRef, stampLabel, stampTone, type Order } from "@/lib/resale";
import type { MyTicket } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import { Ticket } from "./resale/Ticket";

/**
 * Ingresso que o fã comprou (aba Meus ingressos da Agenda), na tela como ingresso de verdade:
 * a face do show, o titular, a opção comprada, o número da compra e, no canhoto, o preço, o que inclui e o Photo Finder.
 */
export function TicketStub({ ticket }: { ticket: MyTicket }) {
  const { base, name: artistName, viewer } = useArtist();
  const e = ticket.event;
  const past = isPastEvent(e);

  return (
    <Ticket
      title={`Ingresso ${ticket.label} · ${e.city}`}
      show={{ id: e.id, city: e.city, venue: e.venue, date: e.date, time: e.time }}
      top={`${artistName} · ${ticket.agencyName}`}
      holder={viewer.name}
      ticketLabel={ticket.label}
      qty={1}
      refLabel="Compra Nº"
      refValue={shortRef(ticket.id)}
      proof={[{ text: `Comprado em ${ticket.agencyName} em ${ticket.bought}.`, ok: true }]}
      stamp={past ? { label: "Encerrado", tone: "spent" } : { label: "Garantido", tone: "amber" }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono">{ticket.packageName || "Ingresso"}</span>
        <strong className="num font-display text-[28px] font-black leading-8">{formatBRL(ticket.priceCents)}</strong>
      </div>
      {(ticket.includesTransfer || ticket.includesSeal || ticket.includesPhotoFinder) && (
        <span className="flex flex-wrap gap-2">
          {ticket.includesTransfer && <span className="tag tag-key">Com transfer</span>}
          {ticket.includesSeal && (
            <span className="tag tag-key">
              <Icon name="star" size={11} />
              Selo no app
            </span>
          )}
          {ticket.includesPhotoFinder && (
            <span className="tag">
              <Icon name="camera" size={11} />
              Photo Finder incluso
            </span>
          )}
        </span>
      )}
      <span className="flex flex-wrap items-center gap-3">
        {past ? (
          <Link href={`${base}/photo-finder?evento=${e.id}`} className="btn btn-primary btn-sm">
            <Icon name="camera" size={16} />
            Photo Finder
          </Link>
        ) : (
          <button type="button" className="btn btn-outline btn-sm" disabled aria-describedby={`pf-${ticket.id}`}>
            <Icon name="camera" size={16} />
            Photo Finder
          </button>
        )}
        {!past && (
          <span id={`pf-${ticket.id}`} className="mono">
            Abre depois do show
          </span>
        )}
        <Link href={`${base}/eventos/${e.id}`} className="go ml-auto">
          Ver show <Icon name="arrow" size={16} />
        </Link>
      </span>
    </Ticket>
  );
}

/** Ingresso comprado na revenda (transferido ou confirmado), ao lado dos outros em Meus ingressos. */
export function ResaleTicketStub({ order }: { order: Order }) {
  const { base, name: artistName, viewer } = useArtist();
  return (
    <Ticket
      title={`Ingresso ${order.ticketLabel} · ${order.eventCity}, da revenda`}
      show={{ id: order.eventId, city: order.eventCity, venue: order.eventVenue, date: order.eventDate }}
      top={`${artistName} · Revenda entre fãs`}
      holder={viewer.name}
      ticketLabel={order.ticketLabel}
      qty={order.qty}
      refLabel="Pedido Nº"
      refValue={shortRef(order.id)}
      proof={[{ text: order.status === "completed" ? "Você confirmou que recebeu na ticketeira." : "Transferido pelo vendedor. Confira na ticketeira e confirme.", ok: order.status === "completed" }]}
      stamp={{ label: stampLabel[order.status], tone: stampTone[order.status] }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono">Você pagou</span>
        <strong className="num font-display text-[28px] font-black leading-8">{formatBRL(order.grossCents)}</strong>
      </div>
      <Link href={`${base}/revenda/pedidos/${order.id}`} className={order.canConfirm ? "btn btn-primary btn-block" : "go"}>
        {order.canConfirm ? "Confirmar recebimento" : "Ver pedido"}
        {!order.canConfirm && <Icon name="arrow" size={16} />}
      </Link>
    </Ticket>
  );
}
