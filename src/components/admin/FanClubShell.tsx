import type { ReactNode } from "react";
import { AdminShell, fanClubNav } from "@/components/admin/AdminShell";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { shellUser } from "@/lib/shell";
import { themeStyle } from "@/lib/themes";
import type { Artist, FanClub } from "@/lib/types";

/** Casca do painel de um fã clube (dono e ajudantes), no visual do artista (Noite) e com a foto do fã clube. */
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
      className="adm-noite"
      style={themeStyle(artist.theme)}
      brand={{
        mark: <ClubAvatar src={club.avatar} name={club.name} size={34} />,
        markClass: "bg-transparent",
        title: club.name,
        subtitle: `${club.isMaster ? "Fã clube master" : "Fã clube"} · ${artist.name}`,
      }}
      passwordHref={`/${artist.slug}/conta/senha`}
      nav={fanClubNav(artist.slug, club.slug)}
      active={active}
      user={await shellUser({ initials: "EQ", name: "Equipe do fã clube", role: "Equipe do fã clube" })}
    >
      {children}
    </AdminShell>
  );
}
