import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist, getClubsOverview } from "@/lib/api";
import { PainelClubes } from "./PainelClubes";

export const metadata: Metadata = { title: "Painel dos fã clubes" };

/** Primeira tela do admin do artista: todos os fã clubes do ambiente, com o dono e os números. */
export default async function ArtistAdminHome({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const clubs = await getClubsOverview(artist.slug);
  return (
    <ClubAdminShell artist={artist} active="painel">
      <PainelClubes artist={artist.slug} artistName={artist.name} clubs={clubs} />
    </ClubAdminShell>
  );
}
