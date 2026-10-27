"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { formatCount } from "@/lib/format";
import type { AdsAnalytics, AdsPoint } from "@/lib/types";

const PERIODS = [7, 30, 90];
const VIEWS = "#1d5fd1";
const CLICKS = "#b3541e";

const dm = (iso: string) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const pct = (n: number) =>
  n.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%";
const sum = (pts: AdsPoint[], k: "views" | "clicks") =>
  pts.reduce((a, p) => a + p[k], 0);
const ctrOf = (v: number, c: number) => (v ? (c * 100) / v : 0);

function niceMax(n: number) {
  if (n <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(n));
  const m = n / p;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

/** Gráfico de linha de uma medida por dia, com área leve, três marcas no eixo e dica ao passar o mouse. */
function LineChart({
  title,
  points,
  k,
  color,
}: {
  title: string;
  points: AdsPoint[];
  k: "views" | "clicks";
  color: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();
  const W = 640;
  const H = 200;
  const L = 48;
  const R = 12;
  const T = 12;
  const B = 26;
  const max = niceMax(Math.max(0, ...points.map((p) => p[k])));
  const x = (i: number) =>
    L + (points.length < 2 ? 0 : (i * (W - L - R)) / (points.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const line = points
    .map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`)
    .join(" ");
  const area = points.length
    ? `${line} L${x(points.length - 1).toFixed(1)} ${H - B} L${x(0).toFixed(1)} ${H - B} Z`
    : "";
  const ticks = [0, max / 2, max];
  const labels = points.length
    ? [0, Math.floor((points.length - 1) / 2), points.length - 1]
    : [];
  const at = hover === null ? null : points[hover];

  return (
    <figure className="m-0 flex flex-col gap-2 rounded-xl border border-adm-line bg-white p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <strong className="text-[15px]">{title}</strong>
        <span className="font-adm-mono text-xs text-adm-muted">
          {formatCount(sum(points, k))} no período
        </span>
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
            setHover(
              Math.min(
                points.length - 1,
                Math.max(
                  0,
                  Math.round(((px - L) / (W - L - R)) * (points.length - 1)),
                ),
              ),
            );
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
              <line
                x1={L}
                x2={W - R}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-adm-line)"
                strokeWidth="1"
              />
              <text
                x={L - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-adm-muted)"
              >
                {formatCount(Math.round(t))}
              </text>
            </g>
          ))}
          {labels.map((i, n) => (
            <text
              key={i}
              x={x(i)}
              y={H - 6}
              textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"}
              fontSize="11"
              fill="var(--color-adm-muted)"
            >
              {dm(points[i].day)}
            </text>
          ))}
          {area && <path d={area} fill={`url(#${gid})`} />}
          {line && (
            <path
              d={line}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}
          {hover !== null && at && (
            <g>
              <line
                x1={x(hover)}
                x2={x(hover)}
                y1={T}
                y2={H - B}
                stroke="var(--color-adm-muted)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={x(hover)}
                cy={y(at[k])}
                r="4.5"
                fill={color}
                stroke="var(--color-adm-surface)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
        {hover !== null && at && (
          <div
            className="pointer-events-none absolute top-0 rounded-lg border border-adm-line bg-white px-2.5 py-1.5 text-xs shadow-md"
            style={{
              left: `${(x(hover) / W) * 100}%`,
              transform: `translateX(${hover > points.length / 2 ? "-105%" : "5%"})`,
            }}
          >
            <span className="block font-adm-mono text-adm-muted">
              {dm(at.day)}
            </span>
            <strong>{formatCount(at[k])}</strong>
          </div>
        )}
      </div>
    </figure>
  );
}

const PALETTE = [
  "#1d5fd1",
  "#b3541e",
  "#0f8a7a",
  "#7b4bc4",
  "#b8860b",
  "#c2417c",
];
const OTHERS = "#6b7280";
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type Slice = { label: string; value: number; color: string };
type Row = { label: string; sub?: string; value: number };

/** Rosca com a participação de cada item no total (até 6 itens; o resto vira "Outros"), com legenda ao lado. */
function Donut({
  title,
  slices,
  total,
}: {
  title: string;
  slices: Slice[];
  total: number;
}) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const offsets = slices.map((_, i) =>
    slices.slice(0, i).reduce((a, x) => a + (x.value / total) * C, 0),
  );
  return (
    <figure className="m-0 flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
      <figcaption className="text-[15px] font-bold">{title}</figcaption>
      {total === 0 ? (
        <p className="m-0 text-sm text-adm-muted">
          Sem visualizações no período.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-5">
          <svg
            viewBox="0 0 180 180"
            role="img"
            aria-label={`${title}: ${slices.map((s) => `${s.label} ${pct((s.value * 100) / total)}`).join(", ")}`}
            className="size-[170px] flex-none"
          >
            <g transform="rotate(-90 90 90)">
              {slices.map((s, i) => {
                const len = (s.value / total) * C;
                return (
                  <circle
                    key={s.label}
                    cx="90"
                    cy="90"
                    r={R}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="26"
                    strokeDasharray={`${Math.max(0, len - 2)} ${C}`}
                    strokeDashoffset={-offsets[i]}
                  />
                );
              })}
            </g>
            <text
              x="90"
              y="88"
              textAnchor="middle"
              fontSize="20"
              fontWeight="800"
              fill="var(--color-adm-ink)"
            >
              {formatCount(total)}
            </text>
            <text
              x="90"
              y="106"
              textAnchor="middle"
              fontSize="11"
              fill="var(--color-adm-muted)"
            >
              views
            </text>
          </svg>
          <ul className="m-0 flex min-w-[160px] flex-1 list-none flex-col gap-2 p-0 text-sm">
            {slices.map((s) => (
              <li key={s.label} className="flex items-center gap-2">
                <span
                  className="size-3 flex-none rounded-sm"
                  style={{ background: s.color }}
                />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="font-adm-mono text-xs text-adm-muted">
                  {pct((s.value * 100) / total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

/** Colunas com o total de visualizações em cada dia da semana (mostra quando o público mais vê os anúncios). */
function WeekChart({ title, series }: { title: string; series: AdsPoint[] }) {
  const totals = DAYS.map((_, d) =>
    series
      .filter((p) => new Date(p.day + "T12:00:00").getDay() === d)
      .reduce((a, p) => a + p.views, 0),
  );
  const max = Math.max(1, ...totals);
  const best = totals.indexOf(Math.max(...totals));
  return (
    <figure className="m-0 flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <strong className="text-[15px]">{title}</strong>
        {Math.max(...totals) > 0 && (
          <span className="font-adm-mono text-xs text-adm-muted">
            melhor dia: {DAYS[best]}
          </span>
        )}
      </figcaption>
      <ul
        className="m-0 grid h-[170px] list-none grid-cols-7 gap-2 p-0"
        aria-label={title}
      >
        {totals.map((t, d) => (
          <li
            key={d}
            className="flex h-full flex-col items-center justify-end gap-1"
            title={`${DAYS[d]}: ${formatCount(t)} views`}
          >
            <span className="font-adm-mono text-[11px] text-adm-muted">
              {formatCount(t)}
            </span>
            <span
              className="w-full rounded-t"
              style={{
                height: `${(t / max) * 120}px`,
                minHeight: 2,
                background: VIEWS,
                opacity: d === best ? 1 : 0.45,
              }}
            />
            <span className="text-xs font-semibold">{DAYS[d]}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

/** Barras horizontais ordenadas, uma por item, com o valor no fim. */
function BarsCard({
  title,
  rows,
  fmt,
  color,
  note,
}: {
  title: string;
  rows: Row[];
  fmt: (n: number) => string;
  color: string;
  note?: string;
}) {
  const max = Math.max(0.0001, ...rows.map((r) => r.value));
  return (
    <figure className="m-0 flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
      <figcaption className="flex items-baseline justify-between gap-2">
        <strong className="text-[15px]">{title}</strong>
        {note && <span className="text-xs text-adm-muted">{note}</span>}
      </figcaption>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {rows.map((r) => (
          <li
            key={r.label + (r.sub ?? "")}
            className="flex flex-col gap-1 text-sm"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 truncate">
                <strong>{r.label}</strong>
                {r.sub && (
                  <span className="text-xs text-adm-muted"> · {r.sub}</span>
                )}
              </span>
              <span className="flex-none font-adm-mono text-xs">
                {fmt(r.value)}
              </span>
            </span>
            <span className="h-2.5 rounded-r bg-adm-line-soft">
              <span
                className="block h-2.5 rounded-r"
                style={{
                  width: `${(r.value / max) * 100}%`,
                  background: color,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

function Kpi({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-0.5">
      <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">
        {label}
      </dt>
      <dd className="m-0 font-display text-3xl font-black leading-9">
        {value}
      </dd>
      {note && <span className="text-xs text-adm-muted">{note}</span>}
    </div>
  );
}

/** Desempenho dos anúncios: views e cliques por dia, por patrocinador e por campanha, com o filtro de patrocinador. */
export function DesempenhoAnuncios({
  data,
  base,
}: {
  data: AdsAnalytics;
  base: string;
}) {
  const [sel, setSel] = useState<string>("");
  const sponsors = useMemo(
    () => (sel ? data.sponsors.filter((s) => s.name === sel) : data.sponsors),
    [data, sel],
  );

  const series = useMemo<AdsPoint[]>(() => {
    if (!sel) return data.series;
    return data.series.map((p, i) => ({
      day: p.day,
      views: sponsors.reduce(
        (a, s) => a + s.campaigns.reduce((b, c) => b + c.series[i].views, 0),
        0,
      ),
      clicks: sponsors.reduce(
        (a, s) => a + s.campaigns.reduce((b, c) => b + c.series[i].clicks, 0),
        0,
      ),
    }));
  }, [data, sel, sponsors]);

  const views = sum(series, "views");
  const clicks = sum(series, "clicks");
  const campaigns = sponsors.flatMap((s) =>
    s.campaigns.map((c) => ({ ...c, sponsor: s.name })),
  );
  const slices = useMemo<Slice[]>(() => {
    const src = sel
      ? campaigns.map((c) => ({ label: c.title, value: c.views }))
      : data.sponsors.map((s) => ({ label: s.name, value: s.views }));
    const top = src
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
    const shown = top.slice(0, 6).map((x, i) => ({ ...x, color: PALETTE[i] }));
    const rest = top.slice(6).reduce((a, x) => a + x.value, 0);
    return rest
      ? [...shown, { label: "Outros", value: rest, color: OTHERS }]
      : shown;
  }, [campaigns, data.sponsors, sel]);
  const byCtr: Row[] = campaigns
    .filter((c) => c.views > 0)
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 8)
    .map((c) => ({ label: c.title, sub: c.sponsor, value: c.ctr }));
  const places = new Map<string, number>();
  for (const c of campaigns) {
    const k = `${c.slotName}|${c.fanClub ?? "Ambiente"}`;
    places.set(k, (places.get(k) ?? 0) + c.views);
  }
  const byPlace: Row[] = [...places.entries()]
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([k, v]) => ({
      label: k.split("|")[0],
      sub: k.split("|")[1],
      value: v,
    }));
  const maxSponsor = Math.max(1, ...data.sponsors.map((s) => s.views));

  if (!data.sponsors.length) return null;
  return (
    <section aria-labelledby="desempenho" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="desempenho" className="m-0 font-display text-3xl font-black">
            Desempenho dos anúncios
          </h2>
          <p className="m-0 mt-1 text-sm text-adm-muted">
            Visualizações e cliques de cada anúncio no app, por patrocinador.
            Cada pessoa conta uma vez por anúncio a cada visita.
          </p>
        </div>
        <nav aria-label="Período" className="flex gap-1">
          {PERIODS.map((d) => (
            <Link
              key={d}
              href={`${base}/admin/vitrines?aba=desempenho&dias=${d}`}
              scroll={false}
              aria-current={data.days === d ? "true" : undefined}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline ${data.days === d ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
            >
              {d} dias
            </Link>
          ))}
        </nav>
      </div>

      <div
        role="group"
        aria-label="Patrocinador"
        className="flex flex-wrap gap-2"
      >
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

      <dl
        aria-label="Totais"
        className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4"
      >
        <Kpi label="Visualizações" value={formatCount(views)} />
        <Kpi label="Cliques" value={formatCount(clicks)} />
        <Kpi
          label="Taxa de clique"
          value={pct(ctrOf(views, clicks))}
          note="cliques ÷ visualizações"
        />
        <Kpi
          label="Anúncios"
          value={formatCount(
            sponsors.reduce((a, s) => a + s.campaigns.length, 0),
          )}
        />
      </dl>

      <div className="grid gap-3 lg:grid-cols-2">
        <LineChart
          title="Visualizações por dia"
          points={series}
          k="views"
          color={VIEWS}
        />
        <LineChart
          title="Cliques por dia"
          points={series}
          k="clicks"
          color={CLICKS}
        />
      </div>

      {!sel && data.sponsors.length > 1 && (
        <figure className="m-0 flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
          <figcaption className="text-[15px] font-bold">
            Visualizações por patrocinador
          </figcaption>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {data.sponsors.map((s) => (
              <li
                key={s.name}
                className="grid grid-cols-[minmax(90px,170px)_1fr_minmax(0,300px)] items-center gap-3 text-sm"
              >
                <button
                  type="button"
                  onClick={() => setSel(s.name)}
                  className="cursor-pointer truncate border-0 bg-transparent p-0 text-left font-semibold text-adm-ink"
                >
                  {s.name}
                </button>
                <span className="h-3 rounded-r bg-adm-line-soft">
                  <span
                    className="block h-3 rounded-r"
                    style={{
                      width: `${(s.views / maxSponsor) * 100}%`,
                      background: VIEWS,
                    }}
                  />
                </span>
                <span className="font-adm-mono text-xs text-adm-muted">
                  {formatCount(s.views)} views · {formatCount(s.clicks)} cliques
                  · {pct(s.ctr)}
                </span>
              </li>
            ))}
          </ul>
        </figure>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <Donut
          title={
            sel
              ? `Visualizações de ${sel} por anúncio`
              : "Participação nas visualizações"
          }
          slices={slices}
          total={views}
        />
        <WeekChart title="Visualizações por dia da semana" series={series} />
        <BarsCard
          title="Taxa de clique por anúncio"
          rows={byCtr}
          fmt={pct}
          color={CLICKS}
          note="cliques ÷ visualizações"
        />
        <BarsCard
          title="Visualizações por local no app"
          rows={byPlace}
          fmt={formatCount}
          color={VIEWS}
        />
      </div>
    </section>
  );
}
