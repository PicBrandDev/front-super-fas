import { getTracks } from "@/lib/api";
import { DropsPlayer } from "./DropsPlayer";

export default async function DropsPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const tracks = await getTracks(artista);

  return <DropsPlayer tracks={tracks} />;
}
