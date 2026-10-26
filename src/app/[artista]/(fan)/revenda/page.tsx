import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiEnabled, getArtist, getMyResaleOrders, getResaleEligibility, getResaleEvents } from "@/lib/api";
import { isOpenOrder } from "@/lib/resale";
import { HubView } from "./HubView";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Revenda · Fã clube ${artist.name}` : "Revenda" };
}

export default async function ResaleHubPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [events, eligibility, orders] = await Promise.all([getResaleEvents(artista), getResaleEligibility(artista), getMyResaleOrders(artista)]);
  return (
    <HubView
      events={events.ok ? events.data : []}
      error={events.ok ? null : events.error}
      eligibility={eligibility.ok ? eligibility.data : null}
      openOrders={orders.ok ? orders.data.filter((o) => isOpenOrder(o.status)).length : 0}
      demo={!apiEnabled()}
    />
  );
}
