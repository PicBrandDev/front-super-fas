"use client";

import Link from "next/link";
import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet, SheetOption } from "@/components/fan/Sheet";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel, statusTagClass } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import { summarize, toggleExperience, type PackageChoice } from "@/lib/package-choice";
import type { EventPackage, ShowEvent, Vendor } from "@/lib/types";
import { PackagePicker } from "@/components/fan/PackagePicker";
import { BrindeFlow } from "./BrindeFlow";
import s from "./EventoView.module.css";

export function EventoView({
  artistName,
  event,
  vendors,
  packages = [],
  resale = null,
  demo,
}: {
  artistName: string;
  event: ShowEvent;
  vendors: Vendor[];
  packages?: EventPackage[];
  /** Revenda entre fãs aberta para este show (esgotado na ticketeira). */
  resale?: { listingsCount: number; fromPriceCents: number | null } | null;
  demo: boolean;
}) {
  const { base } = useArtist();
  const toast = useToast();
  const past = isPastEvent(event);
  const title = eventName(artistName, event);
  const photosHref = `${base}/photo-finder?evento=${event.id}`;
  const ticketing = event.ticketingUrl ? { name: event.ticketingName || "Ticketeira oficial", url: event.ticketingUrl } : null;

  const [buyOpen, setBuyOpen] = useState(false);
  const [brindeOpen, setBrindeOpen] = useState(false);
  // Experiências marcadas de um pacote de agência.
  const [choice, setChoice] = useState<PackageChoice | null>(null);
  const hasOptions = packages.length > 0;
  // O total é a soma das experiências marcadas (o ingresso é da ticketeira).
  const picked = summarize(packages, choice);
  const buyLabel = picked?.label ?? "";

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

      {!past && resale && (
        <section className={s.sect} aria-labelledby="revenda-h">
          <h2 id="revenda-h">Revenda entre fãs</h2>
          <p>
            Esgotou na ticketeira, mas tem fã vendendo:{" "}
            {resale.listingsCount === 1 ? "1 anúncio" : `${resale.listingsCount} anúncios`}
            {resale.fromPriceCents != null ? `, a partir de ${formatBRL(resale.fromPriceCents)}` : ""}. Pelo valor de face no máximo, com o pagamento retido até o ingresso chegar.
          </p>
          <Link href={`${base}/revenda/${event.id}`} className="btn btn-outline self-start">
            Ver revenda
            <Icon name="arrow" size={16} />
          </Link>
        </section>
      )}

      {!past && hasOptions && (
        <section className={s.sect} aria-labelledby="ingressos-h">
          <h2 id="ingressos-h">Experiências do show</h2>
          <p>O ingresso você compra na ticketeira. Aqui você escolhe as experiências dos pacotes das agências (transfer, jantar, camarim, hotel...) e toca em Comprar. Todos incluem o Photo Finder.</p>
          {packages.length > 0 && (
            <PackagePicker
              packages={packages}
              choice={choice}
              onToggleAddon={(id, key) => setChoice((c) => toggleExperience(c, id, key))}
              labelledBy="ingressos-h"
            />
          )}
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
          hasOptions ? (
            picked ? (
              <>
                <span className="mono">{buyLabel}</span>
                <button type="button" className="btn btn-primary" onClick={() => setBrindeOpen(true)}>
                  Comprar experiência
                </button>
              </>
            ) : (
              <span className="mono">Escolha as experiências</span>
            )
          ) : (
            <>
              <span className="mono">Venda nas agências parceiras</span>
              <button type="button" className="btn btn-primary" onClick={() => setBuyOpen(true)}>
                Comprar ingresso
              </button>
            </>
          )
        )}
      </div>

      <BrindeFlow
        open={brindeOpen && !!picked}
        onClose={() => setBrindeOpen(false)}
        event={{ id: event.id, title, city: event.city, day: event.day, month: event.month }}
        picked={picked}
        choice={choice}
        onRemoveAddon={(key) => setChoice((c) => (c ? toggleExperience(c, c.id, key) : c))}
      />

      <Sheet open={buyOpen} onClose={() => setBuyOpen(false)} title="Onde comprar">
        <p>A compra acontece no site do parceiro. A fanzone leva você até lá e guarda o seu brinde.</p>
        <div className="opts">
          {ticketing && <SheetOption title={ticketing.name} sub="Ticketeira oficial do show" href={ticketing.url} />}
          {packages.map((p) => (
            <SheetOption
              key={p.id}
              title={`${p.agencyName} · ${p.name}`}
              sub={p.addons.map((a) => `${a.label} ${formatBRL(a.priceCents)}`).join(" · ")}
              href={p.url || undefined}
              onClick={p.url ? undefined : () => toast.show("Link do pacote em breve")}
            />
          ))}
          {vendors.map((v) => (
            <SheetOption
              key={v.id}
              title={v.name}
              sub={`${v.type} · ${v.priceLabel}`}
              href={v.url && v.url !== "#" ? v.url : undefined}
              onClick={v.url && v.url !== "#" ? undefined : () => toast.show("Link do parceiro em breve")}
            />
          ))}
        </div>
        <button type="button" className="btn btn-outline" data-close>
          Ficar na fanzone
        </button>
      </Sheet>
    </>
  );
}
