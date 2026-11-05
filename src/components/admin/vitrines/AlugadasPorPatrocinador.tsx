import { Badge, SlotDiagram, type Tone } from "@/components/admin/ui";
import { formatBRL, formatCount } from "@/lib/format";
import type { Rental } from "@/lib/types";
import { SponsorAvatar } from "./SponsorAvatar";

const dm = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");
const status: Record<Rental["status"], { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  scheduled: { label: "Agendada", tone: "info" },
  ended: { label: "Encerrada", tone: "off" },
};
const ORDER: Record<Rental["status"], number> = { live: 0, scheduled: 1, ended: 2 };
const pct = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";

function duration(days: number | null) {
  if (!days) return "";
  return `${days} ${days === 1 ? "dia" : "dias"}`;
}

/**
 * As vitrines alugadas agrupadas por patrocinador: cada marca com a foto, o total de visualizações e cliques e, embaixo,
 * cada vitrine que ela comprou, com o período (de tal dia até tal dia) e o que essa compra rendeu em views e cliques.
 */
export function AlugadasPorPatrocinador({ rentals }: { rentals: Rental[] }) {
  const groups = new Map<string, Rental[]>();
  for (const r of rentals) groups.set(r.sponsor, [...(groups.get(r.sponsor) ?? []), r]);
  const list = [...groups.entries()]
    .map(([name, items]) => {
      const views = items.reduce((a, r) => a + (r.views ?? 0), 0);
      const clicks = items.reduce((a, r) => a + (r.clicks ?? 0), 0);
      return {
        name,
        avatar: items.find((r) => r.sponsorAvatar)?.sponsorAvatar ?? null,
        items: [...items].sort((a, b) => ORDER[a.status] - ORDER[b.status] || (a.start ?? "").localeCompare(b.start ?? "")),
        views,
        clicks,
        ctr: views ? (clicks * 100) / views : 0,
        total: items.reduce((a, r) => a + (r.estimatedTotalCents ?? 0), 0),
        live: items.filter((r) => r.status === "live").length,
      };
    })
    .sort((a, b) => b.live - a.live || b.views - a.views);

  return (
    <div className="flex flex-col gap-4">
      {list.map((g) => (
        <section key={g.name} aria-labelledby={`sp-${g.name}`} className="overflow-hidden rounded-xl border border-adm-line bg-white">
          <header className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-adm-line-soft bg-adm-bg px-5 py-4">
            <SponsorAvatar name={g.name} src={g.avatar} size={52} />
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 id={`sp-${g.name}`} className="m-0 text-xl font-bold leading-6">
                {g.name}
              </h2>
              <span className="text-[13px] text-adm-muted">
                {g.items.length} {g.items.length === 1 ? "vitrine" : "vitrines"}
                {g.live > 0 ? ` · ${g.live} no ar agora` : ""}
                {g.total > 0 ? ` · ${formatBRL(g.total)} consumidos` : ""}
              </span>
            </div>
            <dl className="m-0 flex gap-6">
              {[
                { label: "Visualizações", value: formatCount(g.views) },
                { label: "Cliques", value: formatCount(g.clicks) },
                { label: "Taxa de clique", value: pct(g.ctr) },
              ].map((k) => (
                <div key={k.label} className="flex flex-col">
                  <dt className="font-adm-mono text-[10px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
                  <dd className="m-0 font-display text-2xl font-black leading-7">{k.value}</dd>
                </div>
              ))}
            </dl>
          </header>

          <ul className="m-0 list-none p-0">
            {g.items.map((r, i) => (
              <li key={r.campaignId ?? `${r.slotName}-${r.start}-${i}`} className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-adm-line-soft px-5 py-3.5 last:border-b-0">
                <SlotDiagram small top={Math.round(r.diagramTop * 0.9)} height={Math.round(r.diagramHeight * 0.9)} />
                <div className="flex min-w-[200px] flex-1 flex-col">
                  <strong className="text-[15px]">{r.slotName}</strong>
                  <span className="text-[13px] text-adm-muted">
                    {r.fanClub ?? "Ambiente"}
                    {r.where ? ` · ${r.where}` : ""}
                  </span>
                  {r.title && <span className="text-[13px] text-adm-muted">“{r.title}”</span>}
                </div>
                <div className="flex min-w-[170px] flex-col">
                  <span className="font-adm-mono text-[13px] font-semibold">
                    {dm(r.start)} a {dm(r.end)}
                  </span>
                  <span className="text-[12px] text-adm-muted">
                    {duration(r.days)}
                    {r.estimatedTotalCents ? ` · ${formatBRL(r.estimatedTotalCents)} consumidos` : ""}
                  </span>
                </div>
                <Badge tone={status[r.status].tone}>{status[r.status].label}</Badge>
                <dl className="m-0 flex min-w-[210px] justify-end gap-5">
                  {[
                    { label: "Views", value: formatCount(r.views ?? 0) },
                    { label: "Cliques", value: formatCount(r.clicks ?? 0) },
                    { label: "CTR", value: pct(r.ctr ?? 0) },
                  ].map((k) => (
                    <div key={k.label} className="flex flex-col items-end">
                      <dt className="text-[11px] text-adm-muted">{k.label}</dt>
                      <dd className="m-0 font-adm-mono text-[15px] font-semibold">{k.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
