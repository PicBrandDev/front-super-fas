"use client";

import Link from "next/link";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getFinderStatus, searchMyPhotos, type FinderStatus } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { Mark } from "@/components/fan/Mark";
import { Masthead } from "@/components/fan/Masthead";
import { Icon } from "@/components/icons";
import { FaceCamera } from "./FaceCamera";
import type { FinderEvent } from "./PhotoFinderFlow";
import s from "./PhotoFinderFlow.module.css";

type Stage = "idle" | "searching" | "found" | "none";
type Photo = { id: string; src: string };

/**
 * Photo Finder de verdade: o fã envia uma selfie e o servidor procura o rosto nas fotos oficiais do show
 * com o AWS Rekognition. A selfie não é guardada. A busca abre depois do show, para quem comprou o pacote com Photo Finder.
 */
export function LivePhotoFinder({ shows, initial }: { shows: FinderEvent[]; initial?: string }) {
  const { base, slug } = useArtist();
  const [ev, setEv] = useState(initial ?? shows[0]?.id ?? "");
  const [statusFor, setStatusFor] = useState<{ ev: string; data: FinderStatus } | null>(null);
  const status = statusFor?.ev === ev ? statusFor.data : null;
  const [stage, setStage] = useState<Stage>("idle");
  const [selfie, setSelfie] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [camera, setCamera] = useState(false);

  // Solta a prévia da selfie ao trocar ou sair.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // Pergunta ao servidor se este fã pode buscar neste show.
  useEffect(() => {
    if (!ev) return;
    let alive = true;
    getFinderStatus(slug, ev).then((res) => {
      if (alive) setStatusFor({ ev, data: res.ok ? res.data : { enabled: false, photos: 0, eligible: false, reason: res.error } });
    });
    return () => {
      alive = false;
    };
  }, [slug, ev]);

  function reset() {
    setStage("idle");
    setSelfie(null);
    setPreview(null);
    setError("");
    setPhotos([]);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!["image/jpeg", "image/png"].includes(f.type)) return setError("Envie a selfie em JPG ou PNG.");
    if (f.size > 5 * 1024 * 1024) return setError("A selfie pode ter no máximo 5 MB.");
    setError("");
    setSelfie(f);
    setPreview(URL.createObjectURL(f));
  }

  function onShot(f: File) {
    setCamera(false);
    setError("");
    setSelfie(f);
    setPreview(URL.createObjectURL(f));
  }

  async function search(e: FormEvent) {
    e.preventDefault();
    if (!selfie || !consent || stage === "searching") return;
    setStage("searching");
    setError("");
    const form = new FormData();
    form.set("selfie", selfie);
    form.set("consent", "true");
    const res = await searchMyPhotos(slug, ev, form);
    if (!res.ok) {
      setStage("idle");
      return setError(res.error);
    }
    setPhotos(res.data.matches);
    setStage(res.data.matches.length > 0 ? "found" : "none");
  }

  const searching = stage === "searching";
  const canSearch = !!status?.eligible && !!selfie && consent && !searching;

  return (
    <>
      <Masthead word="Fotos" label="Photo finder" tone="lagoon-deep" />

      <div className={s.ph}>
        <Link href={initial ? `${base}/agenda` : `${base}/agenda`} className="back">
          <Icon name="back" size={18} />
          Agenda
        </Link>
        <div className={s.you} aria-hidden="true">
          Você
        </div>
        <p>Envie uma selfie e a gente procura você nas fotos oficiais do show.</p>
        <label className="mono" htmlFor="pf-event">
          Show
        </label>
        {shows.length === 0 ? (
          <span className="mono">Nenhum show com fotos ainda</span>
        ) : (
          <select
            id="pf-event"
            className="field"
            value={ev}
            disabled={searching}
            onChange={(e) => {
              setEv(e.target.value);
              reset();
            }}
          >
            {shows.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {camera && <FaceCamera onCapture={onShot} onClose={() => setCamera(false)} />}

      <div className={s.finder} aria-live="polite">
        {status && !status.eligible && (
          <p className={s.hint} role="status">
            {status.reason}
          </p>
        )}

        {(stage === "idle" || searching) && status?.eligible && (
          <form onSubmit={search} className="grid gap-4">
            <div className={`${s.frame} ${s.oval} ${searching ? s.scanning : ""}`}>
              <i />
              <i />
              <i />
              <i />
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element -- prévia local da selfie
                <img src={preview} alt="Sua selfie" />
              ) : (
                <Icon name="camera" size={40} />
              )}
              <span className={s.scanline} />
            </div>
            <div className={s.ctas}>
              <button type="button" className="btn btn-outline btn-block" onClick={() => setCamera(true)} disabled={searching}>
                <Icon name="camera" size={18} />
                {selfie ? "Tirar outra selfie" : "Abrir a câmera"}
              </button>
              <label className="btn btn-ghost btn-block" htmlFor="selfie" aria-disabled={searching || undefined}>
                Enviar uma foto da galeria
              </label>
              <input id="selfie" className="sr-only" type="file" accept="image/jpeg,image/png" disabled={searching} onChange={onFile} />
              <label className="flex items-start gap-2 text-[14px] leading-5 text-fg-muted">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                <span>
                  Autorizo usar a minha selfie só para procurar as minhas fotos neste show. Ela é analisada por reconhecimento facial e não é guardada.
                </span>
              </label>
              <button type="submit" className="btn btn-primary btn-block" disabled={!canSearch} aria-busy={searching || undefined}>
                {searching ? "Procurando você…" : "Procurar minhas fotos"}
              </button>
            </div>
            {error && (
              <p className="err" role="alert">
                {error}
              </p>
            )}
            {status.photos > 0 && <p className={`mono ${s.note}`}>{status.photos} fotos neste show</p>}
          </form>
        )}

        {stage === "found" && (
          <>
            <div className={s.foundH}>
              <strong>
                {photos.length} {photos.length === 1 ? "foto com você" : "fotos com você"}
              </strong>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Nova busca
              </button>
            </div>
            <div className={s.grid}>
              {photos.map((p) => (
                <figure key={p.id} className={s.shot}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- foto oficial do show */}
                  <img src={p.src} alt="Foto do show em que você aparece" loading="lazy" />
                  <span className={s.wm}>
                    <Mark size={22} />
                  </span>
                  <a href={p.src} download className="mono num">
                    Baixar
                  </a>
                </figure>
              ))}
            </div>
          </>
        )}

        {stage === "none" && (
          <>
            <div className={s.foundH}>
              <strong>Não encontramos você</strong>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Tentar outra selfie
              </button>
            </div>
            <p className={s.hint}>Tente uma selfie de frente, com boa luz. As fotos do show também podem ainda estar sendo publicadas.</p>
          </>
        )}
      </div>
    </>
  );
}
