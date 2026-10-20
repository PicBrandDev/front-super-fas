import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { homeFor } from "@/lib/auth";
import { getSession } from "@/lib/api";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Trocar senha" };

export default async function SenhaPage({ searchParams }: { searchParams: Promise<{ primeiro?: string }> }) {
  const { primeiro } = await searchParams;
  const session = await getSession();
  const first = primeiro === "1";
  return (
    <AuthShell
      title={first ? "Crie sua senha" : "Trocar senha"}
      description={
        first
          ? "Sua conta foi criada com uma senha provisória. Escolha uma senha só sua para continuar."
          : "Digite a senha atual e escolha uma nova."
      }
      footer={
        !first && session ? (
          <Link href={homeFor(session)} className="font-semibold text-adm-blue">
            Voltar
          </Link>
        ) : undefined
      }
    >
      <PasswordForm first={first} />
    </AuthShell>
  );
}
