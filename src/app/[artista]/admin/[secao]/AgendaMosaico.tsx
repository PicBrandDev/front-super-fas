import Link from "next/link";
import { AdminEmpty } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { eventName, isPastEvent, statusLabel } from "@/lib/events";
import { themeStyle } from "@/lib/themes";
import type { Artist, ShowEvent } from "@/lib/types";

/** Tamanho de cada peça (colunas x linhas) e a cor dela, em ciclo: as peças se encaixam sem deixar buraco. */
const SHAPES = [
  "col-span-2 row-span-1",
  "col-span-1 row-span-2",
  "col-span-1 row-span-1",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
  "col-span-1 row-span-2",
  "col-span-2 row-span-1",
  "col-span-1 row-span-1",
] as const;
const TONES = [
  "bg-raised text-fg border-line",
  "bg-lagoon-deep text-paper border-transparent",
  "bg-sun text-on-amber border-transparent",
  "bg-raised text-fg border-line",
  "bg-amber text-on-amber border-transparent",
  "bg-surface text-fg border-line",
] as const;

/**
 * A agenda do artista como um mosaico: o próximo show é a peça grande e os demais se encaixam
 * em volta como um quebra-cabeça. Cores e fontes do tema do fã clube. Tocar numa peça abre a
 * gestão do show (onde comprar e brindes).
 */
export function AgendaMosaico({ artist, events }: { artist: Artist; events: ShowEvent[] }) {
  const hrefOf = (e: ShowEvent) => `/${artist.slug}/admin/agenda?evento=${e.id}`;
  const upcoming = events.filter((e) => !isPastEvent(e));
  const past = events.filter((e) => isPastEvent(e));
  const [featured, ...rest] = upcoming;

  if (events.length === 0) {
    return <AdminEmpty title="Nenhum show ainda" text="Adicione o primeiro show em “Gerenciar shows”: ele aparece aqui como uma peça." />;
  }

  return (
    <div
      style={themeStyle(artist.theme)}
      className="fan rounded-xl border border-adm-line bg-night p-3 font-grotesk text-base leading-6 text-fg sm:p-4"
    >
      <ul className="m-0 grid list-none auto-rows-[112px] grid-cols-2 gap-2 p-0 [grid-auto-flow:dense] sm:grid-cols-4 lg:grid-cols-6">
        {featured && (
          <li className="col-span-2 row-span-2 sm:col-span-2 lg:col-span-3">
            <Link
              href={hrefOf(featured)}
              className="flex h-full flex-col justify-between rounded-hair bg-amber p-4 text-on-amber no-underline outline-offset-2"
            >
              <span className="mono !text-on-amber">Próximo show</span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-[64px] font-black leading-[56px]">{featured.day}</span>
                <span className="mono !text-on-amber">
                  {featured.month} · {featured.weekday}
                  {featured.time ? ` · ${featured.time}` : ""}
                </span>
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="font-display text-2xl font-black leading-7">{eventName(artist.name, featured)}</strong>
                <span className="flex items-center gap-1.5 text-[13px]">
                  <Icon name="pin" size={13} />
                  {featured.city} · {featured.venue || "Local a definir"}
                </span>
              </span>
            </Link>
          </li>
        )}

        {[...rest, ...past].map((e, i) => {
          const isPast = isPastEvent(e);
          const tone = isPast ? "bg-surface text-fg-muted border-line" : TONES[i % TONES.length];
          const shape = isPast ? "col-span-1 row-span-1" : SHAPES[i % SHAPES.length];
          return (
            <li key={e.id} className={shape}>
              <Link
                href={hrefOf(e)}
                className={`flex h-full min-w-0 flex-col justify-between overflow-hidden rounded-hair border p-3 no-underline outline-offset-2 ${tone}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-3xl font-black leading-8">{e.day}</span>
                  <span className="mono !text-current">{e.month}</span>
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="truncate text-[13px] leading-4">{e.city}</strong>
                  <span className="mono truncate !text-current">
                    {isPast ? "Encerrado" : statusLabel[e.status]}
                    {e.giftsCount > 0 ? " · brinde" : ""}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
