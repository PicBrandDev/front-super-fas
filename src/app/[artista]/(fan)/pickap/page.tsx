import type { Metadata } from "next";
import { apiEnabled, getArtist, getClubPrizes, getClubs, getInAppAds, getSpinCredits, getViewer } from "@/lib/api";
import { PicKapWheel } from "./PicKapWheel";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `PicKap da sorte · Fã clube ${artist.name}` : "PicKap da sorte" };
}

/** Cada fã clube tem seu disco; os giros são do fã no ambiente do cantor. */
export default async function PicKapPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ clube?: string }>;
}) {
  const { artista } = await params;
  const { clube } = await searchParams;
  const [viewer, clubs, credits, ads] = await Promise.all([
    getViewer(artista),
    getClubs(artista),
    getSpinCredits(artista),
    getInAppAds(artista),
  ]);
  const mine = clubs.filter((c) => c.joined);
  const current = mine.find((c) => c.slug === clube) ?? mine[0] ?? null;
  const prizes = current ? await getClubPrizes(artista, current.slug) : [];

  return (
    <PicKapWheel
      key={current?.slug ?? "none"}
      prizes={prizes}
      initialSpins={viewer.spins}
      initialCredits={credits}
      club={current ? { slug: current.slug, name: current.name } : null}
      clubs={mine.map((c) => ({ slug: c.slug, name: c.name }))}
      notJoined={clube && !mine.some((c) => c.slug === clube) ? (clubs.find((c) => c.slug === clube)?.name ?? null) : null}
      demo={!apiEnabled()}
      videoAd={ads.pickapVideo ?? null}
      claimAd={ads.pickapClaim ?? null}
    />
  );
}
