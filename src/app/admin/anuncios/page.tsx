import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader, AdminShell, masterNav } from "@/components/admin/AdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { AnuncioCard, type AnuncioItem } from "@/components/admin/vitrines/AnuncioCard";
import { SponsorAvatar } from "@/components/admin/vitrines/SponsorAvatar";
import { apiEnabled, getAdsAnalyticsAll, getSponsors } from "@/lib/api";
import { formatCount } from "@/lib/format";
import { shellUser } from "@/lib/shell";
import type { AdsAnalytics, AdsCampaignStats } from "@/lib/types";
import { PatrocinadoresAcessos } from "./PatrocinadoresAcessos";

export const metadata: Metadata = { title: "Admin master — Anúncios e patrocinadores" };

const PERIODS = [7, 30, 90];
const pct = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const ORDER = { live: 0, scheduled: 1, ended: 2 } as const;

const toItem = (c: AdsCampaignStats, sponsor: string, logo?: string | null): AnuncioItem => ({
  id: c.id,
  sponsor,
  sponsorLogo: logo,
  title: c.title,
  text: c.text,
  cta: c.cta,
  artUrl: c.artUrl,
  videoUrl: c.videoUrl,
  status: c.status,
  slotName: c.slotName,
  artist: c.artist,
  fanClub: c.fanClub,
  start: c.start,
  end: c.end,
  views: c.views,
  clicks: c.clicks,
  series: c.series.map((p) => p.views),
});

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col gap-1 bg-white px-5 py-4">
      <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{label}</dt>
      <dd className="m-0 font-display text-3xl font-black leading-none">{value}</dd>
      {note && <dd className="m-0 text-xs text-adm-muted">{note}</dd>}
    </div>
  );
}

