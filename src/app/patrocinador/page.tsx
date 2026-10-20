import type { Metadata } from "next";
import { getAdSlots, listArtists } from "@/lib/api";
import type { AdSlot } from "@/lib/types";
import { PatrocinadorClient, type SponsorClub } from "./PatrocinadorClient";

export const metadata: Metadata = { title: "Portal do patrocinador — Nova campanha" };

export default async function PatrocinadorPage() {
  const artists = (await listArtists()).filter((a) => a.status === "active");
  const slotEntries = await Promise.all(artists.map(async (a) => [a.slug, await getAdSlots(a.slug)] as const));
  const slotsByClub: Record<string, AdSlot[]> = Object.fromEntries(slotEntries);
  const clubs: SponsorClub[] = artists.map((a) => ({
    slug: a.slug,
    name: a.name,
    initial: a.initial,
    members: a.members,
    brandColor: a.brandColor,
    theme: a.theme,
  }));

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[28px] font-bold">Nova campanha</h1>
        <p className="m-0 text-[15px] text-adm-muted">
          Escolha o fã clube, a vitrine e monte seu anúncio. A plataforma aprova antes de ir ao ar.
        </p>
      </div>
      <PatrocinadorClient clubs={clubs} slotsByClub={slotsByClub} />
    </>
  );
}
