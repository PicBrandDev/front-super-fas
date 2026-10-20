"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { StripeBand } from "@/components/fan/decor";
import { Icon, PauseIcon, PlayIcon } from "@/components/icons";
import type { Track } from "@/lib/types";

const BAR_COUNT = 36;
const TICK_MS = 250;
/** Sulco do vinil: um tom um pouco mais claro que o ink. */
const GROOVE = "color-mix(in srgb, var(--fc-ink) 94%, var(--fc-cream))";

const fmt = (s: number) => {
  const total = Math.floor(s);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/** Alturas da forma de onda (determinísticas por faixa). */
const barHeights = (seed: number) =>
  Array.from({ length: BAR_COUNT }, (_, i) =>
    12 + Math.round(Math.abs(Math.sin(i * 0.9 + seed) * Math.cos(i * 0.37 + seed * 2)) * 54),
  );

export function DropsPlayer({ tracks }: { tracks: Track[] }) {
  const { base } = useArtist();
  const [sel, setSel] = useState(tracks[0]?.id ?? "");
  const [player, setPlayer] = useState({ playing: false, pos: 0 });
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  const curIndex = Math.max(
    0,
    tracks.findIndex((t) => t.id === sel),
  );
  const cur = tracks[curIndex];
  const duration = cur?.durationSec || 30;

  // Simula a prévia tocando até a API entregar o áudio.
  useEffect(() => {
    if (!player.playing) return;
    const iv = setInterval(() => {
      setPlayer((s) => {
        if (!s.playing) return s;
        const pos = s.pos + TICK_MS / 1000;
        return pos >= duration ? { playing: false, pos: 0 } : { playing: true, pos };
      });
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [player.playing, duration]);

  const toggleVote = (id: string) => setVotes((v) => ({ ...v, [id]: !v[id] }));
  const pick = (id: string) => {
    setSel(id);
    setPlayer({ playing: true, pos: 0 });
  };

  const { playing, pos } = player;
  const heights = barHeights(curIndex + 1);
  const voted = cur ? !!votes[cur.id] : false;
  const curVotes = cur ? (cur.votes + (voted ? 1 : 0)).toLocaleString("pt-BR") : "0";

  return (
    <div className="flex min-h-[calc(100dvh-136px)] flex-col bg-ink text-paper lg:min-h-dvh">
      <div className="mx-auto w-full max-w-[760px]">
        <header className="flex items-center gap-3 px-4 pb-1 pt-3 lg:px-8 lg:pt-8">
          <Link
            href={base}
            aria-label="Voltar ao início"
            className="flex size-11 flex-none items-center justify-center rounded-full border-2 border-paper text-paper no-underline"
          >
            <Icon name="back" size={20} strokeWidth={2.4} />
          </Link>
          <div className="flex flex-col">
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
              Prévias de músicas novas
            </span>
            <h1 className="m-0 font-display text-[32px] font-normal leading-none text-cream lg:text-5xl">Drops Hits</h1>
          </div>
        </header>

        {cur && (
          <>
            {/* TODO: <audio src={track.previewUrl}> — trocar a simulação abaixo pelo áudio real da API */}
            <section
              aria-label={`Prévia em destaque: ${cur.title}`}
              className="m-4 flex flex-col gap-4 rounded-[18px] border-2 border-paper bg-deep p-[18px] shadow-[5px_5px_0_var(--fc-accent)] lg:mx-8"
            >
              <div className="flex items-center gap-3.5">
                <div
                  aria-hidden="true"
                  className="size-24 flex-none rounded-full border-2 border-paper"
                  style={{
                    background:
                      "radial-gradient(circle at center, var(--fc-accent-2) 0 14%, var(--fc-ink) 14% 18%, var(--fc-ink) 18% 100%)",
                    boxShadow: `inset 0 0 0 10px ${GROOVE}, inset 0 0 0 12px var(--fc-ink), inset 0 0 0 22px ${GROOVE}, inset 0 0 0 24px var(--fc-ink)`,
                  }}
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="self-start rounded-md bg-accent-2 px-2 py-[3px] font-label text-[11px] font-bold text-ink">
                    PRÉVIA · {duration}s
                  </span>
                  <strong className="font-body text-xl font-extrabold leading-[1.15] text-cream">{cur.title}</strong>
                  <span className="text-sm text-paper-2">Lançamento: {cur.releaseLabel}</span>
                </div>
              </div>

              <div aria-hidden="true" className="flex h-[70px] items-center gap-[3px]">
                {heights.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-[2px]"
                    style={{
                      height: h,
                      background:
                        i / BAR_COUNT < pos / duration
                          ? "var(--fc-accent-2)"
                          : "color-mix(in srgb, var(--fc-paper) 35%, transparent)",
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="font-label text-xs font-bold text-paper">
                  <span className="sr-only">Tempo: </span>
                  {fmt(pos)} / {fmt(duration)}
                </span>
                <button
                  type="button"
                  onClick={() => setPlayer((s) => ({ ...s, playing: !s.playing }))}
                  aria-label={playing ? "Pausar prévia" : "Tocar prévia"}
                  className="flex size-16 cursor-pointer items-center justify-center rounded-full border-[3px] border-paper bg-accent-2 text-ink"
                >
                  {playing ? <PauseIcon size={26} /> : <PlayIcon size={26} />}
                </button>
                <button
                  type="button"
                  onClick={() => toggleVote(cur.id)}
                  aria-pressed={voted}
                  aria-label={`Quero a versão completa · ${curVotes} votos`}
                  className={`flex min-h-11 cursor-pointer items-center gap-1.5 rounded-full border-2 border-paper px-3 font-label text-[11px] font-bold ${
                    voted ? "bg-accent-2 text-ink" : "bg-transparent text-paper"
                  }`}
                >
                  <Icon name="heart" size={16} filled={voted} />
                  {curVotes}
                </button>
              </div>
            </section>
            <p className="mx-4 -mt-1 mb-2 font-label text-xs leading-[1.4] text-paper-2 lg:mx-8">
              O coração conta como voto “quero a versão completa”.
            </p>
          </>
        )}
      </div>

      <StripeBand className="h-3" />

      <section className="flex-1 bg-paper text-ink">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2.5 px-4 pb-6 pt-[18px] lg:px-8">
          <h2 className="m-0 mb-1 font-body text-xl font-extrabold">Todas as prévias</h2>
          {tracks.length === 0 && (
            <p className="m-0 rounded-xl border-2 border-dashed border-ink-soft p-3.5 text-sm text-ink-soft">
              Nenhuma prévia por enquanto.
            </p>
          )}
          {tracks.map((t) => {
            const isSel = t.id === cur?.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t.id)}
                aria-current={isSel ? "true" : undefined}
                className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-[14px] border-2 border-ink px-3 py-2 text-left text-ink ${
                  isSel ? "bg-accent-2" : "bg-cream"
                }`}
              >
                <span className="flex size-11 flex-none items-center justify-center rounded-full bg-ink font-label text-[13px] font-bold text-accent-2">
                  {t.num}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <strong className="font-body text-[15px] font-extrabold">{t.title}</strong>
                  <span className="font-label text-xs text-ink-soft">{t.meta}</span>
                </span>
                <span className="font-label text-[11px] font-bold">
                  {isSel ? (playing ? "Tocando" : "Pausado") : fmt(t.durationSec)}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
