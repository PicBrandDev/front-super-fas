import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { btnSecondary } from "@/components/admin/ui";
import { authEnabled, homeFor, roleLabel } from "@/lib/auth";
import { getSession, listArtists } from "@/lib/api";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const session = await getSession();
  if (!session) {
    if (authEnabled()) redirect("/login");
    return (
      <AuthShell title="Minha conta" description="Modo exemplo: o login só funciona com o front ligado à API.">
        <Link href="/" className={`${btnSecondary} no-underline`}>
          Voltar
        </Link>
      </AuthShell>
    );
  }
  const artists = await listArtists();
  const panel = homeFor(session);

  return (
    <AuthShell title={session.name} description={roleLabel[session.role]}>
      <nav aria-label="Atalhos da conta" className="flex flex-col gap-2">
        {session.role !== "fan" && (
          <Link href={panel} className={`${btnSecondary} justify-start no-underline`}>
            Ir para o meu painel
          </Link>
        )}
        {artists.map((a) => (
          <Link key={a.slug} href={`/${a.slug}`} className={`${btnSecondary} justify-start no-underline`}>
            Fã clube {a.name}
          </Link>
        ))}
        <Link href="/conta/senha" className={`${btnSecondary} justify-start no-underline`}>
          Trocar senha
        </Link>
        <form action={logout}>
          <button type="submit" className={`${btnSecondary} w-full justify-start text-adm-danger`}>
            Sair
          </button>
        </form>
      </nav>
    </AuthShell>
  );
}
