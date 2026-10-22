import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/app/login/LoginForm";

export const metadata: Metadata = { title: "Portal do patrocinador" };

/** Entrada de quem compra anúncio na plataforma. */
export default async function SponsorLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Portal do patrocinador"
      description="Entre para comprar e acompanhar anúncios nos fã clubes da plataforma."
    >
      <LoginForm next={next ?? ""} />
    </AuthShell>
  );
}
