"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { createListing } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { Stamp } from "@/components/fan/resale/Ticket";
import { formatBRL } from "@/lib/format";
import { completeHref, missingLabel, showDateParts, type Eligibility, type MyListing, type ResaleEvent, type TicketType } from "@/lib/resale";

const MAX_PROOF = 8 * 1024 * 1024;
const PROOF_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/** "180", "180,5", "1.180,50", "180.50" → centavos; null se não for um valor. */
function parseBRL(v: string): number | null {
  let clean = v.replace(/[^\d,.]/g, "");
  // Com vírgula, ela é a decimal e os pontos são milhar; sem vírgula, um ponto seguido de 1 ou 2 dígitos é decimal.
  clean = clean.includes(",") ? clean.replace(/\./g, "").replace(",", ".") : /^\d*\.\d{1,2}$/.test(clean) ? clean : clean.replace(/\./g, "");
  if (!clean) return null;
  const n = Number(clean);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function SellForm({ event, ticketTypes, eligibility, demo }: { event: ResaleEvent; ticketTypes: TicketType[]; eligibility: Eligibility | null; demo: boolean }) {
  const { slug, base } = useArtist();
  const toast = useToast();
  const [typeId, setTypeId] = useState(ticketTypes[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState("");
  const [codes, setCodes] = useState<string[]>([""]);
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<MyListing | null>(null);
  const [pending, start] = useTransition();

  const type = ticketTypes.find((t) => t.id === typeId);
  const cents = parseBRL(price);
  const overFace = type && cents != null && cents > type.faceCents;
  const d = showDateParts(event.date);
  const needsIdentity = eligibility?.missing.some((m) => m === "cpf" || m === "phone");
  const blocked = eligibility && !eligibility.canSell;

  function changeQty(n: number) {
    const next = Math.min(10, Math.max(1, n));
    setQty(next);
    setCodes((c) => Array.from({ length: next }, (_, i) => c[i] ?? ""));
  }

  function check(): string | null {
    if (!type) return "Escolha o tipo de ingresso.";
    if (cents == null || cents <= 0) return "Informe o preço por ingresso.";
    if (cents > type.faceCents) return `O preço passa do valor de face (${formatBRL(type.faceCents)}).`;
    if (codes.some((c) => !c.trim())) return qty > 1 ? "Preencha o código de cada ingresso." : "Preencha o código do ingresso.";
    if (new Set(codes.map((c) => c.trim().toUpperCase())).size !== codes.length) return "Há códigos repetidos.";
    if (!proof) return "Envie a prova do ingresso (print ou PDF).";
    if (!PROOF_TYPES.includes(proof.type)) return "A prova precisa ser JPG, PNG, WebP ou PDF.";
    if (proof.size > MAX_PROOF) return "A prova passa de 8 MB.";
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = check();
    setError(problem);
    if (problem || !type || cents == null || !proof) return;
    const form = new FormData();
    form.set("ticketId", type.id);
    form.set("qty", String(qty));
    form.set("unitPriceCents", String(cents));
    codes.forEach((c) => form.append("codes", c.trim()));
    form.set("proof", proof);
    start(async () => {
      const r = await createListing(slug, event.id, form);
      if (r.ok) {
        setDone(r.data);
        return;
      }
      if (r.status === 0) {
        toast.show("Exemplo: com a API ligada, o anúncio vai para a análise da equipe.");
        return;
      }
      setError(r.error);
    });
  }

  if (done) {
    return (
      <div className="flex flex-col gap-5 px-4 pb-10 pt-4">
        <PageHead back={`${base}/revenda/${event.id}`} backLabel={event.city} title="Anúncio enviado" />
        <div className="grid justify-items-start gap-4 border-y border-line py-6">
          <span className="mt-2">
            <Stamp label="Em análise" tone="plain" fresh />
          </span>
          <p className="m-0 max-w-[40ch] text-[17px] leading-6">
            A equipe confere a prova e os códigos antes de colocar no ar. Você acompanha em Meus anúncios; se algo estiver errado, dá para reenviar.
          </p>
        </div>
        <Link href={`${base}/revenda/meus-anuncios`} className="btn btn-primary">
          Ver meus anúncios
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead
        back={`${base}/revenda/${event.id}`}
        backLabel={event.city}
        title="Vender ingresso"
        text={`${event.city} · ${d.weekday} ${d.day} ${d.month}${event.time ? ` · ${event.time}` : ""}`}
        aside={demo ? <DemoTag /> : undefined}
      />

      {blocked ? (
        <section className="grid gap-3 border-y border-line py-4">
          <strong className="text-[17px]">Antes de vender</strong>
          <ul className="m-0 grid list-none gap-1 p-0 text-[15px] leading-[22px] text-fg-muted">
            {eligibility!.missing.map((m) => (
              <li key={m}>{missingLabel[m]}</li>
            ))}
          </ul>
          <Link href={completeHref(base, eligibility!.missing, `${base}/revenda/vender/${event.id}`)} className="btn btn-primary self-start">
            {eligibility!.missing.includes("address") ? "Completar endereço" : needsIdentity ? "Informar CPF e telefone" : "Completar cadastro"}
          </Link>
        </section>
      ) : (
        <form onSubmit={submit} className="grid gap-6" noValidate>
          <fieldset className="m-0 grid gap-0 border-0 p-0">
            <legend className="mono mb-2">Tipo de ingresso</legend>
            {ticketTypes.map((t) => (
              <label key={t.id} className="flex min-h-14 cursor-pointer items-center gap-3 border-b border-line py-2 first-of-type:border-t">
                <input type="radio" name="tipo" value={t.id} checked={typeId === t.id} onChange={() => setTypeId(t.id)} className="h-4 w-4 flex-none accent-[var(--fc-amber)]" />
                <span className="grid min-w-0 flex-1 gap-[2px]">
                  <strong className="text-[15px] leading-5">{t.label}</strong>
                  {t.description && <span className="truncate text-[13px] leading-[18px] text-fg-muted">{t.description}</span>}
                </span>
                <span className="num flex-none text-right text-[13px] leading-[18px] text-fg-muted">
                  teto
                  <br />
                  <strong className="text-[15px] text-fg">{formatBRL(t.faceCents)}</strong>
                </span>
              </label>
            ))}
          </fieldset>

          <div className="grid grid-cols-[auto_1fr] items-end gap-4">
            <div className="grid gap-2">
              <span className="mono" id="sell-qty">
                Quantidade
              </span>
              <div className="flex items-center" role="group" aria-labelledby="sell-qty">
                <button type="button" className="btn btn-outline !min-w-11 !px-0" aria-label="Menos um" disabled={qty <= 1} onClick={() => changeQty(qty - 1)}>
                  −
                </button>
                <output className="num w-11 text-center font-display text-[24px] font-black">{qty}</output>
                <button type="button" className="btn btn-outline !min-w-11 !px-0" aria-label="Mais um" disabled={qty >= 10} onClick={() => changeQty(qty + 1)}>
                  +
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="mono" htmlFor="sell-price">
                Preço por ingresso
              </label>
              <input
                id="sell-price"
                className="field num"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Ex.: 150,00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                aria-invalid={overFace || undefined}
                aria-describedby="sell-price-hint"
              />
            </div>
          </div>
          <p id="sell-price-hint" className={`-mt-3 m-0 text-[13px] leading-[18px] ${overFace ? "text-signal" : "text-fg-muted"}`}>
            {type ? `Até ${formatBRL(type.faceCents)}, o valor de face. ` : ""}A taxa da plataforma é descontada do valor quando a venda acontece; você vê quanto recebe no pedido.
          </p>

          <fieldset className="m-0 grid gap-3 border-0 p-0">
            <legend className="mono mb-1">{qty > 1 ? "Código de cada ingresso" : "Código do ingresso"}</legend>
            <p className="m-0 text-[13px] leading-[18px] text-fg-muted">Só a equipe vê os códigos, para conferir. O comprador nunca vê.</p>
            {codes.map((c, i) => (
              <input
                key={i}
                className="field num uppercase"
                aria-label={`Código do ingresso ${i + 1}`}
                placeholder={qty > 1 ? `Ingresso ${i + 1}` : "Código impresso no ingresso"}
                autoComplete="off"
                spellCheck={false}
                value={c}
                onChange={(e) => setCodes((all) => all.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
          </fieldset>

          <div className="grid gap-2">
            <span className="mono" id="sell-proof">
              Prova do ingresso
            </span>
            <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 border border-dashed border-line-strong px-4 py-3" aria-describedby="sell-proof-hint">
              <span className="grid min-w-0 gap-[2px]">
                <strong className="truncate text-[15px] leading-5">{proof ? proof.name : "Escolher arquivo"}</strong>
                <span id="sell-proof-hint" className="text-[13px] leading-[18px] text-fg-muted">
                  Print do ingresso no app da ticketeira, ou o PDF. JPG, PNG, WebP ou PDF até 8 MB.
                </span>
              </span>
              <Icon name="upload" size={20} className="icon flex-none" />
              <input type="file" accept={PROOF_TYPES.join(",")} className="sr-only" aria-labelledby="sell-proof" onChange={(e) => setProof(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          {error && <Notice tone="error">{error}</Notice>}

          <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
            {pending ? "Enviando…" : "Enviar para análise"}
          </button>
          <p className="-mt-3 m-0 text-[13px] leading-[18px] text-fg-muted">
            Quando alguém pagar, você transfere pela ticketeira em até 24h (ou até 2h antes do show). O valor é liberado quando o comprador confirmar.
          </p>
        </form>
      )}
    </div>
  );
}
