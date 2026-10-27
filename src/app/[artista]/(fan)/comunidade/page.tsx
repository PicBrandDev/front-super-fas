import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getClubFeedAds, getClubs, getFeedAds, getPosts, getRanking } from "@/lib/api";
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
  const [artist, posts, clubs, ranking, feedAds] = await Promise.all([getArtist(artista), getPosts(artista), getClubs(artista), getRanking(artista), getFeedAds(artista)]);
  if (!artist) notFound();
  // Dono (ou equipe) de fã clube: a Comunidade é só do fã clube dele. Os outros fãs veem os fã clubes que seguem.
  const owned = clubs.filter((c) => !!c.myRole);
  const ownerView = owned.length > 0;
  const followed = (ownerView ? owned : clubs.filter((c) => c.joined))
    .map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster }));
  const clubAds = await Promise.all(followed.map((c) => getClubFeedAds(artista, c.slug)));
  const clubFeedAds = Object.fromEntries(followed.map((c, i) => [c.slug, clubAds[i]]));
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
      feedAds={feedAds}
      clubFeedAds={clubFeedAds}
      clubs={followed}
      allClubs={everyone}
      ownerView={ownerView}
      ranking={ownerView && ranking ? { ...ranking, top: [], clubs: ranking.clubs.filter((c) => owned.some((o) => o.slug === c.slug)) } : ranking}
      initialTab={aba === "ranking" ? "ranking" : "feed"}
      initialClub={followed.some((c) => c.slug === clube) ? (clube ?? null) : null}
      demo={!apiEnabled()}
    />
  );
}
