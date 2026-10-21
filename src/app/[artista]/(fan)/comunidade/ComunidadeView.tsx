"use client";

import { useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { PostCard } from "@/components/fan/PostCard";
import { Tabs } from "@/components/fan/Tabs";
import type { Post } from "@/lib/types";
import { Compose, type ClubRef } from "./Composer";

type Tab = "all" | "oficial" | "club";

const tabs: { id: Tab; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "oficial", label: "Oficial" },
  { id: "club", label: "Meu fã clube" },
];

const isOfficial = (p: Post) => !!p.author.official || p.kind === "drop";

/** Tela "Comunidade" do protótipo: masthead cinza, três abas, campo de escrever e o feed. */
export function ComunidadeView({ posts, clubs, demo }: { posts: Post[]; clubs: ClubRef[]; demo: boolean }) {
  const { viewer } = useArtist();
  const [tab, setTab] = useState<Tab>("all");
  const [extra, setExtra] = useState<Post[]>([]);
  const [seen, setSeen] = useState(posts);
  // Quando a página recarrega com o post de verdade, os simulados saem de cena.
  if (seen !== posts) {
    setSeen(posts);
    setExtra([]);
  }

  const mine = new Set(viewer.clubs ?? []);
  const all = [...extra, ...posts];
  const list = all.filter((p) =>
    tab === "all" ? true : tab === "oficial" ? isOfficial(p) : !!p.club && mine.has(p.club.slug),
  );
  const fresh = new Set(extra.map((p) => p.id));

  const onPosted = (post: Post) => {
    setExtra((cur) => [post, ...cur]);
    if (tab === "oficial") setTab("all");
  };

  return (
    <>
      <Masthead word="Comunidade" tone="poster-grey" steps={3} index={tabs.findIndex((t) => t.id === tab)} />
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={setTab}
        label="Seções da comunidade"
        slot={demo ? <span className="tag tag-demo">Exemplo</span> : undefined}
      />
      <div className="px-4">
        <Compose clubs={clubs} onPosted={onPosted} />
        <div>
          {list.length === 0 ? (
            <p className="mono py-8">Nada por aqui ainda. Seja o primeiro do fã clube a postar.</p>
          ) : (
            list.map((p, i) => <PostCard key={p.id} post={p} index={i} fresh={fresh.has(p.id)} />)
          )}
        </div>
      </div>
    </>
  );
}
