"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import { INGRESSE_URL } from "@/lib/ingresse";
import { summarize, toggleAddon, type PackageChoice } from "@/lib/package-choice";
import type { EventPackage, ShowEvent } from "@/lib/types";
import { BrindeFlow } from "@/app/[artista]/(fan)/eventos/[id]/BrindeFlow";
import { useArtist } from "./ArtistContext";
import { PackagePicker } from "./PackagePicker";
import { Sheet } from "./Sheet";

const statusTag: Record<ShowEvent["status"], { label: string; cls: string }> = {
  on_sale: { label: "Ingressos à venda", cls: "tag" },
  last_batches: { label: "Últimos lotes", cls: "tag tag-hot" },
  soon: { label: "Em breve", cls: "tag tag-demo" },
};

/**
 * "Próximo evento" do Início. O ingresso é vendido só na Ingresse; no app o fã compra experiências extras.
 * Com experiências cadastradas, tocar no cartão abre a folha de baixo com elas e o link da Ingresse: o fã marca as
 * experiências e toca em Levar experiências, que leva ao aviso do brinde e ao pagamento, como na tela do show.
 * Sem experiências, o cartão abre a tela do show.
 */
export function HomeNextEvent({ event, packages, demo }: { event: ShowEvent; packages: EventPackage[]; demo: boolean }) {
  const { base } = useArtist();
  const [open, setOpen] = useState(false);
  const [brinde, setBrinde] = useState(false);
  const [choice, setChoice] = useState<PackageChoice | null>(null);

  const picked = summarize(packages, choice);
  const hasExtras = packages.some((p) => p.addons.length > 0);
  const ingresseUrl = event.ticketingUrl || INGRESSE_URL;

  const card = (
    <>
      <span className="grid content-center justify-items-center bg-amber py-4 text-on-amber">
        <span className="serif num text-[52px] leading-[46px]">{event.day}</span>
        <span className="mono mt-1.5 text-on-amber">{event.month}</span>
      </span>
      <span className="grid gap-2 p-4 text-left transition-colors group-hover:bg-surface">
        <span className="font-display text-2xl font-bold leading-7">{event.city}</span>
        <span className="mono flex items-center gap-1.5">
          <Icon name="pin" size={13} />
          {event.venue} · {event.time}
          {demo && <span className="tag tag-demo ml-auto">Exemplo</span>}
        </span>
        <span className="flex flex-wrap gap-2">
          <span className={statusTag[event.status].cls}>{statusTag[event.status].label}</span>
          {event.giftsCount > 0 && (
            <span className="tag">
              <Icon name="gift" size={11} /> Brinde antes e depois
            </span>
          )}
        </span>
        <span className="go">
          {hasExtras ? "Ingresso na Ingresse e extras" : "Ver evento"}
          <Icon name="arrow" size={16} />
        </span>
      </span>
    </>
  );

  const cls = "group grid w-full grid-cols-[92px_1fr] border-y border-line bg-transparent p-0 text-fg no-underline";

  return (
    <>
      {hasExtras ? (
        <button type="button" className={`${cls} cursor-pointer font-grotesk`} onClick={() => setOpen(true)} aria-haspopup="dialog">
          {card}
        </button>
      ) : (
        <Link href={`${base}/eventos/${event.id}`} className={cls}>
          {card}
        </Link>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={`Experiências extras · ${event.city}, ${event.day} ${event.month}`}>
        <p className="m-0 text-[14px] leading-5 text-fg-muted">O ingresso é vendido só na Ingresse. Aqui você soma as experiências extras ao seu ingresso.</p>
        <div className="max-h-[52dvh] overflow-y-auto pr-1">
          <PackagePicker
            packages={packages}
            choice={choice}
            onToggleAddon={(id, key) => setChoice((c) => toggleAddon(c, id, key))}
          />
        </div>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!picked}
          onClick={() => {
            setOpen(false);
            setBrinde(true);
          }}
        >
          {picked ? `Levar experiências · ${formatBRL(picked.priceCents)}` : "Escolha uma experiência"}
        </button>
        <a href={ingresseUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">
          Comprar ingresso na Ingresse
          <Icon name="arrow" size={16} />
        </a>
        <Link href={`${base}/eventos/${event.id}`} className="go min-h-11">
          Ver todos os detalhes do show
          <Icon name="arrow" size={14} />
        </Link>
      </Sheet>

      <BrindeFlow
        open={brinde && !!picked}
        onClose={() => setBrinde(false)}
        event={{ id: event.id, title: `Vintage Culture em ${event.city}`, city: event.city, day: event.day, month: event.month }}
        picked={picked}
        choice={choice}
        onRemoveAddon={(key) => setChoice((c) => (c ? toggleAddon(c, c.id, key) : c))}
      />
    </>
  );
}
