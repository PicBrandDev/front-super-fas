import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/fan/resale/parts";
import { MinhasCaronas } from "@/components/fan/carpool/MinhasCaronas";
import { getArtist, getMyCarpool } from "@/lib/api";

export const metadata: Metadata = { title: "Minhas caronas" };

export default async function MinhasCaronasPage({ params, searchParams }: { params: Promise<{ artista: string }>; searchParams: Promise<{ evento?: string }> }) {
  const { artista } = await params;
  const { evento } = await searchParams;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const mine = await getMyCarpool(artista);
  return (
    <div className="flex flex-col gap-5 px-4 pb-24 pt-2">
      <PageHead back={evento && /^[A-Za-z0-9_-]+$/.test(evento) ? `/${artista}/eventos/${evento}/caronas` : `/${artista}/agenda`} backLabel={evento ? "Caronas" : "Agenda"} title="Minhas caronas" text="As caronas que você oferece e quem reservou com você." />
      <MinhasCaronas artist={artista} mine={mine} view="ofertas" />
    </div>
  );
}
