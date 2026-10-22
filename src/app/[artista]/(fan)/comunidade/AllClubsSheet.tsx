"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setClubMembership } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Sheet } from "@/components/fan/Sheet";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";

export type ClubListItem = {
  slug: string;
  name: string;
  city: string;
  members: number;
  avatar: string | null;
  joined: boolean;
  isMaster: boolean;
};

/**
 * Botão "Ver todos os fã clubes": abre a lista de todos os fã clubes do ambiente, cada um com
 * "Entrar" (ou "Seguindo", se o fã já entrou) e o link para abrir a página dele.
 */
export function AllClubsButton({ clubs, variant = "row" }: { clubs: ClubListItem[]; variant?: "row" | "button" }) {
  const { base, slug } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState<Set<string>>(() => new Set(clubs.filter((c) => c.joined).map((c) => c.slug)));
  const [error, setError] = useState("");
  const [busy, start] = useTransition();

  const enter = (c: ClubListItem) =>
    start(async () => {
      setError("");
      const res = await setClubMembership(slug, c.slug, true);
      // Sem API (modo exemplo, status 0) só marca na tela.
      if (!res.ok && res.status !== 0) return setError(res.error);
      setJoined((cur) => new Set(cur).add(c.slug));
      toast.show(`Você entrou em ${c.name}`);
      if (res.ok) router.refresh();
    });

  return (
    <>
      {variant === "row" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-h-12 w-full cursor-pointer items-center justify-between border-0 border-y border-solid border-line bg-transparent px-0 py-0 text-left font-grotesk text-[15px] font-semibold uppercase tracking-wide text-fg"
        >
          Ver todos os fã clubes
          <Icon name="arrow" size={18} />
        </button>
      ) : (
        <button type="button" className="btn btn-primary self-start" onClick={() => setOpen(true)}>
          Ver todos os fã clubes
        </button>
      )}
      <Sheet open={open} onClose={() => setOpen(false)} title="Todos os fã clubes">
        <p>Entre num fã clube para seguir o feed dele na Comunidade e postar nele.</p>
        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        <ul className="m-0 flex max-h-[55dvh] list-none flex-col overflow-y-auto p-0">
          {clubs.map((c) => {
            const isIn = joined.has(c.slug);
            return (
              <li key={c.slug} className="flex items-center gap-3 border-t border-line py-3">
                {c.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã clube
                  <img src={c.avatar} alt="" width={40} height={40} className="size-10 flex-none rounded-full object-cover" />
                ) : (
                  <span aria-hidden="true" className="flex size-10 flex-none items-center justify-center rounded-full bg-raised font-display text-sm font-black">
                    {initialsOf(c.name).charAt(0)}
                  </span>
                )}
                <span className="flex min-w-0 flex-1 flex-col leading-5">
                  <strong className="truncate text-[15px]">{c.name}</strong>
                  <span className="mono truncate">
                    {c.isMaster ? "Fã clube oficial" : c.city || "Fã clube"} · {c.members.toLocaleString("pt-BR")} membros
                  </span>
                </span>
                {isIn ? (
                  <Link href={`${base}/clubes/${c.slug}`} className="btn btn-outline btn-sm flex-none">
                    Abrir
                  </Link>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm flex-none" onClick={() => enter(c)} disabled={busy}>
                    Entrar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" className="btn btn-outline" data-close>
          Fechar
        </button>
      </Sheet>
    </>
  );
}
