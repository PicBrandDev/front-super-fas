"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { deleteContent, saveContent } from "@/app/actions/admin";
import { AdminEmpty, AdminNotice, Badge, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { EXPERIENCES, experienceLabel, type ExperienceKey } from "@/lib/experiences";
import { formatBRL } from "@/lib/format";
import type { AgencyAdmin, PackageAdmin } from "@/lib/types";

type Draft = {
  agencyId: string;
  name: string;
  description: string;
  transferDetails: string;
  url: string;
  active: boolean;
  addons: { key: ExperienceKey; on: boolean; price: string; soldOut: boolean }[];
};

const priceText = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
const parsePrice = (s: string) => {
  const n = Number(s.trim().replace(/[R$\s.]/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

/** Uma linha por experiência possível; as que o pacote já oferece vêm marcadas, com o preço. */
const toAddons = (list: { key: ExperienceKey; priceCents: number; soldOut: boolean }[]): Draft["addons"] =>
  EXPERIENCES.map((x) => {
    const a = list.find((i) => i.key === x.key);
    return { key: x.key, on: !!a, price: a ? priceText(a.priceCents) : "", soldOut: a?.soldOut ?? false };
  });

const blank = (agencyId: string): Draft => ({
  agencyId,
  name: "",
  description: "",
  transferDetails: "",
  url: "",
  active: true,
  addons: toAddons([]),
});

const toDraft = (p: PackageAdmin): Draft => ({
  agencyId: p.agencyId,
  name: p.name,
  description: p.description,
  transferDetails: p.transferDetails,
  url: p.url,
  active: p.active,
  addons: toAddons(p.addons ?? []),
});

/**
 * Agências e pacotes de um show: cada agência distribui pacotes de EXPERIÊNCIAS (transfer, jantar, camarim, pré-esquenta,
 * after e hotel), cada uma com o seu preço, e pode ter o link de venda próprio. O ingresso é da ticketeira.
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

  const save = (ev: FormEvent) => {
    ev.preventDefault();
    if (!editing) return;
    const d = editing.draft;
    if (!d.agencyId) return setError("Escolha a agência.");
    if (d.name.trim().length < 1) return setError("Dê um nome ao pacote.");
    const addons: { key: ExperienceKey; priceCents: number; soldOut: boolean }[] = [];
    for (const a of d.addons.filter((x) => x.on)) {
      const cents = parsePrice(a.price);
      if (cents === null) return setError(`Informe o preço de “${experienceLabel(a.key)}” em reais.`);
      addons.push({ key: a.key, priceCents: cents, soldOut: a.soldOut });
    }
    if (addons.length === 0) return setError("Marque pelo menos uma experiência para vender neste pacote.");
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
          addons,
          items: [], // não se vende mais ingresso pelo app
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
          <p className="m-0 text-sm text-adm-muted">A agência do show distribui pacotes de experiências: transfer, jantar, camarim, pré-esquenta, after e hotel, cada uma com o seu valor. O ingresso não é vendido aqui (a ticketeira faz isso). O Photo Finder já vem em todos os pacotes.</p>
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

          <fieldset className="m-0 flex min-w-0 flex-col gap-2 border-0 p-0">
            <legend className="mb-1 p-0 text-[13px] font-semibold">Experiências vendidas neste pacote, cada uma com o seu valor *</legend>
            {editing.draft.addons.map((a, i) => {
              const x = EXPERIENCES.find((e) => e.key === a.key)!;
              const setAddon = (patch: Partial<Draft["addons"][number]>) =>
                setDraft({ addons: editing.draft.addons.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
              return (
                <div key={a.key} className="grid items-center gap-2 rounded-lg border border-adm-line-soft p-2.5 sm:grid-cols-[minmax(0,1fr)_130px_auto]">
                  <label className="flex min-h-11 items-start gap-2 text-[13px]">
                    <input type="checkbox" className="mt-0.5" checked={a.on} onChange={(e) => setAddon({ on: e.target.checked })} />
                    <span className="flex flex-col">
                      <strong>{x.label}</strong>
                      <span className="text-adm-muted">{x.hint}</span>
                    </span>
                  </label>
                  <div className="flex flex-col gap-1">
                    <label htmlFor={`pk-a-${a.key}`} className="text-xs font-semibold">
                      Valor (R$)
                    </label>
                    <input id={`pk-a-${a.key}`} inputMode="decimal" disabled={!a.on} value={a.price} onChange={(e) => setAddon({ price: e.target.value })} placeholder="0,00" className={inputClass} />
                  </div>
                  <label className="flex min-h-11 items-center gap-2 text-[13px]">
                    <input type="checkbox" disabled={!a.on} checked={a.soldOut} onChange={(e) => setAddon({ soldOut: e.target.checked })} />
                    Esgotado
                  </label>
                </div>
              );
            })}
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
        <AdminEmpty title="Nenhum pacote neste show" text="Crie o primeiro pacote de uma agência: marque as experiências que ela vende (transfer, jantar, camarim, hotel...) e o valor de cada uma." />
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
                    <Badge tone="ok">Photo Finder</Badge>
                    {!p.active && <Badge tone="off">Inativo</Badge>}
                  </div>
                </header>
                <ul className="m-0 flex list-none flex-col divide-y divide-adm-line-soft p-0 text-sm" aria-label={`Experiências de ${p.name}`}>
                  {(p.addons ?? []).length === 0 && <li className="py-1.5 text-adm-muted">Sem experiências: este pacote não vende nada ainda.</li>}
                  {(p.addons ?? []).map((x) => (
                    <li key={x.key} className="flex items-center justify-between gap-3 py-1.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className={`truncate ${x.soldOut ? "line-through opacity-60" : ""}`}>{experienceLabel(x.key)}</span>
                        {x.soldOut && <Badge tone="warn">Esgotada</Badge>}
                      </span>
                      <strong className="flex-none font-adm-mono text-[13px]">{formatBRL(x.priceCents)}</strong>
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
