import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getProducts } from "@/lib/api";
import { productImage } from "@/lib/media";
import { LojaCatalog, type StoreItem } from "./LojaCatalog";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Loja · Fã clube ${artist.name}` : "Loja" };
}

export default async function LojaPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, products] = await Promise.all([getArtist(artista), getProducts(artista)]);
  if (!artist) notFound();
  // A foto é escolhida no servidor (a da API, a do id/nome ou uma da fila).
  const items: StoreItem[] = products.map((p, i) => ({ ...p, photo: productImage(artista, p, i) }));
  return <LojaCatalog products={items} demo={!apiEnabled()} />;
}
