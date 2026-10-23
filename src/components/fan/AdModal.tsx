"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import type { InAppAd } from "@/lib/ads";

/**
 * Modal de anúncio da área do fã (entrada no app, resgate da roleta).
 * Mesma linguagem da `Sheet`: escurece a tela, folha de baixo, fios de 1px.
 * Com `lockSeconds`, o "Fechar" só libera depois da contagem (Esc e clique fora também).
 */
export function AdModal({
  ad,
  open,
  onClose,
  lockSeconds = 0,
  closeLabel = "Fechar",
}: {
  ad: InAppAd;
  open: boolean;
  onClose: () => void;
  lockSeconds?: number;
  closeLabel?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [left, setLeft] = useState(lockSeconds);
  const locked = left > 0;

  useEffect(() => {
    if (!open) return;
    setLeft(lockSeconds);
    if (lockSeconds <= 0) return;
    const t = setInterval(() => setLeft((s) => (s <= 1 ? (clearInterval(t), 0) : s - 1)), 1000);
    return () => clearInterval(t);
  }, [open, lockSeconds]);

  useEffect(() => {
    if (!open) return;
    const last = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !locked && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      last?.focus?.();
    };
  }, [open, locked, onClose]);

  if (!open) return null;
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && !locked && onClose()}>
      <div ref={box} className="sheet" role="dialog" aria-modal="true" aria-labelledby="ad-title">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="tag tag-demo">Patrocinado</span>
            <span className="mono">{ad.sponsor}</span>
          </span>
          <button
            type="button"
            data-autofocus
            onClick={onClose}
            disabled={locked}
            className="btn btn-ghost btn-sm"
            aria-label={locked ? `Fechar em ${left} segundos` : closeLabel}
          >
            {locked ? <span className="num">{left}s</span> : <Icon name="close" size={18} className="icon" />}
          </button>
        </div>
        {ad.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- arte do anunciante, URL externa ou /uploads
          <img src={ad.imageUrl} alt="" className="aspect-[16/10] w-full rounded-hair border border-line object-cover" />
        )}
        <h2 id="ad-title" className="!text-[28px] !leading-[30px]">
          {ad.title}
        </h2>
        <p>{ad.text}</p>
        <a href={ad.url} target="_blank" rel="sponsored noopener noreferrer" className="btn btn-primary btn-block">
          {ad.cta}
          <Icon name="external" size={16} className="icon" />
        </a>
      </div>
    </div>
  );
}
