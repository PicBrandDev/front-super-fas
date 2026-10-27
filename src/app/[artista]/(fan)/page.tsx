import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { AdCard } from "@/components/fan/AdCard";
import { ClubCard } from "@/components/fan/ClubCard";
import { Mark } from "@/components/fan/Mark";
import { FanTopBar } from "@/components/fan/FanTopBar";
import { HomeMuralSwitch } from "@/components/fan/HomeMuralSwitch";
import { HomeNextEvent } from "@/components/fan/HomeNextEvent";
import { Masthead } from "@/components/fan/Masthead";
import { EmptyState } from "@/components/fan/states";
import { Vinyl } from "@/components/fan/Vinyl";
import { Icon } from "@/components/icons";
import { apiEnabled, getArtist, getClubs, getEvents, getHomeAd, getMe, getPackages, getPrizes, getProducts, getTracks, getViewer } from "@/lib/api";
import { isPastEvent } from "@/lib/events";
import { mediaFor, productImage } from "@/lib/media";

/** Título de bloco do Início (`.sect h3` do protótipo). */
function Block({ title, children, flush = false }: { title: string; children: ReactNode; flush?: boolean }) {
  return (
    <section className="border-t border-line pb-6 pt-6">
      <h2 className="poster m-0 mb-3 px-4 text-xl leading-[22px] tracking-[-0.01em]">{title}</h2>
      <div className={flush ? "" : "px-4"}>{children}</div>
    </section>
  );
}

/**
 * Início: cartaz "Culture is the answer" com a faixa de leitura e, embaixo,
 * um bloco por tela (evento, PicKup, drops, loja, fã clubes, anúncio),
 * todos montados com as peças do protótipo.
 */
