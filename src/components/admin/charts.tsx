import { formatCount } from "@/lib/format";

type Point = { day: string; value: number };

const dm = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/**
 * Barras por dia, pequenas e sem eixos (uma série só, na cor de destaque do painel). Sem legenda:
 * o título da seção nomeia a série. Cada barra tem tooltip e a tabela com os mesmos números
 * fica disponível para leitor de tela.
 */
export function DayBars({ title, unit, points }: { title: string; unit: string; points: Point[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((a, p) => a + p.value, 0);
  const first = points[0]?.day;
  const last = points[points.length - 1]?.day;

  return (
    <figure className="m-0 flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <strong className="text-xl leading-6">{formatCount(total)}</strong>
        <span className="text-[13px] text-adm-muted">{unit} em {points.length} dias · pico de {formatCount(max)}/dia</span>
      </div>
      <div
        role="img"
        aria-label={`${title}: ${formatCount(total)} ${unit} nos últimos ${points.length} dias`}
        className="flex h-10 items-end gap-px"
      >
        {points.map((p) => (
          <span
            key={p.day}
            title={`${dm(p.day)}: ${formatCount(p.value)} ${unit}`}
            className={`min-w-0 flex-1 rounded-t-[1px] ${p.value > 0 ? "bg-adm-blue" : "bg-adm-line"}`}
            style={{ height: p.value > 0 ? `${Math.max(8, (p.value / max) * 100)}%` : "2px" }}
          />
        ))}
      </div>
      {first && last && (
        <div aria-hidden="true" className="flex justify-between font-adm-mono text-[11px] text-adm-muted">
          <span>{dm(first)}</span>
          <span>{dm(last)}</span>
        </div>
      )}
      <figcaption className="sr-only">
        <table>
          <caption>{title}</caption>
          <thead>
            <tr>
              <th>Dia</th>
              <th>{unit}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.day}>
                <td>{dm(p.day)}</td>
                <td>{p.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}

/** Barras horizontais com o valor ao lado (ex.: cidades dos membros). */
export function HBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 flex-none truncate text-[13px]">{r.label}</span>
          <span className="h-1.5 min-w-0 flex-1 rounded-sm bg-adm-line-soft">
            <span className="block h-1.5 rounded-sm bg-adm-blue" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="w-10 flex-none text-right font-adm-mono text-[13px] font-semibold">{formatCount(r.value)}</span>
        </li>
      ))}
    </ul>
  );
}
