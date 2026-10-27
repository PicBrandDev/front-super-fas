"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { spinPickup } from "@/app/actions/fan";
import { AdModal } from "@/components/fan/AdModal";
import { useArtist } from "@/components/fan/ArtistContext";
import { Masthead } from "@/components/fan/Masthead";
import { Sheet } from "@/components/fan/Sheet";
import { Turntable, TT, norm, recordAngleFor } from "@/components/fan/Turntable";
import { useToast } from "@/components/fan/Toast";
import type { InAppAd } from "@/lib/ads";
import type { Prize, Reward, SpinCredit } from "@/lib/types";
import s from "./PicKup.module.css";
import { PicKupVideoAd } from "./PicKupVideoAd";

const PFX = "dk";
const SPIN_MS = 4200; // transição do disco (Turntable.module.css)
const ARM_LEAD_MS = 450; // o braço desce antes de o disco girar
const VU_MS = 140;

type ClubRef = { slug: string; name: string };

/** Sem brinde nesta rodada: "não foi dessa vez" ou "tente de novo". */
const isLose = (p: Prize) => !!p.isRetry || p.kind === "none" || p.kind === "retry";

/** Fatia em destaque na chegada: o ingresso de pista, se houver; senão a primeira que dá brinde. */
function featuredIndex(prizes: Prize[]) {
  const ticket = prizes.findIndex((p) => p.kind === "ticket" || (!p.kind && /ingresso/i.test(p.label)));
  if (ticket >= 0) return ticket;
  const real = prizes.findIndex((p) => !isLose(p));
  return real >= 0 ? real : 0;
}

