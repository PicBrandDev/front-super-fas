"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useArtist } from "./ArtistContext";
import { deckNav, isActive } from "./nav";

/** Menu de baixo do celular: cinco teclas de piano com LED; a ativa afunda e acende. */
export function BottomNav() {
  const { base } = useArtist();
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="nav lg:hidden">
      <div className="deck">
        {deckNav.map((item) => {
          const active = isActive(pathname, base, item);
          return (
            <Link key={item.label} href={base + item.href} aria-current={active ? "page" : undefined} className="key">
              <i className="led" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
