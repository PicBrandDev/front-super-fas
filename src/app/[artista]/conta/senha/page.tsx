import type { Metadata } from "next";
import { SenhaView } from "@/app/conta/senha/SenhaView";

export const metadata: Metadata = { title: "Trocar senha" };

export default async function ArtistSenhaPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ primeiro?: string }>;
}) {
  const [{ artista }, { primeiro }] = await Promise.all([params, searchParams]);
  return <SenhaView slug={artista} first={primeiro === "1"} />;
}
