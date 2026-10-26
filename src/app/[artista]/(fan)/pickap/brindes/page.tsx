import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist, getMyRewards } from "@/lib/api";
import { BrindesView } from "./BrindesView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Meus brindes · Fã clube ${artist.name}` : "Meus brindes" };
}

/** Os brindes que o fã ganhou na roleta do PicKap, com o código e como retirar cada um. */
export default async function BrindesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, rewards] = await Promise.all([getArtist(artista), getMyRewards(artista)]);
  if (!artist) notFound();
  return <BrindesView rewards={rewards} />;
}
