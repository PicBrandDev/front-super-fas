import type { Metadata } from "next";
import { apiEnabled, getProfile } from "@/lib/api";
import { AddressForm } from "./AddressForm";

export const metadata: Metadata = { title: "Seu endereço" };

export default async function ResaleAddressPage({ params, searchParams }: { params: Promise<{ artista: string }>; searchParams: Promise<{ voltar?: string }> }) {
  const { artista } = await params;
  const { voltar } = await searchParams;
  const p = await getProfile();
  // Só volta para dentro da revenda deste artista.
  const next = voltar && voltar.startsWith(`/${artista}/revenda`) && !voltar.includes("//") ? voltar : `/${artista}/revenda`;
  const initial = {
    zipCode: p?.zipCode ?? "",
    street: p?.street ?? "",
    number: p?.number ?? "",
    complement: p?.complement ?? "",
    neighborhood: p?.neighborhood ?? "",
    city: p?.city ?? "",
    state: p?.state ?? "",
  };
  return <AddressForm initial={initial} next={next} demo={!apiEnabled()} />;
}
