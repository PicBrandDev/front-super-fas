import Link from "next/link";
import { notFound } from "next/navigation";
import { AdCard } from "@/components/fan/AdCard";
import { Eyebrow, PhotoPlaceholder, Rings, SectionTitle, StripeBand } from "@/components/fan/decor";
import { FandomSwitcher } from "@/components/fan/FandomSwitcher";
import { PostCard } from "@/components/fan/PostCard";
import { ShowStub } from "@/components/fan/ShowStub";
import { Icon, type IconName } from "@/components/icons";
import { getArtist, getEvents, getHomeAd, getPosts, getViewer } from "@/lib/api";

const linkMono = "flex min-h-11 items-center font-label text-xs font-bold text-ink";

export default async function HomePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, viewer, events, ad, drops, feed] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getEvents(artista),
    getHomeAd(artista),
    getPosts(artista, "drop"),
    getPosts(artista),
  ]);
  if (!artist) notFound();
  const base = `/${artist.slug}`;
  const next = events[0];
  const latestDrop = drops[0];

  const tiles: { href: string; title: string; sub: string; icon: IconName; tone: string; subTone: string }[] = [
    { href: "/mural", title: "Mural", sub: "Drop News e feed da galera", icon: "news", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/agenda", title: "Agenda", sub: "Shows, ingressos e brindes", icon: "calendar", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/pickap", title: "PicKap da sorte", sub: `${viewer.spins} giros disponíveis`, icon: "wheel", tone: "bg-accent text-accent-fg", subTone: "" },
    { href: "/loja", title: "Loja Vintage", sub: "Merch e drops da loja", icon: "bag", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/drops", title: "Drops Hits", sub: "Prévias de músicas novas", icon: "music", tone: "bg-ink text-paper", subTone: "text-paper-2" },
    { href: "/photo-finder", title: "Photo Finder", sub: "Ache suas fotos do show", icon: "camera", tone: "bg-accent-2 text-ink", subTone: "" },
  ];

  return (
    <>
      {/* Topo do celular (no desktop o menu lateral faz esse papel) */}
      <header className="relative z-20 flex items-center justify-between gap-2 border-b-2 border-ink bg-paper px-4 py-2.5 lg:hidden">
        <FandomSwitcher />
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notificações"
            className="relative flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-ink bg-cream text-ink"
          >
            <Icon name="bell" size={20} />
            <span className="absolute right-[7px] top-1.5 size-[9px] rounded-full border-2 border-cream bg-accent" />
          </button>
          <Link
            href="/conta"
            aria-label="Minha conta"
            className="flex size-11 items-center justify-center rounded-full border-2 border-ink bg-accent-2 font-display text-[17px] text-ink no-underline"
          >
            {viewer.initial}
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <Rings className="-right-[70px] -top-[50px] size-[270px] lg:-right-20 lg:top-1/2 lg:size-[460px] lg:-translate-y-1/2" />
        <div className="relative mx-auto flex max-w-[1100px] flex-col px-5 pb-[26px] pt-7 lg:px-8 lg:pb-11 lg:pt-12">
          <Eyebrow>Fã clube · {artist.fanClubName}</Eyebrow>
          <h1 className="m-0 mt-2.5 max-w-[250px] font-display text-5xl font-normal leading-[0.95] text-cream lg:max-w-[620px] lg:text-[84px]">
            {artist.name}
          </h1>
          <p className="m-0 mt-3.5 max-w-[240px] text-[15px] leading-relaxed text-paper-2 lg:max-w-[460px] lg:text-lg">
            Oi, {viewer.name.split(" ")[0]}! Você tem {viewer.spins} giros no PicKap e {viewer.pendingGifts} brindes esperando por você.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-2 px-2.5 py-1.5 font-label text-xs font-bold text-ink">
              {viewer.luckPoints.toLocaleString("pt-BR")} pts da sorte
            </span>
            {!viewer.isMember && (
              <Link
                href={`${base}/membro`}
                className="flex min-h-11 items-center rounded-full border-[1.5px] border-paper-2 px-3 font-label text-xs font-bold text-paper no-underline"
              >
                Tornar membro →
              </Link>
            )}
          </div>
        </div>
      </section>
      <StripeBand className="h-4" />

      <div className="mx-auto grid max-w-[1100px] gap-6 px-4 pb-8 pt-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)] lg:gap-7 lg:px-8 lg:pt-8">
        {/* Coluna principal */}
        <div className="flex min-w-0 flex-col gap-5">
          {ad && (
            <section aria-label="Anúncio patrocinado">
              <div className="lg:hidden">
                <AdCard ad={ad} />
              </div>
              <div className="hidden lg:block">
                <AdCard ad={ad} variant="wide" />
              </div>
            </section>
          )}

          <section className="flex flex-col gap-3">
            <SectionTitle action={<Link href={`${base}/mural`} className={linkMono}>Ver mural →</Link>}>Drop News</SectionTitle>

            {/* Celular: destaque do último Drop */}
            {latestDrop && (
              <Link
                href={`${base}/mural`}
                className="shadow-hard flex flex-col overflow-hidden rounded-[14px] border-2 border-ink bg-cream text-ink no-underline lg:hidden"
              >
                <PhotoPlaceholder label="[Foto dos bastidores]" className="h-[150px]" />
                <div className="flex flex-col gap-1.5 p-3.5">
                  <span className="self-start rounded-md bg-accent px-2 py-0.5 font-label text-[11px] font-bold uppercase tracking-wide text-accent-fg">
                    Do artista · {latestDrop.timeLabel}
                  </span>
                  <strong className="font-body text-lg font-extrabold leading-tight">{latestDrop.text.split(":")[0]}</strong>
                  <span className="text-sm leading-snug text-ink-soft">Drop exclusivo para membros. Toque para ver, curtir e comentar.</span>
                </div>
              </Link>
            )}

            {/* Desktop: feed */}
            <div className="hidden flex-col gap-4 lg:flex">
              {feed.slice(0, 3).map((p, i) => (
                <PostCard key={p.id} post={p} index={i} showKindTag />
              ))}
            </div>
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="flex min-w-0 flex-col gap-5">
          {next && (
            <section className="flex flex-col gap-3">
              <SectionTitle action={<Link href={`${base}/agenda`} className={linkMono}>Agenda →</Link>}>Próximo show</SectionTitle>
              <ShowStub event={next} href={`${base}/eventos/${next.id}`} />
            </section>
          )}

          <section className="flex flex-col gap-3">
            <SectionTitle>Explorar</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {tiles.map((t) => (
                <Link
                  key={t.href}
                  href={base + t.href}
                  className={`flex min-h-[108px] flex-col gap-2.5 rounded-[14px] border-2 border-ink p-3.5 no-underline ${t.tone}`}
                >
                  <Icon name={t.icon} size={26} />
                  <strong className="font-body text-base font-extrabold">{t.title}</strong>
                  <span className={`text-[13px] leading-tight ${t.subTone}`}>{t.sub}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
