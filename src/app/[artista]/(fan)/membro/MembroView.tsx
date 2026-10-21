"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { subscribeMembership } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Mark } from "@/components/fan/Mark";
import { Masthead } from "@/components/fan/Masthead";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import type { MemberPerk } from "@/lib/types";
import s from "./Membro.module.css";

type Pay = "pix" | "card";

export function MembroView({
  artistName,
  priceLabel,
  perks,
  accountHref,
}: {
  artistName: string;
  priceLabel: string; // "R$ 16,90"
  perks: MemberPerk[];
  accountHref: string; // "Minha conta" com o tema do artista (withArtist no servidor)
}) {
  const { viewer, slug } = useArtist();
  const router = useRouter();
  const { show: toast } = useToast();
  const [pay, setPay] = useState<Pay>("pix");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [member, setMember] = useState(viewer.isMember);
  const [since, setSince] = useState("");
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (member && since) cardRef.current?.focus();
  }, [member, since]);

  async function subscribe() {
    if (busy) return;
    setBusy(true);
    setError("");
    // A assinatura é registrada no back (ainda sem cobrança real). Sem API, só simula aqui.
    const res = await subscribeMembership(slug, pay);
    if (!res.ok && res.status !== 0) {
      setError(res.error);
      setBusy(false);
      return;
    }
    // Data só no navegador, depois da montagem (sem divergência de hidratação).
    setSince(new Date().toLocaleDateString("pt-BR"));
    setMember(true);
    setBusy(false);
    toast("Você é membro");
    if (res.ok) router.refresh();
  }

  return (
    <>
      <Masthead word="Membro" label="Tornar membro" tone="amber" />
      <div className={s.body}>
        {member ? (
          <section ref={cardRef} tabIndex={-1} aria-label="Carteirinha de membro" className={s.card}>
            <div className={s.cardTop}>
              <Mark size={40} />
              <span className="mono">Fã clube {artistName}</span>
            </div>
            <p className={s.cardName}>{viewer.name}</p>
            <div className={s.cardFoot}>
              <span className="mono">
                Nº {viewer.handle.replace(/^@/, "")}
                <br />
                {since ? `Membro desde ${since}` : "Membro"}
              </span>
              <span className="tag tag-key">Ativa</span>
            </div>
          </section>
        ) : (
          <div className={s.priceBlock}>
            <div className={`${s.price} num`}>{priceLabel}</div>
            <span className="mono">/mês · fã clube {artistName}</span>
          </div>
        )}

        <section aria-labelledby="perksH" className="grid gap-3">
          <h2 id="perksH" className={s.h}>
            O que você ganha
          </h2>
          <div className={s.gifts}>
            {perks.map((p, i) => (
              <div key={p.title} className={s.gift}>
                <Icon name={i === 0 ? "gift" : "check"} size={20} />
                <div>
                  <strong>{p.title}</strong>
                  <span>{p.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!member && (
          <section aria-labelledby="payH" className="grid gap-3">
            <h2 id="payH" className={s.h}>
              Pagamento
            </h2>
            <div className={s.times} role="group" aria-labelledby="payH">
              <button type="button" aria-pressed={pay === "pix"} onClick={() => setPay("pix")}>
                Pix
              </button>
              <button type="button" aria-pressed={pay === "card"} onClick={() => setPay("card")}>
                Cartão
              </button>
            </div>
            <button type="button" className="btn btn-primary btn-block" onClick={subscribe} disabled={busy} aria-busy={busy || undefined}>
              {busy ? "Assinando…" : `Assinar · ${priceLabel}/mês`}
            </button>
            {error && <Notice tone="error">{error}</Notice>}
          </section>
        )}

        <p className="mono m-0">
          Cobrança mensal. Cancele quando quiser em{" "}
          <Link href={accountHref} className="text-fg underline underline-offset-4">
            Minha conta
          </Link>
          .
        </p>
      </div>
    </>
  );
}
