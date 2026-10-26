import type { Metadata } from "next";
import { apiEnabled, getIdentity } from "@/lib/api";
import { IdentityForm } from "./IdentityForm";

export const metadata: Metadata = { title: "CPF e telefone" };

export default async function ResaleIdentityPage({ params, searchParams }: { params: Promise<{ artista: string }>; searchParams: Promise<{ voltar?: string }> }) {
  const { artista } = await params;
  const { voltar } = await searchParams;
  const res = await getIdentity();
  // Só volta para dentro da revenda deste artista.
  const next = voltar && voltar.startsWith(`/${artista}/revenda`) && !voltar.includes("//") ? voltar : `/${artista}/revenda`;
  return <IdentityForm identity={res.ok ? res.data : null} next={next} demo={!apiEnabled()} />;
}
