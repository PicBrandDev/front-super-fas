import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { homeFor } from "@/lib/auth";
import { getSession } from "@/lib/api";
import { authArtist, withArtist, type AuthParams } from "@/lib/authArtist";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Trocar senha" };

export default async function SenhaPage({ searchParams }: { searchParams: Promise<AuthParams & { primeiro?: string }> }) {
  const params = await searchParams;
  const first = params.primeiro === "1";
  const [session, artist] = await Promise.all([getSession(), first ? null : authArtist(params)]);
  const ui = authLook(artist);
  // Depois de salvar: de volta ao fã clube de onde a pessoa veio, ou ao painel dela.
  const next = artist ? `/${artist.slug}` : "";
  return (
    <AuthShell
      artist={artist}
      title={first ? "Crie sua senha" : "Trocar senha"}
      description={
        first
          ? "Sua conta foi criada com uma senha provisória. Escolha uma senha só sua para continuar."
          : "Digite a senha atual e escolha uma nova."
      }
      footer={
        !first && session ? (
          <Link href={artist ? withArtist("/conta", artist.slug) : homeFor(session)} className={ui.link}>
            Voltar
          </Link>
        ) : undefined
      }
    >
      <PasswordForm first={first} next={next} />
    </AuthShell>
  );
}
