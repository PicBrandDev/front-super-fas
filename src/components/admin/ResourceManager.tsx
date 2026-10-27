"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import { deleteContent, saveContent } from "@/app/actions/admin";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { AdminEmpty, AdminNotice, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";

export type FieldDef = {
  name: string; // nome do campo na API (camelCase)
  label: string;
  type: "text" | "textarea" | "number" | "money" | "date" | "select" | "checkbox" | "color";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  /** Aparece como coluna na tabela. */
  column?: boolean;
  full?: boolean; // ocupa a linha toda no formulário
};

export type Item = Record<string, unknown> & { id: string };

type Props = {
  slug: string;
  resource: string;
  title: string;
  description: string;
  singular: string; // "show", "produto"…
  feminine?: boolean; // "faixa" → "Nova faixa", "criada"…
  allowAdd?: boolean;
  /** Fã clube (CRUD em /clubs/{club}/manage); vazio = conteúdo do ambiente. */
  club?: string;
  fields: FieldDef[];
  items: Item[];
  /** Valores fixos enviados ao criar (ex.: eventId). */
  fixed?: Record<string, unknown>;
  /** Link extra em cada linha; {id} é trocado pelo id do item. */
  rowLink?: { label: string; href: string };
  /** Sem cabeçalho de página (quando é uma seção dentro de outra página). */
  section?: boolean;
  emptyText?: string;
};

