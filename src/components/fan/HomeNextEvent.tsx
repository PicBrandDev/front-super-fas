"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import { summarize, type PackageChoice } from "@/lib/package-choice";
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
 * "Próximo evento" do Início. Tocar no cartão abre o modal de compra (folha de baixo) com os pacotes do show:
 * o fã escolhe a opção e toca em Comprar ingresso, que leva ao aviso do brinde e ao pagamento, como na tela do show.
 * Sem pacotes cadastrados, o cartão abre a tela do show.
 */
export function HomeNextEvent({ event, packages, demo }: { event: ShowEvent; packages: EventPackage[]; demo: boolean }) {
  const { base } = useArtist();
  const [open, setOpen] = useState(false);
  const [brinde, setBrinde] = useState(false);
  const [choice, setChoice] = useState<PackageChoice | null>(null);

  const picked = summarize(packages, choice);

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
          {packages.length > 0 ? "Comprar ingresso" : "Ver evento"}
          <Icon name="arrow" size={16} />
        </span>
      </span>
    </>
  );

  const cls = "group grid w-full grid-cols-[92px_1fr] border-y border-line bg-transparent p-0 text-fg no-underline";

  return (
    <>
      {packages.length > 0 ? (
        <button type="button" className={`${cls} cursor-pointer font-grotesk`} onClick={() => setOpen(true)} aria-haspopup="dialog">
          {card}
        </button>
      ) : (
        <Link href={`${base}/eventos/${event.id}`} className={cls}>
          {card}
        </Link>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title={`Comprar ingresso · ${event.city}, ${event.day} ${event.month}`}>
        <div className="max-h-[52dvh] overflow-y-auto pr-1">
          <PackagePicker
            packages={packages}
            choice={choice}
            onChoose={(id, item) => setChoice((c) => ({ id, item, addons: c?.id === id ? c.addons : [] }))}
            onToggleAddon={(key) => setChoice((c) => (c ? { ...c, addons: c.addons.includes(key) ? c.addons.filter((k) => k !== key) : [...c.addons, key] } : c))}
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
          {picked ? `Comprar ingresso · ${formatBRL(picked.priceCents)}` : "Escolha uma opção"}
        </button>
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
        onRemoveAddon={(key) => setChoice((c) => (c ? { ...c, addons: c.addons.filter((k) => k !== key) } : c))}
      />
    </>
  );
}
