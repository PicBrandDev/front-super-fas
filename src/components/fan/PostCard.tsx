"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { trackView } from "@/app/actions/views";
import { WithSeal } from "@/components/VerifiedSeal";
import { Icon } from "@/components/icons";
import { postImage } from "@/lib/media";
import { formatShort, initialsOf } from "@/lib/format";
import type { Post, PostKind } from "@/lib/types";
import { useArtist } from "./ArtistContext";
import { Mark } from "./Mark";
import { PersonAvatar } from "./PersonAvatar";
import { ShareInstagram } from "./ShareInstagram";
import { thumb } from "@/lib/thumb";

const kindLabel: Record<PostKind, string> = { drop: "Mural", galera: "Comunidade", instagram: "Instagram" };

/**
 * Post da comunidade (padrão `.post` do protótipo): entrada editorial sem caixa,
 * fio 1px embaixo, avatar com a marca (oficial) ou iniciais em chrome, corpo
 * recuado 44px, ações em mono e respostas que abrem ao tocar em comentar.
 * Curtir e responder são simulados no cliente.
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
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [draft, setDraft] = useState("");

  const official = !!post.author.official || post.kind === "drop";
  const image = postImage(slug, post, index);
  const replyId = `reply-${post.id}`;
  // Perfil público do fã autor (abre o chat privado); post oficial não tem perfil.
  const profileHref = !official && post.author.id ? `${base}/fas/${encodeURIComponent(post.author.id)}` : null;

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

  return (
    <article ref={ref} className={`border-b border-line py-4 ${fresh ? "new" : ""}`}>
      <div className="flex items-start gap-3">
        {official ? (
          <div className="avatar" aria-hidden="true">
            <Mark size={18} />
          </div>
        ) : (
          (() => {
            const face = <PersonAvatar src={post.author.avatar} name={post.author.name} className="text-chrome" verified={post.author.verified} />;
            return profileHref ? (
              <Link href={profileHref} tabIndex={-1} aria-hidden="true" className="flex-none no-underline">
                {face}
              </Link>
            ) : (
              <div className="flex-none" aria-hidden="true">
                {face}
              </div>
            );
          })()
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {profileHref ? (
              <Link href={profileHref} className="text-[15px] font-bold leading-5 text-fg no-underline hover:underline" aria-label={`Ver perfil de ${post.author.name}`}>
                {post.author.name}
              </Link>
            ) : (
              <strong className="text-[15px] leading-5">{post.author.name}</strong>
            )}
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
          <div className="relative mt-3 aspect-[4/5] overflow-hidden rounded-hair bg-raised">
            {/* As duas primeiras fotos carregam já; as demais, perto de aparecer na tela. */}
            <img
              src={thumb(image.src, 360)}
              alt={image.alt}
              loading={index < 2 ? "eager" : "lazy"}
              fetchPriority={index < 2 ? "high" : "auto"}
              decoding="async"
              className="block h-full w-full object-cover"
            />
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

        {/* De qual fã clube é o post: foto redonda e nome no canto inferior direito, sem caixa nem borda. */}
        {showClub && post.club && (
          <Link
            href={`${base}/clubes/${post.club.slug}`}
            className="ml-auto flex min-w-0 max-w-[52%] items-center gap-2 py-1 pl-3 text-fg no-underline hover:underline"
            aria-label={`Fã clube ${post.club.name}`}
          >
            <span className="truncate text-[13px] font-semibold leading-4">{post.club.name}</span>
            <WithSeal size={28} verified={post.club.isMaster} label="Fã clube oficial">
              {post.club.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
                <img src={thumb(post.club.avatar, 56)} alt="" width={28} height={28} className="size-7 flex-none rounded-full border border-line object-cover" />
              ) : (
                <span aria-hidden="true" className="flex size-7 flex-none items-center justify-center rounded-full border border-line bg-raised text-xs font-black">
                  {initialsOf(post.club.name).charAt(0)}
                </span>
              )}
            </WithSeal>
          </Link>
        )}
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
