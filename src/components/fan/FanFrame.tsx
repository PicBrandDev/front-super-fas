"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { usesTone } from "@/lib/brands";
import { themeStyle } from "@/lib/themes";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { useArtist, useBrand } from "./ArtistContext";
import { BottomNav } from "./BottomNav";
import { FanTopBar } from "./FanTopBar";
import { MemberBar } from "./MemberBar";
import { isChatThread } from "./nav";

/**
 * Coluna de conteúdo + barras do celular (topo e menu de baixo).
 * As duas barras recolhem juntas ao rolar para baixo e voltam ao rolar para
 * cima. No celular o conteúdo reserva o espaço do menu (--navspace, fixo:
 * não muda quando o menu some). No desktop o menu lateral faz esse papel e a
 * coluna fica centralizada (até 600px). Numa conversa aberta não há barras.
 * `data-nav-hidden` deixa barras grudadas acima do menu descerem com ele.
 * Nas telas de assinatura da marca (ex.: Mural e PicKup do Departamento) a
 * coluna e as barras trocam para o tema de tom (`toneTheme` em lib/brands.ts).
 */
export function FanFrame({ avatar = null, children }: { avatar?: string | null; children: ReactNode }) {
  const { base } = useArtist();
  const brand = useBrand();
  const pathname = usePathname();
  const hidden = useScrollDirection();
  const chrome = !isChatThread(pathname, base);
  const tone = brand.toneTheme && usesTone(brand, pathname, base) ? themeStyle(brand.toneTheme) : undefined;
  return (
    <div className="contents" style={tone}>
      <div
        className="pb-navspace relative min-h-dvh w-full min-w-0 flex-1 bg-night lg:mx-auto lg:max-w-[600px] lg:border-x lg:border-line lg:pb-12"
        style={chrome ? undefined : ({ "--navspace": "0px" } as CSSProperties)}
        data-nav-hidden={(chrome && hidden) || undefined}
      >
        {chrome && <FanTopBar avatar={avatar} hidden={hidden} />}
        {chrome && <MemberBar />}
        {children}
      </div>
      {chrome && <BottomNav hidden={hidden} />}
    </div>
  );
}
