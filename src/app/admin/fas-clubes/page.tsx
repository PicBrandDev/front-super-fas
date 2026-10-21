import type { Metadata } from "next";
import { shellUser } from "@/lib/shell";
import { AdminShell, masterNav } from "@/components/admin/AdminShell";
import { getClubs, listArtists } from "@/lib/api";
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
      // Os fã clubes do ambiente (até 10) e seus donos.
      team: (await getClubs(a.slug)).map((c) => ({
        name: c.name,
        role: `${c.isMaster ? "Master · " : ""}${c.owner ? `dono: ${c.owner.name}` : "sem dono"}`,
      })),
      modules: a.modules ?? {},
    })),
  );

  return (
    <AdminShell
      subtitle="Admin da plataforma"
      nav={masterNav}
      active="fas-clubes"
      extraLink={{ label: "Ver portal do patrocinador", href: "/patrocinador" }}
      user={await shellUser({ initials: "VC", name: "Você", role: "Admin master" })}
    >
      <FasClubesClient initialClubs={clubs} />
    </AdminShell>
  );
}
