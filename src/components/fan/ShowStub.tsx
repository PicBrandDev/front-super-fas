"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel, statusTagClass } from "@/lib/events";
import type { ShowEvent } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import s from "./ShowStub.module.css";

/**
 * Linha de evento da Agenda (e do Início): lâmina âmbar com o dia em serifa
 * e o mês em mono, nome em serifa, cidade · local, tags e "Ver evento →".
 * Evento passado: lâmina apagada e "Encontrar minhas fotos".
 */
export function ShowStub({
  event,
  href,
  name,
  demo = false,
}: {
  event: ShowEvent;
  href: string;
  /** Nome do evento; sem ele, "Artista em Cidade". */
  name?: string;
  /** Dados de exemplo (mock): mostra a tag "Exemplo". */
  demo?: boolean;
}) {
  const { name: artistName } = useArtist();
  const past = isPastEvent(event);
  const title = name ?? eventName(artistName, event);

  return (
    <Link href={href} className={s.ev}>
      <span className={`${s.slab} ${past ? s.past : ""}`}>
        <span className={s.d} aria-hidden="true">
          {event.day}
        </span>
        <span className="sr-only">{`${event.weekday} ${event.day} de ${event.month}`}</span>
        <span className="mono" aria-hidden="true">
          {event.month}
        </span>
      </span>
      <span className={s.evb}>
        <span className={s.name}>{title}</span>
        <span className={`mono ${s.where}`}>
          <Icon name="pin" size={13} />
          <span className="truncate">
            {event.city} · {event.venue}
          </span>
          {demo && <span className={`tag tag-demo ${s.demo}`}>Exemplo</span>}
        </span>
        <span className={s.tags}>
          {past ? (
            <span className="tag tag-demo">Encerrado</span>
          ) : (
            <span className={statusTagClass[event.status]}>{statusLabel[event.status]}</span>
          )}
          {event.giftsCount > 0 && (
            <span className="tag">
              <Icon name="gift" size={11} />
              Brinde antes e depois
            </span>
          )}
        </span>
        {past ? (
          <span className="btn btn-primary btn-sm" style={{ justifySelf: "start" }}>
            <Icon name="camera" size={16} />
            Photo Finder
          </span>
        ) : (
          <span className="go">
            Ver evento
            <Icon name="arrow" size={16} />
          </span>
        )}
      </span>
    </Link>
  );
}
