"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { AdminEmpty, Badge, btnPrimary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatBRL, formatCount } from "@/lib/format";
import type { ClubHighlight, ClubOverview } from "@/lib/types";
import { Destaques } from "./Destaques";

const norm = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * Painel do ambiente: primeiro os fã clubes (um card por clube, com dono e os números que importam; clicar abre o
 * analytics) e, embaixo, os destaques entre eles. O ranking de fãs fica na própria página.
 */
export function PainelClubes({
  artist,
  clubs,
  highlights,
  priceCents,
  monthlyRevenueCents,
}: {
  artist: string;
  clubs: ClubOverview[];
  highlights: ClubHighlight[];
  priceCents: number;
  monthlyRevenueCents: number | null;
}) {
  const [q, setQ] = useState("");
  const subsOf = useMemo(() => new Map(highlights.map((h) => [h.slug, h.subscribers])), [highlights]);
  const shown = useMemo(() => {
    const t = norm(q.trim());
    if (!t) return clubs;
    return clubs.filter((c) => norm(`${c.name} ${c.city} ${c.ownerName ?? ""} ${c.ownerEmail ?? ""}`).includes(t));
  }, [clubs, q]);

  const sum = (f: (c: ClubOverview) => number) => clubs.reduce((a, c) => a + f(c), 0);
  const stats: { label: string; value: string; href: string | null }[] = [
    { label: "Fã clubes", value: formatCount(clubs.length), href: null },
    { label: "Membros", value: formatCount(sum((c) => c.members)), href: null },
    { label: "Novos (30 dias)", value: `+${formatCount(sum((c) => c.newMembersMonth))}`, href: null },
    { label: "Posts (30 dias)", value: formatCount(sum((c) => c.postsMonth)), href: null },
    ...(monthlyRevenueCents != null ? [{ label: "Receita mensal", value: formatBRL(monthlyRevenueCents), href: `/${artist}/admin/membros` }] : []),
  ];

  return (
    <>
      <h1 id="painel-title" className="sr-only">
        Fã clubes
      </h1>

      <dl aria-label="Resumo" className="m-0 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{s.label}</dt>
            <dd className="m-0 font-display text-4xl font-black leading-10">
              {s.href ? (
                <Link href={s.href} className="text-adm-ink no-underline hover:text-adm-blue-dark">
                  {s.value}
                </Link>
              ) : (
                s.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      {highlights.length > 0 && (
        <section aria-labelledby="destaques-title" className="flex flex-col gap-3">
          <h2 id="destaques-title" className="m-0 font-display text-3xl font-black">
            Destaques
          </h2>
          <Destaques artist={artist} clubs={highlights} />
        </section>
      )}

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
          className={`${inputClass} min-w-[260px] flex-1`}
        />
        <span role="status" aria-live="polite" className="font-adm-mono text-[13px] text-adm-muted">
          {shown.length} de {clubs.length}
        </span>
        <Link href={`/${artist}/admin/clubes`} className="ml-auto text-[13px] font-semibold text-adm-blue-dark">
          Colocar no ar ou apagar
        </Link>
        <Link href={`/${artist}/admin/clubes/novo`} className={`${btnPrimary} no-underline`}>
          <Icon name="plus" size={18} strokeWidth={2.4} />
          Criar fã clube
        </Link>
      </div>

      {shown.length === 0 ? (
        <AdminEmpty title="Nenhum fã clube encontrado" text="Tente outro nome, dono ou cidade." />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
          {shown.map((c) => {
            const subs = subsOf.get(c.slug) ?? 0;
            return (
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
                    {c.ownerName ? <ClubAvatar src={c.ownerAvatar} name={c.ownerName} size={32} verified /> : <Icon name="user" size={16} />}
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

                  <dl className="m-0 mt-auto grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-adm-line-soft pt-3">
                    {[
                      { label: "Membros", value: formatCount(c.members), note: `+${formatCount(c.newMembersMonth)} em 30 dias` },
                      { label: "Assinantes", value: formatCount(subs), note: null },
                      { label: "Receita por mês", value: formatBRL(subs * priceCents), note: null },
                      { label: "Posts em 30 dias", value: formatCount(c.postsMonth), note: null },
                    ].map((m) => (
                      <div key={m.label} className="flex flex-col gap-0.5">
                        <dt className="text-[11px] text-adm-muted">{m.label}</dt>
                        <dd className="m-0 font-adm-mono text-[15px] font-semibold">{m.value}</dd>
                        {m.note && <dd className="m-0 text-[11px] text-adm-muted">{m.note}</dd>}
                      </div>
                    ))}
                  </dl>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
