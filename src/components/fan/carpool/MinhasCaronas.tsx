"use client";

import { RideCard } from "@/components/fan/carpool/RideCard";
import { useArtist } from "@/components/fan/ArtistContext";
import type { MyCarpool } from "@/lib/types";

export function MinhasCaronas({ artist, mine, view }: { artist: string; mine: MyCarpool; view: "reservas" | "ofertas" }) {
  const { base } = useArtist();
  const group = (title: string, items: { id: string; ride: MyCarpool["offered"][number] }[], empty: string) => (
    <section className="flex flex-col gap-3" aria-label={title}>
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
  return view === "reservas"
    ? group("Minhas reservas", mine.booked.filter((b) => b.status !== "cancelled" && b.status !== "refunded").map((b) => ({ id: b.id, ride: { ...b.ride, myBooking: b } })), "Você ainda não reservou carona. Abra um show na agenda e veja as caronas.")
    : group("Minhas caronas", mine.offered.map((r) => ({ id: r.id, ride: r })), "Você ainda não ofereceu carona.");
}
