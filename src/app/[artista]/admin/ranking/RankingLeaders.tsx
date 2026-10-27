"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { findRankingFans, setRankingLeader } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { AdminNotice, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import type { RankingFan, RankingScope } from "@/lib/types";

const who = (f: RankingFan) => (f.handle ? `${f.name} · ${f.handle}` : f.name);

/** Um cartão por ranking (o geral e cada fã clube): quem está em 1º, busca de fã e botão de fixar ou desfazer. */
export function RankingLeaders({ artist, scopes }: { artist: string; scopes: RankingScope[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {scopes.map((s) => (
        <ScopeCard key={s.clubSlug ?? "geral"} artist={artist} scope={s} />
      ))}
    </div>
  );
}

function ScopeCard({ artist, scope }: { artist: string; scope: RankingScope }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<RankingFan[]>([]);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const id = `rk-${scope.clubSlug ?? "geral"}`;

  const search = (value: string) => {
    setQ(value);
    if (value.trim().length < 2) return setHits([]);
    start(async () => setHits(await findRankingFans(artist, value, scope.clubSlug ?? undefined)));
  };

  const choose = (user: RankingFan | null) =>
    start(async () => {
      const res = await setRankingLeader(artist, scope.clubSlug, user?.userId ?? null);
      if (!res.ok) return setError(res.error);
      setError("");
      setQ("");
      setHits([]);
      setAnnounce(user ? `${user.name} agora é o 1º.` : "Voltou ao placar.");
      router.refresh();
    });

  const first = scope.leader ?? scope.top;
  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white px-4 py-3.5">
      <h2 id={`${id}-t`} className="m-0 text-sm font-bold">
        {scope.name}
      </h2>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      <div className="flex items-center gap-3">
        {first ? <ClubAvatar src={first.avatar} name={first.name} size={44} /> : null}
        <div className="min-w-0 flex-1">
          <span className="font-adm-mono text-xs font-semibold text-adm-muted">1º lugar agora</span>
          <p className="m-0 truncate text-[15px] font-bold">{first ? who(first) : "Ninguém ainda"}</p>
          <p className="m-0 text-[13px] text-adm-muted">
            {scope.leader ? "Escolhido pela administração" : first ? "Pelo placar de compartilhamentos" : "Ninguém compartilhou ainda"}
          </p>
        </div>
        {scope.leader && (
          <button type="button" disabled={pending} onClick={() => choose(null)} className={btnSecondary}>
            Voltar ao placar
          </button>
        )}
      </div>
      {scope.leader && scope.top && scope.top.userId !== scope.leader.userId && (
        <p className="m-0 text-[13px] text-adm-muted">Pelo placar, o 1º seria {who(scope.top)}.</p>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-q`} className="text-[13px] font-semibold">
          Escolher outro fã
        </label>
        <input id={`${id}-q`} value={q} onChange={(e) => search(e.target.value)} placeholder="Nome, @ ou e-mail" autoComplete="off" className={inputClass} />
        {hits.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {hits.map((h) => (
              <li key={h.userId} className="flex items-center gap-2.5 rounded-lg border border-adm-line px-2.5 py-1.5">
                <ClubAvatar src={h.avatar} name={h.name} size={30} />
                <span className="min-w-0 flex-1 truncate text-sm">{who(h)}</span>
                <button type="button" disabled={pending} onClick={() => choose(h)} className={btnPrimary}>
                  Colocar em 1º
                </button>
              </li>
            ))}
          </ul>
        )}
        {q.trim().length >= 2 && !hits.length && !pending && <p className="m-0 text-[13px] text-adm-muted">Nenhum fã encontrado.</p>}
      </div>
    </section>
  );
}
