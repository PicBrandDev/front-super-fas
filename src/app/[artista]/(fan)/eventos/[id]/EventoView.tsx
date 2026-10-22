"use client";

import Link from "next/link";
import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet, SheetOption } from "@/components/fan/Sheet";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel, statusTagClass } from "@/lib/events";
import { formatBRL } from "@/lib/format";
import type { EventPackage, ShowEvent, Vendor } from "@/lib/types";
import { PackagePicker } from "@/components/fan/PackagePicker";
import { BrindeFlow } from "./BrindeFlow";
import s from "./EventoView.module.css";

export function EventoView({
  artistName,
  event,
  vendors,
  packages = [],
    demo,
}: {
  artistName: string;
  event: ShowEvent;
  vendors: Vendor[];
  packages?: EventPackage[];
  demo: boolean;
}) {
  const { base } = useArtist();
  const toast = useToast();
  const past = isPastEvent(event);
  const title = eventName(artistName, event);
  const photosHref = `${base}/photo-finder?evento=${event.id}`;
  const ticketing = event.ticketingUrl ? { name: event.ticketingName || "Ticketeira oficial", url: event.ticketingUrl } : null;
  // Pacotes agrupados por agência.
  const byAgency = packages.reduce<Map<string, EventPackage[]>>((acc, p) => acc.set(p.agencyName, [...(acc.get(p.agencyName) ?? []), p]), new Map());

  const [buyOpen, setBuyOpen] = useState(false);
  const [brindeOpen, setBrindeOpen] = useState(false);
  // Opção escolhida: um ingresso avulso (vai para a ticketeira) ou um pacote de agência (vai para o link do pacote).
  const [choice, setChoice] = useState<{ type: "package"; id: string; item: number } | null>(null);
  const hasOptions = packages.length > 0;
  const chosenPackage = choice?.type === "package" ? packages.find((p) => p.id === choice.id) : undefined;
  // Cada opção do pacote é um tipo de ingresso (com ou sem transfer) com o seu valor.
  const chosenOption = chosenPackage && choice?.type === "package" ? chosenPackage.items[choice.item] : undefined;
  const buyLabel = chosenOption ? `${chosenOption.label} · ${formatBRL(chosenOption.priceCents)}` : "";

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

      {!past && hasOptions && (
        <section className={s.sect} aria-labelledby="ingressos-h">
          <h2 id="ingressos-h">Pacotes das agências</h2>
          <p>Escolha o tipo de ingresso do pacote e toque em Comprar ingresso.</p>
          {packages.length > 0 && (
            <PackagePicker
              packages={packages}
              choice={choice ? { id: choice.id, item: choice.item } : null}
              onChoose={(id, item) => setChoice({ type: "package", id, item })}
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
            choice && chosenOption ? (
              <>
                <span className="mono">{buyLabel}</span>
                <button type="button" className="btn btn-primary" onClick={() => setBrindeOpen(true)}>
                  Comprar ingresso
                </button>
              </>
            ) : (
              <span className="mono">Escolha uma opção do pacote</span>
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

      <BrindeFlow open={brindeOpen && !!chosenPackage} onClose={() => setBrindeOpen(false)} label={buyLabel} eventId={event.id} packageId={chosenPackage?.id ?? ""} item={choice?.item ?? 0} />

      <Sheet open={buyOpen} onClose={() => setBuyOpen(false)} title="Onde comprar">
        <p>A compra acontece no site do parceiro. A fanzone leva você até lá e guarda o seu brinde.</p>
        <div className="opts">
          {ticketing && <SheetOption title={ticketing.name} sub="Ticketeira oficial do show" href={ticketing.url} />}
          {packages.map((p) => (
            <SheetOption
              key={p.id}
              title={`${p.agencyName} · ${p.name}`}
              sub={`${p.items.map((i) => `${i.label} ${formatBRL(i.priceCents)}`).join(" · ")}${p.hasTransfer ? " · com transfer" : ""}`}
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
