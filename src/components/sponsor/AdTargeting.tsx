"use client";

import { formatBRL } from "@/lib/format";
import { MAX_RADIUS_KM, TARGET_CITIES, adPrice, suggestGoals } from "@/lib/ad-pricing";
import { inputClass } from "@/components/admin/ui";

export type Targeting = { city: string; radiusKm: number; views: number; clicks: number };

const range = "h-2 w-full cursor-pointer accent-adm-blue";

/** Cidade + raio em km: o círculo do mapa cresce junto com o raio (0 km = o país todo). */
export function RadiusPicker({ value, onChange }: { value: Targeting; onChange: (t: Targeting) => void }) {
  const all = value.radiusKm === 0;
  // diâmetro do círculo: de 22% a 92% do quadro, em escala logarítmica
  const size = all ? 100 : 22 + 70 * (Math.log(1 + value.radiusKm / 25) / Math.log(1 + MAX_RADIUS_KM / 25));
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ad-city" className="text-[13px] font-semibold">
            Cidade
          </label>
          <select id="ad-city" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} className={inputClass}>
            {TARGET_CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ad-radius" className="flex items-baseline justify-between text-[13px] font-semibold">
            Raio de alcance
            <span className="font-adm-mono text-[13px]">{all ? "País todo" : `${value.radiusKm} km`}</span>
          </label>
          <input
            id="ad-radius"
            type="range"
            min={10}
            max={MAX_RADIUS_KM + 50}
            step={10}
            value={all ? MAX_RADIUS_KM + 50 : value.radiusKm}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({ ...value, radiusKm: n > MAX_RADIUS_KM ? 0 : n });
            }}
            className={range}
          />
          <span className="flex justify-between font-adm-mono text-[11px] text-adm-muted">
            <span>10 km</span>
            <span>{MAX_RADIUS_KM} km</span>
            <span>país todo</span>
          </span>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="relative h-40 overflow-hidden rounded-xl border border-adm-line bg-adm-bg [background-image:linear-gradient(var(--color-adm-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-adm-line)_1px,transparent_1px)] [background-size:28px_28px]"
      >
        <span
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-adm-blue bg-adm-blue/15 transition-[width,height] duration-200"
          style={{ width: `${(size / 100) * 160}px`, height: `${(size / 100) * 160}px` }}
        />
        <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-adm-blue shadow" />
        <span className="absolute bottom-2 left-3 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-semibold">{value.city}</span>
      </div>
      <p className="m-0 text-xs text-adm-muted">
        {all ? "O anúncio aparece para fãs de todo o país." : `O anúncio aparece para fãs até ${value.radiusKm} km de ${value.city}.`}
      </p>
    </div>
  );
}

/** Calculadora: o valor sobe com o raio, a vitrine, o tempo e as metas de visualizações e cliques. */
export function PriceCalculator({
  value,
  onChange,
  weeklyCents,
  weeks,
}: {
  value: Targeting;
  onChange: (t: Targeting) => void;
  weeklyCents?: number | null;
  weeks: number;
}) {
  const { lines, total } = adPrice({ weeklyCents, weeks, radiusKm: value.radiusKm, views: value.views, clicks: value.clicks });
  const sug = suggestGoals(value.radiusKm, weeks);
  const ctr = value.views ? (value.clicks / value.views) * 100 : 0;
  const same = sug.views === value.views && sug.clicks === value.clicks;
  const maxClicks = Math.max(200, Math.round(value.views * 0.1));
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="goal-views" className="flex items-baseline justify-between text-[13px] font-semibold">
            Visualizações que quero
            <span className="font-adm-mono text-[13px]">{value.views.toLocaleString("pt-BR")}</span>
          </label>
          <input
            id="goal-views"
            type="range"
            min={5000}
            max={300000}
            step={1000}
            value={value.views}
            onChange={(e) => {
              const views = Number(e.target.value);
              onChange({ ...value, views, clicks: Math.min(value.clicks, Math.round(views * 0.1)) });
            }}
            className={range}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="goal-clicks" className="flex items-baseline justify-between text-[13px] font-semibold">
            Cliques que quero
            <span className="font-adm-mono text-[13px]">{value.clicks.toLocaleString("pt-BR")}</span>
          </label>
          <input
            id="goal-clicks"
            type="range"
            min={100}
            max={maxClicks}
            step={50}
            value={Math.min(value.clicks, maxClicks)}
            onChange={(e) => onChange({ ...value, clicks: Number(e.target.value) })}
            className={range}
          />
          <span className="text-[11px] text-adm-muted">Taxa de cliques da meta: {ctr.toFixed(1).replace(".", ",")}%</span>
        </div>
      </div>
      {!same && (
        <button
          type="button"
          onClick={() => onChange({ ...value, views: sug.views, clicks: sug.clicks })}
          className="self-start rounded-lg border border-adm-blue bg-white px-3 py-1.5 text-xs font-semibold text-adm-blue"
        >
          Usar o que esse raio costuma entregar: {sug.views.toLocaleString("pt-BR")} visualizações e {sug.clicks.toLocaleString("pt-BR")} cliques
        </button>
      )}
      <dl className="m-0 flex flex-col rounded-xl border border-adm-line">
        {lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 border-b border-adm-line-soft px-4 py-2.5 text-sm">
            <dt>
              {l.label}
              <span className="block text-xs text-adm-muted">{l.detail}</span>
            </dt>
            <dd className="m-0 font-adm-mono font-semibold">{formatBRL(l.cents)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-3 rounded-b-xl bg-adm-blue-tint px-4 py-3">
          <dt className="text-sm font-bold">Valor da campanha</dt>
          <dd className="m-0 text-xl font-bold">{formatBRL(total)}</dd>
        </div>
      </dl>
      <p className="m-0 text-xs text-adm-muted">Estimativa: o valor final é confirmado na aprovação, e as metas dependem do público do lugar.</p>
    </div>
  );
}
