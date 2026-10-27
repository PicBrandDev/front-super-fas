"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { loadPersonHistory } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge } from "@/components/admin/ui";
import { formatCount } from "@/lib/format";
import type { PersonHistory, PersonShare, RankingPerson, RankingScope } from "@/lib/types";

const when = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "—";

const STATUS: Record<PersonShare["status"], { label: string; tone: "ok" | "warn" | "off" }> = {
  verified: { label: "Confirmado no Instagram", tone: "ok" },
  claimed: { label: "Aguardando conferência", tone: "warn" },
  started: { label: "Só iniciou", tone: "off" },
};

const KIND: Record<string, string> = { drop: "Drop News", galera: "Galera", instagram: "Instagram" };

/** Quem está no ranking de pessoas: o geral e o de cada fã clube, com abas. Clicar numa pessoa abre o histórico dela. */
export function RankingPessoas({ artist, scopes }: { artist: string; scopes: RankingScope[] }) {
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState<RankingPerson | null>(null);
  const scope = scopes[active] ?? scopes[0];

  return (
    <section aria-labelledby="rkp-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="rkp-title" className="m-0 font-display text-3xl font-black">
            Ranking de pessoas
          </h2>
          <p className="m-0 text-[13px] text-adm-muted">Fãs com mais compartilhamentos confirmados no Instagram (Fã Super). Clique numa pessoa para ver o histórico dela.</p>
        </div>
        <Link href={`/${artist}/admin/ranking`} className="text-[13px] font-semibold text-adm-blue-dark">
          Escolher quem fica em 1º
        </Link>
      </div>

      <div role="tablist" aria-label="Ranking" className="flex flex-wrap gap-2">
        {scopes.map((s, i) => (
          <button
            key={s.clubSlug ?? "geral"}
            type="button"
            role="tab"
            id={`rkp-tab-${i}`}
            aria-selected={i === active}
            aria-controls="rkp-panel"
            onClick={() => setActive(i)}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${i === active ? "border-adm-blue bg-adm-blue-soft text-adm-blue-dark" : "border-adm-line bg-white text-adm-muted"}`}
          >
            {s.clubSlug ? s.name : "Geral"}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="rkp-panel" aria-labelledby={`rkp-tab-${active}`} className="rounded-xl border border-adm-line bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="m-0 text-base font-bold">{scope.name}</h3>
          <span className="font-adm-mono text-[13px] text-adm-muted">{formatCount(scope.ranked)} pessoas no ranking</span>
          {scope.leader && <Badge tone="info">1º escolhido pela administração</Badge>}
        </div>
        {scope.people.length === 0 ? (
          <p className="m-0 text-sm text-adm-muted">Ninguém pontuou ainda neste ranking.</p>
        ) : (
          <ol className="m-0 grid list-none gap-x-6 gap-y-1 p-0 md:grid-cols-2">
            {scope.people.map((p) => (
              <li key={p.userId} className="border-b border-adm-line-soft">
                <button
                  type="button"
                  onClick={() => setPicked(p)}
                  aria-label={`Ver o histórico de ${p.name}`}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-1 py-2 text-left text-adm-ink hover:bg-adm-bg"
                >
                  <span className={`w-6 text-center font-display text-xl font-black ${p.position === 1 ? "text-adm-blue-dark" : "text-adm-muted"}`}>{p.position}</span>
                  <ClubAvatar src={p.avatar} name={p.name} size={40} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <strong className="truncate text-sm">{p.name}</strong>
                    <span className="truncate text-[13px] text-adm-muted">{p.handle}</span>
                  </span>
                  <span className="text-right font-adm-mono text-sm font-semibold">
                    {formatCount(p.shares)}
                    <span className="block text-[11px] font-normal text-adm-muted">compart.</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {picked && <PersonDialog artist={artist} person={picked} onClose={() => setPicked(null)} />}
    </section>
  );
}

/** Histórico do fã: compartilhamentos da hashtag (horário e pontos de cada um) e os posts que ele fez. */
function PersonDialog({ artist, person, onClose }: { artist: string; person: RankingPerson; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [data, setData] = useState<PersonHistory | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, start] = useTransition();

  useEffect(() => {
    ref.current?.showModal();
    start(async () => {
      const h = await loadPersonHistory(artist, person.userId);
      setData(h);
      setFailed(!h);
    });
  }, [artist, person.userId]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="ph-title"
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[88vh] w-[min(920px,94vw)] overflow-y-auto rounded-2xl border border-adm-line bg-adm-bg p-0 text-adm-ink backdrop:bg-black/60"
    >
      <div className="flex flex-col gap-5 p-5">
        <div className="flex items-center gap-4">
          <ClubAvatar src={person.avatar} name={person.name} size={64} />
          <div className="flex min-w-0 flex-1 flex-col">
            <h2 id="ph-title" className="m-0 truncate font-display text-2xl font-black">
              {person.name}
            </h2>
            <span className="text-[13px] text-adm-muted">{person.handle}</span>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="cursor-pointer rounded-lg border border-adm-line bg-white px-3 py-1.5 text-sm font-semibold text-adm-ink">
            Fechar
          </button>
        </div>

        {loading && !data && <p className="m-0 text-sm text-adm-muted">Carregando o histórico…</p>}
        {failed && <p className="m-0 text-sm text-adm-muted">Não foi possível carregar o histórico.</p>}

        {data && (
          <>
            <dl className="m-0 grid grid-cols-3 gap-3">
              {[
                { label: "Posição no geral", value: data.position ? `${data.position}º` : "—" },
                { label: "Pontos no ranking", value: formatCount(data.points) },
                { label: "Aguardando conferência", value: formatCount(data.pending) },
              ].map((k) => (
                <div key={k.label} className="rounded-xl border border-adm-line bg-white px-3.5 py-3">
                  <dt className="text-xs text-adm-muted">{k.label}</dt>
                  <dd className="m-0 font-display text-3xl font-black">{k.value}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="ph-shares" className="flex flex-col gap-2">
              <h3 id="ph-shares" className="m-0 text-base font-bold">
                Compartilhamentos da hashtag
              </h3>
              <p className="m-0 text-[13px] text-adm-muted">Cada compartilhamento confirmado vale 1 ponto no ranking. O giro da roleta vem quando o fã diz que postou.</p>
              {data.shares.length === 0 ? (
                <p className="m-0 text-sm text-adm-muted">Ainda não compartilhou nenhum post.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
                  <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
                    <caption className="sr-only">Compartilhamentos de {data.name}</caption>
                    <thead>
                      <tr className="border-b border-adm-line font-adm-mono text-[11px] uppercase tracking-wider text-adm-muted">
                        {["Iniciou", "Confirmado", "O que compartilhou", "Situação", "Pontos", "Giro", "Total"].map((h) => (
                          <th key={h} scope="col" className="px-2.5 py-2 font-semibold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.shares.map((s) => (
                        <tr key={s.id} className="border-b border-adm-line-soft align-top">
                          <td className="whitespace-nowrap px-2.5 py-2 font-adm-mono">{when(s.startedAt)}</td>
                          <td className="whitespace-nowrap px-2.5 py-2 font-adm-mono">{when(s.verifiedAt)}</td>
                          <td className="max-w-[240px] px-2.5 py-2">
                            <span className="line-clamp-2">{s.what}</span>
                            {s.permalink && (
                              <a href={s.permalink} target="_blank" rel="noreferrer" className="text-xs font-semibold text-adm-blue-dark">
                                Ver no Instagram
                              </a>
                            )}
                          </td>
                          <td className="px-2.5 py-2">
                            <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                          </td>
                          <td className="px-2.5 py-2 font-adm-mono font-semibold">{s.rankingPoints ? `+${s.rankingPoints}` : "0"}</td>
                          <td className="px-2.5 py-2 font-adm-mono">{s.spins ? "+1" : "0"}</td>
                          <td className="px-2.5 py-2 font-adm-mono">{s.totalPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section aria-labelledby="ph-posts" className="flex flex-col gap-2">
              <h3 id="ph-posts" className="m-0 text-base font-bold">
                Histórico de postagens
              </h3>
              {data.posts.length === 0 ? (
                <p className="m-0 text-sm text-adm-muted">Ainda não postou no app.</p>
              ) : (
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {data.posts.map((p) => (
                    <li key={p.id} className="flex gap-3 rounded-xl border border-adm-line bg-white p-3">
                      {p.image && <img src={p.image} alt="" width={64} height={64} className="size-16 flex-none rounded-lg object-cover" />}
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="m-0 line-clamp-3 text-sm">{p.text}</p>
                        <span className="text-xs text-adm-muted">
                          {when(p.createdAt)} · {p.club ?? KIND[p.kind] ?? p.kind} · {formatCount(p.likes)} curtidas · {formatCount(p.comments)} comentários · {formatCount(p.reposts)} republic.
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </dialog>
  );
}
