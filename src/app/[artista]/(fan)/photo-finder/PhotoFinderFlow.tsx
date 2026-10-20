"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Rings } from "@/components/fan/decor";
import { FaceCamera } from "@/components/fan/FaceCamera";
import { Icon } from "@/components/icons";

export type ShowOption = { id: string; city: string; label: string };

const PHOTO_TONES = ["bg-deep", "bg-accent", "bg-ink", "bg-accent-3", "bg-deep", "bg-accent"];
const SEARCH_MS = 1600;

const stepBadge =
  "flex size-7 flex-none items-center justify-center rounded-full bg-ink font-label text-xs font-bold text-paper";
const card = "flex flex-col rounded-[14px] border-2 border-ink bg-cream p-3.5";

export function PhotoFinderFlow({ shows }: { shows: ShowOption[] }) {
  const { base } = useArtist();
  const [ev, setEv] = useState(shows[0]?.id ?? "");
  const [selfie, setSelfie] = useState<{ file: File; url: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Libera a URL da prévia quando a selfie muda ou a tela sai.
  const selfieUrl = selfie?.url;
  useEffect(() => {
    return () => {
      if (selfieUrl) URL.revokeObjectURL(selfieUrl);
    };
  }, [selfieUrl]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onSelfie = (file: File) => {
    setSelfie({ file, url: URL.createObjectURL(file) });
    setDone(false);
  };

  // Volta para a câmera para tirar outra selfie.
  const retake = () => {
    setSelfie(null);
    setDone(false);
  };

  const search = () => {
    if (!selfie || searching) return;
    // TODO: POST /artists/{slug}/photo-finder/search (multipart: eventId = ev, selfie = selfie.file)
    // e mostrar as fotos devolvidas pela API no lugar dos espaços reservados.
    setSearching(true);
    setDone(false);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSearching(false);
      setDone(true);
    }, SEARCH_MS);
  };

  const cantSearch = !selfie || searching || !ev;
  const city = shows.find((s) => s.id === ev)?.city ?? "";

  return (
    <>
      <header className="relative overflow-hidden border-b-2 border-ink bg-accent-2 text-ink">
        <Rings className="-right-[50px] -top-10 size-[200px] lg:size-[280px]" inner="var(--fc-accent-2)" start={14} step={16} />
        <div className="relative mx-auto flex w-full max-w-[760px] flex-col gap-3.5 px-4 pb-5 pt-3 lg:px-8 lg:pt-8">
          <Link
            href={base}
            aria-label="Voltar ao início"
            className="flex size-11 items-center justify-center rounded-full border-2 border-ink bg-cream text-ink no-underline"
          >
            <Icon name="back" size={20} strokeWidth={2.4} />
          </Link>
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 font-display text-4xl font-normal leading-none text-ink lg:text-5xl">Photo Finder</h1>
            <p className="m-0 max-w-[260px] text-[15px] leading-[1.4] lg:max-w-[420px]">
              Ache as fotos que os fotógrafos tiraram de você no show.
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[760px] flex-col gap-4 px-4 pb-6 pt-[18px] lg:px-8">
        {/* Passo 1 */}
        <div className={`${card} gap-2`}>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className={stepBadge}>1</span>
            <label htmlFor="pf-event" className="font-body text-base font-extrabold">
              Escolha o show
            </label>
          </div>
          <select
            id="pf-event"
            value={ev}
            onChange={(e) => {
              setEv(e.target.value);
              setDone(false);
            }}
            className="min-h-12 rounded-[10px] border-2 border-ink bg-paper px-3 font-body text-[15px] font-semibold text-ink"
          >
            {shows.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Passo 2 */}
        <div className={`${card} gap-2.5`}>
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className={stepBadge}>2</span>
            <strong className="font-body text-base font-extrabold">Tire uma selfie</strong>
          </div>
          {!selfie ? (
            <FaceCamera onCapture={onSelfie} />
          ) : (
            <div className="flex items-center gap-3">
              <Image
                src={selfie.url}
                alt=""
                width={64}
                height={64}
                unoptimized
                className="size-16 flex-none rounded-full border-2 border-ink bg-accent-3 object-cover"
              />
              <div className="flex flex-1 flex-col gap-0.5">
                <strong className="font-body text-[15px] font-extrabold">Selfie pronta</strong>
                <span className="font-label text-xs text-ink-soft">Usada só para esta busca</span>
              </div>
              <button
                type="button"
                onClick={retake}
                aria-label="Trocar selfie"
                className="flex min-h-11 cursor-pointer items-center rounded-full border-2 border-ink bg-transparent px-3 font-label text-xs font-bold text-ink"
              >
                Trocar
              </button>
            </div>
          )}
        </div>

        {/* Passo 3 */}
        <button
          type="button"
          onClick={search}
          disabled={cantSearch}
          aria-busy={searching}
          className={`shadow-hard flex min-h-14 cursor-pointer items-center justify-center gap-2.5 rounded-full border-2 border-ink font-label text-sm font-bold text-cream disabled:cursor-not-allowed ${
            cantSearch ? "bg-ink-soft" : "bg-accent"
          }`}
        >
          <Icon name="search" size={20} strokeWidth={2.4} />
          {searching ? "Procurando você…" : "Buscar minhas fotos"}
        </button>

        <div aria-live="polite" className="empty:hidden">
          {done && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="m-0 font-body text-xl font-extrabold">
                  {PHOTO_TONES.length} fotos em {city}
                </h2>
                {/* TODO: baixar as fotos encontradas */}
                <button
                  type="button"
                  className="min-h-11 flex-none cursor-pointer rounded-full border-2 border-ink bg-ink px-3 font-label text-xs font-bold text-paper"
                >
                  Baixar todas
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:gap-3">
                {PHOTO_TONES.map((tone, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Abrir foto ${i + 1}`}
                    className={`halftone-light relative h-28 cursor-pointer overflow-hidden rounded-[10px] border-2 border-ink p-0 lg:h-44 ${tone}`}
                  >
                    <span className="absolute bottom-1.5 left-1.5 rounded-[5px] bg-ink px-1.5 py-0.5 font-label text-[11px] font-bold text-paper">
                      [Foto]
                    </span>
                  </button>
                ))}
              </div>
              <p className="m-0 font-label text-xs leading-[1.4] text-ink-soft">Fotos por [fotógrafo oficial do evento].</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
