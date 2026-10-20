import { notFound } from "next/navigation";
import { getArtist, listArtists } from "@/lib/api";

export async function generateStaticParams() {
  const artists = await listArtists();
  return artists.map((a) => ({ artista: a.slug }));
}

/** Valida o ambiente do artista; as áreas (fã e admin) definem suas próprias cascas. */
export default async function ArtistLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ artista: string }>;
}) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  return children;
}
