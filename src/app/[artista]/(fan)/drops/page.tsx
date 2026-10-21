import { redirect } from "next/navigation";

/** Os Drops moram na aba Drops do Mural. */
export default async function DropsPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  redirect(`/${artista}/mural?aba=drops`);
}
