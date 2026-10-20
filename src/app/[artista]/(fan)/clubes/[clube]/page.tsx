import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdCard } from "@/components/fan/AdCard";
import { JoinButton } from "@/components/fan/ClubCard";
import { Rings, StripeBand } from "@/components/fan/decor";
import { Icon } from "@/components/icons";
import { getArtist, getClub, getClubHomeAd, getClubPosts } from "@/lib/api";
import { ClubWall } from "./ClubWall";

type Params = Promise<{ artista: string; clube: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { artista, clube } = await params;
  const club = await getClub(artista, clube);
  return { title: club ? club.name : "Fã clube" };
}

export default async function ClubPage({ params }: { params: Params }) {
  const { artista, clube } = await params;
  const [artist, club] = await Promise.all([getArtist(artista), getClub(artista, clube)]);
  if (!artist || !club) notFound();
  const [posts, ad] = await Promise.all([getClubPosts(artista, clube), getClubHomeAd(artista, clube)]);
  const base = `/${artist.slug}`;
  const isStaff = !!club.myRole;

  return (
    <>
      <header className="relative overflow-hidden bg-ink text-paper">
        <Rings className="-right-[70px] -top-[60px] size-[240px] lg:-right-16 lg:size-[340px]" />
        <div className="relative mx-auto flex max-w-[860px] flex-col gap-3 px-4 pb-6 pt-4 lg:px-8 lg:pt-8">
          <Link
            href={`${base}/clubes`}
            aria-label="Voltar para os fã clubes"
            className="flex size-11 items-center justify-center rounded-full border-2 border-paper text-paper no-underline"
          >
            <Icon name="back" size={20} strokeWidth={2.4} />
          </Link>
          <div className="flex flex-col gap-1">
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
              {club.isMaster ? `Fã clube master · ${artist.name}` : `Fã clube · ${artist.name}`}
            </span>
            <h1 className="m-0 max-w-[560px] font-display text-[36px] font-normal leading-[0.98] text-cream lg:text-[52px]">{club.name}</h1>
            <p className="m-0 font-label text-xs text-paper-2">
              {[club.city, `${club.members.toLocaleString("pt-BR")} ${club.members === 1 ? "membro" : "membros"}`, club.owner && `dono: ${club.owner.name}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          {club.description && <p className="m-0 max-w-[520px] text-[15px] leading-snug text-paper-2">{club.description}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <JoinButton club={club} size="lg" />
            <Link
              href={`${base}/pickap?clube=${club.slug}`}
              className="flex min-h-12 items-center gap-1.5 rounded-full border-2 border-paper px-4 font-label text-sm font-bold text-paper no-underline"
            >
              <Icon name="wheel" size={18} /> PicKap do clube
            </Link>
            {isStaff && (
              <Link
                href={`${base}/clubes/${club.slug}/admin`}
                className="flex min-h-12 items-center gap-1.5 rounded-full border-2 border-accent-2 px-4 font-label text-sm font-bold text-accent-2 no-underline"
              >
                <Icon name="settings" size={18} /> Painel do clube
              </Link>
            )}
          </div>
        </div>
      </header>
      <StripeBand className="h-3" />

      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 pb-8 pt-5 lg:px-8">
        {ad && (
          <section aria-label="Anúncio patrocinado">
            <AdCard ad={ad} />
          </section>
        )}
        <ClubWall club={{ slug: club.slug, name: club.name }} joined={club.joined} posts={posts} />
      </div>
    </>
  );
}
