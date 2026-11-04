import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exampleInAppAds, type InAppAd } from "@/lib/ads";
import { apiEnabled, getArtist, getClubFeedAds, getClubs, getInAppAds, getPosts, getRanking } from "@/lib/api";
import type { FeedAdItem } from "@/lib/types";
import { ComunidadeView } from "./ComunidadeView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Comunidade · Fã clube ${artist.name}` : "Comunidade" };
}

/** A campanha do feed dos fã clubes como criativo do post patrocinado (a mesma para todos os clubes). */
function clubPool(vitrine: FeedAdItem[]): InAppAd[] {
  return vitrine.map((a): InAppAd => ({ id: a.id ?? `clubes-${a.position}`, sponsor: a.sponsor, title: a.title, text: a.text, cta: a.cta, url: a.url, imageUrl: a.artUrl ?? null }));
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
  // "Todos": um post patrocinado das notícias, numa posição "aleatória" entre os primeiros 6 posts: vem do id da campanha,
  // então cada campanha cai num lugar diferente e o servidor e o navegador mostram o mesmo.
  // Só sem API (modo exemplo) entra o anúncio de exemplo de ./ads.
  const newsAd = inApp.news ?? (!apiEnabled() ? (exampleInAppAds().feed ?? null) : null);
  const newsAt = newsAd ? [...newsAd.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % 6 : 0;
  // Dono (ou equipe) de fã clube: a Comunidade é só do fã clube dele. Os outros fãs veem os fã clubes que seguem.
  const owned = clubs.filter((c) => !!c.myRole);
  const ownerView = owned.length > 0;
  const followed = (ownerView ? owned : clubs.filter((c) => c.joined))
    .map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar ?? null, isMaster: c.isMaster }));
  const clubAds = await Promise.all(followed.map((c) => getClubFeedAds(artista, c.slug)));
  // Filtrando por um fã clube, o anúncio dos fã clubes entra depois de cada 2 posts.
  const clubFeedAds = Object.fromEntries(followed.map((c, i) => [c.slug, clubPool(clubAds[i])]));
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
      newsAd={newsAd}
      newsAt={newsAt}
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
