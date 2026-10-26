"use client";

import Link from "next/link";
import { useArtist } from "@/components/fan/ArtistContext";
import { Icon } from "@/components/icons";
import type { Reward } from "@/lib/types";

const STATUS: Record<Reward["status"], { label: string; cls: string }> = {
  available: { label: "Disponível", cls: "tag tag-key" },
  redeemed: { label: "Retirado", cls: "tag tag-demo" },
  used: { label: "Cupom usado", cls: "tag tag-demo" },
  expired: { label: "Expirado", cls: "tag tag-hot" },
};

const KIND: Record<string, string> = {
  coupon: "Cupom de desconto",
  ticket: "Ingresso",
  pickup: "Retirar na lojinha",
};

const brDate = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "");

function RewardCard({ r, agendaHref }: { r: Reward; agendaHref: string }) {
  const active = r.status === "available";
  return (
    <article className={`flex flex-col gap-3 border p-4 ${active ? "border-amber bg-surface" : "border-line bg-night opacity-75"}`}>
      <header className="flex items-start gap-3">
        <span className="flex size-10 flex-none items-center justify-center bg-amber text-on-amber">
          <Icon name="gift" size={20} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <strong className="font-display text-xl font-black leading-6">{r.label}</strong>
          <span className="mono">
            {KIND[r.kind] ?? "Brinde"} · ganho em {r.wonAt}
          </span>
        </div>
        <span className={`${STATUS[r.status].cls} flex-none`}>{STATUS[r.status].label}</span>
      </header>

      <div className="flex flex-col gap-1">
        <span className="mono">Como pegar</span>
        <p className="m-0 text-[15px] leading-[22px] text-fg-muted">{r.instructions}</p>
      </div>

      {r.kind === "coupon" ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-dashed border-line-strong p-3">
          <span className="flex flex-col">
            <span className="mono">Cupom</span>
            <strong className="num text-[20px] tracking-[0.08em]">{r.couponCode}</strong>
          </span>
          {active && (
            <Link href={agendaHref} className="btn btn-primary btn-sm">
              Usar no ingresso
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1 border border-dashed border-line-strong p-3">
          <span className="mono">Código para retirar</span>
          <strong className="num text-[28px] tracking-[0.25em]">{r.code}</strong>
        </div>
      )}

      {r.expiresOn && <span className="mono">{active ? `Válido até ${brDate(r.expiresOn)}` : `Validade: ${brDate(r.expiresOn)}`}</span>}
    </article>
  );
}

export function BrindesView({ rewards }: { rewards: Reward[] }) {
  const { base } = useArtist();
  const open = rewards.filter((r) => r.status === "available");
  const done = rewards.filter((r) => r.status !== "available");
  const agendaHref = `${base}/agenda`;

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-4">
      <header className="flex flex-col gap-2">
        <Link href={`${base}/pickup`} className="back">
          <Icon name="back" size={18} />
          PicKup
        </Link>
        <h1 className="m-0 font-display text-[40px] font-black leading-[40px]">Meus brindes</h1>
        <p className="m-0 text-[15px] leading-[22px] text-fg-muted">
          Tudo o que você ganhou na roleta. Cupons já ficam no carrinho da compra; para o resto, mostre o código na retirada.
        </p>
      </header>

      {rewards.length === 0 ? (
        <section className="flex flex-col gap-3 border border-line p-5">
          <strong className="text-[17px]">Você ainda não ganhou brindes</strong>
          <p className="m-0 text-[15px] leading-[22px] text-fg-muted">
            Gire a roleta do PicKup: tem cupons de desconto no ingresso, ingresso de pista, camiseta e boné do Vintage.
          </p>
          <Link href={`${base}/pickup`} className="btn btn-primary">
            Ir para a roleta
          </Link>
        </section>
      ) : (
        <>
          <section aria-labelledby="br-open" className="flex flex-col gap-3">
            <h2 id="br-open" className="mono m-0">
              Para usar ou retirar ({open.length})
            </h2>
            {open.length === 0 ? (
              <p className="m-0 text-[15px] text-fg-muted">Nada pendente por enquanto.</p>
            ) : (
              open.map((r) => <RewardCard key={r.id} r={r} agendaHref={agendaHref} />)
            )}
          </section>
          {done.length > 0 && (
            <section aria-labelledby="br-done" className="flex flex-col gap-3">
              <h2 id="br-done" className="mono m-0">
                Já usados ou expirados ({done.length})
              </h2>
              {done.map((r) => (
                <RewardCard key={r.id} r={r} agendaHref={agendaHref} />
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
