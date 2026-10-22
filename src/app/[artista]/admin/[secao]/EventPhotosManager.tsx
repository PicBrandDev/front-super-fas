"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deleteEventPhoto, indexEventPhotos, uploadEventPhotos } from "@/app/actions/admin";
import { AdminEmpty, AdminNotice, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { Icon } from "@/components/icons";
import type { EventPhoto } from "@/lib/types";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Fotos oficiais de um show para o Photo Finder. Com o AWS Rekognition ligado no servidor, cada foto
 * tem os rostos indexados no envio; a busca do fã compara a selfie com eles.
 */
export function EventPhotosManager({ slug, eventId, photos }: { slug: string; eventId: string; photos: EventPhoto[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const pendingIndex = photos.filter((p) => !p.indexed).length;

  const pick = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const list = [...files];
    const bad = list.find((f) => !TYPES.includes(f.type) || f.size > MAX_BYTES);
    if (bad) return setError(`“${bad.name}”: use JPG, PNG ou WebP de até 5 MB.`);
    if (list.length > 30) return setError("Envie até 30 fotos por vez.");
    const form = new FormData();
    list.forEach((f) => form.append("photos", f));
    setError("");
    setNotice("");
    start(async () => {
      const res = await uploadEventPhotos(slug, eventId, form);
      if (!res.ok) return setError(res.error);
      const indexed = res.data.filter((p) => p.indexed).length;
      setNotice(
        indexed === res.data.length
          ? `${res.data.length} fotos enviadas e com os rostos indexados.`
          : `${res.data.length} fotos enviadas. O reconhecimento facial está desligado no servidor, então os rostos ainda não foram indexados.`,
      );
      router.refresh();
    });
  };

  const reindex = () =>
    start(async () => {
      const res = await indexEventPhotos(slug, eventId);
      if (!res.ok) return setError(res.error);
      setError("");
      setNotice(`${res.data.length} fotos indexadas.`);
      router.refresh();
    });

  const remove = (id: string) =>
    start(async () => {
      const res = await deleteEventPhoto(slug, eventId, id);
      if (!res.ok) return setError(res.error);
      setConfirmDel(null);
      router.refresh();
    });

  return (
    <section aria-labelledby="fotos-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 id="fotos-title" className="m-0 text-lg font-bold">
            Fotos do show (Photo Finder)
          </h2>
          <p className="m-0 text-sm text-adm-muted">
            As fotos oficiais do show. O fã envia uma selfie e o reconhecimento facial da AWS devolve as fotos em que ele aparece.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {pendingIndex > 0 && (
            <button type="button" onClick={reindex} disabled={pending} className={btnSecondary}>
              Indexar {pendingIndex} pendentes
            </button>
          )}
          <button type="button" onClick={() => input.current?.click()} disabled={pending} className={btnPrimary} aria-busy={pending || undefined}>
            <Icon name="upload" size={18} />
            {pending ? "Enviando…" : "Enviar fotos"}
          </button>
          <input ref={input} type="file" accept={TYPES.join(",")} multiple className="sr-only" aria-label="Fotos do show" onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
        </div>
      </div>

      {error && <AdminNotice tone="error">{error}</AdminNotice>}
      {notice && <AdminNotice tone="ok">{notice}</AdminNotice>}

      {photos.length === 0 ? (
        <AdminEmpty title="Nenhuma foto deste show" text="Envie as fotos oficiais depois do show. Elas só aparecem para quem comprou o pacote com Photo Finder e se reconhece nelas." />
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]">
          {photos.map((p) => (
            <li key={p.id} className="flex flex-col gap-1.5 overflow-hidden rounded-xl border border-adm-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- foto oficial do show */}
              <img src={p.src} alt="" loading="lazy" className="block aspect-square w-full object-cover" />
              <div className="flex flex-col gap-1.5 px-2.5 pb-2.5">
                <span className="font-adm-mono text-[11px] text-adm-muted">
                  {p.indexed ? `${p.faces} ${p.faces === 1 ? "rosto" : "rostos"}` : "Não indexada"}
                </span>
                {confirmDel === p.id ? (
                  <span className="flex gap-1.5">
                    <button type="button" onClick={() => remove(p.id)} disabled={pending} className="min-h-9 cursor-pointer rounded-lg border-0 bg-adm-danger px-2.5 text-xs font-semibold text-white">
                      Excluir
                    </button>
                    <button type="button" onClick={() => setConfirmDel(null)} className="min-h-9 cursor-pointer rounded-lg border border-adm-line bg-white px-2.5 text-xs font-semibold">
                      Manter
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setConfirmDel(p.id)} className="min-h-9 cursor-pointer self-start rounded-lg border border-adm-line bg-white px-2.5 text-xs font-semibold text-adm-danger">
                    Excluir
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
