"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useArtist } from "./ArtistContext";
import { BottomNav } from "./BottomNav";
import { MemberStrip } from "./MemberStrip";
import { chromeFor } from "./nav";

/**
 * Conteúdo + barra fixa de baixo (faixa de membro e menu) no celular.
 * O que aparece embaixo depende da tela (ver `chromeFor` em nav.ts), e o
 * espaço reservado no fim do conteúdo acompanha.
 */
export function FanFrame({ children }: { children: ReactNode }) {
  const { base, viewer } = useArtist();
  const pathname = usePathname();
  const chrome = chromeFor(pathname, base);
  const strip = chrome.memberStrip && !viewer.isMember;
  const pad = chrome.bottomNav ? (strip ? "pb-[136px]" : "pb-[84px]") : strip ? "pb-[64px]" : "pb-0";
  return (
    <>
      <div className={`min-w-0 flex-1 ${pad} lg:pb-0`}>{children}</div>
      {(chrome.bottomNav || strip) && (
        <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
          {strip && <MemberStrip />}
          {chrome.bottomNav && <BottomNav />}
        </div>
      )}
    </>
  );
}
