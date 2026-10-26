import type { Metadata } from "next";
import { notFound, unstable_rethrow } from "next/navigation";
import { ResaleError } from "@/components/fan/resale/ResaleError";
import { apiEnabled, getEvent, getProfile, getResaleEligibility, getResaleEvent, getResaleListing } from "@/lib/api";
import { viewer as mockViewer } from "@/lib/mock";
import { ListingView } from "./ListingView";

export const metadata: Metadata = { title: "Anúncio da revenda" };

export default async function ResaleListingPage({ params }: { params: Promise<{ artista: string; id: string }> }) {
  const { artista, id } = await params;
  const res = await getResaleListing(artista, id);
  if (!res.ok) {
    if (res.status === 404) notFound();
    return <ResaleError back={`/${artista}/revenda`} backLabel="Revenda" message={res.error} />;
  }
  const [detail, eligibility, fanEvent, profile] = await Promise.all([
    getResaleEvent(artista, res.data.eventId),
    getResaleEligibility(artista),
    getEvent(artista, res.data.eventId).catch((e) => (unstable_rethrow(e), null)),
    getProfile().catch((e) => (unstable_rethrow(e), null)),
  ]);
  if (!detail.ok) return <ResaleError back={`/${artista}/revenda`} backLabel="Revenda" message={detail.error} />;
  return (
    <ListingView
      listing={res.data}
      event={detail.data.event}
      eligibility={eligibility.ok ? eligibility.data : null}
      ticketingName={fanEvent?.ticketingName || undefined}
      accountEmail={profile?.email ?? (apiEnabled() ? "" : `${mockViewer.handle.replace("@", "")}@exemplo.com`)}
      demo={!apiEnabled()}
    />
  );
}
