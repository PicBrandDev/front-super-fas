import Link from "next/link";
import { AuthShell, authLook } from "@/components/auth/AuthShell";
import { homeFor } from "@/lib/auth";
import { getSession } from "@/lib/api";
import { authArtist } from "@/lib/authArtist";
import { PasswordForm } from "../PasswordForm";

/** Trocar senha. Com `slug`, dentro do ambiente de um artista (`/{artista}/conta/senha`). */
export async function SenhaView({ slug, first }: { slug: string | null; first: boolean }) {
  const [session, artist] = await Promise.all([getSession(), authArtist({ artista: slug ?? undefined })]);
  const ui = authLook(artist);
  // Depois de salvar: de volta ao fã clube de onde a pessoa veio, ou ao painel dela.
  const next = artist && !first ? `/${artist.slug}` : "";
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
          <Link href={artist ? `/${artist.slug}/conta` : homeFor(session)} className={ui.link}>
            Voltar
          </Link>
        ) : undefined
      }
    >
      <PasswordForm first={first} next={next} />
    </AuthShell>
  );
}
