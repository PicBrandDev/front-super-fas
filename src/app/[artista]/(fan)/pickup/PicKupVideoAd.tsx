"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";
import v from "./PicKupVideoAd.module.css";

const TICK_MS = 250;
/** Depois que o vídeo já tem imagem: sem progresso por esse tempo (erro, rede travada), cai na arte parada. */
const STALL_MS = 4000;
/** Antes do primeiro quadro: tempo para carregar em rede de celular lenta antes de desistir do vídeo. */
const LOAD_MS = 15000;
/** Arte parada (vídeo falhou ou anúncio sem vídeo): contagem curta antes de liberar. */
const IMAGE_SECONDS = 5;
/** Folga no fim: alguns navegadores param o `currentTime` um pouco antes da `duration`. */
const END_SLACK_S = 0.25;

type Mode = "video" | "image" | "none";

const validDuration = (d: number) => (Number.isFinite(d) && d > 0 ? d : null);

/**
 * Vídeo patrocinado antes do giro (tela cheia, obrigatório).
 *
 * - Toca uma vez só, na duração real do vídeo (`loadedmetadata`), e libera o "Girar agora" no `ended`
 *   ou quando o tempo tocado chega à duração.
 * - Começa com som: o overlay abre a partir do toque em "Girar", então o `play()` sai dentro do gesto
 *   do usuário. Se o navegador recusar (`NotAllowedError`), toca mudo e mostra "Ativar som".
 * - Nunca tela preta: enquanto o vídeo não tem imagem, fica a arte do anúncio (ou um estado de
 *   carregamento). Erro ou 4 s sem progresso: cai na arte com contagem curta; sem arte, libera o giro
 *   sem anúncio.
 * - "Agora não" fecha sem girar a qualquer momento; Esc só depois de liberado.
 */
