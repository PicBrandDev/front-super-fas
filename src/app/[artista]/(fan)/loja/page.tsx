import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist, getProducts } from "@/lib/api";
import { LojaCatalog } from "./LojaCatalog";

export default async function LojaPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, products] = await Promise.all([getArtist(artista), getProducts(artista)]);
  if (!artist) notFound();

  return <LojaCatalog artistName={artist.name} products={products} />;
}

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Loja · Fã clube ${artist.name}` : "Loja" };
}
