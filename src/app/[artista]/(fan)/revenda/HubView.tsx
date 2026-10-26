"use client";

import Link from "next/link";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { DemoTag } from "@/components/fan/resale/parts";
import s from "@/components/fan/ShowStub.module.css";
import { EmptyState, Notice } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import { buyMissing, completeHref, missingLabel, sellOnlyMissing, showDateParts, type Eligibility, type ResaleEvent } from "@/lib/resale";

export function HubView({ events, eligibility, error, openOrders, demo }: { events: ResaleEvent[]; eligibility: Eligibility | null; error: string | null; openOrders: number; demo: boolean }) {
  const { base, name: artistName } = useArtist();

  return (
    <>
      <Masthead word="Revenda" tone="night" />
      <div className="flex flex-col gap-5 px-4 pb-8 pt-2">
        <p className="m-0 max-w-[42ch] text-[17px] leading-6">
          Show esgotado na ticketeira? Compre e venda entre fãs, pelo valor de face no máximo. O pagamento fica retido até o ingresso chegar.
        </p>

        <nav aria-label="Seus pedidos e anúncios" className="grid grid-cols-2 border-y border-line">
          <Link href={`${base}/revenda/pedidos`} className="flex min-h-14 items-center justify-between gap-2 border-r border-line pr-3 text-[13px] font-bold uppercase tracking-[0.06em]">
            <span>
              Meus pedidos
              {openOrders > 0 && <span className="num ml-2 text-amber-text">{openOrders}</span>}
            </span>
            <Icon name="arrow" size={16} />
          </Link>
          <Link href={`${base}/revenda/meus-anuncios`} className="flex min-h-14 items-center justify-between gap-2 pl-3 text-[13px] font-bold uppercase tracking-[0.06em]">
            Meus anúncios
            <Icon name="arrow" size={16} />
          </Link>
        </nav>

        {eligibility && buyMissing(eligibility).length > 0 && (
          <Notice>
            Antes de comprar: {buyMissing(eligibility).map((m) => missingLabel[m]).join(" ")}{" "}
            <Link className="go" href={completeHref(base, buyMissing(eligibility), `${base}/revenda`)}>
              Completar
            </Link>
          </Notice>
        )}
        {error && <Notice tone="error">{error}</Notice>}

        <section aria-labelledby="shows" className="grid">
          <div className="flex items-center justify-between gap-3 pb-3">
            <h2 id="shows" className="mono m-0">
              Shows com revenda aberta
            </h2>
            {demo && <DemoTag />}
          </div>
          {events.length === 0 && !error ? (
            <EmptyState
              title="Nenhum show com revenda aberta."
              text={`A revenda abre quando um show do ${artistName} esgota na ticketeira oficial e a equipe libera.`}
              action={
                <Link href={`${base}/agenda`} className="go">
                  Ver a agenda <Icon name="arrow" size={16} />
                </Link>
              }
            />
          ) : (
            <div className="-mx-4 border-t border-line">
              {events.map((e) => {
                const d = showDateParts(e.date);
                return (
                  <Link key={e.id} href={`${base}/revenda/${e.id}`} className={s.ev}>
                    <span className={s.slab}>
                      <span className={s.d} aria-hidden="true">
                        {d.day}
                      </span>
                      <span className="sr-only">{`${d.weekday} ${d.day} de ${d.month}`}</span>
                      <span className="mono" aria-hidden="true">
                        {d.month}
                      </span>
                    </span>
                    <span className={s.evb}>
                      <span className={s.name}>{e.city}</span>
                      <span className={`mono ${s.where}`}>
                        <Icon name="pin" size={13} />
                        <span className="truncate">
                          {e.venue}
                          {e.time ? ` · ${e.time}` : ""}
                        </span>
                      </span>
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] leading-5">{e.listingsCount === 1 ? "1 anúncio" : `${e.listingsCount} anúncios`}</span>
                        {e.fromPriceCents != null && (
                          <span className="num text-[15px] leading-5">
                            <span className="text-fg-muted">a partir de </span>
                            <strong>{formatBRL(e.fromPriceCents)}</strong>
                          </span>
                        )}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        {eligibility && buyMissing(eligibility).length === 0 && sellOnlyMissing(eligibility).length > 0 && (
          <p className="m-0 border-t border-line pt-4 text-[15px] leading-[22px] text-fg-muted">
            Para vender, informe seu CPF e telefone uma vez.{" "}
            <Link className="go" href={`${base}/revenda/identidade`}>
              Informar
            </Link>
          </p>
        )}
      </div>
    </>
  );
}
