import type { ReactNode } from "react";
import { AdminShell, clubNav } from "@/components/admin/AdminShell";
import type { Artist } from "@/lib/types";
import { shellUser } from "@/lib/shell";
import { themeStyle } from "@/lib/themes";

/** Casca da administração do ambiente do cantor (marca do artista + menu do ambiente). */
export async function ClubAdminShell({ artist, active, children }: { artist: Artist; active: string; children: ReactNode }) {
  return (
    <AdminShell
      className="adm-noite"
      passwordHref={`/${artist.slug}/conta/senha`}
      style={themeStyle(artist.theme)}
      brand={{
        mark: (
          <span
            className="flex size-full items-center justify-center rounded-hair text-lg font-black"
            style={{ background: artist.brandColor, color: artist.theme.text, fontFamily: artist.theme.fontDisplay }}
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
      user={await shellUser({ initials: "EQ", name: "Equipe do fã clube", role: "Administração do ambiente" })}
    >
      {children}
    </AdminShell>
  );
}
