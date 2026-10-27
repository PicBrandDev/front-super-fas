"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { fanPostMedia } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Notice } from "@/components/fan/states";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import { initialsOf } from "@/lib/format";
import { PersonAvatar } from "@/components/fan/PersonAvatar";
import type { Post } from "@/lib/types";
import { CameraCapture } from "./CameraCapture";

const MAX = 500;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export type PostClub = { slug: string; name: string; avatar?: string | null };

/**
 * Botão "+" flutuante da Comunidade: abre o compositor em tela cheia. O post é só texto ou texto com uma foto,
 * e o fã precisa escolher em qual fã clube vai publicar (já vem marcado quando só há um, ou quando ele está
 * olhando o feed de um fã clube).
 */
export function NewPostFab({
  clubs,
  defaultClub,
  onPosted,
}: {
  clubs: PostClub[];
  defaultClub?: string | null;
  onPosted?: (post: Post) => void;
}) {
  const { viewer, base, slug } = useArtist();
  const toast = useToast();
  const router = useRouter();
  const uid = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [club, setClub] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [posting, start] = useTransition();

  // Solta a prévia da foto ao trocar ou sair.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const trimmed = text.trim();
  const picked = clubs.find((c) => c.slug === club) ?? null;
  const canPost = !!trimmed && !!picked && !posting;
  const dirty = !!text || !!file;

  const openComposer = () => {
    // Já marca o fã clube quando só há um ou quando o fã está no feed de um deles.
    setClub(clubs.length === 1 ? clubs[0].slug : clubs.some((c) => c.slug === defaultClub) ? (defaultClub ?? "") : "");
    setOpen(true);
  };

  const close = () => {
    if (posting) return;
    if (dirty && !window.confirm("Descartar este post?")) return;
    setOpen(false);
    setText("");
    setError("");
    dropFile();
  };

  // Esc fecha, a página de trás não rola, e o campo de texto já vem focado.
  useEffect(() => {
    if (!open) return;
    area.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const pick = (f: File | undefined) => {
    if (!f) return;
    if (!TYPES.includes(f.type)) return setError("Envie a foto em JPG, PNG ou WebP.");
    if (f.size > 5 * 1024 * 1024) return setError("A foto pode ter no máximo 5 MB.");
    setError("");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  function dropFile() {
    setFile(null);
    setPreview(null);
  }

  const grow = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const submit = () => {
    if (!canPost || !picked) return;
    const form = new FormData();
    form.set("text", trimmed);
    if (file) form.set("image", file);
    start(async () => {
      const res = await fanPostMedia(slug, picked.slug, form);
      // Sem API (modo exemplo, status 0) o post aparece só nesta tela.
      if (!res.ok && res.status !== 0) return setError(res.error);
      const posted: Post = res.ok
        ? res.data
        : {
            id: `n-${Date.now()}`,
            kind: "galera",
            author: { name: "Você", handle: viewer.handle, initial: viewer.initial, avatar: viewer.avatar },
            timeLabel: "agora",
            text: trimmed,
            club: { slug: picked.slug, name: picked.name },
            likes: 0,
            comments: 0,
            reposts: 0,
          };
      onPosted?.(posted);
      toast.show(res.ok && res.data.rewardSpin ? `Publicado em ${picked.name} · você ganhou 1 giro na roleta` : `Publicado em ${picked.name}`);
      setOpen(false);
      setText("");
      setError("");
      dropFile();
      if (res.ok) router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Novo post"
        onClick={openComposer}
        className="fixed right-4 z-30 flex size-14 cursor-pointer items-center justify-center rounded-full border-0 bg-amber text-on-amber"
        style={{ bottom: "calc(var(--navspace, 0px) + 20px)" }}
      >
        <Icon name="plus" size={26} strokeWidth={2.4} />
      </button>

      {open && cameraOpen && (
        <CameraCapture
          onCapture={(f) => {
            setCameraOpen(false);
            pick(f);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
          className="fixed inset-0 z-50 flex flex-col bg-night text-fg"
          onKeyDown={(e) => e.key === "Escape" && close()}
        >
          <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
            <button type="button" className="btn btn-ghost" onClick={close}>
              Cancelar
            </button>
            <strong id={`${uid}-title`} className="mono">
              Novo post
            </strong>
            <button type="button" className="btn btn-primary btn-sm" onClick={submit} disabled={!canPost} aria-busy={posting || undefined}>
              {posting ? "Publicando…" : "Publicar"}
            </button>
          </header>

          {clubs.length === 0 ? (
            <div className="flex flex-1 flex-col items-start gap-3 px-4 py-8">
              <h2 className="m-0 font-display text-2xl font-black leading-7">Entre num fã clube para postar</h2>
              <Link href={`${base}/clubes`} className="btn btn-primary">
                Ver fã clubes
              </Link>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <section aria-labelledby={`${uid}-where`} className="border-b border-line px-4 py-3">
                  <p id={`${uid}-where`} className="mono m-0 mb-2">
                    Postar em
                  </p>
                  <div role="radiogroup" aria-labelledby={`${uid}-where`} className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
                    {clubs.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        role="radio"
                        aria-checked={club === c.slug}
                        aria-pressed={club === c.slug}
                        onClick={() => setClub(c.slug)}
                        className="btn btn-outline btn-sm chip flex-none"
                      >
                        {c.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element -- foto de perfil pequena do fã clube
                          <img src={c.avatar} alt="" width={18} height={18} className="size-[18px] rounded-full object-cover" />
                        ) : (
                          <span aria-hidden="true" className="flex size-[18px] items-center justify-center rounded-full bg-raised text-[10px] font-black text-fg">
                            {initialsOf(c.name).charAt(0)}
                          </span>
                        )}
                        {c.name}
                      </button>
                    ))}
                  </div>
                  {!picked && (
                    <p className="mono m-0 mt-2 text-signal" role="status">
                      Escolha o fã clube onde o post vai sair.
                    </p>
                  )}
                </section>

                <div className="grid grid-cols-[40px_1fr] gap-3 px-4 py-4">
                  <PersonAvatar src={viewer.avatar} name={viewer.name} />
                  <div className="min-w-0">
                    <label htmlFor={`${uid}-text`} className="sr-only">
                      Texto do post
                    </label>
                    <textarea
                      id={`${uid}-text`}
                      ref={area}
                      rows={4}
                      maxLength={MAX}
                      placeholder={picked ? `O que você quer contar para ${picked.name}?` : "O que você quer contar?"}
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        grow(e.target);
                      }}
                      className="block min-h-28 w-full resize-none border-0 bg-transparent p-0 text-[18px] leading-7 text-fg outline-none placeholder:text-fg-muted"
                    />

                    {preview && (
                      <div className="relative mt-3">
                        {/* eslint-disable-next-line @next/next/no-img-element -- prévia local da foto */}
                        <img src={preview} alt="Foto do post" className="block max-h-80 w-full rounded-hair object-cover" />
                        <button type="button" onClick={dropFile} aria-label="Tirar a foto" className="btn btn-outline btn-sm absolute right-2 top-2 bg-night">
                          <Icon name="close" size={14} strokeWidth={2.6} />
                        </button>
                      </div>
                    )}

                    {error && (
                      <div className="mt-3">
                        <Notice tone="error">{error}</Notice>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-2 pb-[max(8px,env(safe-area-inset-bottom))]">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-ghost no-underline"
                    onClick={() => {
                      // Câmera dentro do app; sem suporte do navegador, abre a câmera do aparelho.
                      if (typeof navigator.mediaDevices?.getUserMedia === "function") setCameraOpen(true);
                      else cameraInput.current?.click();
                    }}
                  >
                    <Icon name="camera" size={20} />
                    Tirar foto
                  </button>
                  <label htmlFor={`${uid}-file`} className="btn btn-ghost cursor-pointer no-underline">
                    <Icon name="image" size={20} />
                    Galeria
                  </label>
                </div>
                <input
                  id={`${uid}-file`}
                  type="file"
                  accept={TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => {
                    pick(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <input
                  ref={cameraInput}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  aria-label="Tirar foto com a câmera do aparelho"
                  onChange={(e) => {
                    pick(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <span className={`mono num ${text.length > MAX - 40 ? "text-signal" : ""}`}>
                  {text.length} / {MAX}
                </span>
              </footer>
            </>
          )}
        </div>
      )}
    </>
  );
}
