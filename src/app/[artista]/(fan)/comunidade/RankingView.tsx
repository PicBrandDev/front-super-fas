"use client";

import { useState } from "react";
import { useToast } from "@/components/fan/Toast";
import { initialsOf } from "@/lib/format";
import type { Ranking } from "@/lib/types";

type Row = Ranking["top"][number];

function Person({ row }: { row: Row }) {
  return (
    <li className={`flex items-center gap-3 border-b border-line py-3 ${row.me ? "bg-raised px-2" : ""}`}>
      <span className="num w-8 flex-none font-display text-2xl font-black">{row.position}</span>
      {row.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã
        <img src={row.avatar} alt="" width={44} height={44} className="size-11 flex-none rounded-full border border-line-strong object-cover" />
      ) : (
        <span className="avatar !size-11 flex-none" aria-hidden="true">
          {initialsOf(row.name)}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col leading-5">
        <strong className="truncate text-[15px]">
          {row.name}
          {row.me ? " (você)" : ""}
        </strong>
        {row.handle && <span className="mono truncate">{row.handle}</span>}
      </span>
      <span className="flex flex-none flex-col items-end leading-5">
        <strong className="num">{row.shares}</strong>
        <span className="mono">{row.shares === 1 ? "post" : "posts"}</span>
      </span>
    </li>
  );
}

/**
 * Ranking "Fã Super do Vintage": quem mais compartilhou os posts oficiais no Instagram com a hashtag.
 * "Geral" mistura todos os fã clubes; cada fã clube tem o seu ranking, só com os membros dele.
 * Só conta o compartilhamento confirmado (a legenda leva a hashtag e o código do fã).
 */
export function RankingView({ ranking }: { ranking: Ranking | null }) {
  const toast = useToast();
  const [board, setBoard] = useState<string | null>(null); // null = geral

  if (!ranking) {
    return <p className="mono px-4 py-8">O ranking aparece quando o app está ligado ao servidor.</p>;
  }
  const club = ranking.clubs.find((c) => c.slug === board) ?? null;
  const rows = club ? club.top : ranking.top;
  const me = club ? club.me : ranking.me;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`#${ranking.hashtag} ${ranking.myCode}`);
      toast.show("Hashtag e código copiados");
    } catch {
      toast.show("Não deu para copiar. Selecione e copie.");
    }
  };

  return (
    <div className="px-4 pb-8">
      <section aria-labelledby="rk-how" className="border-b border-line py-5">
        <h2 id="rk-how" className="m-0 font-display text-3xl font-black leading-8">
          Fã Super do Vintage
        </h2>
        <p className="mb-0 mt-2 text-fg-muted">
          Reposte os posts oficiais do Vintage Culture no seu Instagram. Só contabiliza com a <strong className="text-fg">#{ranking.hashtag}</strong>{" "}
          e o seu código na legenda.
        </p>
        <button type="button" className="btn btn-outline btn-sm mt-3" onClick={copy}>
          Copiar #{ranking.hashtag} {ranking.myCode}
        </button>
        {!ranking.autoVerify && (
          <p className="mono mb-0 mt-3">A conferência automática no Instagram ainda não está ligada: os compartilhamentos ficam pendentes.</p>
        )}
      </section>

      {/* Geral (todos os fã clubes juntos) ou o ranking de um fã clube. */}
      <nav aria-label="Qual ranking" className="-mx-4 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
        <button type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={board === null} onClick={() => setBoard(null)}>
          Geral
        </button>
        {ranking.clubs.map((c) => (
          <button key={c.slug} type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={board === c.slug} onClick={() => setBoard(c.slug)}>
            {c.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
              <img src={c.avatar} alt="" width={18} height={18} className="size-[18px] rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full bg-raised text-[10px] font-black text-fg">
                {initialsOf(c.name).charAt(0)}
              </span>
            )}
            {c.name}
          </button>
        ))}
      </nav>

      <section aria-labelledby="rk-me" className="grid grid-cols-3 gap-3 border-y border-line py-4">
        <h3 id="rk-me" className="sr-only">
          Você neste ranking
        </h3>
        {me ? (
          [
            { label: "Sua posição", value: me.position ? `${me.position}º` : "—" },
            { label: "Confirmados", value: String(me.shares) },
            { label: "Pendentes", value: String(me.pending) },
          ].map((x) => (
            <div key={x.label} className="flex flex-col gap-1">
              <span className="mono">{x.label}</span>
              <strong className="num font-display text-3xl font-black leading-8">{x.value}</strong>
            </div>
          ))
        ) : (
          <p className="mono col-span-3 m-0">Você não é membro deste fã clube, então não aparece no ranking dele.</p>
        )}
      </section>

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
