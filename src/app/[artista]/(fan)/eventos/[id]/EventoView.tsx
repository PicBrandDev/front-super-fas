"use client";

import Link from "next/link";
import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet, SheetOption } from "@/components/fan/Sheet";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel, statusTagClass } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import { INGRESSE_URL } from "@/lib/ingresse";
import { summarize, toggleAddon, type PackageChoice } from "@/lib/package-choice";
import type { EventPackage, ShowEvent } from "@/lib/types";
import { PackagePicker } from "@/components/fan/PackagePicker";
import { BrindeFlow } from "./BrindeFlow";
import s from "./EventoView.module.css";

export function EventoView({
  artistName,
  event,
  packages = [],
  demo,
}: {
  artistName: string;
  event: ShowEvent;
  packages?: EventPackage[];
  demo: boolean;
}) {
  const { base } = useArtist();
  const past = isPastEvent(event);
  const title = eventName(artistName, event);
  const photosHref = `${base}/photo-finder?evento=${event.id}`;
  // O ingresso é vendido só na Ingresse (abre em outra aba); no app o fã compra apenas as experiências extras.
  const ingresseUrl = event.ticketingUrl || INGRESSE_URL;

  const [buyOpen, setBuyOpen] = useState(false);
  const [brindeOpen, setBrindeOpen] = useState(false);
  // Experiências extras marcadas (de um pacote por vez).
  const [choice, setChoice] = useState<PackageChoice | null>(null);
  const hasExtras = packages.some((p) => p.addons.length > 0);
  const picked = summarize(packages, choice);

  return (
    <>
      <header className={s.hd}>
        <Link href={`${base}/agenda`} className="back">
          <Icon name="back" size={18} />
          Agenda
        </Link>
        {demo && <span className="tag tag-demo">Exemplo</span>}
      </header>

      <div className={`${s.ehero} ${past ? s.past : ""}`}>
        <div className={s.d} aria-hidden="true">
          {event.day}
        </div>
        <div className={s.r}>
          <span className={s.m}>{event.month}</span>
          <span className="mono">{event.city}</span>
          {past ? (
            <span className="tag tag-demo">Encerrado</span>
          ) : (
            <span className={statusTagClass[event.status]}>{statusLabel[event.status]}</span>
          )}
        </div>
      </div>

      <div className={s.etitle}>
        <h1>{title}</h1>
        <div className={`mono ${s.where}`}>
          <Icon name="pin" size={13} />
          <span>
            {event.city} · {event.venue} · {event.day} {event.month}
          </span>
        </div>
      </div>

      <dl className={s.info}>
        <dt className="mono">Portões</dt>
        <dd className="num">{event.doorsOpen}</dd>
        <dt className="mono">Classificação</dt>
        <dd>{event.ageRating}</dd>
        <dt className="mono">Endereço</dt>
        <dd>{event.address}</dd>
      </dl>

      {!past && (
        <section className={s.sect} aria-labelledby="ingresso-h">
          <h2 id="ingresso-h">Ingresso</h2>
          <p>O ingresso deste show é vendido só na Ingresse. Compre lá e volte aqui para somar as experiências extras.</p>
          <button type="button" className="btn btn-outline" onClick={() => setBuyOpen(true)}>
            Onde comprar
            <Icon name="arrow" size={16} />
          </button>
        </section>
      )}

      {!past && (
        <section className={s.sect} aria-labelledby="caronas-h">
          <h2 id="caronas-h">Caronas</h2>
          <p>Vai de carro? Ofereça vagas e divida o custo, ou reserve uma carona de outro fã.</p>
          <Link href={`${base}/eventos/${event.id}/caronas`} className="btn btn-outline">
            Ver caronas
            <Icon name="arrow" size={16} />
          </Link>
        </section>
      )}

      {!past && hasExtras && (
        <section id="extras" className={`${s.sect} scroll-mt-4`} aria-labelledby="extras-h">
          <h2 id="extras-h">Experiências extras</h2>
          <p>Some ao seu ingresso da Ingresse experiências das agências parceiras. Toda compra inclui o Photo Finder e vale um giro no PicKup.</p>
          <PackagePicker
            packages={packages}
            choice={choice}
            onToggleAddon={(id, key) => setChoice((c) => toggleAddon(c, id, key))}
            labelledBy="extras-h"
          />
        </section>
      )}

      {past && (
        <section className={s.sect} aria-labelledby="fotos-h">
          <h2 id="fotos-h">Fotos do evento</h2>
          <p>As fotos oficiais já estão na fanzone. Envie uma selfie e encontre as suas.</p>
          <Link href={photosHref} className="btn btn-outline">
            <Icon name="camera" size={18} />
            Encontrar minhas fotos
          </Link>
        </section>
      )}

      <div className={s.buybar}>
        {past ? (
          <>
            <span className="mono">Evento encerrado</span>
            <Link href={photosHref} className="btn btn-primary">
              Minhas fotos
            </Link>
          </>
        ) : (
          // Um botão só: o ingresso já tem o "Onde comprar" na tela, então a barra é das experiências.
          hasExtras && (
            <div className="flex w-full flex-col gap-2">
              {picked && <span className="num text-[14px] leading-5 text-fg">{picked.name}</span>}
              {picked ? (
                <button type="button" className="btn btn-primary btn-block whitespace-normal px-3 text-center" onClick={() => setBrindeOpen(true)}>
                  Comprar experiência · {formatBRL(picked.priceCents)}
                </button>
              ) : (
                <a href="#extras" className="btn btn-primary btn-block whitespace-normal px-3 text-center">
                  Escolher experiências
                </a>
              )}
            </div>
          )
        )}
      </div>

      <BrindeFlow
        open={brindeOpen && !!picked}
        onClose={() => setBrindeOpen(false)}
        event={{ id: event.id, title, city: event.city, day: event.day, month: event.month }}
        picked={picked}
        choice={choice}
        onRemoveAddon={(key) => setChoice((c) => (c ? toggleAddon(c, c.id, key) : c))}
      />

      <Sheet open={buyOpen} onClose={() => setBuyOpen(false)} title="Onde comprar">
        <p>O ingresso é vendido só na Ingresse, em outra aba. As experiências extras você compra aqui na fanzone.</p>
        <div className="opts">
          <SheetOption title={event.ticketingName || "Ingresse"} sub="Venda oficial de ingressos do show" href={ingresseUrl} />
        </div>
        <button type="button" className="btn btn-outline" data-close>
          Ficar na fanzone
        </button>
      </Sheet>
    </>
  );
}
