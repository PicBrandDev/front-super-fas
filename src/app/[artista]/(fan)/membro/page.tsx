import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { formatBRL, getArtist, getMemberPerks } from "@/lib/api";
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
  const priceLabel = formatBRL(artist.memberPriceCents); // "R$ 16,90"
  const priceAmount = priceLabel.replace(/^R\$\s*/u, ""); // "16,90"
  return (
    <MembroView
      artistName={artist.name}
      artistInitial={artist.initial}
      priceLabel={priceLabel}
      priceAmount={priceAmount}
      perks={perks}
    />
  );
}
