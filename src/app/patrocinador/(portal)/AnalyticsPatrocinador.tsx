import { DayBars, HBars } from "@/components/admin/charts";
import { formatBRL, formatCount } from "@/lib/format";
import type { AdsAnalytics } from "@/lib/types";

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** Analytics da marca: totais, evolução por dia, onde os anúncios rendem mais (cantor e vitrine) e o ranking de anúncios. */
export function AnalyticsPatrocinador({ ads }: { ads: AdsAnalytics }) {
  const camps = ads.sponsors.flatMap((s) => s.campaigns);
  const spent = ads.spentCents ?? 0;
  const sum = (key: (c: (typeof camps)[number]) => string, by: "views" | "clicks" = "views") => {
    const m = new Map<string, number>();
    for (const c of camps) m.set(key(c), (m.get(key(c)) ?? 0) + c[by]);
    return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  };
  const byArtist = sum((c) => c.artist ?? "—");
  const bySlot = sum((c) => c.slotName);
  const ranked = [...camps].sort((a, b) => b.views - a.views);
  const kpis = [
    { label: "Visualizações", value: formatCount(ads.views), note: `últimos ${ads.days} dias` },
    { label: "Cliques", value: formatCount(ads.clicks), note: `taxa de clique ${pct(ads.ctr)}` },
    { label: "Investido", value: formatBRL(spent), note: "views e cliques consumidos" },
    { label: "Custo por clique", value: ads.clicks ? formatBRL(Math.round(spent / ads.clicks)) : "—", note: "média no período" },
  ];
  return (
    <section aria-label="Analytics dos seus anúncios" className="flex flex-col gap-4">
      <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
            <dd className="m-0 font-display text-3xl font-black leading-none">{k.value}</dd>
            <dd className="m-0 text-xs text-adm-muted">{k.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
          <DayBars title="Visualizações por dia" unit="visualizações" points={ads.series.map((p) => ({ day: p.day, value: p.views }))} />
          <DayBars title="Cliques por dia" unit="cliques" points={ads.series.map((p) => ({ day: p.day, value: p.clicks }))} />
        </div>
        <div className="flex flex-col gap-5 rounded-xl border border-adm-line bg-white p-5">
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-sm font-bold">Visualizações por cantor</h3>
            <HBars rows={byArtist} />
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-sm font-bold">Visualizações por vitrine</h3>
            <HBars rows={bySlot} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <caption className="p-4 text-left text-sm font-bold">Ranking dos anúncios</caption>
          <thead>
            <tr className="bg-adm-bg text-left font-adm-mono text-[11px] uppercase text-adm-muted">
              <th scope="col" className="px-4 py-2">Anúncio</th>
              <th scope="col" className="px-4 py-2">Cantor e vitrine</th>
              <th scope="col" className="px-4 py-2 text-right">Views</th>
              <th scope="col" className="px-4 py-2 text-right">Cliques</th>
              <th scope="col" className="px-4 py-2 text-right">CTR</th>
              <th scope="col" className="px-4 py-2 text-right">Investido</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((c) => (
              <tr key={c.id} className="border-t border-adm-line-soft">
                <td className="px-4 py-2.5">
                  <span className="flex items-center gap-3">
                    {c.artUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- banner do anúncio
                      <img src={c.artUrl} alt="" className="h-[72px] w-28 flex-none rounded-lg object-cover" />
                    ) : c.videoUrl && /\.(mp4|webm)(\?|$)/i.test(c.videoUrl) ? (
                      <video src={`${c.videoUrl}#t=0.5`} preload="metadata" muted playsInline aria-hidden="true" className="h-[72px] w-28 flex-none rounded-lg bg-adm-line-soft object-cover" />
                    ) : (
                      <span aria-hidden="true" className="h-[72px] w-28 flex-none rounded-lg bg-adm-line-soft" />
                    )}
                    <strong className="font-semibold">{c.title}</strong>
                  </span>
                </td>
                <td className="px-4 py-2.5 text-[13px]">
                  <strong>{c.artist ?? "—"}</strong>
                  <span className="block text-adm-muted">{c.slotName}</span>
                </td>
                <td className="px-4 py-2.5 text-right font-adm-mono">{formatCount(c.views)}</td>
                <td className="px-4 py-2.5 text-right font-adm-mono">{formatCount(c.clicks)}</td>
                <td className="px-4 py-2.5 text-right font-adm-mono">{pct(c.ctr)}</td>
                <td className="px-4 py-2.5 text-right font-adm-mono">{formatBRL(c.spentCents ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
