"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { updateFanClub } from "@/app/actions/admin";
import { AvatarUpload } from "@/components/admin/AvatarUpload";
import { Switch } from "@/components/admin/controls";
import { AdminNotice, btnOutlineBlue, btnPrimary, btnSecondary, inputClass } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { ClubPhoto } from "./ClubCard";
import type { ClubRow } from "./FasClubesClient";

/** `off`: módulo que fica desligado enquanto o fã clube não tem a chave (a revenda nasce escondida). */
const moduleList: { id: string; label: string; hint: string; off?: boolean }[] = [
  { id: "mural", label: "Mural", hint: "Drop News, feed da galera e Instagram" },
  { id: "agenda", label: "Agenda", hint: "Shows, ingressos e sorte do evento" },
  { id: "pickup", label: "PicKup da sorte", hint: "Roleta geral" },
  { id: "loja", label: "Loja virtual", hint: "Produtos e drops da loja" },
  { id: "drops", label: "Drops Hits", hint: "Prévias de músicas" },
  { id: "photo", label: "Photo Finder", hint: "Busca de fotos por selfie" },
  { id: "ads", label: "Mídia e anúncios", hint: "Vitrines para patrocinadores" },
  { id: "resale", label: "Revenda entre fãs", hint: "Compra e venda de ingressos entre fãs", off: true },
];