export function PicKupWheel({
  prizes,
  initialSpins,
  initialCredits,
  rewardsCount = 0,
  club,
  demo,
  videoAd = null,
  claimAd = null,
}: {
  prizes: Prize[];
  initialSpins: number;
  initialCredits: SpinCredit[]; // cada giro com o motivo
  rewardsCount?: number; // brindes ganhos ainda para retirar ou usar
  club: ClubRef | null; // roleta de qual fã clube
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
  const [result, setResult] = useState<Prize | null>(null);
  const [reward, setReward] = useState<Reward | null>(null); // o brinde guardado em Meus brindes
  const [newRewards, setNewRewards] = useState(0);
  const [mastShift, setMastShift] = useState(0);
  const [mastMs, setMastMs] = useState<number | undefined>(undefined);
  // Giro esperando o vídeo patrocinado (guarda o crédito escolhido).
  const [pendingSpin, setPendingSpin] = useState<{ creditId?: string } | null>(null);
  const [claimOpen, setClaimOpen] = useState(false);
  const router = useRouter();
  // Qual foi o resultado que abriu o anúncio, e se o fã pediu "Ver meus brindes" (só vai depois de fechar o anúncio).
  const claimWasPrize = useRef(false);
  const goBrindes = useRef(false);

  const mastBox = useRef<HTMLDivElement>(null);
  const rotRef = useRef(rot);
  const vuTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

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
      if (!isLose(prize)) setNewRewards((v) => v + 1);
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
    setReward(null);
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
    const res = await spinPickup(slug, club.slug, creditId && !creditId.startsWith("demo-") ? creditId : undefined);
    let idx: number;
    if (res.ok) {
      idx = prizes.findIndex((p) => p.id === res.data.prize.id);
      setSpins(res.data.spinsLeft);
      setCredits(res.data.credits);
      setReward(res.data.reward ?? null);
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

  /** Antes de cada giro mostra o vídeo do anúncio; o giro sai no "Girar agora". */
  function requestSpin(creditId?: string) {
    if (cantSpin || !club) return;
    if (videoAd) {
      setPendingSpin({ creditId });
      return;
    }
    void spin(creditId);
  }

  const videoDone = () => {
    const creditId = pendingSpin?.creditId;
    setPendingSpin(null);
    void spin(creditId);
  };
  // Saiu antes do fim: não gira; o próximo giro mostra o vídeo de novo.
  const videoDismiss = useCallback(() => {
    setPendingSpin(null);
  }, []);

  /** Fecha o resultado; se foi brinde, o anúncio de resgate entra depois (não trava o brinde). */
  const closeResult = useCallback(() => {
    // O anúncio em modal entra depois de qualquer resultado do giro (brinde ou "não foi dessa vez").
    if (result && claimAd) {
      claimWasPrize.current = !isLose(result);
      setClaimOpen(true);
    }
    setResult(null);
  }, [result, claimAd]);
  const closeClaim = useCallback(() => {
    setClaimOpen(false);
    if (claimWasPrize.current) toast("Guardado em Meus brindes");
    // "Ver meus brindes": só depois de fechar o anúncio é que vai para a tela de brindes.
    if (goBrindes.current) {
      goBrindes.current = false;
      router.push(`${base}/pickup/brindes`);
    }
  }, [toast, router, base]);

  const keyLabel = spinning ? "Tocando" : spins <= 0 ? "Sem giros" : spun ? "Girar de novo" : "Girar o disco";
  const lose = !!result && isLose(result);
  const noPrize = result?.kind === "none";

  return (
    <div className={`${s.screen} bg-sun text-ink`}>
      <div ref={mastBox}>
        <Masthead word="PicKup" label="PicKup da sorte" tone="sun" shiftPx={mastShift} durationMs={mastMs} />
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

        {!club && (
          <p className={s.note}>
            Para girar a roleta, entre em um fã clube.{" "}
            <Link href={`${base}/clubes`} className="font-bold text-ink">
              Ver fã clubes
            </Link>
          </p>
        )}
        {club && n === 0 && <p className={s.note}>A roleta ainda não tem prêmios. Volte mais tarde.</p>}

        {/* Em telas baixas (computador) o disco encolhe para a lista de giros e o botão de brindes caberem sem rolar. */}
        <div style={{ width: "min(100%, 40vh)", margin: "0 auto" }}>
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
        </div>

        <button type="button" className={s.startkey} onClick={() => requestSpin()} disabled={cantSpin} aria-busy={spinning || undefined}>
          <i className={s.led} aria-hidden="true" />
          <span>{keyLabel}</span>
        </button>

        {error ? (
          <p className={s.err} role="alert">
            {error}
          </p>
        ) : (
          club &&
          n > 0 && (
            <p className={s.note} aria-live="polite">
              <span className="num">{spins === 1 ? "1 giro" : `${spins} giros`}</span>
            </p>
          )
        )}

        {club && n > 0 && credits.some((c) => !c.used) && (
          <section aria-labelledby="girosH" className="flex flex-col gap-1.5">
            <h3 id="girosH" className="mono m-0 text-on-amber/75">
              De onde vieram os seus giros
            </h3>
            <ul className="m-0 flex list-none flex-col divide-y divide-on-amber/25 border-y border-on-amber/25 p-0 text-on-amber">
              {credits
                .filter((c) => !c.used)
                .map((c) => (
                  <li key={c.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <strong className="min-w-0 text-[15px] leading-5">{c.reason}</strong>
                    {c.date && <span className="mono flex-none text-on-amber/70">{c.date}</span>}
                  </li>
                ))}
            </ul>
          </section>
        )}

        <Link href={`${base}/pickup/brindes`} className="btn btn-block flex items-center justify-center gap-2 border-2 border-on-amber bg-transparent text-on-amber no-underline">
          Meus brindes
          {rewardsCount + newRewards > 0 && <span className="tag tag-key">{rewardsCount + newRewards}</span>}
        </Link>
      </div>

      <Sheet open={!!result} onClose={closeResult} title={result ? (noPrize ? "Não foi dessa vez" : lose ? "Quase" : result.label) : ""}>
        {lose ? (
          <>
            <p>
              {noPrize
                ? "Desta vez a agulha não parou em nenhum brinde. Seus próximos giros continuam valendo."
                : "A agulha parou em “tente de novo”. A roleta abre de novo na próxima rodada da fanzone."}
            </p>
            <button className="btn btn-primary" type="button" data-close data-autofocus>
              Fechar
            </button>
          </>
        ) : (
          <>
            <p className="mono text-fg">Você ganhou{demo ? " · Exemplo" : ""}</p>
            {reward ? (
              <>
                <p>{reward.instructions}</p>
                {reward.kind !== "coupon" && (
                  <p className="mono text-fg">
                    Código para retirar: <strong className="num text-[20px] tracking-[0.2em]">{reward.code}</strong>
                  </p>
                )}
                {reward.kind === "coupon" && (
                  <p className="mono text-fg">
                    Cupom: <strong className="num tracking-[0.1em]">{reward.couponCode}</strong>
                  </p>
                )}
              </>
            ) : (
              <p>O brinde fica guardado em Meus brindes. Você retira no próximo evento com a sua identidade de fã.</p>
            )}
            <div className="row">
              <button
                type="button"
                className="btn btn-primary"
                data-close
                data-autofocus
                onClick={() => {
                  if (claimAd) goBrindes.current = true; // o anúncio abre ao fechar esta folha; os brindes vêm depois dele
                  else router.push(`${base}/pickup/brindes`);
                }}
              >
                Ver meus brindes
              </button>
              <button className="btn btn-outline" type="button" data-close>
                Fechar
              </button>
            </div>
          </>
        )}
      </Sheet>

      {videoAd && pendingSpin && <PicKupVideoAd ad={videoAd} onDone={videoDone} onDismiss={videoDismiss} />}
      {claimAd && (
        <AdModal ad={claimAd} open={claimOpen} onClose={closeClaim} lockSeconds={claimAd.minSeconds ?? 0} closeLabel="Fechar anúncio" />
      )}
    </div>
  );
}