export function PicKupVideoAd({
  ad,
  onDone,
  onDismiss,
}: {
  ad: InAppAd;
  onDone: () => void; // "Girar agora"
  onDismiss: (watched: boolean) => void; // "Agora não" ou Esc depois de liberado: fecha sem girar (não gasta o giro)
}) {
  const box = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<Mode>(() => (ad.videoUrl ? "video" : ad.imageUrl ? "image" : "none"));
  const [muted, setMuted] = useState(false);
  const [soundBlocked, setSoundBlocked] = useState(false); // o navegador não deixou começar com som
  const [needTap, setNeedTap] = useState(false); // parado sem ser o fim: botão "Tocar vídeo"
  const [hasFrame, setHasFrame] = useState(false); // o vídeo já tem imagem para mostrar
  const [duration, setDuration] = useState<number | null>(null);
  const [played, setPlayed] = useState(0); // segundos tocados
  const [videoDone, setVideoDone] = useState(false);
  const [imageMs, setImageMs] = useState(0);
  const lastProgress = useRef(0); // último avanço do vídeo (vigia de travamento)

  const isVideo = mode === "video";
  const imageTotal = Math.max(1, Math.round(ad.minSeconds ?? IMAGE_SECONDS));
  const locked = isVideo ? !videoDone : mode === "image" ? imageMs < imageTotal * 1000 : true;
  let left: number | null;
  let progress: number;
  if (isVideo) {
    left = duration ? Math.max(0, Math.ceil(duration - played)) : null;
    progress = videoDone ? 1 : duration ? Math.min(1, played / duration) : 0;
  } else {
    left = Math.max(0, Math.ceil(imageTotal - imageMs / 1000));
    progress = mode === "image" ? Math.min(1, imageMs / (imageTotal * 1000)) : 0;
  }

  /** O vídeo não serve: arte parada se houver, senão libera o giro sem anúncio. */
  const fallBack = useCallback(() => {
    video.current?.pause();
    setMode(ad.imageUrl ? "image" : "none");
  }, [ad.imageUrl]);

  /** Toca com som; se o navegador recusar, toca mudo e oferece "Ativar som". */
  // O estado só muda depois da resposta do `play()` (o "Tocar vídeo" some no `playing`).
  const start = useCallback((withSound: boolean) => {
    const el = video.current;
    if (!el) return;
    lastProgress.current = Date.now();
    el.muted = !withSound;
    const errName = (err: unknown) => (err as DOMException | undefined)?.name;
    el.play().catch((err: unknown) => {
      if (errName(err) === "AbortError") return; // desmontou / trocou de modo no meio
      if (!withSound || errName(err) !== "NotAllowedError") {
        setNeedTap(true);
        return;
      }
      // Som bloqueado pelo navegador: toca mudo e mostra "Ativar som".
      setSoundBlocked(true);
      setMuted(true);
      el.muted = true;
      el.play().catch((err2: unknown) => {
        // Nem mudo (ex.: iOS em economia de energia): espera o toque em "Tocar vídeo"; a arte fica na tela.
        if (errName(err2) !== "AbortError") setNeedTap(true);
      });
    });
  }, []);

  // Ao abrir, ainda dentro do gesto do toque em "Girar" (layout effect roda no mesmo commit do clique).
  useLayoutEffect(() => {
    if (mode !== "video") return;
    start(true);
    // Só ao abrir: depois quem manda são os eventos do vídeo e os botões.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Vigia: sem avanço enquanto deveria estar tocando (erro silencioso, `stalled`, rede travada). Até o primeiro
  // quadro a folga é maior (LOAD_MS): em 3G o vídeo demora a começar e não deve cair na arte antes de tocar.
  useEffect(() => {
    if (!isVideo || videoDone || needTap) return;
    const limit = hasFrame ? STALL_MS : LOAD_MS;
    lastProgress.current = Date.now();
    const t = setInterval(() => {
      if (document.hidden) lastProgress.current = Date.now();
      else if (Date.now() - lastProgress.current > limit) fallBack();
    }, 500);
    return () => clearInterval(t);
  }, [isVideo, videoDone, needTap, hasFrame, fallBack]);

  // Aba escondida: pausa (o tempo fora não conta) e retoma ao voltar.
  useEffect(() => {
    if (!isVideo || videoDone) return;
    const onVis = () => {
      const el = video.current;
      if (!el) return;
      if (document.hidden) el.pause();
      else if (el.paused && !el.ended) start(!el.muted);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [isVideo, videoDone, start]);

  // Arte parada: contagem só com a aba visível.
  useEffect(() => {
    if (mode !== "image" || !locked) return;
    let last = Date.now();
    const t = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(now - last, TICK_MS * 2); // teto por tick: app em segundo plano não conta
      last = now;
      if (!document.hidden) setImageMs((ms) => Math.min(imageTotal * 1000, ms + dt));
    }, TICK_MS);
    return () => clearInterval(t);
  }, [mode, locked, imageTotal]);

  // Sem vídeo que toque e sem arte: libera o giro direto (não segura o fã numa tela vazia).
  const released = useRef(false);
  useEffect(() => {
    if (mode !== "none" || released.current) return;
    released.current = true;
    onDone();
  }, [mode, onDone]);

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
      const items = Array.from(box.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
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

  const onTime = (el: HTMLVideoElement) => {
    const t = el.currentTime;
    if (t > played) {
      lastProgress.current = Date.now();
      setPlayed(t);
    }
    const d = validDuration(el.duration);
    if (d && t >= d - END_SLACK_S) setVideoDone(true);
  };

  const toggleSound = () => {
    const el = video.current;
    const next = !muted;
    setMuted(next);
    if (!el) return;
    el.muted = next;
    if (!next) setSoundBlocked(false);
    // Toque do usuário: se estava parado, aproveita o gesto para tocar.
    if (el.paused && !el.ended) start(!next);
  };

  // Com vídeo (quase sempre vertical) a parte de baixo fica compacta: "Agora não" vai ao lado da marca.
  const skip = (
    <button type="button" className="btn btn-ghost btn-block" onClick={() => onDismiss(!locked)}>
      Agora não
    </button>
  );
  const playing = isVideo && !videoDone;

  return (
    <div
      ref={box}
      className={v.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pickup-ad-title"
      aria-describedby="pickup-ad-text"
      tabIndex={-1}
    >
      <div className={v.bar}>
        <span className="flex min-w-0 items-center gap-2">
          <span className="tag tag-demo">Patrocinado</span>
          <span className="mono truncate">{ad.sponsor}</span>
        </span>
        {playing && (
          <button type="button" className="btn btn-ghost btn-sm min-h-11" aria-pressed={!muted} onClick={toggleSound}>
            {muted ? "Ativar som" : "Tirar som"}
          </button>
        )}
      </div>

      <div className={v.progress} aria-hidden="true">
        <i style={{ width: `${progress * 100}%` }} />
      </div>

      <div className={v.media}>
        {/* Por baixo do vídeo até ele ter imagem (e no lugar dele se falhar): nunca tela preta. */}
        {(!isVideo || !hasFrame) &&
          (ad.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- arte do anunciante, URL externa ou /uploads
            <img src={ad.imageUrl} alt="" />
          ) : (
            <div className={v.loading} aria-hidden="true">
              <span className="mono">{isVideo ? "Carregando anúncio" : "Liberando seu giro"}</span>
            </div>
          ))}
        {isVideo && (
          <>
            <video
              ref={video}
              src={ad.videoUrl ?? undefined}
              className={hasFrame ? undefined : v.waiting}
              playsInline
              muted={muted}
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
              onLoadedMetadata={(e) => setDuration(validDuration(e.currentTarget.duration))}
              onDurationChange={(e) => {
                const d = validDuration(e.currentTarget.duration);
                if (d) setDuration(d);
              }}
              onLoadedData={() => setHasFrame(true)}
              onPlaying={() => {
                setHasFrame(true);
                setNeedTap(false);
                lastProgress.current = Date.now();
              }}
              onTimeUpdate={(e) => onTime(e.currentTarget)}
              onPause={(e) => {
                // Pausa que não é o fim nem a aba escondida (ex.: iOS cortou o áudio): botão de tocar.
                const el = e.currentTarget;
                if (!el.ended && !document.hidden && el.currentTime < (validDuration(el.duration) ?? Infinity) - END_SLACK_S)
                  setNeedTap(true);
              }}
              onEnded={() => setVideoDone(true)}
              onError={fallBack}
            />
            {needTap && !videoDone && (
              <button type="button" className={`btn btn-outline ${v.resume}`} onClick={() => start(!muted)}>
                <Icon name="play" size={18} className="icon" />
                Tocar vídeo
              </button>
            )}
            {soundBlocked && muted && !needTap && !videoDone && (
              <button type="button" className={`btn btn-outline btn-sm min-h-11 ${v.unmute}`} onClick={toggleSound}>
                <Icon name="music" size={16} className="icon" />
                Ativar som
              </button>
            )}
          </>
        )}
      </div>

      <div className={`${v.body} ${isVideo ? v.compact : ""}`}>
        <h2 id="pickup-ad-title" className={v.title}>
          {ad.title}
        </h2>
        <p id="pickup-ad-text" className={v.text}>
          {ad.text}
        </p>
        <div className={v.pair}>
          <a href={ad.url} target="_blank" rel="sponsored noopener noreferrer" className="btn btn-outline btn-block">
            {ad.cta}
            <Icon name="external" size={16} className="icon" />
          </a>
          {isVideo && skip}
        </div>
        <button ref={goBtn} type="button" className="btn btn-primary btn-block" disabled={locked} onClick={onDone}>
          {!locked ? (
            "Girar agora"
          ) : left === null ? (
            "Seu giro libera no fim do vídeo"
          ) : (
            <span>
              Seu giro libera em <span className="num">{left}s</span>
            </span>
          )}
        </button>
        {!isVideo && skip}
        <p className="sr-only" role="status" aria-live="polite">
          {!locked
            ? "Giro liberado."
            : isVideo
              ? "O giro libera quando o vídeo terminar."
              : `O giro libera depois de ${imageTotal} segundos de anúncio.`}
        </p>
      </div>
    </div>
  );
}
