"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import type { MyTicket } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import s from "./ShowStub.module.css";

/**
 * Ingresso que o fã comprou (aba Meus ingressos da Agenda): o dia do show, a opção comprada com o preço,
 * o que ela inclui e o botão do Photo Finder, que abre depois do show.
 */
export function TicketStub({ ticket }: { ticket: MyTicket }) {
  const { base, name: artistName } = useArtist();
  const e = ticket.event;
  const past = isPastEvent(e);

  return (
    <article className={s.ev}>
      <span className={`${s.slab} ${past ? s.past : ""}`}>
        <span className={s.d} aria-hidden="true">
          {e.day}
        </span>
        <span className="sr-only">{`${e.weekday} ${e.day} de ${e.month}`}</span>
        <span className="mono" aria-hidden="true">
          {e.month}
        </span>
      </span>
      <span className={s.evb}>
        <span className={s.name}>{eventName(artistName, e)}</span>
        <span className={`mono ${s.where}`}>
          <Icon name="pin" size={13} />
          <span className="truncate">
            {e.city}
            {e.venue ? ` · ${e.venue}` : ""}
          </span>
        </span>
        <span className="flex items-baseline justify-between gap-3">
          <strong className="text-[17px] leading-6">{ticket.label}</strong>
          <strong className="num flex-none text-[17px]">{formatBRL(ticket.priceCents)}</strong>
        </span>
        <span className={s.tags}>
          {past ? <span className="tag tag-demo">Encerrado</span> : <span className="tag">Ingresso garantido</span>}
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
        <span className="mono">
          {ticket.agencyName} · comprado em {ticket.bought}
        </span>
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
          <Link href={`${base}/eventos/${e.id}`} className="go">
            Ver show <Icon name="arrow" size={16} />
          </Link>
        </span>
      </span>
    </article>
  );
}
