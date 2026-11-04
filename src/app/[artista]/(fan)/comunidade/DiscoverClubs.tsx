"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setClubMembership } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { AllClubsButton, type ClubListItem } from "./AllClubsSheet";
import { ClubDot } from "@/components/fan/ClubDot";

/**
 * "Descubra fã clubes": bolinhas pequenas dos fã clubes que o fã ainda não segue. Tocar na bolinha abre a página do fã clube;
 * o "+" no canto entra nele na hora. "Ver todos" abre a lista completa.
 */
export function DiscoverClubs({ clubs, all }: { clubs: ClubListItem[]; all: ClubListItem[] }) {
  const { base, slug } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [busy, start] = useTransition();
  const list = clubs
    .filter((c) => !c.joined && !joined.has(c.slug))
    .sort((a, b) => Number(b.isMaster) - Number(a.isMaster))
    .slice(0, 10);
  if (list.length === 0) return null;

  const enter = (c: ClubListItem) =>
    start(async () => {
      setError("");
      const res = await setClubMembership(slug, c.slug, true);
      if (!res.ok && res.status !== 0) return setError(res.error);
      setJoined((cur) => new Set(cur).add(c.slug));
      toast.show(`Você entrou em ${c.name}`);
      if (res.ok) router.refresh();
    });

  return (
    <section aria-labelledby="discover-title" className="flex flex-col gap-2 border-t border-line pb-6 pt-5">
      <h2 id="discover-title" className="mono m-0">
        Descubra fã clubes
      </h2>
      {error && (
        <p className="err" role="alert">
          {error}
        </p>
      )}
      <ul className="-mx-4 m-0 flex list-none gap-3 overflow-x-auto px-4 pb-1 pt-1 [scrollbar-width:none]">
        {list.map((c) => (
          <li key={c.slug} className="relative flex w-[68px] flex-none flex-col items-center gap-1.5">
            <Link href={`${base}/clubes/${c.slug}`} aria-label={`Abrir ${c.name}`} className="flex flex-col items-center gap-1.5 text-fg no-underline" title={`${c.name} · ${c.members.toLocaleString("pt-BR")} membros`}>
              <ClubDot name={c.name} avatar={c.avatar} official={c.isMaster} />
              <span className="w-[68px] truncate text-center text-[11px] font-semibold leading-3">{c.name}</span>
            </Link>
            <button
              type="button"
              onClick={() => enter(c)}
              disabled={busy}
              aria-label={`Entrar em ${c.name}`}
              className="absolute right-0 top-9 flex size-6 cursor-pointer items-center justify-center rounded-full border-2 border-night bg-amber p-0 text-on-amber disabled:opacity-60"
            >
              <Icon name="plus" size={12} strokeWidth={3} />
            </button>
          </li>
        ))}
      </ul>
      <AllClubsButton clubs={all} />
    </section>
  );
}
