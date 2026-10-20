import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { listArtists } from "@/lib/api";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage() {
  const artists = await listArtists();
  return (
    <AuthShell
      title="Criar conta de fã"
      description="Entre no fã clube, poste no mural, gire o PicKap e ache suas fotos dos shows."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-adm-blue">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm clubs={artists.map((a) => ({ slug: a.slug, name: a.name }))} />
    </AuthShell>
  );
}
