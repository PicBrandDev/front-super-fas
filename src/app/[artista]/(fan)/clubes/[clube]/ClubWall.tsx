"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { Compose } from "@/app/[artista]/(fan)/comunidade/Composer";
import { useArtist } from "@/components/fan/ArtistContext";
import { FeedAd } from "@/components/fan/FeedAd";
import { PostCard } from "@/components/fan/PostCard";
import { Icon } from "@/components/icons";
import type { FeedAdItem, Post } from "@/lib/types";

/** Mural de um fã clube: campo de escrever (só quem entrou) e os posts do clube. */
export function ClubWall({
  club,
  joined,
  posts,
  feedAds = [],
}: {
  club: { slug: string; name: string };
  joined: boolean;
  posts: Post[];
  feedAds?: FeedAdItem[]; // posts patrocinados do clube (depois do 4º, 8º e 12º post)
}) {
  const { base } = useArtist();
  const [extra, setExtra] = useState<Post[]>([]);
  const [seen, setSeen] = useState(posts);
  if (seen !== posts) {
    setSeen(posts);
    setExtra([]);
  }
  const list = [...extra, ...posts];
  const fresh = new Set(extra.map((p) => p.id));

  return (
    <section aria-labelledby="mural-clube" className="pt-6">
      <h2 id="mural-clube" className="poster m-0 mb-3 text-xl leading-[22px] tracking-[-0.01em]">
        Mural do clube
      </h2>

      {joined ? (
        <Compose clubs={[club]} onPosted={(post) => setExtra((cur) => [post, ...cur])} />
      ) : (
        <p className="mono m-0 border-b border-line py-4">Entre no clube para postar no mural dele.</p>
      )}

      <div>
        {list.length === 0 ? (
          <p className="mono py-8">
            {joined ? "Ninguém postou ainda. Seja o primeiro do fã clube a postar." : "Ninguém postou ainda. Entre no clube e seja o primeiro."}
          </p>
        ) : (
          list.map((p, i) => (
            <Fragment key={p.id}>
              <PostCard post={p} index={i} showClub={false} fresh={fresh.has(p.id)} />
              {feedAds.filter((a) => a.position === i + 1).map((a) => (
                <FeedAd key={`ad-${a.position}`} ad={a} className="!px-0" />
              ))}
            </Fragment>
          ))
        )}
      </div>

      <Link href={`${base}/comunidade`} className="go mt-4 min-h-11">
        Ver a comunidade
        <Icon name="arrow" size={16} />
      </Link>
    </section>
  );
}
