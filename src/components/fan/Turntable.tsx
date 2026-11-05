import type { CSSProperties } from "react";
import { MARK_POINTS, STAR_D } from "./mark-shape";
import s from "./Turntable.module.css";

/**
 * Toca-discos do PicKup: o disco é a roleta e a agulha escolhe o prêmio.
 * Porte fiel de `turntable()` do protótipo fanzone.html.
 *
 * API
 *   <Turntable prizes={["Camiseta", ...]} />            só o disco (viewBox 0 0 390 300)
 *   <Turntable prizes={...} deck live />                 disco + deck (VU, LEDs PLAY/STOP,
 *                                                        knob de volume), viewBox 0 0 390 472
 * Props
 *   prizes   rótulos das fatias, no sentido horário a partir do topo (12h).
 *   deck     mostra o painel de controles (padrão: true).
 *   on       índice da fatia acesa em âmbar (-1 = nenhuma).
 *   rot      ângulo do disco em graus (ver `recordAngleFor`).
 *   arm      ângulo do braço (0 = descansando, `TT.play` = sobre o disco).
 *   live     role="img" com descrição; sem `live` é decorativo (aria-hidden).
 *   prefix   prefixo dos ids ("tt" → #ttRec, #ttArm, #ttVu, #ttVol, #ttLedG, #ttLedR).
 *   playing  LEDs em modo "tocando" (PLAY verde, STOP apagado).
 *   vu       ângulo do ponteiro do VU (padrão -46; oscila entre -30 e 32 tocando).
 *   volume   ângulo do knob (padrão -120; vai a 100 tocando).
 *
 * Para animar, troque `rot`/`arm`/`vu`/`volume`/`on` por estado: as
 * transições (4,2 s no disco, 0,8 s no braço, 0,14 s no VU) estão no CSS
 * Module. Os ids também estão lá para quem preferir ouvir `transitionend`.
 * Fatias: `.trk[data-i]`. Geometria em `TT`; `stylusTheta` é o ângulo
 * (a partir das 12h) em que a agulha toca o disco; `recordAngleFor(i, n)`
 * é o ângulo do disco que põe a fatia `i` embaixo da agulha.
 */
export const TT = { cx: 170, cy: 210, piv: [345, 54] as const, tip: [335.2, 267.9] as const, play: 15.5 };

export const norm = (a: number) => ((a % 360) + 360) % 360;

/** Ângulo (graus, a partir das 12h, horário) em que a agulha encosta no disco com o braço em TT.play. */
export const stylusTheta = (() => {
  const a = (TT.play * Math.PI) / 180;
  const dx = TT.tip[0] - TT.piv[0];
  const dy = TT.tip[1] - TT.piv[1];
  const x = TT.piv[0] + dx * Math.cos(a) - dy * Math.sin(a);
  const y = TT.piv[1] + dx * Math.sin(a) + dy * Math.cos(a);
  return (Math.atan2(x - TT.cx, -(y - TT.cy)) * 180) / Math.PI + 360;
})() % 360;

/** Desenho da roleta: o toca-discos (Vintage) ou a roda de linhas com ponteiro-estrela no topo (Departamento). */
export type WheelVariant = "turntable" | "star";

/** Ângulo do disco que deixa a fatia `index` (de `count`) embaixo da agulha (ou da estrela, no topo). */
export const recordAngleFor = (index: number, count: number, variant: WheelVariant = "turntable") =>
  norm((variant === "star" ? 0 : stylusTheta) - index * (360 / Math.max(count, 1)));

/** Prêmios do protótipo (usados quando a API não manda a lista). */
export const PRIZES = ["Camiseta", "Boné", "Pôster", "Vinil", "Ingresso", "Adesivo", "Tente de novo", "Pulseira"];

/** Atalho de `recordAngleFor` com os prêmios do protótipo (cartaz do Mural). */
export const recAngleFor = (i: number, n = PRIZES.length, variant: WheelVariant = "turntable") => recordAngleFor(i, n, variant);

