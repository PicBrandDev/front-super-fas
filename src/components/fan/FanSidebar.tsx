"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Icon } from "@/components/icons";
import { PersonAvatar } from "./PersonAvatar";
import { useArtist } from "./ArtistContext";
import { FandomSwitcher } from "./FandomSwitcher";
import { Mark } from "./Mark";
import { isActive, sideNav } from "./nav";

/**
 * Menu lateral do fã clube (só no desktop): a marca, o nome do artista em
 * caixa alta, a lista de telas com seta (como a apresentação do protótipo),
 * o convite para ser membro e a pessoa logada.
 */
export function FanSidebar() {
  const { slug, name, fanClubName, base, priceLabel, viewer, loggedIn } = useArtist();
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[300px] flex-none flex-col gap-6 overflow-y-auto border-r border-line px-6 py-8 lg:flex">
      <Link href={base} aria-label={`Início do fã clube ${name}`} className="self-start text-amber">
        <Mark size={72} />
      </Link>
      <div className="flex flex-col gap-2">
        <h2 className="poster m-0 text-[44px] leading-10">{name}</h2>
        <span className="mono">Fanzone · {fanClubName}</span>
      </div>

      <FandomSwitcher wide />

      <ul className="jump">
        {sideNav.map((item) => {
          const active = isActive(pathname, base, item);
          return (
            <li key={item.label}>
              <Link href={base + item.href} aria-current={active ? "page" : undefined}>
                <span>{item.label}</span>
                <Icon name="arrow" size={14} className="icon" />
              </Link>
            </li>
          );
        })}
      </ul>

      {!viewer.isMember && (
        <div className="mt-auto flex flex-col gap-3 border-t border-line pt-4">
          <span className="mono">Fã clube · {priceLabel}/mês</span>
          <strong className="poster text-xl leading-6">Seja membro</strong>
          <p className="m-0 text-sm leading-5 text-fg-muted">Drops exclusivos, giros extras e brindes no fã clube.</p>
          <Link href={`${base}/membro`} className="btn btn-primary btn-sm self-start">
            Tornar membro
          </Link>
        </div>
      )}

      <div className={`${viewer.isMember ? "mt-auto" : ""} flex items-center gap-3 border-t border-line pt-4`}>
        <PersonAvatar src={viewer.avatar} name={viewer.name} />
        <div className="flex min-w-0 flex-col">
          <strong className="truncate text-[15px] leading-5">{viewer.name}</strong>
          <span className="mono num">{viewer.luckPoints.toLocaleString("pt-BR")} pts da sorte</span>
        </div>
      </div>
      {loggedIn && (
        <div className="-mt-3 flex gap-2">
          <Link href={`/${slug}/perfil`} className="btn btn-outline btn-sm flex-1">
            Meu perfil
          </Link>
          <form action={logout} className="flex flex-1">
            <button type="submit" className="btn btn-ghost btn-sm flex-1">
              Sair
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
