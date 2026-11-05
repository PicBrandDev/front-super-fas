"use client";

import { useEffect, useRef, useState } from "react";
import { TT, Turntable, norm, recordAngleFor, type WheelVariant } from "@/components/fan/Turntable";
import type { BrandKey } from "@/lib/brands";

type Slice = { label: string; remaining: number | null };

/**
 * A roleta do fã clube que o admin pode girar para testar: o mesmo disco que o fã vê. Girar aqui é só uma simulação:
 * não gasta giro, não tira do estoque e não aparece no histórico. O resultado é sorteado entre as fatias que ainda têm brinde.
 */
export function RoletaTeste({ prizes, variant, brand, initial }: { prizes: Slice[]; variant: WheelVariant; brand?: BrandKey; initial: number }) {
  const n = prizes.length;
  const [rot, setRot] = useState(recordAngleFor(initial, n, variant));
  const [on, setOn] = useState(initial);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const rotRef = useRef(rot);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const spin = () => {
    if (spinning || n === 0) return;
    const open = prizes.map((p, i) => ({ p, i })).filter(({ p }) => p.remaining !== 0);
    const pool = open.length ? open : prizes.map((p, i) => ({ p, i }));
    const idx = pool[Math.floor(Math.random() * pool.length)].i;
    const next = rotRef.current + 360 * 5 + ((recordAngleFor(idx, n, variant) - norm(rotRef.current) + 360) % 360);
    rotRef.current = next;
    setSpinning(true);
    setResult(null);
    setOn(-1);
    setRot(next);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(() => {
      setOn(idx);
      setResult(idx);
      setSpinning(false);
    }, reduce ? 50 : 4400);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={spin}
        disabled={spinning}
        aria-label="Girar a roleta de teste"
        className="fan block w-full max-w-[360px] cursor-pointer border-0 bg-transparent p-0 disabled:cursor-progress"
      >
        <Turntable
          variant={variant}
          brand={brand}
          prizes={prizes.map((p) => p.label)}
          deck
          live
          prefix="adm"
          on={on}
          rot={rot}
          arm={variant === "turntable" && spinning ? TT.play : 0}
          playing={spinning}
        />
      </button>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={spin} disabled={spinning} className="min-h-11 cursor-pointer rounded-lg border-0 bg-adm-blue px-5 text-sm font-semibold text-white disabled:opacity-60">
          {spinning ? "Girando…" : result === null ? "Girar a roleta" : "Girar de novo"}
        </button>
      </div>
      <p role="status" aria-live="polite" className="m-0 min-h-10 text-center text-sm">
        {result !== null ? (
          <>
            Caiu a fatia <strong>{result + 1}</strong>: <strong>{prizes[result].label}</strong>
          </>
        ) : (
          <span className="text-adm-muted">Toque no disco ou em “Girar” para testar. É só uma simulação.</span>
        )}
      </p>
    </div>
  );
}
