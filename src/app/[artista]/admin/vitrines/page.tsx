import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty, Badge, SlotDiagram, tdClass, thClass, type Tone } from "@/components/admin/ui";
import { getArtist, getRentals } from "@/lib/api";
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
export default async function VitrinesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const rentals = await getRentals(artist.slug);
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
        description={`Todas as vitrines de anúncio de ${artist.name} e dos fã clubes que têm um patrocinador, e por quanto tempo.`}
      />

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
