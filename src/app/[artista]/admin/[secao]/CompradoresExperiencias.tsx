"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { loadExperienceBuyers } from "@/app/actions/admin";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge, btnSecondary, inputClass } from "@/components/admin/ui";
import { formatBRL, formatCount } from "@/lib/format";
import type { ExperienceBuyerPage, ExperiencesOverview } from "@/lib/types";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });

/**
 * Quem comprou cada experiência do show (transfer, jantar, camarim, pré, after, hotel). O ingresso não se vende pelo app,
 * então aqui só há experiências. Escolha a experiência para ver os compradores, do mais recente ao mais antigo, 10 por
 * página, com busca pelo nome.
 */
export function CompradoresExperiencias({ slug, eventId, overview }: { slug: string; eventId: string; overview: ExperiencesOverview | null }) {
  const list = overview?.experiences ?? [];
  const [key, setKey] = useState(list.find((e) => e.purchases > 0)?.key ?? list[0]?.key ?? "");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ExperienceBuyerPage | null>(null);
  const [loading, start] = useTransition();
  const first = useRef(true);

  useEffect(() => {
    if (!key) return;
    // a primeira busca é na hora; as seguintes esperam 300 ms depois da última tecla
    const t = setTimeout(() => start(async () => setData(await loadExperienceBuyers(slug, eventId, key, q, page))), first.current ? 0 : 300);
    first.current = false;
    return () => clearTimeout(t);
  }, [slug, eventId, key, q, page]);

  if (!overview) return null;
  const items = data?.items ?? [];
  const from = data && data.total ? (data.page - 1) * data.pageSize + 1 : 0;

  return (
    <section aria-labelledby="comp-title" className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2 id="comp-title" className="m-0 text-lg font-bold">
          Compradores das experiências
        </h2>
        <p className="m-0 text-sm text-adm-muted">
          O ingresso é da ticketeira. Aqui estão as pessoas que compraram experiências neste show: {formatCount(overview.people)}{" "}
          {overview.people === 1 ? "pessoa" : "pessoas"}, {formatCount(overview.purchases)} {overview.purchases === 1 ? "compra" : "compras"}, {formatBRL(overview.revenueCents)} no total.
        </p>
      </div>

      {list.length === 0 ? (
        <p className="m-0 text-sm text-adm-muted">Este show ainda não tem experiências à venda. Marque-as nos pacotes acima.</p>
      ) : (
        <>
          <div role="tablist" aria-label="Experiências" className="flex flex-wrap gap-2">
            {list.map((e) => {
              const on = e.key === key;
              return (
                <button
                  key={e.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setKey(e.key);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${on ? "border-adm-blue bg-adm-blue-soft text-adm-blue-dark" : "border-adm-line bg-white text-adm-muted"}`}
                >
                  {e.label} · {formatCount(e.people)}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-4" aria-busy={loading}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-base font-bold">{data?.label ?? list.find((e) => e.key === key)?.label}</h3>
                {list.find((e) => e.key === key)?.soldOut && <Badge tone="warn">Esgotada</Badge>}
                <span className="font-adm-mono text-[13px] text-adm-muted">{data ? `${formatCount(data.total)} ${data.total === 1 ? "compra" : "compras"}` : ""}</span>
              </div>
              <div className="w-full max-w-[300px]">
                <label htmlFor="comp-busca" className="sr-only">
                  Buscar comprador pelo nome
                </label>
                <input
                  id="comp-busca"
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

            {!data ? (
              <p className="m-0 text-sm text-adm-muted">{loading ? "Carregando…" : "Lista indisponível."}</p>
            ) : items.length === 0 ? (
              <p className="m-0 text-sm text-adm-muted">{q.trim() ? "Ninguém com esse nome comprou esta experiência." : "Ninguém comprou esta experiência ainda."}</p>
            ) : (
              <ol className="m-0 flex list-none flex-col p-0" start={from}>
                {items.map((b, i) => (
                  <li key={`${b.at}-${i}`} className="flex flex-wrap items-center gap-3 border-b border-adm-line-soft py-2.5">
                    <ClubAvatar src={b.avatar} name={b.name} size={40} />
                    <span className="flex min-w-[180px] flex-1 flex-col leading-5">
                      <strong className="text-sm">{b.name}</strong>
                      <span className="text-[13px] text-adm-muted">{[b.handle, b.email].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="flex min-w-[160px] flex-col leading-5">
                      <span className="text-[13px]">{b.package}</span>
                      <span className="font-adm-mono text-[12px] text-adm-muted">
                        {b.agency} · {when(b.at)}
                      </span>
                    </span>
                    <span className="flex min-w-[140px] flex-wrap gap-1">
                      {b.experiences.map((x) => (
                        <Badge key={x} tone="info">
                          {x}
                        </Badge>
                      ))}
                    </span>
                    <span className="min-w-[88px] text-right font-adm-mono text-sm font-semibold">
                      {formatBRL(b.paidCents)}
                      {b.coupon && <span className="block text-[11px] font-normal text-adm-muted">cupom {b.coupon}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {data && data.total > 0 && (
              <nav aria-label="Páginas dos compradores" className="flex flex-wrap items-center justify-between gap-2 pt-1">
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
        </>
      )}
    </section>
  );
}
