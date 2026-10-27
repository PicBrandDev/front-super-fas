import type { PickupPrize } from "@/lib/types";

/** Cor de cada tipo de fatia (a legenda usa as mesmas). */
export const KIND_STYLE: Record<string, { label: string; color: string }> = {
  coupon: { label: "Cupom de desconto", color: "#3B6BFF" },
  ticket: { label: "Ingresso", color: "#2FAE7A" },
  pickup: { label: "Retirar na lojinha", color: "#E08A2E" },
  retry: { label: "Gire de novo", color: "#2AA7B8" },
  none: { label: "Não foi dessa vez", color: "#6B6577" },
  "": { label: "Brinde", color: "#9A5BE0" },
};

export const kindStyle = (kind: string, isRetry = false) => KIND_STYLE[isRetry ? "retry" : kind] ?? KIND_STYLE[""];

const SIZE = 320;
const C = SIZE / 2;
const R = 148;

const pt = (angle: number, radius: number) => [C + radius * Math.cos(angle), C + radius * Math.sin(angle)];
const short = (s: string) => (s.length > 15 ? `${s.slice(0, 14)}…` : s);

/**
 * A roleta como o fã vê: uma fatia por prêmio, todas do mesmo tamanho (o sorteio dá a mesma chance a cada uma).
 * Fatia com estoque acabado fica apagada, porque não sai mais.
 */
export function RoletaSvg({ prizes }: { prizes: PickupPrize[] }) {
  const n = prizes.length;
  if (!n) return null;
  const step = (Math.PI * 2) / n;
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`Roleta com ${n} fatias`} className="h-auto w-full max-w-[340px]">
      <circle cx={C} cy={C} r={R + 8} fill="#1b1612" stroke="#3a2f26" strokeWidth="2" />
      {prizes.map((p, i) => {
        const a0 = -Math.PI / 2 + i * step;
        const a1 = a0 + step;
        const [x0, y0] = pt(a0, R);
        const [x1, y1] = pt(a1, R);
        const mid = (a0 + a1) / 2;
        const [tx, ty] = pt(mid, R * 0.62);
        const deg = (mid * 180) / Math.PI;
        const flip = deg > 90 && deg < 270 ? 180 : 0; // texto de cabeça para baixo na metade da esquerda
        const out = p.remaining === 0;
        const d = n === 1 ? `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C - 0.01} ${C - R} Z` : `M ${C} ${C} L ${x0} ${y0} A ${R} ${R} 0 ${step > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
        return (
          <g key={p.id} opacity={out ? 0.35 : 1}>
            <path d={d} fill={kindStyle(p.kind, p.isRetry).color} stroke="#17110d" strokeWidth="2" />
            <text
              x={tx}
              y={ty}
              transform={`rotate(${deg + flip} ${tx} ${ty})`}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={n > 9 ? 9.5 : 11.5}
              fontWeight="700"
              fill="#fff"
              style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.35)", strokeWidth: 2 }}
            >
              {short(p.label)}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r="26" fill="#17110d" stroke="#F2C14E" strokeWidth="3" />
      <text x={C} y={C} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="800" fill="#F2C14E">
        PicKup
      </text>
      {/* ponteiro no topo */}
      <path d={`M ${C - 11} ${C - R - 14} L ${C + 11} ${C - R - 14} L ${C} ${C - R + 8} Z`} fill="#F2C14E" stroke="#17110d" strokeWidth="2" />
    </svg>
  );
}
