"use client";

import { useEffect, useState } from "react";

type Options = {
  /** Quanto rolar (px) numa direção antes de esconder ou mostrar. */
  threshold?: number;
  /** Até essa altura (px) do topo, as barras ficam sempre visíveis. */
  topOffset?: number;
  /** A essa distância (px) do fim da página, as barras voltam. */
  bottomOffset?: number;
};

/**
 * Diz se as barras do app devem se recolher: rolando para baixo elas somem,
 * rolando para cima voltam. Ficam visíveis perto do topo e no fim da página,
 * e nunca somem com `prefers-reduced-motion`. Lê a rolagem uma vez por quadro.
 */
export function useScrollDirection({ threshold = 8, topOffset = 64, bottomOffset = 24 }: Options = {}): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = window.scrollY;
    let travel = 0; // distância acumulada na direção atual
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - last;
      last = y;
      const atTop = y <= topOffset;
      const atEnd = window.innerHeight + y >= document.documentElement.scrollHeight - bottomOffset;
      if (motion.matches || atTop || atEnd) {
        travel = 0;
        setHidden(false);
        return;
      }
      if (delta === 0) return;
      travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta;
      if (travel > threshold) setHidden(true);
      else if (travel < -threshold) setHidden(false);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMotion = () => {
      if (motion.matches) setHidden(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    motion.addEventListener("change", onMotion);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onMotion);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold, topOffset, bottomOffset]);

  return hidden;
}
