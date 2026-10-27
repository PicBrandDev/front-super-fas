"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { useArtist } from "./ArtistContext";
import { BottomNav } from "./BottomNav";
import { FanTopBar } from "./FanTopBar";
import { isChatThread } from "./nav";

/**
 * Coluna de conteúdo + barras do celular (topo e menu de baixo).
 * As duas barras recolhem juntas ao rolar para baixo e voltam ao rolar para
 * cima. No celular o conteúdo reserva o espaço do menu (--navspace, fixo:
 * não muda quando o menu some). No desktop o menu lateral faz esse papel e a
 * coluna fica centralizada (até 600px). Numa conversa aberta não há barras.
 */
export function FanFrame({ avatar = null, children }: { avatar?: string | null; children: ReactNode }) {
  const { base } = useArtist();
  const pathname = usePathname();
  const hidden = useScrollDirection();
  const chrome = !isChatThread(pathname, base);
  return (
    <>
      <div
        className="pb-navspace relative min-h-dvh w-full min-w-0 flex-1 lg:mx-auto lg:max-w-[600px] lg:border-x lg:border-line lg:pb-12"
        style={chrome ? undefined : ({ "--navspace": "0px" } as CSSProperties)}
      >
        {chrome && <FanTopBar avatar={avatar} hidden={hidden} />}
        {children}
      </div>
      {chrome && <BottomNav hidden={hidden} />}
    </>
  );
}
