"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { loadPickupHistory } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge, btnSecondary, inputClass } from "@/components/admin/ui";
import { formatCount } from "@/lib/format";
import type { PickupSpinPage } from "@/lib/types";
import { kindStyle } from "./RoletaSvg";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Quem girou a roleta, do último a girar para o primeiro, 10 por página, com busca pelo nome. */
export function HistoricoGiros({ artist, club, initial }: { artist: string; club: string; initial: PickupSpinPage | null }) {
  const [data, setData] = useState<PickupSpinPage | null>(initial);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, start] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => start(async () => setData(await loadPickupHistory(artist, club, q, page))), 300);
    return () => clearTimeout(t);
  }, [artist, club, q, page]);

  const items = data?.items ?? [];
  const from = data && data.total ? (data.page - 1) * data.pageSize + 1 : 0;

  return (
    <section aria-labelledby="hist-title" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="hist-title" className="m-0 font-display text-3xl font-black">
            Histórico de giros
          </h2>
          <p className="m-0 text-[13px] text-adm-muted">Do último a girar para o primeiro.</p>
        </div>
        <div className="w-full max-w-[320px]">
          <label htmlFor="hist-busca" className="sr-only">
            Buscar quem girou pelo nome
          </label>
          <input
            id="hist-busca"
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar pelo nome"
            autoComplete="off"
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-xl border border-adm-line bg-white p-4" aria-busy={loading}>
        {!data ? (
          <p className="m-0 text-sm text-adm-muted">Histórico indisponível. Ligue o front à API.</p>
        ) : items.length === 0 ? (
          <p className="m-0 text-sm text-adm-muted">{q.trim() ? "Ninguém com esse nome girou." : "Ninguém girou esta roleta ainda."}</p>
        ) : (
          <ol className="m-0 grid list-none gap-x-6 gap-y-1 p-0 md:grid-cols-2" start={from}>
            {items.map((r, i) => {
              const style = kindStyle(r.kind);
              return (
                <li key={`${r.at}-${i}`} className="flex items-center gap-3 border-b border-adm-line-soft py-2">
                  <ClubAvatar src={r.avatar} name={r.name} size={40} />
                  <span className="flex min-w-0 flex-1 flex-col leading-5">
                    <strong className="truncate text-sm">{r.name}</strong>
                    <span className="font-adm-mono text-[12px] text-adm-muted">{when(r.at)}</span>
                  </span>
                  <span className="flex max-w-[45%] flex-col items-end gap-1">
                    <span className="break-words text-right text-[13px] font-semibold leading-4">{r.prize}</span>
                    {r.kind && (
                      <span className="flex items-center gap-1 text-[11px] text-adm-muted">
                        <span aria-hidden="true" className="size-2 rounded-full" style={{ background: style.color }} />
                        {style.label}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        {data && data.total > 0 && (
          <nav aria-label="Páginas do histórico" className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-adm-line-soft pt-3">
            <span role="status" aria-live="polite" className="font-adm-mono text-[13px] text-adm-muted">
              {from}–{from + items.length - 1} de {formatCount(data.total)}
            </span>
            <span className="flex items-center gap-2">
              <button type="button" disabled={data.page <= 1 || loading} onClick={() => setPage(data.page - 1)} className={`${btnSecondary} disabled:opacity-40`}>
                Anterior
              </button>
              <span className="font-adm-mono text-[13px]">
                {data.page} / {data.pages}
              </span>
              <button type="button" disabled={data.page >= data.pages || loading} onClick={() => setPage(data.page + 1)} className={`${btnSecondary} disabled:opacity-40`}>
                Próxima
              </button>
            </span>
          </nav>
        )}
      </div>
      {data && data.total > 0 && <Badge tone="off">{formatCount(data.total)} giros no total</Badge>}
    </section>
  );
}
