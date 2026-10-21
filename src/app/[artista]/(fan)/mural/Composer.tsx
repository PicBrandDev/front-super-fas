"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fanPost } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { EmptyState, Notice } from "@/components/fan/states";
import type { Post } from "@/lib/types";

/*
 * Campo de postar no feed da galera (e de trazer post do Instagram).
 * Usado no Mural, no Início (desktop) e na página do fã clube, sempre com o
 * mesmo fluxo: escolhe o clube quando o fã está em mais de um, chama `fanPost`
 * e, sem API (modo exemplo), devolve o post para a tela mostrar na hora.
 */

export type ClubRef = { slug: string; name: string };

const box = "shadow-hard flex flex-col gap-2 rounded-[14px] border-2 border-ink bg-cream p-3";
const label = "font-label text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft";
const field = "rounded-[10px] border-[1.5px] border-ink-soft bg-paper text-ink placeholder:text-ink-soft";
const primary =
  "flex min-h-11 cursor-pointer items-center rounded-full border-2 border-ink bg-accent font-label font-bold text-accent-fg disabled:cursor-wait";

type Kind = "galera" | "instagram";

/** Estado comum: clube escolhido, envio, erro e confirmação. */
function useComposer(clubs: ClubRef[], onPosted?: (post: Post, simulated: boolean) => void) {
  const { viewer, slug } = useArtist();
  const router = useRouter();
  const [club, setClub] = useState(clubs[0]?.slug ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [posting, start] = useTransition();
  const clubName = clubs.find((c) => c.slug === club)?.name ?? "";

  function send(kind: Kind, text: string, url: string, clear: () => void) {
    if (posting || !club) return;
    setDone("");
    start(async () => {
      const res = await fanPost(slug, club, kind, text, url);
      if (!res.ok && res.status !== 0) {
        setError(res.error);
        return;
      }
      setError("");
      clear();
      const simulated = !res.ok;
      const post: Post = {
        id: `n-${kind}-${Date.now()}`,
        kind,
        author: { name: "Você", handle: viewer.handle, initial: viewer.initial },
        timeLabel: "agora",
        text,
        url: url || null,
        club: { slug: club, name: clubName },
        likes: 0,
        comments: 0,
        reposts: 0,
      };
      setDone(
        kind === "galera"
          ? `Post publicado no ${clubName}.${simulated ? " (modo exemplo: só nesta tela)" : ""}`
          : `Post do Instagram trazido para o ${clubName}.${simulated ? " (modo exemplo: só nesta tela)" : ""}`,
      );
      onPosted?.(post, simulated);
      if (!simulated) router.refresh();
    });
  }

  return { club, setClub, clubName, error, done, posting, send };
}

function ClubSelect({ id, clubs, value, onChange }: { id: string; clubs: ClubRef[]; value: string; onChange: (v: string) => void }) {
  if (clubs.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className={label}>
        Postar no clube
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`min-h-11 px-2.5 font-body text-sm font-semibold ${field}`}
      >
        {clubs.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function Feedback({ error, done }: { error: string; done: string }) {
  return (
    <>
      {error && <Notice tone="error">{error}</Notice>}
      {!error && done && <Notice tone="ok">{done}</Notice>}
    </>
  );
}

/** Aviso para quem não está em nenhum fã clube (não dá para postar). */
export function NoClubToPost() {
  const { base } = useArtist();
  return (
    <EmptyState
      title="Entre num fã clube para postar"
      text="Os posts da galera ficam no mural do clube em que você está."
      action={
        <Link
          href={`${base}/clubes`}
          className="flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-4 font-label text-xs font-bold text-ink no-underline"
        >
          Ver fã clubes
        </Link>
      }
    />
  );
}

/** Postar texto no feed da galera. `compact` usa um campo de uma linha (Início do desktop). */
export function GaleraComposer({
  id = "galera-draft",
  clubs,
  compact = false,
  onPosted,
}: {
  id?: string;
  clubs: ClubRef[];
  compact?: boolean;
  onPosted?: (post: Post, simulated: boolean) => void;
}) {
  const c = useComposer(clubs, onPosted);
  const [draft, setDraft] = useState("");
  if (clubs.length === 0) return <NoClubToPost />;

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    c.send("galera", text, "", () => setDraft(""));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ClubSelect id={`${id}-club`} clubs={clubs} value={c.club} onChange={c.setClub} />
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={id} className={label}>
          Postar no feed da galera{clubs.length === 1 ? ` · ${c.clubName}` : ""}
        </label>
        {compact ? (
          <div className="flex gap-2">
            <input
              id={id}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="O que tá rolando no fandom?"
              className={`min-h-11 min-w-0 flex-1 px-3 font-body text-[15px] ${field}`}
            />
            <button type="submit" disabled={c.posting} aria-busy={c.posting} className={`${primary} px-5 text-[13px]`}>
              {c.posting ? "Postando…" : "Postar"}
            </button>
          </div>
        ) : (
          <>
            <textarea
              id={id}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="O que tá rolando no fandom?"
              className={`resize-none p-2.5 font-body text-[15px] leading-snug ${field}`}
            />
            <div className="flex justify-end">
              <button type="submit" disabled={c.posting} aria-busy={c.posting} className={`${primary} px-5 text-[13px]`}>
                {c.posting ? "Postando…" : "Postar"}
              </button>
            </div>
          </>
        )}
      </form>
      <Feedback error={c.error} done={c.done} />
    </div>
  );
}

/** Trazer um post do Instagram do artista para o feed. */
export function InstagramComposer({
  id = "instagram-link",
  clubs,
  onPosted,
}: {
  id?: string;
  clubs: ClubRef[];
  onPosted?: (post: Post, simulated: boolean) => void;
}) {
  const c = useComposer(clubs, onPosted);
  const [link, setLink] = useState("");
  if (clubs.length === 0) return <NoClubToPost />;

  const submit = () => {
    const url = link.trim();
    if (!url) return;
    c.send("instagram", "Olha esse post novo dele!", url, () => setLink(""));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <ClubSelect id={`${id}-club`} clubs={clubs} value={c.club} onChange={c.setClub} />
      <form
        className={box}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor={id} className={label}>
          Trazer um post do Instagram do artista
        </label>
        <div className="flex gap-2">
          <input
            id={id}
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Cole o link do post"
            className={`min-h-11 min-w-0 flex-1 px-2.5 font-body text-sm ${field}`}
          />
          <button type="submit" disabled={c.posting} aria-busy={c.posting} className={`${primary} px-3.5 text-xs`}>
            {c.posting ? "Trazendo…" : "Trazer"}
          </button>
        </div>
      </form>
      <Feedback error={c.error} done={c.done} />
    </div>
  );
}
