import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { AdminEmpty, btnSecondary } from "@/components/admin/ui";
import { getMyStaff, getSession } from "@/lib/api";

export const metadata: Metadata = { title: "Seus painéis" };

/** Para quem está na equipe de mais de um fã clube: escolher qual painel abrir. */
export default async function PainelPage() {
  const [session, positions] = await Promise.all([getSession(), getMyStaff()]);
  const envs = new Set(session?.artists ?? []);

  return (
    <AuthShell title="Seus painéis" description="Escolha o que você quer administrar agora.">
      <nav aria-label="Painéis" className="flex flex-col gap-2">
        {session?.role === "master" && (
          <Link href="/admin/fas-clubes" className={`${btnSecondary} justify-start no-underline`}>
            Admin da plataforma
          </Link>
        )}
        {[...envs].map((a) => {
          const name = positions.find((p) => p.artist === a)?.artistName ?? a;
          return (
            <Link key={`env-${a}`} href={`/${a}/admin`} className={`${btnSecondary} h-auto min-h-14 flex-col items-start justify-center gap-0 py-2 no-underline`}>
              <span>Ambiente {name}</span>
              <span className="text-xs font-normal text-adm-muted">Admin master do cantor · conteúdo oficial e fã clubes</span>
            </Link>
          );
        })}
        {positions.map((p) => (
          <Link
            key={`${p.artist}/${p.club}`}
            href={`/${p.artist}/clubes/${p.club}/admin`}
            className={`${btnSecondary} h-auto min-h-14 flex-col items-start justify-center gap-0 py-2 no-underline`}
          >
            <span>{p.clubName}</span>
            <span className="text-xs font-normal text-adm-muted">
              {p.artistName} · {p.role === "owner" ? "Dono" : "Ajudante"}
              {p.isMaster ? " · fã clube master" : ""}
            </span>
          </Link>
        ))}
        {positions.length === 0 && envs.size === 0 && session?.role !== "master" && (
          <AdminEmpty
            title="Nenhum painel para você"
            text="Você não está na equipe de nenhum fã clube. Quem administra um fã clube pode te convidar."
            action={
              <Link href="/" className={`${btnSecondary} no-underline`}>
                Ir para a entrada
              </Link>
            }
          />
        )}
        <form action={logout} className="mt-2">
          <button type="submit" className={`${btnSecondary} w-full justify-start text-adm-danger`}>
            Sair
          </button>
        </form>
      </nav>
    </AuthShell>
  );
}
