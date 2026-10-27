"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { AdminEmpty, Badge, btnPrimary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatCount } from "@/lib/format";
import type { ClubHighlight, ClubOverview, RankingScope } from "@/lib/types";
import { Destaques } from "./Destaques";
import { RankingPessoas } from "./RankingPessoas";

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/** Todos os fã clubes do ambiente (sem limite) em cards: foto, dono e números. Clicar abre o analytics. */
export function PainelClubes({ artist, artistName, clubs, highlights, ranking }: { artist: string; artistName: string; clubs: ClubOverview[]; highlights: ClubHighlight[]; ranking: RankingScope[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return clubs;
    return clubs.filter((c) => norm(`${c.name} ${c.city} ${c.ownerName ?? ""} ${c.ownerEmail ?? ""}`).includes(t));
  }, [clubs, q]);

  const sum = (f: (c: ClubOverview) => number) => clubs.reduce((a, c) => a + f(c), 0);
  const stats = [
    { label: "Fã clubes", value: clubs.length },
    { label: "Membros", value: sum((c) => c.members) },
    { label: "Novos (30 dias)", value: sum((c) => c.newMembersMonth) },
    { label: "Posts (30 dias)", value: sum((c) => c.postsMonth) },
  ];

  return (
    <>
      <AdminPageHeader
        title="Fã clubes"
        headingId="painel-title"
        description={`Todos os fã clubes do ambiente de ${artistName}. Abra um para ver o analytics dele.`}
        actions={
          <Link href={`/${artist}/admin/clubes/novo`} className={`${btnPrimary} no-underline`}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Criar fã clube
          </Link>
        }
      />

      <dl aria-label="Resumo" className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{s.label}</dt>
            <dd className="m-0 font-display text-3xl font-black leading-9">{formatCount(s.value)}</dd>
          </div>
        ))}
      </dl>

      {highlights.length > 0 && (
        <section aria-labelledby="destaques-title" className="flex flex-col gap-3">
          <h2 id="destaques-title" className="m-0 font-display text-3xl font-black">
            Destaques dos fã clubes
          </h2>
          <Destaques artist={artist} clubs={highlights} />
        </section>
      )}

      {ranking.length > 0 && <RankingPessoas artist={artist} scopes={ranking} />}

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="painel-busca" className="sr-only">
          Buscar fã clube, dono ou cidade
        </label>
        <input
          id="painel-busca"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar fã clube, dono ou cidade"
          className={`${inputClass} w-full max-w-[380px]`}
        />
        <span role="status" aria-live="polite" className="font-adm-mono text-[13px] text-adm-muted">
          {shown.length} de {clubs.length}
        </span>
        <Link href={`/${artist}/admin/clubes`} className="ml-auto text-[13px] font-semibold text-adm-blue-dark">
          Colocar no ar ou apagar fã clubes
        </Link>
      </div>

      {shown.length === 0 ? (
        <AdminEmpty title="Nenhum fã clube encontrado" text="Tente outro nome, dono ou cidade." />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
          {shown.map((c) => (
            <li key={c.id}>
              <article className="relative flex h-full flex-col gap-4 rounded-xl border border-adm-line bg-white p-4 transition-colors focus-within:border-adm-blue hover:border-adm-blue">
                <div className="flex items-start gap-3">
                  <ClubAvatar src={c.avatar} name={c.name} size={56} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <h2 className="m-0 truncate text-base font-bold leading-5">
                      <Link href={`/${artist}/admin/analytics/${c.slug}`} className="text-adm-ink no-underline after:absolute after:inset-0 after:content-['']">
                        {c.name}
                      </Link>
                    </h2>
                    <span className="truncate text-[13px] text-adm-muted">{c.isMaster ? "Fã clube master" : c.city || "Sem cidade"}</span>
                  </div>
                  <Badge tone={c.status === "active" ? "ok" : "warn"}>{c.status === "active" ? "No ar" : "Em config."}</Badge>
                </div>

                <div className="flex items-center gap-2.5 rounded-lg bg-adm-bg px-3 py-2">
                  {c.ownerName ? <ClubAvatar src={c.ownerAvatar} name={c.ownerName} size={32} /> : <Icon name="user" size={16} />}
                  {c.ownerName ? (
                    <span className="flex min-w-0 flex-col leading-4">
                      <span className="font-adm-mono text-[10px] font-semibold uppercase tracking-wider text-adm-muted">Dono</span>
                      <strong className="truncate text-[13px]">{c.ownerName}</strong>
                    </span>
                  ) : (
                    <Link href={`/${artist}/admin/clubes`} className="relative z-10 text-[13px] font-semibold text-adm-blue-dark">
                      Sem dono · convidar
                    </Link>
                  )}
                </div>

                <dl className="m-0 mt-auto grid grid-cols-3 gap-2 border-t border-adm-line-soft pt-3">
                  {[
                    { label: "Membros", value: formatCount(c.members) },
                    { label: "Novos 30d", value: `+${formatCount(c.newMembersMonth)}` },
                    { label: "Posts 30d", value: formatCount(c.postsMonth) },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col gap-0.5">
                      <dt className="text-[11px] text-adm-muted">{m.label}</dt>
                      <dd className="m-0 font-adm-mono text-[15px] font-semibold">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
