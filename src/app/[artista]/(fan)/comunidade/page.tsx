import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getClubs, getPosts, getRanking } from "@/lib/api";
import { ComunidadeView } from "./ComunidadeView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Comunidade · Fã clube ${artist.name}` : "Comunidade" };
}

/** Comunidade: o feed só dos fã clubes que o fã segue, com o botão + para postar. */
export default async function ComunidadePage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ clube?: string; aba?: string }>;
}) {
  const [{ artista }, { clube, aba }] = await Promise.all([params, searchParams]);
  const [artist, posts, clubs, ranking] = await Promise.all([getArtist(artista), getPosts(artista), getClubs(artista), getRanking(artista)]);
  if (!artist) notFound();
  // Só os fã clubes que o fã segue (entrou) ou que ele administra (equipe).
  const followed = clubs
    .filter((c) => c.joined || !!c.myRole)
    .map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster }));
  const everyone = clubs.map((c) => ({
    slug: c.slug,
    name: c.name,
    city: c.city,
    members: c.members,
    avatar: c.avatar ?? null,
    joined: c.joined || !!c.myRole,
    isMaster: c.isMaster,
  }));
  return (
    <ComunidadeView
      posts={posts}
      clubs={followed}
      allClubs={everyone}
      ranking={ranking}
      initialTab={aba === "ranking" ? "ranking" : "feed"}
      initialClub={followed.some((c) => c.slug === clube) ? (clube ?? null) : null}
      demo={!apiEnabled()}
    />
  );
}
