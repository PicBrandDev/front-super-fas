"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";
import { useArtist } from "./ArtistContext";
import { Mark } from "./Mark";

/**
 * Topo do celular: a marca e o nome do ambiente (levam ao Início), o sino de notificações (com um ponto quando há giros esperando) e a
 * foto de perfil, que abre o perfil. Aparece no Início e no Mural (no desktop o menu lateral faz isso).
 */
export function FanTopBar({ avatar }: { avatar: string | null }) {
  const { name, base, viewer, loggedIn } = useArtist();
  return (
    <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-3.5 lg:hidden">
      <Link href={base} aria-label={`Início do fã clube ${name}`} className="flex min-h-11 items-center gap-2 font-grotesk text-xs font-bold uppercase tracking-[0.06em] text-fg no-underline">
        <Mark size={22} />
        <span>{name}</span>
      </Link>
      {loggedIn && (
        <div className="flex items-center gap-1">
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
              <img src={avatar} alt="" width={36} height={36} className="size-9 rounded-full border border-line-strong object-cover" />
            ) : (
              <span aria-hidden="true" className="avatar !size-9">
                {initialsOf(viewer.name)}
              </span>
            )}
          </Link>
        </div>
      )}
    </header>
  );
}