/** Visão geral dos anúncios de todos os patrocinadores. Um clique no patrocinador mostra os anúncios dele, com o banner e o artista. */
export default async function AnunciosPage({ searchParams }: { searchParams: Promise<{ dias?: string; p?: string }> }) {
  const { dias, p } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const [ads, sponsors] = await Promise.all([getAdsAnalyticsAll(days), getSponsors()]);
  const logoOf = (name: string) => ads?.sponsors.find((s) => s.name === name)?.avatar ?? sponsors.find((s) => s.brand === name)?.logo ?? null;
  const picked = ads?.sponsors.find((s) => s.name === p) ?? null;
  const href = (name?: string, d = days) => `/admin/anuncios?dias=${d}${name ? `&p=${encodeURIComponent(name)}` : ""}`;

  return (
    <AdminShell
      subtitle="Admin da plataforma"
      nav={masterNav}
      active="anuncios"
      extraLink={{ label: "Ver portal do patrocinador", href: "/patrocinador" }}
      user={await shellUser({ initials: "AD", name: "Você", role: "Admin da plataforma" })}
    >
      <AdminPageHeader
        title="Anúncios e patrocinadores"
        headingId="anuncios-title"
        description="Escolha um patrocinador para ver os anúncios dele, em quais artistas e vitrines aparecem e como estão indo."
      />

      <nav aria-label="Período" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-adm-muted">Período:</span>
        {PERIODS.map((d) => (
          <Link
            key={d}
            href={href(picked?.name, d)}
            aria-current={days === d ? "true" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline ${days === d ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
          >
            {d} dias
          </Link>
        ))}
      </nav>

      {!ads ? (
        <AdminEmpty title="Sem dados de anúncios" text="Quando as campanhas aprovadas tiverem visualizações e cliques, o desempenho aparece aqui." />
      ) : picked ? (
        <Detalhe sponsor={picked} logo={logoOf(picked.name)} back={href()} />
      ) : (
        <Visao ads={ads} href={href} logoOf={logoOf} />
      )}

      {!picked && <PatrocinadoresAcessos sponsors={sponsors} exampleMode={!apiEnabled()} />}
    </AdminShell>
  );
}

/** Todos os patrocinadores: um cartão por marca, com os banners dos anúncios dela. */
function Visao({ ads, href, logoOf }: { ads: AdsAnalytics; href: (name?: string) => string; logoOf: (n: string) => string | null }) {
  const live = ads.sponsors.reduce((a, s) => a + s.campaigns.filter((c) => c.status === "live").length, 0);
  const total = ads.sponsors.reduce((a, s) => a + s.campaigns.length, 0);
  return (
    <>
      <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Patrocinadores" value={formatCount(ads.sponsors.length)} note="com anúncios" />
        <Kpi label="Anúncios" value={formatCount(total)} note={`${formatCount(live)} no ar agora`} />
        <Kpi label="Visualizações" value={formatCount(ads.views)} note={`nos últimos ${ads.days} dias`} />
        <Kpi label="Cliques" value={formatCount(ads.clicks)} note={`taxa de clique ${pct(ads.ctr)}`} />
      </dl>

      <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {ads.sponsors.map((s) => {
          const ordered = [...s.campaigns].sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.views - a.views);
          const liveN = s.campaigns.filter((c) => c.status === "live").length;
          const artists = [...new Set(s.campaigns.map((c) => c.artist).filter(Boolean))];
          return (
            <li key={s.name}>
              <Link href={href(s.name)} className="flex h-full flex-col gap-4 rounded-xl border border-adm-line bg-white p-5 text-adm-ink no-underline transition-colors hover:border-adm-blue">
                <span className="flex items-center gap-3">
                  <SponsorAvatar name={s.name} src={logoOf(s.name)} size={56} />
                  <span className="flex min-w-0 flex-col">
                    <strong className="font-display text-2xl font-black leading-7">{s.name}</strong>
                    <span className="text-[13px] text-adm-muted">
                      {s.campaigns.length} {s.campaigns.length === 1 ? "anúncio" : "anúncios"} · {liveN} no ar
                    </span>
                  </span>
                </span>

                <span className="grid grid-cols-3 gap-1.5" aria-hidden="true">
                  {ordered.slice(0, 3).map((c) => (
                    <span key={c.id} className="relative aspect-[16/10] overflow-hidden rounded-md bg-adm-line-soft">
                      {c.artUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- banner do anunciante
                        <img src={c.artUrl} alt="" className="absolute inset-0 size-full object-cover" />
                      ) : c.videoUrl && /\.(mp4|webm)(\?|$)/i.test(c.videoUrl) ? (
                        <video src={`${c.videoUrl}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 size-full object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-end bg-adm-blue-soft p-1.5 text-[9px] font-bold uppercase leading-3 text-adm-blue-dark">{c.slotName}</span>
                      )}
                    </span>
                  ))}
                </span>

                <span className="flex flex-col gap-0.5 text-[13px] text-adm-muted">
                  {artists.length > 0 && <span>Em {artists.join(" e ")}</span>}
                </span>

                <dl className="m-0 mt-auto grid grid-cols-3 gap-2 border-t border-adm-line-soft pt-3">
                  {[
                    { l: "Views", v: formatCount(s.views) },
                    { l: "Cliques", v: formatCount(s.clicks) },
                    { l: "CTR", v: pct(s.ctr) },
                  ].map((k) => (
                    <div key={k.l} className="flex flex-col">
                      <dt className="text-[11px] text-adm-muted">{k.l}</dt>
                      <dd className="m-0 font-adm-mono text-[15px] font-semibold">{k.v}</dd>
                    </div>
                  ))}
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/** Um patrocinador: a marca, os números dele e cada anúncio com banner, artista, vitrine e período. */
function Detalhe({ sponsor, logo, back }: { sponsor: AdsAnalytics["sponsors"][number]; logo: string | null; back: string }) {
  const items = [...sponsor.campaigns].sort((a, b) => ORDER[a.status] - ORDER[b.status] || b.views - a.views);
  const live = items.filter((c) => c.status === "live").length;
  const artists = [...new Set(items.map((c) => c.artist).filter(Boolean))];
  return (
    <>
      <nav aria-label="Caminho">
        <Link href={back} className="text-sm font-semibold text-adm-blue-dark">
          ← Todos os patrocinadores
        </Link>
      </nav>
      <header className="flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-adm-line bg-white p-5">
        <SponsorAvatar name={sponsor.name} src={logo} size={72} />
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="m-0 font-display text-4xl font-black leading-10">{sponsor.name}</h2>
          <span className="text-[13px] text-adm-muted">
            {sponsor.email || "—"}
            {artists.length > 0 ? ` · anuncia em ${artists.join(" e ")}` : ""}
          </span>
        </div>
        <dl className="m-0 flex flex-wrap gap-6">
          {[
            { l: "Anúncios", v: `${items.length} (${live} no ar)` },
            { l: "Views", v: formatCount(sponsor.views) },
            { l: "Cliques", v: formatCount(sponsor.clicks) },
            { l: "CTR", v: pct(sponsor.ctr) },
          ].map((k) => (
            <div key={k.l} className="flex flex-col">
              <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.l}</dt>
              <dd className="m-0 font-display text-2xl font-black leading-7">{k.v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {items.length === 0 ? (
        <AdminEmpty title="Nenhum anúncio" text="Este patrocinador ainda não tem anúncios aprovados." />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((c) => (
            <li key={c.id}>
              <AnuncioCard ad={toItem(c, sponsor.name, logo)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
