import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { ResaleError } from "@/components/fan/resale/ResaleError";
import { apiEnabled, getEvent, getProfile, getResaleOrder } from "@/lib/api";
import { viewer as mockViewer } from "@/lib/mock";
import { OrderView } from "./OrderView";

export const metadata: Metadata = { title: "Pedido da revenda" };

export default async function ResaleOrderPage({ params }: { params: Promise<{ artista: string; id: string }> }) {
  const { artista, id } = await params;
  const res = await getResaleOrder(artista, id);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ResaleError back={`/${artista}/revenda/pedidos`} backLabel="Pedidos" message={res.error} />;
  }
  // Dados extras do ingresso (horário, ticketeira, nome): se falharem, o pedido abre sem eles; o redirect do login passa.
  const soft = <T,>(p: Promise<T>) => p.catch((e) => (unstable_rethrow(e), null));
  const [event, profile] = await Promise.all([soft(getEvent(artista, res.data.eventId)), soft(getProfile())]);
  return (
    <OrderView
      key={res.data.id}
      initial={res.data}
      holderName={profile?.name || mockViewer.name}
      ticketingName={event?.ticketingName || undefined}
      showTime={event?.time || undefined}
      demo={!apiEnabled()}
    />
  );
}
