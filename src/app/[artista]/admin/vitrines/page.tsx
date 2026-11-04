import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { AlugadasPorPatrocinador } from "@/components/admin/vitrines/AlugadasPorPatrocinador";
import { DesempenhoAnuncios } from "@/components/admin/vitrines/DesempenhoAnuncios";
import { MapaVitrines } from "@/components/admin/vitrines/MapaVitrines";
import {
  getAdsAnalytics,
  getArtist,
  getRentals,
  getVitrinesMap,
} from "@/lib/api";
import { formatCount } from "@/lib/format";
import type { Rental } from "@/lib/types";

export const metadata: Metadata = { title: "Vitrines alugadas" };

/** Vitrines alugadas do ambiente e dos fã clubes: qual vitrine, quem alugou e por quanto tempo. */
export default async function VitrinesPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ dias?: string; aba?: string }>;
}) {
  const { artista } = await params;
  const { dias, aba } = await searchParams;
  const tab = aba === "alugadas" || aba === "vitrines" ? aba : "desempenho";
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [rentals, map, ads] = await Promise.all([
    getRentals(artist.slug),
    getVitrinesMap(artist.slug),
    getAdsAnalytics(artist.slug, days),
  ]);
  const cards = map?.cards ?? [];
  const count = (s: Rental["status"]) =>
    rentals.filter((r) => r.status === s).length;
  const sections: { key: Rental["status"]; title: string }[] = [
    { key: "live", title: "No ar agora" },
    { key: "scheduled", title: "Agendadas" },
    { key: "ended", title: "Encerradas" },
  ];

  return (
    <ClubAdminShell artist={artist} active="vitrines">
      <AdminPageHeader
        title="Vitrines alugadas"
        headingId="vitrines-title"
        description={`O mapa de todas as vitrines de ${artist.name} e dos fã clubes: onde cada uma fica no app, qual marca está no ar e por quanto tempo.`}
      />

      <nav
        aria-label="Seções"
        className="flex flex-wrap gap-1 border-b border-adm-line"
      >
        {[
          { key: "desempenho", label: "Desempenho" },
          { key: "alugadas", label: "Vitrines alugadas" },
          { key: "vitrines", label: "Vitrines" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/${artist.slug}/admin/vitrines?aba=${t.key}`}
            scroll={false}
            aria-current={tab === t.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-[15px] font-semibold no-underline ${tab === t.key ? "border-adm-ink text-adm-ink" : "border-transparent text-adm-muted"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "desempenho" &&
        (ads ? (
          <DesempenhoAnuncios data={ads} base={`/${artist.slug}`} />
        ) : (
          <AdminEmpty
            title="Sem dados de anúncios"
            text="Quando as campanhas aprovadas tiverem visualizações e cliques, o desempenho aparece aqui."
          />
        ))}

      {tab === "vitrines" &&
        (cards.length > 0 ? (
          <MapaVitrines cards={cards} mode="admin" artist={artist.slug} />
        ) : (
          <AdminEmpty title="Nenhuma vitrine" />
        ))}

      {tab === "alugadas" && (
        <>
          <dl
            aria-label="Resumo"
            className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4"
          >
            {sections.map((s) => (
              <div key={s.key} className="flex flex-col gap-0.5">
                <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">
                  {s.title}
                </dt>
                <dd className="m-0 font-display text-3xl font-black leading-9">
                  {formatCount(count(s.key))}
                </dd>
              </div>
            ))}
          </dl>

          {rentals.length === 0 ? (
            <AdminEmpty
              title="Nenhuma vitrine alugada"
              text="Quando um patrocinador tiver uma campanha aprovada em uma vitrine, ela aparece aqui com o período do aluguel."
            />
          ) : (
            <AlugadasPorPatrocinador rentals={rentals} />
          )}
        </>
      )}
    </ClubAdminShell>
  );
}
