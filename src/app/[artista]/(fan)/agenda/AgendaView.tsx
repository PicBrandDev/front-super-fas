"use client";

import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { PageHeader } from "@/components/fan/PageHeader";
import { ShowStub } from "@/components/fan/ShowStub";
import type { ShowEvent } from "@/lib/types";

const monthNames: Record<string, string> = {
  jan: "Janeiro",
  fev: "Fevereiro",
  mar: "Março",
  abr: "Abril",
  mai: "Maio",
  jun: "Junho",
  jul: "Julho",
  ago: "Agosto",
  set: "Setembro",
  out: "Outubro",
  nov: "Novembro",
  dez: "Dezembro",
};

const tones = ["gold", "cream", "accent"] as const;

export function AgendaView({ artistName, events }: { artistName: string; events: ShowEvent[] }) {
  const { slug } = useArtist();
  const [filter, setFilter] = useState("todos");

  // Meses na ordem em que aparecem na agenda.
  const months = events.reduce<{ key: string; label: string }[]>((acc, e) => {
    if (!acc.some((m) => m.key === e.monthKey)) acc.push({ key: e.monthKey, label: monthNames[e.monthKey] ?? e.month });
    return acc;
  }, []);
  const filters = [{ key: "todos", label: "Todos" }, ...months];
  const shows = events.filter((e) => filter === "todos" || e.monthKey === filter);
  const countLabel = `${shows.length} ${shows.length === 1 ? "show" : "shows"} · toque para ver ingressos e brindes`;

  return (
    <>
      <PageHeader eyebrow={`${artistName} · ao vivo`} title="Agenda">
        <div role="group" aria-label="Filtrar por mês" className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={`min-h-11 cursor-pointer rounded-full border-2 border-paper px-4 font-label text-xs font-bold ${
                  active ? "bg-paper text-ink" : "bg-transparent text-paper"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-3.5 px-4 pb-6 pt-[18px] lg:px-8 lg:pt-6">
        <p aria-live="polite" className="m-0 font-label text-[13px] leading-snug text-ink-soft">
          {countLabel}
        </p>
        <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
          {shows.map((e, i) => (
            <li key={e.id}>
              <ShowStub event={e} href={`/${slug}/eventos/${e.id}`} tone={tones[i % 3]} showStatus showArrow />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
