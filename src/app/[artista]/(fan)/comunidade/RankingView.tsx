"use client";

import Link from "next/link";
import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { formatPoints, initialsOf } from "@/lib/format";
import type { Ranking } from "@/lib/types";
import { thumb } from "@/lib/thumb";

type Row = Ranking["top"][number];

function Person({ row }: { row: Row }) {
  const { base } = useArtist();
  // A foto e o nome abrem o perfil público do fã (com o botão de enviar mensagem); o seu próprio abre o seu perfil.
  const href = row.me ? `${base}/perfil` : row.userId ? `${base}/fas/${encodeURIComponent(row.userId)}` : null;
  const face = row.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã
    <img src={thumb(row.avatar, 44)} alt="" width={44} height={44} className="size-11 flex-none rounded-full border border-line-strong object-cover" />
  ) : (
    <span className="avatar !size-11 flex-none" aria-hidden="true">
      {initialsOf(row.name)}
    </span>
  );
  const who = (
    <>
      {face}
      <span className="flex min-w-0 flex-1 flex-col leading-5">
        <strong className="truncate text-[15px]">
          {row.name}
          {row.me ? " (você)" : ""}
        </strong>
        {row.handle && <span className="mono truncate">{row.handle}</span>}
      </span>
    </>
  );
  return (
    <li className={`flex items-center gap-3 border-b border-line py-3 ${row.me ? "bg-raised px-2" : ""}`}>
      <span className="num w-8 flex-none font-display text-2xl font-black">{row.position}</span>
      {href ? (
        <Link href={href} aria-label={row.me ? "Ver meu perfil" : `Ver o perfil de ${row.name}`} className="flex min-w-0 flex-1 items-center gap-3 text-fg no-underline">
          {who}
        </Link>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-3">{who}</span>
      )}
      <span className="flex flex-none flex-col items-end leading-5">
        <strong className="num">{formatPoints(row.points ?? row.shares)}</strong>
        <span className="mono">pts</span>
      </span>
    </li>
  );
}

/**
 * Ranking "Fã Super do Vintage": quem mais compartilhou os posts oficiais no Instagram com a hashtag.
 * "Geral" mistura todos os fã clubes; cada fã clube tem o seu ranking, só com os membros dele.
 * Só conta o compartilhamento confirmado no Instagram com a hashtag.
 */
export function RankingView({ ranking, scope }: { ranking: Ranking | null; scope?: string[] }) {
  // `scope` (dono de fã clube): só os rankings dos fã clubes dele, sem o geral.
  const scoped = ranking?.clubs.filter((c) => !scope || scope.includes(c.slug)) ?? [];
  const [board, setBoard] = useState<string | null>(scope ? (scoped[0]?.slug ?? null) : null); // null = geral

  if (!ranking) {
    return <p className="mono px-4 py-8">O ranking aparece quando o app está ligado ao servidor.</p>;
  }
  const club = scoped.find((c) => c.slug === board) ?? null;
  const rows = club ? club.top : ranking.top;
  const onlyOne = !!scope && scoped.length <= 1;
  return (
    <div className="px-4 pb-8">
      <section aria-labelledby="rk-how" className="border-b border-line py-5">
        <h2 id="rk-how" className="m-0 font-display text-3xl font-black leading-8">
          Fã Super do Vintage
        </h2>
        <p className="mb-0 mt-2">
          Compartilhe a <strong>#{ranking.hashtag}</strong> no seu Instagram e suba no ranking.
        </p>
      </section>

      {/* Geral (todos os fã clubes juntos) ou o ranking de um fã clube. */}
      <nav hidden={onlyOne} aria-label="Qual ranking" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
        {!scope && (
          <button type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={board === null} onClick={() => setBoard(null)}>
            Geral
          </button>
        )}
        {scoped.map((c) => (
          <button key={c.slug} type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={board === c.slug} onClick={() => setBoard(c.slug)}>
            {c.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
              <img src={thumb(c.avatar, 18)} alt="" width={18} height={18} className="size-[18px] rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full bg-raised text-[10px] font-black text-fg">
                {initialsOf(c.name).charAt(0)}
              </span>
            )}
            {c.name}
          </button>
        ))}
      </nav>

      <section aria-labelledby="rk-top" className="pt-4">
        <h3 id="rk-top" className="mono m-0 mb-1">
          {club ? `Top fãs · ${club.name}` : "Top fãs · todos os fã clubes"}
        </h3>
        {rows.length === 0 ? (
          <p className="py-6 text-fg-muted">Ninguém no ranking ainda. Compartilhe um post e seja o primeiro.</p>
        ) : (
          <ol className="m-0 flex list-none flex-col p-0">
            {rows.map((r) => (
              <Person key={`${r.position}-${r.name}`} row={r} />
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
