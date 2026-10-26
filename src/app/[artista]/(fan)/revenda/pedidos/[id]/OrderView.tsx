"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { orderAction, openDispute, readOrder, replyDispute, reviewSeller } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet } from "@/components/fan/Sheet";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { DemoTag, Deadline, mmss, Money, PageHead, useSecondsLeft } from "@/components/fan/resale/parts";
import { ProofList, StampTrail, Ticket, type ProofLine } from "@/components/fan/resale/Ticket";
import { TrustCard } from "@/components/fan/resale/TrustCard";
import { formatBRL } from "@/lib/format";
import {
  closeReasonLabel,
  disputeReasonLabel,
  formatDeadline,
  isOpenOrder,
  shortRef,
  stampLabel,
  stampTone,
  statusLine,
  timeLeft,
  type DisputeReason,
  type Order,
  type OrderStatus,
} from "@/lib/resale";

const POLL_MS = 15_000;
const FLOW: OrderStatus[] = ["reserved", "awaiting_transfer", "transferred", "completed"];

/** Etapas para a trilha: as do fluxo normal até onde o pedido chegou, e o fim fora do fluxo (disputa, reembolso...). */
function trail(o: Order) {
  const when: Partial<Record<OrderStatus, string | null>> = {
    awaiting_transfer: o.paidAt,
    transferred: o.transferredAt,
    completed: o.status === "completed" ? o.closedAt : null,
  };
  const reached = (s: OrderStatus) => (s === "reserved" ? true : !!when[s]);
  const inFlow = FLOW.includes(o.status);
  const steps = FLOW.filter((s) => inFlow || reached(s)).map((s) => {
    const idx = FLOW.indexOf(s);
    const cur = inFlow ? FLOW.indexOf(o.status) : -1;
    const state: "done" | "now" | "next" = inFlow ? (idx < cur ? "done" : idx === cur ? "now" : "next") : "done";
    const at = when[s];
    const reservedAt = s === "reserved" && o.createdAt ? formatDeadline(o.createdAt) : undefined;
    return { label: stampLabel[s], tone: stampTone[s], when: at ? formatDeadline(at) : reservedAt, state };
  });
  if (!inFlow) {
    steps.push({ label: stampLabel[o.status], tone: stampTone[o.status], when: o.closedAt ? formatDeadline(o.closedAt) : undefined, state: "now" });
  }
  return steps;
}

