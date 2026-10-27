import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/fan/resale/parts";
import { CaronasShow } from "@/components/fan/carpool/CaronasShow";
import { getArtist, getEvent, getRides } from "@/lib/api";
import { eventName, isPastEvent } from "@/lib/events";

type Params = Promise<{ artista: string; id: string }>;

export const metadata: Metadata = { title: "Caronas" };

/** Caronas de um show: quem oferece vagas, quanto custa cada uma, e o formulário para oferecer a sua. */
export default async function CaronasPage({ params }: { params: Params }) {
  const { artista, id } = await params;
  const [artist, event] = await Promise.all([getArtist(artista), getEvent(artista, id)]);
  if (!artist || !event) notFound();
  const rides = await getRides(artista, event.id);
  return (
    <div className="flex flex-col gap-5">
      <PageHead
        back={`/${artista}/eventos/${event.id}`}
        backLabel="Show"
        title="Caronas"
        text={`${eventName(artist.name, event)} · ${event.city}, ${event.day} ${event.month}. Ofereça vagas no seu carro ou reserve uma; o valor fica retido no app até a viagem.`}
      />
      <CaronasShow artist={artista} eventId={event.id} rides={rides} past={isPastEvent(event)} />
    </div>
  );
}
