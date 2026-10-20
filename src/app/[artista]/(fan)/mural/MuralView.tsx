"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type KeyboardEvent } from "react";
import { fanPost } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { PageHeader } from "@/components/fan/PageHeader";
import { PostCard } from "@/components/fan/PostCard";
import { Icon } from "@/components/icons";
import type { Post, PostKind } from "@/lib/types";

const tabs: { id: PostKind; label: string }[] = [
  { id: "drop", label: "Drop News" },
  { id: "galera", label: "Galera" },
  { id: "instagram", label: "Instagram" },
];

const composerBox = "shadow-hard flex flex-col gap-2 rounded-[14px] border-2 border-ink bg-cream p-3";
const composerLabel = "font-label text-[11px] font-bold uppercase tracking-[0.08em] text-ink-soft";
const fieldBase = "rounded-[10px] border-[1.5px] border-ink-soft bg-paper text-ink placeholder:text-ink-soft";
const primaryPill =
  "flex min-h-11 cursor-pointer items-center rounded-full border-2 border-ink bg-accent font-label font-bold text-accent-fg";

export function MuralView({ artistName, posts }: { artistName: string; posts: Post[] }) {
  const { viewer, slug } = useArtist();
  const router = useRouter();
  const [postError, setPostError] = useState("");
  const [posting, start] = useTransition();
  const [tab, setTab] = useState<PostKind>("drop");
  const [draft, setDraft] = useState("");
  const [igLink, setIgLink] = useState("");
  const [extra, setExtra] = useState<Post[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const list = [...extra.filter((p) => p.kind === tab), ...posts.filter((p) => p.kind === tab)];

  function newPost(kind: PostKind, text: string): Post {
    return {
      id: `n-${kind}-${Date.now()}`,
      kind,
      author: { name: "Você", handle: viewer.handle, initial: viewer.initial },
      timeLabel: "agora",
      text,
      likes: 0,
      comments: 0,
      reposts: 0,
    };
  }

  /** Publica na API; sem API (modo exemplo, status 0) mostra só na tela. */
  function send(kind: "galera" | "instagram", text: string, url = "", clear: () => void) {
    if (posting) return;
    start(async () => {
      const res = await fanPost(slug, kind, text, url);
      if (!res.ok && res.status !== 0) {
        setPostError(res.error);
        return;
      }
      setPostError("");
      clear();
      if (res.ok) router.refresh();
      else setExtra((cur) => [newPost(kind, text), ...cur]);
    });
  }

  function publish() {
    const text = draft.trim();
    if (!text) return;
    send("galera", text, "", () => setDraft(""));
  }

  function bringInstagram() {
    const url = igLink.trim();
    if (!url) return;
    send("instagram", "Olha esse post novo dele!", url, () => setIgLink(""));
  }

  function onTabKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setTab(tabs[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      <PageHeader
        eyebrow={artistName}
        title="Mural"
        rings={false}
        action={
          <button
            type="button"
            aria-label="Buscar no mural"
            className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border-2 border-paper bg-transparent text-paper"
          >
            <Icon name="search" size={20} strokeWidth={2.2} />
          </button>
        }
      >
        <div role="tablist" aria-label="Seções do mural" className="-mb-4 flex gap-1.5 lg:max-w-[520px]">
          {tabs.map((t, i) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`mural-tab-${t.id}`}
                aria-selected={active}
                aria-controls="mural-panel"
                tabIndex={active ? 0 : -1}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={`min-h-11 flex-1 cursor-pointer rounded-t-xl border-2 border-b-0 border-paper px-1 py-2 font-label text-xs font-bold ${
                  active ? "bg-paper text-ink" : "bg-transparent text-paper"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div
        id="mural-panel"
        role="tabpanel"
        aria-labelledby={`mural-tab-${tab}`}
        className="mx-auto flex w-full max-w-[760px] flex-col gap-3.5 px-4 pb-8 pt-4 lg:px-8 lg:pt-6"
      >
        {tab === "drop" && (
          <p className="m-0 flex items-center gap-2 font-label text-[13px] leading-snug text-ink-soft">
            <Icon name="star" size={18} />
            Notícias publicadas pelo artista e pela equipe.
          </p>
        )}

        {tab === "galera" && (
          <form
            className={composerBox}
            onSubmit={(e) => {
              e.preventDefault();
              publish();
            }}
          >
            <label htmlFor="mural-draft" className={composerLabel}>
              Postar no feed da galera
            </label>
            <textarea
              id="mural-draft"
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="O que tá rolando no fandom?"
              className={`resize-none p-2.5 font-body text-[15px] leading-snug ${fieldBase}`}
            />
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Anexar foto"
                className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] bg-transparent text-ink"
              >
                <Icon name="image" size={22} />
              </button>
              <button type="submit" disabled={posting} aria-busy={posting} className={`${primaryPill} px-5 text-[13px]`}>
                {posting ? "Postando…" : "Postar"}
              </button>
            </div>
          </form>
        )}

        {tab === "instagram" && (
          <form
            className={composerBox}
            onSubmit={(e) => {
              e.preventDefault();
              bringInstagram();
            }}
          >
            <label htmlFor="mural-ig" className={composerLabel}>
              Trazer um post do Instagram do artista
            </label>
            <div className="flex gap-2">
              <input
                id="mural-ig"
                type="url"
                value={igLink}
                onChange={(e) => setIgLink(e.target.value)}
                placeholder="Cole o link do post"
                className={`min-h-11 min-w-0 flex-1 px-2.5 font-body text-sm ${fieldBase}`}
              />
              <button type="submit" disabled={posting} aria-busy={posting} className={`${primaryPill} px-3.5 text-xs`}>
                Trazer
              </button>
            </div>
          </form>
        )}

        {postError && (
          <p role="alert" className="m-0 rounded-[10px] border-2 border-ink bg-cream px-3 py-2 font-label text-xs font-bold text-accent">
            {postError}
          </p>
        )}

        <div className="flex flex-col gap-3.5">
          {list.length === 0 && (
            <p className="m-0 font-label text-[13px] text-ink-soft">Nada por aqui ainda.</p>
          )}
          {list.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
