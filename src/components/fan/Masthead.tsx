"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export type MastTone = "night" | "amber" | "sun" | "lagoon-deep" | "poster-grey";

const tones: Record<MastTone, { bg: string; fg: string }> = {
  night: { bg: "var(--fc-bg)", fg: "var(--fc-fg)" },
  amber: { bg: "var(--fc-amber)", fg: "var(--fc-ink)" },
  sun: { bg: "var(--fc-sun)", fg: "var(--fc-ink)" },
  "lagoon-deep": { bg: "var(--fc-lagoon-deep)", fg: "var(--fc-fg)" },
  "poster-grey": { bg: "var(--fc-poster-grey)", fg: "var(--fc-mist)" },
};

const SIDE = 16;
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Cabeçalho da tela: a palavra da seção em caixa alta, sempre cortada pela
 * borda, que desliza conforme a aba ativa (`index` de 0 a `steps - 1`).
 * Ao entrar na tela, a palavra chega pela direita (sem movimento com
 * reduced motion). `shiftPx`/`durationMs` deslocam a palavra por fora
 * (ex.: enquanto o PicKup gira).
 */
export function Masthead({
  word,
  label = word,
  steps = 1,
  index = 0,
  tone = "night",
  shiftPx = 0,
  durationMs,
  className = "",
}: {
  word: string;
  label?: string;
  steps?: number;
  index?: number;
  tone?: MastTone;
  shiftPx?: number;
  durationMs?: number;
  className?: string;
}) {
  const box = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const width = useRef(0); // largura da palavra já ajustada
  const entered = useRef(false);

  const fit = () => {
    const m = box.current;
    const w = wordRef.current;
    if (!m || !w || !m.clientWidth) return;
    w.style.setProperty("--mast-size", "112px");
    const w112 = w.offsetWidth;
    const size = Math.min(170, Math.max(112, (112 * m.clientWidth * 1.32) / w112));
    w.style.setProperty("--mast-size", `${size.toFixed(1)}px`);
    width.current = w.offsetWidth;
  };

  const xFor = () => {
    const m = box.current;
    if (!m) return SIDE;
    const t = steps > 1 ? index / (steps - 1) : 0;
    const start = SIDE;
    const end = m.clientWidth - width.current - SIDE;
    return start + (end - start) * t + shiftPx;
  };

  const pan = (duration?: number) => {
    const w = wordRef.current;
    if (!w) return;
    if (!width.current) fit();
    w.style.transitionDuration = duration ? `${duration}ms` : "";
    w.style.setProperty("--mast-x", `${xFor().toFixed(1)}px`);
  };

  // Entrada: a palavra vem de +56px pela direita.
  useIsoLayoutEffect(() => {
    const w = wordRef.current;
    if (!w) return;
    fit();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || entered.current) {
      pan();
      return;
    }
    entered.current = true;
    w.style.transition = "none";
    w.style.setProperty("--mast-x", `${(xFor() + 56).toFixed(1)}px`);
    w.getBoundingClientRect();
    w.style.transition = "";
    pan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    pan(durationMs);
  }, [index, steps, shiftPx, durationMs]);

  useEffect(() => {
    const onResize = () => {
      width.current = 0;
      fit();
      pan(1);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { bg, fg } = tones[tone];
  return (
    <header ref={box} className={`mast ${className}`} style={{ background: bg, color: fg }}>
      <div ref={wordRef} className="mast-word" aria-hidden="true">
        {word}
      </div>
      <h1 className="sr-only">{label}</h1>
    </header>
  );
}
