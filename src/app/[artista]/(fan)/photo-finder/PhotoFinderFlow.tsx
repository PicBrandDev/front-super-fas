"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Mark } from "@/components/fan/Mark";
import { Masthead } from "@/components/fan/Masthead";
import { useToast } from "@/components/fan/Toast";
import { Icon } from "@/components/icons";
import type { MediaImage } from "@/lib/types";
import s from "./PhotoFinderFlow.module.css";

export type FinderEvent = { id: string; label: string };

type Stage = "idle" | "scanning" | "found" | "hours";

const HOURS = ["22h", "23h", "00h", "01h", "02h", "03h"];
const FOUND_TIMES = ["23:41", "00:12", "00:58", "01:20", "01:47", "02:33"];
const SCAN_MS = 2200;
const SCAN_REDUCED_MS = 300;

/**
 * Photo Finder: a selfie fica só no aparelho; a busca é simulada (2,2 s) e
 * devolve as fotos do evento com marca d'água e horário.
 */
export function PhotoFinderFlow({
  shows,
  initial,
  photos,
  demo,
}: {
  shows: FinderEvent[];
  /** Evento pré-selecionado (?evento=). */
  initial?: string;
  /** Fotos "do evento" (até 6). */
  photos: MediaImage[];
  demo: boolean;
}) {
  const { base } = useArtist();
  const toast = useToast();
  const [ev, setEv] = useState(initial ?? shows[0]?.id ?? "");
  const [stage, setStage] = useState<Stage>("idle");
  const [hour, setHour] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Libera a URL da selfie ao trocar ou sair.
  useEffect(() => {
    return () => {
      if (selfie?.startsWith("blob:")) URL.revokeObjectURL(selfie);
    };
  }, [selfie]);
  useEffect(() => () => clearTimer(), []);

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  function scan(src: string | null) {
    setSelfie(src);
    setStage("scanning");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    clearTimer();
    // Simulado: aqui entraria POST /artists/{slug}/photo-finder/search (evento + selfie).
    timer.current = setTimeout(() => setStage("found"), reduce ? SCAN_REDUCED_MS : SCAN_MS);
  }

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) scan(URL.createObjectURL(file));
  }

  function reset() {
    clearTimer();
    setSelfie(null);
    setHour(null);
    setStage("idle");
  }

  const backHref = initial ? `${base}/eventos/${initial}` : `${base}/agenda`;
  const scanning = stage === "scanning";
  const shotsFor = (offset: number, label: (i: number) => string) =>
    Array.from({ length: 6 }, (_, i) => {
      const photo = photos[(i + offset) % Math.max(photos.length, 1)];
      return (
        <figure key={i} className={s.shot}>
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element -- foto estática do artista, sem otimização
            <img src={photo.src} alt={photo.alt} loading="lazy" />
          )}
          <span className={s.wm}>
            <Mark size={22} />
          </span>
          <span className="mono num">{label(i)}</span>
        </figure>
      );
    });

  return (
    <>
      <Masthead word="Fotos" label="Photo finder" tone="lagoon-deep" />

      <div className={s.ph}>
        <Link href={backHref} className="back">
          <Icon name="back" size={18} />
          {initial ? "Evento" : "Agenda"}
        </Link>
        <div className={s.you} aria-hidden="true">
          Você
        </div>
        <p>Envie uma selfie e a gente procura você nas fotos oficiais do evento.</p>
        <label className="mono" htmlFor="pf-event">
          Evento
        </label>
        {shows.length === 0 ? (
          <span className="mono">Nenhum evento com fotos ainda</span>
        ) : (
          <select
            id="pf-event"
            className="field"
            value={ev}
            disabled={scanning}
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

      <div className={s.finder} aria-live="polite">
        {(stage === "idle" || scanning) && (
          <>
            <div className={`${s.frame} ${scanning ? s.scanning : ""}`}>
              <i />
              <i />
              <i />
              <i />
              {selfie ? (
                // eslint-disable-next-line @next/next/no-img-element -- prévia local da selfie
                <img src={selfie} alt="" />
              ) : (
                <Icon name="camera" size={40} />
              )}
              <span className={s.scanline} />
            </div>
            <div className={s.ctas}>
              <label className="btn btn-primary btn-block" htmlFor="selfie" aria-disabled={scanning || undefined}>
                <Icon name="camera" size={18} />
                Enviar selfie
              </label>
              <input
                id="selfie"
                className="sr-only"
                type="file"
                accept="image/*"
                capture="user"
                disabled={scanning || !ev}
                onChange={onFile}
              />
              <button
                type="button"
                className="btn btn-outline btn-block"
                disabled={scanning || !ev}
                onClick={() => setStage("hours")}
              >
                <Icon name="clock" size={18} />
                Buscar por horário
              </button>
              <button
                type="button"
                className={`btn btn-ghost ${s.ghost}`}
                disabled={scanning || !ev}
                onClick={() => scan(photos[0]?.src ?? null)}
              >
                Usar selfie de exemplo
              </button>
            </div>
            {scanning ? (
              <p className={`mono ${s.status}`} role="status">
                Procurando você nas fotos do evento
              </p>
            ) : (
              <p className={`mono ${s.note}`}>A selfie serve só para a busca e não é publicada</p>
            )}
          </>
        )}

        {stage === "found" && (
          <>
            <div className={s.foundH}>
              <strong>6 fotos com você</strong>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Nova busca
              </button>
            </div>
            <div className={s.grid}>{shotsFor(0, (i) => FOUND_TIMES[i])}</div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              onClick={() => toast.show("Fotos salvas com marca d'água")}
            >
              <Icon name="download" size={18} />
              Baixar todas
            </button>
            {demo && <p className={`mono ${s.note}`}>Fotos ilustrativas · Exemplo</p>}
          </>
        )}

        {stage === "hours" && (
          <>
            <div className={s.foundH}>
              <strong>Por horário</strong>
              <button type="button" className="btn btn-ghost" onClick={reset}>
                Voltar à selfie
              </button>
            </div>
            <div className={s.times} role="group" aria-label="Horário">
              {HOURS.map((h) => (
                <button key={h} type="button" aria-pressed={h === hour} onClick={() => setHour(h)}>
                  {h}
                </button>
              ))}
            </div>
            {hour ? (
              <>
                <div className={s.grid}>{shotsFor(HOURS.indexOf(hour) * 3, () => hour)}</div>
                {demo && <p className="mono m-0">Fotos ilustrativas · Exemplo</p>}
              </>
            ) : (
              <p className={s.hint}>Escolha a hora em que você estava na pista.</p>
            )}
          </>
        )}
      </div>
    </>
  );
}
