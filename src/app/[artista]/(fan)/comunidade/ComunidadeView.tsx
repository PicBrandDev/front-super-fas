"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { PostCard } from "@/components/fan/PostCard";
import { SponsoredPost } from "@/components/fan/SponsoredPost";
import { COMMUNITY_AD_EVERY, type InAppAd } from "@/lib/ads";
import { initialsOf } from "@/lib/format";
import { Tabs } from "@/components/fan/Tabs";
import type { Post, Ranking } from "@/lib/types";
import { AllClubsButton, type ClubListItem } from "./AllClubsSheet";
import { NewPostFab } from "./NewPostFab";
import { RankingView } from "./RankingView";

const PAGE = 12;

type Tab = "feed" | "ranking";
const tabs: { id: Tab; label: string }[] = [
  { id: "feed", label: "Feed" },
  { id: "ranking", label: "Ranking" },
];

export type FollowedClub = { slug: string; name: string; avatar: string | null; isMaster: boolean };

/**
 * Anúncio que entra depois do post de índice `i` (0-based) do feed já montado, ou null.
 * Conta pela posição na lista que aparece na tela (filtros e posts novos incluídos), então o
 * patrocinado é sempre o 8º, 16º, … item. Com paginação, basta concatenar as páginas na mesma
 * lista antes do map: o índice continua corrido e a conta não reinicia a cada página.
 */
function adAfter(i: number, ads: InAppAd[]): InAppAd | null {
  if (!ads.length) return null;
  if (i === 0) return ads[0]; // o primeiro anúncio (Spotify) entra logo embaixo do 1º post
  if ((i + 1) % COMMUNITY_AD_EVERY !== 0) return null;
  return ads[((i + 1) / COMMUNITY_AD_EVERY) % ads.length]; // depois, a cada COMMUNITY_AD_EVERY posts, em rodízio
}

/**
 * Tela "Comunidade": o feed só dos fã clubes que o fã segue. "Todos" junta o feed deles e cada botão
 * abre o feed de um fã clube. Os posts oficiais do artista aparecem para quem segue o fã clube master.
 * O botão "+" flutuante publica num dos fã clubes que o fã segue.
 */
