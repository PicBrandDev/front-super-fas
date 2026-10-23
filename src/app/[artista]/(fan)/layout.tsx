import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FanShell } from "@/components/fan/FanShell";
import { getArtist, getInAppAds, getOtherFandoms, getViewer } from "@/lib/api";
import { ENTRY_AD_COOKIE } from "@/lib/entryAdCookie";

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
  const [artist, viewer, otherFandoms, ads, jar] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getOtherFandoms(artista),
    getInAppAds(artista),
    cookies(),
  ]);
  if (!artist) notFound();
  const freshLogin = jar.get(ENTRY_AD_COOKIE)?.value === artist.slug;
  return (
    <FanShell artist={artist} viewer={viewer} otherFandoms={otherFandoms} entryAd={ads.entry ?? null} freshLogin={freshLogin}>
      {children}
    </FanShell>
  );
}
