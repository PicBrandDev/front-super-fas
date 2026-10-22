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
            <div>
              <div role="radiogroup" aria-labelledby="ingressos-h">
                {[...byAgency.entries()].map(([agency, list]) => (
                  <div key={agency} className="mt-6 flex flex-col gap-3">
                    <div className="flex items-baseline justify-between gap-3 border-b border-line pb-2">
                      <h4 className="m-0 font-display text-lg font-black leading-6">{agency}</h4>
                      <span className="mono">
                        {list.length} {list.length === 1 ? "pacote" : "pacotes"}
                        {list[0].agencyContact ? ` · ${list[0].agencyContact}` : ""}
                      </span>
                    </div>
                    {list.map((p) => (
                      <article key={p.id} className="flex flex-col gap-3 border border-line bg-surface p-4">
                        <header className="flex flex-wrap items-center justify-between gap-2">
                          <strong className="text-[17px] leading-6">{p.name}</strong>
                          {p.hasTransfer && <span className="tag tag-key">Com transfer</span>}
                          {p.items.some((i) => i.kind === "seal" || i.kind === "photo") && (
                            <span className="tag tag-key">
                              <Icon name="star" size={11} />
                              Selo no app do Vintage
                            </span>
                          )}
                          {p.items.some((i) => i.kind === "photo") && (
                            <span className="tag">
                              <Icon name="camera" size={11} />
                              Photo Finder: suas fotos do show no app
                            </span>
                          )}
                        </header>
                        {p.description && <p className="m-0 text-[15px] leading-[22px] text-fg-muted">{p.description}</p>}
                        <div role="radiogroup" aria-label={`Opções do pacote ${p.name}`} className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                          {p.items.map((it, idx) => {
                            const on = choice?.type === "package" && choice.id === p.id && choice.item === idx;
                            return (
                              <label
                                key={idx}
                                className={`flex flex-col gap-1 border p-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-amber ${
                                  on ? "border-amber bg-raised" : "border-line bg-night"
                                } ${it.soldOut ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                              >
                                <input
                                  type="radio"
                                  name="opcao"
                                  className="sr-only"
                                  checked={on}
                                  disabled={it.soldOut}
                                  onChange={() => setChoice({ type: "package", id: p.id, item: idx })}
                                />
                                <span className="mono">{it.kind === "photo" ? "Ingresso + transfer + selo + Photo Finder" : it.kind === "seal" ? "Ingresso + transfer + selo" : it.kind === "transfer" ? "Ingresso + transfer" : "Somente ingresso"}</span>
                                <strong className="text-[16px] leading-5">{it.label}</strong>
                                <span className={`num text-[16px] ${it.soldOut ? "line-through" : ""}`}>{formatBRL(it.priceCents)}</span>
                                {(it.kind === "seal" || it.kind === "photo") && (
                                  <span className="tag tag-key self-start">
                                    <Icon name="star" size={11} />
                                    Selo no app
                                  </span>
                                )}
                                {it.kind === "photo" && (
                                  <span className="tag self-start">
                                    <Icon name="camera" size={11} />
                                    Photo Finder
                                  </span>
                                )}
                                {it.soldOut && <span className="tag tag-demo self-start">Esgotado</span>}
                              </label>
                            );
                          })}
                        </div>
                        {p.transferDetails && (
                          <p className="m-0 text-[14px] leading-5 text-fg-muted">
                            <span className="mono">Transfer</span> · {p.transferDetails}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
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
