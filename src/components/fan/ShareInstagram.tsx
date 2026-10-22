"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { claimInstagramShare, startInstagramShare, type ShareInfo } from "@/app/actions/fan";
import { useArtist } from "./ArtistContext";
import { Sheet } from "./Sheet";
import { useToast } from "./Toast";
import { Icon } from "@/components/icons";
import type { Post } from "@/lib/types";

type Step = "info" | "won" | "capped";

const HASHTAG = "EuSouUmSuperFaDoVintage";
const GO_MS = 2200; // quanto tempo a mensagem do giro fica antes de levar à roleta

/**
 * Compartilhar um post oficial ou um Drop no Instagram (ranking Fã Super do Vintage). O fã vê o aviso do ranking e da
 * hashtag que conta pontos, posta (o app copia a legenda pronta e abre o Instagram) e toca em "Já postei": como o
 * app ainda é de exemplo, isso rende na hora 1 giro da roleta e leva para o PicKap. O ponto no ranking só vem
 * quando a conferência no Instagram achar a hashtag e o código do fã.
 */
export function ShareInstagram({
  post,
  kind = "post",
}: {
  post: Pick<Post, "id" | "text"> & { image?: { src: string } | null };
  kind?: "post" | "track";
}) {
  const { base, slug } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [busy, setBusy] = useState<"open" | "claim" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<ShareInfo | null>(null);

  const close = () => {
    setOpen(false);
    setStep("info");
    setError("");
  };

  // Depois da mensagem do giro, leva para a roleta.
  useEffect(() => {
    if (step !== "won") return;
    const t = setTimeout(() => {
      setOpen(false);
      setStep("info");
      router.push(`${base}/pickap`);
    }, GO_MS);
    return () => clearTimeout(t);
  }, [step, base, router]);

  /** Registra o compartilhamento uma vez (legenda com a hashtag e o código do fã). */
  async function ensureShare(): Promise<ShareInfo | null> {
    if (info) return info;
    const res = await startInstagramShare(slug, post.id, kind);
    // Sem API (modo exemplo, status 0) usa uma legenda de exemplo.
    const data: ShareInfo | null = res.ok
      ? res.data
      : res.status === 0
        ? { shareId: "demo", hashtag: HASHTAG, code: "FS-EXEMPLO", caption: `${post.text.slice(0, 280)}\n\n#${HASHTAG} FS-EXEMPLO` }
        : null;
    if (!data) {
      setError(res.ok ? "" : res.error);
      return null;
    }
    setInfo(data);
    return data;
  }

  async function openInstagram() {
    if (busy) return;
    setBusy("open");
    setError("");
    const data = await ensureShare();
    setBusy(null);
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.caption);
      toast.show("Legenda copiada. Cole no seu post do Instagram.");
    } catch {
      // Sem permissão da área de transferência: o fã copia a legenda da tela.
    }
    // No celular, o compartilhamento do aparelho deixa escolher o Instagram e já leva a foto e a legenda.
    try {
      if (navigator.share) {
        const files: File[] = [];
        if (post.image?.src) {
          const blob = await (await fetch(post.image.src)).blob();
          files.push(new File([blob], "post.jpg", { type: blob.type || "image/jpeg" }));
        }
        const payload: ShareData = files.length && navigator.canShare?.({ files }) ? { files, text: data.caption } : { text: data.caption };
        await navigator.share(payload);
        return;
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return; // o fã fechou o compartilhamento
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }

  async function posted() {
    if (busy) return;
    setBusy("claim");
    setError("");
    const data = await ensureShare();
    if (!data) return setBusy(null);
    const res = await claimInstagramShare(slug, data.shareId);
    setBusy(null);
    // Sem API (modo exemplo, status 0) o giro é só da tela.
    if (!res.ok && res.status !== 0) return setError(res.error);
    setStep(res.ok && !res.data.spinGranted ? "capped" : "won");
  }

  const titles: Record<Step, string> = { info: "Seja o Fã Super do Vintage", won: "Você ganhou 1 giro na roleta!", capped: "Compartilhamento registrado" };

  return (
    <>
      <button type="button" className="act" aria-label="Compartilhar no Instagram" onClick={() => setOpen(true)}>
        <Icon name="share" size={20} />
        <span className="mono">Instagram</span>
      </button>

      <Sheet open={open} onClose={close} title={titles[step]}>
        {step === "info" && (
          <>
            <p>
              Você pode ser o <strong>primeiro do ranking de Fã Super do Vintage</strong> repostando {kind === "track" ? "este drop" : "este post"} do
              aplicativo no seu Instagram.
            </p>
            <p>
              Só contabiliza com a <strong>#{HASHTAG}</strong>. A legenda já vai pronta, com a hashtag e o seu código de fã.
            </p>
            {info && (
              <p className="mono m-0 whitespace-pre-wrap break-words border border-line p-3 normal-case tracking-normal text-fg" data-testid="share-caption">
                {info.caption}
              </p>
            )}
            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="btn btn-outline btn-block" onClick={openInstagram} disabled={!!busy} aria-busy={busy === "open" || undefined}>
              {busy === "open" ? "Preparando…" : "Abrir o Instagram e copiar a legenda"}
              <Icon name="external" size={16} />
            </button>
            <button type="button" className="btn btn-primary btn-block" onClick={posted} disabled={!!busy} aria-busy={busy === "claim" || undefined}>
              {busy === "claim" ? "Confirmando…" : "Já postei"}
            </button>
            <button type="button" className="btn btn-ghost" data-close>
              Agora não
            </button>
          </>
        )}

        {step === "won" && (
          <>
            <p aria-live="polite">Obrigado por compartilhar! Estamos levando você para a roleta.</p>
            <button
              type="button"
              className="btn btn-primary btn-block"
              data-autofocus
              onClick={() => {
                setOpen(false);
                setStep("info");
                router.push(`${base}/pickap`);
              }}
            >
              Ir para a roleta agora
            </button>
          </>
        )}

        {step === "capped" && (
          <>
            <p>
              Você já ganhou os giros de compartilhamento de hoje. Este compartilhamento continua valendo para o ranking, assim que o Instagram
              confirmar a <strong>#{HASHTAG}</strong>.
            </p>
            <Link href={`${base}/comunidade?aba=ranking`} className="btn btn-primary btn-block" onClick={close}>
              Ver o ranking
            </Link>
            <button type="button" className="btn btn-outline" data-close>
              Fechar
            </button>
          </>
        )}
      </Sheet>
    </>
  );
}
