import type { Metadata } from "next";
import Link from "next/link";
import { campaignWhere } from "@/app/admin/midia/slots";
import { HBars } from "@/components/admin/charts";
import { AdminEmpty, Badge, btnPrimary, type Tone } from "@/components/admin/ui";
import { getMyCampaigns, getSession } from "@/lib/api";
import { formatBRL, formatCount } from "@/lib/format";
import { campaignStats, sumStats } from "@/lib/sponsor-stats";
import type { CampaignStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Minhas campanhas" };

const look: Record<CampaignStatus, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  approved: { label: "Aprovada", tone: "info" },
  pending: { label: "Aguardando aprovação", tone: "warn" },
  rejected: { label: "Recusada", tone: "off" },
};

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** Entrada do portal: as campanhas do patrocinador com visualizações, cliques e de onde vem o público. */
export default async function MinhasCampanhasPage() {
  const session = await getSession();
  const notSponsor = !!session && session.role !== "sponsor";
  const campaigns = notSponsor ? [] : await getMyCampaigns();
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

          <section aria-labelledby="lista" className="flex flex-col gap-3">
            <h2 id="lista" className="m-0 text-base font-bold">
              Suas campanhas
            </h2>
            <ul className="m-0 grid list-none gap-3.5 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(360px,100%),1fr))]">
              {rows.map(({ c, s }) => {
                const where = campaignWhere(c);
                return (
                  <li key={c.id} className="flex flex-col gap-3.5 rounded-[14px] border border-adm-line bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block text-base">{c.title}</strong>
                        <span className="block text-[13px] text-adm-muted">
                          {c.slotName} · {where.place}
                          {where.artist ? ` · ${where.artist}` : ""}
                        </span>
                        <span className="block font-adm-mono text-xs text-adm-muted">{c.period}</span>
                        {c.targetCity ? (
                          <span className="block text-xs text-adm-muted">
                            {c.targetRadiusKm ? `${c.targetRadiusKm} km ao redor de ${c.targetCity}` : "País todo"}
                            {c.budgetCents ? ` · ${formatBRL(c.budgetCents)}` : ""}
                          </span>
                        ) : null}
                      </div>
                      <Badge tone={look[c.status].tone}>{look[c.status].label}</Badge>
                    </div>
                    {s.views > 0 ? (
                      <>
                        <dl className="m-0 grid grid-cols-3 gap-2">
                          {[
                            ["Visualizações", formatCount(s.views)],
                            ["Cliques", formatCount(s.clicks)],
                            ["Taxa", pct(s.ctr)],
                          ].map(([k, v]) => (
                            <div key={k} className="rounded-[10px] bg-adm-bg p-2.5">
                              <dt className="font-adm-mono text-[10px] font-semibold uppercase text-adm-muted">{k}</dt>
                              <dd className="m-0 text-lg font-bold">{v}</dd>
                            </div>
                          ))}
                        </dl>
                        <p className="m-0 text-[13px] text-adm-muted">
                          Maior parte do público: <strong className="text-adm-ink">{s.cities[0].label}</strong>, depois {s.cities[1].label} e {s.cities[2].label}.
                        </p>
                      </>
                    ) : (
                      <p className="m-0 text-[13px] text-adm-muted">Os números aparecem quando a campanha for aprovada e for ao ar.</p>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="m-0 text-xs text-adm-muted">Números de exemplo: a medição real entra quando os anúncios forem ao ar.</p>
          </section>
        </>
      )}
    </>
  );
}
