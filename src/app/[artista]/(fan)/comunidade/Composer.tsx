"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { fanPost } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { initialsOf } from "@/lib/format";
import type { Post } from "@/lib/types";

/*
 * Campo de escrever para a comunidade (`.compose` do protótipo): avatar com as
 * iniciais, textarea de 280 caracteres com contador mono e o botão Publicar,
 * que vira primário quando há texto. Usado na Comunidade e no mural do fã clube.
 * Chama `fanPost`; sem API (modo exemplo) o post fica só nesta tela.
 */

export type ClubRef = { slug: string; name: string };

const MAX = 280;

/** Aviso para quem não está em nenhum fã clube (não dá para postar). */
export function NoClubToPost() {
  const { base } = useArtist();
  return (
    <div className="flex flex-col gap-3 border-b border-line py-4">
      <p className="mono m-0">Entre num fã clube para postar</p>
      <Link href={`${base}/clubes`} className="go min-h-11 self-start">
        Ver fã clubes
      </Link>
    </div>
  );
}

export function Compose({
  clubs,
  onPosted,
}: {
  clubs: ClubRef[];
  onPosted?: (post: Post, simulated: boolean) => void;
}) {
  const { viewer, slug } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const uid = useId();
  const [club, setClub] = useState(clubs[0]?.slug ?? "");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [posting, start] = useTransition();
  if (clubs.length === 0) return <NoClubToPost />;

  const clubName = clubs.find((c) => c.slug === club)?.name ?? clubs[0].name;
  const trimmed = text.trim();

  const submit = () => {
    if (posting || !trimmed || !club) return;
    start(async () => {
      const res = await fanPost(slug, club, "galera", trimmed);
      if (!res.ok && res.status !== 0) {
        setError(res.error);
        return;
      }
      setError("");
      setText("");
      const simulated = !res.ok;
      onPosted?.(
        {
          id: `n-${Date.now()}`,
          kind: "galera",
          author: { name: "Você", handle: viewer.handle, initial: viewer.initial },
          timeLabel: "agora",
          text: trimmed,
          club: { slug: club, name: clubName },
          likes: 0,
          comments: 0,
          reposts: 0,
        },
        simulated,
      );
      toast.show("Publicado na comunidade" + (res.ok && (res.data as { rewardSpin?: boolean } | undefined)?.rewardSpin ? " · você ganhou 1 giro na roleta" : ""));
      if (!simulated) router.refresh();
    });
  };

  return (
    <form
      className="grid grid-cols-[32px_1fr] gap-3 border-b border-line py-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="avatar" aria-hidden="true">
        {initialsOf(viewer.name)}
      </div>
      <div>
        {clubs.length > 1 && (
          <div className="mb-2 flex items-center gap-2">
            <label htmlFor={`${uid}-club`} className="mono">
              Postar no
            </label>
            <select
              id={`${uid}-club`}
              value={club}
              onChange={(e) => setClub(e.target.value)}
              className="field min-h-10 w-auto flex-1 py-1 text-sm"
            >
              {clubs.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <label htmlFor={`${uid}-text`} className="sr-only">
          Escreva para a comunidade
        </label>
        <textarea
          id={`${uid}-text`}
          className="field min-h-12"
          rows={2}
          maxLength={MAX}
          placeholder="Fala com o fã clube"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="mono num">
            {text.length} / {MAX}
          </span>
          <button
            type="submit"
            disabled={!trimmed || posting}
            aria-busy={posting}
            className={`btn btn-sm ${trimmed ? "btn-primary" : "btn-outline"}`}
          >
            {posting ? "Publicando…" : "Publicar"}
          </button>
        </div>
        {error && <Notice tone="error">{error}</Notice>}
      </div>
    </form>
  );
}
