"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { isPastEvent } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import { shortRef } from "@/lib/resale";
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
