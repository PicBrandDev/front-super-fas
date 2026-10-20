import { getEvents, getPrizes, getViewer } from "@/lib/api";
import { PicKapWheel } from "./PicKapWheel";

export default async function PicKapPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const [prizes, viewer, events] = await Promise.all([getPrizes(artista), getViewer(artista), getEvents(artista)]);
  const next = events[0];

  return <PicKapWheel prizes={prizes} initialSpins={viewer.spins} nextEventId={next?.id ?? null} />;
}
