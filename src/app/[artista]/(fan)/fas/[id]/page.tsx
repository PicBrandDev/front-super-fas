import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChatAvatar } from "@/components/chat/ChatAvatar";
import { StartChatButton } from "@/components/chat/StartChatButton";
import { PostCard } from "@/components/fan/PostCard";
import { PageHead } from "@/components/fan/resale/parts";
import { EmptyState } from "@/components/fan/states";
import { getArtist, getPublicFan } from "@/lib/api";
import { formatCount } from "@/lib/format";

export const metadata: Metadata = { title: "Perfil do fã" };

/** Perfil público de um fã: quem é, de qual fã clube, pontos no ranking e os posts. CTA para conversar. */
export default async function FaPage({ params }: { params: Promise<{ artista: string; id: string }> }) {
  const { artista, id: raw } = await params;
  const id = decodeURIComponent(raw);
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(id)) notFound();
  const [artist, fan] = await Promise.all([getArtist(artista), getPublicFan(artista, id)]);
  if (!artist || !fan) notFound();
  const base = `/${artista}`;
  const firstName = fan.name.split(" ")[0] || fan.name;

  return (
    <div className="px-4 pb-8 pt-4">
      <PageHead back={`${base}/comunidade`} backLabel="Comunidade" title={fan.name} />

      <section aria-label="Sobre o fã" className="mt-4 flex items-center gap-4">
        <ChatAvatar name={fan.name} avatar={fan.avatar} size={72} />
        <div className="flex min-w-0 flex-col gap-1.5">
          {fan.handle && <span className="truncate font-mono text-[13px] leading-4 text-fg-muted">{fan.handle}</span>}
          {fan.club && (
            <Link href={`${base}/clubes/${fan.club.slug}`} className="tag inline-flex w-fit items-center no-underline">
              {fan.club.name}
            </Link>
          )}
        </div>
      </section>

      {(fan.points != null || fan.rank != null) && (
        <dl className="m-0 mt-5 grid grid-cols-2 border-y border-line">
          {fan.points != null && (
            <div className="py-3 pr-3">
              <dt className="mono">Pontos</dt>
              <dd className="num m-0 mt-1 font-display text-[28px] font-black leading-8">{formatCount(fan.points)}</dd>
            </div>
          )}
          {fan.rank != null && (
            <div className={`py-3 ${fan.points != null ? "border-l border-line pl-3" : ""}`}>
              <dt className="mono">Ranking</dt>
              <dd className="num m-0 mt-1 font-display text-[28px] font-black leading-8">#{fan.rank}</dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-5">
        {fan.isMe ? (
          <Link href={`${base}/perfil`} className="btn btn-outline btn-block">
            Este é você. Ver meu perfil
          </Link>
        ) : (
          <StartChatButton userId={fan.id} name={fan.name} />
        )}
      </div>

      <section aria-labelledby="fa-posts" className="mt-8">
        <h2 id="fa-posts" className="poster m-0 text-lg leading-6">
          Posts de {firstName}
        </h2>
        {fan.posts.length === 0 ? (
          <EmptyState title="Nenhum post ainda." />
        ) : (
          <div>
            {fan.posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} showClub={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
