import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FanShell } from "@/components/fan/FanShell";
import { getArtist, getOtherFandoms, getViewer } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Fã clube ${artist.name}` : "Fã clube" };
}

export default async function FanLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ artista: string }>;
}) {
  const { artista } = await params;
  const [artist, viewer, otherFandoms] = await Promise.all([getArtist(artista), getViewer(artista), getOtherFandoms(artista)]);
  if (!artist) notFound();
  return (
    <FanShell artist={artist} viewer={viewer} otherFandoms={otherFandoms}>
      {children}
    </FanShell>
  );
}
