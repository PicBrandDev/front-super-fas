"use client";

import Link from "next/link";
import { useState } from "react";
import { OfferRideForm } from "@/components/fan/carpool/OfferRideForm";
import { RideCard } from "@/components/fan/carpool/RideCard";
import { useArtist } from "@/components/fan/ArtistContext";
import type { Ride } from "@/lib/types";

export function CaronasShow({ artist, eventId, rides, past }: { artist: string; eventId: string; rides: Ride[]; past: boolean }) {
  const { base } = useArtist();
  const [offering, setOffering] = useState(false);
  const open = rides.filter((r) => r.status === "open");
  return (
    <>
      {!past && !offering && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-primary" onClick={() => setOffering(true)}>
            Oferecer carona
          </button>
          <Link href={`${base}/caronas`} className="btn btn-outline">
            Minhas caronas
          </Link>
        </div>
      )}
      {offering && <OfferRideForm artist={artist} eventId={eventId} onDone={() => setOffering(false)} />}
      {open.length === 0 ? (
        <p className="m-0 border border-line p-4 text-[15px] text-fg-muted">Ainda não há caronas para este show. Seja o primeiro a oferecer.</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {open.map((r) => (
            <li key={r.id}>
              <RideCard artist={artist} base={base} ride={r} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
