"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { claimInstagramShare, startInstagramShare, type ShareInfo } from "@/app/actions/fan";
import { useArtist } from "./ArtistContext";
import { Sheet } from "./Sheet";
import { useToast } from "./Toast";
import { Icon } from "@/components/icons";
import { buildShareArt, type ShareFormat } from "@/lib/share-art";
import type { Post } from "@/lib/types";

type Step = "info" | "won" | "capped";

const HASHTAG = "EuSouUmSuperFaDoVintage";
const GO_MS = 2200; // quanto tempo a mensagem do giro fica antes de levar à roleta

/**
 * Compartilhar um post oficial ou um Drop no Instagram (ranking Fã Super do Vintage). O app monta duas artes prontas
 * (Stories 9:16 e Feed 4:5) com a foto, a hashtag que conta pontos e o código do fã, e copia a legenda. Um toque abre o
 * compartilhamento do celular, onde o fã escolhe Instagram → Stories, Feed etc. (o Instagram não deixa uma página
 * preencher legenda ou hashtag, por isso a hashtag também vai dentro da imagem). No computador, a arte é baixada.
 * Depois, "Já postei": como o app ainda é de exemplo, rende na hora 1 giro da roleta e leva para o PicKup. O ponto no
 * ranking só vem quando a conferência no Instagram achar a hashtag e o código do fã.
 */
export function ShareInstagram({
  post,
  kind = "post",
}: {
  post: Pick<Post, "id" | "text"> & { image?: { src: string } | null };
  kind?: "post" | "track";
}) {
  const { base, slug, name: artistName } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("info");
  const [busy, setBusy] = useState<"open" | "claim" | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState<ShareInfo | null>(null);
  // Artes prontas (geradas ao abrir, para o compartilhamento sair no mesmo toque do fã).
  const [arts, setArts] = useState<Partial<Record<ShareFormat, { file: File; url: string }>>>({});

  const close = () => {
    setOpen(false);
    setStep("info");
    setError("");
  };

  // Ao abrir: registra a intenção (legenda com hashtag e código) e monta as duas artes.
  useEffect(() => {
    if (!open || step !== "info") return;
    let alive = true;
    void (async () => {
      const data = await ensureShare();
      if (!data || !alive) return;
      const made: Partial<Record<ShareFormat, { file: File; url: string }>> = {};
      for (const format of ["story", "feed"] as const) {
        try {
          const blob = await buildShareArt({
            format,
            imageSrc: post.image?.src,
            text: post.text,
            hashtag: data.hashtag,
            code: data.code,
            artistName,
          });
          made[format] = { file: new File([blob], `${slug}-${format}.jpg`, { type: "image/jpeg" }), url: URL.createObjectURL(blob) };
        } catch {
          /* sem arte desse formato: o botão cai no texto e na legenda copiada */
        }
      }
      if (alive) setArts(made);
      else Object.values(made).forEach((a) => URL.revokeObjectURL(a.url));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step]);

  // Libera as imagens geradas quando elas trocam ou o componente sai da tela.
  useEffect(() => () => Object.values(arts).forEach((a) => a && URL.revokeObjectURL(a.url)), [arts]);

  // Depois da mensagem do giro, leva para a roleta.
  useEffect(() => {
    if (step !== "won") return;
    const t = setTimeout(() => {
      setOpen(false);
      setStep("info");
      router.push(`${base}/pickup`);
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

  /**
   * Um toque: copia a legenda e leva ao Instagram. Tudo que precisa do gesto do fã (compartilhar, abrir janela ou app)
   * é chamado direto no toque, sem esperar nada antes: o Safari do iPhone e os bloqueadores de janela recusam o contrário.
   */
  function postTo(format: ShareFormat) {
    if (busy) return;
    setError("");
    const data = info;
    const art = arts[format];
    if (!data) return;
    // A legenda com a hashtag e o código vai para a área de transferência (sem esperar a resposta): o fã cola no post.
    const copy = navigator.clipboard?.writeText(data.caption).then(
      () => true,
      () => false,
    );
    const hint = async (saved: boolean) => {
      const copied = copy ? await copy : false;
      toast.show(
        saved
          ? copied ? "Arte salva e legenda copiada. Escolha a arte no Instagram e cole a legenda." : "Arte salva. Escolha a arte no Instagram e use a hashtag."
          : copied ? "Legenda copiada. Cole no seu post do Instagram." : "Poste e use a hashtag na legenda.",
      );
    };

    const mobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);

    // Salva a arte e abre o Instagram (o app no celular, o site no computador).
    const openInstagram = () => {
      if (art) download(art);
      void hint(!!art);
      if (mobile) {
        // Atalho do app: a câmera dos Stories (de onde se escolhe a arte salva) ou o app aberto para o Feed.
        window.location.href = format === "story" ? "instagram://story-camera" : "instagram://app";
        // Sem o app instalado a página continua aberta: cai no site.
        setTimeout(() => {
          if (!document.hidden) window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        }, 1500);
      } else {
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
      }
    };

    // Celular com compartilhamento de arquivo: abre o menu do aparelho com a arte (Instagram → Stories, Feed...).
    // No computador não usa o menu do sistema (no Windows ele nem lista o Instagram): vai direto para o site.
    if (mobile && art && navigator.canShare?.({ files: [art.file] })) {
      navigator
        .share({ files: [art.file], text: data.caption })
        .then(() => hint(false))
        .catch((e: Error) => {
          if (e.name !== "AbortError") openInstagram(); // o fã fechar o menu não conta como erro
        });
      return;
    }
    openInstagram();
  }

  function download(art: { file: File; url: string }) {
    const a = document.createElement("a");
    a.href = art.url;
    a.download = art.file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
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
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Escolha onde postar">
              {(
                [
                  ["story", "Stories", "9:16"],
                  ["feed", "Feed", "4:5"],
                ] as const
              ).map(([format, label, ratio]) => {
                const art = arts[format];
                return (
                  <button
                    key={format}
                    type="button"
                    onClick={() => postTo(format)}
                    disabled={!info || !!busy}
                    className="flex cursor-pointer flex-col items-stretch gap-2 border border-line bg-night p-2 text-left text-fg disabled:cursor-wait disabled:opacity-70"
                  >
                    <span className={`relative block w-full overflow-hidden bg-raised ${format === "story" ? "aspect-[9/16]" : "aspect-[4/5]"}`}>
                      {art ? (
                        // eslint-disable-next-line @next/next/no-img-element -- prévia local (blob) da arte
                        <img src={art.url} alt={`Prévia da arte para ${label}`} className="size-full object-cover" />
                      ) : (
                        <span className="mono absolute inset-0 flex items-center justify-center p-2 text-center">{info ? "Montando a arte…" : "Preparando…"}</span>
                      )}
                    </span>
                    <span className="btn btn-primary btn-sm btn-block pointer-events-none">
                      <Icon name="share" size={14} />
                      Postar no {label}
                    </span>
                    <span className="mono text-center">{ratio}</span>
                  </button>
                );
              })}
            </div>
            <p className="m-0 text-[13px] leading-5">
              Toque em <strong>Postar</strong>: no celular abre o compartilhamento (escolha <strong>Instagram</strong> e depois Stories ou Feed) e a legenda com a
              hashtag fica copiada para colar. Se o celular não abrir o compartilhamento, a arte é salva e o Instagram abre. No computador, a arte é baixada e o
              site do Instagram abre.
            </p>
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
                router.push(`${base}/pickup`);
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
