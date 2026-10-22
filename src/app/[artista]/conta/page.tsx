import type { Metadata } from "next";
import { ContaView } from "@/app/conta/ContaView";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ArtistContaPage({ params }: { params: Promise<{ artista: string }> }) {
  return <ContaView slug={(await params).artista} />;
}
