import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getClubsHighlights } from "@/lib/api";
import { Destaques } from "./Destaques";

export const metadata: Metadata = { title: "Destaques dos fã clubes" };

/** Qual fã clube tem mais conteúdo, bomba mais no feed, tem mais membros ativos e mais inscritos. */
export default async function DestaquesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const clubs = await getClubsHighlights(artist.slug);
  return (
    <ClubAdminShell artist={artist} active="destaques">
      <AdminPageHeader
        title="Destaques dos fã clubes"
        headingId="destaques-title"
        description={`Compare os fã clubes de ${artist.name}: conteúdo, feed, membros ativos e inscritos. Os números do feed e de atividade são dos últimos 30 dias.`}
      />
      {clubs.length ? (
        <Destaques artist={artist.slug} clubs={clubs} />
      ) : (
        <AdminEmpty title="Sem fã clubes no ar" text="Quando houver fã clubes no ar, a comparação aparece aqui." />
      )}
    </ClubAdminShell>
  );
}
