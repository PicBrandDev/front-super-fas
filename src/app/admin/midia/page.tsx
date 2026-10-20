import type { Metadata } from "next";
import { AdminShell, masterNav } from "@/components/admin/AdminShell";
import { getAdSlots, getCampaigns, getSponsors, listArtists } from "@/lib/api";
import type { AdSlot } from "@/lib/types";
import { MidiaClient } from "./MidiaClient";

export const metadata: Metadata = { title: "Admin master — Plataforma de mídia" };

export default async function MidiaPage() {
  const [artists, campaigns, sponsors] = await Promise.all([listArtists(), getCampaigns(), getSponsors()]);
  const slotEntries = await Promise.all(artists.map(async (a) => [a.slug, await getAdSlots(a.slug)] as const));
  const slotsByClub: Record<string, AdSlot[]> = Object.fromEntries(slotEntries);

  return (
    <AdminShell
      brand={{ mark: "P", title: "[Sua plataforma]", subtitle: "Admin master" }}
      nav={masterNav}
      active="midia"
      extraLink={{ label: "Ver portal do patrocinador", href: "/patrocinador" }}
      user={{ initials: "VC", name: "Você", role: "Admin master" }}
    >
      <MidiaClient
        clubs={artists.map((a) => ({ slug: a.slug, name: a.name }))}
        slotsByClub={slotsByClub}
        campaigns={campaigns}
        sponsors={sponsors}
      />
    </AdminShell>
  );
}
