import type { Metadata } from "next";
import { apiEnabled, getArtist, getClubPrizes, getClubs, getInAppAds, getMyRewards, getSpinCredits, getViewer } from "@/lib/api";
import { PicKapWheel } from "./PicKapWheel";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `PicKap da sorte · Fã clube ${artist.name}` : "PicKap da sorte" };
}

/** Os giros são do fã no ambiente do cantor; o disco é o do fã clube dele (sem escolher entre fã clubes). */
export default async function PicKapPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [viewer, clubs, credits, ads, rewards] = await Promise.all([
    getViewer(artista),
    getClubs(artista),
    getSpinCredits(artista),
    getInAppAds(artista),
    getMyRewards(artista),
  ]);
  const mine = clubs.filter((c) => c.joined);
  const current = mine[0] ?? null;
  const prizes = current ? await getClubPrizes(artista, current.slug) : [];

  return (
    <PicKapWheel
      key={current?.slug ?? "none"}
      prizes={prizes}
      initialSpins={viewer.spins}
      initialCredits={credits}
      rewardsCount={rewards.filter((r) => r.status === "available").length}
      club={current ? { slug: current.slug, name: current.name } : null}
      demo={!apiEnabled()}
      videoAd={ads.pickapVideo ?? null}
      claimAd={ads.pickapClaim ?? null}
    />
  );
}
