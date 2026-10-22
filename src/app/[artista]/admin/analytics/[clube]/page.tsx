import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { ClubAnalyticsView } from "@/components/admin/ClubAnalyticsView";
import { getArtist } from "@/lib/api";

export const metadata: Metadata = { title: "Analytics do fã clube" };

export default async function ClubAnalyticsPage({ params }: { params: Promise<{ artista: string; clube: string }> }) {
  const { artista, clube } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  return (
    <ClubAdminShell artist={artist} active="painel">
      <ClubAnalyticsView artistSlug={artist.slug} clube={clube} back={{ href: `/${artist.slug}/admin`, label: "← Todos os fã clubes" }} />
    </ClubAdminShell>
  );
}
