import Link from "next/link";
import { notFound } from "next/navigation";
import { AdCard } from "@/components/fan/AdCard";
import { ClubCard } from "@/components/fan/ClubCard";
import { Eyebrow, PhotoPlaceholder, Rings, SectionTitle, StripeBand } from "@/components/fan/decor";
import { FandomSwitcher } from "@/components/fan/FandomSwitcher";
import { PostCard } from "@/components/fan/PostCard";
import { ShowStub } from "@/components/fan/ShowStub";
import { EmptyState } from "@/components/fan/states";
import { Icon, type IconName } from "@/components/icons";
import { getArtist, getClubs, getEvents, getHomeAd, getPosts, getProducts, getTracks, getViewer } from "@/lib/api";
import { GaleraComposer } from "./mural/Composer";

const linkMono = "flex min-h-11 items-center font-label text-xs font-bold text-ink";

export default async function HomePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, viewer, events, ad, drops, feed, clubs, tracks, products] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getEvents(artista),
    getHomeAd(artista),
    getPosts(artista, "drop"),
    getPosts(artista),
    getClubs(artista),
    getTracks(artista),
    getProducts(artista),
  ]);
  if (!artist) notFound();
  const myClubs = clubs.filter((c) => c.joined);
  const highlight = (myClubs.length ? myClubs : clubs).slice(0, 2);
  const base = `/${artist.slug}`;
  const next = events[0];
  const latestDrop = drops[0];
  const latestTrack = tracks[0];
  const shopPicks = products.slice(0, 3);
  const postClubs = myClubs.map((c) => ({ slug: c.slug, name: c.name }));

  const tiles: { href: string; title: string; sub: string; icon: IconName; tone: string; subTone: string }[] = [
    { href: "/mural", title: "Mural", sub: "Drop News e feed da galera", icon: "news", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/agenda", title: "Agenda", sub: "Shows, ingressos e brindes", icon: "calendar", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/pickap", title: "PicKap da sorte", sub: `${viewer.spins} giros disponíveis`, icon: "wheel", tone: "bg-accent text-accent-fg", subTone: "" },
    { href: "/loja", title: "Loja", sub: "Merch e drops da loja", icon: "bag", tone: "bg-cream text-ink", subTone: "text-ink-soft" },
    { href: "/drops", title: "Drops Hits", sub: "Prévias de músicas novas", icon: "music", tone: "bg-ink text-paper", subTone: "text-paper-2" },
    { href: "/photo-finder", title: "Photo Finder", sub: "Ache suas fotos do show", icon: "camera", tone: "bg-accent-2 text-ink", subTone: "" },
  ];

  const agendaLink = (
    <Link
      href={`${base}/agenda`}
      className="flex min-h-11 items-center rounded-full border-2 border-ink bg-cream px-4 font-label text-xs font-bold text-ink no-underline"
    >
      Ver agenda
    </Link>
  );

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
            href={`/conta?artista=${artist.slug}`}
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
          {/* Desktop: ações principais do artboard */}
          <div className="mt-5 hidden flex-wrap items-center gap-3 lg:flex">
            <Link
              href={`${base}/pickap`}
              className="flex min-h-12 items-center gap-2 rounded-full border-2 border-ink bg-accent px-5 font-label text-sm font-bold text-accent-fg no-underline shadow-[4px_4px_0_var(--fc-accent-2)]"
            >
              <Icon name="wheel" size={18} /> Girar o PicKap
            </Link>
            <Link
              href={`${base}/agenda`}
              className="flex min-h-12 items-center gap-2 rounded-full border-2 border-paper px-5 font-label text-sm font-bold text-paper no-underline"
            >
              <Icon name="calendar" size={18} /> Ver agenda
            </Link>
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

          {/* Celular: destaque do último Drop */}
          <section className="flex flex-col gap-3 lg:hidden">
            <SectionTitle action={<Link href={`${base}/mural`} className={linkMono}>Ver mural →</Link>}>Drop News</SectionTitle>
            {latestDrop ? (
              <Link
                href={`${base}/mural`}
                className="shadow-hard flex flex-col overflow-hidden rounded-[14px] border-2 border-ink bg-cream text-ink no-underline"
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
            ) : (
              <EmptyState title="Nenhum Drop News ainda" text="As novidades do artista e da equipe aparecem aqui." />
            )}
          </section>

          {/* Desktop: campo de postar + feed */}
          <section className="hidden flex-col gap-4 lg:flex">
            <SectionTitle action={<Link href={`${base}/mural`} className={linkMono}>Abrir mural completo →</Link>}>Mural</SectionTitle>
            <GaleraComposer id="inicio-draft" clubs={postClubs} compact />
            {feed.length === 0 ? (
              <EmptyState title="O mural ainda está vazio" text="Drop News do artista e posts da galera aparecem aqui." />
            ) : (
              feed.slice(0, 3).map((p, i) => <PostCard key={p.id} post={p} index={i} showKindTag />)
            )}
          </section>
        </div>

        {/* Coluna lateral */}
        <div className="flex min-w-0 flex-col gap-5">
          <section className="flex flex-col gap-3">
            <SectionTitle action={<Link href={`${base}/agenda`} className={linkMono}>Agenda →</Link>}>Próximo show</SectionTitle>
            {next ? (
              <ShowStub event={next} href={`${base}/eventos/${next.id}`} />
            ) : (
              <EmptyState title="Nenhum show marcado" text="Quando a equipe anunciar uma data, ela aparece aqui." action={agendaLink} />
            )}
          </section>

          {/* Desktop: atalhos em cartão (no celular a grade Explorar faz esse papel) */}
          <section aria-label="Atalhos" className="hidden flex-col gap-3 lg:flex">
            <Link
              href={`${base}/pickap`}
              className="shadow-hard relative flex flex-col gap-1 overflow-hidden rounded-[14px] border-2 border-ink bg-accent p-4 text-accent-fg no-underline"
            >
              <Rings className="-right-12 -top-10 size-[150px]" inner="var(--fc-accent)" start={24} step={16} />
              <span className="relative font-label text-[11px] font-bold uppercase tracking-[0.12em]">Roleta geral</span>
              <strong className="relative font-display text-2xl font-normal leading-tight">PicKap da sorte</strong>
              <span className="relative text-sm">
                {viewer.spins} {viewer.spins === 1 ? "giro esperando" : "giros esperando"} por você
              </span>
            </Link>

            <Link
              href={`${base}/drops`}
              className="flex items-center gap-3 rounded-[14px] border-2 border-ink bg-ink p-3.5 text-paper no-underline"
            >
              <span
                aria-hidden="true"
                className="flex size-12 flex-none items-center justify-center rounded-full border-2 border-paper-2 bg-deep text-paper"
              >
                <Icon name="music" size={22} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
                  Drops Hits{latestTrack ? " · Prévia nova" : ""}
                </span>
                <strong className="truncate font-body text-base font-extrabold">
                  {latestTrack ? latestTrack.title : "Prévias de músicas novas"}
                </strong>
                {latestTrack && <span className="truncate text-[13px] text-paper-2">{latestTrack.meta}</span>}
              </span>
            </Link>

            <Link
              href={`${base}/photo-finder`}
              className="flex items-center gap-3 rounded-[14px] border-2 border-ink bg-accent-2 p-3.5 text-ink no-underline"
            >
              <span aria-hidden="true" className="flex size-12 flex-none items-center justify-center rounded-full border-2 border-ink bg-cream">
                <Icon name="camera" size={22} />
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="font-body text-base font-extrabold">Photo Finder</strong>
                <span className="text-[13px] leading-tight">Foi no último show? Ache suas fotos.</span>
              </span>
            </Link>

            {shopPicks.length > 0 && (
              <div className="flex flex-col gap-2.5 rounded-[14px] border-2 border-ink bg-cream p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="m-0 font-body text-base font-extrabold">Loja</h3>
                  <Link href={`${base}/loja`} className={linkMono}>
                    Ver loja →
                  </Link>
                </div>
                <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                  {shopPicks.map((p) => (
                    <li key={p.id}>
                      <Link href={`${base}/loja`} className="flex min-h-11 items-center gap-2.5 rounded-[10px] text-ink no-underline hover:bg-paper-2">
                        <span
                          aria-hidden="true"
                          className="halftone-dark size-10 flex-none rounded-lg border-[1.5px] border-ink"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <strong className="truncate font-body text-sm font-extrabold">{p.name}</strong>
                          <span className="font-label text-[11px] font-bold text-ink-soft">{p.priceLabel}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {clubs.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionTitle action={<Link href={`${base}/clubes`} className={linkMono}>Ver todos →</Link>}>
                {myClubs.length ? "Seus fã clubes" : "Fã clubes"}
              </SectionTitle>
              {highlight.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
              {clubs.length > highlight.length && (
                <Link href={`${base}/clubes`} className={linkMono}>
                  + {clubs.length - highlight.length} {clubs.length - highlight.length === 1 ? "fã clube" : "fã clubes"} de {artist.name}
                </Link>
              )}
            </section>
          )}

          {/* Celular: grade Explorar (no desktop os atalhos viram cartões acima e o menu lateral) */}
          <section className="flex flex-col gap-3 lg:hidden">
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
