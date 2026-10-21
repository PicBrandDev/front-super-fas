import type { CSSProperties } from "react";
import { MARK_POINTS } from "./Mark";

/**
 * Toca-discos do PicKap (porte da função `turntable()` do protótipo fanzone).
 * O disco é a roleta: cada faixa (`.trk`) é um prêmio; a agulha escolhe.
 *
 * Uso no cartaz (Mural): `<Turntable deck={false} on={4} rot={recAngleFor(4)} arm={TT.play} prefix="pp" />`.
 * Uso ao vivo (PicKap): `<Turntable live on={i} rot={angle} arm={0} prefix="dk" />` e, para animar,
 * mude `rot`/`arm` (o CSS global `.tt .rec/.arm` faz a transição) ou alcance os nós pelos ids
 * `${prefix}Rec`, `${prefix}Arm`, `${prefix}Vu`, `${prefix}Vol`, `${prefix}LedG`, `${prefix}LedR`.
 *
 * - `deck`: com `true` desenha o VU, PLAY/STOP e o botão de volume (viewBox 390×472); com `false`, só o disco (390×300).
 * - `on`: índice do prêmio aceso (faixa âmbar), -1 para nenhum.
 * - `rot`: rotação do disco em graus (use `recAngleFor(i)` para deixar o prêmio `i` sob a agulha).
 * - `arm`: rotação do braço em graus (0 em repouso, `TT.play` sobre o disco).
 * - `live`: `role="img"` + ids nos nós animáveis; `false` deixa o SVG decorativo.
 * - `prizes`: rótulos das 8 faixas (padrão `PRIZES`).
 */
export const PRIZES = ["Camiseta", "Boné", "Pôster", "Vinil", "Ingresso", "Adesivo", "Tente de novo", "Pulseira"];

/** Geometria fixa do desenho: centro do disco, pivô do braço, ponta da agulha e ângulo de "tocando". */
export const TT: { cx: number; cy: number; piv: [number, number]; tip: [number, number]; play: number } = {
  cx: 170,
  cy: 210,
  piv: [345, 54],
  tip: [335.2, 267.9],
  play: 15.5,
};

/** Ângulo (a partir do topo, horário) em que a agulha toca o disco quando o braço está em `TT.play`. */
export const stylusTheta = (() => {
  const a = (TT.play * Math.PI) / 180;
  const dx = TT.tip[0] - TT.piv[0];
  const dy = TT.tip[1] - TT.piv[1];
  const x = TT.piv[0] + dx * Math.cos(a) - dy * Math.sin(a);
  const y = TT.piv[1] + dx * Math.sin(a) + dy * Math.cos(a);
  const deg = (Math.atan2(x - TT.cx, -(y - TT.cy)) * 180) / Math.PI;
  return (deg + 360) % 360;
})();

export const norm = (a: number) => ((a % 360) + 360) % 360;

/** Rotação do disco que deixa o prêmio `i` sob a agulha. */
export const recAngleFor = (i: number, n = PRIZES.length) => norm(stylusTheta - i * (360 / n));

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
const grotesk: CSSProperties = { fontFamily: "var(--fc-font-grotesk)", fontWeight: 800 };

