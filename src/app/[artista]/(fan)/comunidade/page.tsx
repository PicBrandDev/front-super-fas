import { redirect } from "next/navigation";

/** Comunidade (feed da galera). Até a tela própria existir, manda para o mural. */
export default async function ComunidadePage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  redirect(`/${artista}/mural`);
}
