import { getEvents } from "@/lib/api";
import { PhotoFinderFlow } from "./PhotoFinderFlow";

export default async function PhotoFinderPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const events = await getEvents(artista);
  const shows = events.map((e) => ({
    id: e.id,
    city: e.city,
    label: `${e.city} · ${e.weekday} ${e.day} ${e.month}`,
  }));

  return <PhotoFinderFlow shows={shows} />;
}
