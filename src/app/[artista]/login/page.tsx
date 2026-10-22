import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { getArtist } from "@/lib/api";
import { LoginForm } from "@/app/login/LoginForm";

export const metadata: Metadata = { title: "Entrar" };

/** Entrada única do ambiente do artista: fãs, donos de fã clube e equipe entram por aqui. */
export default async function ArtistLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ artista: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { artista } = await params;
  const { next } = await searchParams;
  const artist = await getArtist(artista);
  if (!artist) notFound();
  const ui = authLook(artist);
  return (
    <AuthShell
      artist={artist}
      title="Entrar"
      description={`Fãs, donos de fã clube e equipe: entre com a sua conta para acessar o ambiente de ${artist.name}.`}
      footer={
        <>
          É fã e ainda não tem conta?{" "}
          <Link href={`/${artist.slug}/cadastro`} className={ui.link}>
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm next={next ?? ""} artista={artist.slug} />
    </AuthShell>
  );
}
