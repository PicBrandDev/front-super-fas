import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdCard } from "@/components/fan/AdCard";
import { JoinButton } from "@/components/fan/ClubCard";
import { Icon } from "@/components/icons";
import { getArtist, getClub, getClubHomeAd, getClubPosts, getClubStaff } from "@/lib/api";
import { ClubWall } from "./ClubWall";

type Params = Promise<{ artista: string; clube: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { artista, clube } = await params;
  const club = await getClub(artista, clube);
  return { title: club ? club.name : "Fã clube" };
}

/** Página de um fã clube: cabeçalho com volta, título em caixa alta, equipe e o mural do clube. */
export default async function ClubPage({ params }: { params: Params }) {
  const { artista, clube } = await params;
  const [artist, club] = await Promise.all([getArtist(artista), getClub(artista, clube)]);
  if (!artist || !club) notFound();
  // A equipe só é visível para quem é da equipe (a API responde 403 para os outros).
  const [posts, ad, staff] = await Promise.all([
    getClubPosts(artista, clube),
    getClubHomeAd(artista, clube),
    club.myRole ? getClubStaff(artista, clube) : Promise.resolve([]),
  ]);
  const base = `/${artist.slug}`;
  const team = staff.filter((s) => !s.pending);
  const members = `${club.members.toLocaleString("pt-BR")} ${club.members === 1 ? "membro" : "membros"}`;
  const meta = [club.city, members, club.owner && `dono: ${club.owner.name}`].filter(Boolean).join(" · ");

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-4 pb-3 pt-3.5">
        <Link href={`${base}/clubes`} className="back">
          <Icon name="back" size={18} />
          Fã clubes
        </Link>
        {club.myRole && (
          <Link href={`${base}/clubes/${club.slug}/admin`} className="mono flex min-h-11 items-center text-fg no-underline">
            Painel do clube
          </Link>
        )}
      </header>

      <div className="px-4 pt-2">
        <span className="mono">{club.isMaster ? "Fã clube master" : "Fã clube"} · {artist.name}</span>
        <h1 className="poster m-0 mt-2 text-[32px] leading-8">{club.name}</h1>
        {meta && (
          <div className="mono mt-2 flex items-center gap-1.5">
            <Icon name="pin" size={13} />
            {meta}
          </div>
        )}
        {club.description && <p className="mb-0 mt-3 text-[15px] leading-[22px] text-fg-muted">{club.description}</p>}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <JoinButton club={club} />
          <Link href={`${base}/pickap`} className="go min-h-11">
            PicKap do clube
            <Icon name="arrow" size={16} />
          </Link>
        </div>

        {ad && <AdCard ad={ad} />}

        {team.length > 0 && (
          <section aria-labelledby="clube-equipe" className="pt-6">
            <h2 id="clube-equipe" className="poster m-0 mb-3 text-xl leading-[22px] tracking-[-0.01em]">
              Equipe do clube
            </h2>
            <ul className="m-0 grid list-none border-t border-line p-0">
              {team.map((s) => (
                <li key={s.id} className="flex items-baseline justify-between gap-3 border-b border-line py-3">
                  <span className="text-[15px] leading-5">{s.name}</span>
                  <span className="mono">{s.roleLabel}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ClubWall club={{ slug: club.slug, name: club.name }} joined={club.joined} posts={posts} />
      </div>
    </>
  );
}
