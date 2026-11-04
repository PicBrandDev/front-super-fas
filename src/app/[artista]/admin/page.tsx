import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist, getClubsHighlights, getClubsOverview, getSubscribersAnalytics } from "@/lib/api";
import { PainelClubes } from "./PainelClubes";

export const metadata: Metadata = { title: "Painel dos fã clubes" };

/** Primeira tela do admin do artista: os fã clubes do ambiente (dono e números) e, embaixo, os destaques entre eles. */
export default async function ArtistAdminHome({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [clubs, highlights, subs] = await Promise.all([getClubsOverview(artist.slug), getClubsHighlights(artist.slug), getSubscribersAnalytics(artist.slug)]);
  return (
    <ClubAdminShell artist={artist} active="painel">
      <PainelClubes
        artist={artist.slug}
        clubs={clubs}
        highlights={highlights}
        priceCents={artist.memberPriceCents}
        monthlyRevenueCents={subs?.monthlyRevenueCents ?? null}
      />
    </ClubAdminShell>
  );
}
