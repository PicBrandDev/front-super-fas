"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { inviteStaff, removeStaff, type InviteResult } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { Badge, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import type { StaffMember } from "@/lib/types";

const MAX_STAFF = 10;

/**
 * Equipe de um fã clube: 1 dono + ajudantes (até 10 pessoas).
 * O dono convida ajudantes; quem escolhe/troca o dono é a administração do ambiente.
 */
export function StaffClient({
  artist,
  club,
  clubName,
  staff,
  canSetOwner,
}: {
  artist: string;
  club: string;
  clubName: string;
  staff: StaffMember[];
  canSetOwner: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [role, setRole] = useState<"helper" | "owner">("helper");
  const [error, setError] = useState("");
  const [invited, setInvited] = useState<InviteResult | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const full = staff.length >= MAX_STAFF && role === "helper";
  const owner = staff.find((s) => s.role === "owner");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }
    start(async () => {
      const res = await inviteStaff(artist, club, { email: email.trim(), name: name.trim(), role, roleLabel: label.trim() });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setInvited(res.data);
      setEmail("");
      setName("");
      setLabel("");
      setRole("helper");
      setError("");
      router.refresh();
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await removeStaff(artist, club, id);
      if (!res.ok) setError(res.error);
      setConfirm(null);
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Equipe"
        description={`Quem administra o ${clubName}: o dono e os ajudantes (até ${MAX_STAFF} pessoas). Cada convite cria uma conta com senha provisória.`}
      />

      {invited && <TempPasswordNotice email={invited.email} password={invited.tempPassword} onClose={() => setInvited(null)} />}

      <form onSubmit={submit} noValidate className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
        <h2 className="m-0 text-base font-bold">
          Convidar para a equipe{" "}
          <span className="font-adm-mono text-[13px] font-semibold text-adm-muted">
            ({staff.length}/{MAX_STAFF})
          </span>
        </h2>
        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
            {error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="st-email" className="text-[13px] font-semibold">
              E-mail *
            </label>
            <input id="st-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="st-name" className="text-[13px] font-semibold">
              Nome
            </label>
            <input id="st-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="st-label" className="text-[13px] font-semibold">
              Função
            </label>
            <input id="st-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex.: Moderação" className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="st-role" className="text-[13px] font-semibold">
              Papel
            </label>
            <select id="st-role" value={role} onChange={(e) => setRole(e.target.value as "helper" | "owner")} className={inputClass}>
              <option value="helper">Ajudante</option>
              {canSetOwner && <option value="owner">{owner ? "Novo dono (o atual vira ajudante)" : "Dono do fã clube"}</option>}
            </select>
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={full || pending} className={btnPrimary}>
            {full ? "Equipe completa" : pending ? "Convidando…" : "Convidar"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Nome</th>
              <th scope="col" className={thClass}>E-mail</th>
              <th scope="col" className={thClass}>Papel</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id}>
                <td className={`${tdClass} font-semibold`}>
                  <span className="flex flex-wrap items-center gap-2">
                    {s.name}
                    {s.pending && <Badge tone="warn">Senha provisória</Badge>}
                  </span>
                </td>
                <td className={tdClass}>{s.email}</td>
                <td className={tdClass}>
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge tone={s.role === "owner" ? "info" : "off"}>{s.role === "owner" ? "Dono" : "Ajudante"}</Badge>
                    {s.roleLabel && s.roleLabel !== "Dono do fã clube" && s.roleLabel !== "Ajudante" && (
                      <span className="text-xs text-adm-muted">{s.roleLabel}</span>
                    )}
                  </span>
                </td>
                <td className={tdClass}>
                  {(s.role !== "owner" || canSetOwner) && (
                    <div className="flex justify-end gap-2">
                      {confirm === s.id ? (
                        <>
                          <button type="button" onClick={() => setConfirm(null)} className={btnSecondary}>
                            Manter
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(s.id)}
                            disabled={pending}
                            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-adm-danger px-3 text-sm font-semibold text-white"
                          >
                            Remover acesso
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirm(s.id)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                        >
                          Remover<span className="sr-only"> {s.name}</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {staff.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Ninguém na equipe ainda.</p>}
      </div>
    </>
  );
}
