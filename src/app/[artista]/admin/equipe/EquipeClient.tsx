"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { inviteClubAdmin, removeClubAdmin, type InviteResult } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { Badge, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";

export type TeamMember = { id?: string; name: string; email?: string; role: string; pending?: boolean };

const MAX_ADMINS = 10;

export function EquipeClient({ slug, team }: { slug: string; team: TeamMember[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [invited, setInvited] = useState<InviteResult | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const full = team.length >= MAX_ADMINS;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Digite um e-mail válido.");
      return;
    }
    start(async () => {
      const res = await inviteClubAdmin(slug, { email: email.trim(), name: name.trim(), role: role.trim() || "Administrador" });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setInvited(res.data);
      setEmail("");
      setName("");
      setRole("");
      setError("");
      router.refresh();
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await removeClubAdmin(slug, id);
      if (!res.ok) setError(res.error);
      setConfirm(null);
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Equipe"
        description={`Quem administra este fã clube (até ${MAX_ADMINS} pessoas). Cada convite cria uma conta com senha provisória.`}
      />

      {invited && <TempPasswordNotice email={invited.email} password={invited.tempPassword} onClose={() => setInvited(null)} />}

      <form onSubmit={submit} noValidate className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
        <h2 className="m-0 text-base font-bold">
          Convidar administrador{" "}
          <span className="font-adm-mono text-[13px] font-semibold text-adm-muted">
            ({team.length}/{MAX_ADMINS})
          </span>
        </h2>
        {error && (
          <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
            {error}
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="eq-email" className="text-[13px] font-semibold">
              E-mail *
            </label>
            <input id="eq-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={full} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="eq-name" className="text-[13px] font-semibold">
              Nome
            </label>
            <input id="eq-name" value={name} onChange={(e) => setName(e.target.value)} disabled={full} className={inputClass} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="eq-role" className="text-[13px] font-semibold">
              Função
            </label>
            <input
              id="eq-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex.: Agenda e eventos"
              disabled={full}
              className={inputClass}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={full || pending} className={btnPrimary}>
            {full ? "Equipe completa" : pending ? "Convidando…" : "Convidar"}
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Nome</th>
              <th scope="col" className={thClass}>E-mail</th>
              <th scope="col" className={thClass}>Função</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {team.map((t, i) => (
              <tr key={t.id ?? i}>
                <td className={`${tdClass} font-semibold`}>
                  <span className="flex flex-wrap items-center gap-2">
                    {t.name}
                    {t.pending && <Badge tone="warn">Senha provisória</Badge>}
                  </span>
                </td>
                <td className={tdClass}>{t.email ?? "—"}</td>
                <td className={tdClass}>{t.role}</td>
                <td className={tdClass}>
                  {t.id && (
                    <div className="flex justify-end gap-2">
                      {confirm === t.id ? (
                        <>
                          <button type="button" onClick={() => setConfirm(null)} className={btnSecondary}>
                            Manter
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(t.id!)}
                            disabled={pending}
                            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-adm-danger px-3 text-sm font-semibold text-white"
                          >
                            Remover acesso
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirm(t.id!)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                        >
                          Remover<span className="sr-only"> {t.name}</span>
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {team.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhum administrador ainda.</p>}
      </div>
    </>
  );
}
