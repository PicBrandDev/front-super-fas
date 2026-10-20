"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { createFanClub, updateFanClub, type InviteResult } from "@/app/actions/admin";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FilterChips, SearchField, Switch } from "@/components/admin/controls";
import { Badge, btnOutlineBlue, btnPrimary, btnSecondary, inputClass, tdClass, thClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { ClubAdmin, FanClubStatus } from "@/lib/types";

export type ClubRow = {
  id: string;
  name: string;
  slug: string;
  initial: string;
  color: string;
  status: FanClubStatus;
  members: string;
  ads: string;
  team: ClubAdmin[];
  modules?: Record<string, boolean>;
  /** Criado nesta sessão (ainda não existe no back). */
  local?: boolean;
  instagram?: string;
  template?: Template;
};

type Filter = "todos" | "ativos" | "config";
type Template = "blank" | "vc";

const MAX_ADMINS = 10;

const filterOptions: { id: Filter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "ativos", label: "Ativos" },
  { id: "config", label: "Em configuração" },
];

const moduleList: { id: string; label: string; hint: string }[] = [
  { id: "mural", label: "Mural", hint: "Drop News, feed da galera e Instagram" },
  { id: "agenda", label: "Agenda", hint: "Shows, ingressos e sorte do evento" },
  { id: "pickap", label: "PicKap da sorte", hint: "Roleta geral" },
  { id: "loja", label: "Loja virtual", hint: "Produtos e drops da loja" },
  { id: "drops", label: "Drops Hits", hint: "Prévias de músicas" },
  { id: "photo", label: "Photo Finder", hint: "Busca de fotos por selfie" },
  { id: "ads", label: "Mídia e anúncios", hint: "Vitrines para patrocinadores" },
];

