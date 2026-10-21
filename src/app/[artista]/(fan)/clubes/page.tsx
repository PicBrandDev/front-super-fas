import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClubCard } from "@/components/fan/ClubCard";
import { PageHeader } from "@/components/fan/PageHeader";
import { EmptyState } from "@/components/fan/states";
import { getArtist, getClubs } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ artista: string }> }): Promise<Metadata> {
  const { artista } = await params;
  const artist = await getArtist(artista);
  return { title: artist ? `Fã clubes · ${artist.name}` : "Fã clubes" };
}

export default async function ClubesPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [artist, clubs] = await Promise.all([getArtist(artista), getClubs(artista)]);
  if (!artist) notFound();
  const mine = clubs.filter((c) => c.joined);
  const others = clubs.filter((c) => !c.joined);

  return (
    <>
      <PageHeader eyebrow={artist.name} title="Fã clubes">
        <p className="m-0 max-w-[520px] text-[15px] leading-snug text-paper-2">
          Entre em quantos quiser. Cada clube tem seu mural, sua roleta e sua galera.
        </p>
      </PageHeader>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-4 pb-8 pt-5 lg:px-8">
        {clubs.length === 0 && (
          <EmptyState
            title="Nenhum fã clube por enquanto"
            text={`Os fã clubes de ${artist.name} ainda estão sendo montados. Volte em breve.`}
          />
        )}
        {mine.length > 0 && (
          <section aria-labelledby="clubes-meus" className="flex flex-col gap-3">
            <h2 id="clubes-meus" className="m-0 font-body text-lg font-extrabold">
              Seus clubes
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mine.map((c) => (
                <ClubCard key={c.id} club={c} />
              ))}
            </div>
          </section>
        )}
        {clubs.length > 0 && (
          <section aria-labelledby="clubes-outros" className="flex flex-col gap-3">
            <h2 id="clubes-outros" className="m-0 font-body text-lg font-extrabold">
              {mine.length ? "Outros fã clubes" : "Todos os fã clubes"}
            </h2>
            {others.length === 0 ? (
              <p className="m-0 font-label text-[13px] text-ink-soft">Você já está em todos os fã clubes de {artist.name}.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
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
