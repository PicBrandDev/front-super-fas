import { redirect } from "next/navigation";
import { artistSlugFrom, type AuthParams } from "@/lib/authArtist";

/** Endereço antigo: o cadastro é por ambiente (`/{artista}/cadastro`). */
export default async function CadastroPage({ searchParams }: { searchParams: Promise<AuthParams> }) {
  const slug = artistSlugFrom(await searchParams);
  redirect(slug ? `/${slug}/cadastro` : "/");
}
