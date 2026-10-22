"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { publishDrop } from "@/app/actions/admin";
import { AdminNotice, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_TEXT = 2000;

type Step = 1 | 2 | 3;
const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: "Foto" },
  { n: 2, label: "Legenda" },
  { n: 3, label: "Revisar" },
];

/**
 * Compositor de Drop News no estilo do Instagram: escolhe a foto, escreve a legenda,
 * revisa no preview (igual ao que o fã vê) e publica.
 */
export function DropComposer({
  slug,
  artistName,
  onClose,
  onPublished,
}: {
  slug: string;
  artistName: string;
  onClose: () => void;
  onPublished: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<Element | null>(null);

  useEffect(() => {
    trigger.current = document.activeElement;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      (trigger.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose, pending]);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError("Envie a foto em JPG, PNG ou WebP.");
    if (f.size > MAX_BYTES) return setError("A foto pode ter no máximo 5 MB.");
    setError("");
    setFile(f);
  };

  const next = () => {
    if (step === 2 && !text.trim()) return setError("Escreva a legenda do post.");
    setError("");
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  const publish = () => {
    if (!text.trim()) {
      setStep(2);
      return setError("Escreva a legenda do post.");
    }
    const form = new FormData();
    form.set("text", text.trim());
    if (file) form.set("image", file);
    start(async () => {
      const res = await publishDrop(slug, form);
      if (!res.ok) return setError(res.error);
      onPublished();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && !pending && onClose()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-title"
        tabIndex={-1}
        className="flex max-h-dvh w-full max-w-[860px] flex-col overflow-hidden bg-adm-surface text-adm-ink outline-none sm:max-h-[92dvh] sm:rounded-xl sm:border sm:border-adm-line"
      >
        <header className="flex items-center justify-between gap-3 border-b border-adm-line px-4 py-3">
          <h2 id="composer-title" className="m-0 text-base font-bold">
            Novo Drop News
          </h2>
          <ol aria-label="Etapas" className="m-0 flex list-none gap-3 p-0 font-adm-mono text-xs">
            {STEPS.map((s) => (
              <li key={s.n} aria-current={step === s.n ? "step" : undefined} className={step === s.n ? "font-semibold text-adm-ink" : "text-adm-muted"}>
                {s.n}. {s.label}
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Fechar"
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-adm-line bg-white"
          >
            <Icon name="close" size={14} strokeWidth={2.6} />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto p-4 sm:grid-cols-[1fr_300px] sm:p-6">
          <div className="flex min-w-0 flex-col gap-4">
            {error && <AdminNotice tone="error">{error}</AdminNotice>}

            {step === 1 && (
              <>
                <p className="m-0 text-sm text-adm-muted">Escolha a foto do post (JPG, PNG ou WebP, até 5 MB). Ela é opcional: sem foto, o card sai só com a legenda.</p>
                <label
                  htmlFor="drop-file"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    pick(e.dataTransfer.files?.[0]);
                  }}
                  className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-adm-input bg-adm-bg px-4 py-8 text-center"
                >
                  <Icon name="upload" size={22} />
                  <strong className="text-sm">{file ? file.name : "Clique ou arraste a foto aqui"}</strong>
                  {file && <span className="text-xs text-adm-muted">Clique para trocar</span>}
                </label>
                <input id="drop-file" type="file" accept={TYPES.join(",")} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
                {file && (
                  <button type="button" onClick={() => setFile(null)} className={`${btnSecondary} self-start`}>
                    Tirar a foto
                  </button>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <label htmlFor="drop-text" className="text-sm font-semibold">
                  Legenda
                </label>
                <textarea
                  id="drop-text"
                  autoFocus
                  value={text}
                  maxLength={MAX_TEXT}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder={`Escreva o que ${artistName} quer contar para os fãs…`}
                  className="w-full resize-y rounded-lg border border-adm-input bg-white p-3 text-[15px] leading-6 text-adm-ink placeholder:text-adm-muted"
                />
                <span className="self-end font-adm-mono text-xs text-adm-muted">
                  {text.length}/{MAX_TEXT}
                </span>
              </>
            )}

            {step === 3 && (
              <>
                <p className="m-0 text-sm text-adm-muted">Confira o post ao lado. Ao publicar, ele aparece na hora para os fãs.</p>
                <dl className="m-0 flex flex-col gap-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-24 flex-none font-semibold">Foto</dt>
                    <dd className="m-0">{file ? file.name : "Sem foto"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 flex-none font-semibold">Legenda</dt>
                    <dd className="m-0 whitespace-pre-wrap break-words">{text.trim() || "—"}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-24 flex-none font-semibold">Quem vê</dt>
                    <dd className="m-0">Todos os fãs de {artistName}</dd>
                  </div>
                </dl>
              </>
            )}
          </div>

          <aside aria-label="Prévia do post" className="flex flex-col gap-2">
            <span className="font-adm-mono text-xs font-semibold text-adm-muted">Prévia</span>
            <div className="overflow-hidden rounded-xl border border-adm-line bg-white">
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-adm-blue text-xs font-bold text-white">
                  {initialsOf(artistName)}
                </span>
                <span className="flex flex-col leading-4">
                  <strong className="text-[13px]">{artistName}</strong>
                  <span className="text-[11px] text-adm-muted">Oficial · agora</span>
                </span>
              </div>
              {preview ? (
                <img src={preview} alt="Foto do post" className="block aspect-[4/5] w-full object-cover" />
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center bg-adm-bg text-adm-muted">
                  <Icon name="image" size={28} />
                </div>
              )}
              <div className="flex items-center gap-3 px-3 pt-2.5">
                <Icon name="heart" size={20} />
                <Icon name="comment" size={20} />
                <Icon name="share" size={20} />
              </div>
              <p className="m-0 px-3 pb-3 pt-1.5 text-[13px] leading-5">
                <strong>{artistName}</strong> <span className="whitespace-pre-wrap break-words">{text.trim() || "A legenda aparece aqui."}</span>
              </p>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-adm-line px-4 py-3">
          <button
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep((s) => (s - 1) as Step))}
            disabled={pending}
            className={btnSecondary}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          {step < 3 ? (
            <button type="button" onClick={next} className={btnPrimary}>
              Continuar
            </button>
          ) : (
            <button type="button" onClick={publish} disabled={pending} className={btnPrimary}>
              {pending ? "Publicando…" : "Publicar"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
