import { DayBars } from "@/components/admin/charts";
import { formatCount } from "@/lib/format";
import { thumb } from "@/lib/thumb";
import type { HashtagAnalytics } from "@/lib/types";

/**
 * O ranking mede quem mais usou a hashtag. Antes da lista: quantas pessoas usaram, quantos compartilhamentos foram
 * confirmados, de onde vieram (republicou um post oficial, compartilhou um Drop ou usou a hashtag num post próprio)
 * e qual post do artista mais foi compartilhado.
 */
export function AnalyticsHashtag({ data }: { data: HashtagAnalytics }) {
  const tiles = [
    { label: "Pessoas que usaram a #", value: formatCount(data.people), note: `${formatCount(data.peopleMonth)} nos últimos 30 dias` },
    { label: "Compartilhamentos confirmados", value: formatCount(data.verified), note: `${formatCount(data.verifiedMonth)} nos últimos 30 dias` },
    { label: "Aguardando conferência", value: formatCount(data.waiting), note: "o fã disse que postou" },
    { label: "Só abriram o compartilhamento", value: formatCount(data.started), note: "não chegaram a postar" },
  ];
  const sources = [
    { label: "Republicou um post oficial", value: data.fromOfficialPost },
    { label: "Compartilhou um Drop", value: data.fromDrop },
    { label: "Usou a # em post próprio", value: data.fromFree },
  ];
  const total = Math.max(1, data.verified);
  const lead = data.top[0];

  return (
    <section aria-labelledby="hashtag-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="hashtag-title" className="m-0 font-display text-3xl font-black">
          #{data.hashtag}
        </h2>
      </div>

      <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{t.label}</dt>
            <dd className="m-0 font-display text-4xl font-black leading-none">{t.value}</dd>
            <dd className="m-0 text-xs text-adm-muted">{t.note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
          <h3 className="m-0 text-sm font-bold">Confirmados por dia</h3>
          <DayBars title="Compartilhamentos confirmados por dia" unit="confirmados" points={data.series} />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
          <h3 className="m-0 text-sm font-bold">De onde vêm</h3>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {sources.map((s) => (
              <li key={s.label} className="flex flex-col gap-1">
                <span className="flex items-baseline justify-between gap-2 text-sm">
                  {s.label}
                  <strong className="font-adm-mono">
                    {formatCount(s.value)} <span className="font-normal text-adm-muted">· {Math.round((100 * s.value) / total)}%</span>
                  </strong>
                </span>
                <span aria-hidden="true" className="h-2 rounded-full bg-adm-line-soft">
                  <span className="block h-2 rounded-full bg-adm-blue" style={{ width: `${Math.max(s.value > 0 ? 3 : 0, (100 * s.value) / total)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
        <h3 className="m-0 text-sm font-bold">O que mais foi compartilhado</h3>
        {!lead ? (
          <p className="m-0 text-sm text-adm-muted">Nenhum post ou Drop compartilhado e confirmado ainda.</p>
        ) : (
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {data.top.map((t, i) => (
              <li key={`${t.kind}-${t.id}`} className={`flex items-center gap-4 ${i === 0 ? "rounded-xl bg-adm-bg p-3" : ""}`}>
                <span className="w-6 font-display text-2xl font-black text-adm-muted">{i + 1}º</span>
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura do post oficial
                  <img src={thumb(t.image, 56)} alt="" width={56} height={56} className="size-14 flex-none rounded-lg object-cover" />
                ) : null}
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{t.kind === "drop" ? "Drop" : "Post oficial"}</span>
                  <span className={`${i === 0 ? "text-base font-bold" : "text-sm font-semibold"} line-clamp-2`}>{t.text}</span>
                </span>
                <span className="flex flex-col items-end leading-tight">
                  <strong className="font-display text-3xl font-black">{formatCount(t.shares)}</strong>
                  <span className="text-xs text-adm-muted">
                    {formatCount(t.people)} {t.people === 1 ? "pessoa" : "pessoas"}
                    {t.waiting > 0 ? ` · +${formatCount(t.waiting)} aguardando` : ""}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
