import type { Metadata } from "next";
import { apiEnabled, getMyResaleListings } from "@/lib/api";
import { MyListingsView } from "./MyListingsView";

export const metadata: Metadata = { title: "Meus anúncios da revenda" };

export default async function MyResaleListingsPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const res = await getMyResaleListings(artista);
  return <MyListingsView listings={res.ok ? res.data : []} error={res.ok ? null : res.error} demo={!apiEnabled()} />;
}
