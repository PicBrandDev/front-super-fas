import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist, getClubAdmins } from "@/lib/api";
import { EquipeClient, type TeamMember } from "./EquipeClient";

export const metadata: Metadata = { title: "Equipe do fã clube" };

export default async function EquipePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const team = (await getClubAdmins(artist.slug)) as TeamMember[];
  return (
    <ClubAdminShell artist={artist} active="equipe">
      <EquipeClient slug={artist.slug} team={team} />
    </ClubAdminShell>
  );
}
