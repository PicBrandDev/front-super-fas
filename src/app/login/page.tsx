import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { authArtist, withArtist, type AuthParams } from "@/lib/authArtist";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<AuthParams> }) {
  const params = await searchParams;
  const artist = await authArtist(params);
  const ui = authLook(artist);
  return (
    <AuthShell
      artist={artist}
      title="Entrar"
      description={
        artist ? `Entre para ver o mural, a agenda e o PicKap de ${artist.name}.` : "Fãs, administradores e patrocinadores entram por aqui."
      }
      footer={
        <>
          É fã e ainda não tem conta?{" "}
          <Link href={withArtist("/cadastro", artist?.slug)} className={ui.link}>
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm next={params.next ?? (artist ? `/${artist.slug}` : "")} />
    </AuthShell>
  );
}
