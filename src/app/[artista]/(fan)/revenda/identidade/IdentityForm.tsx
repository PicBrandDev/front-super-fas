"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveIdentity } from "@/app/actions/resale";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { DemoTag, PageHead } from "@/components/fan/resale/parts";
import type { Identity } from "@/lib/resale";

const maskCpf = (v: string) =>
  v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

const maskPhone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function IdentityForm({ identity, next, demo }: { identity: Identity | null; next: string; demo: boolean }) {
  const { slug, base } = useArtist();
  const router = useRouter();
  const toast = useToast();
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(identity);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const cpfLocked = !!saved?.hasCpf;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cpfDigits = cpf.replace(/\D/g, "");
    const phoneDigits = phone.replace(/\D/g, "");
    // A API pede o CPF junto com o telefone; depois de salvo, ele só confirma (outro CPF é recusado com CPF_LOCKED).
    if (cpfDigits.length !== 11) return setError(cpfLocked ? "Digite seu CPF para confirmar." : "O CPF tem 11 números.");
    if (phoneDigits.length < 10) return setError("Informe o telefone com DDD.");
    start(async () => {
      const r = await saveIdentity(slug, cpfDigits, phoneDigits);
      if (r.ok) {
        setSaved(r.data);
        setCpf("");
        setPhone("");
        toast.show("Dados salvos.");
        router.push(next);
        return;
      }
      if (r.status === 0) {
        toast.show("Exemplo: com a API ligada, seus dados ficam salvos cifrados.");
        return;
      }
      setError(r.error);
    });
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <PageHead
        back={`${base}/revenda`}
        backLabel="Revenda"
        title="CPF e telefone"
        text="Para vender na revenda. Ficam guardados cifrados e ninguém do app vê: nem o comprador, nem outros fãs."
        aside={demo ? <DemoTag /> : undefined}
      />

      {saved && (saved.hasCpf || saved.hasPhone) && (
        <dl className="m-0 grid grid-cols-2 gap-4 border-y border-line py-4">
          <div className="grid gap-1">
            <dt className="mono">CPF</dt>
            <dd className="num m-0 text-[17px] font-bold">{saved.cpfMasked || "Não informado"}</dd>
          </div>
          <div className="grid gap-1">
            <dt className="mono">Telefone</dt>
            <dd className="num m-0 text-[17px] font-bold">{saved.phoneMasked || "Não informado"}</dd>
          </div>
        </dl>
      )}

      <form onSubmit={submit} className="grid gap-5" noValidate>
        {!cpfLocked && (
          <div className="grid gap-2">
            <label className="mono" htmlFor="id-cpf">
              CPF
            </label>
            <input id="id-cpf" className="field num" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />
            <span className="text-[13px] leading-[18px] text-fg-muted">Depois de salvo, o CPF não pode ser trocado.</span>
          </div>
        )}
        {cpfLocked && (
          <div className="grid gap-2">
            <label className="mono" htmlFor="id-cpf">
              Confirme seu CPF para trocar o telefone
            </label>
            <input id="id-cpf" className="field num" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCpf(e.target.value))} />
          </div>
        )}
        <div className="grid gap-2">
          <label className="mono" htmlFor="id-phone">
            {saved?.hasPhone ? "Novo telefone" : "Telefone"}
          </label>
          <input id="id-phone" className="field num" inputMode="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} />
        </div>
        {error && <Notice tone="error">{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-block" disabled={pending}>
          {pending ? "Salvando…" : "Salvar"}
        </button>
      </form>
    </div>
  );
}
