import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { artistSlugFrom, type AuthParams } from "@/lib/authArtist";
import { ContaView } from "./ContaView";

export const metadata: Metadata = { title: "Minha conta" };

/** Conta de quem não é de um ambiente (admin master, patrocinador). Fã e equipe usam `/{artista}/conta`. */
export default async function ContaPage({ searchParams }: { searchParams: Promise<AuthParams> }) {
  const slug = artistSlugFrom(await searchParams);
  if (slug) redirect(`/${slug}/conta`);
  return <ContaView slug={null} />;
}
