"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState, type CSSProperties } from "react";
import { useArtist } from "@/components/fan/ArtistContext";
import { Mark } from "@/components/fan/Mark";
import { FeedAd } from "@/components/fan/FeedAd";
import { HomeMuralSwitch } from "@/components/fan/HomeMuralSwitch";
import { Masthead } from "@/components/fan/Masthead";
import { ShareInstagram } from "@/components/fan/ShareInstagram";
import { Sheet, SheetOption } from "@/components/fan/Sheet";
import { Tabs } from "@/components/fan/Tabs";
import { useToast } from "@/components/fan/Toast";
import { PRIZES, Turntable, TT, recAngleFor } from "@/components/fan/Turntable";
import { Vinyl } from "@/components/fan/Vinyl";
import { EmptyState } from "@/components/fan/states";
import { Icon } from "@/components/icons";
import type { FeedAdItem, Track } from "@/lib/types";
import s from "./Mural.module.css";
import { fmtShort, type Poster } from "./posters";

export type MuralTab = "wall" | "drops";

const tabs: { id: MuralTab; label: string }[] = [
  { id: "wall", label: "Cartazes" },
  { id: "drops", label: "Drops" },
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const longest = (words: string[]) => Math.max(1, ...words.map((w) => w.length));
/** Tamanho da manchete em cqw: o molde pede o máximo, mas nenhuma letra pode sumir pela borda. */
const fit = (max: number, perChar: number, words: string[]) => `${Math.min(max, perChar / longest(words)).toFixed(1)}cqw`;

const PICK_ON = 4; // "Ingresso" sob a agulha, como no protótipo

export function MuralView({
  posters,
  tracks,
  demo,
  initialTab = "wall",
  feedAds = [],
}: {
  posters: Poster[];
  tracks: Track[];
  demo: boolean;
  avatar?: string | null; // sem uso: o topo (com a foto) agora é global, no FanFrame
  initialTab?: MuralTab;
  feedAds?: FeedAdItem[]; // posts patrocinados: o 1º depois do 1º cartaz, os outros depois do 8º, 12º e 16º
}) {
  const { base } = useArtist();
  // O primeiro anúncio (Spotify) entra logo embaixo do 1º cartaz; os demais ficam nas posições deles (8º, 12º, 16º).
  const firstAd = [...feedAds].sort((a, b) => a.position - b.position)[0];
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<MuralTab>(initialTab);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const [reacts, setReacts] = useState<Record<string, boolean>>({});
  const wall = useRef<HTMLDivElement>(null);

  // Feed: a animação de entrada do cartaz toca só na primeira vez que ele aparece (repetir a cada rolagem faz o feed "dançar"),
  // e o contador mostra o cartaz que está ocupando a tela.
  useEffect(() => {
    const root = wall.current;
    if (tab !== "wall" || !root) return;
    const visible = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const i = Number((en.target as HTMLElement).dataset.i);
          if (en.isIntersecting) {
            en.target.classList.add(s.in);
            visible.add(i);
          } else visible.delete(i);
        }
        if (visible.size) setIndex(Math.min(...visible));
      },
      { threshold: 0.5 },
    );
    root.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tab, posters.length]);

  // Prévia simulada: para sozinha no fim da duração (a API ainda não manda o áudio).
  useEffect(() => {
    if (!playing) return;
    const t = tracks.find((x) => x.id === playing);
    const id = setTimeout(() => setPlaying(null), (t?.durationSec || 30) * 1000);
    return () => clearTimeout(id);
  }, [playing, tracks]);

  const toggle = (key: string, isRepost = false) => {
    const on = !reacts[key];
    setReacts((r) => ({ ...r, [key]: on }));
    if (isRepost && on) toast.show("Repostado no seu perfil");
  };

  const onCta = (p: Poster) => {
    if (p.cta?.act === "listen") {
      setTab("drops");
      if (tracks[0]) setPlaying(tracks[0].id);
      return;
    }
    if (p.cta?.href) router.push(base + p.cta.href);
  };

  const acts = (id: string, likes: number, comments: number, reposts: number) => {
    const liked = !!reacts[`l-${id}`];
    const rp = !!reacts[`r-${id}`];
    return (
      <div className={s.acts}>
        <button type="button" className="act like" aria-pressed={liked} aria-label="Curtir" onClick={() => toggle(`l-${id}`)}>
          <Icon name="heart" size={20} />
          <span className="num">{fmtShort(likes + (liked ? 1 : 0))}</span>
        </button>
        <Link href={`${base}/comunidade`} className="act" aria-label="Comentários">
          <Icon name="comment" size={20} />
          <span className="num">{fmtShort(comments)}</span>
        </Link>
        <button type="button" className="act rp" aria-pressed={rp} aria-label="Repostar" onClick={() => toggle(`r-${id}`, true)}>
          <Icon name="repost" size={20} />
          <span className="num">{fmtShort(reposts + (rp ? 1 : 0))}</span>
        </button>
      </div>
    );
  };

  return (
    <div className={s.screen}>
      <HomeMuralSwitch base={base} current="mural" />
      <Masthead word="Mural" steps={2} index={tab === "wall" ? 0 : 1} />
      <Tabs
        tabs={tabs}
        value={tab}
        onChange={setTab}
        label="Seções do mural"
        slot={
          <span
            className={`${s.counter} num`}
            aria-live="polite"
            style={{ visibility: tab === "wall" && posters.length ? "visible" : "hidden" }}
          >
            <b>{pad2(index + 1)}</b> / {pad2(posters.length)}
          </span>
        }
      />

      {tab === "wall" && (
        <div ref={wall} className={s.wall}>
          {posters.length === 0 && (
            <EmptyState className="px-4" title="Nenhum cartaz ainda" text="Quando o artista publicar um Drop News, ele vira cartaz aqui." />
          )}
          {posters.map((p, i) => (
            <Fragment key={p.id}>
              <article className={s.slide} data-i={i} aria-label={`Cartaz ${i + 1} de ${posters.length}: ${p.cap}`}>
                <Plate p={p} />
                <div className={s.meta}>
                  <div className={s.who}>
                    <div className="avatar" style={{ width: 24, height: 24 }}>
                      <Mark size={14} />
                    </div>
                    <strong>{p.by}</strong>
                    <span className="mono verified">
                      <Icon name="check" size={12} />
                      Oficial
                    </span>
                    {demo && (
                      <span className="tag tag-demo" style={{ marginLeft: "auto" }}>
                        Exemplo
                      </span>
                    )}
                  </div>
                  <p>{p.text}</p>
                  <div className={s.bar}>
                    {acts(p.id, p.likes, p.comments, p.reposts)}
                    {p.postId && <ShareInstagram post={{ id: p.postId, text: p.text, image: p.image }} />}
                    {p.cta && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => onCta(p)}>
                        {p.cta.label}
                      </button>
                    )}
                  </div>
                </div>
              </article>
              {feedAds.filter((a) => (a === firstAd ? i === 0 : a.position === i + 1)).map((a) => (
                <FeedAd key={`ad-${a.position}`} ad={a} className={s.feedAd} />
              ))}
            </Fragment>
          ))}
        </div>
      )}

      {tab === "drops" && (
        <div className={s.list}>
          {tracks.length === 0 && <EmptyState className="px-4" title="Nenhuma prévia por enquanto" text="Quando sair um drop novo, a prévia aparece aqui primeiro." />}
          {tracks.map((t, i) => {
            const on = playing === t.id;
            const voted = !!reacts[`v-${t.id}`];
            return (
              <article key={t.id} className={`${s.drop} ${on ? s.playing : ""}`} style={{ "--dur": `${t.durationSec || 30}s` } as CSSProperties}>
                <div className={s.disc}>
                  <Vinyl />
                </div>
                <div>
                  <h3>{t.title}</h3>
                  <div className="mono">
                    {t.meta}
                    <br />
                    Lançamento {t.releaseLabel}
                  </div>
                  <div className={s.tags}>
                    {i === 0 && <span className="tag">Drop novo</span>}
                    {demo && <span className="tag tag-demo">Exemplo</span>}
                  </div>
                  <div className={s.prog}>
                    <i />
                  </div>
                  <div className={s.ops}>
                    <button type="button" className="btn btn-primary btn-sm" aria-pressed={on} onClick={() => setPlaying(on ? null : t.id)}>
                      <Icon name={on ? "pause" : "play"} size={16} />
                      <span>{on ? "Pausar" : "Ouvir"}</span>
                    </button>
                    <button type="button" className="go" onClick={() => setSheet(true)}>
                      Streaming <Icon name="external" size={14} />
                    </button>
                    <ShareInstagram post={{ id: t.id, text: `${t.title}${t.meta ? ` · ${t.meta}` : ""}` }} kind="track" />
                    <button
                      type="button"
                      className="act like"
                      aria-pressed={voted}
                      aria-label="Quero a versão completa"
                      onClick={() => toggle(`v-${t.id}`)}
                    >
                      <Icon name="heart" size={20} />
                      <span className="num">{fmtShort(t.votes + (voted ? 1 : 0))}</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Ouvir em">
        <div className="opts">
          {["Spotify", "Apple Music", "Beatport"].map((n) => (
            <SheetOption key={n} title={n} sub="Abre fora da fanzone" />
          ))}
        </div>
        <button type="button" className="btn btn-outline" data-close>
          Fechar
        </button>
      </Sheet>
    </div>
  );
}

/** O cartaz: um campo chapado por molde, tipo medido em cqw da largura. */
function Plate({ p }: { p: Poster }) {
  const cap = (cls: string, children: React.ReactNode) => <span className={`${s.cap} ${cls}`}>{children}</span>;
  const lines = (arr: string[]) =>
    arr.map((l, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {l}
      </span>
    ));

  if (p.kind === "lost") {
    return (
      <div className={`${s.pst} ${s["p-lost"]}`} style={{ "--hl": fit(51, 204, p.headline) } as CSSProperties}>
        {cap(s.t1, <span className="tag">{p.cap}</span>)}
        <div className={s.disc}>
          <Vinyl />
        </div>
        <div className={s.hl} aria-hidden="true">
          {p.headline.join(" ")}
        </div>
        {cap(s.t2, lines(p.credits))}
      </div>
    );
  }
  if (p.kind === "culture") {
    return (
      <div className={`${s.pst} ${s["p-culture"]}`} style={{ "--hl": fit(20, 140, p.headline) } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {p.image && <img className={s.art} src={p.image.src} alt={p.image.alt} />}
        {cap(s.t1, p.credits[0])}
        {cap(s.t2, p.credits[1])}
        <div className={s.hl} aria-hidden="true">
          {p.headline.map((w, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {i === 1 && (
                <span className={s.mk}>
                  <Mark size={80} style={{ width: "100%", height: "auto" }} />
                </span>
              )}
              {w}
            </span>
          ))}
        </div>
      </div>
    );
  }
  if (p.kind === "date") {
    return (
      <div className={`${s.pst} ${s["p-date"]}`}>
        {cap(s.t1, p.cap)}
        <div className={s.mon}>{p.month}</div>
        {cap(s.t2, lines(p.credits))}
        <div className={`${s.hl} num`} aria-hidden="true">
          {p.day}
        </div>
      </div>
    );
  }
  if (p.kind === "pick") {
    return (
      <div className={`${s.pst} ${s["p-pick"]}`} style={{ "--rec-rot": `${recAngleFor(PICK_ON)}deg` } as CSSProperties}>
        {cap(s.t1, p.credits[0])}
        <Turntable prefix="pp" prizes={PRIZES} deck={false} on={PICK_ON} rot={recAngleFor(PICK_ON)} arm={TT.play} />
        <div className={s.hl} aria-hidden="true">
          Tente
          <br />a <em>sorte</em>
        </div>
      </div>
    );
  }
  return (
    <div className={`${s.pst} ${s["p-store"]}`}>
      {cap(s.t1, p.credits[0])}
      <div className={s.hl} aria-hidden="true">
        {lines(p.headline)}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {p.image && <img className={s.tee} src={p.image.src} alt="" />}
      {cap(s.t2, p.credits[1])}
    </div>
  );
}