export type TurntableProps = {
  /** `star`: a roda do Departamento (sem braço nem deck; `arm`, `deck`, `vu`, `volume` e `playing` não se aplicam). */
  variant?: WheelVariant;
  prizes: string[];
  deck?: boolean;
  on?: number;
  rot?: number;
  arm?: number;
  live?: boolean;
  prefix?: string;
  className?: string;
  playing?: boolean;
  vu?: number;
  volume?: number;
};

const P = (a: number, r: number): [number, number] => {
  const t = ((a - 90) * Math.PI) / 180;
  return [+(TT.cx + r * Math.cos(t)).toFixed(2), +(TT.cy + r * Math.sin(t)).toFixed(2)];
};

const ann = (a0: number, a1: number, r0: number, r1: number) => {
  const [x0, y0] = P(a0, r1);
  const [x1, y1] = P(a1, r1);
  const [x2, y2] = P(a1, r0);
  const [x3, y3] = P(a0, r0);
  return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
};

const mono: CSSProperties = { fontFamily: "var(--fc-font-mono)" };
const grotesk: CSSProperties = { fontFamily: "var(--fc-font-grotesk)" };

const origin = (x: number, y: number, deg: number): CSSProperties => ({
  transformOrigin: `${x}px ${y}px`,
  transform: `rotate(${deg}deg)`,
});

export function Turntable({ variant = "turntable", ...props }: TurntableProps) {
  return variant === "star" ? <StarWheel {...props} /> : <Deck {...props} />;
}

/**
 * Cabe o nome do prêmio na fatia: quebra em até 3 linhas e diminui a fonte até a linha mais larga caber na corda da fatia
 * (largura da fatia no raio do texto). `cw` é a largura média de uma letra em múltiplos do corpo (com o espaçamento).
 */
function fitLabel(label: string, n: number, rr: number, base: number, cw: number) {
  const avail = Math.max(28, 2 * rr * Math.sin(Math.PI / Math.max(n, 2)) * 0.8);
  const words = label.toUpperCase().split(/\s+/).filter(Boolean);
  for (let size = base; size >= 6.5; size -= 0.5) {
    const per = size * cw;
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? `${cur} ${w}` : w;
      if (!cur || t.length * per <= avail) cur = t;
      else {
        lines.push(cur);
        cur = w;
      }
    }
    if (cur) lines.push(cur);
    if (lines.length <= 3 && lines.every((l) => l.length * per <= avail)) return { size, lines };
  }
  const max = Math.max(3, Math.floor(avail / (6.5 * cw)));
  return { size: 6.5, lines: words.map((w) => (w.length > max ? `${w.slice(0, max - 1)}…` : w)).slice(0, 3) };
}

/** As linhas do nome do prêmio, centradas no ponto do texto. */
function LabelLines({ lines, size }: { lines: string[]; size: number }) {
  const lh = size * 1.12;
  return (
    <>
      {lines.map((l, k) => (
        <tspan key={k} x="0" dy={k === 0 ? -((lines.length - 1) * lh) / 2 : lh}>
          {l}
        </tspan>
      ))}
    </>
  );
}

/**
 * Roleta do Departamento (porte de `wheel()` do protótipo da identidade): roda de linhas
 * brancas sobre o campo, régua de 80 traços, um segmento cheio no prêmio, selo do globo
 * no centro e a estrela no topo como ponteiro. O campo do selo é `--wheel-field` (padrão: o fundo).
 * TODO oficial: o selo do globo é reconstrução do selo das costas do moletom (GAPS G-01).
 */
const SW = { cx: 180, cy: 192, r: 156, ri: 64 };

