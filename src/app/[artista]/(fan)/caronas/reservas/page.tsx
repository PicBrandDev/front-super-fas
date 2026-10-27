import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/fan/resale/parts";
import { MinhasCaronas } from "@/components/fan/carpool/MinhasCaronas";
import { getArtist, getMyCarpool } from "@/lib/api";

export const metadata: Metadata = { title: "Minhas reservas" };

export default async function MinhasReservasPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const mine = await getMyCarpool(artista);
  return (
    <div className="flex flex-col gap-5">
      <PageHead back={`/${artista}/agenda`} backLabel="Agenda" title="Minhas reservas" text="As caronas em que você reservou uma vaga." />
      <MinhasCaronas artist={artista} mine={mine} view="reservas" />
    </div>
  );
}
