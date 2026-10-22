"use client";

import Link from "next/link";
import { useState } from "react";
import { startInstagramShare, type ShareInfo } from "@/app/actions/fan";
import { useArtist } from "./ArtistContext";
import { Sheet } from "./Sheet";
import { useToast } from "./Toast";
import { Icon } from "@/components/icons";
import type { Post } from "@/lib/types";

type Step = "info" | "ready";

const HASHTAG = "EuSouUmSuperFaDoVintage";

/**
 * Compartilhar um post oficial no Instagram (ranking Fã Super do Vintage). Antes de ir para o Instagram o fã
 * vê o aviso do ranking e da hashtag que conta pontos; o app registra a intenção, copia a legenda pronta
 * (com a hashtag e o código do fã) e abre o compartilhamento do aparelho ou o Instagram.
 */
export function ShareInstagram({ post, kind = "post" }: { post: Pick<Post, "id" | "text"> & { image?: { src: string } | null }; kind?: "post" | "track" }) {
  const { base, slug } = useArtist();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<ShareInfo | null>(null);

  const close = () => {
    setOpen(false);
    setStep("info");
    setError("");
  };

  async function proceed() {
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await startInstagramShare(slug, post.id, kind);
    setBusy(false);
    // Sem API (modo exemplo, status 0) usa uma legenda de exemplo.
    const data: ShareInfo | null = res.ok
      ? res.data
      : res.status === 0
        ? { shareId: "demo", hashtag: HASHTAG, code: "FS-EXEMPLO", caption: `${post.text.slice(0, 280)}\n\n#${HASHTAG} FS-EXEMPLO` }
        : null;
    if (!data) return setError(res.ok ? "" : res.error);
    setInfo(data);
    try {
      await navigator.clipboard.writeText(data.caption);
    } catch {
      // Sem permissão da área de transferência: o fã copia a legenda da tela.
    }
    setStep("ready");
  }

  async function openInstagram() {
    if (!info) return;
    // No celular, o compartilhamento do aparelho deixa escolher o Instagram e já leva a foto e a legenda.
    try {
      if (navigator.share) {
        const files: File[] = [];
        if (post.image?.src) {
          const blob = await (await fetch(post.image.src)).blob();
          files.push(new File([blob], "post.jpg", { type: blob.type || "image/jpeg" }));
        }
        const data: ShareData = files.length && navigator.canShare?.({ files }) ? { files, text: info.caption } : { text: info.caption };
        await navigator.share(data);
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // o fã fechou o compartilhamento
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function copyAgain() {
    if (!info) return;
    try {
      await navigator.clipboard.writeText(info.caption);
      toast.show("Legenda copiada");
    } catch {
      toast.show("Não deu para copiar. Selecione a legenda e copie.");
    }
  }

  return (
    <>
      <button type="button" className="act" aria-label="Compartilhar no Instagram" onClick={() => setOpen(true)}>
        <Icon name="share" size={20} />
        <span className="mono">Instagram</span>
      </button>

      <Sheet open={open} onClose={close} title={step === "info" ? "Seja o Fã Super do Vintage" : "Legenda pronta"}>
        {step === "info" ? (
          <>
            <p>
              Você pode ser o <strong>primeiro do ranking de Fã Super do Vintage</strong> repostando {kind === "track" ? "este drop" : "este post"} do aplicativo no seu Instagram.
            </p>
            <p>
              Só contabiliza com a <strong>#{HASHTAG}</strong>. A legenda já vai pronta, com a hashtag e o seu código de fã.
            </p>
            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-primary btn-block" onClick={proceed} disabled={busy} aria-busy={busy || undefined}>
              {busy ? "Preparando…" : "Continuar para o Instagram"}
            </button>
            <button type="button" className="btn btn-outline" data-close>
              Agora não
            </button>
          </>
        ) : (
          <>
            <p>Copiamos a legenda. Cole no seu post do Instagram e mantenha a hashtag e o código, senão o compartilhamento não conta.</p>
            <p className="mono m-0 whitespace-pre-wrap break-words border border-line p-3 normal-case tracking-normal text-fg" data-testid="share-caption">
              {info?.caption}
            </p>
            <button type="button" className="btn btn-primary btn-block" onClick={openInstagram}>
              Abrir o Instagram
              <Icon name="external" size={16} />
            </button>
            <button type="button" className="btn btn-outline" onClick={copyAgain}>
              Copiar a legenda de novo
            </button>
            <Link href={`${base}/comunidade?aba=ranking`} className="go min-h-11" onClick={close}>
              Ver o ranking
            </Link>
          </>
        )}
      </Sheet>
    </>
  );
}
