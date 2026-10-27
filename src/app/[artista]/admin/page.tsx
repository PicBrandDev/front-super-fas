import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist, getClubsHighlights, getClubsOverview, getRankingLeaders } from "@/lib/api";
import { PainelClubes } from "./PainelClubes";

export const metadata: Metadata = { title: "Painel dos fã clubes" };

/** Primeira tela do admin do artista: todos os fã clubes do ambiente, com o dono e os números. */
export default async function ArtistAdminHome({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [clubs, highlights, ranking] = await Promise.all([getClubsOverview(artist.slug), getClubsHighlights(artist.slug), getRankingLeaders(artist.slug)]);
  return (
    <ClubAdminShell artist={artist} active="painel">
      <PainelClubes artist={artist.slug} artistName={artist.name} clubs={clubs} highlights={highlights} ranking={ranking} />
    </ClubAdminShell>
  );
}
