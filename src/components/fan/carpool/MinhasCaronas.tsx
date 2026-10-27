"use client";

import { RideCard } from "@/components/fan/carpool/RideCard";
import { useArtist } from "@/components/fan/ArtistContext";
import type { MyCarpool } from "@/lib/types";

export function MinhasCaronas({ artist, mine }: { artist: string; mine: MyCarpool }) {
  const { base } = useArtist();
  const group = (title: string, items: { id: string; ride: MyCarpool["offered"][number] }[], empty: string) => (
    <section className="flex flex-col gap-3" aria-label={title}>
      <h2 className="m-0 font-display text-[26px] font-black">{title}</h2>
      {items.length === 0 ? (
        <p className="m-0 text-[15px] text-fg-muted">{empty}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((i) => (
            <li key={i.id}>
              <RideCard artist={artist} base={base} ride={i.ride} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
  return (
    <>
      {group("Vagas que reservei", mine.booked.map((b) => ({ id: b.id, ride: { ...b.ride, myBooking: b } })), "Você ainda não reservou nenhuma vaga. Abra um show na agenda e veja as caronas.")}
      {group("Caronas que ofereço", mine.offered.map((r) => ({ id: r.id, ride: r })), "Você ainda não ofereceu carona.")}
    </>
  );
}
