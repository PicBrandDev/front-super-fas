"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";

/** O oval tem proporção de rosto (3 por 4) e ocupa até 66% da largura e 68% da altura da tela de captura. */
const OVAL_RATIO = 4 / 3;
const ovalWidth = (cw: number, ch: number) => Math.min(cw * 0.66, (ch * 0.68) / OVAL_RATIO);
/** A foto é recortada um pouco além do oval, para sobrar testa, queixo e orelhas. */
const CROP_PAD = 1.25;

/**
 * Câmera da frente em tela cheia com um oval para encaixar o rosto. A foto sai recortada ao redor do oval (JPG)
 * e vai para o Photo Finder. O navegador pede permissão; sem câmera, o fã pode enviar uma foto da galeria.
 */
export function FaceCamera({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState({ w: 0, h: 0 }); // largura e altura do oval, em px

  // Acompanha o tamanho da tela de captura (girar o celular, redimensionar a janela).
  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const measure = () => {
      const w = ovalWidth(box.clientWidth, box.clientHeight);
      setSize({ w, h: w * OVAL_RATIO });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false })
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
        if (alive) setError("Não foi possível abrir a câmera. Permita o acesso à câmera no navegador ou envie uma foto da galeria.");
      });
    return () => {
      alive = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const shoot = () => {
    const v = video.current;
    const box = stage.current;
    if (!v || !box || !ready || !v.videoWidth) return;
    // O vídeo preenche a tela cortando as sobras (object-cover): descobre onde o oval cai nos pixels do vídeo.
    const cw = box.clientWidth;
    const ch = box.clientHeight;
    const k = Math.max(cw / v.videoWidth, ch / v.videoHeight);
    const offX = (cw - v.videoWidth * k) / 2;
    const offY = (ch - v.videoHeight * k) / 2;
    const ow = ovalWidth(cw, ch) * CROP_PAD;
    const oh = ow * OVAL_RATIO;
    // O oval fica centrado na largura, então o espelhamento da câmera da frente não muda o recorte.
    const cx = cw / 2;
    const cy = ch * 0.46;
    const sx = Math.max(0, (cx - ow / 2 - offX) / k);
    const sy = Math.max(0, (cy - oh / 2 - offY) / k);
    const sw = Math.min(v.videoWidth - sx, ow / k);
    const sh = Math.min(v.videoHeight - sy, oh / k);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw);
    canvas.height = Math.round(sh);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(new File([blob], `selfie-${Date.now()}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92,
    );
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Tirar selfie" className="fixed inset-0 z-[60] flex flex-col bg-black text-fg" onKeyDown={(e) => e.key === "Escape" && onClose()}>
      <header className="flex items-center justify-between gap-3 px-4 py-2">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancelar
        </button>
        <strong className="mono">Sua selfie</strong>
        <span className="w-[72px]" aria-hidden="true" />
      </header>

      <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden bg-black">
        {error ? (
          <p className="m-0 mx-auto max-w-[32ch] px-6 pt-24 text-center text-[15px] leading-6 text-fg-muted" role="alert">
            {error}
          </p>
        ) : (
          <>
            <video ref={video} playsInline muted autoPlay className="absolute inset-0 h-full w-full -scale-x-100 object-cover" />
            {/* Máscara: escurece tudo fora do oval. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[3px] border-solid border-white shadow-[0_0_0_100vmax_rgba(0,0,0,0.62)]"
              style={{ width: size.w, height: size.h }}
            />
            <p className="pointer-events-none absolute inset-x-0 bottom-4 m-0 px-6 text-center text-[15px] font-bold leading-5 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
              {ready ? "Encaixe o rosto no oval, de frente e com boa luz" : "Abrindo a câmera…"}
            </p>
          </>
        )}
      </div>

      <footer className="flex items-center justify-center px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={shoot}
          disabled={!ready || !!error}
          aria-label="Tirar selfie"
          className="flex size-16 cursor-pointer items-center justify-center rounded-full border-4 border-solid border-white bg-transparent text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="camera" size={26} />
        </button>
      </footer>
    </div>
  );
}
