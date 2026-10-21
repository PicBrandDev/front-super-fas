"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";
import { Mark } from "./Mark";

/** Botão para trocar de fã clube (multifandom): marca + nome + seta; abre uma lista plana. */
export function FandomSwitcher({ wide = false }: { wide?: boolean }) {
  const { name, otherFandoms } = useArtist();
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
        className={`flex min-h-11 cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left font-grotesk text-xs font-bold uppercase tracking-[0.06em] text-fg ${
          wide ? "w-full" : ""
        }`}
      >
        <Mark size={22} />
        <span className={wide ? "flex-1" : ""}>{name}</span>
        <Icon name="chevron-down" size={16} className="icon text-fg-muted" />
        <span className="sr-only">Trocar de fandom</span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-40 grid w-[276px] gap-0 rounded-field border border-line-strong bg-surface p-3 text-fg">
          <p className="mono m-0 pb-2">Seus fandoms</p>
          <div className="grid border-t border-line">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex min-h-12 cursor-pointer items-center gap-3 border-0 border-b border-line bg-transparent p-0 text-left text-[15px] font-bold text-fg"
            >
              <Mark size={18} />
              <span className="flex-1">{name}</span>
              <Icon name="check" size={14} className="icon text-fg-muted" label="Ativo" />
            </button>
            {/* A API devolve só os nomes dos outros fandoms; a lista de entrada escolhe o ambiente. */}
            {otherFandoms.map((f, i) => (
              <Link
                key={`${f}-${i}`}
                href="/"
                className="flex min-h-12 items-center gap-3 border-b border-line text-[15px] text-fg no-underline hover:text-amber-text"
              >
                <span className="avatar" style={{ width: 24, height: 24 }} aria-hidden="true">
                  {f.replace(/[[\]]/g, "").slice(0, 2)}
                </span>
                <span>{f}</span>
              </Link>
            ))}
            <Link href="/" className="go min-h-12 border-b-0">
              <Icon name="plus" size={14} className="icon" />
              Entrar em outro fã clube
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
