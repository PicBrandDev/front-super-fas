"use client";

import Link from "next/link";
import ChatIconButton from "@/components/chat/ChatIconButton";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";
import { useArtist } from "./ArtistContext";
import { Mark } from "./Mark";

/**
 * Topo do celular, em todas as telas do fã: a marca e o nome do ambiente
 * (levam ao Início) e, à direita, conversas, notificações (com um ponto
 * quando há giros esperando) e a foto de perfil. Fica preso no alto e
 * recolhe junto com o menu de baixo (`hidden`). No desktop o menu lateral
 * faz esse papel.
 */
export function FanTopBar({ avatar, hidden = false }: { avatar: string | null; hidden?: boolean }) {
  const { name, base, viewer, loggedIn } = useArtist();
  return (
    <header className="topbar lg:hidden" data-hidden={hidden || undefined}>
      <Link
        href={base}
        aria-label={`Início do fã clube ${name}`}
        className="flex min-h-11 min-w-0 items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.06em] text-fg no-underline"
      >
        <Mark size={20} />
        <span className="truncate">{name}</span>
      </Link>
      {loggedIn && (
        <div className="-mr-2 flex flex-none items-center">
          <ChatIconButton />
          <Link
            href={`${base}/notificacoes`}
            aria-label={viewer.spins > 0 ? `Notificações, ${viewer.spins} novas` : "Notificações"}
            className="relative flex size-11 items-center justify-center text-fg"
          >
            <Icon name="bell" size={22} />
            {viewer.spins > 0 && <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-2 rounded-full bg-signal" />}
          </Link>
          <Link href={`${base}/perfil`} aria-label="Meu perfil" className="flex size-11 items-center justify-center">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto de perfil
              <img src={avatar} alt="" width={32} height={32} className="size-8 rounded-full border border-line-strong object-cover" />
            ) : (
              <span aria-hidden="true" className="avatar !size-8 !text-[11px]">
                {initialsOf(viewer.name)}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
