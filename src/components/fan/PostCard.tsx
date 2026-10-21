"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import type { Post } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import { PhotoPlaceholder } from "./decor";

const avatarTones = [
  "bg-accent-2 text-ink",
  "bg-ink text-paper",
];

/** Post do mural com curtir / comentar / repostar. */
export function PostCard({
  post,
  index = 0,
  showKindTag = false,
  showClub = true,
}: {
  post: Post;
  index?: number;
  showKindTag?: boolean;
  showClub?: boolean; // mostra de qual fã clube é o post
}) {
  const { name: artistName } = useArtist();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const official = !!post.author.official;
  const avatar = official ? "bg-accent text-accent-fg" : avatarTones[index % 2];
  const tag = post.kind === "drop" ? "Drop" : post.kind === "galera" ? "Galera" : "Instagram";

  return (
    <article className="overflow-hidden rounded-[14px] border-2 border-ink bg-cream">
      <div className="flex items-center gap-2.5 px-3.5 pt-3 lg:px-[18px] lg:pt-4">
        <span
          className={`flex size-10 flex-none items-center justify-center rounded-full border-2 border-ink font-display text-base ${avatar}`}
        >
          {post.author.initial}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <strong className="font-body text-[15px] font-extrabold">{post.author.name}</strong>
          <span className="font-label text-[11px] text-ink-soft">
            {post.author.handle} · {post.timeLabel}
            {post.club && showClub && <> · {post.club.name}</>}
          </span>
        </div>
        {(official || showKindTag) && (
          <span
            className={`rounded-md px-2 py-0.5 font-label text-[11px] font-bold uppercase ${
              official ? "bg-accent text-accent-fg" : "bg-paper-2 text-ink"
            }`}
          >
            {tag}
          </span>
        )}
      </div>

      <p className="mx-3.5 mt-2.5 text-[15px] leading-relaxed lg:mx-[18px] lg:text-base">{post.text}</p>

      {post.quote && (
        <div className="mx-3.5 mt-2.5 flex flex-col gap-1 rounded-[10px] border-[1.5px] border-dashed border-ink px-3 py-2.5">
          <span className="font-label text-[11px] font-bold text-ink-soft">Repost · Drop News de {artistName}</span>
          <span className="text-sm font-semibold leading-snug">{post.quote}</span>
        </div>
      )}

      {post.hasImage && (
        <div className="mx-3.5 mt-3 overflow-hidden rounded-[10px] lg:mx-[18px]">
          <PhotoPlaceholder className="h-[180px] lg:h-[260px]" />
        </div>
      )}

      {post.kind === "instagram" && (
        <div className="mx-3.5 mt-3 overflow-hidden rounded-[10px] border-[1.5px] border-ink">
          <PhotoPlaceholder label="[Imagem do post original]" tone="warm" align="center" className="h-[200px]" />
          <div className="flex items-center gap-2 bg-paper-2 px-3 py-2.5">
            <Icon name="link" size={16} strokeWidth={2.2} />
            <span className="font-label text-xs">Post do artista via Instagram</span>
          </div>
        </div>
      )}

      <div className="flex gap-0.5 p-1.5">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          aria-pressed={liked}
          aria-label="Curtir"
          className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 font-label text-xs font-bold ${
            liked ? "text-accent" : "text-ink"
          }`}
        >
          <Icon name="heart" size={20} filled={liked} />
          <span>{(post.likes + (liked ? 1 : 0)).toLocaleString("pt-BR")}</span>
        </button>
        {/* Comentários ainda não têm tela nem API: mostra só a contagem, sem botão. */}
        <span className="flex min-h-11 items-center gap-1.5 px-2.5 font-label text-xs font-bold text-ink-soft">
          <Icon name="comment" size={20} />
          <span>{post.comments.toLocaleString("pt-BR")}</span>
          <span className="sr-only">comentários</span>
        </span>
        <button
          type="button"
          onClick={() => setReposted((v) => !v)}
          aria-pressed={reposted}
          aria-label="Repostar"
          className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] px-2.5 font-label text-xs font-bold ${
            reposted ? "text-accent" : "text-ink"
          }`}
        >
          <Icon name="repost" size={20} />
          <span>{(post.reposts + (reposted ? 1 : 0)).toLocaleString("pt-BR")}</span>
        </button>
      </div>
    </article>
  );
}
