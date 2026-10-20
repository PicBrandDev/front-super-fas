"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { useArtist } from "./ArtistContext";
import { bottomNav, isActive } from "./nav";

export function BottomNav() {
  const { base } = useArtist();
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="flex justify-around gap-0.5 border-t-2 border-ink bg-paper px-1.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-1.5"
    >
      {bottomNav.map((item) => {
        const active = isActive(pathname, base, item);
        return (
          <Link
            key={item.label}
            href={base + item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[52px] min-w-[64px] flex-col items-center justify-center gap-0.5 rounded-xl font-label text-[11px] font-bold no-underline ${
              active ? "bg-ink text-paper" : "text-ink"
            }`}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
