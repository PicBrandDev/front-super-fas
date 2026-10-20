"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition, type ChangeEvent, type ReactNode, type Ref } from "react";
import { createCampaign } from "@/app/actions/admin";
import { SlotDiagram, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { AdCard } from "@/components/fan/AdCard";
import { Icon } from "@/components/icons";
import { themeStyle, type ArtistTheme } from "@/lib/themes";
import type { AdSlot } from "@/lib/types";

export type SponsorClub = {
  slug: string;
  name: string;
  initial: string;
  members: string;
  brandColor: string;
  theme: ArtistTheme;
};

type Step = 1 | 2 | 3 | 4;

type AdForm = {
  brand: string;
  cta: string;
  title: string;
  text: string;
  link: string;
  start: string;
  end: string;
};

const emptyForm: AdForm = { brand: "", cta: "", title: "", text: "", link: "", start: "", end: "" };

const stepLabels = ["Fã clube", "Vitrine", "Anúncio", "Revisão"] as const;

const ACCEPTED_ART = ["image/jpeg", "image/png"];

/** "2026-10-20" → "20/10/2026" */
const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

export function PatrocinadorClient({
  clubs,
  slotsByClub,
}: {
  clubs: SponsorClub[];
  slotsByClub: Record<string, AdSlot[]>;
}) {
  const [step, setStep] = useState<Step>(1);
  const [sent, setSent] = useState(false);
  const [clubSlug, setClubSlug] = useState<string | null>(null);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [form, setForm] = useState<AdForm>(emptyForm);
  const [art, setArt] = useState<File | null>(null);
  const [artError, setArtError] = useState("");
  const [agree, setAgree] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sending, start] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moveFocus = useRef(false);

  // Leva o foco para o título da etapa nova (só depois de uma ação do usuário).
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    headingRef.current?.focus();
  }, [step, sent]);

  const club = clubs.find((c) => c.slug === clubSlug) ?? null;
  const slots = club ? (slotsByClub[club.slug] ?? []).filter((s) => s.active) : [];
  const slot = slots.find((s) => s.id === slotId) ?? null;
  const slotName = slot?.name ?? "[vitrine]";
  const clubName = club?.name ?? "[fã clube]";

  const set = (k: keyof AdForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canNext =
    step === 1 ? !!club : step === 2 ? !!slot : step === 3 ? !!(form.title.trim() && form.link.trim()) : agree;

  const goTo = (s: Step) => {
    moveFocus.current = true;
    setStep(s);
  };

  const next = () => {
    if (!canNext) return;
    if (step === 4) {
      if (sending || !clubSlug || !slotId) return;
      const fd = new FormData();
      fd.set("club", clubSlug);
      fd.set("slot", slotId);
      for (const [k, v] of Object.entries(form)) fd.set(k, v.trim());
      if (art) fd.set("art", art);
      start(async () => {
        const res = await createCampaign(fd);
        // status 0 = sem API (modo exemplo): segue como se tivesse enviado.
        if (!res.ok && res.status !== 0) {
          setSendError(res.error);
          return;
        }
        setSendError("");
        moveFocus.current = true;
        setSent(true);
      });
      return;
    }
    goTo((step + 1) as Step);
  };

  const back = () => {
    if (step > 1) goTo((step - 1) as Step);
  };

  const restart = () => {
    moveFocus.current = true;
    setStep(1);
    setSent(false);
    setSlotId(null);
    setAgree(false);
    setArt(null);
    setArtError("");
    setForm(emptyForm);
  };

  const pickClub = (slug: string) => {
    if (slug !== clubSlug) setSlotId(null);
    setClubSlug(slug);
  };

  const onArt = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_ART.includes(file.type)) {
      setArtError("Envie um arquivo JPG ou PNG.");
      e.target.value = "";
      return;
    }
    setArtError("");
    setArt(file);
  };

  const preview = {
    sponsor: form.brand.trim() || "[Marca patrocinadora]",
    title: form.title.trim() || "[Título do anúncio]",
    text: form.text.trim() || "[Texto curto do anúncio]",
    cta: form.cta.trim() || "[Chamada]",
    url: form.link.trim() || "#",
  };

  const period = `${form.start ? formatDate(form.start) : "[início]"} a ${form.end ? formatDate(form.end) : "[fim]"}`;
  const review = [
    { k: "Fã clube", v: clubName },
    { k: "Vitrine", v: slotName },
    { k: "Período", v: period },
    { k: "Valor", v: slot?.priceLabel ?? "R$ [PREÇO]" },
    { k: "Título", v: preview.title },
    { k: "Link", v: form.link.trim() || "—" },
  ];

  const freeCount = (slug: string) => (slotsByClub[slug] ?? []).filter((s) => s.active && !s.occupied).length;

  return (
    <>
      <ol aria-label="Etapas" className="m-0 grid list-none gap-2 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          const done = sent || n < step;
          const cur = !sent && n === step;
          return (
            <li
              key={label}
              aria-current={cur ? "step" : undefined}
              className={`flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 ${
                cur ? "border-adm-blue bg-adm-blue-tint" : "border-adm-line bg-white"
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-7 flex-none items-center justify-center rounded-full font-adm-mono text-[13px] font-semibold ${
                  done ? "bg-adm-ok text-white" : cur ? "bg-adm-blue text-white" : "bg-adm-off-bg text-adm-off"
                }`}
              >
                {done ? "✓" : n}
              </span>
              <span className="flex flex-col">
                <span className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">Etapa {n}</span>
                <strong className="text-sm font-semibold">
                  {label}
                  {done && <span className="sr-only"> (concluída)</span>}
                </strong>
              </span>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite">
        {sent && (
          <section className="flex flex-col items-center gap-3 rounded-[14px] border border-adm-line bg-white px-7 py-10 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-adm-ok-bg text-adm-ok">
              <Icon name="check" size={28} strokeWidth={2.6} />
            </span>
            <h2 ref={headingRef} tabIndex={-1} className="m-0 text-[22px] font-bold outline-none">
              Campanha enviada para aprovação
            </h2>
            <p className="m-0 max-w-[480px] text-[15px] text-adm-muted">
              Seu anúncio em “{slotName}” no fã clube {clubName} está na fila de aprovação. Acompanhe o status em{" "}
              <Link href="/patrocinador/campanhas" className="font-semibold text-adm-blue">
                Minhas campanhas
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-adm-blue bg-white px-[18px] text-sm font-semibold text-adm-blue"
            >
              Criar outra campanha
            </button>
          </section>
        )}
      </div>

      {!sent && step === 1 && (
        <section className="flex flex-col gap-3.5">
          <StepHeading ref={headingRef}>Em qual fã clube você quer anunciar?</StepHeading>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))]">
            {clubs.map((c) => {
              const on = c.slug === clubSlug;
              const free = freeCount(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  onClick={() => pickClub(c.slug)}
                  aria-pressed={on}
                  className={`flex cursor-pointer items-center gap-3.5 rounded-[14px] border-2 p-[18px] text-left text-adm-ink ${
                    on ? "border-adm-blue bg-adm-blue-tint" : "border-adm-line bg-white hover:border-adm-input"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-14 flex-none items-center justify-center rounded-[14px] text-[26px]"
                    style={{ background: c.brandColor, color: c.theme.cream, fontFamily: c.theme.fontDisplay }}
                  >
                    {c.initial}
                  </span>
                  <span className="flex flex-1 flex-col gap-[3px]">
                    <strong className="text-[17px] font-bold">{c.name}</strong>
                    <span className="text-[13px] text-adm-muted">{c.members} membros</span>
                    <span className={`text-[13px] font-semibold ${free > 0 ? "text-adm-ok" : "text-adm-muted"}`}>
                      {free === 1 ? "1 vitrine livre" : `${free} vitrines livres`}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`size-[22px] flex-none rounded-full border-2 ${on ? "border-adm-blue bg-adm-blue" : "border-adm-line bg-white"}`}
                  />
                </button>
              );
            })}
            <div
              aria-disabled="true"
              className="flex items-center gap-3.5 rounded-[14px] border border-dashed border-adm-input bg-white p-[18px] text-adm-muted"
            >
              <span
                aria-hidden="true"
                className="flex size-14 flex-none items-center justify-center rounded-[14px] bg-adm-off-bg font-bold text-adm-off"
              >
                ?
              </span>
              <span className="flex flex-col gap-[3px]">
                <strong className="text-[17px] text-adm-off">[Outro artista]</strong>
                <span className="text-[13px]">Em breve na plataforma</span>
              </span>
            </div>
          </div>
        </section>
      )}

      {!sent && step === 2 && (
        <section className="flex flex-col gap-3.5">
          <StepHeading ref={headingRef}>Escolha a vitrine no fã clube {clubName}</StepHeading>
          <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr))]">
            {slots.map((v) => {
              const on = v.id === slotId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSlotId(v.id)}
                  disabled={v.occupied}
                  aria-pressed={on}
                  className={`flex items-start gap-3.5 rounded-[14px] border-2 p-4 text-left text-adm-ink ${
                    on ? "border-adm-blue bg-adm-blue-tint" : "border-adm-line bg-white"
                  } ${v.occupied ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:border-adm-input"}`}
                >
                  <SlotDiagram
                    small
                    top={Math.round(v.diagram.top * 0.9)}
                    height={Math.round(v.diagram.height * 0.9)}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <strong className="text-[15px] font-bold">{v.name}</strong>
                    <span className="text-[13px] leading-[1.4] text-adm-muted">{v.where}</span>
                    <span className="text-[13px] font-semibold">{v.priceLabel}</span>
                    <span
                      className={`mt-1 self-start rounded-full px-[9px] py-[3px] text-xs font-semibold ${
                        v.occupied ? "bg-adm-off-bg text-adm-off" : "bg-adm-ok-bg text-adm-ok"
                      }`}
                    >
                      {v.occupied ? "Ocupada até [data]" : "Disponível"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!sent && step === 3 && (
        <section className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[3_1_420px] flex-col gap-4 rounded-[14px] border border-adm-line bg-white p-5">
            <StepHeading ref={headingRef}>Monte seu anúncio</StepHeading>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
              <Field id="ad-brand" label="Nome da marca">
                <input id="ad-brand" value={form.brand} onChange={set("brand")} maxLength={40} placeholder="[Marca A]" className={inputClass} />
              </Field>
              <Field id="ad-cta" label="Texto do botão">
                <input id="ad-cta" value={form.cta} onChange={set("cta")} maxLength={24} placeholder="Ex.: Ver oferta" className={inputClass} />
              </Field>
            </div>
            <Field id="ad-title" label="Título" counter={`${form.title.length}/50`}>
              <input
                id="ad-title"
                value={form.title}
                onChange={set("title")}
                maxLength={50}
                required
                aria-describedby="ad-title-count"
                placeholder="Até 50 caracteres"
                className={inputClass}
              />
            </Field>
            <Field id="ad-text" label="Texto curto" counter={`${form.text.length}/90`}>
              <textarea
                id="ad-text"
                rows={2}
                value={form.text}
                onChange={set("text")}
                maxLength={90}
                aria-describedby="ad-text-count"
                placeholder="Até 90 caracteres"
                className="resize-none rounded-lg border border-adm-input bg-white px-3 py-2.5 text-[15px] leading-[1.4] text-adm-ink placeholder:text-adm-muted"
              />
            </Field>
            <Field id="ad-link" label="Link de destino">
              <input
                id="ad-link"
                type="url"
                inputMode="url"
                value={form.link}
                onChange={set("link")}
                required
                placeholder="https://"
                className={`${inputClass} font-adm-mono`}
              />
            </Field>
            <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))]">
              <Field id="ad-start" label="Início">
                <input id="ad-start" type="date" value={form.start} onChange={set("start")} className={inputClass} />
              </Field>
              <Field id="ad-end" label="Fim">
                <input
                  id="ad-end"
                  type="date"
                  value={form.end}
                  min={form.start || undefined}
                  onChange={set("end")}
                  className={inputClass}
                />
              </Field>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-adm-blue bg-adm-blue-tint px-4 text-sm font-semibold text-adm-blue-dark focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-adm-blue">
                <Icon name="upload" size={18} strokeWidth={2.2} />
                {art ? "Trocar arte" : "Enviar arte"}
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={onArt}
                  aria-describedby="ad-art-hint"
                  className="sr-only"
                />
              </label>
              <span id="ad-art-hint" className="text-xs text-adm-muted">
                {art ? art.name : "JPG ou PNG, 1080×1080"}
              </span>
              {artError && (
                <span role="alert" className="basis-full text-xs font-semibold text-adm-danger">
                  {artError}
                </span>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-[2_1_320px] flex-col gap-2.5">
            <span className="font-adm-mono text-xs font-semibold uppercase text-adm-muted">Prévia · {slotName}</span>
            <div
              style={club ? themeStyle(club.theme) : undefined}
              className="rounded-[22px] border-2 border-adm-ink bg-paper px-4 py-[18px] font-body"
              onClickCapture={(e) => e.preventDefault()}
            >
              <AdCard ad={preview} />
            </div>
            <span className="text-xs text-adm-muted">É assim que os fãs veem seu anúncio no app do {clubName}.</span>
          </div>
        </section>
      )}

      {!sent && step === 4 && (
        <section className="flex flex-col gap-4 rounded-[14px] border border-adm-line bg-white p-5">
          <StepHeading ref={headingRef}>Revise e envie</StepHeading>
          <dl className="m-0 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
            {review.map((r) => (
              <div key={r.k} className="flex flex-col gap-1 rounded-[10px] bg-adm-bg p-3">
                <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">{r.k}</dt>
                <dd className="m-0 text-[15px] font-semibold [overflow-wrap:anywhere]">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex min-h-11 items-center gap-2.5">
            <input
              id="ad-agree"
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="m-0 size-5 flex-none accent-adm-blue"
            />
            <label htmlFor="ad-agree" className="text-sm">
              Concordo com as regras de anúncio do fã clube e da plataforma.
            </label>
          </div>
        </section>
      )}

      {!sent && sendError && (
        <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
          {sendError}
        </p>
      )}

      {!sent && (
        <div className="flex justify-between gap-3 border-t border-adm-line pt-2">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className={`${btnSecondary} disabled:cursor-not-allowed disabled:text-adm-disabled`}
          >
            Voltar
          </button>
          <button type="button" onClick={next} disabled={!canNext || sending} aria-busy={sending} className={btnPrimary}>
            {step === 4 ? (sending ? "Enviando…" : "Enviar para aprovação") : "Continuar"}
          </button>
        </div>
      )}
    </>
  );
}

function StepHeading({ ref, children }: { ref: Ref<HTMLHeadingElement>; children: ReactNode }) {
  return (
    <h2 ref={ref} tabIndex={-1} className="m-0 text-xl font-bold outline-none">
      {children}
    </h2>
  );
}

function Field({ id, label, counter, children }: { id: string; label: string; counter?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-[13px] font-semibold">
          {label}
        </label>
        {counter && (
          <span id={`${id}-count`} className="font-adm-mono text-[11px] text-adm-muted">
            {counter}
          </span>
        )}
      </span>
      {children}
    </div>
  );
}
