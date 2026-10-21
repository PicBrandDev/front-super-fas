"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { spinPickap } from "@/app/actions/fan";
import { useArtist } from "@/components/fan/ArtistContext";
import { StripeBand } from "@/components/fan/decor";
import { EmptyState, Notice } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import type { Prize } from "@/lib/types";

/** Cores das fatias (repetem a cada 4) e a cor do texto sobre cada uma. */
const SEG_BG = ["var(--fc-accent)", "var(--fc-accent-2)", "var(--fc-cream)", "var(--fc-deep)"];
const SEG_FG = ["var(--fc-cream)", "var(--fc-ink)", "var(--fc-ink)", "var(--fc-cream)"];

const SPIN_MS = 3400;
const RESULT_DELAY_MS = 3500;
const REDUCED_RESULT_DELAY_MS = 400;

type Won = { key: number; label: string; when: string };

function buildSegments(prizes: Prize[]) {
  const n = Math.max(prizes.length, 1);
  const size = 360 / n;
  const segs = prizes.map((p, i) => {
    let tone = i % 4;
    // Evita duas fatias vizinhas da mesma cor quando a última encosta na primeira.
    if (n > 1 && i === n - 1 && tone === 0) tone = 1;
    return { prize: p, start: i * size, end: (i + 1) * size, center: i * size + size / 2, bg: SEG_BG[tone], fg: SEG_FG[tone] };
  });
  const background = segs.length
    ? `conic-gradient(${segs.map((s) => `${s.bg} ${s.start}deg ${s.end}deg`).join(", ")})`
    : "var(--fc-accent)";
  return { segs, size, background };
}

type ClubRef = { slug: string; name: string };

