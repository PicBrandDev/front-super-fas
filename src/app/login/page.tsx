import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Entrar"
      description="Fãs, administradores e patrocinadores entram por aqui."
      footer={
        <>
          É fã e ainda não tem conta?{" "}
          <Link href="/cadastro" className="font-semibold text-adm-blue">
            Criar conta
          </Link>
        </>
      }
    >
      <LoginForm next={next ?? ""} />
    </AuthShell>
  );
}
