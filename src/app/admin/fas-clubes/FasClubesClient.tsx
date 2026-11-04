"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { createFanClub, type InviteResult } from "@/app/actions/admin";
import { TempPasswordNotice } from "@/components/admin/TempPasswordNotice";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { FilterChips, SearchField } from "@/components/admin/controls";
import { AdminEmpty, AdminNotice, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { ClubCard } from "./ClubCard";
import { EditClubDialog } from "./EditClubDialog";
import type { ClubAdmin, FanClubStatus } from "@/lib/types";

export type ClubRow = {
  id: string;
  name: string;
  slug: string;
  /** Endereço completo do ambiente (https://dominio/slug). */
  url: string;
  initial: string;
  color: string;
  avatar?: string | null;
  /** Endereço do fã clube master (é nele que fica a foto de perfil). */
  masterSlug?: string;
  fanClubName: string;
  memberPriceCents: number;
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

/** Cores dos avatares dos ambientes recém-criados (antes do design próprio). */
const newClubColors = ["#2F5BD3", "#1F7A4D", "#7A3FB8", "#14171C"];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function FasClubesClient({ initialClubs, exampleMode = false }: { initialClubs: ClubRow[]; exampleMode?: boolean }) {
  const [created, setCreated] = useState<ClubRow[]>([]);
  const [filter, setFilter] = useState<Filter>("todos");
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [invites, setInvites] = useState<InviteResult[]>([]);
  const router = useRouter();
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const clubs = [...initialClubs, ...created];
  const query = q.trim().toLowerCase();
  const rows = clubs
    .filter((c) => filter === "todos" || (filter === "ativos" ? c.status === "active" : c.status !== "active"))
    .filter((c) => !query || `${c.name} ${c.slug}`.toLowerCase().includes(query));

  const editClub = clubs.find((c) => c.id === editId) ?? null;

  const closeCreate = () => {
    setCreateOpen(false);
    openBtnRef.current?.focus();
  };

  const handleCreate = async (data: {
    name: string;
    fanClubName: string;
    instagram: string;
    template: Template;
    invites: string[];
  }): Promise<string | null> => {
    const res = await createFanClub(data);
    if (res.ok) {
      setInvites(res.data.invites);
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
      url: `/${slug}`,
      initial: data.name.charAt(0).toUpperCase(),
      color: newClubColors[created.length % newClubColors.length],
      fanClubName: data.fanClubName,
      memberPriceCents: 0,
      status: "setup",
      members: "0",
      ads: "Não configuradas",
      team: data.invites.map((email) => ({ name: email, role: "Convite enviado" })),
      local: true,
      instagram: data.instagram,
      template: data.template,
    };
    setCreated((cur) => [...cur, club]);
    setFilter("todos");
    setAnnounce(`Ambiente ${data.name} criado.`);
    closeCreate();
    return null;
  };

  const templateFrom = initialClubs[0]?.name ?? null;

  return (
    <>
      <AdminPageHeader
        title="Fã clubes"
        description="Cada cantor ganha um ambiente próprio, com design próprio e quantos fã clubes quiser: o master (do admin master do cantor) e os outros, cada um com seu dono."
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
      {exampleMode && (
        <AdminNotice tone="info">Modo exemplo: ligue o front à API (API_URL) para criar artistas e salvar módulos de verdade.</AdminNotice>
      )}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField id="fc-search" label="Buscar fã clube" value={q} onChange={setQ} placeholder="Buscar artista ou endereço" />
        <FilterChips label="Filtrar por status" options={filterOptions} value={filter} onChange={setFilter} />
      </div>

      {rows.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
          {rows.map((c) => (
            <ClubCard key={c.id} club={c} onEdit={() => setEditId(c.id)} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-adm-line bg-white p-4">
          {clubs.length === 0 ? (
            <AdminEmpty
              title="Nenhum artista ainda"
              text="Crie o primeiro artista para abrir um ambiente com fã clubes."
              action={
                <button type="button" onClick={() => setCreateOpen(true)} className={btnPrimary}>
                  Criar artista
                </button>
              }
            />
          ) : (
            <AdminEmpty title="Nenhum fã clube encontrado" text="Tente outra busca ou mude o filtro de status." />
          )}
        </div>
      )}

      {editClub && <EditClubDialog key={editClub.id} club={editClub} onClose={() => setEditId(null)} />}

      {createOpen && <CreateDialog onClose={closeCreate} onCreate={handleCreate} templateFrom={templateFrom} />}
    </>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function CreateDialog({
  onClose,
  onCreate,
  templateFrom,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; fanClubName: string; instagram: string; template: Template; invites: string[] }) => Promise<string | null>;
  /** Nome do ambiente cuja estrutura pode ser copiada (vazio = sem essa opção). */
  templateFrom: string | null;
}) {
  const [name, setName] = useState("");
  const [fcName, setFcName] = useState("");
  const [fcError, setFcError] = useState("");
  const [ig, setIg] = useState("");
  const [tpl, setTpl] = useState<Template>("blank");
  const [email, setEmail] = useState("");
  const [invites, setInvites] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
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
  const full = invites.length >= MAX_ADMINS;

  /** Confere o e-mail digitado; devolve a lista de convites com ele, ou null se não serve. */
  const addInvite = (): string[] | null => {
    const v = email.trim();
    if (!v) return invites;
    if (full) {
      setEmailError(`Só cabem ${MAX_ADMINS} pessoas na equipe.`);
      return null;
    }
    if (!EMAIL_RE.test(v)) {
      setEmailError("Digite um e-mail válido.");
      return null;
    }
    if (invites.includes(v)) {
      setEmailError("Esse e-mail já foi adicionado.");
      return null;
    }
    const next = [...invites, v];
    setInvites(next);
    setEmail("");
    setEmailError("");
    return next;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (creating) return;
    // Campos obrigatórios antes de chamar a API.
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError("Digite o nome artístico (pelo menos 2 letras).");
      nameRef.current?.focus();
      return;
    }
    setNameError("");
    const officialName = fcName.trim();
    if (officialName.length < 2) {
      setFcError("Digite o nome oficial do fã clube (pelo menos 2 letras).");
      document.getElementById("cr-fc")?.focus();
      return;
    }
    setFcError("");
    // E-mail digitado e não adicionado entra na equipe (ou barra o envio se for inválido).
    const list = addInvite();
    if (!list) {
      document.getElementById("cr-email")?.focus();
      return;
    }
    if (list.length === 0) {
      setEmailError("Informe o e-mail do dono do fã clube master.");
      document.getElementById("cr-email")?.focus();
      return;
    }
    setSubmitError("");
    startCreate(async () => {
      const err = await onCreate({ name: trimmed, fanClubName: officialName, instagram: ig.trim(), template: tpl, invites: list });
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
            {submitError && <AdminNotice tone="error">{submitError}</AdminNotice>}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-name" className="text-[13px] font-semibold">
                Nome artístico <span className="font-normal text-adm-muted">(obrigatório)</span>
              </label>
              <input
                ref={nameRef}
                id="cr-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError("");
                }}
                placeholder="Ex.: [Nome do artista]"
                required
                aria-required="true"
                aria-invalid={nameError ? true : undefined}
                aria-describedby={nameError ? "cr-name-error cr-slug" : "cr-slug"}
                autoComplete="off"
                className={inputClass}
              />
              {nameError && (
                <span id="cr-name-error" role="alert" className="text-xs font-semibold text-adm-danger">
                  {nameError}
                </span>
              )}
              <span id="cr-slug" className="font-adm-mono text-xs text-adm-muted">
                Endereço: [seudominio]/{slug}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-fc" className="text-[13px] font-semibold">
                Nome oficial do fã clube <span className="font-normal text-adm-muted">(obrigatório)</span>
              </label>
              <input
                id="cr-fc"
                value={fcName}
                onChange={(e) => {
                  setFcName(e.target.value);
                  if (fcError) setFcError("");
                }}
                placeholder="Ex.: ARMY, Swifties"
                required
                aria-required="true"
                aria-invalid={fcError ? true : undefined}
                aria-describedby={fcError ? "cr-fc-error" : undefined}
                autoComplete="off"
                className={inputClass}
              />
              {fcError && (
                <span id="cr-fc-error" role="alert" className="text-xs font-semibold text-adm-danger">
                  {fcError}
                </span>
              )}
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
                {templateFrom && <option value="vc">Copiar estrutura de {templateFrom} (sem o visual)</option>}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="cr-email" className="text-[13px] font-semibold">
                Equipe do fã clube master{" "}
                <span className="font-normal text-adm-muted">
                  ({invites.length}/{MAX_ADMINS}) · o dono é obrigatório
                </span>
              </label>
              <span className="text-xs text-adm-muted">
                O primeiro e-mail é o dono do fã clube master (o admin master do cantor); os outros entram como ajudantes. Cada
                conta ganha uma senha provisória, mostrada uma única vez depois de criar.
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
            <button type="submit" disabled={creating} aria-busy={creating} className={btnPrimary}>
              {creating ? "Criando…" : "Criar ambiente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