const brl = (cents: unknown) =>
  typeof cents === "number" ? (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";

const fmtDate = (v: unknown) => {
  if (typeof v !== "string" || !v) return "—";
  const [y, m, d] = v.split("-");
  return `${d}/${m}/${y}`;
};

function display(f: FieldDef, v: unknown): string {
  if (f.type === "money") return brl(v);
  if (f.type === "date") return fmtDate(v);
  if (f.type === "checkbox") return v ? "Sim" : "Não";
  if (f.type === "select") return f.options?.find((o) => o.value === v)?.label ?? String(v ?? "—");
  const s = v === null || v === undefined || v === "" ? "—" : String(v);
  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
}

/** Valor do item → texto do campo no formulário. */
function toInput(f: FieldDef, v: unknown): string | boolean {
  if (f.type === "checkbox") return !!v;
  if (f.type === "money") return typeof v === "number" ? (v / 100).toFixed(2).replace(".", ",") : "";
  if (v === null || v === undefined) {
    if (f.type === "color") return "#E0A526";
    if (f.type === "select") return f.options?.[0]?.value ?? "";
    return "";
  }
  return String(v);
}

/** Texto do formulário → valor para a API. Devolve erro quando não dá para converter. */
function fromInput(f: FieldDef, v: string | boolean): { value?: unknown; error?: string } {
  if (f.type === "checkbox") return { value: !!v };
  const s = String(v).trim();
  if (!s) {
    if (f.required) return { error: `Preencha “${f.label}”.` };
    if (f.type === "money") return { value: null };
    if (f.type === "number") return { value: undefined }; // em branco: a API usa o padrão
    return { value: "" };
  }
  if (f.type === "number") {
    const n = Number(s);
    return Number.isFinite(n) ? { value: Math.round(n) } : { error: `“${f.label}” precisa ser um número.` };
  }
  if (f.type === "money") {
    const n = Number(s.replace(/[R$\s.]/g, "").replace(",", "."));
    return Number.isFinite(n) ? { value: Math.round(n * 100) } : { error: `“${f.label}” precisa ser um valor em reais.` };
  }
  return { value: s };
}

export function ResourceManager({
  slug,
  resource,
  title,
  description,
  singular,
  fields,
  items,
  fixed,
  rowLink,
  section = false,
  emptyText,
  feminine = false,
  allowAdd = true,
  club,
}: Props) {
  const o = feminine ? "a" : "o";
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [announce, setAnnounce] = useState("");
  const [pending, start] = useTransition();
  const columns = fields.filter((f) => f.column);
  const headingId = `rm-${resource}-title`;

  const remove = (item: Item) =>
    start(async () => {
      const res = await deleteContent(slug, resource, item.id, club);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setConfirmDel(null);
      setAnnounce(`${capitalize(singular)} excluíd${o}.`);
      router.refresh();
    });

  const addButton = allowAdd && (
    <button type="button" onClick={() => setEditing("new")} className={btnPrimary} disabled={editing === "new"}>
      <Icon name="plus" size={18} strokeWidth={2.4} />
      Adicionar {singular}
    </button>
  );

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-4">
      {section ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2 id={headingId} className="m-0 text-lg font-bold">
              {title}
            </h2>
            <p className="m-0 text-sm text-adm-muted">{description}</p>
          </div>
          {addButton}
        </div>
      ) : (
        <AdminPageHeader title={title} description={description} actions={addButton} headingId={headingId} />
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
      {error && !editing && <AdminNotice tone="error">{error}</AdminNotice>}

      {editing && (
        <ItemForm
          key={editing === "new" ? "new" : editing.id}
          fields={fields}
          item={editing === "new" ? null : editing}
          singular={singular}
          feminine={feminine}
          resource={resource}
          onCancel={() => setEditing(null)}
          onSave={async (data) => {
            const res = await saveContent(
              slug,
              resource,
              editing === "new" ? null : editing.id,
              editing === "new" ? { ...fixed, ...data } : data,
              club,
            );
            if (!res.ok) return res.error;
            setAnnounce(editing === "new" ? `${capitalize(singular)} criad${o}.` : "Alterações salvas.");
            setEditing(null);
            setError("");
            router.refresh();
            return null;
          }}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              {columns.map((c) => (
                <th key={c.name} scope="col" className={thClass}>
                  {c.label}
                </th>
              ))}
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((c, i) => (
                  <td key={c.name} className={`${tdClass} ${i === 0 ? "font-semibold" : ""}`}>
                    {c.type === "color" ? (
                      <span className="flex items-center gap-2">
                        <span aria-hidden="true" className="size-5 rounded border border-adm-line" style={{ background: String(item[c.name] ?? "") }} />
                        <span className="font-adm-mono text-xs">{String(item[c.name] ?? "")}</span>
                      </span>
                    ) : (
                      display(c, item[c.name])
                    )}
                  </td>
                ))}
                <td className={tdClass}>
                  <div className="flex flex-wrap justify-end gap-2">
                    {rowLink && (
                      <Link
                        href={rowLink.href.replace("{id}", item.id)}
                        className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-ink no-underline hover:border-adm-ink"
                      >
                        {rowLink.label}
                      </Link>
                    )}
                    {confirmDel === item.id ? (
                      <>
                        <button type="button" onClick={() => setConfirmDel(null)} className={btnSecondary}>
                          Manter
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(item)}
                          disabled={pending}
                          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-adm-danger px-3 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          Confirmar exclusão
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditing(item)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-blue bg-white px-3 text-[13px] font-semibold text-adm-blue"
                        >
                          Editar<span className="sr-only"> {display(columns[0] ?? fields[0], item[(columns[0] ?? fields[0]).name])}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDel(item.id)}
                          className="inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-danger"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-3">
            <AdminEmpty
              title={`${feminine ? "Nenhuma" : "Nenhum"} ${singular} cadastrad${o} ainda`}
              text={emptyText}
              action={
                allowAdd && !editing ? (
                  <button type="button" onClick={() => setEditing("new")} className={btnPrimary}>
                    Adicionar {singular}
                  </button>
                ) : undefined
              }
            />
          </div>
        )}
      </div>
    </section>
  );
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function ItemForm({
  fields,
  item,
  singular,
  feminine,
  resource,
  onCancel,
  onSave,
  children,
}: {
  resource: string;
  fields: FieldDef[];
  item: Item | null;
  singular: string;
  feminine: boolean;
  onCancel: () => void;
  onSave: (data: Record<string, unknown>) => Promise<string | null>;
  /** Campos a mais, abaixo dos campos comuns (ex.: a foto do produto). */
  children?: ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, toInput(f, item?.[f.name])])),
  );
  const [error, setError] = useState("");
  const [saving, start] = useTransition();
  const firstRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = {};
    for (const f of fields) {
      const r = fromInput(f, values[f.name]);
      if (r.error) {
        setError(r.error);
        return;
      }
      if (r.value !== undefined) data[f.name] = r.value;
    }
    start(async () => {
      const err = await onSave(data);
      if (err) setError(err);
    });
  };

  const set = (name: string, v: string | boolean) => setValues((cur) => ({ ...cur, [name]: v }));
  const formTitle = item ? `Editar ${singular}` : `${feminine ? "Nova" : "Novo"} ${singular}`;

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label={formTitle}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      className="flex flex-col gap-4 rounded-xl border border-adm-blue bg-white p-5"
    >
      <h3 className="m-0 text-base font-bold">{formTitle}</h3>
      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f, i) => {
          const id = `fld-${resource}-${f.name}`;
          const ref = i === 0 ? (el: HTMLElement | null) => void (firstRef.current = el) : undefined;
          const describedBy = f.hint ? `${id}-hint` : undefined;
          const v = values[f.name];
          if (f.type === "checkbox") {
            return (
              <label key={f.name} htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm font-semibold sm:col-span-2">
                <input
                  ref={ref}
                  id={id}
                  type="checkbox"
                  checked={!!v}
                  onChange={(e) => set(f.name, e.target.checked)}
                  className="size-5 accent-adm-blue"
                />
                {f.label}
              </label>
            );
          }
          return (
            <div key={f.name} className={`flex flex-col gap-1.5 ${f.full || f.type === "textarea" ? "sm:col-span-2" : ""}`}>
              <label htmlFor={id} className="text-[13px] font-semibold">
                {f.label}
                {f.required && <span aria-hidden="true"> *</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  ref={ref}
                  id={id}
                  value={String(v)}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  required={f.required}
                  aria-describedby={describedBy}
                  rows={4}
                  className={`${inputClass} py-2.5`}
                />
              ) : f.type === "select" ? (
                <select
                  ref={ref}
                  id={id}
                  value={String(v)}
                  onChange={(e) => set(f.name, e.target.value)}
                  aria-describedby={describedBy}
                  className={inputClass}
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  ref={ref}
                  id={id}
                  type={f.type === "date" ? "date" : f.type === "number" ? "number" : f.type === "color" ? "color" : "text"}
                  inputMode={f.type === "money" ? "decimal" : undefined}
                  value={String(v)}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder ?? (f.type === "money" ? "0,00" : undefined)}
                  required={f.required}
                  aria-describedby={describedBy}
                  className={`${inputClass} ${f.type === "color" ? "h-11 w-24 p-1" : ""}`}
                />
              )}
              {f.hint && (
                <span id={`${id}-hint`} className="text-xs text-adm-muted">
                  {f.hint}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {children}
      <div className="flex justify-end gap-2.5">
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} aria-busy={saving} className={btnPrimary}>
          {saving ? "Salvando…" : item ? "Salvar alterações" : `Criar ${singular}`}
        </button>
      </div>
    </form>
  );
}
