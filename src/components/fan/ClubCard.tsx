"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setClubMembership } from "@/app/actions/fan";
import { Icon } from "@/components/icons";
import type { FanClub } from "@/lib/types";
import { useArtist } from "./ArtistContext";

/** Botão entrar/sair de um fã clube (grátis; o fã pode estar em vários). */
export function JoinButton({ club, size = "md" }: { club: FanClub; size?: "md" | "lg" }) {
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

  const big = size === "lg";
  return (
    <span className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={joined}
        aria-label={`${joined ? "Sair do" : "Entrar no"} ${club.name}`}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-ink font-label font-bold disabled:cursor-wait ${
          big ? "min-h-12 px-5 text-sm" : "min-h-11 px-3.5 text-xs"
        } ${joined ? "bg-cream text-ink" : "bg-accent text-accent-fg"}`}
      >
        {joined && <Icon name="check" size={16} strokeWidth={2.6} />}
        {pending ? "…" : joined ? "Você está aqui" : "Entrar no clube"}
      </button>
      {error && (
        <span role="alert" className="font-label text-[11px] font-bold text-accent">
          {error}
        </span>
      )}
    </span>
  );
}

/** Cartão de fã clube (lista e início). */
export function ClubCard({ club }: { club: FanClub }) {
  const { base } = useArtist();
  return (
    <article className="flex flex-col gap-2.5 rounded-[14px] border-2 border-ink bg-cream p-3.5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`flex size-12 flex-none items-center justify-center rounded-full border-2 border-ink font-display text-xl ${
            club.isMaster ? "bg-accent text-accent-fg" : "bg-accent-2 text-ink"
          }`}
        >
          {club.name.replace(/^f[ãa] clube\s+/i, "").charAt(0).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link href={`${base}/clubes/${club.slug}`} className="font-body text-base font-extrabold text-ink no-underline hover:underline">
              {club.name}
            </Link>
            {club.isMaster && (
              <span className="rounded-md bg-accent px-1.5 py-0.5 font-label text-[10px] font-bold uppercase text-accent-fg">Master</span>
            )}
            {club.status !== "active" && (
              <span className="rounded-md bg-paper-2 px-1.5 py-0.5 font-label text-[10px] font-bold uppercase text-ink">Em configuração</span>
            )}
          </div>
          <span className="font-label text-[11px] text-ink-soft">
            {[club.city, `${club.members.toLocaleString("pt-BR")} ${club.members === 1 ? "membro" : "membros"}`, club.owner && `dono: ${club.owner.name}`]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </div>
      </div>
      {club.description && <p className="m-0 text-sm leading-snug text-ink-soft">{club.description}</p>}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <JoinButton club={club} />
        <Link href={`${base}/clubes/${club.slug}`} className="flex min-h-11 items-center font-label text-xs font-bold text-ink">
          Ver clube →
        </Link>
      </div>
    </article>
  );
}