function StarWheel({ prizes, on = -1, rot = 0, live = false, prefix = "tt", className = "" }: Omit<TurntableProps, "variant">) {
  const { cx, cy, r, ri } = SW;
  const n = Math.max(prizes.length, 1);
  const step = 360 / n;
  const P = (a: number, rr: number): [number, number] => {
    const t = ((a - 90) * Math.PI) / 180;
    return [+(cx + rr * Math.cos(t)).toFixed(2), +(cy + rr * Math.sin(t)).toFixed(2)];
  };
  const ring = (a0: number, a1: number, r0: number, r1: number) => {
    const [x0, y0] = P(a0, r1);
    const [x1, y1] = P(a1, r1);
    const [x2, y2] = P(a1, r0);
    const [x3, y3] = P(a0, r0);
    return `M${x0} ${y0}A${r1} ${r1} 0 0 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 0 0 ${x3} ${y3}Z`;
  };
  const ticks = Array.from({ length: 80 }, (_, k) => {
    const [x0, y0] = P(k * 4.5, r - 9);
    const [x1, y1] = P(k * 4.5, r - (k % 10 === 0 ? 1 : 5));
    return { x0, y0, x1, y1 };
  });
  const paper = "var(--fc-paper)";
  const arcId = `${prefix}Arc`;

  return (
    <svg
      className={`${s.tt} ${s.star} tt ${className}`}
      viewBox="0 0 360 360"
      role={live ? "img" : undefined}
      aria-label={live ? `Roleta com ${n} prêmios; a estrela no topo aponta o prêmio` : undefined}
      aria-hidden={live ? undefined : true}
      focusable="false"
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={paper} strokeWidth="2" />
      <circle cx={cx} cy={cy} r={r - 9} fill="none" stroke={paper} strokeWidth="1" />
      <g id={`${prefix}Rec`} className={`${s.rec} rec`} style={origin(cx, cy, rot)}>
        {ticks.map((t, k) => (
          <line key={k} x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1} stroke={paper} strokeWidth="1" />
        ))}
        {prizes.map((label, i) => {
          const a = i * step;
          const [x0, y0] = P(a - step / 2, ri);
          const [x1, y1] = P(a - step / 2, r - 9);
          return (
            <g key={i}>
              <g className={`${s.trk} trk${i === on ? ` ${s.on} on` : ""}`} data-i={i}>
                <path d={ring(a - step / 2, a + step / 2, ri, r - 9)} />
                {(() => {
                  const f = fitLabel(label, n, r - 34, 12, 0.74);
                  return (
                    <text
                      transform={`rotate(${a} ${cx} ${cy}) translate(${cx} ${cy - r + 34})`}
                      textAnchor="middle"
                      fontWeight="800"
                      fontSize={f.size}
                      letterSpacing=".5"
                      style={grotesk}
                    >
                      <LabelLines lines={f.lines} size={f.size} />
                    </text>
                  );
                })()}
              </g>
              <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={paper} strokeWidth="1" />
            </g>
          );
        })}
      </g>
      {/* selo do globo */}
      <circle cx={cx} cy={cy} r={ri} fill="var(--wheel-field, var(--fc-bg))" stroke={paper} strokeWidth="1" />
      <circle cx={cx} cy={cy} r="56" fill="none" stroke={paper} strokeWidth="2" />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke={paper} strokeWidth="1" />
      <path id={arcId} d={`M${cx - 44} ${cy}a44 44 0 1 1 88 0a44 44 0 1 1 -88 0`} fill="none" />
      <text fontWeight="800" fontSize="8.4" fill={paper} style={grotesk}>
        <textPath href={`#${arcId}`} textLength="262" lengthAdjust="spacing">
          TROUBLE DANCING? · 1-800-DEPARTAMENTO ·
        </textPath>
      </text>
      <circle cx={cx} cy={cy} r="24" fill="none" stroke={paper} strokeWidth="1.2" />
      {[9, 18].map((rx) => (
        <ellipse key={rx} cx={cx} cy={cy} rx={rx} ry="24" fill="none" stroke={paper} strokeWidth="1" />
      ))}
      <line x1={cx} y1={cy - 24} x2={cx} y2={cy + 24} stroke={paper} strokeWidth="1" />
      {[-14, 0, 14].map((dy) => {
        const hw = Math.sqrt(24 * 24 - dy * dy);
        return <line key={dy} x1={+(cx - hw).toFixed(2)} y1={cy + dy} x2={+(cx + hw).toFixed(2)} y2={cy + dy} stroke={paper} strokeWidth="1" />;
      })}
      {/* ponteiro */}
      <g transform={`translate(${cx - 29} 6) scale(.58)`} fill={paper}>
        <path d={STAR_D} />
      </g>
    </svg>
  );
}

