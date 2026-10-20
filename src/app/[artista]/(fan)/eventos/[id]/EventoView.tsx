"use client";

import Link from "next/link";
import { useRef, useState, type KeyboardEvent } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Rings, StripeBand } from "@/components/fan/decor";
import { Icon } from "@/components/icons";
import type { Gift, ShowEvent, Vendor } from "@/lib/types";

type Step = "before" | "after";

const steps: { id: Step; label: string }[] = [
  { id: "before", label: "Antes de comprar" },
  { id: "after", label: "Depois de comprar" },
];

const heroCircle =
  "flex size-11 flex-none items-center justify-center rounded-full border-2 border-paper bg-ink text-paper no-underline";

export function EventoView({
  artistName,
  event,
  vendors,
  gifts,
}: {
  artistName: string;
  event: ShowEvent;
  vendors: Vendor[];
  gifts: Gift[];
}) {
  const { base, viewer } = useArtist();
  const [step, setStep] = useState<Step>("before");
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState("");
  const [validated, setValidated] = useState(false);
  const [q, setQ] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const title = `${artistName} em ${event.city}`;
  const beforeGifts = gifts.filter((g) => g.phase === "before");
  const afterGifts = gifts.filter((g) => g.phase === "after");
  const query = q.trim().toLowerCase();
  const shownVendors = vendors.filter(
    (v) => !query || `${v.name} ${v.type} ${v.tag}`.toLowerCase().includes(query),
  );

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMsg("Link do evento copiado.");
    } catch {
      // Compartilhamento cancelado pelo usuário.
    }
  }

  function join() {
    // TODO: POST /artists/{slug}/events/{id}/luck/join
    setJoined(true);
  }

  function validate() {
    if (!code.trim()) return;
    // TODO: POST /artists/{slug}/events/{id}/tickets/validate
    setValidated(true);
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? steps.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + steps.length) % steps.length;
    setStep(steps[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <Rings className="left-1/2 top-10 -ml-[180px] size-[360px] opacity-90 lg:top-6" start={22} step={14} />
        <div className="relative mx-auto flex w-full max-w-[760px] flex-col px-4 pb-6 pt-3 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="flex items-center justify-between">
            <Link href={`${base}/agenda`} aria-label="Voltar para a agenda" className={heroCircle}>
              <Icon name="back" size={20} strokeWidth={2.4} />
            </Link>
            <div className="flex items-center gap-2">
              {!viewer.isMember && (
                <Link
                  href={`${base}/membro`}
                  className="flex min-h-11 items-center rounded-full border-2 border-paper bg-accent-2 px-3.5 font-label text-xs font-bold text-ink no-underline"
                >
                  Tornar membro
                </Link>
              )}
              <button type="button" onClick={share} aria-label="Compartilhar evento" className={`${heroCircle} cursor-pointer`}>
                <Icon name="share" size={20} strokeWidth={2.2} />
              </button>
            </div>
          </div>
          <p aria-live="polite" className="sr-only">
            {shareMsg}
          </p>

          <div className="mt-[150px] flex flex-col gap-2">
            <span className="self-start rounded-md bg-accent-2 px-2.5 py-[5px] font-label text-xs font-bold text-ink">
              {event.weekday} {event.day} {event.month} · {event.time}
            </span>
            <h1 className="m-0 font-display text-[38px] font-normal leading-none text-cream lg:text-[56px]">{title}</h1>
            <p className="m-0 text-[15px] text-paper-2">
              {event.venue} · {event.address}
            </p>
            <a
              href="#comprar"
              className="mt-3 flex min-h-12 items-center gap-2 self-start rounded-full border-2 border-paper bg-accent-2 px-[18px] font-label text-[13px] font-bold text-ink no-underline"
            >
              Ver opções de compra
              <Icon name="chevron-down" size={16} strokeWidth={2.6} />
            </a>
          </div>
        </div>
      </section>
      <StripeBand className="h-3" />

      <div className="mx-auto w-full max-w-[760px] lg:px-4">
        {/* Informações */}
        <section aria-label="Informações do evento" className="p-4">
          <dl className="m-0 grid grid-cols-3 gap-2">
            {[
              ["Abertura", event.doorsOpen],
              ["Idade", event.ageRating],
              ["Line-up", event.lineup],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 rounded-xl border-2 border-ink bg-cream p-2.5">
                <dt className="font-label text-[11px] font-bold text-ink-soft">{label}</dt>
                <dd className="m-0 font-body text-[15px] font-extrabold">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Sorte do evento */}
        <section
          aria-labelledby="sorte-title"
          className="mx-4 flex flex-col gap-3.5 rounded-2xl border-2 border-ink bg-accent p-4 text-accent-fg shadow-[5px_5px_0_var(--fc-ink)]"
        >
          <div className="flex items-center gap-2.5">
            <Icon name="gift" size={28} />
            <div className="flex flex-col">
              <h2 id="sorte-title" className="m-0 font-display text-2xl font-normal leading-tight">
                Sorte do evento
              </h2>
              <span className="font-label text-xs">Brindes antes e depois do ingresso</span>
            </div>
          </div>

          <div role="tablist" aria-label="Etapas da sorte" className="flex gap-1.5 rounded-full bg-deep p-1">
            {steps.map((s, i) => {
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`sorte-tab-${s.id}`}
                  aria-selected={active}
                  aria-controls="sorte-panel"
                  tabIndex={active ? 0 : -1}
                  onClick={() => setStep(s.id)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  className={`min-h-11 flex-1 cursor-pointer rounded-full font-label text-xs font-bold ${
                    active ? "bg-cream text-ink" : "bg-transparent text-cream"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <div id="sorte-panel" role="tabpanel" aria-labelledby={`sorte-tab-${step}`} className="flex flex-col gap-2.5">
            {step === "before" ? (
              <>
                <p className="m-0 text-sm leading-snug">Confirme presença na sorte e concorra antes mesmo de comprar.</p>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {beforeGifts.map((g) => (
                    <li key={g.id} className="flex justify-between gap-2 rounded-[10px] bg-cream px-3 py-2.5 text-ink">
                      <span className="font-body text-[15px] font-semibold">{g.name}</span>
                      {g.qtyLabel && <span className="font-label text-[11px] font-bold">{g.qtyLabel}</span>}
                    </li>
                  ))}
                </ul>
                <div aria-live="polite">
                  {joined ? (
                    <div className="flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-dashed border-cream font-label text-[13px] font-bold">
                      <Icon name="check" size={18} strokeWidth={2.6} />
                      Você está concorrendo
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={join}
                      className="min-h-12 w-full cursor-pointer rounded-full border-2 border-ink bg-accent-2 font-label text-sm font-bold text-ink"
                    >
                      Participar da sorte
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="m-0 text-sm leading-snug">Já comprou? Valide o ingresso para liberar os brindes de quem vai.</p>
                {!validated && (
                  <form
                    className="flex flex-col gap-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      validate();
                    }}
                  >
                    <label htmlFor="ev-code" className="font-label text-[11px] font-bold uppercase tracking-[0.08em]">
                      Código do ingresso
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="ev-code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ex.: VC-0000-0000"
                        autoComplete="off"
                        className="min-h-12 min-w-0 flex-1 rounded-[10px] border-2 border-ink bg-cream px-3 font-label text-sm text-ink placeholder:text-ink-soft"
                      />
                      <button
                        type="submit"
                        className="min-h-12 cursor-pointer rounded-[10px] border-2 border-ink bg-accent-2 px-3.5 font-label text-[13px] font-bold text-ink"
                      >
                        Validar
                      </button>
                    </div>
                  </form>
                )}
                <ul aria-live="polite" className="m-0 flex list-none flex-col gap-2 p-0">
                  {afterGifts.map((g) => (
                    <li
                      key={g.id}
                      className={`flex items-center justify-between gap-2 rounded-[10px] px-3 py-2.5 text-ink ${
                        validated ? "bg-accent-2" : "bg-paper-2"
                      }`}
                    >
                      <span className="font-body text-[15px] font-semibold">{g.name}</span>
                      <span className="rounded-md bg-ink px-2 py-0.5 font-label text-[11px] font-bold text-paper">
                        {validated ? "Liberado" : "Bloqueado"}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        {/* Onde comprar */}
        <section id="comprar" aria-labelledby="comprar-title" className="flex scroll-mt-4 flex-col gap-3 px-4 pb-7 pt-6">
          <h2 id="comprar-title" className="m-0 font-body text-[22px] font-extrabold">
            Onde comprar
          </h2>
          <p className="m-0 text-sm leading-snug text-ink-soft">Agências, ticketeiras e pacotes parceiros deste show.</p>
          <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-cream px-3">
            <Icon name="search" size={18} strokeWidth={2.2} />
            <label htmlFor="ev-search" className="sr-only">
              Buscar agência ou pacote
            </label>
            <input
              id="ev-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar agência, cidade ou pacote"
              className="min-h-[46px] min-w-0 flex-1 border-0 bg-transparent font-body text-sm text-ink placeholder:text-ink-soft"
            />
          </div>
          <span aria-live="polite" className="font-label text-xs text-ink-soft">
            Mostrando {shownVendors.length} de até 1.000 opções
          </span>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {shownVendors.map((v) => (
              <li key={v.id} className="flex flex-col gap-2.5 rounded-[14px] border-2 border-ink bg-cream p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-[3px]">
                    <strong className="font-body text-base font-extrabold">{v.name}</strong>
                    <span className="text-sm text-ink-soft">{v.type}</span>
                  </div>
                  <span
                    className={`flex-none rounded-md px-2 py-0.5 font-label text-[11px] font-bold ${
                      v.tag === "Oficial" ? "bg-accent text-accent-fg" : "bg-accent-2 text-ink"
                    }`}
                  >
                    {v.tag}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label text-[13px] font-bold">{v.priceLabel}</span>
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-11 flex-none items-center gap-1.5 rounded-full border-2 border-ink bg-ink px-4 font-label text-xs font-bold text-paper no-underline"
                  >
                    Ir comprar
                    <span className="sr-only"> em {v.name} (abre em nova aba)</span>
                    <Icon name="external" size={14} strokeWidth={2.6} />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
