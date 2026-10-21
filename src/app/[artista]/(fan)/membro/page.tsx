import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatBRL, getArtist, getMemberPerks } from "@/lib/api";
import { withArtist } from "@/lib/authArtist";
import { MembroView } from "./MembroView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Tornar membro · Fã clube ${artist.name}` : "Tornar membro" };
}

export default async function MembroPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, perks] = await Promise.all([getArtist(artista), getMemberPerks(artista)]);
  if (!artist) notFound();
  return (
    <MembroView
      artistName={artist.name}
      priceLabel={formatBRL(artist.memberPriceCents)}
      perks={perks}
      accountHref={withArtist("/conta", artist.slug)}
    />
  );
}
