import type { Metadata } from "next";
import { apiEnabled, getAdSlots, getClubAdSlots, getClubs, listArtists } from "@/lib/api";
import type { AdSlot } from "@/lib/types";
import { PatrocinadorClient, type SponsorClub } from "./PatrocinadorClient";

export const metadata: Metadata = { title: "Portal do patrocinador — Nova campanha" };

export default async function PatrocinadorPage() {
  const artists = (await listArtists()).filter((a) => a.status === "active");
  // Vitrines do ambiente de cada cantor ("cantor") e de cada fã clube no ar ("cantor/clube").
  const slotsByClub: Record<string, AdSlot[]> = {};
  const placesByClub: Record<string, { slug: string; name: string }[]> = {};
  await Promise.all(
    artists.map(async (a) => {
      const [envSlots, clubs] = await Promise.all([getAdSlots(a.slug), getClubs(a.slug)]);
      slotsByClub[a.slug] = envSlots;
      const live = clubs.filter((c) => c.status === "active");
      placesByClub[a.slug] = live.map((c) => ({ slug: c.slug, name: c.name }));
      await Promise.all(
        live.map(async (c) => {
          slotsByClub[`${a.slug}/${c.slug}`] = await getClubAdSlots(a.slug, c.slug);
        }),
      );
    }),
  );
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
          Escolha o cantor, onde anunciar (todo o ambiente ou um fã clube) e monte seu anúncio. Quem administra o lugar aprova antes de ir ao ar.
        </p>
      </div>
      <PatrocinadorClient clubs={clubs} slotsByClub={slotsByClub} placesByClub={placesByClub} exampleMode={!apiEnabled()} />
    </>
  );
}
