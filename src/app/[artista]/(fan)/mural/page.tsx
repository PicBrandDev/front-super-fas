import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getEvents, getMe, getPosts, getProducts, getTracks } from "@/lib/api";
import { isPastEvent } from "@/lib/events";
import { mediaFor, productImage } from "@/lib/media";
import { MuralView } from "./MuralView";
import { buildPosters } from "./posters";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Mural · Fã clube ${artist.name}` : "Mural" };
}

export default async function MuralPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const [{ artista }, { aba }] = await Promise.all([params, searchParams]);
  const [artist, drops, events, products, tracks, me] = await Promise.all([
    getArtist(artista),
    getPosts(artista, "drop"),
    getEvents(artista),
    getProducts(artista),
    getTracks(artista),
    getMe(),
  ]);
  if (!artist) notFound();
  const demo = !apiEnabled();
  const product = products[0] ?? null;
  const posters = buildPosters({
    artistName: artist.name,
    drops,
    event: events.find((e) => !isPastEvent(e)) ?? null,
    product,
    hero: mediaFor(artista)?.hero ?? null,
    productImg: product ? productImage(artista, product, 0) : null,
    tracks,
    demo,
  });
  return <MuralView posters={posters} tracks={tracks} demo={demo} avatar={me?.avatar ?? null} initialTab={aba === "drops" ? "drops" : "wall"} />;
}
