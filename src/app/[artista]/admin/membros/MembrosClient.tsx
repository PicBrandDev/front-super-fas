"use client";

import { useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FilterChips, SearchField } from "@/components/admin/controls";
import { Badge, btnPrimary, btnSecondary, tdClass, thClass, type Tone } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { Member, MemberStatus } from "@/lib/types";

type Filter = "todos" | "ativos" | "pendentes" | "cancelados";

const filterOptions: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Ativos" },
  { id: "pendentes", label: "Pendentes" },
  { id: "cancelados", label: "Cancelados" },
];

const filterStatus: Record<Exclude<Filter, "todos">, MemberStatus> = {
  ativos: "active",
  pendentes: "pending",
  cancelados: "canceled",
};

const statusLook: Record<MemberStatus, { label: string; tone: Tone }> = {
  active: { label: "Ativo", tone: "ok" },
  pending: { label: "Pagamento pendente", tone: "warn" },
  canceled: { label: "Cancelado", tone: "off" },
};

// Formatação local: a camada de dados (api.ts) importa os dados de exemplo e não deve ir para o cliente.
const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPoints = (n: number) => n.toLocaleString("pt-BR");

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Célula CSV com aspas quando precisa (separador ";" para abrir direto no Excel em pt-BR). */
const csvCell = (v: string | number) => {
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function MembrosClient({
  slug,
  artistName,
  priceCents,
  priceLabel,
  avatarColors,
  members: initialMembers,
}: {
  slug: string;
  artistName: string;
  priceCents: number;
  priceLabel: string;
  avatarColors: { bg: string; fg: string }[];
  members: Member[];
}) {
  const [overrides, setOverrides] = useState<Record<string, MemberStatus>>({});
  const [filter, setFilter] = useState<Filter>("todos");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(initialMembers[0]?.id ?? null);
  const [resent, setResent] = useState(false);
  const [announce, setAnnounce] = useState("");

  const members = initialMembers.map((m, i) => ({
    ...m,
    status: overrides[m.id] ?? m.status,
    colors: avatarColors[i % avatarColors.length] ?? { bg: "var(--color-adm-ink)", fg: "white" },
  }));
  const query = q.trim().toLowerCase();
  const rows = members
    .filter((m) => filter === "todos" || m.status === filterStatus[filter])
    .filter((m) => !query || `${m.name} ${m.handle}`.toLowerCase().includes(query));

  const active = members.filter((m) => m.status === "active").length;
  const pending = members.filter((m) => m.status === "pending").length;
  const canceled = members.filter((m) => m.status === "canceled").length;
  const stats = [
    { label: "Membros ativos", value: String(active) },
    { label: "Receita mensal", value: brl(active * priceCents) },
    { label: "Pagamento pendente", value: String(pending) },
    { label: "Cancelados", value: String(canceled) },
  ];

  const sel = members.find((m) => m.id === selId) ?? null;
  const plan = `${priceLabel}/mês`;

  const pick = (id: string) => {
    setSelId(id);
    setResent(false);
  };

  const resend = () => {
    // TODO: POST /artists/{slug}/members/{id}/charge
    setResent(true);
    if (sel) setAnnounce(`Cobrança reenviada para ${sel.name}.`);
  };

  const cancelSel = () => {
    if (!sel) return;
    // TODO: POST /artists/{slug}/members/{id}/cancel
    setOverrides((cur) => ({ ...cur, [sel.id]: "canceled" }));
    setAnnounce(`Assinatura de ${sel.name} cancelada.`);
  };

  const exportCsv = () => {
    const header = ["Nome", "Usuário", "Status", "Membro desde", "Pagamento", "Pontos", "Cidade"];
    const lines = rows.map((m) =>
      [m.name, m.handle, statusLook[m.status].label, m.since, m.payment, m.points, m.city].map(csvCell).join(";"),
    );
    const csv = "﻿" + [header.join(";"), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `membros-${slug}${filter === "todos" ? "" : `-${filter}`}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setAnnounce(`CSV com ${rows.length} ${rows.length === 1 ? "membro" : "membros"} exportado.`);
  };

  return (
    <>
      <AdminPageHeader
        title="Membros"
        description={`Todos os membros do fã clube ${artistName} · plano de ${plan}.`}
        actions={
          <button type="button" onClick={exportCsv} disabled={rows.length === 0} className={`${btnSecondary} disabled:cursor-not-allowed disabled:text-adm-disabled`}>
            <Icon name="download" size={16} strokeWidth={2.2} />
            Exportar CSV
          </button>
        }
      />

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))]">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 rounded-xl border border-adm-line bg-white p-4">
            <span className="font-adm-mono text-xs font-semibold text-adm-muted">{s.label}</span>
            <strong className="text-[26px] font-bold">{s.value}</strong>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField id="mb-search" label="Buscar membro" value={q} onChange={setQ} placeholder="Buscar por nome ou @usuário" />
        <FilterChips label="Filtrar por status" options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <div className="flex min-w-0 flex-[3_1_600px] flex-col gap-2">
          <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-adm-bg">
                  <th scope="col" className={thClass}>Membro</th>
                  <th scope="col" className={thClass}>Status</th>
                  <th scope="col" className={thClass}>Membro desde</th>
                  <th scope="col" className={thClass}>Pagamento</th>
                  <th scope="col" className={thClass}>Pontos</th>
                  <th scope="col" className={thClass}>
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const selected = m.id === selId;
                  const look = statusLook[m.status];
                  return (
                    <tr key={m.id} className={selected ? "bg-adm-blue-tint" : "bg-white"}>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="flex size-[34px] flex-none items-center justify-center rounded-full text-xs font-bold"
                            style={{ background: m.colors.bg, color: m.colors.fg }}
                          >
                            {initialsOf(m.name)}
                          </span>
                          <span className="flex flex-col">
                            <strong className="text-sm font-semibold">{m.name}</strong>
                            <span className="font-adm-mono text-xs text-adm-muted">{m.handle}</span>
                          </span>
                        </div>
                      </td>
                      <td className={tdClass}>
                        <Badge tone={look.tone}>{look.label}</Badge>
                      </td>
                      <td className={`${tdClass} font-adm-mono text-[13px]`}>{m.since}</td>
                      <td className={tdClass}>{m.payment}</td>
                      <td className={`${tdClass} font-adm-mono text-[13px]`}>{fmtPoints(m.points)}</td>
                      <td className={`${tdClass} text-right`}>
                        <button
                          type="button"
                          onClick={() => pick(m.id)}
                          aria-pressed={selected}
                          aria-controls="member-detail"
                          className={`inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-blue px-3 text-[13px] font-semibold ${
                            selected ? "bg-adm-blue text-white" : "bg-white text-adm-blue"
                          }`}
                        >
                          Ver<span className="sr-only"> {m.name}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhum membro encontrado.</p>}
          </div>
          <span className="font-adm-mono text-xs text-adm-muted">
            Mostrando {rows.length} de {members.length} membros
          </span>
        </div>

        {sel && (
          <aside
            id="member-detail"
            aria-label="Detalhes do membro"
            className="flex min-w-0 flex-[1_1_280px] flex-col gap-4 rounded-xl border border-adm-line bg-white p-5"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-[52px] flex-none items-center justify-center rounded-full text-base font-bold"
                style={{ background: sel.colors.bg, color: sel.colors.fg }}
              >
                {initialsOf(sel.name)}
              </span>
              <span className="flex flex-col gap-0.5">
                <strong className="text-[17px] font-bold">{sel.name}</strong>
                <span className="font-adm-mono text-xs text-adm-muted">{sel.handle}</span>
              </span>
            </div>
            <dl className="m-0 grid grid-cols-2 gap-3">
              <Detail label="Status" value={statusLook[sel.status].label} strong />
              <Detail label="Plano" value={plan} strong />
              <Detail label="Membro desde" value={sel.since} />
              <Detail label="Pagamento" value={sel.payment} />
              <Detail label="Cidade" value={sel.city} />
              <Detail label="Pontos da sorte" value={fmtPoints(sel.points)} />
            </dl>
            <div className="flex flex-col gap-2">
              <button type="button" className={btnPrimary}>
                Enviar mensagem
              </button>
              {sel.status === "pending" && (
                <button type="button" onClick={resend} disabled={resent} className={`${btnSecondary} disabled:cursor-default`}>
                  {resent ? "Cobrança reenviada ✓" : "Reenviar cobrança"}
                </button>
              )}
              {sel.status !== "canceled" && (
                <button
                  type="button"
                  onClick={cancelSel}
                  className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-adm-line bg-white px-4 text-sm font-semibold text-adm-danger"
                >
                  Cancelar assinatura
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </>
  );
}

function Detail({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="font-adm-mono text-[11px] font-semibold uppercase text-adm-muted">{label}</dt>
      <dd className={`m-0 text-sm ${strong ? "font-semibold" : ""}`}>{value}</dd>
    </div>
  );
}
