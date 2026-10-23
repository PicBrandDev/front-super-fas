"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { spinPickap } from "@/app/actions/fan";
import { AdModal } from "@/components/fan/AdModal";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { Sheet } from "@/components/fan/Sheet";
import { Turntable, TT, norm, recordAngleFor } from "@/components/fan/Turntable";
import { useToast } from "@/components/fan/Toast";
import { markSeen, seenWithin } from "@/lib/adFrequency";
import { PICKAP_VIDEO_PERIOD_HOURS, type InAppAd } from "@/lib/ads";
import type { Prize, SpinCredit } from "@/lib/types";
import s from "./PicKap.module.css";
import { PicKapVideoAd } from "./PicKapVideoAd";

const PFX = "dk";
const SPIN_MS = 4200; // transição do disco (Turntable.module.css)
const ARM_LEAD_MS = 450; // o braço desce antes de o disco girar
const VU_MS = 140;

type ClubRef = { slug: string; name: string };
type Won = { key: number; label: string };

/** Fatia em destaque na chegada: o ingresso, se houver; senão a primeira que não é "tente de novo". */
function featuredIndex(prizes: Prize[]) {
  const ticket = prizes.findIndex((p) => /ingresso/i.test(p.label));
  if (ticket >= 0) return ticket;
  const real = prizes.findIndex((p) => !p.isRetry);
  return real >= 0 ? real : 0;
}

