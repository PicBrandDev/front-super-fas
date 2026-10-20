import type { Metadata } from "next";
import { shellUser } from "@/lib/shell";
import { AdminShell, masterNav } from "@/components/admin/AdminShell";
import { getClubAdmins, listArtists } from "@/lib/api";
import { FasClubesClient, type ClubRow } from "./FasClubesClient";

export const metadata: Metadata = { title: "Admin master — Fã clubes" };

export default async function FasClubesPage() {
  const artists = await listArtists();
  const clubs: ClubRow[] = await Promise.all(
    artists.map(async (a) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      initial: a.initial,
      color: a.brandColor,
      status: a.status,
      members: a.members,
      ads: a.adSlotsSummary,
      team: await getClubAdmins(a.slug),
      modules: a.modules ?? {},
    })),
  );

  return (
    <AdminShell
      brand={{ mark: "P", title: "[Sua plataforma]", subtitle: "Admin master" }}
      nav={masterNav}
      active="fas-clubes"
      extraLink={{ label: "Ver portal do patrocinador", href: "/patrocinador" }}
      user={await shellUser({ initials: "VC", name: "Você", role: "Admin master" })}
    >
      <FasClubesClient initialClubs={clubs} />
    </AdminShell>
  );
}
