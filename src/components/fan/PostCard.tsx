"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { trackView } from "@/app/actions/views";
import { Icon } from "@/components/icons";
import { postImage } from "@/lib/media";
import { formatShort, initialsOf } from "@/lib/format";
import type { Post, PostKind } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import { Mark } from "./Mark";
import { ShareInstagram } from "./ShareInstagram";
import { useToast } from "./Toast";

const kindLabel: Record<PostKind, string> = { drop: "Mural", galera: "Comunidade", instagram: "Instagram" };

/**
 * Post da comunidade (padrão `.post` do protótipo): entrada editorial sem caixa,
 * fio 1px embaixo, avatar com a marca (oficial) ou iniciais em chrome, corpo
 * recuado 44px, ações em mono e respostas que abrem ao tocar em comentar.
 * Curtir, repostar e responder são simulados no cliente.
 */
export function PostCard({
  post,
  index = 0,
  showKindTag = false,
  showClub = true,
  fresh = false,
}: {
  post: Post;
  index?: number;
  showKindTag?: boolean;
  showClub?: boolean; // mostra de qual fã clube é o post
  fresh?: boolean; // acabou de ser publicado (entra com a animação `.new`)
}) {
  const { slug, base } = useArtist();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const official = !!post.author.official || post.kind === "drop";
  const image = postImage(slug, post, index);
  const replyId = `reply-${post.id}`;

  // Uma visualização por post e sessão, quando mais da metade do card aparece.
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const key = `viu:${post.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {}
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        try {
          sessionStorage.setItem(key, "1");
        } catch {}
        void trackView(slug, post.id);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug, post.id]);

  const sendReply = (e: FormEvent) => {
    e.preventDefault();
    const v = draft.trim();
    if (!v) return;
    setReplies((cur) => [...cur, v]);
    setDraft("");
  };

  const repost = () => {
    const on = !reposted;
    setReposted(on);
    if (on) toast.show("Repostado no seu perfil");
  };

  return (
    <article ref={ref} className={`border-b border-line py-4 ${fresh ? "new" : ""}`}>
      {/* Flag do fã clube de onde veio o post (sem fã clube = oficial do artista). */}
      {showClub &&
        (post.club ? (
          <Link href={`${base}/clubes/${post.club.slug}`} className="tag mb-3 inline-flex items-center gap-1.5 no-underline" aria-label={`Fã clube ${post.club.name}`}>
            {post.club.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
              <img src={post.club.avatar} alt="" width={16} height={16} className="size-4 rounded-full object-cover" />
            ) : (
              <span aria-hidden="true" className="flex size-4 items-center justify-center rounded-full bg-raised text-[9px] font-black">
                {initialsOf(post.club.name).charAt(0)}
              </span>
            )}
            {post.club.name}
          </Link>
        ) : (
          <span className="tag tag-key mb-3 inline-flex items-center gap-1.5">
            <Mark size={12} />
            Oficial
          </span>
        ))}
      <div className="flex items-start gap-3">
        {official ? (
          <div className="avatar" aria-hidden="true">
            <Mark size={18} />
          </div>
        ) : (
          <div className="avatar text-chrome" aria-hidden="true">
            {initialsOf(post.author.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="text-[15px] leading-5">{post.author.name}</strong>
            {post.author.badge && (
              <span className="tag tag-key">
                <Icon name="star" size={11} />
                {post.author.badge}
              </span>
            )}
            {official ? (
              <span className="mono verified">
                <Icon name="check" size={12} />
                Oficial
              </span>
            ) : (
              <span className="mono">{post.author.handle}</span>
            )}
            {(showKindTag || post.kind === "instagram") && (
              <span className="tag ml-auto">{post.kind === "instagram" ? "Instagram" : kindLabel[post.kind]}</span>
            )}
          </div>
          <div className="mono">
            {kindLabel[post.kind]} · {post.timeLabel}
          </div>
        </div>
      </div>

      <div className="ml-11">
        <p className="mb-2 mt-3">{post.text}</p>
        {post.quote && (
          <blockquote className="mx-0 mb-0 mt-2 grid gap-1 border-l border-line-strong py-1 pl-3 text-[15px] leading-[22px]">
            <span className="mono">Repost · Mural</span>
            <span>{post.quote}</span>
          </blockquote>
        )}
        {image && (
          <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-hair">
            <img src={image.src} alt={image.alt} loading="lazy" className="block h-full w-full object-cover" />
          </div>
        )}
        {post.kind === "instagram" && post.url && (
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="go mt-2 min-h-11">
            Ver no Instagram
            <Icon name="external" size={14} />
          </a>
        )}
      </div>

      <div className="ml-11 flex items-center">
        <button type="button" className="act like" aria-pressed={liked} aria-label="Curtir" onClick={() => setLiked((v) => !v)}>
          <Icon name="heart" size={20} />
          <span className="num">{formatShort(post.likes + (liked ? 1 : 0))}</span>
        </button>
        <button
          type="button"
          className="act"
          aria-expanded={open}
          aria-controls={replyId}
          aria-label="Comentários"
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name="comment" size={20} />
          <span className="num">{formatShort(post.comments + replies.length)}</span>
        </button>
        {official && <ShareInstagram post={post} />}
        <button type="button" className="act rp" aria-pressed={reposted} aria-label="Repostar" onClick={repost}>
          <Icon name="repost" size={20} />
          <span className="num">{formatShort(post.reposts + (reposted ? 1 : 0))}</span>
        </button>
      </div>

      <div id={replyId} hidden={!open} className="ml-11 mt-2 grid gap-2">
        {open && (
          <>
            <div className="text-sm leading-5 text-fg">
              <b>Lu M.</b> eu vou, bora junto
            </div>
            {replies.map((r, i) => (
              <div key={i} className="new text-sm leading-5 text-fg">
                <b>Você</b> {r}
              </div>
            ))}
            <form className="flex gap-2" onSubmit={sendReply}>
              <label htmlFor={`${replyId}-input`} className="sr-only">
                Responder
              </label>
              <input
                id={`${replyId}-input`}
                className="field min-h-11 px-2.5 py-2 text-[15px]"
                placeholder="Responder"
                autoComplete="off"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-outline btn-sm">
                Enviar
              </button>
            </form>
          </>
        )}
      </div>
    </article>
  );
}
