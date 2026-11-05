import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DayBars } from "@/components/admin/charts";
import { AnuncioCard } from "@/components/admin/vitrines/AnuncioCard";
import { getMyAdsAnalytics, getMySponsor } from "@/lib/api";
import { formatBRL, formatCount } from "@/lib/format";

export const metadata: Metadata = { title: "Analytics do anúncio" };

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Analytics de um anúncio: números, evolução dia a dia, meta e a tabela dos últimos dias. */
export default async function AnuncioAnalyticsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ dias?: string }> }) {
  const { id } = await params;
  const { dias } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const [ads, me] = await Promise.all([getMyAdsAnalytics(days), getMySponsor()]);
  const c = ads?.sponsors.flatMap((s) => s.campaigns).find((x) => x.id === id);
  if (!ads || !c) notFound();

  const spent = c.spentCents ?? 0;
  const share = ads.views ? (c.views * 100) / ads.views : 0;
  const goalV = c.goalViews ? Math.min(100, (c.views * 100) / c.goalViews) : null;
  const goalC = c.goalClicks ? Math.min(100, (c.clicks * 100) / c.goalClicks) : null;
  const rows = [...c.series].reverse().filter((p) => p.views || p.clicks).slice(0, 14);
  const best = [...c.series].sort((a, b) => b.views - a.views)[0];
  const kpis = [
    { label: "Visualizações", value: formatCount(c.views), note: `${pct(share)} de todos os seus anúncios` },
    { label: "Cliques", value: formatCount(c.clicks), note: `taxa de clique ${pct(c.ctr)}` },
    { label: "Investido", value: formatBRL(spent), note: "views e cliques consumidos" },
    { label: "Custo por clique", value: c.clicks ? formatBRL(Math.round(spent / c.clicks)) : "—", note: best && best.views ? `melhor dia: ${dm(best.day)} (${formatCount(best.views)} views)` : "sem dados no período" },
  ];
  const goals = [
    { l: "Visualizações", v: c.views, g: c.goalViews, p: goalV },
    { l: "Cliques", v: c.clicks, g: c.goalClicks, p: goalC },
  ].filter((x) => x.p !== null);

  return (
    <>
      <nav aria-label="Caminho" className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/patrocinador" className="text-sm font-semibold text-adm-blue-dark">
          ← Todos os anúncios
        </Link>
        <span className="flex items-center gap-2 text-sm">
          <span className="text-adm-muted">Período:</span>
          {[7, 30, 90].map((d) => (
            <Link
              key={d}
              href={`/patrocinador/anuncio/${id}?dias=${d}`}
              aria-current={days === d ? "true" : undefined}
              className={`rounded-lg border px-3 py-1.5 font-semibold no-underline ${days === d ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
            >
              {d} dias
            </Link>
          ))}
        </span>
      </nav>

      <div className="grid items-start gap-5 lg:grid-cols-[380px_1fr]">
        <AnuncioCard
          ad={{
            id: c.id,
            sponsor: me?.brand ?? "",
            sponsorLogo: me?.logo,
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
          }}
        />

        <div className="flex flex-col gap-4">
          <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2">
            {kpis.map((k) => (
              <div key={k.label} className="flex flex-col gap-1 bg-white px-5 py-4">
                <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
                <dd className="m-0 font-display text-3xl font-black leading-none">{k.value}</dd>
                <dd className="m-0 text-xs text-adm-muted">{k.note}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
            <DayBars title="Visualizações por dia" unit="visualizações" points={c.series.map((p) => ({ day: p.day, value: p.views }))} />
            <DayBars title="Cliques por dia" unit="cliques" points={c.series.map((p) => ({ day: p.day, value: p.clicks }))} />
          </div>

          {goals.length > 0 && (
            <div className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
              <h2 className="m-0 text-sm font-bold">Meta da campanha</h2>
              {goals.map((x) => (
                <div key={x.l} className="flex flex-col gap-1">
                  <span className="flex justify-between text-[13px]">
                    <span>{x.l}</span>
                    <span className="font-adm-mono">
                      {formatCount(x.v)} de {formatCount(x.g)} ({pct(x.p ?? 0)})
                    </span>
                  </span>
                  <span className="h-2 rounded-full bg-adm-line-soft">
                    <span className="block h-2 rounded-full bg-adm-blue" style={{ width: `${x.p}%` }} />
                  </span>
                </div>
              ))}
            </div>
          )}

          {rows.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
              <table className="w-full border-collapse text-sm">
                <caption className="p-4 text-left text-sm font-bold">Últimos dias</caption>
                <thead>
                  <tr className="bg-adm-bg text-left font-adm-mono text-[11px] uppercase text-adm-muted">
                    <th scope="col" className="px-4 py-2">Dia</th>
                    <th scope="col" className="px-4 py-2 text-right">Views</th>
                    <th scope="col" className="px-4 py-2 text-right">Cliques</th>
                    <th scope="col" className="px-4 py-2 text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.day} className="border-t border-adm-line-soft">
                      <td className="px-4 py-2 font-adm-mono">{dm(p.day)}</td>
                      <td className="px-4 py-2 text-right font-adm-mono">{formatCount(p.views)}</td>
                      <td className="px-4 py-2 text-right font-adm-mono">{formatCount(p.clicks)}</td>
                      <td className="px-4 py-2 text-right font-adm-mono">{p.views ? pct((p.clicks * 100) / p.views) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
