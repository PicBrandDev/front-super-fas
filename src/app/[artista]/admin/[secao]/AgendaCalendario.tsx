"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminEmpty } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel } from "@/lib/events";
import { themeStyle } from "@/lib/themes";
import type { Artist, ShowEvent } from "@/lib/types";

const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKDAYS_LONG = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/** Cor das peças dos dias com show, em ciclo (as cores do tema do fã clube). */
const TONES = [
  "bg-amber text-on-amber border-transparent",
  "bg-lagoon-deep text-paper border-transparent",
  "bg-sun text-on-amber border-transparent",
  "bg-raised text-fg border-line",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`; // m de 0 a 11

type Cell = { iso: string; day: number; inMonth: boolean };

/** As 6 semanas que cobrem o mês, começando no domingo (os dias dos meses vizinhos completam as pontas). */
function monthCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + i,
    );
    return {
      iso: iso(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      inMonth: d.getMonth() === month,
    };
  });
}

const longDate = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${WEEKDAYS_LONG[new Date(y, m - 1, d).getDay()]}, ${d} de ${MONTHS[m - 1]} de ${y}`;
};

/**
 * A agenda do artista como um calendário em peças de quebra-cabeça: cada dia é uma peça, as que têm show ganham cor
 * e o nome da cidade. Passe de mês em mês e toque num dia para ver os shows dele (e abri-los para editar, cuidar da
 * compra e dos brindes). Cores e fontes do tema do fã clube.
 */
