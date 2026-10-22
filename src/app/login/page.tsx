import { redirect } from "next/navigation";
import { artistSlugFrom, type AuthParams } from "@/lib/authArtist";

/** Endereço antigo: cada público entra pela sua tela (`/`, `/{artista}/login`, `/patrocinador/login`). */
export default async function LoginPage({ searchParams }: { searchParams: Promise<AuthParams> }) {
  const params = await searchParams;
  const slug = artistSlugFrom(params);
  if (!slug) redirect("/");
  redirect(`/${slug}/login${params.next ? `?next=${encodeURIComponent(params.next)}` : ""}`);
}
