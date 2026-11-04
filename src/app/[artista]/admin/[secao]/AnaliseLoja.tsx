import Link from "next/link";
import { DayBars, HBars } from "@/components/admin/charts";
import { formatBRL, formatCount } from "@/lib/format";
import type { StoreInsights } from "@/lib/types";

const VIEWS = "#1d5fd1";
const CARTS = "#b3541e";
const BUYS = "#0f8a7a";
const PERIODS = [7, 30, 90];
const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pct = (n: number) => `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dm = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

/** Linhas por dia (visualizações, carrinho e compras), com a legenda em cima e o primeiro, o do meio e o último dia no eixo. */
function Linhas({ series }: { series: StoreInsights["series"] }) {
  const W = 640;
  const H = 190;
  const L = 36;
  const R = 8;
  const T = 10;
  const B = 24;
  const keys = [
    { k: "views" as const, label: "Visualizações", color: VIEWS },
    { k: "carts" as const, label: "No carrinho", color: CARTS },
    { k: "purchases" as const, label: "Compras", color: BUYS },
  ];
  const max = Math.max(5, ...series.flatMap((d) => keys.map((x) => d[x.k])));
  const x = (i: number) => L + (series.length < 2 ? 0 : (i * (W - L - R)) / (series.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const mid = Math.floor((series.length - 1) / 2);
  return (
    <figure className="m-0 flex flex-col gap-2">
      <figcaption className="flex flex-wrap gap-x-5 gap-y-1 text-[13px]">
        {keys.map((s) => (
          <span key={s.k} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="inline-block h-0.5 w-5 rounded" style={{ background: s.color }} />
            {s.label}: <strong>{formatCount(series.reduce((a, d) => a + d[s.k], 0))}</strong>
          </span>
        ))}
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Visualizações, carrinho e compras por dia" className="block h-auto w-full">
        {[0, max / 2, max].map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="var(--color-adm-line)" strokeWidth="1" />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--color-adm-muted)">
              {formatCount(Math.round(t))}
            </text>
          </g>
        ))}
        {[0, mid, series.length - 1].map((i, n) => (
          <text key={i} x={x(i)} y={H - 6} textAnchor={n === 0 ? "start" : n === 2 ? "end" : "middle"} fontSize="11" fill="var(--color-adm-muted)">
            {series[i] ? dm(series[i].day) : ""}
          </text>
        ))}
        {keys.map((s) => (
          <path
            key={s.k}
            d={series.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(d[s.k]).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </figure>
  );
}

/** Colunas simples (dia da semana ou hora), com o valor no tooltip e o maior destacado. */
function Colunas({ title, labels, values, every = 1 }: { title: string; labels: string[]; values: number[]; every?: number }) {
  const max = Math.max(1, ...values);
  const top = values.indexOf(Math.max(...values));
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div role="img" aria-label={`${title}: ${values.map((v, i) => `${labels[i]} ${v}`).join(", ")}`} className="flex h-28 items-end gap-1">
        {values.map((v, i) => (
          <span
            key={labels[i]}
            title={`${labels[i]}: ${formatCount(v)}`}
            className="min-w-0 flex-1 rounded-t-[2px]"
            style={{ height: v > 0 ? `${Math.max(6, (v / max) * 100)}%` : "2px", background: v > 0 ? (i === top ? BUYS : "#8fc9c0") : "var(--color-adm-line)" }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="flex gap-1 font-adm-mono text-[10px] text-adm-muted">
        {labels.map((l, i) => (
          <span key={l} className="min-w-0 flex-1 text-center">
            {i % every === 0 ? l : ""}
          </span>
        ))}
      </div>
    </figure>
  );
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
      <div className="flex flex-col gap-0.5">
        <h3 className="m-0 text-[15px] font-bold">{title}</h3>
        {note && <p className="m-0 text-xs text-adm-muted">{note}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * A análise da loja no período: o funil (viram, puseram no carrinho, compraram), o desempenho de cada produto, os dias,
 * os tamanhos, o dia da semana e a hora em que mais se compra. As visualizações e o carrinho são registrados pelo app do fã.
 */
export function AnaliseLoja({ data, base }: { data: StoreInsights; base: string }) {
  const funnel = [
    { label: "Viram algum produto", value: data.viewers, color: VIEWS },
    { label: "Puseram no carrinho", value: data.cartPeople, color: CARTS, of: data.viewers },
    { label: "Compraram", value: data.buyers, color: BUYS, of: data.cartPeople },
  ];
  const top = Math.max(1, ...funnel.map((f) => f.value));
  const overall = data.viewers ? Math.min(100, (100 * data.buyers) / data.viewers) : 0;
  const maxProd = Math.max(1, ...data.products.flatMap((p) => [p.views, p.carts, p.purchases]));
  const noTracking = data.views === 0 && data.carts === 0;

  return (
    <div className="flex flex-col gap-4">
      <nav aria-label="Período" className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-adm-muted">Período:</span>
        {PERIODS.map((d) => (
          <Link
            key={d}
            href={`${base}?aba=analise&dias=${d}`}
            scroll={false}
            aria-current={data.days === d ? "true" : undefined}
            className={`rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline ${data.days === d ? "border-adm-ink bg-adm-ink text-white" : "border-adm-line bg-white text-adm-ink"}`}
          >
            {d} dias
          </Link>
        ))}
      </nav>

      <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Visualizações", value: formatCount(data.views), note: `${formatCount(data.viewers)} fãs` },
          { label: "Foi para o carrinho", value: formatCount(data.carts), note: `${formatCount(data.removes)} tirados depois` },
          { label: "Compras", value: formatCount(data.units), note: `${formatCount(data.orders)} pedidos` },
          { label: "Conversão", value: pct(overall), note: "de quem viu até comprar" },
          { label: "Abandonaram o carrinho", value: formatCount(data.abandoned), note: "puseram e não compraram" },
        ].map((k) => (
          <div key={k.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
            <dd className="m-0 font-display text-3xl font-black leading-none">{k.value}</dd>
            <dd className="m-0 text-xs text-adm-muted">{k.note}</dd>
          </div>
        ))}
      </dl>

      {noTracking && (
        <p className="m-0 rounded-lg bg-adm-bg px-4 py-3 text-sm text-adm-muted">
          Ainda não há visualizações nem carrinhos registrados neste período. O app do fã passa a registrar a partir de agora: cada produto visto na loja e cada
          “Adicionar” aparece aqui.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Funil de compra" note="Fãs diferentes em cada passo, e quanto do passo anterior chegou até ele.">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {funnel.map((f) => (
              <li key={f.label} className="flex flex-col gap-1">
                <span className="flex items-baseline justify-between gap-2 text-sm">
                  {f.label}
                  <strong className="font-adm-mono">
                    {formatCount(f.value)}
                    {f.of !== undefined && <span className="font-normal text-adm-muted"> · {pct(f.of ? Math.min(100, (100 * f.value) / f.of) : 0)} do passo anterior</span>}
                  </strong>
                </span>
                <span aria-hidden="true" className="h-3 rounded-r bg-adm-line-soft">
                  <span className="block h-3 rounded-r" style={{ width: `${(f.value / top) * 100}%`, background: f.color }} />
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Pedidos" note="Como o fã recebe e quanto gasta.">
          <dl className="m-0 grid grid-cols-2 gap-4">
            {[
              { label: "Ticket médio", value: formatBRL(data.avgTicketCents) },
              { label: "Itens por pedido", value: data.itemsPerOrder.toLocaleString("pt-BR") },
              { label: "Retirada na lojinha", value: formatCount(data.pickup) },
              { label: "Entrega em casa", value: formatCount(data.ship) },
            ].map((k) => (
              <div key={k.label} className="flex flex-col gap-0.5">
                <dt className="text-xs text-adm-muted">{k.label}</dt>
                <dd className="m-0 font-display text-2xl font-black leading-7">{k.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <Card title="Por dia" note="Visualizações, vezes que foi para o carrinho e compras em cada dia.">
        <Linhas series={data.series} />
      </Card>

      <Card title="Receita por dia">
        <DayBars title="Receita por dia" unit="reais" points={data.series.map((d) => ({ day: d.day, value: Math.round(d.revenueCents / 100) }))} />
      </Card>

      <Card title="Cada produto" note="Visualizações, carrinho e compras de cada um, e onde os fãs desistem.">
        {data.products.length === 0 ? (
          <p className="m-0 text-sm text-adm-muted">Nenhum produto cadastrado.</p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {data.products.map((p) => (
              <li key={p.productId} className="grid gap-x-6 gap-y-2 border-b border-adm-line-soft py-4 last:border-b-0 lg:grid-cols-[minmax(160px,220px)_1fr_minmax(200px,260px)]">
                <div className="flex flex-col">
                  <strong className="text-[15px]">{p.name}</strong>
                  <span className="text-xs text-adm-muted">{formatBRL(p.revenueCents)} · {formatCount(p.buyers)} {p.buyers === 1 ? "comprador" : "compradores"}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "Visualizações", value: p.views, color: VIEWS },
                    { label: "Carrinho", value: p.carts, color: CARTS },
                    { label: "Compras", value: p.purchases, color: BUYS },
                  ].map((b) => (
                    <div key={b.label} className="grid grid-cols-[92px_1fr_40px] items-center gap-2 text-xs">
                      <span className="text-adm-muted">{b.label}</span>
                      <span aria-hidden="true" className="h-2.5 rounded-r bg-adm-line-soft">
                        <span className="block h-2.5 rounded-r" style={{ width: `${(b.value / maxProd) * 100}%`, background: b.color }} />
                      </span>
                      <strong className="text-right font-adm-mono">{formatCount(b.value)}</strong>
                    </div>
                  ))}
                </div>
                <dl className="m-0 grid grid-cols-3 gap-2 text-xs lg:grid-cols-1 lg:gap-1">
                  <div className="flex justify-between gap-2">
                    <dt className="text-adm-muted">Viu → carrinho</dt>
                    <dd className="m-0 font-adm-mono font-semibold">{pct(p.viewToCart)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-adm-muted">Carrinho → compra</dt>
                    <dd className="m-0 font-adm-mono font-semibold">{pct(p.cartToBuy)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-adm-muted">Abandonaram</dt>
                    <dd className="m-0 font-adm-mono font-semibold">{formatCount(p.abandoned)}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Vendas por tamanho">
          {Object.keys(data.bySize).length ? (
            <HBars rows={["P", "M", "G", "GG"].filter((t) => data.bySize[t]).map((t) => ({ label: t, value: data.bySize[t] }))} />
          ) : (
            <p className="m-0 text-sm text-adm-muted">Nenhuma camiseta vendida no período.</p>
          )}
        </Card>
        <Card title="Dia da semana" note="Unidades vendidas por dia da semana.">
          <Colunas title="Vendas por dia da semana" labels={WEEK} values={data.byWeekday} />
        </Card>
        <Card title="Hora do dia" note="Unidades vendidas por hora (horário de Brasília).">
          <Colunas title="Vendas por hora" labels={Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"))} values={data.byHour} every={6} />
        </Card>
      </div>
    </div>
  );
}
