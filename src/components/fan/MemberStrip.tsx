"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useArtist } from "./ArtistContext";

/** Faixa "Seja membro" fixa acima do menu de baixo (some para membros e na própria tela do plano). */
export function MemberStrip() {
  const { base, priceLabel, viewer } = useArtist();
  const pathname = usePathname();
  if (viewer.isMember || pathname.startsWith(`${base}/membro`)) return null;
  return (
    <div className="flex items-center justify-between gap-2.5 border-t-2 border-ink bg-accent py-1.5 pl-4 pr-2 text-accent-fg">
      <span className="flex flex-col leading-tight">
        <strong className="font-body text-sm font-extrabold">Seja membro do fã clube</strong>
        <span className="font-label text-[11px] font-bold">{priceLabel}/mês</span>
      </span>
      <Link
        href={`${base}/membro`}
        className="flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-4 font-label text-xs font-bold text-ink no-underline"
      >
        Tornar membro
      </Link>
    </div>
  );
}