const HEX = /^#[0-9a-fA-F]{6}$/;
const brl = (cents: number) => (cents / 100).toFixed(2).replace(".", ",");
/** "16,90" ou "16.9" em centavos; null se não for um valor. */
const toCents = (v: string): number | null => {
  const n = Number(v.trim().replace(/\./g, "").replace(",", "."));
  return v.trim() && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

export function EditClubDialog({ club, onClose }: { club: ClubRow; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState(club.name);
  const [fanClubName, setFanClubName] = useState(club.fanClubName);
  const [instagram, setInstagram] = useState(club.instagram ?? "");
  const [color, setColor] = useState(club.color);
  const [price, setPrice] = useState(brl(club.memberPriceCents));
  const [status, setStatus] = useState(club.status);
  const [mods, setMods] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(moduleList.map((m) => [m.id, club.modules?.[m.id] ?? !m.off])),
  );
  const [busyMod, setBusyMod] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
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

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select, textarea, a[href]');
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

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (pending) return;
    const cents = toCents(price);
    if (name.trim().length < 2) return setError("O nome do artista precisa de pelo menos 2 letras.");
    if (fanClubName.trim().length < 2 || fanClubName.trim().startsWith("[")) return setError("O nome oficial do fã clube é obrigatório.");
    if (!HEX.test(color)) return setError("Escolha a cor da marca (formato #RRGGBB).");
    if (cents === null) return setError("Digite o preço da assinatura, por exemplo 16,90.");
    setError("");
    start(async () => {
      const res = await updateFanClub(club.slug, {
        name: name.trim(),
        fanClubName: fanClubName.trim(),
        instagram: instagram.trim(),
        brandColor: color,
        memberPriceCents: cents,
      });
      if (!res.ok) return setError(res.error);
      setSaved(true);
      router.refresh();
    });
  };

  const toggleStatus = () => {
    const next = status === "active" ? "setup" : "active";
    setStatus(next);
    start(async () => {
      const res = await updateFanClub(club.slug, { status: next });
      if (!res.ok) {
        setStatus(status);
        return setError(res.error);
      }
      setError("");
      router.refresh();
    });
  };

  const toggleModule = (id: string, label: string, on: boolean) => {
    setMods((m) => ({ ...m, [id]: on }));
    setBusyMod(id);
    start(async () => {
      const res = await updateFanClub(club.slug, { modules: { [id]: on } });
      setBusyMod("");
      if (!res.ok) {
        setMods((m) => ({ ...m, [id]: !on }));
        return setError(`Não deu para ${on ? "ligar" : "desligar"} ${label}: ${res.error}`);
      }
      setError("");
      router.refresh();
    });
  };

  const field = "flex flex-col gap-1.5";
  const label = "text-[13px] font-semibold";

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-adm-ink/55 px-4 py-10"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-title"
        onKeyDown={trapFocus}
        className="flex w-full max-w-[640px] flex-col rounded-[14px] bg-white shadow-[0_20px_60px_rgba(20,23,28,.3)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-adm-line-soft px-6 py-5">
          <div className="flex flex-col gap-0.5">
            <h2 id="edit-title" className="m-0 text-xl font-bold">
              Editar {club.name}
            </h2>
            <span className="font-adm-mono text-xs text-adm-muted">/{club.slug}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-lg bg-adm-bg text-adm-ink">
            <Icon name="close" size={18} strokeWidth={2.4} />
          </button>
        </div>

        <form onSubmit={save} noValidate className="flex flex-col gap-5 px-6 py-5">
          {error && <AdminNotice tone="error">{error}</AdminNotice>}
          {saved && !error && <AdminNotice tone="ok">Informações salvas.</AdminNotice>}

          <div className="flex items-center gap-4 rounded-xl bg-adm-bg p-4">
            <ClubPhoto club={{ ...club, color }} size={80} />
            <div className="flex min-w-0 flex-col gap-1.5">
              <strong className="text-sm">Foto do cantor (perfil do fã clube)</strong>
              {club.masterSlug ? (
                <>
                  <AvatarUpload slug={club.slug} club={club.masterSlug} />
                  <span className="text-xs text-adm-muted">JPG, PNG ou WebP, até 5 MB. Aparece no app e como fundo do card.</span>
                </>
              ) : (
                <span className="text-xs text-adm-muted">Este ambiente ainda não tem um fã clube master.</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={field}>
              <label htmlFor="ed-name" className={label}>Nome do artista</label>
              <input ref={nameRef} id="ed-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} autoComplete="off" />
            </div>
            <div className={field}>
              <label htmlFor="ed-fc" className={label}>
                Nome oficial do fã clube <span className="font-normal text-adm-muted">(obrigatório)</span>
              </label>
              <input id="ed-fc" value={fanClubName} onChange={(e) => setFanClubName(e.target.value)} placeholder="Ex.: ARMY, Swifties" required aria-required="true" className={inputClass} autoComplete="off" />
            </div>
            <div className={field}>
              <label htmlFor="ed-ig" className={label}>Instagram</label>
              <input id="ed-ig" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@perfil" className={inputClass} autoComplete="off" />
            </div>
            <div className={field}>
              <label htmlFor="ed-price" className={label}>Assinatura mensal (R$)</label>
              <input id="ed-price" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="16,90" className={inputClass} autoComplete="off" />
            </div>
            <div className={`${field} sm:col-span-2`}>
              <label htmlFor="ed-color" className={label}>Cor da marca</label>
              <div className="flex items-center gap-2">
                <input
                  id="ed-color"
                  type="color"
                  value={HEX.test(color) ? color : "#2F5BD3"}
                  onChange={(e) => setColor(e.target.value)}
                  aria-label="Escolher a cor da marca"
                  className="h-11 w-14 cursor-pointer rounded-lg border border-adm-line bg-white p-1"
                />
                <input value={color} onChange={(e) => setColor(e.target.value)} aria-label="Cor da marca em hexadecimal" maxLength={7} className={`${inputClass} w-32 font-adm-mono`} autoComplete="off" />
                <span className="text-xs text-adm-muted">Usada no card e nos destaques do ambiente.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <button type="button" onClick={onClose} className={btnSecondary}>
              Fechar
            </button>
            <button type="submit" disabled={pending} aria-busy={pending} className={btnPrimary}>
              {pending ? "Salvando…" : "Salvar informações"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-1.5 border-t border-adm-line-soft px-6 py-5">
          <h3 className="m-0 mb-1 text-base font-bold">Publicação e módulos</h3>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-adm-bg px-3 py-2.5">
            <span className="text-sm">{status === "active" ? "No ar para os fãs." : "Em configuração: só a equipe vê."}</span>
            <button type="button" onClick={toggleStatus} disabled={pending} className={btnOutlineBlue}>
              {status === "active" ? "Tirar do ar" : "Colocar no ar"}
            </button>
          </div>
          {moduleList.map((m) => (
            <div key={m.id} className="flex min-h-12 items-center justify-between gap-3 border-b border-adm-line-soft" aria-busy={busyMod === m.id || undefined}>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">{m.label}</span>
                <span className="text-xs text-adm-muted">{busyMod === m.id ? "Salvando…" : m.hint}</span>
              </span>
              <span className={busyMod === m.id ? "pointer-events-none opacity-60" : undefined}>
                <Switch checked={mods[m.id]} label={m.label} onChange={(v) => toggleModule(m.id, m.label, v)} />
              </span>
            </div>
          ))}
          <Link href={`/${club.slug}/admin`} className="mt-3 text-sm font-semibold text-adm-blue no-underline hover:underline">
            Abrir o painel completo do ambiente →
          </Link>
        </div>
      </div>
    </div>
  );
}
