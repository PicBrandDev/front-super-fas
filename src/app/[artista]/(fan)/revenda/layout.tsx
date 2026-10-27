import { notFound } from "next/navigation";
import { getArtist } from "@/lib/api";

/**
 * A revenda entre fãs saiu do app: toda a área /revenda responde 404 enquanto o módulo "resale"
 * estiver desligado no fã clube (desligado por padrão; o admin master liga em Fã clubes).
 */
export default async function RevendaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ artista: string }>;
}) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist?.modules?.resale) notFound();
  return children;
}
