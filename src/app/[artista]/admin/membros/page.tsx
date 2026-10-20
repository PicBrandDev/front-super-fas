import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { formatBRL, getArtist, getMembers } from "@/lib/api";
import { MembrosClient } from "./MembrosClient";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Membros — ${artist.name}` : "Membros" };
}

export default async function MembrosPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const members = await getMembers(artist.slug);

  return (
    <ClubAdminShell artist={artist} active="membros">
      <MembrosClient
        slug={artist.slug}
        artistName={artist.name}
        priceCents={artist.memberPriceCents}
        priceLabel={formatBRL(artist.memberPriceCents)}
        avatarColors={[
          { bg: artist.theme.accent, fg: artist.theme.accentFg },
          { bg: "var(--color-adm-ink)", fg: "white" },
          { bg: artist.theme.accent2, fg: artist.theme.ink },
          { bg: "var(--color-adm-blue)", fg: "white" },
        ]}
        members={members}
      />
    </ClubAdminShell>
  );
}
