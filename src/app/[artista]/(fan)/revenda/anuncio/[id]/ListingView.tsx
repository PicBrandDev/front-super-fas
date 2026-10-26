"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { reserveListing } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { DemoTag, Money, PageHead } from "@/components/fan/resale/parts";
import { ProofList, Ticket } from "@/components/fan/resale/Ticket";
import { TrustCard } from "@/components/fan/resale/TrustCard";
import { formatBRL } from "@/lib/format";
import { buyMissing, completeHref, missingLabel, newIdempotencyKey, type Eligibility, type Listing, type ResaleEvent } from "@/lib/resale";

export function ListingView({
  listing,
  event,
  eligibility,
  ticketingName,
  accountEmail,
  demo,
}: {
  listing: Listing;
  event: ResaleEvent;
  eligibility: Eligibility | null;
  ticketingName?: string;
  /** E-mail do cadastro: sugestão para a conta da ticketeira. */
  accountEmail: string;
  demo: boolean;
}) {
  const { slug, base, name: artistName } = useArtist();
  const router = useRouter();
  const toast = useToast();
  const [picked, setQty] = useState(1);
  const [transferTo, setTransferTo] = useState(accountEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Uma chave por tentativa de compra: repetir o toque (rede ruim) devolve o mesmo pedido; mudar a quantidade é outra tentativa.
  const key = useRef<{ qty: number; key: string } | null>(null);

  const max = listing.qtyAvailable;
  // O saldo pode cair (outro fã reservou): a quantidade usada nunca passa do que sobrou.
  const qty = Math.min(picked, Math.max(1, max));
  const soldOut = max === 0;
  const blocked = eligibility && !eligibility.canBuy;
  const belowFace = listing.unitPriceCents < listing.faceCents;

  function reserve() {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(transferTo.trim())) {
      setError("Informe o e-mail da sua conta na ticketeira: é para lá que o vendedor transfere.");
      return;
    }
    if (!key.current || key.current.qty !== qty) key.current = { qty, key: newIdempotencyKey() };
    const k = key.current.key;
    setError(null);
    start(async () => {
      const r = await reserveListing(slug, listing.id, qty, k, transferTo);
      if (r.ok) {
        router.push(`${base}/revenda/pedidos/${r.data.id}`);
        return;
      }
      if (r.status === 0) {
        toast.show("Exemplo: com a API ligada, a reserva segura o ingresso por 15 minutos.");
        return;
      }
      key.current = null;
      setError(r.error);
      if (r.code === "QTY_UNAVAILABLE") router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead back={`${base}/revenda/${listing.eventId}`} backLabel={event.city} title={`${listing.ticketLabel} · ${event.city}`} aside={demo ? <DemoTag /> : undefined} />

      <Ticket
        title={`Prévia do ingresso ${listing.ticketLabel} · ${event.city}`}
        show={{ id: event.id, city: event.city, venue: event.venue, date: event.date, time: event.time }}
        top={`${artistName} · Revenda entre fãs`}
        holder={null}
        ticketLabel={listing.ticketLabel}
        qty={qty}
        refLabel="Anunciado em"
        refValue={listing.createdAt}
        stamp={{ label: soldOut ? "Esgotado" : "À venda", tone: soldOut ? "spent" : "plain" }}
      >
        <Money
          label="Preço por ingresso"
          cents={listing.unitPriceCents}
          detail={belowFace ? `Valor de face ${formatBRL(listing.faceCents)}: abaixo do original` : `No valor de face, ${formatBRL(listing.faceCents)}`}
        />

        {!soldOut && (
          <div className="grid gap-2 border-t border-line pt-3">
            <span className="mono" id="qty-label">
              Quantos ingressos
            </span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center" role="group" aria-labelledby="qty-label">
                <button type="button" className="btn btn-outline !min-w-11 !px-0" aria-label="Menos um" disabled={qty <= 1} onClick={() => setQty(Math.max(1, qty - 1))}>
                  −
                </button>
                <output className="num w-12 text-center font-display text-[28px] font-black" aria-live="polite">
                  {qty}
                </output>
                <button type="button" className="btn btn-outline !min-w-11 !px-0" aria-label="Mais um" disabled={qty >= max} onClick={() => setQty(Math.min(max, qty + 1))}>
                  +
                </button>
              </div>
              <span className="mono text-right">{max === 1 ? "1 disponível" : `${max} disponíveis`}</span>
            </div>
            {qty > 1 && <span className="num text-[14px] text-fg-muted">{`${qty} × ${formatBRL(listing.unitPriceCents)}`}</span>}
          </div>
        )}

        {!soldOut && !blocked && (
          <div className="grid gap-2 border-t border-line pt-3">
            <label className="mono" htmlFor="transfer-to">
              Sua conta na ticketeira{ticketingName ? ` (${ticketingName})` : ""}
            </label>
            <input
              id="transfer-to"
              className="field"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              aria-describedby="transfer-to-hint"
            />
            <span id="transfer-to-hint" className="text-[13px] leading-[18px] text-fg-muted">
              O vendedor transfere o ingresso para este e-mail. Ele só vê depois que você pagar.
            </span>
          </div>
        )}

        {error && <Notice tone="error">{error}</Notice>}

        {blocked ? (
          <div className="grid gap-2 border-t border-line pt-3">
            <span className="mono">Antes de comprar</span>
            <ul className="m-0 grid list-none gap-1 p-0 text-[15px] leading-[22px]">
              {buyMissing(eligibility!).map((m) => (
                <li key={m}>{missingLabel[m]}</li>
              ))}
            </ul>
            <Link href={completeHref(base, eligibility!.missing, `${base}/revenda/anuncio/${listing.id}`)} className="btn btn-outline btn-block">
              Completar cadastro
            </Link>
          </div>
        ) : (
          <button type="button" className="btn btn-primary btn-block" disabled={soldOut || pending} onClick={reserve}>
            {soldOut ? "Esgotado" : pending ? "Reservando…" : "Reservar por 15 minutos"}
          </button>
        )}
        {!soldOut && !blocked && <p className="m-0 text-[13px] leading-[18px] text-fg-muted">Nada é cobrado agora. A reserva segura o ingresso enquanto você paga.</p>}
      </Ticket>

      <ProofList
        items={[
          { text: `Conferido pela equipe do ${artistName} antes de ir ao ar.`, ok: true },
          { text: `Transferência pela ticketeira${ticketingName ? ` (${ticketingName})` : ""}, para a sua conta, depois do pagamento.` },
        ]}
      />

      <section aria-labelledby="quem-vende" className="grid gap-3">
        <h2 id="quem-vende" className="mono m-0">
          Quem vende
        </h2>
        <TrustCard seller={listing.seller} />
      </section>

      <section aria-labelledby="protecao" className="grid gap-3">
        <h2 id="protecao" className="m-0 font-display text-[24px] font-black leading-7">
          Seu dinheiro fica retido
        </h2>
        <ol className="m-0 grid list-none gap-0 border-t border-line p-0">
          {[
            ["Você paga", "O valor fica com a plataforma, não com o vendedor."],
            ["O vendedor transfere", "Pela ticketeira, para a sua conta, em até 24h ou até 2h antes do show."],
            ["Você confere e confirma", "Só aí o vendedor recebe. Se der errado, abra uma disputa em até 48h."],
          ].map(([t, d]) => (
            <li key={t} className="grid gap-1 border-b border-line py-3">
              <strong className="text-[15px] leading-5">{t}</strong>
              <span className="text-[15px] leading-[22px] text-fg-muted">{d}</span>
            </li>
          ))}
        </ol>
        <Link href={`${base}/revenda/vendedor/${listing.seller.userId}`} className="go">
          Avaliações de {listing.seller.displayName} <Icon name="arrow" size={16} />
        </Link>
      </section>
    </div>
  );
}
