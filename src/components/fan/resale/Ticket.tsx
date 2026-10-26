"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons";
import { mediaFor } from "@/lib/media";
import { showDateParts, ticketField, type StampTone } from "@/lib/resale";
import { useArtist } from "../ArtistContext";
import { Vinyl } from "../Vinyl";
import s from "./Ticket.module.css";

export type TicketShow = { id: string; city: string; venue: string; date?: string; time?: string };

export type StampData = { label: string; tone: StampTone; when?: string; fresh?: boolean };

/** Carimbo da etapa: moldura dupla de 1px, mono caixa alta, só a cor do estado. */
export function Stamp({ label, tone, when, fresh, small }: StampData & { small?: boolean }) {
  return (
    <span className={`${s.stamp} ${small ? s.small : ""} ${fresh ? s.fresh : ""}`} data-tone={tone}>
      <b>{label}</b>
      {when && !small && <small>{when}</small>}
    </span>
  );
}

/** Uma linha de prova no corpo do ingresso (o que é verdade sobre ele, sem prometer o que não sabemos). */
export type ProofLine = { text: string; ok?: boolean };

function Face({ show, kind }: { show: TicketShow; kind?: string }) {
  const { slug } = useArtist();
  const field = ticketField(show.id);
  const hero = mediaFor(slug)?.hero;
  const d = show.date ? showDateParts(show.date) : null;
  return (
    <div className={s.face}>
      {(d || kind) && (
        <div className={s.when}>
          {d && <b>{`${d.day} ${d.month}`}</b>}
          <span>{[d ? `${d.weekday}${show.time ? ` · ${show.time}` : ""}` : "", kind ?? ""].filter(Boolean).join(" · ")}</span>
        </div>
      )}
      {field === "lagoon-deep" || !hero ? (
        <span className={s.disc}>
          <Vinyl />
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- foto do artista em multiply sobre o campo do show
        <img className={s.photo} src={hero.src} alt="" />
      )}
      <p className={s.city} aria-hidden="true">
        {show.city}
      </p>
    </div>
  );
}

/**
 * O ingresso na tela: o show (campo chapado próprio do evento, cidade em serifa cortada),
 * o titular, o tipo, a data, o número e as linhas de prova; o carimbo da etapa no canto do corpo;
 * picote; e o canhoto (`children`) com o valor, o prazo e a ação.
 */
export function Ticket({
  show,
  top,
  holder,
  ticketLabel,
  qty,
  refLabel,
  refValue,
  proof = [],
  stamp,
  children,
  title,
}: {
  show: TicketShow;
  /** Quem emite, no rodapé do corpo (ex.: "Vintage Culture · Revenda entre fãs"). */
  top: string;
  /** Nome do titular; null = ainda não é de ninguém (prévia do anúncio). */
  holder: string | null;
  ticketLabel: string;
  qty: number;
  refLabel: string;
  refValue: string;
  proof?: ProofLine[];
  stamp?: StampData;
  /** Canhoto. Sem ele, o ingresso termina no corpo. */
  children?: ReactNode;
  /** Nome acessível do ingresso (o título visível é a cidade, decorativa e cortada). */
  title: string;
}) {
  const d = show.date ? showDateParts(show.date) : null;
  const kind = `${ticketLabel}${qty > 1 ? ` × ${qty}` : ""}`;
  return (
    <article className={s.ticket} data-field={ticketField(show.id)} aria-label={title}>
      <Face show={show} kind={kind} />
      <div className={s.body}>
        <dl className="m-0 grid gap-[14px]">
          <div className={`${s.cell} ${s.holder}`}>
            <dt>Titular</dt>
            <dd>{holder ?? "Você, após a transferência"}</dd>
          </div>
          <div className="sr-only">
            <dt>Ingresso</dt>
            <dd>{`${kind}, ${d ? `${d.weekday} ${d.day} ${d.month}` : "data a confirmar"}${show.time ? `, ${show.time}` : ""}`}</dd>
          </div>
          <div className={s.row}>
            <div className={s.cell}>
              <dt>Local</dt>
              <dd>{show.venue ? `${show.city} · ${show.venue}` : show.city}</dd>
            </div>
            <div className={`${s.cell} ${s.ref}`}>
              <dt>{refLabel}</dt>
              <dd>{refValue}</dd>
            </div>
          </div>
        </dl>
        {proof.length > 0 && (
          <div className={s.proof}>
            {proof.map((p) => (
              <p key={p.text} className={p.ok ? s.ok : ""}>
                <Icon name={p.ok ? "check" : "clock"} size={14} className="icon" />
                {p.text}
              </p>
            ))}
          </div>
        )}
        {!children && <p className={s.issuer}>{top}</p>}
        {stamp && (
          <div className={s.stampSlot}>
            <Stamp {...stamp} />
          </div>
        )}
      </div>
      {children && (
        <>
          <div className={s.perf} aria-hidden="true">
            <i />
          </div>
          <div className={s.stub}>
            {children}
            <p className={s.issuer}>{top}</p>
          </div>
        </>
      )}
    </article>
  );
}

/** Linhas de prova fora do ingresso (o que é verdade sobre ele, sem prometer o que não sabemos). */
export function ProofList({ items }: { items: ProofLine[] }) {
  if (items.length === 0) return null;
  return (
    <div className={`${s.proof} ${s.proofOut}`}>
      {items.map((p) => (
        <p key={p.text} className={p.ok ? s.ok : ""}>
          <Icon name={p.ok ? "check" : "clock"} size={14} className="icon" />
          {p.text}
        </p>
      ))}
    </div>
  );
}

/** Ingresso fechado na carteira: barra (show, tipo, valor de quem vê, próximo passo, carimbo) e a face. Leva ao ingresso inteiro. */
export function WalletTicket({
  show,
  line,
  sub,
  stamp,
  href,
  title,
}: {
  show: TicketShow;
  line: string;
  sub?: string;
  stamp?: StampData;
  href: string;
  title: string;
}) {
  return (
    <Link href={href} className={`${s.ticket} ${s.compact}`} data-field={ticketField(show.id)} aria-label={title}>
      <span className={s.compactBar}>
        <span className="grid min-w-0 gap-[2px]">
          <strong>{line}</strong>
          {sub && <span className={s.compactSub}>{sub}</span>}
        </span>
        {stamp && <Stamp {...stamp} small />}
      </span>
      <Face show={show} />
    </Link>
  );
}

/** Pilha de ingressos fechados (cada um cobre o pé do anterior, como numa carteira). */
export function Wallet({ label, children }: { label: string; children: ReactNode }) {
  return (
    <ul className={s.wallet} aria-label={label}>
      {children}
    </ul>
  );
}

/** Etapas do pedido em ordem, com o carimbo de cada uma (passadas impressas; próxima tracejada). */
export function StampTrail({ steps }: { steps: { label: string; tone: StampTone; when?: string; state: "done" | "now" | "next" }[] }) {
  return (
    <ol className={s.trail}>
      {steps.map((st, i) => (
        <li key={st.label} data-state={st.state}>
          <span>
            <Stamp label={st.label} tone={st.state === "next" ? "plain" : st.tone} small />
          </span>
          <span className={s.trailWhen}>{st.when ?? (st.state === "next" && steps[i - 1]?.state !== "next" ? "Próxima etapa" : "")}</span>
        </li>
      ))}
    </ol>
  );
}
