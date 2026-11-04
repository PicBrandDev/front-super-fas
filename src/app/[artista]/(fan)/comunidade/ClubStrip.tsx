"use client";

import Link from "next/link";
import { useArtist } from "@/components/fan/ArtistContext";
import { ClubDot } from "@/components/fan/ClubDot";
import { Icon } from "@/components/icons";

export type StripClub = {
  slug: string;
  name: string;
  avatar: string | null;
  posts?: number;
  members?: number;
  isMaster?: boolean;
};

const SIZE = 56;

/**
 * "Seus fã clubes": uma fileira de bolinhas com a foto de cada fã clube que o fã segue (e a bolinha "Todos"), no lugar das
 * abas de texto. "Todos" não é um fã clube: é o filtro que junta os posts de todos (ícone tracejado, sem foto). O fã clube oficial do artista vem sempre primeiro (logo depois de "Todos") e leva o selo na foto. Tocar numa
 * bolinha filtra o feed por ela; a escolhida ganha o anel do acento.
 */
export function ClubStrip({
  clubs,
  value,
  onChange,
  total,
  allLabel = "Todos",
  showAll = true,
}: {
  clubs: StripClub[];
  value: string | null;
  onChange: (slug: string | null) => void;
  total?: number;
  allLabel?: string; // nome do botão que junta tudo ("Todos" no feed, "Geral" no ranking)
  showAll?: boolean; // dono de fã clube: sem o botão que junta tudo
}) {
  const { base } = useArtist();
  const item =
    "flex w-[68px] flex-none cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-0 text-fg";
  const ring = (on: boolean) =>
    `rounded-full ${on ? "outline outline-[3px] outline-offset-2 outline-amber-text" : ""}`;
  return (
    <section aria-label="Seus fã clubes" className="-mx-4 py-3">
      <div className="flex gap-3 overflow-x-auto px-4 pb-1 pt-1 [scrollbar-width:none]">
        {showAll && (
          <button
            type="button"
            aria-pressed={value === null}
            onClick={() => onChange(null)}
            className={item}
          >
            <span className={ring(value === null)}>
              <span
                style={{ width: SIZE, height: SIZE }}
                title={
                  total === undefined
                    ? allLabel
                    : `Todos os posts dos fã clubes que você segue (${total})`
                }
                className="flex items-center justify-center rounded-full border border-dashed border-line-strong bg-transparent text-fg"
              >
                <Icon name="users" size={24} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px] font-semibold leading-3">
              {allLabel}
            </span>
          </button>
        )}

        {[...clubs]
          .sort((a, b) => Number(!!b.isMaster) - Number(!!a.isMaster))
          .map((c) => (
            <button
              key={c.slug}
              type="button"
              aria-pressed={value === c.slug}
              onClick={() => onChange(c.slug)}
              className={item}
              title={
                c.posts === undefined
                  ? c.name
                  : `${c.name} · ${c.posts} ${c.posts === 1 ? "post" : "posts"}`
              }
            >
              <span className={ring(value === c.slug)}>
                <ClubDot
                  name={c.name}
                  avatar={c.avatar}
                  official={c.isMaster}
                />
              </span>
              <span className="w-full truncate text-center text-[11px] font-semibold leading-3">
                {c.name}
              </span>
            </button>
          ))}

        {/* O "+" no fim da fileira abre a página com todos os fã clubes do artista. */}
        <Link
          href={`${base}/clubes`}
          aria-label="Ver todos os fã clubes"
          title="Ver todos os fã clubes"
          className={`${item} no-underline`}
        >
          <span
            style={{ width: SIZE, height: SIZE }}
            className="flex items-center justify-center rounded-full border border-dashed border-line-strong text-fg"
          >
            <Icon name="plus" size={22} />
          </span>
          <span className="w-full truncate text-center text-[10px] font-medium leading-3 text-fg-muted">
            Mais clubes
          </span>
        </Link>
      </div>
    </section>
  );
}
