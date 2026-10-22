import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAnalyticsView } from "@/components/admin/ClubAnalyticsView";
import { FanClubShell } from "@/components/admin/FanClubShell";
import { getArtist, getClub } from "@/lib/api";

export const metadata: Metadata = { title: "Visão geral do fã clube" };

/** Entrada do painel do fã clube: números, gráficos e o feed do fã clube num celular. */
export default async function ClubAdminIndex({ params }: { params: Promise<{ artista: string; clube: string }> }) {
  const { artista, clube } = await params;
  const [artist, club] = await Promise.all([getArtist(artista), getClub(artista, clube)]);
  if (!artist || !club) notFound();
  return (
    <FanClubShell artist={artist} club={club} active="visao">
      <ClubAnalyticsView artistSlug={artist.slug} clube={club.slug} />
    </FanClubShell>
  );
}
