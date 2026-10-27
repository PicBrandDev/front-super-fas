import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getCarpoolAdmin } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { SuporteCarona } from "./SuporteCarona";

export const metadata: Metadata = { title: "Caronas" };

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Caronas por show: valor retido, liberado e devolvido, e suporte para devolver ou liberar uma reserva. */
export default async function CaronasAdminPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const data = await getCarpoolAdmin(artist.slug);
  return (
    <ClubAdminShell artist={artist} active="caronas">
      <AdminPageHeader title="Caronas" headingId="caronas-title" description="Viagens que os fãs oferecem para cada show. O valor pago fica retido até a viagem acontecer." />
      {!data ? (
        <AdminEmpty title="Caronas indisponíveis" text="Ligue o front à API para ver as viagens." />
      ) : (
        <>
          <section aria-label="Números" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Viagens", value: String(data.rides), note: `${data.seatsBooked} vagas reservadas` },
              { label: "Retido", value: formatBRL(data.heldCents), note: "pago, aguardando a viagem" },
              { label: "Liberado", value: formatBRL(data.releasedCents), note: "repassado aos motoristas" },
              { label: "Devolvido", value: formatBRL(data.refundedCents), note: "estornado aos passageiros" },
            ].map((k) => (
              <div key={k.label} className="flex flex-col gap-0.5 rounded-xl border border-adm-line bg-white px-3.5 py-3">
                <span className="font-adm-mono text-xs font-semibold text-adm-muted">{k.label}</span>
                <strong className="text-[20px] leading-6">{k.value}</strong>
                <span className="text-[13px] text-adm-muted">{k.note}</span>
              </div>
            ))}
          </section>
          {data.items.length === 0 ? (
            <AdminEmpty title="Nenhuma carona ainda" text="Quando um fã oferecer carona para um show, ela aparece aqui." />
          ) : (
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {data.items.map(({ ride, heldCents, releasedCents, refundedCents }) => (
                <li key={ride.id} className="flex flex-col gap-2 rounded-xl border border-adm-line bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <strong>
                      {ride.originCity} → {ride.city} · {when(ride.departAt)}
                    </strong>
                    <span className="font-adm-mono text-xs text-adm-muted">
                      {ride.driver.name} · {formatBRL(ride.priceCents)}/vaga · {ride.seatsTotal - ride.seatsLeft}/{ride.seatsTotal} vagas
                      {ride.status === "cancelled" ? " · cancelada" : ""}
                    </span>
                  </div>
                  <span className="text-[13px] text-adm-muted">
                    Retido {formatBRL(heldCents)} · liberado {formatBRL(releasedCents)} · devolvido {formatBRL(refundedCents)}
                  </span>
                  {ride.passengers.map((p) => (
                    <SuporteCarona key={p.id} artist={artist.slug} booking={p} />
                  ))}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </ClubAdminShell>
  );
}
