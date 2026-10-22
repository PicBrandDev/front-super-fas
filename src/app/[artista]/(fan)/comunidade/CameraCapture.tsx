"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/**
 * Câmera dentro do app: mostra a imagem ao vivo, o fã toca no botão e a foto vira um arquivo JPG para o post.
 * Funciona no celular (câmera de trás ou da frente) e no computador (webcam). O navegador pede permissão.
 */
export function CameraCapture({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing } }, audio: false })
      .then((s) => {
        if (!alive) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = video.current;
        if (v) {
          v.srcObject = s;
          void v.play();
        }
        setReady(true);
      })
      .catch(() => {
        if (alive) setError("Não foi possível abrir a câmera. Permita o acesso à câmera no navegador ou anexe uma foto da galeria.");
      });
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const shoot = () => {
    const v = video.current;
    if (!v || !ready || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facing === "user") {
      // A câmera da frente é espelhada na tela; a foto sai do jeito que o fã se vê.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], `foto-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.9,
    );
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Tirar foto" className="fixed inset-0 z-[60] flex flex-col bg-night text-fg" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <strong className="mono">Tirar foto</strong>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setReady(false);
            setFacing((f) => (f === "environment" ? "user" : "environment"));
          }}
          disabled={!!error}
          aria-label="Trocar de câmera"
        >
          Virar
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-black">
        {error ? (
          <p className="m-0 max-w-[32ch] px-6 text-center text-[15px] leading-6 text-fg-muted" role="alert">
            {error}
          </p>
        ) : (
          <video ref={video} playsInline muted autoPlay className={`h-full w-full object-contain ${facing === "user" ? "-scale-x-100" : ""}`} />
        )}
      </div>

      <footer className="flex items-center justify-center border-t border-line px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={shoot}
          disabled={!ready || !!error}
          aria-label="Capturar foto"
          className="flex size-16 cursor-pointer items-center justify-center rounded-full border-4 border-solid border-fg bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="camera" size={26} />
        </button>
      </footer>
    </div>
  );
}
