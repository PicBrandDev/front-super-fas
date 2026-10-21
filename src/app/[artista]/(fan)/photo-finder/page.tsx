import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getEvents } from "@/lib/api";
import { eventName } from "@/lib/events";
import { eventPhoto } from "@/lib/media";
import { PhotoFinderFlow, type FinderEvent } from "./PhotoFinderFlow";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Photo finder · Fã clube ${artist.name}` : "Photo finder" };
}

export default async function PhotoFinderPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ evento?: string }>;
}) {
  const [{ artista }, { evento }] = await Promise.all([params, searchParams]);
  const [artist, events] = await Promise.all([getArtist(artista), getEvents(artista)]);
  if (!artist) notFound();

  const shows: FinderEvent[] = events.map((e) => ({
    id: e.id,
    label: `${eventName(artist.name, e)} · ${e.day} ${e.month}`,
  }));
  // Fotos "do evento" (por enquanto as de imprensa do artista, ver lib/media.ts).
  const photos = Array.from({ length: 6 }, (_, i) => eventPhoto(artista, i)).filter((p) => p !== null);

  return (
    <PhotoFinderFlow
      shows={shows}
      initial={evento && shows.some((s) => s.id === evento) ? evento : undefined}
      photos={photos}
      demo={!apiEnabled()}
    />
  );
}
