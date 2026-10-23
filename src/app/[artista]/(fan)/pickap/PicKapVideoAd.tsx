"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { PICKAP_VIDEO_MIN_SECONDS, type InAppAd } from "@/lib/ads";
import v from "./PicKapVideoAd.module.css";

const TICK_MS = 250;

/**
 * Vídeo patrocinado antes do giro (tela cheia, obrigatório).
 * O "Girar agora" só libera depois de `minSeconds` de exibição real: a contagem
 * para com a aba escondida (`document.hidden`) e, havendo vídeo, enquanto ele não toca.
 * Sem `videoUrl` (ou se o vídeo falhar) mostra a arte parada com a mesma contagem.
 * "Agora não" fecha sem girar a qualquer momento; Esc só depois de liberado.
 */
export function PicKapVideoAd({
  ad,
  onDone,
  onDismiss,
}: {
  ad: InAppAd;
  onDone: () => void; // "Girar agora"
  onDismiss: (watched: boolean) => void; // "Agora não" ou Esc depois de liberado: fecha sem girar (não gasta o giro)
}) {
  const total = Math.max(1, Math.round(ad.minSeconds ?? PICKAP_VIDEO_MIN_SECONDS));
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const hasVideo = !!ad.videoUrl && !failed;
  const left = Math.max(0, Math.ceil(total - elapsedMs / 1000));
  const locked = left > 0;
  const counting = locked && (!hasVideo || videoPlaying);

  // Conta só o tempo em que o anúncio está de fato na tela (e o vídeo tocando).
  useEffect(() => {
    if (!counting) return;
    let last = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      // Teto por tick: app em segundo plano (timer congelado) não conta o tempo fora.
      const dt = Math.min(now - last, TICK_MS * 2);
      last = now;
      if (!document.hidden) setElapsedMs((ms) => Math.min(total * 1000, ms + dt));
    }, TICK_MS);
    return () => clearInterval(t);
  }, [counting, total]);

  // Foco no diálogo, trava o rolar da página e prende o Tab dentro dele.
  useEffect(() => {
    const last = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    box.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      last?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (!locked) onDismiss(true);
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const items = Array.from(
        box.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), video[controls]"),
      );
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const end = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === box.current)) {
        e.preventDefault();
        end.focus();
      } else if (!e.shiftKey && active === end) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [locked, onDismiss]);

  // Liberou: o foco vai para o "Girar agora".
  const goBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!locked) goBtn.current?.focus();
  }, [locked]);

  const paused = hasVideo && !videoPlaying && locked;
  // Com vídeo (quase sempre vertical) a parte de baixo fica compacta: "Agora não" vai ao lado da marca.
  const skip = (
    <button type="button" className="btn btn-ghost btn-block" onClick={() => onDismiss(!locked)}>
      Agora não
    </button>
  );

  return (
    <div
      ref={box}
      className={v.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pickap-ad-title"
      aria-describedby="pickap-ad-text"
      tabIndex={-1}
    >
      <div className={v.bar}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="tag tag-demo">Patrocinado</span>
          <span className="mono truncate">{ad.sponsor}</span>
        </span>
        {hasVideo && (
          <button
            type="button"
            className="btn btn-ghost btn-sm min-h-11"
            aria-pressed={!muted}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              if (video.current) video.current.muted = next;
            }}
          >
            {muted ? "Ativar som" : "Tirar som"}
          </button>
        )}
      </div>

      <div className={v.progress} aria-hidden="true">
        <i style={{ width: `${Math.min(100, (elapsedMs / (total * 1000)) * 100)}%` }} />
      </div>

      <div className={v.media}>
        {hasVideo ? (
          <>
            <video
              ref={video}
              src={ad.videoUrl ?? undefined}
              poster={ad.imageUrl ?? undefined}
              playsInline
              muted={muted}
              autoPlay
              loop
              preload="auto"
              onPlaying={() => setVideoPlaying(true)}
              onPause={() => setVideoPlaying(false)}
              onWaiting={() => setVideoPlaying(false)}
              onEnded={() => setVideoPlaying(false)}
              onError={() => {
                setVideoPlaying(false);
                setFailed(true);
              }}
            />
            {paused && (
              <button
                type="button"
                className={`btn btn-outline ${v.resume}`}
                onClick={() => {
                  video.current?.play().catch(() => setFailed(true));
                }}
              >
                <Icon name="play" size={18} className="icon" />
                Tocar vídeo
              </button>
            )}
          </>
        ) : ad.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- arte do anunciante, URL externa ou /uploads
          <img src={ad.imageUrl} alt="" />
        ) : null}
      </div>

      <div className={`${v.body} ${hasVideo ? v.compact : ""}`}>
        <h2 id="pickap-ad-title" className={v.title}>
          {ad.title}
        </h2>
        <p id="pickap-ad-text" className={v.text}>
          {ad.text}
        </p>
        <div className={v.pair}>
          <a href={ad.url} target="_blank" rel="sponsored noopener noreferrer" className="btn btn-outline btn-block">
            {ad.cta}
            <Icon name="external" size={16} className="icon" />
          </a>
          {hasVideo && skip}
        </div>
        <button
          ref={goBtn}
          type="button"
          className="btn btn-primary btn-block"
          disabled={locked}
          onClick={onDone}
        >
          {locked ? (
            <span>
              Seu giro libera em <span className="num">{left}s</span>
            </span>
          ) : (
            "Girar agora"
          )}
        </button>
        {!hasVideo && skip}
        <p className="sr-only" role="status" aria-live="polite">
          {locked ? `O giro libera depois de ${total} segundos de anúncio.` : "Giro liberado."}
        </p>
      </div>
    </div>
  );
}
