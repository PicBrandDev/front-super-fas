import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getRankingLeaders } from "@/lib/api";
import { RankingLeaders } from "./RankingLeaders";

export const metadata: Metadata = { title: "Ranking Fã Super" };

/** Quem é o 1º do ranking geral e de cada fã clube: pelo placar ou escolhido pela administração. */
export default async function RankingAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const scopes = await getRankingLeaders(artist.slug);
  return (
    <ClubAdminShell artist={artist} active="ranking">
      <AdminPageHeader
        title="Ranking Fã Super"
        headingId="ranking-title"
        description="Escolha quem fica em 1º lugar no ranking geral e no de cada fã clube. Sem escolha, vale o placar de compartilhamentos."
      />
      {scopes.length ? (
        <RankingLeaders artist={artist.slug} scopes={scopes} />
      ) : (
        <AdminEmpty title="Ranking indisponível" text="Ligue o front à API para controlar o ranking." />
      )}
    </ClubAdminShell>
  );
}
