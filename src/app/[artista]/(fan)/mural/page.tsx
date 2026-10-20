import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist, getPosts } from "@/lib/api";
import { MuralView } from "./MuralView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Mural · Fã clube ${artist.name}` : "Mural" };
}

export default async function MuralPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, posts] = await Promise.all([getArtist(artista), getPosts(artista)]);
  if (!artist) notFound();
  return <MuralView artistName={artist.name} posts={posts} />;
}
