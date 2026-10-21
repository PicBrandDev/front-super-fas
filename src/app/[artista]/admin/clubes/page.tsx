import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist, getClubs } from "@/lib/api";
import { ClubesManager } from "./ClubesManager";

export const metadata: Metadata = { title: "Fã clubes" };

export default async function ClubesAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const clubs = await getClubs(artist.slug);
  return (
    <ClubAdminShell artist={artist} active="clubes">
      <ClubesManager artist={artist.slug} artistName={artist.name} clubs={clubs} />
    </ClubAdminShell>
  );
}
