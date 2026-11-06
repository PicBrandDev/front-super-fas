import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { getArtist } from "@/lib/api";
import { brandFor } from "@/lib/brands";
import { TermsGate } from "@/components/TermsGate";
import { TERMS_GATED } from "@/lib/terms";

/** Barra do navegador na cor do ambiente do artista. */
export async function generateViewport({ params }: { params: Promise<{ artista: string }> }): Promise<Viewport> {
  const { artista } = await params;
  return { themeColor: brandFor(artista).themeColor };
}

/** Valida o ambiente do artista; as áreas (fã e admin) definem suas próprias cascas. */
export default async function ArtistLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ artista: string }>;
}) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  // Ambientes de demonstração abrem com o termo de confidencialidade e o CPF.
  return TERMS_GATED.includes(artista) ? <TermsGate slug={artista}>{children}</TermsGate> : children;
}
