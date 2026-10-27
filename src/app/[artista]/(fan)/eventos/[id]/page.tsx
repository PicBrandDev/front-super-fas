import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getEvent, getPackages } from "@/lib/api";
import { eventName } from "@/lib/events";
import { EventoView } from "./EventoView";

type Params = Promise<{ artista: string; id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { artista, id } = await params;
  const [artist, event] = await Promise.all([getArtist(artista), getEvent(artista, id)]);
  if (!artist || !event) return { title: "Evento" };
  return {
    title: `${eventName(artist.name, event)} · ${event.weekday} ${event.day} ${event.month}`,
    description: `Ingresso na Ingresse, experiências extras e brindes do show de ${artist.name} em ${event.city}.`,
  };
}

export default async function EventoPage({ params }: { params: Params }) {
  const { artista, id } = await params;
  const [artist, event] = await Promise.all([getArtist(artista), getEvent(artista, id)]);
  if (!artist || !event) notFound();
  // O ingresso é vendido só na Ingresse; aqui entram as experiências extras das agências.
  const packages = await getPackages(artista, event.id);
  return <EventoView artistName={artist.name} event={event} packages={packages} demo={!apiEnabled()} />;
}
