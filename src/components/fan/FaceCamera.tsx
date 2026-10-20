"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "@/components/icons";

type CameraState = "starting" | "live" | "denied" | "unavailable";

/** Proporção da área da câmera (largura / altura). */
const VIEW_RATIO = 3 / 4;

/**
 * Câmera frontal que abre sozinha, com guia oval para encaixar o rosto.
 * Ao clicar no obturador, devolve um JPEG do que aparece no quadro.
 * Se a câmera não estiver disponível (ou o acesso for negado), cai para
 * o envio de arquivo da galeria.
 */
export function FaceCamera({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<CameraState>("starting");
  const [flash, setFlash] = useState(false);

  // Incrementar reabre a câmera (botão "Tentar de novo").
  const [attempt, setAttempt] = useState(0);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  // Abre a câmera ao montar (e a cada nova tentativa) e desliga ao sair.
  useEffect(() => {
    let cancelled = false;
    // Sem mediaDevices (ex.: http fora do localhost) cai no catch como "indisponível".
    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        })
      : Promise.reject(new DOMException("Câmera indisponível", "NotFoundError"));

    request
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {});
        }
        if (!cancelled) setState("live");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof DOMException ? err.name : "";
        setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
      });

    return () => {
      cancelled = true;
      stop();
    };
  }, [attempt, stop]);

  const retry = () => {
    setState("starting");
    setAttempt((n) => n + 1);
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video || state !== "live" || !video.videoWidth) return;

    // Recorta o centro do vídeo na mesma proporção do quadro visível (object-cover).
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    let sw = vw;
    let sh = vw / VIEW_RATIO;
    if (sh > vh) {
      sh = vh;
      sw = vh * VIEW_RATIO;
    }
    const sx = (vw - sw) / 2;
    const sy = (vh - sh) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // A prévia é espelhada (como um espelho), mas a foto sai na orientação real,
    // igual às fotos dos fotógrafos — melhor para a busca por rosto.
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    setFlash(true);
    setTimeout(() => setFlash(false), 180);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stop();
        onCapture(new File([blob], "selfie.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    stop();
    onCapture(file);
  };

  const galleryLabel =
    "flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-cream px-3.5 font-label text-xs font-bold text-ink has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-adm-blue has-[:focus-visible]:outline-solid";

  const fallback = state === "denied" || state === "unavailable";

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border-2 border-ink bg-ink"
        style={{ aspectRatio: `${VIEW_RATIO}` }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-label="Prévia da câmera frontal"
          className={`absolute inset-0 size-full -scale-x-100 object-cover transition-opacity duration-300 ${
            state === "live" ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Máscara com recorte oval para o rosto */}
        {!fallback && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div
              className={`absolute left-1/2 top-[45%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-dashed transition-colors ${
                state === "live" ? "border-accent-2" : "border-cream/40"
              }`}
              style={{ aspectRatio: "3 / 4", boxShadow: "0 0 0 9999px rgb(33 27 22 / 0.62)" }}
            />
          </div>
        )}

        {/* Dica no topo */}
        {!fallback && (
          <p className="absolute inset-x-0 top-3 m-0 text-center font-label text-xs font-bold text-cream">
            {state === "starting" ? "Abrindo a câmera…" : "Encaixe o rosto no oval"}
          </p>
        )}

        {/* Sem câmera: explica e oferece a galeria */}
        {fallback && (
          <div className="halftone-light absolute inset-0 flex flex-col items-center justify-center gap-3 bg-deep p-5 text-center text-cream">
            <Icon name="camera" size={34} />
            <p className="m-0 max-w-[240px] font-body text-[15px] font-bold leading-[1.35]">
              {state === "denied"
                ? "Libere o acesso à câmera no navegador para tirar a selfie."
                : "Não deu para abrir a câmera neste aparelho."}
            </p>
            {state === "denied" && (
              <button
                type="button"
                onClick={retry}
                className="min-h-11 cursor-pointer rounded-full border-2 border-cream bg-transparent px-4 font-label text-xs font-bold text-cream"
              >
                Tentar de novo
              </button>
            )}
          </div>
        )}

        {/* Obturador */}
        {!fallback && (
          <div className="absolute inset-x-0 bottom-3.5 flex justify-center">
            <button
              type="button"
              onClick={capture}
              disabled={state !== "live"}
              aria-label="Tirar selfie"
              className="flex size-[68px] cursor-pointer items-center justify-center rounded-full border-[3px] border-white bg-transparent p-1 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="block size-full rounded-full border-2 border-ink bg-white" />
            </button>
          </div>
        )}

        {flash && <div aria-hidden="true" className="absolute inset-0 bg-cream" />}
      </div>

      <div className="flex items-center justify-center">
        <label className={galleryLabel}>
          <input type="file" accept="image/*" onChange={onFile} className="sr-only" />
          <Icon name="image" size={18} />
          {fallback ? "Escolher selfie da galeria" : "Prefiro enviar da galeria"}
        </label>
      </div>
    </div>
  );
}
