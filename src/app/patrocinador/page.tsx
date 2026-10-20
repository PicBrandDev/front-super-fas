import Link from "next/link";
import type { Metadata } from "next";
import { getAdSlots, listArtists } from "@/lib/api";
import type { AdSlot } from "@/lib/types";
import { PatrocinadorClient, type SponsorClub } from "./PatrocinadorClient";

export const metadata: Metadata = { title: "Portal do patrocinador — Nova campanha" };

export default async function PatrocinadorPage() {
  const artists = await listArtists();
  const slotEntries = await Promise.all(artists.map(async (a) => [a.slug, await getAdSlots(a.slug)] as const));
  const slotsByClub: Record<string, AdSlot[]> = Object.fromEntries(slotEntries);
  const clubs: SponsorClub[] = artists
    .filter((a) => a.status === "active")
    .map((a) => ({
      slug: a.slug,
      name: a.name,
      initial: a.initial,
      members: a.members,
      brandColor: a.brandColor,
      theme: a.theme,
    }));

  return (
    <div className="flex min-h-dvh flex-col bg-adm-bg font-adm text-adm-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-adm-line bg-white px-4 py-3.5 sm:px-7">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-[34px] items-center justify-center rounded-lg bg-adm-blue font-bold text-white"
          >
            P
          </span>
          <span className="flex flex-col">
            <strong className="text-sm">[Sua plataforma] · Mídia</strong>
            <span className="font-adm-mono text-[11px] text-adm-muted">Portal do patrocinador</span>
          </span>
        </div>
        <nav aria-label="Conta" className="flex flex-wrap items-center gap-1.5">
          <a
            href="#"
            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-adm-ink no-underline hover:bg-adm-bg"
          >
            Minhas campanhas
          </a>
          <Link
            href="/patrocinador"
            aria-current="page"
            className="flex min-h-11 items-center rounded-lg bg-adm-blue-soft px-3 text-sm font-semibold text-adm-blue-dark no-underline"
          >
            Nova campanha
          </Link>
          <span className="ml-2 flex items-center gap-2 border-l border-adm-line pl-3">
            <span
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-full bg-adm-ink text-xs font-bold text-white"
            >
              MA
            </span>
            <span className="text-sm font-semibold">[Marca A]</span>
          </span>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] flex-1 flex-col gap-6 px-4 pb-10 pt-7 sm:px-7">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[28px] font-bold">Nova campanha</h1>
          <p className="m-0 text-[15px] text-adm-muted">
            Escolha o fã clube, a vitrine e monte seu anúncio. O admin do fã clube aprova antes de ir ao ar.
          </p>
        </div>
        <PatrocinadorClient clubs={clubs} slotsByClub={slotsByClub} />
      </main>
    </div>
  );
}
