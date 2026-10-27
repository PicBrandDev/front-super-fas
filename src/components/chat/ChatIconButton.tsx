"use client";

import Link from "next/link";
import { useArtist } from "@/components/fan/ArtistContext";

/**
 * Atalho das conversas no topo do celular: um balão que leva à lista de
 * conversas. Versão provisória, sem contador; a do chat privado (W5)
 * substitui este arquivo e acrescenta o número de não lidas.
 */
export default function ChatIconButton() {
  const { base } = useArtist();
  return (
    <Link href={`${base}/conversas`} aria-label="Conversas" className="relative flex size-11 items-center justify-center text-fg">
      <svg
        className="icon"
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 11.5a8 7.5 0 0 1-11.3 6.8L4 20l1.4-4A7.3 7.3 0 0 1 4 11.5a8 7.5 0 0 1 16 0z" />
      </svg>
    </Link>
  );
}
