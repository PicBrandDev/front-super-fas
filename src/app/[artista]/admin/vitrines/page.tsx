import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty, Badge, SlotDiagram, tdClass, thClass, type Tone } from "@/components/admin/ui";
import { DesempenhoAnuncios } from "@/components/admin/vitrines/DesempenhoAnuncios";
import { MapaVitrines } from "@/components/admin/vitrines/MapaVitrines";
import { getAdsAnalytics, getArtist, getRentals, getVitrinesMap } from "@/lib/api";
import { formatBRL, formatCount } from "@/lib/format";
import type { Rental } from "@/lib/types";

export const metadata: Metadata = { title: "Vitrines alugadas" };

const dm = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "—");
const status: Record<Rental["status"], { label: string; tone: Tone }> = {
  live: { label: "No ar", tone: "ok" },
  scheduled: { label: "Agendada", tone: "info" },
  ended: { label: "Encerrada", tone: "off" },
};

function duration(days: number | null) {
  if (!days) return "—";
  const weeks = Math.floor(days / 7);
  const rest = days % 7;
  if (days < 7) return `${days} ${days === 1 ? "dia" : "dias"}`;
  return `${days} dias (${weeks} ${weeks === 1 ? "semana" : "semanas"}${rest ? ` e ${rest} ${rest === 1 ? "dia" : "dias"}` : ""})`;
}

/** Vitrines alugadas do ambiente e dos fã clubes: qual vitrine, quem alugou e por quanto tempo. */
export default async function VitrinesPage({ params, searchParams }: { params: Promise<{ artista: string }>; searchParams: Promise<{ dias?: string }> }) {
  const { artista } = await params;
  const { dias } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const [rentals, map, ads] = await Promise.all([getRentals(artist.slug), getVitrinesMap(artist.slug), getAdsAnalytics(artist.slug, days)]);
  const cards = map?.cards ?? [];
  const liveNow = cards.filter((c) => c.live).length;
  const scheduledNow = cards.filter((c) => !c.live && c.next).length;
  const count = (s: Rental["status"]) => rentals.filter((r) => r.status === s).length;
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

      {cards.length > 0 && (
        <>
          <dl aria-label="Vitrines" className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4">
            {[
              { label: "Vitrines no app", value: cards.length },
              { label: "No ar agora", value: liveNow },
              { label: "Agendadas", value: scheduledNow },
              { label: "Livres", value: cards.length - liveNow - scheduledNow },
            ].map((k) => (
              <div key={k.label} className="flex flex-col gap-0.5">
                <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{k.label}</dt>
                <dd className="m-0 font-display text-3xl font-black leading-9">{formatCount(k.value)}</dd>
              </div>
            ))}
          </dl>
          <MapaVitrines cards={cards} mode="admin" artist={artist.slug} />
          {ads && <DesempenhoAnuncios data={ads} base={`/${artist.slug}`} />}
          <h2 className="m-0 mt-4 font-display text-3xl font-black">Aluguéis e períodos</h2>
        </>
      )}

      <dl aria-label="Resumo" className="m-0 flex flex-wrap gap-x-10 gap-y-3 border-y border-adm-line py-4">
        {sections.map((s) => (
          <div key={s.key} className="flex flex-col gap-0.5">
            <dt className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{s.title}</dt>
            <dd className="m-0 font-display text-3xl font-black leading-9">{formatCount(count(s.key))}</dd>
          </div>
        ))}
      </dl>

      {rentals.length === 0 ? (
        <AdminEmpty title="Nenhuma vitrine alugada" text="Quando um patrocinador tiver uma campanha aprovada em uma vitrine, ela aparece aqui com o período do aluguel." />
      ) : (
        sections
          .filter((s) => count(s.key) > 0)
          .map((s) => (
            <section key={s.key} aria-labelledby={`v-${s.key}`} className="flex flex-col gap-2">
              <h2 id={`v-${s.key}`} className="m-0 text-base font-bold">
                {s.title}
              </h2>
              <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
                <table className="w-full min-w-[820px] border-collapse text-sm">
                  <caption className="sr-only">{s.title}</caption>
                  <thead>
                    <tr className="bg-adm-bg">
                      <th scope="col" className={thClass}>
                        Vitrine
                      </th>
                      <th scope="col" className={thClass}>
                        Patrocinador
                      </th>
                      <th scope="col" className={thClass}>
                        Período
                      </th>
                      <th scope="col" className={thClass}>
                        Tempo alugado
                      </th>
                      <th scope="col" className={`${thClass} text-right`}>
                        Valor estimado
                      </th>
                      <th scope="col" className={thClass}>
                        Situação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rentals
                      .filter((r) => r.status === s.key)
                      .map((r, i) => (
                        <tr key={`${r.slotName}-${r.start}-${i}`}>
                          <td className={tdClass}>
                            <div className="flex items-center gap-3">
                              {/* mesmo desenho e mesma escala da tela em que o patrocinador escolhe a vitrine */}
                              <SlotDiagram small top={Math.round(r.diagramTop * 0.9)} height={Math.round(r.diagramHeight * 0.9)} />
                              <div className="min-w-0">
                                <strong className="block text-[15px]">{r.slotName}</strong>
                                <span className="block text-[13px] text-adm-muted">
                                  {r.fanClub ?? "Ambiente"}
                                  {r.where ? ` · ${r.where}` : ""}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className={tdClass}>
                            <strong className="block">{r.sponsor}</strong>
                            <span className="block text-[13px] text-adm-muted">{r.title}</span>
                          </td>
                          <td className={`${tdClass} font-adm-mono text-[13px]`}>
                            {dm(r.start)} a {dm(r.end)}
                          </td>
                          <td className={tdClass}>{duration(r.days)}</td>
                          <td className={`${tdClass} text-right font-adm-mono text-[13px]`}>
                            {r.estimatedTotalCents ? formatBRL(r.estimatedTotalCents) : "—"}
                            {r.priceCentsPerWeek ? <span className="block text-[11px] text-adm-muted">{formatBRL(r.priceCentsPerWeek)} por semana</span> : null}
                          </td>
                          <td className={tdClass}>
                            <Badge tone={status[r.status].tone}>{status[r.status].label}</Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
      )}
    </ClubAdminShell>
  );
}
