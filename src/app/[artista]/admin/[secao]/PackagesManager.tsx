"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { deleteContent, saveContent } from "@/app/actions/admin";
import { AdminEmpty, AdminNotice, Badge, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { formatBRL } from "@/lib/format";
import type { AgencyAdmin, PackageAdmin, PackageItem } from "@/lib/types";

type Draft = {
  agencyId: string;
  name: string;
  description: string;
  transferDetails: string;
  url: string;
  active: boolean;
  items: { kind: "ticket" | "transfer" | "seal" | "photo"; label: string; price: string; soldOut: boolean }[];
};

const priceText = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const parsePrice = (s: string) => {
  const n = Number(s.trim().replace(/[R$\s.]/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

const blank = (agencyId: string): Draft => ({
  agencyId,
  name: "",
  description: "",
  transferDetails: "",
  url: "",
  active: true,
  items: [{ kind: "ticket", label: "", price: "", soldOut: false }],
});

const toDraft = (p: PackageAdmin): Draft => ({
  agencyId: p.agencyId,
  name: p.name,
  description: p.description,
  transferDetails: p.transferDetails,
  url: p.url,
  active: p.active,
  items: p.items.map((i) => ({ kind: i.kind, label: i.label, price: priceText(i.priceCents), soldOut: i.soldOut })),
});

/**
 * Agências e pacotes de um show: cada agência distribui pacotes com vários tipos de ingresso
 * (cada um com o seu preço) e opções de transfer, e pode ter o link de venda próprio.
 */
export function PackagesManager({
  slug,
  eventId,
  agencies,
  packages,
}: {
  slug: string;
  eventId: string;
  agencies: AgencyAdmin[];
  packages: PackageAdmin[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const agencyName = (id: string) => agencies.find((a) => a.id === id)?.name ?? "Agência";
  // Cada show tem uma única agência: depois do primeiro pacote, a agência fica travada.
  const showAgencyId = packages[0]?.agencyId ?? null;

  const setDraft = (patch: Partial<Draft>) => setEditing((e) => (e ? { ...e, draft: { ...e.draft, ...patch } } : e));
  const setItem = (i: number, patch: Partial<Draft["items"][number]>) =>
    setEditing((e) => (e ? { ...e, draft: { ...e.draft, items: e.draft.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) } } : e));

  const save = (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    if (!d.agencyId) return setError("Escolha a agência.");
    if (d.name.trim().length < 1) return setError("Dê um nome ao pacote.");
    if (d.items.length === 0) return setError("Inclua pelo menos um ingresso ou transfer.");
    const items: PackageItem[] = [];
    for (const [i, it] of d.items.entries()) {
      const cents = parsePrice(it.price);
      if (!it.label.trim()) return setError(`Descreva o item ${i + 1} (ex.: Pista, Camarote, Ônibus ida e volta).`);
      if (cents === null) return setError(`O preço do item “${it.label}” precisa ser um valor em reais.`);
      items.push({ kind: it.kind, label: it.label.trim(), priceCents: cents, soldOut: it.soldOut });
    }
    start(async () => {
      const res = await saveContent(
        slug,
        "packages",
        editing.id,
        {
          eventId,
          agencyId: d.agencyId,
          name: d.name.trim(),
          description: d.description.trim(),
          transferDetails: d.transferDetails.trim(),
          url: d.url.trim(),
          active: d.active,
          items,
        },
      );
      if (!res.ok) return setError(res.error);
      setError("");
      setEditing(null);
      router.refresh();
    });
  };

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteContent(slug, "packages", id);
      if (!res.ok) return setError(res.error);
      setConfirmDel(null);
      router.refresh();
    });

  return (
    <section aria-labelledby="pk-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="pk-title" className="m-0 text-lg font-bold">
            Agências e pacotes
          </h2>
          <p className="m-0 text-sm text-adm-muted">A agência do show distribui pacotes. Em cada pacote, cada tipo de ingresso tem o seu valor: só ingresso, ingresso + transfer, + selo no app ou + Photo Finder (suas fotos do show no app).</p>
        </div>
        <button
          type="button"
          disabled={agencies.length === 0 || !!editing}
          onClick={() => setEditing({ id: null, draft: blank(showAgencyId ?? agencies[0]?.id ?? "") })}
          className={btnPrimary}
        >
          <Icon name="plus" size={18} strokeWidth={2.4} />
          Novo pacote
        </button>
      </div>

      {agencies.length === 0 && <AdminNotice tone="warn">Cadastre uma agência em “Agências parceiras” abaixo para poder criar pacotes.</AdminNotice>}
      {error && !editing && <AdminNotice tone="error">{error}</AdminNotice>}

      {editing && (
        <form onSubmit={save} noValidate aria-label="Pacote" className="flex flex-col gap-4 rounded-xl border border-adm-blue bg-white p-5">
          <h3 className="m-0 text-base font-bold">{editing.id ? "Editar pacote" : "Novo pacote"}</h3>
          {error && <AdminNotice tone="error">{error}</AdminNotice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pk-agency" className="text-[13px] font-semibold">
                Agência *
              </label>
              <select id="pk-agency" value={editing.draft.agencyId} disabled={!!showAgencyId} onChange={(e) => setDraft({ agencyId: e.target.value })} className={inputClass} aria-describedby={showAgencyId ? "pk-agency-hint" : undefined}>
                {agencies.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {showAgencyId && (
                <span id="pk-agency-hint" className="text-xs text-adm-muted">
                  Este show é de uma única agência: todos os pacotes dele são dela.
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="pk-name" className="text-[13px] font-semibold">
                Nome do pacote *
              </label>
              <input id="pk-name" value={editing.draft.name} onChange={(e) => setDraft({ name: e.target.value })} placeholder="Ex.: Caravana BH" className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="pk-desc" className="text-[13px] font-semibold">
                Descrição
              </label>
              <input id="pk-desc" value={editing.draft.description} onChange={(e) => setDraft({ description: e.target.value })} maxLength={300} className={inputClass} />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="pk-url" className="text-[13px] font-semibold">
                Link de venda do pacote
              </label>
              <input id="pk-url" value={editing.draft.url} onChange={(e) => setDraft({ url: e.target.value })} placeholder="https://… (se vazio, usa o site da agência)" className={inputClass} />
            </div>
          </div>

          <fieldset className="m-0 flex min-w-0 flex-col gap-3 border-0 p-0">
            <legend className="mb-1 p-0 text-[13px] font-semibold">Opções do pacote: cada tipo de ingresso com o seu valor *</legend>
            {editing.draft.items.map((it, i) => (
              <div key={i} className="grid items-end gap-2 rounded-lg border border-adm-line-soft p-3 sm:grid-cols-[130px_minmax(0,1fr)_120px_auto_auto]">
                <div className="flex flex-col gap-1">
                  <label htmlFor={`pk-k-${i}`} className="text-xs font-semibold">
                    Tipo
                  </label>
                  <select id={`pk-k-${i}`} value={it.kind} onChange={(e) => setItem(i, { kind: e.target.value as "ticket" | "transfer" | "seal" | "photo" })} className={inputClass}>
                    <option value="ticket">Somente ingresso</option>
                    <option value="transfer">Ingresso + transfer</option>
                    <option value="seal">Ingresso + transfer + selo</option>
                    <option value="photo">Ingresso + transfer + selo + Photo Finder</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`pk-l-${i}`} className="text-xs font-semibold">
                    {it.kind === "ticket" ? "Tipo de ingresso" : it.kind === "transfer" ? "Ingresso com transfer" : it.kind === "seal" ? "Ingresso com transfer e selo" : "Ingresso com transfer, selo e Photo Finder"}
                  </label>
                  <input
                    id={`pk-l-${i}`}
                    value={it.label}
                    onChange={(e) => setItem(i, { label: e.target.value })}
                    placeholder={it.kind === "ticket" ? "Pista, Camarote, VIP…" : it.kind === "transfer" ? "Pista + transfer" : it.kind === "seal" ? "Pista + transfer + selo" : "Pista + transfer + selo + Photo Finder"}
                    className={inputClass}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor={`pk-p-${i}`} className="text-xs font-semibold">
                    Preço (R$)
                  </label>
                  <input id={`pk-p-${i}`} inputMode="decimal" value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} placeholder="0,00" className={inputClass} />
                </div>
                <label className="flex min-h-11 items-center gap-2 text-[13px]">
                  <input type="checkbox" checked={it.soldOut} onChange={(e) => setItem(i, { soldOut: e.target.checked })} />
                  Esgotado
                </label>
                <button
                  type="button"
                  onClick={() => setDraft({ items: editing.draft.items.filter((_, idx) => idx !== i) })}
                  aria-label={`Remover item ${i + 1}`}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-adm-line bg-white"
                >
                  <Icon name="close" size={14} strokeWidth={2.6} />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setDraft({ items: [...editing.draft.items, { kind: "ticket", label: "", price: "", soldOut: false }] })} className={btnSecondary}>
                + Só ingresso
              </button>
              <button type="button" onClick={() => setDraft({ items: [...editing.draft.items, { kind: "transfer", label: "", price: "", soldOut: false }] })} className={btnSecondary}>
                + Ingresso + transfer
              </button>
              <button type="button" onClick={() => setDraft({ items: [...editing.draft.items, { kind: "seal", label: "", price: "", soldOut: false }] })} className={btnSecondary}>
                + Ingresso + transfer + selo
              </button>
              <button type="button" onClick={() => setDraft({ items: [...editing.draft.items, { kind: "photo", label: "", price: "", soldOut: false }] })} className={btnSecondary}>
                + com Photo Finder
              </button>
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="pk-transfer" className="text-[13px] font-semibold">
              Detalhes do transfer
            </label>
            <input
              id="pk-transfer"
              value={editing.draft.transferDetails}
              onChange={(e) => setDraft({ transferDetails: e.target.value })}
              placeholder="Saída da rodoviária às 14h, volta 1h após o show"
              maxLength={300}
              className={inputClass}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={editing.draft.active} onChange={(e) => setDraft({ active: e.target.checked })} />
            Pacote ativo (aparece para os fãs)
          </label>
          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={() => { setEditing(null); setError(""); }} className={btnSecondary}>
              Cancelar
            </button>
            <button type="submit" disabled={pending} aria-busy={pending} className={btnPrimary}>
              {pending ? "Salvando…" : "Salvar pacote"}
            </button>
          </div>
        </form>
      )}

      {packages.length === 0 && !editing ? (
        <AdminEmpty title="Nenhum pacote neste show" text="Crie o primeiro pacote de uma agência: ingressos de vários tipos e, se houver, transfer." />
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-2">
          {packages.map((p) => (
            <li key={p.id}>
              <article className="flex h-full flex-col gap-3 rounded-xl border border-adm-line bg-white p-4">
                <header className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="font-adm-mono text-[11px] font-semibold uppercase tracking-wider text-adm-muted">{agencyName(p.agencyId)}</span>
                    <h3 className="m-0 text-base font-bold leading-5">{p.name}</h3>
                    {p.description && <p className="m-0 text-[13px] text-adm-muted">{p.description}</p>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {p.items.some((i) => i.kind !== "ticket") && <Badge tone="info">Com transfer</Badge>}
                    {p.items.some((i) => i.kind === "seal" || i.kind === "photo") && <Badge tone="ok">Selo no app</Badge>}
                    {p.items.some((i) => i.kind === "photo") && <Badge tone="ok">Photo Finder</Badge>}
                    {!p.active && <Badge tone="off">Inativo</Badge>}
                  </div>
                </header>
                <ul className="m-0 flex list-none flex-col divide-y divide-adm-line-soft p-0 text-sm">
                  {p.items.map((i, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-3 py-1.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="font-adm-mono text-[10px] font-semibold uppercase text-adm-muted">{i.kind === "ticket" ? "Só ingresso" : i.kind === "transfer" ? "Com transfer" : i.kind === "seal" ? "Transfer + selo" : "Transfer + selo + Photo Finder"}</span>
                        <span className={`truncate ${i.soldOut ? "line-through opacity-60" : ""}`}>{i.label}</span>
                        {i.soldOut && <Badge tone="warn">Esgotado</Badge>}
                      </span>
                      <strong className="flex-none font-adm-mono text-[13px]">{formatBRL(i.priceCents)}</strong>
                    </li>
                  ))}
                </ul>
                {p.transferDetails && <p className="m-0 text-[13px]"><strong>Transfer:</strong> {p.transferDetails}</p>}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-[13px] font-semibold text-adm-blue-dark">
                    <Icon name="external" size={14} />
                    Link de venda
                  </a>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  <button type="button" disabled={!!editing} onClick={() => setEditing({ id: p.id, draft: toDraft(p) })} className="min-h-10 cursor-pointer rounded-lg border border-adm-blue bg-white px-3 text-[13px] font-semibold text-adm-blue">
                    Editar
                  </button>
                  {confirmDel === p.id ? (
                    <>
                      <button type="button" onClick={() => remove(p.id)} disabled={pending} className="min-h-10 cursor-pointer rounded-lg border-0 bg-adm-danger px-3 text-[13px] font-semibold text-white">
                        Excluir pacote
                      </button>
                      <button type="button" onClick={() => setConfirmDel(null)} className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold">
                        Manter
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmDel(p.id)} className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger">
                      Excluir
                    </button>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
