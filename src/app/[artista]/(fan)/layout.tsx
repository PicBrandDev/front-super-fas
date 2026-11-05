import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { FanShell } from "@/components/fan/FanShell";
import { UnderConstruction } from "@/components/fan/UnderConstruction";
import { getArtist, getInAppAds, getMe, getOtherFandoms, getViewer } from "@/lib/api";
import { brandFor } from "@/lib/brands";
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
  const [artist, viewer, otherFandoms, ads, me, jar] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getOtherFandoms(artista),
    getInAppAds(artista),
    getMe(),
    cookies(),
  ]);
  if (!artist) notFound();
  // Em construção e sem pele própria (chave em BY_SLUG de lib/brands.ts): tela em branco, sem o desenho do Vintage.
  if (artist.status === "setup" && brandFor(artist.slug).key === "vintage") return <UnderConstruction artist={artist} />;
  const freshLogin = jar.get(ENTRY_AD_COOKIE)?.value === artist.slug;
  return (
    <FanShell artist={artist} viewer={viewer} otherFandoms={otherFandoms} entryAd={ads.entry ?? null} freshLogin={freshLogin} avatar={me?.avatar ?? null}>
      {children}
    </FanShell>
  );
}
