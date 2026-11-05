"use client";

import { Fragment, useState } from "react";
import { Masthead } from "@/components/fan/Masthead";
import { PostCard } from "@/components/fan/PostCard";
import { SponsoredPost } from "@/components/fan/SponsoredPost";
import { CLUB_AD_EVERY, type InAppAd } from "@/lib/ads";
import { Tabs } from "@/components/fan/Tabs";
import type { Post, Ranking } from "@/lib/types";
import { AllClubsButton, type ClubListItem } from "./AllClubsSheet";
import { ClubStrip } from "./ClubStrip";
import { DiscoverClubs } from "./DiscoverClubs";
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
 * Conta pela posição na lista que aparece na tela (filtros e posts novos incluídos).
 * Um banner de patrocínio depois de cada CLUB_AD_EVERY posts, alternando entre as marcas (em "Todos" e no filtro de um fã clube).
 * Sem nenhuma marca nos fã clubes, "Todos" mostra o post patrocinado das notícias uma vez, depois do post `newsAt`.
 */
function adAfter(i: number, pool: InAppAd[], news: InAppAd | null, newsAt: number, filtered: boolean): InAppAd | null {
  if (pool.length) return (i + 1) % CLUB_AD_EVERY === 0 ? pool[((i + 1) / CLUB_AD_EVERY - 1) % pool.length] : null;
  return !filtered && news && i === newsAt ? news : null;
}

/**
 * Tela "Comunidade": o feed só dos fã clubes que o fã segue. "Todos" junta o feed deles e cada botão
 * abre o feed de um fã clube. Os posts oficiais do artista aparecem para quem segue o fã clube master.
 * O botão "+" flutuante publica num dos fã clubes que o fã segue.
 */
export function ComunidadeView({
  posts,
  newsAd = null,
  newsAt = 0,
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
  newsAd?: InAppAd | null; // post patrocinado das notícias, em posição aleatória ("Todos")
  newsAt?: number; // depois de qual post ele entra
  clubAds?: Record<string, InAppAd[]>; // o anúncio dos fã clubes, a cada 2 posts (filtro por fã clube)
  clubs: FollowedClub[]; // fã clubes que o fã segue
  allClubs: ClubListItem[]; // todos os fã clubes, para entrar em um
  ownerView?: boolean; // dono/equipe: tudo da tela é só do fã clube dele
  initialClub: string | null;
  ranking: Ranking | null;
  initialTab: Tab;
  demo: boolean;
}) {
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
  // As marcas dos fã clubes: as do clube filtrado ou, em "Todos", as de todos os que o fã segue (sem repetir).
  const pool = clube ? (clubAds[clube] ?? []) : [...new Map(Object.values(clubAds).flat().map((a) => [a.id, a])).values()];
  const countOf = (slug: string) => all.filter((p) => clubOf(p) === slug).length;
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

            {/* Os fã clubes que o fã segue, em cartões com a foto; tocar filtra o feed. */}
            {!(ownerView && clubs.length === 1) && (
              <ClubStrip
                clubs={clubs.map((c) => ({ ...c, posts: countOf(c.slug), members: allClubs.find((a) => a.slug === c.slug)?.members }))}
                value={clube}
                onChange={setClube}
                total={all.length}
              />
            )}

            <div>
              {list.length === 0 ? (
                <p className="mono py-8">Nada por aqui ainda. Seja o primeiro do fã clube a postar.</p>
              ) : (
                list.slice(0, shown).map((p, i) => {
                  const ad = adAfter(i, pool, newsAd, newsAt, !!clube);
                  return (
                    <Fragment key={p.id}>
                      <PostCard post={p} index={i} showClub={!clube} fresh={fresh.has(p.id)} />
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

            {!ownerView && <DiscoverClubs clubs={allClubs} all={allClubs} />}
          </>
        )}
      </div>
      )}
    </>
  );
}
