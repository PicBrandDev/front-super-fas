import type { Metadata } from "next";
import Link from "next/link";
import { MapaVitrines } from "@/components/admin/vitrines/MapaVitrines";
import { getSponsorVitrinesMap, listArtists } from "@/lib/api";

export const metadata: Metadata = { title: "Portal do patrocinador — Vitrines" };

/** Todas as vitrines de um cantor (entrada, roleta, feeds), livres ou ocupadas, com o lugar de cada uma no app. */
export default async function VitrinesPatrocinadorPage({ searchParams }: { searchParams: Promise<{ artista?: string }> }) {
  const { artista } = await searchParams;
  const artists = (await listArtists()).filter((a) => a.status === "active");
  const current = artists.find((a) => a.slug === artista) ?? artists[0];
  const map = current ? await getSponsorVitrinesMap(current.slug) : null;
  const cards = map?.cards ?? [];
  const free = cards.filter((c) => !c.live && c.active).length;

  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[28px] font-bold">Vitrines</h1>
        <p className="m-0 max-w-[720px] text-[15px] text-adm-muted">
          Veja onde seu anúncio pode aparecer: na entrada do app, na roleta e entre os posts do feed de cada cantor e fã clube. Em cada vitrine, o celular da esquerda mostra o lugar
          e o da direita, o anúncio no ar.
        </p>
      </div>

      {artists.length > 1 && (
        <nav aria-label="Cantores" className="flex flex-wrap gap-2">
          {artists.map((a) => {
            const on = a.slug === current?.slug;
            return (
              <Link
                key={a.slug}
                href={`/patrocinador/vitrines?artista=${a.slug}`}
                aria-current={on ? "page" : undefined}
                className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold no-underline ${on ? "border-adm-blue bg-adm-blue-soft text-adm-blue-dark" : "border-adm-line bg-white text-adm-muted"}`}
              >
                {a.name}
              </Link>
            );
          })}
        </nav>
      )}

      {!current || cards.length === 0 ? (
        <p className="m-0 text-sm text-adm-muted">Nenhuma vitrine disponível agora.</p>
      ) : (
        <>
          <p className="m-0 font-adm-mono text-[13px] text-adm-muted">
            {cards.length} vitrines · {free} livres para anunciar
          </p>
          <MapaVitrines cards={cards} mode="sponsor" artist={current.slug} />
        </>
      )}
    </>
  );
}
