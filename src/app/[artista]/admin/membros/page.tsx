import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { DayBars, HBars } from "@/components/admin/charts";
import { AdminEmpty } from "@/components/admin/ui";
import { formatBRL, getArtist, getSubscribersAnalytics } from "@/lib/api";
import { formatCount } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Assinantes — ${artist.name}` : "Assinantes" };
}

/** Quantos assinantes o ambiente tem e de onde são. Não lista pessoas. */
export default async function MembrosPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const data = await getSubscribersAnalytics(artist.slug);

  return (
    <ClubAdminShell artist={artist} active="membros">
      <AdminPageHeader
        title="Assinantes"
        headingId="assinantes-title"
        description={`Quantos assinantes ${artist.name} tem e de onde eles são.`}
      />
      {!data ? (
        <AdminEmpty title="Analytics indisponível" text="Ligue o front à API para ver os números dos assinantes." />
      ) : (
        <>
          <section aria-label="Números" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Assinantes ativos", value: formatCount(data.active), note: `${formatCount(data.pending)} pendentes · ${formatCount(data.canceled)} cancelados` },
              { label: "Fãs no ambiente", value: formatCount(data.fans), note: "com ou sem assinatura" },
              { label: "Novas assinaturas (30d)", value: formatCount(data.newSubscribersMonth), note: "iniciadas nos últimos 30 dias" },
              { label: "Receita mensal", value: formatBRL(data.monthlyRevenueCents), note: `${formatBRL(artist.memberPriceCents)} por assinante ativo` },
            ].map((k) => (
              <div key={k.label} className="flex flex-col gap-0.5 rounded-xl border border-adm-line bg-white px-3.5 py-3">
                <span className="font-adm-mono text-xs font-semibold text-adm-muted">{k.label}</span>
                <strong className="text-[22px] leading-7">{k.value}</strong>
                <span className="text-[13px] text-adm-muted">{k.note}</span>
              </div>
            ))}
          </section>

          <section aria-labelledby="g-novas" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
            <h2 id="g-novas" className="m-0 text-sm font-bold">
              Novas assinaturas por dia
            </h2>
            <DayBars
              title="Novas assinaturas por dia"
              unit="novas assinaturas"
              points={data.series.map((d) => ({ day: d.day, value: d.newSubscribers }))}
            />
          </section>

          <div className="grid gap-3 lg:grid-cols-2">
            <section aria-labelledby="g-estados" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
              <h2 id="g-estados" className="m-0 text-sm font-bold">
                Assinantes por estado
              </h2>
              {data.byState.length ? (
                <HBars rows={data.byState.map((s) => ({ label: s.place, value: s.subscribers }))} />
              ) : (
                <p className="m-0 text-sm text-adm-muted">Ainda não há assinantes ativos.</p>
              )}
            </section>
            <section aria-labelledby="g-cidades" className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white px-4 py-3">
              <h2 id="g-cidades" className="m-0 text-sm font-bold">
                Principais cidades
              </h2>
              {data.byCity.length ? (
                <HBars rows={data.byCity.map((c) => ({ label: c.place, value: c.subscribers }))} />
              ) : (
                <p className="m-0 text-sm text-adm-muted">Ainda não há assinantes ativos.</p>
              )}
            </section>
          </div>

          {data.active > data.withAddress && (
            <p className="m-0 text-sm text-adm-muted">
              {formatCount(data.active - data.withAddress)} de {formatCount(data.active)} assinantes ativos não informaram o endereço
              (contas criadas antes do campo existir). Os novos cadastros já pedem o endereço.
            </p>
          )}
        </>
      )}
    </ClubAdminShell>
  );
}
