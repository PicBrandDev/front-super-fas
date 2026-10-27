import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { ClubAdminShell } from "@/components/admin/ClubAdminShell";
import { AdminEmpty } from "@/components/admin/ui";
import { getArtist, getCarpoolAdmin } from "@/lib/api";
import { formatBRL } from "@/lib/format";
import { ListaCaronas } from "./ListaCaronas";

export const metadata: Metadata = { title: "Caronas" };

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
            <ListaCaronas artist={artist.slug} items={data.items} />
          )}
        </>
      )}
    </ClubAdminShell>
  );
}
