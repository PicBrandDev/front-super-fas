import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exampleInAppAds, type InAppAd } from "@/lib/ads";
import { apiEnabled, getArtist, getClubFeedAds, getClubs, getFeedAds, getInAppAds, getPosts, getRanking } from "@/lib/api";
import type { FeedAdItem } from "@/lib/types";
import { ComunidadeView } from "./ComunidadeView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Comunidade · Fã clube ${artist.name}` : "Comunidade" };
}

/** Criativos das vitrines do feed (por posição) mais a campanha do feed do app, sem repetir a mesma campanha. */
function feedPool(vitrine: FeedAdItem[], inApp?: InAppAd | null): InAppAd[] {
  const fromVitrine = [...vitrine]
    .sort((a, b) => a.position - b.position)
    .map((a): InAppAd => ({ id: `vitrine-${a.position}`, sponsor: a.sponsor, title: a.title, text: a.text, cta: a.cta, url: a.url, imageUrl: a.artUrl ?? null }));
  const all = inApp ? [...fromVitrine, inApp] : fromVitrine;
  return all.filter((a, i) => all.findIndex((b) => b.sponsor === a.sponsor && b.title === a.title) === i);
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
  const [artist, posts, clubs, ranking, inApp, vitrineAds] = await Promise.all([
    getArtist(artista),
    getPosts(artista),
    getClubs(artista),
    getRanking(artista),
    getInAppAds(artista),
    getFeedAds(artista),
  ]);
  if (!artist) notFound();
  // Campanhas do feed em rodízio, a cada COMMUNITY_AD_EVERY posts: as das vitrines do feed (na ordem das posições)
  // e a campanha do feed dentro do app. Só sem API (modo exemplo) entra o anúncio de exemplo de ./ads.
  const ads = feedPool(vitrineAds, inApp.feed);
  if (!ads.length && !apiEnabled()) ads.push(...[exampleInAppAds().feed].filter((a): a is InAppAd => !!a));
  // Dono (ou equipe) de fã clube: a Comunidade é só do fã clube dele. Os outros fãs veem os fã clubes que seguem.
  const owned = clubs.filter((c) => !!c.myRole);
  const ownerView = owned.length > 0;
  const followed = (ownerView ? owned : clubs.filter((c) => c.joined))
    .map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster }));
  const clubAds = await Promise.all(followed.map((c) => getClubFeedAds(artista, c.slug)));
  // Filtrando por um fã clube, valem as campanhas das vitrines dele (sem nenhuma, as do cantor).
  const clubFeedAds = Object.fromEntries(followed.map((c, i) => [c.slug, feedPool(clubAds[i])]));
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
      clubAds={clubFeedAds}
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
