import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnunciosClient } from "@/components/admin/AnunciosClient";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getAdSlots, getArtist, getEnvCampaigns } from "@/lib/api";

export const metadata: Metadata = { title: "Anúncios do ambiente" };

export default async function AnunciosAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [slots, campaigns] = await Promise.all([getAdSlots(artist.slug), getEnvCampaigns(artist.slug)]);
  return (
    <ClubAdminShell artist={artist} active="anuncios">
      <AnunciosClient
        artist={artist.slug}
        title="Anúncios do ambiente"
        description={`Vitrines que aparecem para todos os fãs de ${artist.name}. Cada fã clube cuida das vitrines dele no próprio painel.`}
        slots={slots}
        campaigns={campaigns}
      />
    </ClubAdminShell>
  );
}
