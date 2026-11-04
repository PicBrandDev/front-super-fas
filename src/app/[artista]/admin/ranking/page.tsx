import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getHashtagAnalytics, getRankingLeaders } from "@/lib/api";
import { RankingPessoas } from "../RankingPessoas";
import { AnalyticsHashtag } from "./AnalyticsHashtag";
import { RankingLeaders } from "./RankingLeaders";

export const metadata: Metadata = { title: "Ranking de fãs" };

/** Quem é o 1º do ranking geral e de cada fã clube. */
export default async function RankingAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [scopes, analytics] = await Promise.all([getRankingLeaders(artist.slug), getHashtagAnalytics(artist.slug)]);
  return (
    <ClubAdminShell artist={artist} active="ranking">
      <AdminPageHeader
        title="Ranking de fãs"
        headingId="ranking-title"
        description="Os fãs com mais pontos no ranking geral e no de cada fã clube. Clique numa pessoa para ver o histórico."
      />
      {scopes.length ? (
        <>
          {analytics && <AnalyticsHashtag data={analytics} />}
          <RankingPessoas artist={artist.slug} scopes={scopes} />
          <section aria-labelledby="lideres-title" className="flex flex-col gap-3">
            <h2 id="lideres-title" className="m-0 font-display text-3xl font-black">
              Quem está em 1º
            </h2>
            <RankingLeaders artist={artist.slug} scopes={scopes} />
          </section>
        </>
      ) : (
        <AdminEmpty title="Ranking indisponível" text="Ligue o front à API para controlar o ranking." />
      )}
    </ClubAdminShell>
  );
}
