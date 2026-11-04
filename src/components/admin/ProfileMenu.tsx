"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { logout } from "@/app/actions/auth";
import { renameMe, uploadMyAvatar } from "@/app/actions/fan";
import { AdminNotice, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { WithSeal } from "@/components/VerifiedSeal";
import { thumb } from "@/lib/thumb";

export type ProfileUser = { initials: string; name: string; role: string; email?: string; avatar?: string | null; verified?: boolean };

function Face({ user, size, className = "" }: { user: ProfileUser; size: number; className?: string }) {
  const box = { width: size, height: size };
  const face = user.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element -- foto de perfil de quem está logado
    <img src={thumb(user.avatar, size)} alt="" width={size} height={size} style={box} className={`flex-none rounded-full object-cover ${className}`} />
  ) : (
    <span style={{ ...box, fontSize: size * 0.38 }} className={`flex flex-none items-center justify-center rounded-full bg-adm-side-line font-semibold ${className}`}>
      {user.initials}
    </span>
  );
  return (
    <WithSeal size={size} verified={user.verified}>
      {face}
    </WithSeal>
  );
}

/** Usuário no rodapé do menu: ao clicar abre o painel do perfil (dados, foto, nome, senha e sair). */
export function ProfileMenu({ user, passwordHref, accountEnabled }: { user: ProfileUser; passwordHref: string; accountEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const identity = (
    <>
      <Face user={user} size={32} className="border border-adm-side-line" />
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <strong className="truncate text-[13px]">{user.name}</strong>
        <span className="font-adm-mono text-[11px] text-adm-side-muted">{user.role}</span>
      </span>
    </>
  );

  if (!accountEnabled) return <div className="flex items-center gap-2.5 px-1.5 py-1">{identity}</div>;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        title="Ver e editar meu perfil"
        className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-1.5 py-1 font-adm text-inherit hover:bg-white/5"
      >
        {identity}
        <span aria-hidden="true" className="text-adm-side-muted">⋯</span>
      </button>
      {/* No body, fora do menu lateral: o menu tem camada própria e deixaria o painel por baixo da página. */}
      {open &&
        createPortal(
          <ProfileDialog
            user={user}
            passwordHref={passwordHref}
            onClose={() => {
              setOpen(false);
              btnRef.current?.focus();
            }}
          />,
          document.body,
        )}
    </>
  );
}

function ProfileDialog({ user, passwordHref, onClose }: { user: ProfileUser; passwordHref: string; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]):not(.sr-only), a[href]");
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

  const pickPhoto = (f: File | undefined) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) return setError("Envie a foto em JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setError("A foto pode ter no máximo 5 MB.");
    setError("");
    setSaved("");
    const form = new FormData();
    form.set("image", f);
    start(async () => {
      const res = await uploadMyAvatar(form);
      if (!res.ok) return setError(res.error);
      setSaved("Foto atualizada.");
      router.refresh();
    });
  };

  const saveName = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const v = name.trim();
    if (v.length < 2) return setError("Digite seu nome (pelo menos 2 letras).");
    if (v === user.name) return setSaved("Nada mudou.");
    setError("");
    setSaved("");
    start(async () => {
      const res = await renameMe(v);
      if (!res.ok) return setError(res.error);
      setSaved("Nome atualizado.");
      router.refresh();
    });
  };

  const row = "flex flex-col gap-1.5";
  const label = "text-[13px] font-semibold";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-adm-ink/55 px-4 py-16 font-adm text-adm-ink"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-title"
        onKeyDown={trapFocus}
        className="flex w-full max-w-[460px] flex-col rounded-[14px] bg-white shadow-[0_20px_60px_rgba(20,23,28,.3)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-adm-line-soft px-6 py-5">
          <h2 id="profile-title" className="m-0 text-xl font-bold">
            Meu perfil
          </h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-adm-bg text-adm-ink">
            <Icon name="close" size={18} strokeWidth={2.4} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          {error && <AdminNotice tone="error">{error}</AdminNotice>}
          {saved && !error && <AdminNotice tone="ok">{saved}</AdminNotice>}

          <div className="flex items-center gap-4 rounded-xl bg-adm-bg p-4">
            <Face user={user} size={88} className="!bg-adm-blue-soft !text-adm-blue-dark" />
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <strong className="truncate text-base">{user.name}</strong>
              <button type="button" onClick={() => input.current?.click()} disabled={pending} className="min-h-10 cursor-pointer rounded-lg border border-adm-line bg-white px-3 text-[13px] font-semibold text-adm-ink disabled:opacity-60">
                {pending ? "Enviando…" : user.avatar ? "Trocar foto de perfil" : "Adicionar foto de perfil"}
              </button>
              <input
                ref={input}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Foto de perfil"
                onChange={(e) => {
                  pickPhoto(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <span className="text-xs text-adm-muted">JPG, PNG ou WebP, até 5 MB.</span>
            </div>
          </div>

          <form onSubmit={saveName} noValidate className="flex flex-col gap-3">
            <div className={row}>
              <label htmlFor="pf-name" className={label}>
                Nome
              </label>
              <div className="flex gap-2">
                <input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} min-w-0 flex-1`} autoComplete="name" />
                <button type="submit" disabled={pending} className={btnPrimary}>
                  Salvar
                </button>
              </div>
            </div>
            <div className={row}>
              <label htmlFor="pf-email" className={label}>
                E-mail <span className="font-normal text-adm-muted">(usado para entrar)</span>
              </label>
              <input id="pf-email" value={user.email ?? "—"} readOnly className={`${inputClass} bg-adm-bg text-adm-muted`} />
            </div>
            <div className={row}>
              <span className={label}>Perfil de acesso</span>
              <span className="text-sm">{user.role}</span>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap justify-between gap-2.5 border-t border-adm-line-soft px-6 py-4">
          <Link href={passwordHref} onClick={onClose} className={`${btnSecondary} no-underline`}>
            Trocar senha
          </Link>
          <form action={logout}>
            <button type="submit" className={`${btnSecondary} cursor-pointer`}>
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
