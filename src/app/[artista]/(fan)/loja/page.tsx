import { notFound } from "next/navigation";
import { getArtist, getProducts } from "@/lib/api";
import { LojaCatalog } from "./LojaCatalog";

export default async function LojaPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, products] = await Promise.all([getArtist(artista), getProducts(artista)]);
  if (!artist) notFound();

  return <LojaCatalog artistName={artist.name} products={products} />;
}