export function OrderView({ initial, holderName, ticketingName, showTime, demo }: { initial: Order; holderName: string; ticketingName?: string; showTime?: string; demo: boolean }) {
  const { slug, base, name: artistName } = useArtist();
  const router = useRouter();
  const toast = useToast();
  const [order, setOrder] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [sheet, setSheet] = useState<null | "transferred" | "confirm" | "dispute" | "reply" | "cancel">(null);
  const [fresh, setFresh] = useState(false);
  const lastStatus = useRef(initial.status);
  // Cada ação incrementa; uma leitura do polling que começou antes de uma ação é descartada.
  const seq = useRef(0);

  const buyer = order.role === "buyer";
  const left = useSecondsLeft(order.status === "reserved" ? order.reservedUntil : null);

  // Carimbo novo bate só quando a etapa muda com a tela aberta.
  useEffect(() => {
    if (order.status !== lastStatus.current) {
      lastStatus.current = order.status;
      setFresh(true);
      const t = setTimeout(() => setFresh(false), 600);
      return () => clearTimeout(t);
    }
  }, [order.status]);

  // Polling leve enquanto o pedido está aberto e a tela visível (sem API, não há o que buscar).
  useEffect(() => {
    if (demo || !isOpenOrder(order.status)) return;
    const t = setInterval(async () => {
      if (document.hidden) return;
      const at = seq.current;
      const r = await readOrder(slug, order.id);
      if (r.ok && at === seq.current) setOrder(r.data);
    }, POLL_MS);
    return () => clearInterval(t);
  }, [demo, order.id, order.status, slug]);

  // Reserva venceu na tela: relê (a API aplica o prazo ao ler).
  useEffect(() => {
    if (left === 0 && !demo) {
      readOrder(slug, order.id).then((r) => r.ok && setOrder(r.data));
    }
  }, [left, demo, slug, order.id]);

  function run(fn: () => Promise<{ ok: true; data: Order } | { ok: false; error: string; status: number; code?: string }>, done?: string) {
    setError(null);
    seq.current += 1;
    start(async () => {
      const r = await fn();
      if (r.ok) {
        setOrder(r.data);
        setSheet(null);
        if (done) toast.show(done);
        router.refresh();
        return;
      }
      if (r.status === 0) {
        setSheet(null);
        toast.show("Exemplo: com a API ligada, esta ação muda o pedido.");
        return;
      }
      if (r.code === "INVALID_STATE" || r.code === "RESERVATION_EXPIRED") {
        const again = await readOrder(slug, order.id);
        if (again.ok) setOrder(again.data);
      }
      setSheet(null);
      setError(r.error);
    });
  }

  const ref = shortRef(order.id);
  const show = { id: order.eventId, city: order.eventCity, venue: order.eventVenue, date: order.eventDate, time: showTime };
  const counterpartLabel = order.buyerName ? `${order.buyerName}${order.buyerHandle ? ` (${order.buyerHandle})` : ""}` : (order.buyerHandle ?? "o comprador");

  const proof: ProofLine[] = [{ text: `Anúncio conferido pela equipe do ${artistName} antes de ir ao ar.`, ok: true }];
  if (order.paidAt && isOpenOrder(order.status)) {
    proof.push({ text: buyer ? "Seu pagamento está retido pela plataforma até você confirmar." : "O pagamento está retido pela plataforma e é liberado quando o comprador confirmar.", ok: true });
  }
  if (order.status === "transferred" || order.status === "awaiting_transfer") {
    proof.push({
      text: buyer
        ? `A transferência é feita pela ticketeira${ticketingName ? ` (${ticketingName})` : ""}, para ${order.transferTo ?? "a sua conta"}. Confira lá antes de confirmar.`
        : `Transfira pela ticketeira${ticketingName ? ` (${ticketingName})` : ""} para a conta ${order.transferTo ?? "do comprador"} (${counterpartLabel}).`,
    });
  }

  const paidLabel = buyer ? (order.paidAt ? "Você pagou" : "Você paga") : order.status === "completed" ? "Você recebeu" : "Você recebe";
  const amount = buyer ? order.grossCents : order.sellerNetCents;
  const detail = buyer
    ? order.qty > 1
      ? `${order.qty} × ${formatBRL(order.unitPriceCents)}`
      : undefined
    : `${formatBRL(order.grossCents)} da venda − ${formatBRL(order.feeCents)} de taxa`;

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead
        back={`${base}/revenda/pedidos`}
        backLabel="Pedidos"
        title={buyer ? "Sua compra" : "Sua venda"}
        text={statusLine(order)}
        aside={demo ? <DemoTag /> : <span className="mono num">Nº {ref}</span>}
      />
      <p className="sr-only" role="status" aria-live="polite">
        {statusLine(order)}
      </p>

      <Ticket
        title={`Ingresso ${order.ticketLabel} · ${order.eventCity}`}
        show={show}
        top={`${artistName} · Revenda entre fãs`}
        holder={buyer ? holderName : (order.buyerName ?? "Comprador")}
        ticketLabel={order.ticketLabel}
        qty={order.qty}
        refLabel="Pedido Nº"
        refValue={ref}
        stamp={{ label: stampLabel[order.status], tone: stampTone[order.status], fresh }}
      >
        <Money label={paidLabel} cents={amount} detail={detail} />

        {order.status === "reserved" && left != null && (
          <Deadline
            label={buyer ? "Reserva segura por" : "Reserva do comprador"}
            tone={left < 120 ? "urgent" : "plain"}
            value={
              <>
                <span className="font-display text-[28px] font-black leading-8">{mmss(left)}</span>
                {order.reservedUntil && <span className="ml-2 text-[14px] font-normal text-fg-muted">até {formatDeadline(order.reservedUntil)}</span>}
              </>
            }
          />
        )}
        {!buyer && order.transferTo && order.status === "awaiting_transfer" && (
          <div className="grid gap-1 border-t border-line pt-3">
            <span className="mono">Transfira para</span>
            <strong className="break-all text-[17px] leading-[22px]">{order.transferTo}</strong>
          </div>
        )}
        {order.status === "awaiting_transfer" && order.transferDeadline && (
          <DeadlineLeft label={buyer ? "O vendedor transfere até" : "Transfira até"} iso={order.transferDeadline} />
        )}
        {order.status === "transferred" && order.confirmDeadline && (
          <DeadlineLeft label={buyer ? "Confirme ou abra disputa até" : "O comprador confirma até"} iso={order.confirmDeadline} />
        )}
        {!isOpenOrder(order.status) && order.closeReason && (
          <p className="m-0 border-t border-line pt-3 text-[15px] leading-[22px] text-fg-muted">{closeReasonLabel[order.closeReason] ?? "Pedido encerrado."}</p>
        )}

        {error && <Notice tone="error">{error}</Notice>}

        <div className="grid gap-3">
          {order.canPay && (
            <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={() => run(() => orderAction(slug, order.id, "pay"), "Pagamento aprovado. O dinheiro fica retido até você receber.")}>
              {pending ? "Pagando…" : `Pagar ${formatBRL(order.grossCents)}`}
            </button>
          )}
          {buyer && order.status === "reserved" && !order.canPay && (
            <Notice>O pagamento está indisponível no momento. Sua reserva continua até o fim do prazo.</Notice>
          )}
          {order.canMarkTransferred && (
            <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={() => setSheet("transferred")}>
              Já transferi o ingresso
            </button>
          )}
          {order.canConfirm && (
            <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={() => setSheet("confirm")}>
              Recebi o ingresso
            </button>
          )}
          {order.canReplyDispute && (
            <button type="button" className="btn btn-primary btn-block" disabled={pending} onClick={() => setSheet("reply")}>
              Responder ao comprador
            </button>
          )}
          {(order.canDispute || order.canCancel) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {order.canDispute && (
                <button type="button" className="btn btn-ghost" onClick={() => setSheet("dispute")}>
                  Tive um problema
                </button>
              )}
              {order.canCancel && (
                <button type="button" className="btn btn-ghost" onClick={() => setSheet("cancel")}>
                  Cancelar reserva
                </button>
              )}
            </div>
          )}
        </div>
        {order.canPay && order.payment?.provider === "fake" && <p className="mono m-0">Pagamento de teste: nenhum valor real é cobrado.</p>}
      </Ticket>

      {order.canReview && <ReviewBox slug={slug} orderId={order.id} sellerName={order.counterparty?.displayName ?? "o vendedor"} onDone={() => setOrder({ ...order, canReview: false, reviewed: true })} demo={demo} />}
      {order.reviewed && buyer && <Notice tone="ok">Obrigado pela avaliação.</Notice>}

      <section aria-labelledby="etapas" className="grid gap-3">
        <h2 id="etapas" className="mono m-0">
          Etapas
        </h2>
        <StampTrail steps={trail(order)} />
        <ProofList items={proof} />
      </section>

      {order.dispute && (
        <section aria-labelledby="disputa" className="grid gap-3">
          <h2 id="disputa" className="mono m-0">
            Disputa
          </h2>
          <dl className="m-0 grid gap-3 border-y border-line py-4">
            <div className="grid gap-1">
              <dt className="mono">Motivo</dt>
              <dd className="m-0 text-[15px] font-bold leading-5">{disputeReasonLabel[order.dispute.reasonCode] ?? order.dispute.reasonCode}</dd>
            </div>
            {order.dispute.description && (
              <div className="grid gap-1">
                <dt className="mono">O comprador disse</dt>
                <dd className="m-0 text-[15px] leading-[22px]">{order.dispute.description}</dd>
              </div>
            )}
            <div className="grid gap-1">
              <dt className="mono">O vendedor respondeu</dt>
              <dd className="m-0 text-[15px] leading-[22px] text-fg-muted">{order.dispute.sellerReply || "Ainda sem resposta."}</dd>
            </div>
            {order.dispute.decisionNote && (
              <div className="grid gap-1">
                <dt className="mono">Decisão da equipe</dt>
                <dd className="m-0 text-[15px] leading-[22px]">{order.dispute.decisionNote}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {buyer && (order.counterparty || order.sellerPhone) && (
        <section aria-labelledby="vendedor" className="grid gap-3">
          <h2 id="vendedor" className="mono m-0">
            Quem vende
          </h2>
          {order.counterparty && <TrustCard seller={order.counterparty} />}
          {order.sellerPhone && (
            <SellerWhatsApp phone={order.sellerPhone} text={`Oi! Comprei seu ingresso ${order.ticketLabel} (${order.eventCity}) na revenda do ${artistName} — pedido Nº ${ref}.`} />
          )}
        </section>
      )}
      {!buyer && (
        <section aria-labelledby="comprador" className="grid gap-2">
          <h2 id="comprador" className="mono m-0">
            Quem compra
          </h2>
          <p className="m-0 border-y border-line py-4 text-[17px] font-bold leading-6">{counterpartLabel}</p>
        </section>
      )}

      <Rules buyer={buyer} />

      <Link href={`${base}/revenda/${order.eventId}`} className="go">
        Ver anúncios deste show <Icon name="arrow" size={16} />
      </Link>

      <Sheet open={sheet === "transferred"} onClose={() => setSheet(null)} title="Você já transferiu?">
        <p>
          Toque em confirmar só depois de transferir {order.qty > 1 ? `os ${order.qty} ingressos` : "o ingresso"} pela ticketeira para {counterpartLabel}. O comprador vai conferir e
          confirmar; o valor é liberado quando ele confirmar ou em 48h sem resposta.
        </p>
        <div className="row">
          <button type="button" className="btn btn-outline" data-close>
            Ainda não
          </button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => orderAction(slug, order.id, "transferred"), "Avisamos o comprador.")}>
            Já transferi
          </button>
        </div>
      </Sheet>

      <Sheet open={sheet === "confirm"} onClose={() => setSheet(null)} title="O ingresso está na sua conta?">
        <p>Confirme só depois de ver o ingresso no app da ticketeira, no seu nome. Ao confirmar, o valor é liberado para o vendedor e não dá para desfazer.</p>
        <div className="row">
          <button type="button" className="btn btn-outline" data-close>
            Vou conferir
          </button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => orderAction(slug, order.id, "confirm"), "Confirmado. O ingresso é seu.")}>
            Sim, recebi
          </button>
        </div>
      </Sheet>

      <Sheet open={sheet === "cancel"} onClose={() => setSheet(null)} title="Cancelar a reserva?">
        <p>O ingresso volta para o anúncio e outra pessoa pode comprar. Nada foi cobrado.</p>
        <div className="row">
          <button type="button" className="btn btn-outline" data-close>
            Manter
          </button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={() => run(() => orderAction(slug, order.id, "cancel"), "Reserva cancelada.")}>
            Cancelar reserva
          </button>
        </div>
      </Sheet>

      <DisputeSheet
        open={sheet === "dispute"}
        onClose={() => setSheet(null)}
        pending={pending}
        deadline={order.confirmDeadline}
        onSend={(reason, text) => run(() => openDispute(slug, order.id, reason, text), "Disputa aberta. A equipe vai analisar.")}
      />
      <ReplySheet
        open={sheet === "reply"}
        onClose={() => setSheet(null)}
        pending={pending}
        onSend={(text) =>
          run(async () => {
            const r = await replyDispute(slug, order.id, text);
            if (!r.ok) return r;
            return readOrder(slug, order.id);
          }, "Resposta enviada para a equipe.")
        }
      />
    </div>
  );
}

