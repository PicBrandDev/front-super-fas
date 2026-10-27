"use client";

import Link from "next/link";
import { useState } from "react";
import { OfferRideForm } from "@/components/fan/carpool/OfferRideForm";
import { RideCard } from "@/components/fan/carpool/RideCard";
import { useArtist } from "@/components/fan/ArtistContext";
import { Icon } from "@/components/icons";
import type { Ride } from "@/lib/types";

export function CaronasShow({ artist, eventId, rides, past, back, text }: { artist: string; eventId: string; rides: Ride[]; past: boolean; back: string; text: string }) {
  const { base } = useArtist();
  const [offering, setOffering] = useState(false);
  const open = rides.filter((r) => r.status === "open" && !r.mine && !r.myBooking);
  return (
    <>
      <header className="flex flex-col gap-2">
        <Link href={back} className="back">
          <Icon name="back" size={18} />
          Show
        </Link>
        <div className="flex items-center justify-between gap-3">
          <h1 className="m-0 font-display text-[40px] font-black leading-[40px]">Caronas</h1>
          {!past && !offering && (
            <button type="button" className="btn btn-primary flex-none gap-1.5 whitespace-nowrap px-4" onClick={() => setOffering(true)}>
              <Icon name="plus" size={16} />
              Oferecer
            </button>
          )}
        </div>
        <p className="m-0 max-w-[40ch] text-[15px] leading-[22px] text-fg-muted">{text}</p>
      </header>
      <nav aria-label="Caronas" className="flex flex-wrap gap-2">
        <span className="btn btn-primary" aria-current="page">
          Caronas
        </span>
        <Link href={`${base}/caronas/reservas?evento=${eventId}`} className="btn btn-outline">
          Minhas reservas
        </Link>
        <Link href={`${base}/caronas?evento=${eventId}`} className="btn btn-outline">
          Minhas caronas
        </Link>
      </nav>
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
