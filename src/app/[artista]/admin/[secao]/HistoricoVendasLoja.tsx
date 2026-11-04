"use client";

import { useState } from "react";
import { ClubAvatar } from "@/components/admin/ClubAvatar";
import { Badge } from "@/components/admin/ui";
import { formatBRL, formatCount } from "@/lib/format";
import type { ProductSales } from "@/lib/types";

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
const PAGE = 10;

/** Histórico de vendas: escolha o produto e veja quem comprou, do mais recente ao mais antigo (10 por vez). */
export function HistoricoVendasLoja({ products }: { products: ProductSales[] }) {
  const first = products.find((p) => p.sold > 0)?.productId ?? products[0]?.productId ?? "";
  const [id, setId] = useState(first);
  const [shown, setShown] = useState(PAGE);
  const cur = products.find((p) => p.productId === id);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="hist-title" className="flex flex-col gap-4">
      <h2 id="hist-title" className="m-0 text-lg font-bold">
        Histórico de vendas
      </h2>
      <div role="tablist" aria-label="Produto" className="flex flex-wrap gap-2">
        {products.map((p) => {
          const on = p.productId === id;
          return (
            <button
              key={p.productId}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => {
                setId(p.productId);
                setShown(PAGE);
              }}
              className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-[13px] font-semibold ${on ? "border-adm-blue bg-adm-blue-soft text-adm-blue-dark" : "border-adm-line bg-white text-adm-muted"}`}
            >
              {p.name} · {formatCount(p.sold)}
            </button>
          );
        })}
      </div>

      {cur && (
        <div role="tabpanel" className="flex flex-col gap-3 rounded-xl border border-adm-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col">
              <h3 className="m-0 text-base font-bold">{cur.name}</h3>
              <span className="text-[13px] text-adm-muted">
                {formatCount(cur.sold)} {cur.sold === 1 ? "unidade vendida" : "unidades vendidas"} · {formatBRL(cur.revenueCents)} · {formatCount(cur.buyers)} {cur.buyers === 1 ? "comprador" : "compradores"}
              </span>
            </div>
            {Object.keys(cur.bySize).length > 0 && (
              <ul aria-label="Vendas por tamanho" className="m-0 flex list-none flex-wrap gap-2 p-0">
                {["P", "M", "G", "GG"].filter((t) => cur.bySize[t]).map((t) => (
                  <li key={t}>
                    <Badge tone="info">
                      {t}: {cur.bySize[t]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cur.history.length === 0 ? (
            <p className="m-0 text-sm text-adm-muted">Ninguém comprou este produto ainda.</p>
          ) : (
            <>
              <ol className="m-0 flex list-none flex-col p-0">
                {cur.history.slice(0, shown).map((b, i) => (
                  <li key={`${b.orderCode}-${b.at}-${i}`} className="flex flex-wrap items-center gap-3 border-b border-adm-line-soft py-2.5 last:border-b-0">
                    <ClubAvatar src={b.avatar} name={b.name} size={40} />
                    <span className="flex min-w-[180px] flex-1 flex-col leading-5">
                      <strong className="text-sm">{b.name}</strong>
                      <span className="text-[13px] text-adm-muted">{[b.handle, b.email].filter(Boolean).join(" · ")}</span>
                    </span>
                    <span className="flex min-w-[120px] flex-col leading-5">
                      <span className="text-[13px]">
                        {b.qty} {b.qty === 1 ? "unidade" : "unidades"}
                        {b.size ? ` · ${b.size}` : ""}
                      </span>
                      <span className="font-adm-mono text-[12px] text-adm-muted">
                        {b.delivery === "ship" ? "Entrega" : b.delivery === "pickup" ? "Retirada" : ""}
                        {b.orderCode ? ` · ${b.orderCode}` : ""}
                      </span>
                    </span>
                    <span className="font-adm-mono text-[12px] text-adm-muted">{when(b.at)}</span>
                    <strong className="min-w-[88px] text-right font-adm-mono text-sm">{formatBRL(b.paidCents)}</strong>
                  </li>
                ))}
              </ol>
              {cur.history.length > shown && (
                <button type="button" onClick={() => setShown((n) => n + PAGE)} className="min-h-10 cursor-pointer self-start rounded-lg border border-adm-line bg-white px-4 text-[13px] font-semibold">
                  Ver mais compras ({cur.history.length - shown})
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
