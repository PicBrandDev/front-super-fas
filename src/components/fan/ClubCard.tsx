"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setClubMembership } from "@/app/actions/fan";
import { Icon } from "@/components/icons";
import type { FanClub } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import { Notice } from "./states";

/** Entrar num fã clube (`.btn-outline`) ou "Você está dentro" (`.ok`; tocar de novo sai). */
export function JoinButton({ club }: { club: FanClub; size?: "md" | "lg" }) {
  const { slug } = useArtist();
  const router = useRouter();
  const [joined, setJoined] = useState(club.joined);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const toggle = () =>
    start(async () => {
      const next = !joined;
      const res = await setClubMembership(slug, club.slug, next);
      if (!res.ok && res.status !== 0) {
        setError(res.error);
        return;
      }
      setError("");
      setJoined(next);
      if (res.ok) router.refresh();
    });

  return (
    <span className="flex flex-col items-end gap-2">
      {joined ? (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-busy={pending}
          aria-pressed="true"
          aria-label={`Sair do ${club.name}`}
          className="ok cursor-pointer border-0 bg-transparent p-0"
        >
          <Icon name="check" size={16} />
          {pending ? "Saindo…" : "Você está dentro"}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-busy={pending}
          aria-pressed="false"
          aria-label={`Entrar no ${club.name}`}
          className="btn btn-outline btn-sm"
        >
          {pending ? "Entrando…" : "Entrar"}
        </button>
      )}
      {error && <Notice tone="error">{error}</Notice>}
    </span>
  );
}

/** Linha de fã clube (lista e Início): nome em serifa, cidade e membros em mono, entrar à direita. */
export function ClubCard({ club }: { club: FanClub }) {
  const { base } = useArtist();
  const members = `${club.members.toLocaleString("pt-BR")} ${club.members === 1 ? "membro" : "membros"}`;
  return (
    <article className="flex items-center gap-3 border-b border-line py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`${base}/clubes/${club.slug}`}
            className="font-display text-[19px] font-bold leading-[22px] text-fg no-underline hover:text-amber-text"
          >
            {club.name}
          </Link>
          {club.isMaster && <span className="tag">Master</span>}
          {club.status !== "active" && <span className="tag tag-demo">Em configuração</span>}
        </div>
        <span className="mono">{[club.city, members].filter(Boolean).join(" · ")}</span>
      </div>
      <JoinButton club={club} />
    </article>
  );
}
