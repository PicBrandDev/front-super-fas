"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveAddress } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import { UFS } from "@/lib/ufs";
import type { Profile } from "@/lib/types";

const maskCep = (v: string) => v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export type AddressValues = Pick<Profile, "zipCode" | "street" | "number" | "complement" | "neighborhood" | "city" | "state">;

export function AddressForm({ initial, next, demo }: { initial: AddressValues; next: string; demo: boolean }) {
  const { slug, base } = useArtist();
  const router = useRouter();
  const toast = useToast();
  const [v, setV] = useState<AddressValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const set = (k: keyof AddressValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((x) => ({ ...x, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\d{5}-?\d{3}$/.test(v.zipCode)) return setError("Digite um CEP válido (8 números).");
    if (!v.street.trim() || !v.number.trim() || !v.neighborhood.trim() || !v.city.trim()) return setError("Preencha rua, número, bairro e cidade.");
    if (!UFS.includes(v.state)) return setError("Escolha o estado.");
    start(async () => {
      const r = await saveAddress(slug, v);
      if (r.ok) {
        toast.show("Endereço salvo.");
        router.push(next);
        return;
      }
      if (r.status === 0) {
        toast.show("Exemplo: com a API ligada, o endereço fica salvo no seu cadastro.");
        return;
      }
      setError(r.error);
    });
  }

  const field = (k: keyof AddressValues, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="grid gap-2">
      <label className="mono" htmlFor={`end-${k}`}>
        {label}
      </label>
      <input id={`end-${k}`} className="field" value={v[k]} onChange={set(k)} {...props} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead
        back={`${base}/revenda`}
        backLabel="Revenda"
        title="Seu endereço"
        text="A revenda pede endereço completo de quem compra e de quem vende. Ninguém do app vê."
        aside={demo ? <DemoTag /> : undefined}
      />
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div className="grid grid-cols-[1fr_auto] gap-4">
          {field("zipCode", "CEP", { inputMode: "numeric", autoComplete: "postal-code", placeholder: "00000-000", value: v.zipCode, onChange: (e) => setV((x) => ({ ...x, zipCode: maskCep(e.target.value) })) })}
          <div className="grid gap-2">
            <label className="mono" htmlFor="end-state">
              UF
            </label>
            <select id="end-state" className="field w-[84px]" value={v.state} onChange={set("state")} autoComplete="address-level1">
              <option value="">—</option>
              {UFS.map((uf) => (
                <option key={uf} value={uf}>
                  {uf}
                </option>
              ))}
            </select>
          </div>
        </div>
        {field("street", "Rua", { autoComplete: "address-line1" })}
        <div className="grid grid-cols-[120px_1fr] gap-4">
          {field("number", "Número", { autoComplete: "off", inputMode: "numeric" })}
          {field("complement", "Complemento (opcional)", { autoComplete: "address-line2" })}
        </div>
        {field("neighborhood", "Bairro")}
        {field("city", "Cidade", { autoComplete: "address-level2" })}
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
          {pending ? "Salvando…" : "Salvar endereço"}
        </button>
      </form>
    </div>
  );
}
