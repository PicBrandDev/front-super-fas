"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";
import { FandomSwitcher } from "./FandomSwitcher";
import { isActive, sideNav } from "./nav";

/** Menu lateral do fã clube (só aparece no desktop). */
export function FanSidebar() {
  const { slug, base, priceLabel, viewer, loggedIn } = useArtist();
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-[268px] flex-none flex-col gap-5 overflow-y-auto border-r-2 border-ink bg-cream px-[18px] py-6 lg:flex">
      <FandomSwitcher wide />
      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {sideNav.map((item) => {
          const active = isActive(pathname, base, item);
          return (
            <Link
              key={item.label}
              href={base + item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 items-center gap-3 rounded-xl px-3.5 font-label text-sm font-bold no-underline ${
                active ? "bg-ink text-paper" : "text-ink hover:bg-paper-2"
              }`}
            >
              <Icon name={item.icon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!viewer.isMember && (
        <div className="mt-auto flex flex-col gap-2.5 rounded-[14px] border-2 border-ink bg-accent p-3.5 text-accent-fg">
          <strong className="font-display text-[22px] font-normal leading-[1.1]">Seja membro</strong>
          <span className="text-sm leading-snug">Drops exclusivos, giros extras e vantagens no fã clube.</span>
          <span className="font-label text-xs font-bold">{priceLabel}/mês</span>
          <Link
            href={`${base}/membro`}
            className="flex min-h-11 items-center justify-center rounded-full border-2 border-ink bg-cream px-3 font-label text-[13px] font-bold text-ink no-underline"
          >
            Tornar membro
          </Link>
        </div>
      )}

      <div
        className={`${viewer.isMember ? "mt-auto" : ""} flex items-center gap-2.5 rounded-[14px] border-2 border-ink bg-accent-2 p-3 text-ink`}
      >
        <span className="flex size-10 flex-none items-center justify-center rounded-full border-2 border-ink bg-cream font-display text-[17px]">
          {viewer.initial}
        </span>
        <div className="flex min-w-0 flex-col">
          <strong className="font-body text-[15px] font-extrabold">{viewer.name}</strong>
          <span className="font-label text-[11px] font-bold">{viewer.luckPoints.toLocaleString("pt-BR")} pts da sorte</span>
        </div>
      </div>
      {loggedIn && (
        <div className="-mt-2.5 flex gap-1.5">
          <Link
            href={`/conta?artista=${slug}`}
            className="flex min-h-11 flex-1 items-center justify-center rounded-full border-2 border-ink bg-cream font-label text-xs font-bold text-ink no-underline"
          >
            Minha conta
          </Link>
          <form action={logout} className="flex flex-1">
            <button
              type="submit"
              className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-transparent font-label text-xs font-bold text-ink"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}