export function AgendaCalendario({
  artist,
  events,
}: {
  artist: Artist;
  events: ShowEvent[];
}) {
  const dated = useMemo(
    () =>
      events.filter((e): e is ShowEvent & { date: string } => Boolean(e.date)),
    [events],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, (ShowEvent & { date: string })[]>();
    for (const e of dated) map.set(e.date, [...(map.get(e.date) ?? []), e]);
    return map;
  }, [dated]);

  // Abre no mês do próximo show (ou do último, se todos já passaram); sem nenhum, no mês de hoje.
  const initial = useMemo(() => {
    const next = dated
      .filter((e) => !isPastEvent(e))
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    const last = [...dated].sort((a, b) => b.date.localeCompare(a.date))[0];
    return (next ?? last)?.date ?? null;
  }, [dated]);
  const now = new Date();
  const [cursor, setCursor] = useState(() => {
    const [y, m] = (initial ?? iso(now.getFullYear(), now.getMonth(), 1))
      .split("-")
      .map(Number);
    return { year: y, month: m - 1 };
  });
  const [selected, setSelected] = useState<string | null>(initial);

  const cells = useMemo(() => monthCells(cursor.year, cursor.month), [cursor]);
  // A cor de cada peça com show, em ciclo, na ordem do calendário.
  const toneOf = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of cells)
      if (byDay.has(c.iso)) map.set(c.iso, map.size % TONES.length);
    return map;
  }, [cells, byDay]);
  const today = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const inMonthShows = cells
    .filter((c) => c.inMonth)
    .reduce((n, c) => n + (byDay.get(c.iso)?.length ?? 0), 0);
  const go = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.year, c.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  const goToday = () => {
    setCursor({ year: now.getFullYear(), month: now.getMonth() });
    setSelected(today);
  };

  if (events.length === 0) {
    return (
      <AdminEmpty
        title="Nenhum show ainda"
        text="Use o botão “Adicionar show”: o show aparece aqui como uma peça do calendário."
      />
    );
  }

  const shows = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div
      style={themeStyle(artist.theme)}
      className="fan flex flex-col gap-4 rounded-xl border border-adm-line bg-night p-3 font-grotesk text-base leading-6 text-fg sm:p-4 lg:h-[calc(100dvh-250px)] lg:min-h-[520px] lg:flex-row"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <h2
              aria-live="polite"
              className="m-0 font-display text-2xl font-black capitalize leading-8"
            >
              {MONTHS[cursor.month]}{" "}
              <span className="text-fg-muted">{cursor.year}</span>
            </h2>
            <span className="mono">
              {inMonthShows === 0
                ? "Nenhum show neste mês"
                : `${inMonthShows} ${inMonthShows === 1 ? "show" : "shows"} neste mês`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Mês anterior"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-fg"
            >
              <Icon name="back" size={16} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="min-h-9 cursor-pointer rounded-full border border-line bg-surface px-3 text-sm font-semibold text-fg"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próximo mês"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-fg"
            >
              <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div aria-hidden="true" className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <span key={w} className="mono text-center">
                {w}
              </span>
            ))}
          </div>
          <ul className="m-0 grid min-h-0 flex-1 list-none grid-cols-7 grid-rows-6 gap-1 p-0">
            {cells.map((c) => {
              const list = byDay.get(c.iso) ?? [];
              const has = list.length > 0;
              const on = selected === c.iso;
              const style = has
                ? TONES[toneOf.get(c.iso) ?? 0]
                : c.inMonth
                  ? "bg-surface text-fg border-line"
                  : "bg-transparent text-fg-muted border-line/40";
              return (
                <li key={c.iso} className="min-h-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(c.iso);
                      if (!c.inMonth)
                        setCursor({
                          year: Number(c.iso.slice(0, 4)),
                          month: Number(c.iso.slice(5, 7)) - 1,
                        });
                    }}
                    aria-pressed={on}
                    aria-label={`${longDate(c.iso)}${has ? `, ${list.length} ${list.length === 1 ? "show" : "shows"}: ${list.map((e) => e.city).join(", ")}` : ""}${c.iso === today ? ", hoje" : ""}`}
                    className={`flex h-full min-h-[48px] w-full cursor-pointer flex-col justify-between overflow-hidden rounded-hair border p-1.5 text-left outline-offset-2 sm:p-2 ${style} ${
                      on ? "outline outline-[3px] outline-current" : ""
                    }`}
                  >
                    <span className="flex items-start justify-between gap-1">
                      <span
                        className={`font-display font-black leading-none ${has ? "text-2xl sm:text-4xl" : "text-base sm:text-xl"}`}
                      >
                        {c.day}
                      </span>
                      {c.iso === today && (
                        <span
                          aria-hidden="true"
                          className="mt-0.5 size-1.5 flex-none rounded-full bg-current"
                        />
                      )}
                    </span>
                    {has && (
                      <span className="hidden min-w-0 flex-col sm:flex">
                        <strong className="truncate text-xs leading-4 sm:text-sm">
                          {list[0].city}
                        </strong>
                        <span className="mono truncate !text-[10px] !text-current">
                          {list.length > 1
                            ? `+${list.length - 1} ${list.length === 2 ? "show" : "shows"}`
                            : list[0].time || "Horário a definir"}
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <section
        aria-live="polite"
        aria-label="Shows do dia escolhido"
        className="flex min-h-0 flex-none flex-col gap-3 overflow-y-auto border-t border-line pt-4 lg:w-[340px] lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0"
      >
        {selected ? (
          <>
            <h3 className="m-0 font-display text-2xl font-black capitalize leading-7">
              {longDate(selected)}
            </h3>
            {shows.length === 0 ? (
              <p className="m-0 text-fg-muted">
                Nenhum show neste dia. Toque numa peça colorida do calendário.
              </p>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {shows.map((e) => (
                  <li key={e.id}>
                    <Link
                      href={`/${artist.slug}/admin/agenda?evento=${e.id}`}
                      className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-hair border border-line bg-raised p-4 text-fg no-underline outline-offset-2"
                    >
                      <span className="font-display text-4xl font-black leading-9">
                        {e.time || "—"}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <strong className="font-display text-2xl font-black leading-7">
                          {eventName(artist.name, e)}
                        </strong>
                        <span className="flex items-center gap-1.5 text-fg-muted">
                          <Icon name="pin" size={16} />
                          {e.city} · {e.venue || "Local a definir"}
                        </span>
                      </span>
                      <span className="mono">
                        {isPastEvent(e) ? "Encerrado" : statusLabel[e.status]}
                        {e.giftsCount > 0 ? " · brinde" : ""}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-semibold text-amber">
                        Abrir show
                        <Icon name="arrow" size={16} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="m-0 text-fg-muted">
            Toque num dia do calendário para ver os shows dele.
          </p>
        )}
      </section>
    </div>
  );
}
