import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArtist, getEvent, getGifts, getVendors } from "@/lib/api";
import { EventoView } from "./EventoView";

type Params = Promise<{ artista: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { artista, id } = await params;
  const [artist, event] = await Promise.all([getArtist(artista), getEvent(artista, id)]);
  if (!artist || !event) return { title: "Evento" };
  return {
    title: `${artist.name} em ${event.city} · ${event.weekday} ${event.day} ${event.month}`,
    description: `Ingressos, pacotes e brindes do show de ${artist.name} em ${event.city}.`,
  };
}

export default async function EventoPage({ params }: { params: Params }) {
  const { artista, id } = await params;
  const [artist, event] = await Promise.all([getArtist(artista), getEvent(artista, id)]);
  if (!artist || !event) notFound();
  const [vendors, gifts] = await Promise.all([getVendors(artista, event.id), getGifts(artista, event.id)]);
  return <EventoView artistName={artist.name} event={event} vendors={vendors} gifts={gifts} />;
}