export function ComunidadeView({
  posts,
  ads = [],
  clubAds = {},
  clubs,
  allClubs,
  ownerView = false,
  initialClub,
  ranking,
  initialTab,
  demo,
}: {
  posts: Post[];
  ads?: InAppAd[]; // campanhas do feed, em rodízio a cada COMMUNITY_AD_EVERY posts
  clubAds?: Record<string, InAppAd[]>; // as do feed de cada fã clube (filtro por fã clube)
  clubs: FollowedClub[]; // fã clubes que o fã segue
  allClubs: ClubListItem[]; // todos os fã clubes, para entrar em um
  ownerView?: boolean; // dono/equipe: tudo da tela é só do fã clube dele
  initialClub: string | null;
  ranking: Ranking | null;
  initialTab: Tab;
  demo: boolean;
}) {
  const { base } = useArtist();
  const [clube, setClube] = useState<string | null>(initialClub);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [extra, setExtra] = useState<Post[]>([]);
  // O feed abre com poucos posts (cada um traz foto) e o resto vem em "Ver mais": 100 de uma vez deixava a tela lenta.
  const [shown, setShown] = useState(PAGE);
  const [seen, setSeen] = useState(posts);
  // Quando a página recarrega com o post de verdade, os simulados saem de cena.
  if (seen !== posts) {
    setSeen(posts);
    setExtra([]);
  }

  const master = clubs.find((c) => c.isMaster)?.slug ?? null;
  const followed = new Set(clubs.map((c) => c.slug));
  // O post pertence a um fã clube que o fã segue (o oficial do artista pertence ao master).
  const clubOf = (p: Post) => p.club?.slug ?? (p.author.official || p.kind === "drop" ? master : null);
  const all = [...extra, ...posts].filter((p) => {
    const c = clubOf(p);
    return !!c && followed.has(c);
  });
  const list = clube ? all.filter((p) => clubOf(p) === clube) : all;
  const pool = clube && clubAds[clube]?.length ? clubAds[clube] : ads;
  const countOf = (slug: string) => all.filter((p) => clubOf(p) === slug).length;
  const current = clubs.find((c) => c.slug === clube) ?? null;
  const fresh = new Set(extra.map((p) => p.id));

  const onPosted = (post: Post) => setExtra((cur) => [post, ...cur]);

  return (
    <>
      <Masthead word="Comunidade" tone="poster-grey" steps={2} index={tab === "feed" ? 0 : 1} />
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Comunidade" />
      {demo && (
        <div className="px-4 pt-3">
          <span className="tag tag-demo">Exemplo</span>
        </div>
      )}
      <NewPostFab clubs={clubs.map((c) => ({ slug: c.slug, name: c.name, avatar: c.avatar }))} defaultClub={clube} onPosted={onPosted} />

      {ownerView && (
        <div className="px-4 pt-3">
          <AllClubsButton clubs={allClubs.filter((c) => !followed.has(c.slug))} label="Ver outros fã clubes" viewOnly />
        </div>
      )}

      {tab === "ranking" ? (
        <RankingView ranking={ranking} scope={ownerView ? clubs.map((c) => c.slug) : undefined} />
      ) : (
      <div className="px-4">
        {clubs.length === 0 ? (
          <div className="flex flex-col gap-3 py-8">
            <h2 className="m-0 font-display text-2xl font-black leading-7">Você ainda não segue nenhum fã clube</h2>
            <p className="m-0 text-fg-muted">Entre num fã clube para ver o feed dele aqui e postar na comunidade.</p>
            <AllClubsButton clubs={allClubs} variant="button" />
          </div>
        ) : (
          <>
            {ownerView && clubs.length === 1 && (
              <div className="flex items-center justify-between gap-3 border-b border-line py-3">
                <h2 className="m-0 font-display text-2xl font-black leading-7">{clubs[0].name}</h2>
              </div>
            )}

            {/* Feed de cada fã clube que o fã segue. */}
            <nav hidden={ownerView && clubs.length === 1} aria-label="Feed de cada fã clube que você segue" className="-mx-4 mb-2 flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
              <button type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={clube === null} onClick={() => setClube(null)}>
                Todos os que sigo
                <span className="num opacity-70">{all.length}</span>
              </button>
              {clubs.map((c) => (
                <button key={c.slug} type="button" className="btn btn-outline btn-sm chip flex-none" aria-pressed={clube === c.slug} onClick={() => setClube(c.slug)}>
                  {c.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
                    <img src={c.avatar} alt="" width={18} height={18} className="size-[18px] rounded-full object-cover" />
                  ) : (
                    <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full bg-raised text-[10px] font-black">
                      {initialsOf(c.name).charAt(0)}
                    </span>
                  )}
                  {c.name}
                  <span className="num opacity-70">{countOf(c.slug)}</span>
                </button>
              ))}
            </nav>

            {!ownerView && <AllClubsButton clubs={allClubs} />}

            {current && !(ownerView && clubs.length === 1) && (
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <h2 className="m-0 font-display text-2xl font-black leading-7">{current.name}</h2>
                {!ownerView && (
                  <Link href={`${base}/clubes/${current.slug}`} className="go min-h-11">
                    Abrir fã clube
                  </Link>
                )}
              </div>
            )}

            <div>
              {list.length === 0 ? (
                <p className="mono py-8">Nada por aqui ainda. Seja o primeiro do fã clube a postar.</p>
              ) : (
                list.slice(0, shown).map((p, i) => {
                  const ad = adAfter(i, pool);
                  return (
                    <Fragment key={p.id}>
                      <PostCard post={p} index={i} fresh={fresh.has(p.id)} />
                      {ad && <SponsoredPost ad={ad} />}
                    </Fragment>
                  );
                })
              )}
              {list.length > shown && (
                <button type="button" className="btn btn-outline btn-block my-4" onClick={() => setShown((n) => n + PAGE)}>
                  Ver mais posts
                </button>
              )}
            </div>
          </>
        )}
      </div>
      )}
    </>
  );
}
