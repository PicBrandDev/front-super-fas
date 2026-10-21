"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";

/** Botão para trocar de fã clube (multifandom). */
export function FandomSwitcher({ wide = false }: { wide?: boolean }) {
  const { name, initial, otherFandoms } = useArtist();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative ${wide ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-cream py-1 pl-1 pr-3 text-left font-label text-[13px] font-bold text-ink ${
          wide ? "w-full" : ""
        }`}
      >
        <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-accent font-display text-[15px] text-accent-fg">
          {initial}
        </span>
        <span className={wide ? "flex-1" : ""}>{name}</span>
        <Icon name="chevron-down" size={16} strokeWidth={2.4} />
        <span className="sr-only">Trocar de fandom</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 flex w-[276px] flex-col gap-0.5 rounded-[14px] border-2 border-ink bg-cream p-2 shadow-[5px_5px_0_var(--fc-ink)]">
          <p className="mx-2 my-1.5 font-label text-[11px] font-bold uppercase tracking-widest text-ink-soft">Seus fandoms</p>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-[10px] bg-paper-2 px-2 py-1.5 text-left font-body text-[15px] font-semibold text-ink"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-accent font-display text-[15px] text-accent-fg">
              {initial}
            </span>
            <span className="flex-1">{name}</span>
            <Icon name="check" size={18} strokeWidth={2.6} label="Ativo" />
          </button>
          {/* A API devolve só os nomes dos outros fandoms; a lista de entrada escolhe o ambiente. */}
          {otherFandoms.map((f, i) => (
            <Link
              key={`${f}-${i}`}
              href="/"
              className="flex min-h-12 items-center gap-2.5 rounded-[10px] px-2 py-1.5 font-body text-[15px] font-semibold text-ink no-underline"
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full font-label text-xs font-bold ${
                  i % 2 ? "bg-accent-2 text-ink" : "bg-ink text-paper"
                }`}
              >
                A{i + 2}
              </span>
              <span>{f}</span>
            </Link>
          ))}
          <div className="my-1.5 h-0.5 bg-ink opacity-15" />
          <Link
            href="/"
            className="flex min-h-12 items-center gap-2.5 rounded-[10px] px-2 py-1.5 font-label text-[13px] font-bold text-ink no-underline"
          >
            <Icon name="plus" size={20} strokeWidth={2.4} />
            Entrar em outro fã clube
          </Link>
        </div>
      )}
    </div>
  );
}