export function PicKapWheel({
  prizes,
  initialSpins,
  nextEventId,
  club,
  clubs,
  notJoined,
}: {
  prizes: Prize[];
  initialSpins: number;
  nextEventId: string | null;
  club: ClubRef | null; // roleta de qual fã clube
  clubs: ClubRef[]; // fã clubes em que o fã entrou
  notJoined: string | null; // pediu a roleta de um clube em que não entrou
}) {
  const { base, initial, slug } = useArtist();
  const [spinError, setSpinError] = useState("");
  const [asking, setAsking] = useState(false);
  const { segs, size, background } = buildSegments(prizes);

  const [rot, setRot] = useState(0);
  const [spins, setSpins] = useState(initialSpins);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Prize | null>(null);
  const [won, setWon] = useState<Won[]>([]);
  const [durationMs, setDurationMs] = useState(SPIN_MS);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wonKey = useRef(0);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const cantSpin = spinning || asking || spins <= 0 || prizes.length === 0 || !club;

  /** O servidor sorteia o prêmio e desconta o giro; sem API (modo exemplo) sorteia aqui. */
  async function spin() {
    if (cantSpin) return;
    setAsking(true);
    if (!club) return;
    const res = await spinPickap(slug, club.slug);
    setAsking(false);
    let idx: number;
    let left: number | null = null;
    if (res.ok) {
      idx = prizes.findIndex((p) => p.id === res.data.prize.id);
      left = res.data.spinsLeft;
      if (idx < 0) {
        setSpinError("A roleta mudou. Recarregue a página.");
        return;
      }
    } else if (res.status === 0) {
      idx = Math.floor(Math.random() * prizes.length);
    } else {
      setSpinError(res.error);
      return;
    }
    setSpinError("");
    const desired = (360 - segs[idx].center) % 360;
    const delta = (((desired - (rot % 360)) % 360) + 360) % 360;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setDurationMs(reduced ? 0 : SPIN_MS);
    setRot(rot + 360 * 5 + delta);
    setSpinning(true);
    setSpins((s) => (left ?? s - 1));
    setResult(null);

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => {
        const prize = prizes[idx];
        setSpinning(false);
        setResult(prize);
        if (!prize.isRetry) {
          wonKey.current += 1;
          const key = wonKey.current;
          setWon((list) => [{ key, label: prize.label, when: "agora" }, ...list]);
        }
      },
      reduced ? REDUCED_RESULT_DELAY_MS : RESULT_DELAY_MS,
    );
  }

  const btnLabel = spinning || asking ? "Girando…" : spins > 0 ? "Girar" : "Sem giros";
  const showResult = !!result && !spinning;
  const noPrizes = !!club && prizes.length === 0;
  const noSpins = !!club && !noPrizes && spins <= 0 && !spinning && !asking;

  // A API ainda não informa quantos giros cada ação vale, então as linhas não mostram número.
  const ways = [
    { href: `${base}/agenda`, label: "Ganhe giros comprando ingresso de um show", tone: "bg-accent-2" },
    { href: `${base}/mural`, label: "Ganhe giros postando no mural da galera", tone: "bg-cream" },
    {
      href: nextEventId ? `${base}/eventos/${nextEventId}` : `${base}/agenda`,
      label: "Ganhe giros entrando na sorte de um evento",
      tone: "bg-cream",
    },
  ];

  return (
    <div className="flex min-h-[calc(100dvh-136px)] flex-col bg-ink text-paper lg:min-h-dvh">
      <div className="mx-auto w-full max-w-[760px]">
        <header className="flex items-end justify-between gap-3 px-4 pb-1.5 pt-[18px] lg:px-8 lg:pt-8">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] font-bold uppercase tracking-[0.12em] text-accent-2">
              {club ? `Roleta · ${club.name}` : "Roleta dos fã clubes"}
            </span>
            <h1 className="m-0 font-display text-[34px] font-normal leading-none text-cream lg:text-5xl">PicKap da sorte</h1>
          </div>
          <span className="flex-none rounded-full bg-accent-2 px-3 py-[7px] font-label text-xs font-bold text-ink">
            {spins} {spins === 1 ? "giro" : "giros"}
          </span>
        </header>

        {clubs.length > 1 && (
          <nav aria-label="Roleta de qual fã clube" className="flex gap-1.5 overflow-x-auto px-4 pt-3 lg:px-8">
            {clubs.map((c) => {
              const on = c.slug === club?.slug;
              return (
                <Link
                  key={c.slug}
                  href={`${base}/pickap?clube=${c.slug}`}
                  aria-current={on ? "page" : undefined}
                  className={`flex min-h-11 flex-none items-center whitespace-nowrap rounded-full border-2 px-3.5 font-label text-xs font-bold no-underline ${
                    on ? "border-accent-2 bg-accent-2 text-ink" : "border-paper-2 text-paper"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
        )}

        {notJoined && (
          <Notice className="mx-4 mt-3 lg:mx-8">
            Entre no {notJoined} para girar a roleta dele.{" "}
            <Link href={`${base}/clubes`} className="font-bold text-ink">
              Ver fã clubes
            </Link>
          </Notice>
        )}
        {!club && (
          <EmptyState
            className="mx-4 mt-3 bg-cream lg:mx-8"
            title="Você ainda não entrou em nenhum fã clube"
            text="Cada fã clube tem a sua roleta. Entre em um para girar e concorrer aos prêmios."
            action={
              <Link
                href={`${base}/clubes`}
                className="flex min-h-11 items-center rounded-full border-2 border-ink bg-accent-2 px-4 font-label text-xs font-bold text-ink no-underline"
              >
                Ver fã clubes
              </Link>
            }
          />
        )}
        {noPrizes && (
          <Notice className="mx-4 mt-3 lg:mx-8">
            A roleta do {club.name} ainda não tem prêmios cadastrados. Volte mais tarde.
          </Notice>
        )}

        <section className="flex flex-col items-center gap-[22px] px-4 pb-2.5 pt-[22px]">
          <div className="relative aspect-square w-[316px] max-w-full">
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full border-[3px] border-cream bg-accent-2"
              style={{ boxShadow: "0 0 0 6px var(--fc-deep)" }}
            />
            <div
              role="img"
              aria-label={`Roleta com ${prizes.length} prêmios`}
              className="absolute inset-2.5 overflow-hidden rounded-full border-[3px] border-ink"
              style={{
                background,
                transform: `rotate(${rot}deg)`,
                transition: durationMs > 0 ? `transform ${durationMs}ms cubic-bezier(.15,.75,.2,1)` : "none",
              }}
            >
              {segs.map((s) => (
                <div
                  key={s.prize.id}
                  aria-hidden="true"
                  className="absolute inset-0 box-border flex justify-center pt-[18px]"
                  style={{ transform: `rotate(${s.center}deg)` }}
                >
                  <span
                    className="text-center font-label text-[11px] font-bold leading-[1.2]"
                    style={{ color: s.fg, width: size >= 40 ? 76 : 56 }}
                  >
                    {s.prize.label}
                  </span>
                </div>
              ))}
            </div>
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 -ml-[33px] -mt-[33px] flex size-[66px] items-center justify-center rounded-full border-[3px] border-cream bg-ink font-display text-[26px] text-accent-2"
            >
              {initial}
            </div>
            <div
              aria-hidden="true"
              className="absolute left-1/2 -top-2.5 -ml-[15px] size-0 border-x-[15px] border-t-[28px] border-x-transparent border-t-cream"
            />
          </div>

          <button
            type="button"
            onClick={spin}
            disabled={cantSpin}
            className={`min-h-14 min-w-[220px] cursor-pointer rounded-full border-[3px] border-cream px-7 font-display text-[22px] text-cream disabled:cursor-not-allowed ${
              cantSpin ? "bg-ink-soft" : "bg-accent"
            }`}
            style={{ boxShadow: "0 5px 0 var(--fc-deep)" }}
          >
            {btnLabel}
          </button>
          {spinError && (
            <Notice tone="error" className="w-full max-w-[326px] text-center">
              {spinError}
            </Notice>
          )}
          {noSpins && !spinError && (
            <Notice className="w-full max-w-[326px] text-center">
              Você está sem giros. Veja abaixo como ganhar mais.
            </Notice>
          )}

          <div aria-live="polite" className="w-full max-w-[326px] empty:hidden">
            {showResult && (
              <div className="box-border flex items-center gap-3 rounded-[14px] border-2 border-cream bg-accent px-4 py-3.5 text-accent-fg">
                <Icon name="gift" size={30} className="flex-none" />
                <div className="flex flex-col gap-0.5">
                  <strong className="font-body text-[17px] font-extrabold">
                    {result.isRetry ? "Não foi dessa vez" : `Você ganhou: ${result.label}`}
                  </strong>
                  <span className="font-label text-xs">
                    {result.isRetry ? "Ganhe mais giros e tente de novo." : "O prêmio já está em “Prêmios desta sessão”."}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <StripeBand className="mt-3.5 h-3" />

      <section className="flex-1 bg-paper text-ink">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-[18px] px-4 pb-6 pt-5 lg:px-8">
          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-body text-xl font-extrabold">Prêmios desta sessão</h2>
            {won.length === 0 ? (
              <EmptyState
                title="Nenhum prêmio ainda"
                text={club ? "Gire a roleta para ganhar o primeiro." : "Entre num fã clube e gire a roleta dele."}
              />
            ) : (
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {won.map((w) => (
                  <li
                    key={w.key}
                    className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-cream px-3.5 py-3"
                  >
                    <strong className="font-body text-[15px] font-extrabold">{w.label}</strong>
                    <span className="font-label text-[11px] font-bold text-ink-soft">{w.when}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-body text-xl font-extrabold">Como ganhar mais giros</h2>
            {ways.map((w) => (
              <Link
                key={w.label}
                href={w.href}
                className={`flex min-h-[52px] items-center justify-between gap-2 rounded-xl border-2 border-ink px-3.5 text-ink no-underline ${w.tone}`}
              >
                <span className="font-body text-[15px] font-semibold">{w.label}</span>
                <Icon name="chevron-right" size={18} strokeWidth={2.6} className="flex-none" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
