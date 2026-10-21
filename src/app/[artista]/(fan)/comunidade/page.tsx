import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getClubs, getPosts } from "@/lib/api";
import { ComunidadeView } from "./ComunidadeView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Comunidade · Fã clube ${artist.name}` : "Comunidade" };
}

/** Comunidade: posts oficiais e da galera, com o campo de escrever para o fã clube. */
export default async function ComunidadePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, posts, clubs] = await Promise.all([getArtist(artista), getPosts(artista), getClubs(artista)]);
  if (!artist) notFound();
  const myClubs = clubs.filter((c) => c.joined).map((c) => ({ slug: c.slug, name: c.name }));
  return <ComunidadeView posts={posts} clubs={myClubs} demo={!apiEnabled()} />;
}