function Deck({
  prizes,
  deck = true,
  on = -1,
  rot = 0,
  arm = 0,
  live = false,
  prefix = "tt",
  className = "",
  playing = false,
  vu = -46,
  volume = -120,
}: Omit<TurntableProps, "variant">) {
  const c = TT;
  const n = Math.max(prizes.length, 1);
  const step = 360 / n;
  const [px, py] = c.piv;

  const grooves: number[] = [];
  for (let r = 58; r <= 147; r += 3.1) grooves.push(+r.toFixed(1));

  const vuTicks: { x0: string; y0: string; x1: string; y1: string; hot: boolean }[] = [];
  const knobTicks: { x0: string; y0: string; x1: string; y1: string }[] = [];
  const brush: number[] = [];
  if (deck) {
    for (let k = -48; k <= 48; k += 8) {
      const t = (k * Math.PI) / 180;
      const r0 = k % 16 === 0 ? 60 : 63;
      vuTicks.push({
        x0: (95 + r0 * Math.sin(t)).toFixed(1),
        y0: (476 - r0 * Math.cos(t)).toFixed(1),
        x1: (95 + 70 * Math.sin(t)).toFixed(1),
        y1: (476 - 70 * Math.cos(t)).toFixed(1),
        hot: k >= 24,
      });
    }
    for (let k = -135; k <= 135; k += 15) {
      const t = (k * Math.PI) / 180;
      const r1 = k % 45 === 0 ? 42 : 39;
      knobTicks.push({
        x0: (322 + 35 * Math.sin(t)).toFixed(1),
        y0: (424 - 35 * Math.cos(t)).toFixed(1),
        x1: (322 + r1 * Math.sin(t)).toFixed(1),
        y1: (424 - r1 * Math.cos(t)).toFixed(1),
      });
    }
    for (let r = 6; r < 28; r += 3) brush.push(r);
  }
  const vuArc = `M${(95 - 70 * Math.sin(0.84)).toFixed(1)} ${(476 - 70 * Math.cos(0.84)).toFixed(1)}A70 70 0 0 1 ${(95 + 70 * Math.sin(0.84)).toFixed(1)} ${(476 - 70 * Math.cos(0.84)).toFixed(1)}`;

  const id = (name: string) => `${prefix}${name}`;

  return (
    <svg
      className={`${s.tt} tt ${playing ? s.playing : ""} ${className}`}
      viewBox={`0 0 390 ${deck ? 472 : 300}`}
      role={live ? "img" : undefined}
      aria-label={live ? `Toca-discos com ${n} prêmios no disco; a agulha escolhe o prêmio` : undefined}
      aria-hidden={live ? undefined : true}
      focusable="false"
    >
      {deck && (
        <defs>
          <radialGradient id={id("kg")} cx=".36" cy=".3" r=".8">
            <stop offset="0" stopColor="#f4f6f6" />
            <stop offset=".55" stopColor="#a7b1b1" />
            <stop offset="1" stopColor="#6f7b7b" />
          </radialGradient>
          <clipPath id={id("vc")}>
            <rect x="26" y="394" width="138" height="60" rx="4" />
          </clipPath>
        </defs>
      )}

      {/* prato */}
      <circle cx={c.cx} cy={c.cy} r="153" fill="var(--key-deep)" />

      {/* disco */}
      <g id={id("Rec")} className={`${s.rec} rec`} style={origin(c.cx, c.cy, rot)}>
        <circle cx={c.cx} cy={c.cy} r="150" fill="var(--vinyl)" />
        {grooves.map((r) => (
          <circle key={r} cx={c.cx} cy={c.cy} r={r} fill="none" stroke="var(--groove)" strokeWidth=".7" />
        ))}
        {[86, 112, 134].map((r) => (
          <circle key={r} cx={c.cx} cy={c.cy} r={r} fill="none" stroke="var(--groove-deep)" strokeWidth="2.2" />
        ))}
        {prizes.map((label, i) => {
          const a = i * step;
          const [x0, y0] = P(a - step / 2, 58);
          const [x1, y1] = P(a - step / 2, 149);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--divider)" strokeWidth=".8" />;
        })}
        {prizes.map((label, i) => {
          const a = i * step;
          return (
            <g key={i} className={`${s.trk} trk${i === on ? ` ${s.on} on` : ""}`} data-i={i}>
              <path d={ann(a - step / 2, a + step / 2, 58, 149)} />
              {(() => {
                const f = fitLabel(label, n, 122, 10, 0.72);
                return (
                  <text
                    transform={`rotate(${a} ${c.cx} ${c.cy}) translate(${c.cx} ${c.cy - 122})`}
                    textAnchor="middle"
                    fontSize={f.size}
                    letterSpacing="1"
                    style={mono}
                  >
                    <LabelLines lines={f.lines} size={f.size} />
                  </text>
                );
              })()}
            </g>
          );
        })}
        {/* selo */}
        <circle cx={c.cx} cy={c.cy} r="52" fill="var(--label-blue)" />
        <circle cx={c.cx} cy={c.cy} r="47" fill="none" stroke="var(--fc-ink)" strokeWidth=".6" />
        <text x={c.cx} y={c.cy - 17} textAnchor="middle" fontWeight="800" fontSize="12" fill="var(--fc-ink)" style={grotesk}>
          PICKUP
        </text>
        <g transform={`translate(${c.cx - 15} ${c.cy + 5}) scale(0.034)`} fill="none" stroke="var(--fc-ink)" strokeWidth="40">
          <g transform="translate(-146 -288)">
            {MARK_POINTS.map((p) => (
              <polygon key={p} points={p} />
            ))}
          </g>
        </g>
        <text x={c.cx} y={c.cy + 39} textAnchor="middle" fontSize="6" letterSpacing="1" fill="var(--fc-ink)" style={mono}>
          DA SORTE · 33 RPM
        </text>
        <circle cx={c.cx} cy={c.cy} r="5" fill="var(--metal-hi)" stroke="var(--metal-lo)" />
      </g>

      {/* brilho do vinil */}
      <path d={ann(-58, -28, 60, 148)} fill="var(--sheen)" opacity=".07" />
      <path d={ann(122, 152, 60, 148)} fill="var(--sheen)" opacity=".07" />

      {/* base do braço */}
      <circle cx={px} cy={py} r="30" fill="var(--metal)" stroke="var(--fc-chrome)" strokeWidth="2" />
      <circle cx={px} cy={py} r="21" fill="var(--metal-hi)" stroke="var(--metal-ring)" />

      {/* braço */}
      <g id={id("Arm")} className={s.arm} style={origin(px, py, arm)}>
        <rect x={px - 14} y={py - 48} width="28" height="30" rx="5" fill="var(--metal)" stroke="var(--metal-lo)" />
        <rect x={px - 11} y={py - 42} width="22" height="2" fill="var(--metal-lo)" />
        <rect x={px - 11} y={py - 36} width="22" height="2" fill="var(--metal-lo)" />
        <line x1={px} y1={py - 14} x2={px} y2="232" stroke="var(--metal-lo)" strokeWidth="7" strokeLinecap="round" />
        <line x1={px} y1={py - 14} x2={px} y2="232" stroke="var(--metal-hi)" strokeWidth="3.5" strokeLinecap="round" />
        <g transform={`rotate(24 ${px} 246)`}>
          <rect x={px - 9} y="228" width="18" height="34" rx="2" fill="var(--metal)" stroke="var(--metal-lo)" />
          <rect x={px + 8} y="233" width="11" height="3" rx="1" fill="var(--metal)" stroke="var(--metal-lo)" strokeWidth=".6" />
          <line x1={px} y1="262" x2={px} y2="270" stroke="var(--fc-line)" strokeWidth="2" />
        </g>
      </g>
      <circle cx={px} cy={py} r="9" fill="var(--fc-chrome)" stroke="var(--metal-lo)" />

      {deck && (
        <>
          {/* VU */}
          <rect x="20" y="388" width="150" height="72" rx="8" fill="var(--metal)" stroke="var(--metal-lo)" />
          <rect x="26" y="394" width="138" height="60" rx="4" fill="var(--vu-face)" />
          <g clipPath={`url(#${id("vc")})`}>
            <path d={vuArc} fill="none" stroke="var(--fc-ink)" strokeWidth="1" />
            {vuTicks.map((t) => (
              <line
                key={t.x0 + t.y0}
                x1={t.x0}
                y1={t.y0}
                x2={t.x1}
                y2={t.y1}
                stroke={t.hot ? "var(--fc-signal)" : "var(--fc-ink)"}
                strokeWidth={t.hot ? 2 : 1}
              />
            ))}
            <text x="95" y="438" textAnchor="middle" fontSize="9" letterSpacing="1" fill="var(--fc-ink)" style={mono}>
              VU
            </text>
            <text x="40" y="412" fontSize="6" fill="var(--fc-ink)" style={mono}>
              -20
            </text>
            <text x="146" y="412" fontSize="6" fill="var(--fc-signal)" style={mono}>
              +3
            </text>
            <line
              id={id("Vu")}
              className={s.vun}
              x1="95"
              y1="476"
              x2="95"
              y2="404"
              stroke="var(--fc-signal)"
              strokeWidth="1.4"
              style={origin(95, 476, vu)}
            />
          </g>

          {/* LEDs */}
          <circle cx="210" cy="414" r="10" fill="var(--metal)" stroke="var(--metal-lo)" />
          <circle id={id("LedG")} className={s.ledG} cx="210" cy="414" r="7" />
          <text x="210" y="440" textAnchor="middle" fontSize="7" letterSpacing="1" fill="var(--fc-ink)" style={mono}>
            PLAY
          </text>
          <circle cx="244" cy="414" r="10" fill="var(--metal)" stroke="var(--metal-lo)" />
          <circle id={id("LedR")} className={s.ledR} cx="244" cy="414" r="7" />
          <text x="244" y="440" textAnchor="middle" fontSize="7" letterSpacing="1" fill="var(--fc-ink)" style={mono}>
            STOP
          </text>

          {/* volume */}
          {knobTicks.map((t) => (
            <line key={t.x0 + t.y0} x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1} stroke="var(--fc-ink)" strokeWidth="1.2" />
          ))}
          <text x="294" y="466" fontSize="7" fill="var(--fc-ink)" style={mono}>
            min
          </text>
          <text x="338" y="466" fontSize="7" fill="var(--fc-ink)" style={mono}>
            max
          </text>
          <circle cx="322" cy="424" r="29" fill={`url(#${id("kg")})`} stroke="var(--metal-lo)" />
          {brush.map((r) => (
            <circle key={r} cx="322" cy="424" r={r} fill="none" stroke="var(--sheen)" strokeOpacity=".18" strokeWidth=".6" />
          ))}
          <g id={id("Vol")} className={s.vol} style={origin(322, 424, volume)}>
            <line x1="322" y1="400" x2="322" y2="411" stroke="var(--fc-ink)" strokeWidth="3" />
          </g>
        </>
      )}
    </svg>
  );
}
