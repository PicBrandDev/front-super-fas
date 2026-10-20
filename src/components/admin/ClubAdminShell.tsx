import type { ReactNode } from "react";
import { AdminShell, clubNav } from "@/components/admin/AdminShell";
import type { Artist } from "@/lib/types";
import { shellUser } from "@/lib/shell";

/** Casca da administração do ambiente do cantor (marca do artista + menu do ambiente). */
export async function ClubAdminShell({ artist, active, children }: { artist: Artist; active: string; children: ReactNode }) {
  return (
    <AdminShell
      brand={{
        mark: (
          <span
            className="flex size-full items-center justify-center rounded-lg text-lg font-normal"
            style={{ background: artist.brandColor, color: artist.theme.cream, fontFamily: artist.theme.fontDisplay }}
          >
            {artist.initial}
          </span>
        ),
        markClass: "bg-transparent",
        title: artist.name,
        subtitle: artist.status === "active" ? "Administração do ambiente" : "Ambiente em configuração",
      }}
      nav={clubNav(artist.slug)}
      active={active}
      extraLink={{ label: "Ver área do fã", href: `/${artist.slug}` }}
      user={await shellUser({ initials: "RL", name: "Rafa Lima", role: "Admin master do cantor" })}
    >
      {children}
    </AdminShell>
  );
}
