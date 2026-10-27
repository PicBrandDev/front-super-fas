"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { trackAd } from "@/app/actions/ads";
import { useArtist } from "./ArtistContext";

/** Manda a visualização ou o clique do anúncio, uma vez por sessão. */
export function reportAd(slug: string, id: string | undefined, kind: "view" | "click") {
  if (!id) return;
  const key = `sf_ad_${kind}_${id}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {}
  void trackAd(slug, id, kind);
}

/**
 * Mede um anúncio: uma visualização quando metade dele aparece na tela e um clique em qualquer link dentro dele
 * (cada um uma vez por sessão). Sem `id` (anúncio de exemplo) não mede nada.
 */
export function AdTrack({ id, children, className }: { id?: string; children: ReactNode; className?: string }) {
  const { slug } = useArtist();
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!id || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        reportAd(slug, id, "view");
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [id, slug]);

  return (
    <div
      ref={box}
      className={className}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a[href]")) reportAd(slug, id, "click");
      }}
    >
      {children}
    </div>
  );
}
