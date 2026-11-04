import { formatBRL, formatCount } from "@/lib/format";
import type { SubscribersAnalytics } from "@/lib/types";

/**
 * Dinheiro das assinaturas: a receita mensal em destaque (assinantes ativos x preço), a projeção do ano,
 * quanto veio das novas assinaturas, o que está pendente ou foi perdido e a evolução dos últimos 6 meses.
 */
export function ReceitaAssinaturas({ data, priceCents }: { data: SubscribersAnalytics; priceCents: number }) {
  const price = data.priceCents ?? priceCents;
  const months = data.monthlySeries ?? [];
  const max = Math.max(1, ...months.map((m) => m.revenueCents));
  const first = months[0]?.revenueCents ?? 0;
  const last = months[months.length - 1]?.revenueCents ?? 0;
  const growth = first > 0 ? Math.round(((last - first) / first) * 100) : null;
  const tiles = [
    { label: "Projeção do ano", value: formatBRL(data.annualRevenueCents ?? data.monthlyRevenueCents * 12), note: "receita mensal x 12" },
    { label: "Entrou nos últimos 30 dias", value: formatBRL(data.newRevenueMonthCents ?? data.newSubscribersMonth * price), note: `${formatCount(data.newSubscribersMonth)} novas assinaturas` },
    { label: "Pendentes", value: formatBRL(data.pendingRevenueCents ?? data.pending * price), note: `${formatCount(data.pending)} aguardando pagamento` },
    { label: "Cancelados", value: formatBRL(data.lostRevenueCents ?? data.canceled * price), note: `${formatCount(data.canceled)} deixaram de pagar por mês` },
  ];

  return (
    <section aria-labelledby="receita-title" className="flex flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id="receita-title" className="m-0 font-adm-mono text-xs font-semibold uppercase tracking-wider text-adm-muted">
            Receita mensal das assinaturas
          </h2>
          <strong className="font-display text-5xl font-black leading-none">{formatBRL(data.monthlyRevenueCents)}</strong>
          <span className="text-sm text-adm-muted">
            {formatCount(data.active)} assinantes ativos × {formatBRL(price)}
          </span>
        </div>
        {growth !== null && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${growth >= 0 ? "bg-adm-ok-bg text-adm-ok" : "bg-adm-warn-bg text-adm-warn"}`}>
            {growth >= 0 ? "+" : ""}
            {growth}% em 6 meses
          </span>
        )}
      </div>

      <dl className="m-0 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-0.5 rounded-lg bg-adm-bg px-3.5 py-3">
            <dt className="text-xs font-semibold text-adm-muted">{t.label}</dt>
            <dd className="m-0 text-xl font-bold leading-7">{t.value}</dd>
            <dd className="m-0 text-xs text-adm-muted">{t.note}</dd>
          </div>
        ))}
      </dl>

      {months.length > 0 && (
        <figure className="m-0 flex flex-col gap-2">
          <figcaption className="text-sm font-bold">Receita por mês</figcaption>
          <div role="img" aria-label={`Receita por mês: ${months.map((m) => `${m.label} ${formatBRL(m.revenueCents)}`).join(", ")}`} className="flex h-36 items-end gap-3">
            {months.map((m) => (
              <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1.5">
                <span className="text-center font-adm-mono text-[11px] font-semibold">{formatBRL(m.revenueCents)}</span>
                <span className="w-full rounded-t-md bg-adm-blue" style={{ height: `${Math.max(4, (m.revenueCents / max) * 100)}%` }} title={`${m.label}: ${formatBRL(m.revenueCents)} · ${formatCount(m.subscribers)} assinantes`} />
                <span className="text-center font-adm-mono text-[11px] text-adm-muted">{m.label}</span>
              </div>
            ))}
          </div>
          <p className="m-0 text-xs text-adm-muted">Estimativa pela data em que cada assinante ativo assinou: o valor de cada mês é quem já tinha assinado até o fim dele × {formatBRL(price)}.</p>
        </figure>
      )}
    </section>
  );
}
