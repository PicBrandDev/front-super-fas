import { formatShort } from "@/lib/format";

const dm = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

/** Barras por dia, pequenas e sem eixos, no tema do fã clube (uma série só). A tabela com os números fica para leitor de tela. */
export function MiniBars({ title, unit, points }: { title: string; unit: string; points: { day: string; value: number }[] }) {
  const max = Math.max(1, ...points.map((p) => p.value));
  const total = points.reduce((a, p) => a + p.value, 0);
  return (
    <figure className="m-0 flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <strong className="num font-display text-3xl font-black leading-8">{formatShort(total)}</strong>
        <span className="mono">
          {unit} em {points.length} dias
        </span>
      </div>
      <div role="img" aria-label={`${title}: ${total} ${unit} nos últimos ${points.length} dias`} className="flex h-14 items-end gap-px">
        {points.map((p) => (
          <span
            key={p.day}
            title={`${dm(p.day)}: ${p.value} ${unit}`}
            className={`min-w-0 flex-1 rounded-t-[1px] ${p.value > 0 ? "bg-amber" : "bg-line"}`}
            style={{ height: p.value > 0 ? `${Math.max(10, (p.value / max) * 100)}%` : "2px" }}
          />
        ))}
      </div>
      {points.length > 0 && (
        <div aria-hidden="true" className="mono flex justify-between">
          <span>{dm(points[0].day)}</span>
          <span>{dm(points[points.length - 1].day)}</span>
        </div>
      )}
      <figcaption className="sr-only">
        <table>
          <caption>{title}</caption>
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

/** Barras horizontais com o valor ao lado (ex.: cidades dos membros), no tema do fã clube. */
export function RowBars({ rows }: { rows: { label: string; value: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
      {rows.map((r) => (
        <li key={r.label} className="flex items-center gap-3 text-[14px]">
          <span className="w-28 flex-none truncate">{r.label}</span>
          <span className="h-1.5 min-w-0 flex-1 bg-line">
            <span className="block h-1.5 bg-amber" style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="num w-8 flex-none text-right font-semibold">{r.value}</span>
        </li>
      ))}
    </ul>
  );
}
