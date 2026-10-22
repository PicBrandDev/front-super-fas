import type { ReactNode } from "react";
import { AdminShell, fanClubNav } from "@/components/admin/AdminShell";
import { initialsOf, shellUser } from "@/lib/shell";
import type { Artist, FanClub } from "@/lib/types";

/** Casca do painel de um fã clube (dono e ajudantes). O selo leva a inicial do clube na cor do artista. */
export async function FanClubShell({
  artist,
  club,
  active,
  children,
}: {
  artist: Artist;
  club: FanClub;
  active: string;
  children: ReactNode;
}) {
  return (
    <AdminShell
      brand={{
        mark: (
          <span
            className="flex size-full items-center justify-center rounded-lg text-lg font-normal"
            style={{ background: artist.brandColor, color: artist.theme.text, fontFamily: artist.theme.fontDisplay }}
          >
            {initialsOf(club.name).charAt(0)}
          </span>
        ),
        markClass: "bg-transparent",
        title: club.name,
        subtitle: `${club.isMaster ? "Fã clube master" : "Fã clube"} · ${artist.name}`,
      }}
      passwordHref={`/${artist.slug}/conta/senha`}
      nav={fanClubNav(artist.slug, club.slug)}
      active={active}
      extraLink={{ label: "Ver página do clube", href: `/${artist.slug}/clubes/${club.slug}` }}
      user={await shellUser({ initials: "EQ", name: "Equipe do fã clube", role: "Equipe do fã clube" })}
    >
      {children}
    </AdminShell>
  );
}
