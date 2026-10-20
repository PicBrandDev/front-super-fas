"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { fanPost } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { PostCard } from "@/components/fan/PostCard";
import type { Post } from "@/lib/types";

/** Mural da galera de um fã clube: posts e campo para postar (só quem entrou no clube). */
export function ClubWall({ club, joined, posts }: { club: { slug: string; name: string }; joined: boolean; posts: Post[] }) {
  const { slug, base, viewer } = useArtist();
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [extra, setExtra] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const publish = () => {
    const text = draft.trim();
    if (!text || pending) return;
    start(async () => {
      const res = await fanPost(slug, club.slug, "galera", text);
      if (!res.ok && res.status !== 0) {
        setError(res.error);
        return;
      }
      setError("");
      setDraft("");
      if (res.ok) router.refresh();
      else
        setExtra((cur) => [
          { id: `n-${Date.now()}`, kind: "galera", author: { name: "Você", handle: viewer.handle, initial: viewer.initial }, timeLabel: "agora", text, likes: 0, comments: 0, reposts: 0, club },
          ...cur,
        ]);
    });
  };

  const list = [...extra, ...posts];

  return (
    <section aria-labelledby="mural-clube" className="flex flex-col gap-3">
      <h2 id="mural-clube" className="m-0 font-body text-lg font-extrabold">
        Mural da galera
      </h2>

      {joined ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            publish();
          }}
          className="shadow-hard flex flex-col gap-2 rounded-[14px] border-2 border-ink bg-cream p-3"
        >
          <label htmlFor="clube-draft" className="font-label text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            Postar no {club.name}
          </label>
          <textarea
            id="clube-draft"
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="O que tá rolando no clube?"
            className="resize-none rounded-[10px] border-[1.5px] border-ink-soft bg-paper p-2.5 font-body text-[15px] leading-snug text-ink placeholder:text-ink-soft"
          />
          {error && (
            <p role="alert" className="m-0 font-label text-xs font-bold text-accent">
              {error}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              aria-busy={pending}
              className="flex min-h-11 cursor-pointer items-center rounded-full border-2 border-ink bg-accent px-5 font-label text-[13px] font-bold text-accent-fg"
            >
              {pending ? "Postando…" : "Postar"}
            </button>
          </div>
        </form>
      ) : (
        <p className="m-0 rounded-[14px] border-2 border-dashed border-ink bg-cream px-3.5 py-3 font-label text-[13px] text-ink">
          Entre no clube para postar no mural dele.
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {list.length === 0 && <p className="m-0 font-label text-[13px] text-ink-soft">Ninguém postou ainda. Seja o primeiro!</p>}
        {list.map((p, i) => (
          <PostCard key={p.id} post={p} index={i} showClub={false} />
        ))}
      </div>

      <Link href={`${base}/mural`} className="flex min-h-11 items-center font-label text-xs font-bold text-ink">
        Ver o mural de todos os clubes →
      </Link>
    </section>
  );
}
