import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { getArtist } from "@/lib/api";
import { NovoClube } from "./NovoClube";

export const metadata: Metadata = { title: "Novo fã clube" };

export default async function NovoClubePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  return (
    <ClubAdminShell artist={artist} active="painel">
      <NovoClube artist={artist.slug} artistName={artist.name} />
    </ClubAdminShell>
  );
}
