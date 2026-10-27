import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exampleInAppAds, type InAppAd } from "@/lib/ads";
import { apiEnabled, getArtist, getClubs, getInAppAds, getPosts, getRanking } from "@/lib/api";
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
  const [artist, posts, clubs, ranking, inApp] = await Promise.all([
    getArtist(artista),
    getPosts(artista),
    getClubs(artista),
    getRanking(artista),
    getInAppAds(artista),
  ]);
  if (!artist) notFound();
  // Campanhas do feed em rodízio. Hoje o back manda uma só (ou null); a lista já aceita várias.
  // Sem campanha, entra o exemplo de ./ads para o espaço nunca ficar vazio na demo.
  const feedAds = ([] as (InAppAd | null | undefined)[]).concat(inApp.feed).filter((a): a is InAppAd => !!a);
  const ads = feedAds.length ? feedAds : [exampleInAppAds().feed].filter((a): a is InAppAd => !!a);
  // Dono (ou equipe) de fã clube: a Comunidade é só do fã clube dele. Os outros fãs veem os fã clubes que seguem.
  const owned = clubs.filter((c) => !!c.myRole);
  const ownerView = owned.length > 0;
  const followed = (ownerView ? owned : clubs.filter((c) => c.joined))
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
      ads={ads}
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
