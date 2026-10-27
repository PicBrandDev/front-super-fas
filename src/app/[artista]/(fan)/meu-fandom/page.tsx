import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { ClubPhotoUpload } from "@/components/fan/ClubPhotoUpload";
import { Masthead } from "@/components/fan/Masthead";
import { MiniBars, RowBars } from "@/components/fan/MiniBars";
import { Icon } from "@/components/icons";
import { getArtist, getClubAnalytics, getClubFeed, getClubs, getRanking } from "@/lib/api";
import { formatPoints, formatShort, initialsOf } from "@/lib/format";

export const metadata: Metadata = { title: "Meu fandom" };

/** Variação contra os 30 dias anteriores, em texto. */
function delta(now: number, prev: number) {
  if (prev === 0) return now === 0 ? "igual ao mês anterior" : `+${now} contra 0 no mês anterior`;
  const pct = Math.round(((now - prev) / prev) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% contra o mês anterior`;
}

/**
 * Meu fandom: a área do dono (e da equipe) de um fã clube dentro do app do fã. Mostra as informações do fã clube
 * dele: números, gente nova, cidades, os fãs que mais compartilharam e as últimas publicações.
 */
export default async function MeuFandomPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ clube?: string }>;
}) {
  const [{ artista }, { clube }] = await Promise.all([params, searchParams]);
  const [artist, clubs] = await Promise.all([getArtist(artista), getClubs(artista)]);
  if (!artist) notFound();
  const mine = clubs.filter((c) => !!c.myRole);
  if (mine.length === 0) redirect(`/${artista}`);
  const current = mine.find((c) => c.slug === clube) ?? mine[0];

  const [data, feed, ranking] = await Promise.all([getClubAnalytics(artista, current.slug), getClubFeed(artista, current.slug), getRanking(artista)]);
  if (!data) notFound();
  const base = `/${artista}`;
  const board = ranking?.clubs.find((c) => c.slug === current.slug) ?? null;
  const { club } = data;

  const kpis = [
    { label: "Membros", value: club.members, note: `${data.subscribers} assinantes` },
    { label: "Novos (30 dias)", value: club.newMembersMonth, note: delta(club.newMembersMonth, data.newMembersPrevMonth) },
    { label: "Posts (30 dias)", value: club.postsMonth, note: `${club.posts} no total` },
    { label: "Interações", value: data.likes + data.comments + data.reposts, note: `${data.likes} curtidas · ${data.comments} comentários` },
  ];

  return (
    <>
      <Masthead word="Fandom" label="Meu fandom" tone="amber" />
      <div className="px-4 pb-10">
        <Link href={base} className="back">
          <Icon name="back" size={18} />
          Início
        </Link>

        {mine.length > 1 && (
          <nav aria-label="Meus fã clubes" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 pt-3 [scrollbar-width:none]">
            {mine.map((c) => (
              <Link
                key={c.slug}
                href={`${base}/meu-fandom?clube=${c.slug}`}
                aria-current={c.slug === current.slug ? "page" : undefined}
                className={`btn btn-outline btn-sm flex-none no-underline ${c.slug === current.slug ? "bg-fg text-night" : ""}`}
              >
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        <header className="flex items-center gap-4 pb-3 pt-5">
          <ClubAvatar src={club.avatar} name={club.name} size={72} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="poster m-0 text-[30px] leading-8">{club.name}</h1>
            <span className="mono">
              {club.isMaster ? "Fã clube oficial" : club.city || "Fã clube"} · você é {current.myRole === "owner" ? "dono" : "da equipe"}
            </span>
            <span className="flex flex-wrap gap-2 pt-1">
              <span className={club.status === "active" ? "tag" : "tag tag-demo"}>{club.status === "active" ? "No ar" : "Em configuração"}</span>
              {board?.me?.position && <span className="tag tag-key">{board.me.position}º no ranking do fã clube</span>}
            </span>
          </div>
        </header>
        <ClubPhotoUpload slug={artista} club={current.slug} hasPhoto={!!club.avatar} />

        <section aria-label="Números do fã clube" className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-line py-5">
          {kpis.map((k) => (
            <div key={k.label} className="flex flex-col gap-1">
              <span className="mono">{k.label}</span>
              <strong className="num font-display text-4xl font-black leading-9">{formatShort(k.value)}</strong>
              <span className="text-[13px] leading-4 text-fg-muted">{k.note}</span>
            </div>
          ))}
        </section>

        <section aria-labelledby="mf-novos" className="border-b border-line py-5">
          <h2 id="mf-novos" className="poster m-0 mb-3 text-lg leading-6">
            Gente nova
          </h2>
          <MiniBars title="Novos membros por dia" unit="novos membros" points={data.series.map((d) => ({ day: d.day, value: d.newMembers }))} />
        </section>

        <section aria-labelledby="mf-cidades" className="border-b border-line py-5">
          <h2 id="mf-cidades" className="poster m-0 mb-3 text-lg leading-6">
            De onde são os membros
          </h2>
          {data.topCities.length ? <RowBars rows={data.topCities.map((c) => ({ label: c.city, value: c.members }))} /> : <p className="m-0 text-fg-muted">Ainda não há membros.</p>}
        </section>

        <section aria-labelledby="mf-rank" className="border-b border-line py-5">
          <h2 id="mf-rank" className="poster m-0 mb-1 text-lg leading-6">
            Fãs que mais compartilharam
          </h2>
          <p className="mono m-0 mb-2">Ranking Fã Super do seu fã clube</p>
          {!board || board.top.length === 0 ? (
            <p className="m-0 text-fg-muted">Ninguém no ranking do fã clube ainda.</p>
          ) : (
            <ol className="m-0 flex list-none flex-col p-0">
              {board.top.slice(0, 5).map((r) => (
                <li key={`${r.position}-${r.name}`} className="flex items-center gap-3 border-b border-line py-2.5">
                  <span className="num w-7 flex-none font-display text-xl font-black">{r.position}</span>
                  {r.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil do fã
                    <img src={r.avatar} alt="" width={36} height={36} className="size-9 flex-none rounded-full object-cover" />
                  ) : (
                    <span className="avatar flex-none" aria-hidden="true">
                      {initialsOf(r.name)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-[15px]">{r.name}</span>
                  <strong className="num flex-none">{formatPoints(r.points ?? r.shares)}</strong>
                </li>
              ))}
            </ol>
          )}
          <Link href={`${base}/comunidade?aba=ranking`} className="go mt-2 min-h-11">
            Ver o ranking completo
            <Icon name="arrow" size={14} />
          </Link>
        </section>

        <section aria-labelledby="mf-posts" className="border-b border-line py-5">
          <h2 id="mf-posts" className="poster m-0 mb-3 text-lg leading-6">
            Últimas publicações
          </h2>
          {feed.length === 0 ? (
            <p className="m-0 text-fg-muted">O fã clube ainda não tem publicações.</p>
          ) : (
            <ul className="m-0 flex list-none flex-col p-0">
              {feed.slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-start gap-3 border-b border-line py-3">
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="line-clamp-2 text-[15px] leading-5">{p.text}</span>
                    <span className="mono">
                      {p.timeLabel} · {p.author}
                    </span>
                  </span>
                  <span className="mono flex flex-none flex-col items-end gap-0.5">
                    <span>{p.likes} curtidas</span>
                    <span>{p.comments} comentários</span>
                    <span>{p.views} visualizações</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </>
  );
}
