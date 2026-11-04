import { HBars } from "@/components/admin/charts";
import { formatBRL, formatCount } from "@/lib/format";
import type { ExperiencesOverview } from "@/lib/types";

/** Vendas do show: quanto entrou em reais, quantas compras e quantas pessoas, o ticket médio e o que mais vendeu. */
export function VendasShow({ overview }: { overview: ExperiencesOverview | null }) {
  if (!overview) return null;
  const { purchases, people, revenueCents } = overview;
  const avg = purchases > 0 ? Math.round(revenueCents / purchases) : 0;
  const sold = overview.experiences.filter((e) => e.purchases > 0).sort((a, b) => b.purchases - a.purchases);
  const tiles = [
    { label: "Receita", value: formatBRL(revenueCents), big: true },
    { label: "Vendas", value: formatCount(purchases) },
    { label: "Compradores", value: formatCount(people) },
    { label: "Ticket médio", value: formatBRL(avg) },
  ];
  return (
    <section aria-labelledby="vendas-title" className="flex flex-col gap-4">
      <h2 id="vendas-title" className="m-0 text-lg font-bold">
        Vendas do show
      </h2>
      <dl className="m-0 grid gap-px overflow-hidden rounded-xl border border-adm-line bg-adm-line sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 bg-white px-5 py-4">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{t.label}</dt>
            <dd className={`m-0 font-display font-black leading-none ${t.big ? "text-4xl" : "text-3xl"}`}>{t.value}</dd>
          </div>
        ))}
      </dl>
      {sold.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-5 py-4">
          <h3 className="m-0 text-sm font-bold">O que mais vendeu</h3>
          <HBars rows={sold.map((e) => ({ label: e.label, value: e.purchases }))} />
        </div>
      ) : (
        <p className="m-0 text-sm text-adm-muted">Nenhuma venda neste show ainda.</p>
      )}
    </section>
  );
}