export default async function HomePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, viewer, events, clubs, tracks, products, prizes, me, homeAd] = await Promise.all([
    getArtist(artista),
    getViewer(artista),
    getEvents(artista),
    getClubs(artista),
    getTracks(artista),
    getProducts(artista),
    getPrizes(artista),
    getMe(),
    getHomeAd(artista),
  ]);
  if (!artist) notFound();

  const base = `/${artist.slug}`;
  const demo = !apiEnabled();
  const hero = mediaFor(artist.slug)?.hero ?? null;
  const first = viewer.name.split(" ")[0];
  // O próximo evento é o primeiro que ainda não aconteceu (os passados ficam em Meus ingressos).
  const next = events.find((e) => !isPastEvent(e));
  const nextPackages = next ? await getPackages(artista, next.id) : [];
  const drop = tracks[0];
  const picks = products.slice(0, 2);
  const myClubs = clubs.filter((c) => c.joined);
  const mineStaff = clubs.filter((c) => !!c.myRole); // fã clubes que o fã administra (dono ou equipe)
  const highlight = (myClubs.length ? myClubs : clubs).slice(0, 2);
  const featured = prizes.find((p) => !p.isRetry && /ingresso/i.test(p.label)) ?? prizes.find((p) => !p.isRetry) ?? null;

  return (
    <>
      <FanTopBar avatar={me?.avatar ?? null} />

      {mineStaff.length > 0 && (
        <Link href={`${base}/meu-fandom`} className="mx-4 mb-3 flex min-h-12 items-center justify-between gap-3 border border-line-strong px-4 text-fg no-underline">
          <span className="flex flex-col leading-5">
            <strong className="text-[15px]">Meu fandom</strong>
            <span className="mono">{mineStaff.length === 1 ? mineStaff[0].name : `${mineStaff.length} fã clubes`}</span>
          </span>
          <Icon name="arrow" size={18} />
        </Link>
      )}
      <HomeMuralSwitch base={base} current="inicio" />
      <Masthead word="Início" steps={1} />

      {/* Cartaz de abertura: campo cinza, foto em multiply sangrando à direita, manchete cortada embaixo. */}
      <div className="@container relative aspect-[4/5] overflow-hidden border-t border-line bg-poster-grey text-ink">
        {hero && (
          <img
            src={hero.src}
            alt={hero.alt}
            className="absolute bottom-0 right-[-11cqw] h-full w-auto max-w-none mix-blend-multiply grayscale contrast-105"
          />
        )}
        <span className="absolute left-[4.5cqw] top-[4.5cqw] z-[1] font-mono uppercase leading-[1.3] tracking-[0.12em]" style={{ fontSize: "max(10px, 2.9cqw)" }}>
          {artist.name}
        </span>
        <span className="absolute right-[4.5cqw] top-[4.5cqw] z-[1] font-mono uppercase leading-[1.3] tracking-[0.12em]" style={{ fontSize: "max(10px, 2.9cqw)" }}>
          Fanzone
        </span>
        <div
          aria-hidden="true"
          className="poster absolute bottom-[-5cqw] left-[3.5cqw] z-[1] text-[20cqw] leading-[0.84] tracking-[-0.03em] text-mist"
        >
          Culture
          <br />
          <span className="mr-[2.2cqw] inline-block align-[0.02em] text-ink">
            <Mark size={80} style={{ width: "18cqw" }} />
          </span>
          is
          <br />
          the
          <br />
          answer
        </div>
      </div>

      {/* Faixa de leitura */}
      <div className="grid gap-1.5 px-4 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <div className="avatar" style={{ width: 24, height: 24 }} aria-hidden="true">
            <Mark size={14} />
          </div>
          <strong className="text-sm leading-5">{artist.name}</strong>
          <span className="mono verified">
            <Icon name="check" size={12} />
            Oficial
          </span>
        </div>
        <p className="m-0 text-[15px] leading-[22px]">
          Oi, {first}! Você tem {viewer.spins} {viewer.spins === 1 ? "giro" : "giros"} e {viewer.pendingGifts}{" "}
          {viewer.pendingGifts === 1 ? "brinde" : "brindes"}.
        </p>
        <div className="flex items-center justify-between gap-2">
          <span className="mono num">{viewer.luckPoints.toLocaleString("pt-BR")} pts da sorte</span>
          {viewer.isMember ? (
            <Link href={`${base}/mural`} className="go min-h-11">
              Ver mural
              <Icon name="arrow" size={16} />
            </Link>
          ) : (
            <Link href={`${base}/membro`} className="btn btn-primary btn-sm">
              Tornar membro
            </Link>
          )}
        </div>
      </div>

      {homeAd && (
        <div className="px-4">
          <AdCard ad={homeAd} />
        </div>
      )}

      <Block title="Próximo evento" flush>
        {next ? (
          <HomeNextEvent event={next} packages={nextPackages} demo={demo} />
        ) : (
          <div className="px-4">
            <EmptyState title="Nenhum evento marcado" text="Quando a equipe anunciar uma data, ela aparece aqui." />
          </div>
        )}
      </Block>

      <Block title="PicKup da sorte">
        <div className="flex items-end justify-between gap-3">
          <div className="grid gap-2">
            <p className="m-0 max-w-[24ch] text-[15px] leading-[22px]">Solte a agulha e concorra a brindes da fanzone.</p>
            {featured && <span className="mono">Destaque: {featured.label}</span>}
          </div>
          <Link href={`${base}/pickup`} className="btn btn-primary btn-sm">
            Girar
          </Link>
        </div>
      </Block>

      <Block title="Drops" flush>
        {drop ? (
          <article className="grid grid-cols-[132px_1fr] gap-4 overflow-hidden border-y border-line py-6 pr-4">
            <div className="-ml-[100px] size-[220px] self-center">
              <Vinyl />
            </div>
            <div className="min-w-0">
              <h3 className="serif m-0 mb-1 text-[34px] leading-[34px] text-fg">{drop.title}</h3>
              <div className="mono">
                {drop.meta}
                <br />
                Lançamento {drop.releaseLabel}
              </div>
              {demo && <span className="tag tag-demo mt-2">Exemplo</span>}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link href={`${base}/drops`} className="btn btn-primary btn-sm">
                  <Icon name="play" size={16} />
                  <span>Ouvir</span>
                </Link>
              </div>
            </div>
          </article>
        ) : (
          <div className="px-4">
            <EmptyState title="Nenhum drop ainda" text="As prévias e lançamentos do artista aparecem aqui." />
          </div>
        )}
      </Block>

      <Block title="Loja Vintage">
        {picks.length ? (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6">
              {picks.map((p, i) => {
                const img = productImage(artist.slug, p, i);
                return (
                  <Link key={p.id} href={`${base}/loja`} className="grid content-start gap-2 text-fg no-underline">
                    <div className="aspect-[4/5] overflow-hidden rounded-hair bg-mist" style={img ? undefined : { background: p.color }}>
                      {img && (
                        <img
                          src={img.src}
                          alt={img.alt}
                          loading="lazy"
                          className={`block h-full w-full ${img.cover ? "object-cover" : "object-contain mix-blend-multiply"}`}
                        />
                      )}
                    </div>
                    <h3 className="m-0 mt-1 font-display text-[19px] font-bold leading-[22px]">{p.name}</h3>
                    <span className="font-grotesk text-sm font-bold leading-[18px] text-amber-text">{p.priceLabel}</span>
                  </Link>
                );
              })}
            </div>
            <Link href={`${base}/loja`} className="go mt-6 min-h-11">
              Ver loja
              <Icon name="arrow" size={16} />
            </Link>
          </>
        ) : (
          <EmptyState title="A loja ainda está vazia" text="As peças da marca do artista aparecem aqui." />
        )}
      </Block>

      <Block title="Fã clubes">
        {clubs.length ? (
          <>
            <div className="border-t border-line">
              {highlight.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
            </div>
            <Link href={`${base}/clubes`} className="go mt-4 min-h-11">
              Ver todos
              <Icon name="arrow" size={16} />
            </Link>
          </>
        ) : (
          <EmptyState title="Nenhum fã clube por enquanto" text={`Os fã clubes de ${artist.name} ainda estão sendo montados.`} />
        )}
      </Block>
    </>
  );
}
