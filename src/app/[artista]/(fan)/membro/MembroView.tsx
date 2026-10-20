"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Rings, StripeBand } from "@/components/fan/decor";
import { Icon } from "@/components/icons";
import type { MemberPerk } from "@/lib/types";

type Pay = "pix" | "card";

const payOptions: { id: Pay; label: string; hint: string }[] = [
  { id: "pix", label: "Pix", hint: "aprovação na hora" },
  { id: "card", label: "Cartão de crédito", hint: "renova sozinho" },
];

export function MembroView({
  artistName,
  artistInitial,
  priceLabel,
  priceAmount,
  perks,
}: {
  artistName: string;
  artistInitial: string;
  priceLabel: string;
  priceAmount: string;
  perks: MemberPerk[];
}) {
  const { base, viewer } = useArtist();
  const [pay, setPay] = useState<Pay>("pix");
  const [processing, setProcessing] = useState(false);
  const [member, setMember] = useState(false);
  const [since, setSince] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  useEffect(() => {
    if (member) successRef.current?.focus();
  }, [member]);

  function subscribe() {
    if (processing) return;
    setProcessing(true);
    // TODO: POST /artists/{slug}/membership/subscribe  { method: pay }
    timer.current = setTimeout(() => {
      // Data calculada só no navegador, depois da montagem (sem divergência de hidratação).
      setSince(new Date().toLocaleDateString("pt-BR"));
      setProcessing(false);
      setMember(true);
    }, 1200);
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <Rings className="-right-[90px] top-[30px] size-[300px] lg:right-[-40px] lg:top-1/2 lg:size-[380px] lg:-translate-y-1/2" start={26} step={14} />
        <div className="relative mx-auto w-full max-w-[760px] px-4 pb-[26px] pt-3 lg:px-8 lg:pb-10 lg:pt-8">
          <Link
            href={base}
            aria-label="Voltar ao início"
            className="flex size-11 items-center justify-center rounded-full border-2 border-paper bg-ink text-paper no-underline"
          >
            <Icon name="back" size={20} strokeWidth={2.4} />
          </Link>
          <p className="mb-1.5 mt-[22px] font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
            Fã clube {artistName}
          </p>
          <h1 className="m-0 max-w-[230px] font-display text-[42px] font-normal leading-[0.95] text-cream lg:max-w-none lg:text-[56px]">
            Tornar membro
          </h1>
          <p className="m-0 mt-[18px] flex items-end gap-1.5">
            <span className="pb-2.5 font-label text-base font-bold">R$</span>
            <span className="font-display text-[60px] font-normal leading-none text-accent-2">{priceAmount}</span>
            <span className="pb-2.5 font-label text-sm font-bold">/mês</span>
          </p>
        </div>
      </section>
      <StripeBand className="h-3.5" />

      <div className="mx-auto w-full max-w-[760px] lg:px-4">
        {!member ? (
          <>
            <section aria-labelledby="perks-title" className="flex flex-col gap-2.5 px-4 pb-2 pt-5">
              <h2 id="perks-title" className="m-0 mb-1 font-body text-xl font-extrabold">
                O que você ganha
              </h2>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0 lg:grid lg:grid-cols-2">
                {perks.map((p) => (
                  <li key={p.title} className="flex items-center gap-3 rounded-xl border-2 border-ink bg-cream px-3.5 py-3">
                    <span className="flex size-8 flex-none items-center justify-center rounded-full bg-accent-2 text-ink">
                      <Icon name="check" size={16} strokeWidth={3} />
                    </span>
                    <span className="flex flex-col gap-px">
                      <strong className="font-body text-[15px] font-extrabold">{p.title}</strong>
                      <span className="text-[13px] text-ink-soft">{p.sub}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <form
              className="flex flex-col gap-3 px-4 pb-7 pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                subscribe();
              }}
            >
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className="mb-2 p-0 font-body text-xl font-extrabold">Forma de pagamento</legend>
                {payOptions.map((o) => {
                  const checked = pay === o.id;
                  return (
                    <label
                      key={o.id}
                      className={`flex min-h-[52px] cursor-pointer items-center gap-3 rounded-xl border-2 border-ink px-3.5 ${
                        checked ? "bg-accent-2" : "bg-cream"
                      }`}
                    >
                      <input
                        type="radio"
                        name="pay"
                        value={o.id}
                        checked={checked}
                        onChange={() => setPay(o.id)}
                        disabled={processing}
                        className="m-0 size-5 accent-accent"
                      />
                      <span className="flex-1 font-body text-[15px] font-semibold">{o.label}</span>
                      <span className="font-label text-[11px] font-bold text-ink-soft">{o.hint}</span>
                    </label>
                  );
                })}
              </fieldset>

              <div className="flex items-baseline justify-between border-t-2 border-dashed border-ink px-0.5 pt-3">
                <span className="font-label text-xs font-bold">Total hoje</span>
                <strong className="font-body text-xl font-extrabold">{priceLabel}</strong>
              </div>

              <button
                type="submit"
                disabled={processing}
                aria-busy={processing}
                className={`shadow-hard min-h-14 cursor-pointer rounded-full border-2 border-ink font-display text-xl font-normal text-accent-fg disabled:cursor-wait ${
                  processing ? "bg-ink-soft" : "bg-accent"
                }`}
              >
                {processing ? "Confirmando…" : `Assinar por ${priceLabel}/mês`}
              </button>
              <p className="m-0 text-center font-label text-xs leading-snug text-ink-soft">
                Cobrança mensal. Cancele quando quiser em Perfil › Assinatura.
              </p>
            </form>
          </>
        ) : (
          <section aria-live="polite" className="flex flex-col gap-[18px] px-4 pb-7 pt-6">
            <div className="flex flex-col gap-1">
              <h2 ref={successRef} tabIndex={-1} className="m-0 font-display text-[30px] font-normal leading-none text-accent">
                Bem-vinda ao fã clube!
              </h2>
              <p className="m-0 text-[15px] text-ink-soft">Sua carteirinha já está ativa.</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border-2 border-ink bg-accent-2 text-ink shadow-[5px_5px_0_var(--fc-ink)] lg:max-w-[420px]">
              <Rings className="-bottom-[60px] -right-[50px] size-[170px]" inner="var(--fc-accent-2)" start={8} step={18} />
              <div className="relative flex items-center justify-between border-b-2 border-dashed border-ink px-4 py-3">
                <span className="font-label text-[11px] font-bold uppercase tracking-[0.1em]">Carteirinha de membro</span>
                <span aria-hidden="true" className="font-display text-lg">
                  {artistInitial}
                </span>
              </div>
              <div className="relative flex flex-col gap-2.5 p-4">
                <strong className="font-display text-[26px] font-normal leading-none">{viewer.name}</strong>
                <dl className="m-0 flex gap-5">
                  <div className="flex flex-col">
                    <dt className="font-label text-[11px] font-bold">Nº</dt>
                    <dd className="m-0 font-label text-sm font-bold">[000000]</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="font-label text-[11px] font-bold">Membro desde</dt>
                    <dd className="m-0 font-label text-sm font-bold">{since}</dd>
                  </div>
                </dl>
                <span className="self-start rounded-full bg-ink px-2.5 py-1 font-label text-[11px] font-bold text-paper">
                  {pay === "pix" ? "Pix" : "Cartão"} · {priceLabel}/mês
                </span>
              </div>
            </div>

            <Link
              href={`${base}/mural`}
              className="flex min-h-[52px] items-center justify-center rounded-full border-2 border-ink bg-accent font-label text-sm font-bold text-accent-fg no-underline lg:max-w-[420px]"
            >
              Ver Drop exclusivo
            </Link>
            <Link
              href={base}
              className="flex min-h-12 items-center justify-center font-label text-[13px] font-bold text-ink lg:max-w-[420px]"
            >
              Voltar ao início
            </Link>
          </section>
        )}
      </div>
    </>
  );
}
