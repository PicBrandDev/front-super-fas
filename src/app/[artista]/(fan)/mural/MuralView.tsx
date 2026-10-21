"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { PageHeader } from "@/components/fan/PageHeader";
import { PostCard } from "@/components/fan/PostCard";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import type { Post, PostKind } from "@/lib/types";
import { GaleraComposer, InstagramComposer, type ClubRef } from "./Composer";

const tabs: { id: PostKind; label: string }[] = [
  { id: "drop", label: "Drop News" },
  { id: "galera", label: "Galera" },
  { id: "instagram", label: "Instagram" },
];

const emptyByTab: Record<PostKind, { title: string; text: string }> = {
  drop: { title: "Nenhum Drop News ainda", text: "Quando o artista ou a equipe publicarem uma novidade, ela aparece aqui." },
  galera: { title: "A galera ainda não postou", text: "Seja a primeira pessoa a contar o que tá rolando no fandom." },
  instagram: { title: "Nenhum post do Instagram ainda", text: "Cole o link de um post do artista para trazê-lo para o mural." },
};

export function MuralView({ artistName, posts, clubs }: { artistName: string; posts: Post[]; clubs: ClubRef[] }) {
  const [tab, setTab] = useState<PostKind>("drop");
  const [extra, setExtra] = useState<Post[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const list = [...extra.filter((p) => p.kind === tab), ...posts.filter((p) => p.kind === tab)];

  /** Sem API o post fica só nesta tela; com API a página recarrega com o post de verdade. */
  const onPosted = (post: Post, simulated: boolean) => {
    if (simulated) setExtra((cur) => [post, ...cur]);
  };

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
      <PageHeader eyebrow={artistName} title="Mural" rings={false}>
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

        {tab === "galera" && <GaleraComposer id="mural-draft" clubs={clubs} onPosted={onPosted} />}
        {tab === "instagram" && <InstagramComposer id="mural-ig" clubs={clubs} onPosted={onPosted} />}

        <div className="flex flex-col gap-3.5">
          {list.length === 0 && <EmptyState title={emptyByTab[tab].title} text={emptyByTab[tab].text} />}
          {list.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      </div>
    </>
  );
}
