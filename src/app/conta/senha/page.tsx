import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { artistSlugFrom, type AuthParams } from "@/lib/authArtist";
import { SenhaView } from "./SenhaView";

export const metadata: Metadata = { title: "Trocar senha" };

/** Senha de quem não é de um ambiente (admin master, patrocinador). Fã e equipe usam `/{artista}/conta/senha`. */
export default async function SenhaPage({ searchParams }: { searchParams: Promise<AuthParams & { primeiro?: string }> }) {
  const params = await searchParams;
  const slug = artistSlugFrom(params);
  if (slug) redirect(`/${slug}/conta/senha${params.primeiro === "1" ? "?primeiro=1" : ""}`);
  return <SenhaView slug={null} first={params.primeiro === "1"} />;
}
