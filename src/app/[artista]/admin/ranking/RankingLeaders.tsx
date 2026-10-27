"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setRankingLeader } from "@/app/actions/admin";
import { AoVivo } from "@/components/admin/AoVivo";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { AdminNotice, btnSecondary } from "@/components/admin/ui";
import type { RankingFan, RankingScope } from "@/lib/types";

const who = (f: RankingFan) => (f.handle ? `${f.name} · ${f.handle}` : f.name);

/** Um cartão por ranking (o geral e cada fã clube): quem está em 1º e, se a administração tinha fixado alguém, o botão de voltar ao placar. */
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
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const id = `rk-${scope.clubSlug ?? "geral"}`;

  const backToScoreboard = () =>
    start(async () => {
      const res = await setRankingLeader(artist, scope.clubSlug, null);
      if (!res.ok) return setError(res.error);
      setError("");
      setAnnounce("Voltou ao placar.");
      router.refresh();
    });

  const first = scope.leader ?? scope.top;
  return (
    <section aria-labelledby={`${id}-t`} className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white px-4 py-3.5">
      <div className="flex items-center justify-between gap-2">
        <h2 id={`${id}-t`} className="m-0 text-sm font-bold">
          {scope.name}
        </h2>
        {first && <AoVivo />}
      </div>
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
          <button type="button" disabled={pending} onClick={backToScoreboard} className={btnSecondary}>
            Voltar ao placar
          </button>
        )}
      </div>
      {scope.leader && scope.top && scope.top.userId !== scope.leader.userId && (
        <p className="m-0 text-[13px] text-adm-muted">Pelo placar, o 1º seria {who(scope.top)}.</p>
      )}
    </section>
  );
}
