import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { getArtist } from "@/lib/api";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

/** Cadastro de fã no ambiente de um artista: a conta nasce já dentro daquele fã clube. */
export default async function ArtistCadastroPage({ params }: { params: Promise<{ artista: string }> }) {
  const { artista } = await params;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const ui = authLook(artist);
  return (
    <AuthShell
      artist={artist}
      title="Criar conta de fã"
      description={`Você já entra no fã clube de ${artist.name}: mural, PicKup, agenda e fotos dos shows.`}
      footer={
        <>
          Já tem conta?{" "}
          <Link href={`/${artist.slug}/login`} className={ui.link}>
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm artista={artist.slug} />
    </AuthShell>
  );
}