/** Cores dos avatares dos ambientes recém-criados (antes do design próprio). */
const newClubColors = ["#2F5BD3", "#1F7A4D", "#7A3FB8", "#14171C"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const initialsOf = (name: string) =>
  name.includes("@")
    ? "@"
    : name
        .split(" ")
        .filter(Boolean)
        .map((w) => w.charAt(0))
        .join("")
        .slice(0, 2)
        .toUpperCase();

export function FasClubesClient({ initialClubs }: { initialClubs: ClubRow[] }) {
  const [created, setCreated] = useState<ClubRow[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [q, setQ] = useState("");
  const [selId, setSelId] = useState<string | null>(initialClubs[0]?.id ?? null);
  const [extraInv, setExtraInv] = useState<Record<string, number>>({});
  const [mods, setMods] = useState<Record<string, Record<string, boolean>>>({});
  const [createOpen, setCreateOpen] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [invites, setInvites] = useState<InviteResult[]>([]);
  const [saveError, setSaveError] = useState("");
  const [, start] = useTransition();
  const router = useRouter();
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const clubs = [...initialClubs, ...created];
  const query = q.trim().toLowerCase();
  const rows = clubs
    .filter((c) => filter === "todos" || (filter === "ativos" ? c.status === "active" : c.status !== "active"))
    .filter((c) => !query || `${c.name} ${c.slug}`.toLowerCase().includes(query));

  const usedOf = (c: ClubRow) => Math.min(MAX_ADMINS, c.team.length + (extraInv[c.id] ?? 0));
  const selClub = clubs.find((c) => c.id === selId) ?? null;

  const closeCreate = () => {
    setCreateOpen(false);
    openBtnRef.current?.focus();
  };

  const handleCreate = async (data: {
    name: string;
    instagram: string;
    template: Template;
    invites: string[];
  }): Promise<string | null> => {
    const res = await createFanClub(data);
    if (res.ok) {
      setInvites(res.data.invites);
      setSelId(res.data.artist.id);
      setFilter("todos");
      setAnnounce(`Ambiente ${data.name} criado.`);
      closeCreate();
      router.refresh();
      return null;
    }
    if (res.status !== 0) return res.error;
    // Modo exemplo (sem API): cria só na tela.
    const taken = new Set(clubs.map((c) => c.slug));
    const base = slugify(data.name) || "artista";
    let slug = base;
    for (let n = 2; taken.has(slug); n++) slug = `${base}-${n}`;
    const id = `c${Date.now()}`;
    const club: ClubRow = {
      id,
      name: data.name,
      slug,
      initial: data.name.charAt(0).toUpperCase(),
      color: newClubColors[created.length % newClubColors.length],
      status: "setup",
      members: "0",
      ads: "Não configuradas",
      team: data.invites.map((email) => ({ name: email, role: "Convite enviado" })),
      local: true,
      instagram: data.instagram,
      template: data.template,
    };
    setCreated((cur) => [...cur, club]);
    setSelId(id);
    setFilter("todos");
    setAnnounce(`Ambiente ${data.name} criado.`);
    closeCreate();
    return null;
  };

  /** Salva no back; sem API só muda na tela. */
  const patchClub = (c: ClubRow, data: Record<string, unknown>, done: string) =>
    start(async () => {
      if (c.local) return;
      const res = await updateFanClub(c.slug, data);
      if (!res.ok && res.status !== 0) {
        setSaveError(res.error);
        return;
      }
      setSaveError("");
      setAnnounce(done);
      if (res.ok) router.refresh();
    });

  return (
    <>
      <AdminPageHeader
        title="Fã clubes"
        description="Cada cantor ganha um ambiente próprio, com design próprio e até 10 fã clubes: o master (do admin master do cantor) e mais 9, cada um com seu dono."
        actions={
          <button ref={openBtnRef} type="button" onClick={() => setCreateOpen(true)} className={btnPrimary}>
            <Icon name="plus" size={18} strokeWidth={2.4} />
            Criar artista
          </button>
        }
      />

      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>

      {invites.map((inv) => (
        <TempPasswordNotice
          key={inv.email}
          email={inv.email}
          password={inv.tempPassword}
          onClose={() => setInvites((cur) => cur.filter((x) => x.email !== inv.email))}
        />
      ))}
      {saveError && (
        <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
          {saveError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField id="fc-search" label="Buscar fã clube" value={q} onChange={setQ} placeholder="Buscar artista ou endereço" />
        <FilterChips label="Filtrar por status" options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-adm-line bg-white">
        <table className="w-full min-w-[860px] border-collapse text-sm">
          <thead>
            <tr className="bg-adm-bg">
              <th scope="col" className={thClass}>Artista</th>
              <th scope="col" className={thClass}>Status</th>
              <th scope="col" className={thClass}>Fã clubes</th>
              <th scope="col" className={thClass}>Membros</th>
              <th scope="col" className={thClass}>Vitrines de mídia</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const selected = c.id === selId;
              const used = usedOf(c);
              const active = c.status === "active";
              return (
                <tr key={c.id} className={selected ? "bg-adm-blue-tint" : "bg-white"}>
                  <td className={tdClass}>
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex size-10 flex-none items-center justify-center rounded-[10px] text-base font-bold text-white"
                        style={{ background: c.color }}
                      >
                        {c.initial}
                      </span>
                      <span className="flex flex-col">
                        <strong className="text-[15px]">{c.name}</strong>
                        <span className="font-adm-mono text-xs text-adm-muted">/{c.slug}</span>
                      </span>
                    </div>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={active ? "ok" : "warn"}>{active ? "Ativo" : "Em configuração"}</Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2.5">
                      <span aria-hidden="true" className="h-1.5 w-20 overflow-hidden rounded-[3px] bg-adm-line-soft">
                        <span className="block h-1.5 bg-adm-blue" style={{ width: `${used * 10}%` }} />
                      </span>
                      <span className="font-adm-mono text-[13px] font-semibold">
                        {used}/{MAX_ADMINS}
                      </span>
                    </div>
                  </td>
                  <td className={`${tdClass} font-adm-mono text-[13px]`}>{c.members}</td>
                  <td className={tdClass}>{c.ads}</td>
                  <td className={tdClass}>
                    <div className="flex justify-end gap-2">
                      {c.local ? (
                        <>
                          <span
                            aria-disabled="true"
                            title="Disponível depois que o ambiente for configurado"
                            className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-disabled"
                          >
                            Abrir ambiente
                          </span>
                          <span
                            aria-disabled="true"
                            title="Disponível depois que o ambiente for configurado"
                            className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-disabled"
                          >
                            Membros
                          </span>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/${c.slug}`}
                            className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-ink no-underline hover:border-adm-ink"
                          >
                            Abrir ambiente<span className="sr-only"> {c.name}</span>
                          </Link>
                          <Link
                            href={`/${c.slug}/admin/membros`}
                            className="flex min-h-10 items-center whitespace-nowrap rounded-lg border border-adm-line px-3 text-[13px] font-medium text-adm-ink no-underline hover:border-adm-ink"
                          >
                            Membros<span className="sr-only"> de {c.name}</span>
                          </Link>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelId(c.id)}
                        aria-pressed={selected}
                        className={`inline-flex min-h-10 cursor-pointer items-center rounded-lg border border-adm-blue px-3 text-[13px] font-semibold ${
                          selected ? "bg-adm-blue text-white" : "bg-white text-adm-blue"
                        }`}
                      >
                        Gerenciar<span className="sr-only"> {c.name}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && <p className="m-0 px-4 py-6 text-sm text-adm-muted">Nenhum fã clube encontrado.</p>}
      </div>

      {selClub && (
        <section aria-label={`Gerenciar ${selClub.name}`} className="flex flex-wrap items-start gap-5">
          <div className="flex min-w-0 flex-[3_1_420px] flex-col gap-3.5 rounded-xl border border-adm-line bg-white p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="m-0 text-lg font-bold">Fã clubes · {selClub.name}</h2>
              <span className="font-adm-mono text-[13px] font-semibold text-adm-muted">
                {usedOf(selClub)} de {MAX_ADMINS}
              </span>
            </div>
            <ul className="m-0 grid list-none gap-2 p-0 [grid-template-columns:repeat(auto-fit,minmax(min(240px,100%),1fr))]">
              {Array.from({ length: MAX_ADMINS }, (_, i) => {
                const person = selClub.team[i];
                const inv = extraInv[selClub.id] ?? 0;
                if (person) {
                  return (
                    <AdminSlot
                    key={i}
                    initials={initialsOf(person.name)}
                    name={person.name}
                    role={person.pending ? `${person.role} · senha provisória` : person.role}
                    avatar="bg-adm-ink text-white"
                  />
                  );
                }
                if (i < selClub.team.length + inv) {
                  return (
                    <AdminSlot
                      key={i}
                      initials="…"
                      name="Convite enviado"
                      role="Aguardando aceite"
                      avatar="bg-adm-blue-soft text-adm-blue-dark"
                      box="bg-adm-bg"
                    />
                  );
                }
                return (
                  <AdminSlot
                    key={i}
                    initials="+"
                    name="Vaga livre"
                    role={`Fã clube ${i + 1}`}
                    avatar="bg-adm-bg text-adm-muted"
                    box="border-dashed bg-white"
                    action={
                      selClub.local ? (
                        <button
                          type="button"
                          onClick={() => setExtraInv((cur) => ({ ...cur, [selClub.id]: (cur[selClub.id] ?? 0) + 1 }))}
                          className={btnOutlineBlue}
                        >
                          Convidar<span className="sr-only"> para a vaga {i + 1}</span>
                        </button>
                      ) : (
                        <Link href={`/${selClub.slug}/admin/clubes`} className={`${btnOutlineBlue} no-underline`}>
                          Criar<span className="sr-only"> fã clube na vaga {i + 1}</span>
                        </Link>
                      )
                    }
                  />
                );
              })}
            </ul>
          </div>

          <div className="flex min-w-0 flex-[2_1_300px] flex-col gap-1.5 rounded-xl border border-adm-line bg-white p-5">
            <h2 className="m-0 mb-2 text-lg font-bold">Módulos do ambiente</h2>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-adm-bg px-3 py-2.5">
              <span className="text-sm">
                {selClub.status === "active" ? "No ar para os fãs." : "Em configuração: só a equipe vê."}
              </span>
              <button
                type="button"
                onClick={() =>
                  patchClub(
                    selClub,
                    { status: selClub.status === "active" ? "setup" : "active" },
                    selClub.status === "active" ? `${selClub.name} saiu do ar.` : `${selClub.name} está no ar.`,
                  )
                }
                disabled={selClub.local}
                className={btnOutlineBlue}
              >
                {selClub.status === "active" ? "Tirar do ar" : "Colocar no ar"}
              </button>
            </div>
            {moduleList.map((m) => {
              const on = (mods[selClub.id]?.[m.id] ?? selClub.modules?.[m.id]) !== false;
              return (
                <div key={m.id} className="flex min-h-12 items-center justify-between gap-3 border-b border-adm-line-soft">
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{m.label}</span>
                    <span className="text-xs text-adm-muted">{m.hint}</span>
                  </span>
                  <Switch
                    checked={on}
                    label={m.label}
                    onChange={(v) => {
                      setMods((all) => ({ ...all, [selClub.id]: { ...all[selClub.id], [m.id]: v } }));
                      patchClub(selClub, { modules: { [m.id]: v } }, `${m.label} ${v ? "ligado" : "desligado"}.`);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {createOpen && <CreateDialog onClose={closeCreate} onCreate={handleCreate} />}
    </>
  );
}

function AdminSlot({
  initials,
  name,
  role,
  avatar,
  box = "bg-white",
  action,
}: {
  initials: string;
  name: string;
  role: string;
  avatar: string;
  box?: string;
  action?: ReactNode;
}) {
  return (
    <li className={`flex min-h-14 items-center gap-2.5 rounded-[10px] border border-adm-line px-3 py-2 ${box}`}>
      <span
        aria-hidden="true"
        className={`flex size-8 flex-none items-center justify-center rounded-full text-xs font-bold ${avatar}`}
      >
        {initials}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <strong className="truncate text-sm font-semibold">{name}</strong>
        <span className="text-xs text-adm-muted">{role}</span>
      </span>
      {action}
    </li>
  );
}

function CreateDialog({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; instagram: string; template: Template; invites: string[] }) => Promise<string | null>;
}) {
  const [name, setName] = useState("");
  const [ig, setIg] = useState("");
  const [tpl, setTpl] = useState<Template>("blank");
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [creating, startCreate] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const slug = slugify(name) || "[endereco]";
  const canCreate = name.trim().length > 1;
  const full = invites.length >= MAX_ADMINS;

  const addInvite = () => {
    const v = email.trim();
    if (!v || full) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setEmailError("Digite um e-mail válido.");
      return;
    }
    if (invites.includes(v)) {
      setEmailError("Esse e-mail já foi adicionado.");
      return;
    }
    setInvites((cur) => [...cur, v]);
    setEmail("");
    setEmailError("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!canCreate || creating) return;
    startCreate(async () => {
      const err = await onCreate({ name: name.trim(), instagram: ig.trim(), template: tpl, invites });
      if (err) setSubmitError(err);
    });
  };

  /** Mantém o foco dentro do diálogo. */
  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, a[href]',
    );
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-adm-ink/55 px-4 py-16"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        aria-describedby="create-desc"
        onKeyDown={trapFocus}
        className="flex w-full max-w-[560px] flex-col rounded-[14px] bg-white shadow-[0_20px_60px_rgba(20,23,28,.3)]"
      >
        <form onSubmit={submit} noValidate>
          <div className="flex items-center justify-between gap-3 border-b border-adm-line-soft px-6 py-5">
            <div className="flex flex-col gap-0.5">
              <h2 id="create-title" className="m-0 text-xl font-bold">
                Criar artista
              </h2>
              <span id="create-desc" className="text-[13px] text-adm-muted">
                Gera um ambiente novo e vazio para você desenhar.
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-lg bg-adm-bg text-adm-ink"
            >
              <Icon name="close" size={18} strokeWidth={2.4} />
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5">
            {submitError && (
              <p role="alert" className="m-0 rounded-lg bg-[#fbeae7] px-3 py-2.5 text-sm font-semibold text-adm-danger">
                {submitError}
              </p>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-name" className="text-[13px] font-semibold">
                Nome artístico
              </label>
              <input
                ref={nameRef}
                id="cr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: [Nome do artista]"
                aria-describedby="cr-slug"
                autoComplete="off"
                className={inputClass}
              />
              <span id="cr-slug" className="font-adm-mono text-xs text-adm-muted">
                Endereço: [seudominio]/{slug}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-ig" className="text-[13px] font-semibold">
                Instagram do artista
              </label>
              <input
                id="cr-ig"
                value={ig}
                onChange={(e) => setIg(e.target.value)}
                placeholder="@perfil"
                autoComplete="off"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-template" className="text-[13px] font-semibold">
                Ponto de partida
              </label>
              <select
                id="cr-template"
                value={tpl}
                onChange={(e) => setTpl(e.target.value as Template)}
                className={inputClass}
              >
                <option value="blank">Ambiente em branco</option>
                <option value="vc">Copiar estrutura do Vintage Culture (sem o visual)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-email" className="text-[13px] font-semibold">
                Equipe do fã clube master{" "}
                <span className="font-normal text-adm-muted">
                  ({invites.length}/{MAX_ADMINS})
                </span>
              </label>
              <span className="text-xs text-adm-muted">
                O primeiro e-mail é o dono do fã clube master (o admin master do cantor); os outros entram como ajudantes.
              </span>
              <div className="flex gap-2">
                <input
                  id="cr-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addInvite();
                    }
                  }}
                  placeholder="email@exemplo.com"
                  disabled={full}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? "cr-email-error" : undefined}
                  className={`${inputClass} min-w-0 flex-1 disabled:bg-adm-bg`}
                />
                <button type="button" onClick={addInvite} disabled={full} className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-adm-blue bg-white px-3.5 text-sm font-semibold text-adm-blue disabled:cursor-not-allowed disabled:border-adm-line disabled:text-adm-disabled">
                  Adicionar
                </button>
              </div>
              {emailError && (
                <span id="cr-email-error" role="alert" className="text-xs font-semibold text-adm-danger">
                  {emailError}
                </span>
              )}
              {invites.length > 0 && (
                <ul aria-label="Convites" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                  {invites.map((em) => (
                    <li
                      key={em}
                      className="flex items-center gap-1.5 rounded-full bg-adm-blue-soft py-1 pl-2.5 pr-1.5 text-[13px] text-adm-blue-dark"
                    >
                      {em}
                      <button
                        type="button"
                        onClick={() => setInvites((cur) => cur.filter((x) => x !== em))}
                        aria-label={`Remover convite ${em}`}
                        className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-transparent text-adm-blue-dark hover:bg-white/60"
                      >
                        <Icon name="close" size={12} strokeWidth={3} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 border-t border-adm-line-soft px-6 py-4">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Cancelar
            </button>
            <button type="submit" disabled={!canCreate || creating} aria-busy={creating} className={btnPrimary}>
              {creating ? "Criando…" : "Criar ambiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
