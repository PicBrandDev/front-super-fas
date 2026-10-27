"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { carpoolSupport } from "@/app/actions/carpool";
import { formatBRL } from "@/lib/format";
import type { CarpoolBooking } from "@/lib/types";

export function SuporteCarona({ artist, booking }: { artist: string; booking: CarpoolBooking }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const act = (a: "refund" | "release") =>
    start(async () => {
      const res = await carpoolSupport(artist, booking.id, a);
      if (!res.ok) return setError(res.error);
      setError("");
      router.refresh();
    });
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-adm-line pt-2 text-sm">
      <span>
        {booking.passenger?.name} · {booking.seats} {booking.seats === 1 ? "vaga" : "vagas"} · {formatBRL(booking.amountCents)} · {booking.status}
      </span>
      {error && <span role="alert" className="text-[13px] text-red-700">{error}</span>}
      {booking.status === "paid" && (
        <span className="flex gap-2">
          <button type="button" disabled={pending} onClick={() => act("refund")} className="rounded-lg border border-adm-line px-3 py-1.5 text-[13px] font-semibold">
            Devolver
          </button>
          <button type="button" disabled={pending} onClick={() => act("release")} className="rounded-lg border border-adm-line px-3 py-1.5 text-[13px] font-semibold">
            Liberar ao motorista
          </button>
        </span>
      )}
    </div>
  );
}
