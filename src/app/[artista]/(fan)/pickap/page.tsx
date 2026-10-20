import { getClubPrizes, getClubs, getEvents, getViewer } from "@/lib/api";
import { PicKapWheel } from "./PicKapWheel";

/** Cada fã clube tem sua roleta; os giros e pontos são do fã no ambiente do cantor. */
export default async function PicKapPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ clube?: string }>;
}) {
  const { artista } = await params;
  const { clube } = await searchParams;
  const [viewer, events, clubs] = await Promise.all([getViewer(artista), getEvents(artista), getClubs(artista)]);
  const mine = clubs.filter((c) => c.joined);
  const current = mine.find((c) => c.slug === clube) ?? mine[0] ?? null;
  const prizes = current ? await getClubPrizes(artista, current.slug) : [];
  const next = events[0];

  return (
    <PicKapWheel
      key={current?.slug ?? "none"}
      prizes={prizes}
      initialSpins={viewer.spins}
      nextEventId={next?.id ?? null}
      club={current ? { slug: current.slug, name: current.name } : null}
      clubs={mine.map((c) => ({ slug: c.slug, name: c.name }))}
      notJoined={clube && !mine.some((c) => c.slug === clube) ? (clubs.find((c) => c.slug === clube)?.name ?? null) : null}
    />
  );
}
