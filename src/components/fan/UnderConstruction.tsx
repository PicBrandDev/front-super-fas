import type { Artist } from "@/lib/types";

/**
 * Tela do fã de um ambiente que ainda está em construção (status "setup"): em branco, só com o nome.
 * Sem o desenho do Vintage, pois o ambiente ainda não tem identidade própria.
 */
export function UnderConstruction({ artist }: { artist: Pick<Artist, "name" | "fanClubName"> }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-white px-6 text-center text-neutral-900">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">Em construção</span>
      <h1 className="m-0 text-3xl font-bold leading-tight">{artist.fanClubName || artist.name}</h1>
      <p className="m-0 max-w-[32ch] text-sm leading-5 text-neutral-500">Estamos preparando o fã clube de {artist.name}. Volte em breve.</p>
    </main>
  );
}