export function PicKapWheel({
  prizes,
  initialSpins,
  initialCredits,
  club,
  clubs,
  notJoined,
  demo,
  videoAd = null,
  claimAd = null,
}: {
  prizes: Prize[];
  initialSpins: number;
  initialCredits: SpinCredit[]; // cada giro com o motivo
  club: ClubRef | null; // roleta de qual fã clube
  clubs: ClubRef[]; // fã clubes em que o fã entrou
  notJoined: string | null; // pediu a roleta de um clube em que não entrou
  demo: boolean; // prêmios de exemplo (sem API)
  videoAd?: InAppAd | null; // vídeo obrigatório antes do primeiro giro do período
  claimAd?: InAppAd | null; // anúncio ao guardar o brinde ganho
}) {
  const { base, slug } = useArtist();
  const { show: toast } = useToast();
  const n = prizes.length;
  const labels = prizes.map((p) => p.label);
  const featured = featuredIndex(prizes);

  const [on, setOn] = useState(n ? featured : -1);
  const [rot, setRot] = useState(n ? recordAngleFor(featured, n) : 0);
  const [arm, setArm] = useState(0);
  const [vu, setVu] = useState(-46);
  const [volume, setVolume] = useState(-120);
  const [playing, setPlaying] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spun, setSpun] = useState(false);
  const [spins, setSpins] = useState(initialSpins);
  // Sem API (modo exemplo) a lista nasce dos giros que o fã tem.
  const [credits, setCredits] = useState<SpinCredit[]>(() =>
    initialCredits.length > 0
      ? initialCredits
      : Array.from({ length: initialSpins }, (_, i) => ({ id: `demo-${i}`, reason: "Bônus de boas-vindas", used: false, prizeLabel: null, date: "" })),
  );
  const [error, setError] = useState("");
  const [won, setWon] = useState<Won[]>([]);
  const [result, setResult] = useState<Prize | null>(null);
  const [mastShift, setMastShift] = useState(0);
  const [mastMs, setMastMs] = useState<number | undefined>(undefined);
  // Giro esperando o vídeo patrocinado (guarda o crédito escolhido).
  const [pendingSpin, setPendingSpin] = useState<{ creditId?: string } | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const focusMine = useRef(false);

  const mastBox = useRef<HTMLDivElement>(null);
  const mineRef = useRef<HTMLElement>(null);
  const rotRef = useRef(rot);
  const vuTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wonKey = useRef(0);

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  };

  useEffect(
    () => () => {
      if (vuTimer.current) clearInterval(vuTimer.current);
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  /** Para tudo: VU, volume, LEDs, cabeçalho de volta, braço fica sobre o disco. */
  const settle = useCallback(() => {
    if (vuTimer.current) clearInterval(vuTimer.current);
    vuTimer.current = null;
    setPlaying(false);
    setVu(-46);
    setVolume(-120);
    setMastMs(900);
    setMastShift(0);
    setSpinning(false);
  }, []);

  const finish = useCallback(
    (prize: Prize, idx: number) => {
      settle();
      setSpun(true);
      setOn(idx);
      setResult(prize);
      if (!prize.isRetry) {
        wonKey.current += 1;
        const key = wonKey.current;
        setWon((list) => [{ key, label: prize.label }, ...list]);
      }
    },
    [settle],
  );

  const cantSpin = spinning || spins <= 0 || n === 0 || !club;

  async function spin(creditId?: string) {
    if (cantSpin || !club) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setSpinning(true);
    setError("");
    setResult(null);
    setOn(-1);
    setPlaying(true);
    setArm(TT.play);

    if (!reduce) {
      setVolume(100);
      vuTimer.current = setInterval(() => setVu(+(-30 + Math.random() * 62).toFixed(1)), VU_MS);
      // A palavra do cabeçalho desliza para a esquerda enquanto o disco toca (panMast do protótipo).
      const mast = mastBox.current?.querySelector<HTMLElement>(".mast");
      const word = mast?.querySelector<HTMLElement>(".mast-word");
      if (mast && word) {
        setMastMs(SPIN_MS);
        setMastShift(-(word.offsetWidth - mast.clientWidth) - 60);
      }
    }
    const started = Date.now();

    // O servidor sorteia o prêmio e desconta o giro; sem API (modo exemplo) sorteia aqui.
    const res = await spinPickap(slug, club.slug, creditId && !creditId.startsWith("demo-") ? creditId : undefined);
    let idx: number;
    if (res.ok) {
      idx = prizes.findIndex((p) => p.id === res.data.prize.id);
      setSpins(res.data.spinsLeft);
      setCredits(res.data.credits);
      if (idx < 0) {
        settle();
        setError("A roleta mudou. Recarregue a página.");
        return;
      }
    } else if (res.status === 0) {
      idx = Math.floor(Math.random() * n);
      setSpins((v) => v - 1);
      const label = prizes[idx].label;
      setCredits((list) => {
        const at = creditId ? list.findIndex((c) => c.id === creditId) : list.findIndex((c) => !c.used);
        return list.map((c, i) => (i === at ? { ...c, used: true, prizeLabel: label } : c));
      });
    } else {
      settle();
      setError(res.error);
      return;
    }
    const prize = prizes[idx];
    const target = recordAngleFor(idx, n);
    const next = rotRef.current + 360 * 5 + ((target - norm(rotRef.current) + 360) % 360);
    rotRef.current = next;

    if (reduce) {
      setRot(next);
      finish(prize, idx);
      return;
    }
    const wait = Math.max(0, ARM_LEAD_MS - (Date.now() - started));
    later(() => {
      setRot(next);
      const rec = document.getElementById(`${PFX}Rec`);
      let fired = false;
      const onEnd = (ev: TransitionEvent) => {
        if (ev.propertyName === "transform") done();
      };
      const done = () => {
        if (fired) return;
        fired = true;
        rec?.removeEventListener("transitionend", onEnd);
        finish(prize, idx);
      };
      rec?.addEventListener("transitionend", onEnd);
      later(done, SPIN_MS + 100);
    }, wait);
  }

  const videoKey = `pickap-video-${slug}`;

  /** Antes de girar: se o fã não viu o vídeo no período, mostra o vídeo e gira no "Girar agora". */
  function requestSpin(creditId?: string) {
    if (cantSpin || !club) return;
    if (videoAd && !seenWithin(videoKey, PICKAP_VIDEO_PERIOD_HOURS)) {
      setPendingSpin({ creditId });
      return;
    }
    void spin(creditId);
  }

  const videoDone = () => {
    const creditId = pendingSpin?.creditId;
    markSeen(videoKey);
    setPendingSpin(null);
    void spin(creditId);
  };
  // Saiu antes do fim: não conta como visto, o próximo giro mostra o vídeo de novo.
  const videoDismiss = useCallback((watched: boolean) => {
    if (watched) markSeen(videoKey);
    setPendingSpin(null);
  }, [videoKey]);

  /** Fecha o resultado; se foi brinde, o anúncio de resgate entra depois (não trava o brinde). */
  const closeResult = useCallback(() => {
    if (result && !result.isRetry && claimAd) setClaimOpen(true);
    setResult(null);
  }, [result, claimAd]);
  const closeClaim = useCallback(() => {
    setClaimOpen(false);
    if (focusMine.current) {
      focusMine.current = false;
      // Depois de o modal devolver o foco, leva o fã até "Seus brindes".
      setTimeout(() => mineRef.current?.focus(), 0);
    }
  }, []);

  const keyLabel = spinning ? "Tocando" : spins <= 0 ? "Sem giros" : spun ? "Girar de novo" : "Girar o disco";
  const lose = !!result?.isRetry;

  return (
    <div className={`${s.screen} bg-sun text-ink`}>
      <div ref={mastBox}>
        <Masthead word="PicKap" label="PicKap da sorte" tone="sun" shiftPx={mastShift} durationMs={mastMs} />
      </div>

      <div className={s.plinth}>
        <div className={s.lead}>
          <p>Solte a agulha e concorra a brindes da fanzone.</p>
          {n > 0 && (
            <span className="mono">
              Destaque
              <br />
              {labels[featured]}
            </span>
          )}
        </div>

        {clubs.length > 1 && (
          <nav aria-label="Roleta de qual fã clube" className={s.clubs}>
            {clubs.map((c) => (
              <Link key={c.slug} href={`${base}/pickap?clube=${c.slug}`} aria-current={c.slug === club?.slug ? "page" : undefined}>
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        {notJoined && (
          <p className={s.note}>
            Entre no {notJoined} para girar a roleta dele.{" "}
            <Link href={`${base}/clubes`} className="font-bold text-ink">
              Ver fã clubes
            </Link>
          </p>
        )}
        {!club && (
          <p className={s.note}>
            Cada fã clube tem a sua roleta.{" "}
            <Link href={`${base}/clubes`} className="font-bold text-ink">
              Entre em um
            </Link>{" "}
            para girar.
          </p>
        )}
        {club && n === 0 && <p className={s.note}>A roleta do {club.name} ainda não tem prêmios. Volte mais tarde.</p>}

        <Turntable
          prizes={labels}
          deck
          live
          prefix={PFX}
          on={on}
          rot={rot}
          arm={arm}
          vu={vu}
          volume={volume}
          playing={playing}
        />

        <button type="button" className={s.startkey} onClick={() => requestSpin()} disabled={cantSpin} aria-busy={spinning || undefined}>
          <i className={s.led} aria-hidden="true" />
          <span>{keyLabel}</span>
        </button>

        {error ? (
          <p className={s.err} role="alert">
            {error}
          </p>
        ) : (
          <p className={s.note}>
            {club && n > 0 && <span className="num">{spins === 1 ? "1 giro. " : `${spins} giros. `}</span>}
            {demo ? "Prêmios de exemplo. " : ""}O resultado é definido no servidor; ninguém ganha garantido.
          </p>
        )}

        <section className={s.mine} aria-labelledby="girosH">
          <h3 id="girosH">Seus giros</h3>
          {credits.length === 0 ? (
            <p className={s.empty}>Nenhum giro por enquanto. Comprando um ingresso, você ganha uma tentativa.</p>
          ) : (
            <ul className={s.giros}>
              {credits.map((c) => (
                <li key={c.id} className={s.giro}>
                  <span className={s.why}>
                    <strong>{c.reason}</strong>
                    {c.date && <span className="mono">{c.date}</span>}
                  </span>
                  {c.used ? (
                    <span className="tag">{c.prizeLabel ? `Saiu: ${c.prizeLabel}` : "Usado"}</span>
                  ) : (
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => requestSpin(c.id)} disabled={cantSpin}>
                      Girar roleta
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section ref={mineRef} className={s.mine} aria-labelledby="mineH" tabIndex={-1}>
          <h3 id="mineH">Seus brindes</h3>
          {won.length === 0 ? (
            <p className={s.empty}>
              Nenhum brinde ainda. Gire para concorrer; o que sair fica guardado aqui para retirar no próximo evento.
            </p>
          ) : (
            won.map((w) => (
              <div key={w.key} className={`${s.won} new`}>
                <strong>{w.label}</strong>
                <span className="tag">Retirar no evento</span>
              </div>
            ))
          )}
        </section>
      </div>

      <Sheet open={!!result} onClose={closeResult} title={result ? (lose ? "Quase" : result.label) : ""}>
        {lose ? (
          <>
            <p>A agulha parou em “tente de novo”. A roleta abre de novo na próxima rodada da fanzone.</p>
            <button className="btn btn-primary" type="button" data-close data-autofocus>
              Fechar
            </button>
          </>
        ) : (
          <>
            <p className="mono text-fg">Você ganhou{demo ? " · Exemplo" : ""}</p>
            <p>O brinde fica guardado no seu perfil. Você retira no próximo evento com a sua identidade de fã.</p>
            <div className="row">
              <button
                className="btn btn-primary"
                type="button"
                data-close
                data-autofocus
                onClick={() => {
                  toast("Guardado em Seus brindes");
                  mineRef.current?.focus();
                  focusMine.current = true;
                }}
              >
                Ver meu brinde
              </button>
              <button className="btn btn-outline" type="button" data-close>
                Fechar
              </button>
            </div>
          </>
        )}
      </Sheet>

      {videoAd && pendingSpin && <PicKapVideoAd ad={videoAd} onDone={videoDone} onDismiss={videoDismiss} />}
      {claimAd && (
        <AdModal ad={claimAd} open={claimOpen} onClose={closeClaim} lockSeconds={claimAd.minSeconds ?? 0} closeLabel="Fechar anúncio" />
      )}
    </div>
  );
}
