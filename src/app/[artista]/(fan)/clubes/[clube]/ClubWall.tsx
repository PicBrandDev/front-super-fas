"use client";

import Link from "next/link";
import { useState } from "react";
import { GaleraComposer } from "@/app/[artista]/(fan)/mural/Composer";
import { useArtist } from "@/components/fan/ArtistContext";
import { PostCard } from "@/components/fan/PostCard";
import { EmptyState } from "@/components/fan/states";
import type { Post } from "@/lib/types";

/** Mural da galera de um fã clube: posts e campo para postar (só quem entrou no clube). */
export function ClubWall({ club, joined, posts }: { club: { slug: string; name: string }; joined: boolean; posts: Post[] }) {
  const { base } = useArtist();
  const [extra, setExtra] = useState<Post[]>([]);
  const list = [...extra, ...posts];

  return (
    <section aria-labelledby="mural-clube" className="flex flex-col gap-3">
      <h2 id="mural-clube" className="m-0 font-body text-lg font-extrabold">
        Mural da galera
      </h2>

      {joined ? (
        <GaleraComposer
          id="clube-draft"
          clubs={[club]}
          onPosted={(post, simulated) => {
            if (simulated) setExtra((cur) => [post, ...cur]);
          }}
        />
      ) : (
        <p className="m-0 rounded-[14px] border-2 border-dashed border-ink bg-cream px-3.5 py-3 font-label text-[13px] text-ink">
          Entre no clube para postar no mural dele.
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        {list.length === 0 && (
          <EmptyState
            title="Ninguém postou ainda"
            text={joined ? "Seja a primeira pessoa a postar no mural do clube." : "Entre no clube e seja a primeira pessoa a postar."}
          />
        )}
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
