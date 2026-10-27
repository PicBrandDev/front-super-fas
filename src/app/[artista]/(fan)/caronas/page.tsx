import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHead } from "@/components/fan/resale/parts";
import { MinhasCaronas } from "@/components/fan/carpool/MinhasCaronas";
import { getArtist, getMyCarpool } from "@/lib/api";

export const metadata: Metadata = { title: "Minhas caronas" };

export default async function MinhasCaronasPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const mine = await getMyCarpool(artista);
  return (
    <div className="flex flex-col gap-5">
      <PageHead back={`/${artista}/agenda`} backLabel="Agenda" title="Minhas caronas" text="As viagens que você oferece e as vagas que reservou." />
      <MinhasCaronas artist={artista} mine={mine} />
    </div>
  );
}
