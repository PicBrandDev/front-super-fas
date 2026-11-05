import type { Metadata } from "next";
import Link from "next/link";
import { HBars } from "@/components/admin/charts";
import { AdminEmpty, Badge, btnPrimary, type Tone } from "@/components/admin/ui";
import { AnuncioCard, type AnuncioStatus } from "@/components/admin/vitrines/AnuncioCard";
import { getMyAdsAnalytics, getMyCampaigns, getMySponsor, getSession } from "@/lib/api";
import { formatBRL, formatCount } from "@/lib/format";
import { AnalyticsPatrocinador } from "./AnalyticsPatrocinador";
import { campaignStats, sumStats } from "@/lib/sponsor-stats";
import type { Campaign, CampaignStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Minhas campanhas" };

const _look: Record<CampaignStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  approved: { label: "Aprovada", tone: "info" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusada", tone: "off" },
};

/** A API diz "approved" tanto para a campanha agendada quanto para a já encerrada. */
const phase = (c: Campaign): AnuncioStatus => {
  const today = new Date().toISOString().slice(0, 10);
  return c.status === "approved" ? (c.end && c.end < today ? "ended" : c.start && c.start > today ? "scheduled" : "live") : c.status;
};

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** Entrada do portal: as campanhas do patrocinador com visualizações, cliques e de onde vem o público. */
export default async function MinhasCampanhasPage() {
  const session = await getSession();
  const notSponsor = !!session && session.role !== "sponsor";
  const [campaigns, me] = await Promise.all([notSponsor ? Promise.resolve([]) : getMyCampaigns(), notSponsor ? Promise.resolve(null) : getMySponsor()]);
  const logo = me?.logo ?? null;
  const ads = notSponsor ? null : await getMyAdsAnalytics(30);
  const stat = new Map((ads?.sponsors ?? []).flatMap((x) => x.campaigns).map((x) => [x.id, x]));
  const rows = campaigns.map((c) => ({ c, s: campaignStats(c) }));
  const total = sumStats(rows.map((r) => r.s));
  const topCities = total.cities.slice(0, 6);
  const cityTotal = total.cities.reduce((a, c) => a + c.value, 0) || 1;

  const kpis = [
    { label: "Campanhas", value: formatCount(campaigns.length) },
    { label: "Visualizações", value: formatCount(total.views) },
    { label: "Cliques", value: formatCount(total.clicks) },
    { label: "Taxa de cliques", value: total.views ? pct(total.ctr) : "—" },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 text-[28px] font-bold">Minhas campanhas</h1>
          <p className="m-0 text-[15px] text-adm-muted">Visualizações, cliques e o público de cada anúncio.</p>
        </div>
        <Link href="/patrocinador/nova" className={`${btnPrimary} no-underline`}>
          Nova campanha
        </Link>
      </div>

      {notSponsor ? (
        <AdminEmpty title="Só para contas de patrocinador" text="Esta tela mostra as campanhas de uma conta de patrocinador." />
      ) : campaigns.length === 0 ? (
        <AdminEmpty
          title="Nenhuma campanha ainda"
          text="Monte seu primeiro anúncio: escolha a vitrine e preencha o anúncio."
          action={
            <Link href="/patrocinador/nova" className={`${btnPrimary} no-underline`}>
              Nova campanha
            </Link>
          }
        />
      ) : (
        <>
          {ads && ads.sponsors.length > 0 ? (
            <AnalyticsPatrocinador ads={ads} />
          ) : (
            <>
          <dl aria-label="Resumo" className="m-0 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
            {kpis.map((k) => (
              <div key={k.label} className="flex flex-col gap-1 rounded-xl border border-adm-line bg-white p-4">
                <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
                <dd className="m-0 text-[28px] font-bold leading-8">{k.value}</dd>
              </div>
            ))}
          </dl>

          {topCities.length > 0 && (
            <section aria-labelledby="publico" className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
              <h2 id="publico" className="m-0 text-base font-bold">
                De onde vem o público
              </h2>
              <p className="m-0 text-sm text-adm-muted">
                A maior parte vem de <strong className="text-adm-ink">{topCities[0].label}</strong> ({pct((topCities[0].value / cityTotal) * 100)} das visualizações).
              </p>
              <HBars rows={topCities} />
            </section>
          )}

            </>
          )}

          <section aria-labelledby="lista" className="flex flex-col gap-3">
            <h2 id="lista" className="m-0 text-base font-bold">
              Suas campanhas
            </h2>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 xl:grid-cols-3">
              {rows.map(({ c, s }) => (
                <li key={c.id}>
                  <AnuncioCard
                    ad={{
                      id: c.id,
                      href: `/patrocinador/anuncio/${c.id}`,
                      sponsor: c.sponsor,
                      sponsorLogo: logo,
                      title: c.title,
                      text: c.text,
                      cta: c.cta,
                      artUrl: c.artUrl,
                      videoUrl: c.videoUrl,
                      status: phase(c),
                      slotName: c.slotName,
                      artist: c.club,
                      fanClub: c.fanClub,
                      start: c.start,
                      end: c.end,
                      views: stat.get(c.id)?.views ?? c.views ?? s.views,
                      clicks: stat.get(c.id)?.clicks ?? c.clicks ?? s.clicks,
                      series: stat.get(c.id)?.series.map((p) => p.views),
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
