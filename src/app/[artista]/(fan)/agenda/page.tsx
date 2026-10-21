import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getEvents } from "@/lib/api";
import { AgendaView } from "./AgendaView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Agenda · Fã clube ${artist.name}` : "Agenda" };
}

export default async function AgendaPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, events] = await Promise.all([getArtist(artista), getEvents(artista)]);
  if (!artist) notFound();
  return <AgendaView events={events} demo={!apiEnabled()} />;
}