/** Prazo com a data em Brasília e quanto falta (fica vermelho nas últimas 2 horas). */
function DeadlineLeft({ label, iso }: { label: string; iso: string }) {
  const left = useSecondsLeft(iso);
  return (
    <Deadline
      label={label}
      tone={left != null && left < 7200 ? "urgent" : "plain"}
      value={
        <>
          {formatDeadline(iso)}
          {left != null && <span className="ml-2 text-[14px] font-normal text-fg-muted">{timeLeft(left)}</span>}
        </>
      }
    />
  );
}

/** Depois do pagamento o comprador fala direto com o vendedor para combinar a transferência. */
function SellerWhatsApp({ phone, text }: { phone: string; text: string }) {
  const d = phone.replace(/\D/g, "");
  const shown = d.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
  return (
    <div className="grid gap-2">
      <a className="btn btn-outline btn-block" href={`https://wa.me/55${d}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
        Falar com o vendedor no WhatsApp
      </a>
      <p className="m-0 text-[15px] leading-[22px] text-fg-muted">
        <span className="mono">{shown}</span> · Use para combinar a transferência. Pagamento e confirmação continuam aqui no app.
      </p>
    </div>
  );
}

function Rules({ buyer }: { buyer: boolean }) {
  return (
    <details className="group border-y border-line">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-bold uppercase tracking-[0.06em]">
        Como o dinheiro anda
        <Icon name="plus" size={18} className="icon transition-transform group-open:rotate-45" />
      </summary>
      <ul className="m-0 grid gap-3 pb-4 pl-5 text-[15px] leading-[22px] text-fg-muted">
        <li>A reserva segura o ingresso por 15 minutos até o pagamento.</li>
        <li>O pagamento fica retido pela plataforma, não vai direto para o vendedor.</li>
        <li>O vendedor transfere pela ticketeira em até 24h depois do pagamento, ou até 2h antes do show. Se não transferir, o reembolso é automático.</li>
        <li>{buyer ? "Você" : "O comprador"} tem 48h depois do aviso de transferência para confirmar ou abrir disputa. Sem resposta, o valor é liberado ao vendedor.</li>
        <li>Na disputa, a equipe do fã clube decide: reembolsar ou liberar.</li>
        <li>A taxa da plataforma é descontada do vendedor. O comprador paga o preço anunciado, nunca acima do valor de face.</li>
      </ul>
    </details>
  );
}

function DisputeSheet({ open, onClose, pending, deadline, onSend }: { open: boolean; onClose: () => void; pending: boolean; deadline: string | null; onSend: (r: DisputeReason, text: string) => void }) {
  const [reason, setReason] = useState<DisputeReason>("not_received");
  const [text, setText] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title="O que aconteceu?">
      <p>
        A equipe vê os dois lados, a prova do anúncio e decide entre reembolsar ou liberar o valor.
        {deadline ? ` Você pode abrir até ${formatDeadline(deadline)}.` : ""}
      </p>
      <fieldset className="m-0 grid gap-2 border-0 p-0">
        <legend className="mono mb-2">Motivo</legend>
        {(Object.keys(disputeReasonLabel) as DisputeReason[]).map((r) => (
          <label key={r} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-line text-[15px]">
            <input type="radio" name="dispute-reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="h-4 w-4 accent-[var(--fc-amber)]" />
            {disputeReasonLabel[r]}
          </label>
        ))}
      </fieldset>
      <label className="mono mt-4 block" htmlFor="dispute-text">
        Conte o que houve
      </label>
      <textarea id="dispute-text" className="field mt-2" rows={3} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <button type="button" className="btn btn-outline" data-close>
          Voltar
        </button>
        <button type="button" className="btn btn-primary" disabled={pending} onClick={() => onSend(reason, text)}>
          Abrir disputa
        </button>
      </div>
    </Sheet>
  );
}

function ReplySheet({ open, onClose, pending, onSend }: { open: boolean; onClose: () => void; pending: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <Sheet open={open} onClose={onClose} title="Sua resposta">
      <p>Explique o que aconteceu com a transferência. A equipe lê a sua resposta junto com a do comprador.</p>
      <textarea aria-label="Sua resposta" className="field" rows={4} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="row">
        <button type="button" className="btn btn-outline" data-close>
          Voltar
        </button>
        <button type="button" className="btn btn-primary" disabled={pending || !text.trim()} onClick={() => onSend(text)}>
          Enviar resposta
        </button>
      </div>
    </Sheet>
  );
}

function ReviewBox({ slug, orderId, sellerName, onDone, demo }: { slug: string; orderId: string; sellerName: string; onDone: () => void; demo: boolean }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  return (
    <section aria-labelledby="avaliar" className="grid gap-3 border-y border-line py-4">
      <h2 id="avaliar" className="m-0 font-display text-[24px] font-black leading-7">
        Como foi com {sellerName}?
      </h2>
      <fieldset className="m-0 flex gap-1 border-0 p-0">
        <legend className="sr-only">Nota de 1 a 5</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="grid h-11 w-11 cursor-pointer place-items-center" title={`${n} de 5`}>
            <input type="radio" name="rating" value={n} className="sr-only" checked={rating === n} onChange={() => setRating(n)} />
            <Icon name="star" size={26} className={`icon ${n <= rating ? "fill-[var(--fc-amber)] text-amber" : "text-fg-muted"}`} />
            <span className="sr-only">{n} de 5</span>
          </label>
        ))}
      </fieldset>
      <textarea aria-label="Comentário (opcional)" placeholder="Comentário (opcional)" className="field" rows={2} maxLength={500} value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <Notice tone="error">{error}</Notice>}
      <button
        type="button"
        className="btn btn-outline"
        disabled={!rating || pending}
        onClick={() =>
          start(async () => {
            const r = await reviewSeller(slug, orderId, rating, comment);
            if (r.ok) {
              onDone();
              return;
            }
            if (r.status === 0 && demo) {
              toast.show("Exemplo: com a API ligada, a avaliação entra no perfil do vendedor.");
              return;
            }
            setError(r.error);
          })
        }
      >
        Enviar avaliação
      </button>
    </section>
  );
}
