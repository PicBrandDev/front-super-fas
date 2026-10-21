import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubCard } from "@/components/fan/ClubCard";
import { Masthead } from "@/components/fan/Masthead";
import { EmptyState } from "@/components/fan/states";
import { getArtist, getClubs } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Fã clubes · ${artist.name}` : "Fã clubes" };
}

/** Lista dos fã clubes do cantor: os seus e os outros, uma linha por clube. */
export default async function ClubesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, clubs] = await Promise.all([getArtist(artista), getClubs(artista)]);
  if (!artist) notFound();
  const mine = clubs.filter((c) => c.joined);
  const others = clubs.filter((c) => !c.joined);

  return (
    <>
      <Masthead word="Clubes" label="Fã clubes" />
      <div className="px-4">
        <p className="m-0 border-b border-line pb-4 text-[15px] leading-[22px] text-fg-muted">
          Entre em quantos quiser. Cada clube tem seu mural, sua roleta e sua galera.
        </p>
        {clubs.length === 0 && (
          <EmptyState
            title="Nenhum fã clube por enquanto"
            text={`Os fã clubes de ${artist.name} ainda estão sendo montados. Volte em breve.`}
          />
        )}
        {mine.length > 0 && (
          <section aria-labelledby="clubes-meus" className="pt-6">
            <h2 id="clubes-meus" className="poster m-0 mb-3 text-xl leading-[22px] tracking-[-0.01em]">
              Seus clubes
            </h2>
            <div className="border-t border-line">
              {mine.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
            </div>
          </section>
        )}
        {clubs.length > 0 && (
          <section aria-labelledby="clubes-outros" className="pt-6">
            <h2 id="clubes-outros" className="poster m-0 mb-3 text-xl leading-[22px] tracking-[-0.01em]">
              {mine.length ? "Outros fã clubes" : "Todos os fã clubes"}
            </h2>
            {others.length === 0 ? (
              <p className="mono m-0 py-4">Você já está em todos os fã clubes de {artist.name}.</p>
            ) : (
              <div className="border-t border-line">
                {others.map((c) => (
                  <ClubCard key={c.id} club={c} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </>
  );
}
