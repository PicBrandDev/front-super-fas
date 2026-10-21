import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { listArtists } from "@/lib/api";
import { artistSlugFrom, withArtist, type AuthParams } from "@/lib/authArtist";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<AuthParams> }) {
  const params = await searchParams;
  const artists = await listArtists();
  // O contexto só vale para um artista que está no ar.
  const slug = artistSlugFrom(params);
  const artist = artists.find((a) => a.slug === slug) ?? null;
  const ui = authLook(artist);
  return (
    <AuthShell
      artist={artist}
      title="Criar conta de fã"
      description={
        artist
          ? `Você já entra no fã clube de ${artist.name}: mural, PicKap, agenda e fotos dos shows.`
          : "Entre no fã clube, poste no mural, gire o PicKap e ache suas fotos dos shows."
      }
      footer={
        <>
          Já tem conta?{" "}
          <Link href={withArtist("/login", artist?.slug)} className={ui.link}>
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm clubs={artists.map((a) => ({ slug: a.slug, name: a.name }))} preset={artist?.slug} />
    </AuthShell>
  );
}
