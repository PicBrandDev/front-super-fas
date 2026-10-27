"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";
import { deckNav, isActive } from "./nav";

/**
 * Menu de baixo do celular: uma doca baixa de cinco ícones. Só a tela atual
 * mostra o nome, em âmbar. Recolhe ao rolar para baixo e volta ao rolar
 * para cima (`hidden`, vindo do FanFrame); com foco por teclado, aparece.
 */
export function BottomNav({ hidden = false }: { hidden?: boolean }) {
  const { base } = useArtist();
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="nav lg:hidden" data-hidden={hidden || undefined}>
      <div className="deck">
        {deckNav.map((item) => {
          const active = isActive(pathname, base, item);
          return (
            <Link
              key={item.label}
              href={base + item.href}
              aria-current={active ? "page" : undefined}
              aria-label={active ? undefined : item.label}
              className="key"
            >
              <Icon name={item.icon} size={20} />
              {active && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
