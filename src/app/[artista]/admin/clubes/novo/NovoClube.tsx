"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createClub, type InviteResult } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminNotice, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";

const empty = { name: "", city: "", description: "", ownerEmail: "", ownerName: "" };

/** Formulário direto de novo fã clube (sem a lista): nome, cidade e o dono, que recebe o convite por e-mail. */
export function NovoClube({ artist, artistName }: { artist: string; artistName: string }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [done, setDone] = useState<{ name: string; invite: InviteResult | null } | null>(null);
  const [pending, start] = useTransition();

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setError("Dê um nome ao fã clube.");
    if (form.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
      return setError("Digite um e-mail válido para o dono.");
    }
    start(async () => {
      const res = await createClub(artist, {
        name: form.name.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerName: form.ownerName.trim(),
      });
      if (!res.ok) return setError(res.error);
      setError("");
      setForm(empty);
      setDone({ name: res.data.club.name, invite: res.data.invite });
      router.refresh();
    });
  };

  if (done) {
    return (
      <>
        <AdminPageHeader title="Fã clube criado" headingId="novo-title" description={`${done.name} já está no ambiente de ${artistName}.`} />
        {done.invite && (
          <TempPasswordNotice
            email={done.invite.email}
            password={done.invite.tempPassword}
            emailSent={done.invite.emailSent}
            onClose={() => setDone({ ...done, invite: null })}
          />
        )}
        <div className="flex flex-wrap gap-2.5">
          <Link href={`/${artist}/admin`} className={`${btnPrimary} no-underline`}>
            Voltar ao painel
          </Link>
          <button type="button" onClick={() => setDone(null)} className={btnSecondary}>
            Criar outro fã clube
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Novo fã clube"
        headingId="novo-title"
        description={`Preencha os dados. Se informar o e-mail do dono, ele recebe o convite para assumir o fã clube de ${artistName}.`}
      />
      <form onSubmit={submit} noValidate aria-labelledby="novo-title" className="flex max-w-[640px] flex-col gap-4 rounded-xl border border-adm-line bg-white p-5">
        {error && <AdminNotice tone="error">{error}</AdminNotice>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-name" className="text-[13px] font-semibold">
              Nome do fã clube *
            </label>
            <input id="nc-name" autoFocus value={form.name} onChange={set("name")} placeholder="Ex.: Fã Clube de São Paulo" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-city" className="text-[13px] font-semibold">
              Cidade ou região
            </label>
            <input id="nc-city" value={form.city} onChange={set("city")} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="nc-desc" className="text-[13px] font-semibold">
              Descrição
            </label>
            <input id="nc-desc" value={form.description} onChange={set("description")} maxLength={300} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-owner" className="text-[13px] font-semibold">
              E-mail do dono
            </label>
            <input id="nc-owner" type="email" value={form.ownerEmail} onChange={set("ownerEmail")} aria-describedby="nc-owner-hint" className={inputClass} />
            <span id="nc-owner-hint" className="text-xs text-adm-muted">
              O dono recebe um e-mail com o convite e o acesso. Pode deixar para depois.
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nc-owner-name" className="text-[13px] font-semibold">
              Nome do dono
            </label>
            <input id="nc-owner-name" value={form.ownerName} onChange={set("ownerName")} className={inputClass} />
          </div>
        </div>
        <div className="flex justify-end gap-2.5">
          <Link href={`/${artist}/admin`} className={`${btnSecondary} no-underline`}>
            Cancelar
          </Link>
          <button type="submit" disabled={pending} aria-busy={pending} className={btnPrimary}>
            {pending ? "Criando…" : "Criar fã clube"}
          </button>
        </div>
      </form>
    </>
  );
}
