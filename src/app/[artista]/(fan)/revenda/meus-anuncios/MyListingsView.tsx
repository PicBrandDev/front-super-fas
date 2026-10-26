"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelListing, resubmitListing } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet } from "@/components/fan/Sheet";
import { EmptyState, Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { Stamp } from "@/components/fan/resale/Ticket";
import { formatBRL } from "@/lib/format";
import { listingStatusLabel, showDateParts, type ListingStatus, type MyListing, type StampTone } from "@/lib/resale";

const tone: Record<ListingStatus, StampTone> = { pending_review: "plain", live: "amber", rejected: "signal", cancelled: "spent", closed: "spent" };
const MAX_ATTEMPTS = 3;

export function MyListingsView({ listings, error, demo }: { listings: MyListing[]; error: string | null; demo: boolean }) {
  const { slug, base } = useArtist();
  const router = useRouter();
  const toast = useToast();
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [resubmit, setResubmit] = useState<MyListing | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function doCancel(id: string) {
    start(async () => {
      const r = await cancelListing(slug, id);
      setCancelId(null);
      if (r.ok) {
        toast.show("Anúncio cancelado.");
        router.refresh();
      } else if (r.status === 0) toast.show("Exemplo: com a API ligada, o anúncio sai do ar.");
      else setMsg(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-4">
      <PageHead back={`${base}/revenda`} backLabel="Revenda" title="Meus anúncios" aside={demo ? <DemoTag /> : undefined} />
      {error && <Notice tone="error">{error}</Notice>}
      {msg && <Notice tone="error">{msg}</Notice>}
      {!error && listings.length === 0 && (
        <EmptyState
          title="Nenhum anúncio ainda."
          text="Escolha um show com revenda aberta e anuncie o ingresso que sobrou."
          action={
            <Link href={`${base}/revenda`} className="go">
              Ver shows <Icon name="arrow" size={16} />
            </Link>
          }
        />
      )}
      <ul className="-mx-4 m-0 list-none border-t border-line p-0">
        {listings.map((l) => {
          const d = showDateParts(l.eventDate);
          return (
            <li key={l.id} className="grid gap-3 border-b border-line px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="grid min-w-0 gap-1">
                  <strong className="font-display text-[22px] font-black leading-[26px]">{l.eventCity}</strong>
                  <span className="mono">{`${d.weekday} ${d.day} ${d.month} · ${l.ticketLabel}`}</span>
                </div>
                <Stamp label={listingStatusLabel[l.status]} tone={tone[l.status]} small />
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 text-[15px] leading-5">
                <span className="num">
                  <strong>{formatBRL(l.unitPriceCents)}</strong>
                  <span className="text-fg-muted"> por ingresso</span>
                </span>
                <span className="num text-fg-muted">
                  {l.status === "live" ? `${l.qtyAvailable} de ${l.qtyTotal} disponíveis` : `${l.qtyTotal} ingresso${l.qtyTotal > 1 ? "s" : ""}`}
                </span>
              </div>
              {l.status === "pending_review" && <p className="m-0 text-[15px] leading-[22px] text-fg-muted">A equipe está conferindo a prova. Você é avisado quando entrar no ar.</p>}
              {l.status === "rejected" && l.reviewReason && (
                <div className="grid gap-1 border-l-0 bg-surface p-3">
                  <span className="mono">Motivo da equipe</span>
                  <p className="m-0 text-[15px] leading-[22px]">{l.reviewReason}</p>
                </div>
              )}
              {l.activeOrders > 0 && (
                <Link href={`${base}/revenda/pedidos?lado=vendendo`} className="go">
                  {l.activeOrders === 1 ? "1 venda em andamento" : `${l.activeOrders} vendas em andamento`} <Icon name="arrow" size={16} />
                </Link>
              )}
              {(l.canResubmit || l.canCancel) && (
                <div className="flex flex-wrap items-center gap-4">
                  {l.canResubmit && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setResubmit(l)}>
                      Reenviar prova
                    </button>
                  )}
                  {l.canResubmit && <span className="mono">{`${l.attempts} de ${MAX_ATTEMPTS} envios`}</span>}
                  {l.canCancel && (
                    <button type="button" className="btn btn-ghost ml-auto" onClick={() => setCancelId(l.id)}>
                      Cancelar anúncio
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <Sheet open={!!cancelId} onClose={() => setCancelId(null)} title="Tirar o anúncio do ar?">
        <p>Ninguém mais consegue reservar. Vendas já pagas continuam até o fim.</p>
        <div className="row">
          <button type="button" className="btn btn-outline" data-close>
            Manter
          </button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => cancelId && doCancel(cancelId)}>
            Cancelar anúncio
          </button>
        </div>
      </Sheet>

      {resubmit && (
        <ResubmitSheet
          listing={resubmit}
          onClose={() => setResubmit(null)}
          onDone={() => {
            setResubmit(null);
            toast.show("Reenviado. A equipe confere de novo.");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function ResubmitSheet({ listing, onClose, onDone }: { listing: MyListing; onClose: () => void; onDone: () => void }) {
  const { slug } = useArtist();
  const toast = useToast();
  const [codes, setCodes] = useState<string[]>(() => Array.from({ length: listing.qtyTotal }, () => ""));
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function send() {
    if (codes.some((c) => !c.trim())) return setError("Preencha o código de cada ingresso.");
    if (!proof) return setError("Escolha a nova prova.");
    const form = new FormData();
    codes.forEach((c) => form.append("codes", c.trim()));
    form.set("proof", proof);
    start(async () => {
      const r = await resubmitListing(slug, listing.id, form);
      if (r.ok) onDone();
      else if (r.status === 0) toast.show("Exemplo: com a API ligada, o anúncio volta para análise.");
      else setError(r.error);
    });
  }

  return (
    <Sheet open onClose={onClose} title="Reenviar para análise">
      <p>Corrija o que a equipe apontou. Envie de novo os códigos e uma prova nova.</p>
      <div className="grid gap-2">
        {codes.map((c, i) => (
          <input
            key={i}
            className="field num uppercase"
            aria-label={`Código do ingresso ${i + 1}`}
            placeholder={`Código do ingresso ${i + 1}`}
            value={c}
            autoComplete="off"
            onChange={(e) => setCodes((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
          />
        ))}
        <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 border border-dashed border-line-strong px-3">
          <span className="truncate text-[15px]">{proof ? proof.name : "Nova prova (JPG, PNG, WebP ou PDF)"}</span>
          <Icon name="upload" size={18} className="icon flex-none" />
          <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="row">
        <button type="button" className="btn btn-outline" data-close>
          Voltar
        </button>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={send}>
          {pending ? "Enviando…" : "Reenviar"}
        </button>
      </div>
    </Sheet>
  );
}
