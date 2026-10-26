import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResaleError } from "@/components/fan/resale/ResaleError";
import { apiEnabled, getResaleEligibility, getResaleEvent } from "@/lib/api";
import { SellForm } from "./SellForm";

export const metadata: Metadata = { title: "Vender ingresso" };

export default async function ResaleSellPage({ params }: { params: Promise<{ artista: string; eventoId: string }> }) {
  const { artista, eventoId } = await params;
  const [detail, eligibility] = await Promise.all([getResaleEvent(artista, eventoId), getResaleEligibility(artista)]);
  if (!detail.ok) {
    if (detail.status === 404) notFound();
    return <ResaleError back={`/${artista}/revenda`} backLabel="Revenda" message={detail.error} />;
  }
  return (
    <SellForm
      event={detail.data.event}
      ticketTypes={detail.data.ticketTypes}
      eligibility={eligibility.ok ? eligibility.data : null}
      demo={!apiEnabled()}
    />
  );
}