export function Turntable({
  deck = true,
  on = -1,
  rot = 0,
  arm = 0,
  live = false,
  prefix = "t",
  prizes = PRIZES,
  className = "",
}: {
  deck?: boolean;
  on?: number;
  rot?: number;
  arm?: number;
  live?: boolean;
  prefix?: string;
  prizes?: string[];
  className?: string;
}) {
  const { cx, cy } = TT;
  const n = prizes.length;
  const step = 360 / n;
  const [px, py] = TT.piv;
  const id = (s: string) => (live ? `${prefix}${s}` : undefined);

  const grooves: number[] = [];
  for (let r = 58; r <= 147; r += 3.1) grooves.push(+r.toFixed(1));

  const vu: { x0: string; y0: string; x1: string; y1: string; hot: boolean }[] = [];
  const knob: { x0: string; y0: string; x1: string; y1: string }[] = [];
  const brush: number[] = [];
  if (deck) {
    for (let k = -48; k <= 48; k += 8) {
      const t = (k * Math.PI) / 180;
      const r0 = k % 16 === 0 ? 60 : 63;
      vu.push({
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
      knob.push({
        x0: (322 + 35 * Math.sin(t)).toFixed(1),
        y0: (424 - 35 * Math.cos(t)).toFixed(1),
        x1: (322 + r1 * Math.sin(t)).toFixed(1),
        y1: (424 - r1 * Math.cos(t)).toFixed(1),
      });
    }
    for (let r = 6; r < 28; r += 3) brush.push(r);
  }
  const vuArc = `M${(95 - 70 * Math.sin(0.84)).toFixed(1)} ${(476 - 70 * Math.cos(0.84)).toFixed(1)}A70 70 0 0 1 ${(95 + 70 * Math.sin(0.84)).toFixed(1)} ${(476 - 70 * Math.cos(0.84)).toFixed(1)}`;

  return (
    <svg
      className={`tt ${className}`}
      viewBox={`0 0 390 ${deck ? 472 : 300}`}
      role={live ? "img" : undefined}
      aria-label={live ? `Toca-discos com ${n} prêmios no disco; a agulha escolhe o prêmio` : undefined}
      aria-hidden={live ? undefined : true}
      focusable="false"
    >
      {deck && (
        <defs>
          <radialGradient id={`${prefix}kg`} cx=".36" cy=".3" r=".8">
            <stop offset="0" stopColor="var(--tt-metal-hi)" />
            <stop offset=".55" stopColor="var(--tt-metal-mid)" />
            <stop offset="1" stopColor="var(--tt-metal-lo)" />
          </radialGradient>
          <clipPath id={`${prefix}vc`}>
            <rect x="26" y="394" width="138" height="60" rx="4" />
          </clipPath>
        </defs>
      )}
      <circle cx={cx} cy={cy} r="153" fill="var(--tt-plinth)" />
      <g
        className="rec"
        id={id("Rec")}
        style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${rot}deg)` } as CSSProperties}
      >
        <circle cx={cx} cy={cy} r="150" fill="var(--tt-vinyl)" />
        {grooves.map((r) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--tt-groove)" strokeWidth=".7" />
        ))}
        {[86, 112, 134].map((r) => (
          <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--tt-groove-deep)" strokeWidth="2.2" />
        ))}
        {prizes.map((_, i) => {
          const a = i * step;
          const [x0, y0] = P(a - step / 2, 58);
          const [x1, y1] = P(a - step / 2, 149);
          return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--tt-sep)" strokeWidth=".8" />;
        })}
        {prizes.map((label, i) => {
          const a = i * step;
          return (
            <g key={label + i} className={`trk${i === on ? " on" : ""}`} data-i={i}>
              <path d={ann(a - step / 2, a + step / 2, 58, 149)} fill="transparent" />
              <text
                transform={`rotate(${a} ${cx} ${cy}) translate(${cx} ${cy - 122})`}
                textAnchor="middle"
                style={mono}
                fontSize={label.length > 9 ? 8.5 : 10}
                letterSpacing="1"
                fill="var(--tt-label-text)"
              >
                {label.toUpperCase()}
              </text>
            </g>
          );
        })}
        {/* selo */}
        <circle cx={cx} cy={cy} r="52" fill="var(--tt-label-blue)" />
        <circle cx={cx} cy={cy} r="47" fill="none" stroke="var(--fc-ink)" strokeWidth=".6" />
        <text x={cx} y={cy - 17} textAnchor="middle" style={grotesk} fontSize="12" fill="var(--fc-ink)">
          PICKAP
        </text>
        <g transform={`translate(${cx - 15} ${cy + 5}) scale(.034)`} fill="none" stroke="var(--fc-ink)" strokeWidth="40">
          <g transform="translate(-146 -288)">
            {MARK_POINTS.map((p) => (
              <polygon key={p} points={p} />
            ))}
          </g>
        </g>
        <text x={cx} y={cy + 39} textAnchor="middle" style={mono} fontSize="6" letterSpacing="1" fill="var(--fc-ink)">
          DA SORTE · 33 RPM
        </text>
        <circle cx={cx} cy={cy} r="5" fill="var(--tt-metal-hi)" stroke="var(--tt-metal-lo)" />
      </g>
      {/* brilho */}
      <path d={ann(-58, -28, 60, 148)} fill="var(--fc-paper)" opacity=".07" />
      <path d={ann(122, 152, 60, 148)} fill="var(--fc-paper)" opacity=".07" />
      {/* base do braço */}
      <circle cx={px} cy={py} r="30" fill="var(--tt-metal)" stroke="var(--fc-chrome)" strokeWidth="2" />
      <circle cx={px} cy={py} r="21" fill="var(--tt-metal-hi)" stroke="var(--tt-metal-edge)" />
      <g
        className="arm"
        id={id("Arm")}
        style={{ transformOrigin: `${px}px ${py}px`, transform: `rotate(${arm}deg)` } as CSSProperties}
      >
        <rect x={px - 14} y={py - 48} width="28" height="30" rx="5" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" />
        <rect x={px - 11} y={py - 42} width="22" height="2" fill="var(--tt-metal-lo)" />
        <rect x={px - 11} y={py - 36} width="22" height="2" fill="var(--tt-metal-lo)" />
        <line x1={px} y1={py - 14} x2={px} y2="232" stroke="var(--tt-metal-lo)" strokeWidth="7" strokeLinecap="round" />
        <line x1={px} y1={py - 14} x2={px} y2="232" stroke="var(--tt-metal-hi)" strokeWidth="3.5" strokeLinecap="round" />
        <g transform={`rotate(24 ${px} 246)`}>
          <rect x={px - 9} y="228" width="18" height="34" rx="2" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" />
          <rect x={px + 8} y="233" width="11" height="3" rx="1" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" strokeWidth=".6" />
          <line x1={px} y1="262" x2={px} y2="270" stroke="var(--fc-line)" strokeWidth="2" />
        </g>
      </g>
      <circle cx={px} cy={py} r="9" fill="var(--fc-chrome)" stroke="var(--tt-metal-lo)" />
      {deck && (
        <>
          <rect x="20" y="388" width="150" height="72" rx="8" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" />
          <rect x="26" y="394" width="138" height="60" rx="4" fill="var(--tt-vu-face)" />
          <g clipPath={`url(#${prefix}vc)`}>
            <path d={vuArc} fill="none" stroke="var(--fc-ink)" strokeWidth="1" />
            {vu.map((l, i) => (
              <line
                key={i}
                x1={l.x0}
                y1={l.y0}
                x2={l.x1}
                y2={l.y1}
                stroke={l.hot ? "var(--fc-signal)" : "var(--fc-ink)"}
                strokeWidth={l.hot ? 2 : 1}
              />
            ))}
            <text x="95" y="438" textAnchor="middle" style={mono} fontSize="9" letterSpacing="1" fill="var(--fc-ink)">
              VU
            </text>
            <text x="40" y="412" style={mono} fontSize="6" fill="var(--fc-ink)">
              -20
            </text>
            <text x="146" y="412" style={mono} fontSize="6" fill="var(--fc-signal)">
              +3
            </text>
            <line
              className="vun"
              id={id("Vu")}
              x1="95"
              y1="476"
              x2="95"
              y2="404"
              stroke="var(--fc-signal)"
              strokeWidth="1.4"
              style={{ transformOrigin: "95px 476px", transform: "rotate(-46deg)" } as CSSProperties}
            />
          </g>
          <circle cx="210" cy="414" r="10" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" />
          <circle className="led-g" id={id("LedG")} cx="210" cy="414" r="7" fill="var(--tt-led-off-g)" />
          <text x="210" y="440" textAnchor="middle" style={mono} fontSize="7" letterSpacing="1" fill="var(--fc-ink)">
            PLAY
          </text>
          <circle cx="244" cy="414" r="10" fill="var(--tt-metal)" stroke="var(--tt-metal-lo)" />
          <circle className="led-r" id={id("LedR")} cx="244" cy="414" r="7" fill="var(--fc-signal)" />
          <text x="244" y="440" textAnchor="middle" style={mono} fontSize="7" letterSpacing="1" fill="var(--fc-ink)">
            STOP
          </text>
          {knob.map((l, i) => (
            <line key={i} x1={l.x0} y1={l.y0} x2={l.x1} y2={l.y1} stroke="var(--fc-ink)" strokeWidth="1.2" />
          ))}
          <text x="294" y="466" style={mono} fontSize="7" fill="var(--fc-ink)">
            min
          </text>
          <text x="338" y="466" style={mono} fontSize="7" fill="var(--fc-ink)">
            max
          </text>
          <circle cx="322" cy="424" r="29" fill={`url(#${prefix}kg)`} stroke="var(--tt-metal-lo)" />
          {brush.map((r) => (
            <circle key={r} cx="322" cy="424" r={r} fill="none" stroke="var(--fc-paper)" strokeOpacity=".18" strokeWidth=".6" />
          ))}
          <g
            className="vol"
            id={id("Vol")}
            style={{ transformOrigin: "322px 424px", transform: "rotate(-120deg)" } as CSSProperties}
          >
            <line x1="322" y1="400" x2="322" y2="411" stroke="var(--fc-ink)" strokeWidth="3" />
          </g>
        </>
      )}
    </svg>
  );
}
