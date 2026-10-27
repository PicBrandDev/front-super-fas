"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Badge, tdClass, thClass, type Tone } from "@/components/admin/ui";
import { formatCount } from "@/lib/format";
import type { AdsAnalytics, AdsPoint } from "@/lib/types";

const PERIODS = [7, 30, 90];
const STATUS: Record<string, { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  scheduled: { label: "Agendada", tone: "info" },
  ended: { label: "Encerrada", tone: "off" },
};
const VIEWS = "#1d5fd1";
const CLICKS = "#b3541e";

const dm = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const pct = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
const sum = (pts: AdsPoint[], k: "views" | "clicks") => pts.reduce((a, p) => a + p[k], 0);
const ctrOf = (v: number, c: number) => (v ? (c * 100) / v : 0);

function niceMax(n: number) {
  if (n <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(n));
  const m = n / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** Gráfico de linha de uma medida por dia, com área leve, três marcas no eixo e dica ao passar o mouse. */
function LineChart({ title, points, k, color }: { title: string; points: AdsPoint[]; k: "views" | "clicks"; color: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();
  const W = 640;
  const H = 200;
  const L = 48;
  const R = 12;
  const T = 12;
  const B = 26;
  const max = niceMax(Math.max(0, ...points.map((p) => p[k])));
  const x = (i: number) => L + (points.length < 2 ? 0 : (i * (W - L - R)) / (points.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(" ");
  const area = points.length ? `${line} L${x(points.length - 1).toFixed(1)} ${H - B} L${x(0).toFixed(1)} ${H - B} Z` : "";
  const ticks = [0, max / 2, max];
  const labels = points.length ? [0, Math.floor((points.length - 1) / 2), points.length - 1] : [];
  const at = hover === null ? null : points[hover];

  return (
    <figure className="m-0 flex flex-col gap-2 rounded-xl border border-adm-line bg-white p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <strong className="text-[15px]">{title}</strong>
        <span className="font-adm-mono text-xs text-adm-muted">{formatCount(sum(points, k))} no período</span>
      </figcaption>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`${title}: ${formatCount(sum(points, k))} no período, de ${points.length ? dm(points[0].day) : ""} a ${points.length ? dm(points[points.length - 1].day) : ""}`}
          className="block h-auto w-full"
          onMouseLeave={() => setHover(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = ((e.clientX - r.left) / r.width) * W;
            setHover(Math.min(points.length - 1, Math.max(0, Math.round(((px - L) / (W - L - R)) * (points.length - 1)))));
          }}
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor={color} stopOpacity="0.22" />
              <stop offset="1" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--color-adm-line)" strokeWidth="1" />
              <text x={L - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-adm-muted)">
                {formatCount(Math.round(t))}
              </text>
            </g>
          ))}
          {labels.map((i, n) => (
            <text key={i} x={x(i)} y={H - 6} textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"} fontSize="11" fill="var(--color-adm-muted)">
              {dm(points[i].day)}
            </text>
          ))}
          {area && <path d={area} fill={`url(#${gid})`} />}
          {line && <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
          {hover !== null && at && (
            <g>
              <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="var(--color-adm-muted)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={x(hover)} cy={y(at[k])} r="4.5" fill={color} stroke="var(--color-adm-surface)" strokeWidth="2" />
            </g>
          )}
        </svg>
        {hover !== null && at && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-adm-line bg-white px-2.5 py-1.5 text-xs shadow-md"
            style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > points.length / 2 ? "-105%" : "5%"})` }}
          >
            <span className="block font-adm-mono text-adm-muted">{dm(at.day)}</span>
            <strong>{formatCount(at[k])}</strong>
          </div>
        )}
      </div>
    </figure>
  );
}

/** Linha mínima para a tabela: a tendência de visualizações da campanha, sem eixos. */
function Spark({ points }: { points: AdsPoint[] }) {
  const max = Math.max(1, ...points.map((p) => p.views));
  const d = points.map((p, i) => `${i ? "L" : "M"}${((i * 80) / Math.max(1, points.length - 1)).toFixed(1)} ${(22 - (p.views / max) * 20).toFixed(1)}`).join(" ");
  return (
    <svg viewBox="0 0 80 24" width="80" height="24" aria-hidden="true" className="block">
      <path d={d} fill="none" stroke={VIEWS} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex min-w-[140px] flex-col gap-0.5">
      <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{label}</dt>
      <dd className="m-0 font-display text-3xl font-black leading-9">{value}</dd>
      {note && <span className="text-xs text-adm-muted">{note}</span>}
    </div>
  );
}

/** Desempenho dos anúncios: views e cliques por dia, por patrocinador e por campanha, com o filtro de patrocinador. */
export function DesempenhoAnuncios({ data, base }: { data: AdsAnalytics; base: string }) {
  const [sel, setSel] = useState<string>("");
  const sponsors = useMemo(() => (sel ? data.sponsors.filter((s) => s.name === sel) : data.sponsors), [data, sel]);

  const series = useMemo<AdsPoint[]>(() => {
    if (!sel) return data.series;
    return data.series.map((p, i) => ({
      day: p.day,
      views: sponsors.reduce((a, s) => a + s.campaigns.reduce((b, c) => b + c.series[i].views, 0), 0),
      clicks: sponsors.reduce((a, s) => a + s.campaigns.reduce((b, c) => b + c.series[i].clicks, 0), 0),
    }));
  }, [data, sel, sponsors]);

  const views = sum(series, "views");
  const clicks = sum(series, "clicks");
  const maxSponsor = Math.max(1, ...data.sponsors.map((s) => s.views));

  if (!data.sponsors.length) return null;
  return (
    <section aria-labelledby="desempenho" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="desempenho" className="m-0 font-display text-3xl font-black">
            Desempenho dos anúncios
          </h2>
          <p className="m-0 mt-1 text-sm text-adm-muted">Visualizações e cliques de cada anúncio no app, por patrocinador. Cada pessoa conta uma vez por anúncio a cada visita.</p>
        </div>
        <nav aria-label="Período" className="flex gap-1">
          {PERIODS.map((d) => (
            <Link
              key={d}
              href={`${base}/admin/vitrines?dias=${d}`}
              scroll={false}
              aria-current={data.days === d ? "true" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline ${data.days === d ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
            >
              {d} dias
            </Link>
          ))}
        </nav>
      </div>

      <div role="group" aria-label="Patrocinador" className="flex flex-wrap gap-2">
        {[{ name: "" }, ...data.sponsors].map((s) => (
          <button
            key={s.name || "todos"}
            type="button"
            aria-pressed={sel === s.name}
            onClick={() => setSel(s.name)}
            className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-semibold ${sel === s.name ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
          >
            {s.name || "Todos os patrocinadores"}
          </button>
        ))}
      </div>

      <dl aria-label="Totais" className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4">
        <Kpi label="Visualizações" value={formatCount(views)} />
        <Kpi label="Cliques" value={formatCount(clicks)} />
        <Kpi label="Taxa de clique" value={pct(ctrOf(views, clicks))} note="cliques ÷ visualizações" />
        <Kpi label="Anúncios" value={formatCount(sponsors.reduce((a, s) => a + s.campaigns.length, 0))} />
      </dl>

      <div className="grid gap-3 lg:grid-cols-2">
        <LineChart title="Visualizações por dia" points={series} k="views" color={VIEWS} />
        <LineChart title="Cliques por dia" points={series} k="clicks" color={CLICKS} />
      </div>

      {!sel && data.sponsors.length > 1 && (
        <figure className="m-0 flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
          <figcaption className="text-[15px] font-bold">Visualizações por patrocinador</figcaption>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {data.sponsors.map((s) => (
              <li key={s.name} className="grid grid-cols-[minmax(90px,170px)_1fr_minmax(0,300px)] items-center gap-3 text-sm">
                <button type="button" onClick={() => setSel(s.name)} className="cursor-pointer truncate border-0 bg-transparent p-0 text-left font-semibold text-adm-ink">
                  {s.name}
                </button>
                <span className="h-3 rounded-r bg-adm-line-soft">
                  <span className="block h-3 rounded-r" style={{ width: `${(s.views / maxSponsor) * 100}%`, background: VIEWS }} />
                </span>
                <span className="font-adm-mono text-xs text-adm-muted">
                  {formatCount(s.views)} views · {formatCount(s.clicks)} cliques · {pct(s.ctr)}
                </span>
              </li>
            ))}
          </ul>
        </figure>
      )}

      {sponsors.map((s) => (
        <div key={s.name} className="flex flex-col gap-2">
          <h3 className="m-0 flex flex-wrap items-baseline gap-x-3 text-base font-bold">
            {s.name}
            <span className="font-adm-mono text-xs font-normal text-adm-muted">
              {formatCount(s.views)} views · {formatCount(s.clicks)} cliques · {pct(s.ctr)} de clique
            </span>
          </h3>
          <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <caption className="sr-only">Anúncios de {s.name}</caption>
              <thead>
                <tr className="bg-adm-bg">
                  <th scope="col" className={thClass}>
                    Anúncio
                  </th>
                  <th scope="col" className={thClass}>
                    Situação
                  </th>
                  <th scope="col" className={`${thClass} text-right`}>
                    Views
                  </th>
                  <th scope="col" className={`${thClass} text-right`}>
                    Cliques
                  </th>
                  <th scope="col" className={`${thClass} text-right`}>
                    Taxa
                  </th>
                  <th scope="col" className={thClass}>
                    Meta de views
                  </th>
                  <th scope="col" className={thClass}>
                    Por dia
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.campaigns.map((c) => {
                  const goal = c.goalViews ? Math.min(100, Math.round((c.views * 100) / c.goalViews)) : null;
                  return (
                    <tr key={c.id}>
                      <td className={tdClass}>
                        <strong className="block text-[15px]">{c.title}</strong>
                        <span className="block text-[13px] text-adm-muted">
                          {c.slotName} · {c.fanClub ?? "Ambiente"}
                          {c.where ? ` · ${c.where}` : ""}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <Badge tone={STATUS[c.status].tone}>{STATUS[c.status].label}</Badge>
                      </td>
                      <td className={`${tdClass} text-right font-adm-mono`}>{formatCount(c.views)}</td>
                      <td className={`${tdClass} text-right font-adm-mono`}>{formatCount(c.clicks)}</td>
                      <td className={`${tdClass} text-right font-adm-mono`}>{pct(c.ctr)}</td>
                      <td className={tdClass}>
                        {goal === null ? (
                          <span className="text-adm-muted">Sem meta</span>
                        ) : (
                          <span className="flex min-w-[120px] flex-col gap-1">
                            <span className="h-2 rounded bg-adm-line-soft">
                              <span className="block h-2 rounded" style={{ width: `${goal}%`, background: VIEWS }} />
                            </span>
                            <span className="text-xs text-adm-muted">
                              {goal}% de {formatCount(c.goalViews)}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <Spark points={c.series} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
}
