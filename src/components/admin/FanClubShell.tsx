import type { ReactNode } from "react";
import { AdminShell, fanClubNav } from "@/components/admin/AdminShell";
import type { Artist, FanClub } from "@/lib/types";
import { shellUser } from "@/lib/shell";

/** Casca do painel de um fã clube (dono e ajudantes). */
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
            style={{ background: artist.brandColor, color: artist.theme.cream, fontFamily: artist.theme.fontDisplay }}
          >
            {artist.initial}
          </span>
        ),
        markClass: "bg-transparent",
        title: club.name,
        subtitle: `${club.isMaster ? "Fã clube master" : "Fã clube"} · ${artist.name}`,
      }}
      nav={fanClubNav(artist.slug, club.slug)}
      active={active}
      extraLink={{ label: "Ver página do clube", href: `/${artist.slug}/clubes/${club.slug}` }}
      user={await shellUser({ initials: "DC", name: "Dono do clube", role: "Equipe de fã clube" })}
    >
      {children}
    </AdminShell>
  );
}
