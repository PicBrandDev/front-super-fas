"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { createClub, deleteClub, updateClub, type InviteResult } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminEmpty, AdminNotice, Badge, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { FanClub } from "@/lib/types";

const MAX_CLUBS = 10;

/** Os até 10 fã clubes do ambiente: criar, escolher o dono, colocar no ar e apagar. */
export function ClubesManager({ artist, artistName, clubs }: { artist: string; artistName: string; clubs: FanClub[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", description: "", ownerEmail: "", ownerName: "" });
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const full = clubs.length >= MAX_CLUBS;

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      setError("Dê um nome ao fã clube.");
      return;
    }
    if (form.ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.ownerEmail.trim())) {
      setError("Digite um e-mail válido para o dono.");
      return;
    }
    start(async () => {
      const res = await createClub(artist, {
        name: form.name.trim(),
        city: form.city.trim(),
        description: form.description.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerName: form.ownerName.trim(),
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setInvite(res.data.invite);
      setAnnounce(`${res.data.club.name} criado.`);
      setForm({ name: "", city: "", description: "", ownerEmail: "", ownerName: "" });
      setError("");
      setOpen(false);
      router.refresh();
    });
  };

  const run = (call: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const res = await call();
      if (!res.ok) {
        setError(res.error ?? "Não deu certo.");
        return;
      }
      setError("");
      setAnnounce(done);
      router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Fã clubes"
        headingId="clubes-title"
        description={`Até ${MAX_CLUBS} fã clubes no ambiente de ${artistName}: o master (de vocês) e mais ${MAX_CLUBS - 1}. Cada um tem um dono, que convida os ajudantes dele.`}
        actions={
          <button type="button" onClick={() => setOpen(true)} disabled={full || open} className={btnPrimary}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            {full ? `Limite de ${MAX_CLUBS} fã clubes` : "Criar fã clube"}
          </button>
        }
      />
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {invite && <TempPasswordNotice email={invite.email} password={invite.tempPassword} onClose={() => setInvite(null)} />}
      {error && !open && <AdminNotice tone="error">{error}</AdminNotice>}
      <p className="m-0 flex flex-wrap items-center gap-2 text-sm text-adm-muted">
        <span className="font-adm-mono text-[13px] font-semibold text-adm-ink">
          {clubs.length}/{MAX_CLUBS}
        </span>
        fã clubes criados{full ? " (limite atingido)" : ""}.
      </p>

      {open && (
        <form onSubmit={submit} noValidate aria-label="Novo fã clube" className="flex flex-col gap-4 rounded-xl border border-adm-blue bg-white p-5">
          <h2 className="m-0 text-base font-bold">Novo fã clube</h2>
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
              <input
                id="nc-owner"
                type="email"
                value={form.ownerEmail}
                onChange={set("ownerEmail")}
                aria-describedby="nc-owner-hint"
                className={inputClass}
              />
              <span id="nc-owner-hint" className="text-xs text-adm-muted">
                Cria a conta do dono com senha provisória. Pode deixar para depois.
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
            <button type="button" onClick={() => setOpen(false)} className={btnSecondary}>
              Cancelar
            </button>
            <button type="submit" disabled={pending} aria-busy={pending} className={btnPrimary}>
              {pending ? "Criando…" : "Criar fã clube"}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Fã clube</th>
              <th scope="col" className={thClass}>Dono</th>
              <th scope="col" className={thClass}>Membros</th>
              <th scope="col" className={thClass}>Status</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((c) => (
              <tr key={c.id}>
                <td className={tdClass}>
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-[15px]">{c.name}</strong>
                    {c.isMaster && <Badge tone="info">Master</Badge>}
                  </span>
                  <span className="block font-adm-mono text-xs text-adm-muted">
                    /{artist}/clubes/{c.slug}
                    {c.city && ` · ${c.city}`}
                  </span>
                </td>
                <td className={tdClass}>{c.owner?.name ?? <span className="text-adm-muted">Sem dono</span>}</td>
                <td className={`${tdClass} font-adm-mono text-[13px]`}>{c.members.toLocaleString("pt-BR")}</td>
                <td className={tdClass}>
                  <Badge tone={c.status === "active" ? "ok" : "off"}>{c.status === "active" ? "No ar" : "Fora do ar"}</Badge>
                </td>
                <td className={tdClass}>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/${artist}/clubes/${c.slug}/admin`}
                      className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-ink no-underline hover:border-adm-ink"
                    >
                      Painel do clube<span className="sr-only"> {c.name}</span>
                    </Link>
                    {!c.isMaster && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          run(
                            () => updateClub(artist, c.slug, { status: c.status === "active" ? "setup" : "active" }),
                            c.status === "active" ? `${c.name} saiu do ar.` : `${c.name} está no ar.`,
                          )
                        }
                        className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-blue bg-white px-3 text-[13px] font-semibold text-adm-blue"
                      >
                        {c.status === "active" ? "Tirar do ar" : "Colocar no ar"}
                        <span className="sr-only"> {c.name}</span>
                      </button>
                    )}
                    {!c.isMaster && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (window.confirm(`Apagar o fã clube "${c.name}"? Os membros saem do clube e isso não tem volta.`)) {
                            run(() => deleteClub(artist, c.slug), `${c.name} apagado.`);
                          }
                        }}
                        className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                      >
                        Apagar<span className="sr-only"> {c.name}</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clubs.length === 0 && (
          <div className="p-3">
            <AdminEmpty
              title="Nenhum fã clube ainda"
              text="Crie o primeiro fã clube do ambiente e escolha quem vai ser o dono."
              action={
                <button type="button" onClick={() => setOpen(true)} disabled={open} className={btnPrimary}>
                  Criar fã clube
                </button>
              }
            />
          </div>
        )}
      </div>
      <p className="m-0 text-sm text-adm-muted">Para trocar o dono de um clube, abra o painel dele, em Equipe.</p>
    </>
  );
}
